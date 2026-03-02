import { useState, useEffect, useRef, useCallback } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X, User, MapPin, FileText, Activity, CheckCircle, Clock, Trash2, Scan, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQRSync } from "@/hooks/useQRSync";
import beepSound from "@/assets/sounds/beep.mp3";

interface UserData {
  firstName: string;
  lastName: string;
  middleInitial: string;
  email: string;
  contactNumber: string;
  communityRole: string;
  address: {
    region: string;
    municipality: string;
    barangay: string;
  };
  documents: {
    idType: string;
    validIdUrl: string;
    selfieUrl: string;
  };
  status: string;
  uid: string;
}

interface QRCodeData {
  qrId: string;
  userData: UserData;
  symptomReports: any[];
  createdAt: any;
  updatedAt: any;
}

interface Visit {
  id: string;
  residentName: string;
  qrId: string;
  selfieUrl?: string;
  visitDate: any;
  scannedBy: string;
}

export default function QRScanner() {
  const { user } = useAuth();
  useQRSync(); // Auto-sync QR codes when symptom reports change
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<QRCodeData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportTab, setReportTab] = useState<'self' | 'observed'>('self');
  const [visibleReports, setVisibleReports] = useState(10);
  const [imageModal, setImageModal] = useState<{ open: boolean; url: string; title: string }>({ open: false, url: '', title: '' });
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; type: 'visit' | 'delete'; id?: string }>({ show: false, type: 'visit' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    fetchVisits();
  }, []);

  useEffect(() => {
    if (scanning && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10,
          aspectRatio: 1.777778,
          disableFlip: false
        },
        false
      );

      scannerRef.current.render(onScanSuccess, onScanError);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [scanning]);

  const fetchVisits = async () => {
    try {
      const visitsRef = collection(db, 'residentVisits');
      const q = query(visitsRef, orderBy('visitDate', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Visit[];
      setVisits(data);
    } catch (error) {
      console.error('Error fetching visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const onScanSuccess = useCallback(async (decodedText: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const qrId = decodedText.trim().replace(/"/g, '');
      
      const qrQuery = query(collection(db, "userQRCodes"), where("qrId", "==", qrId));
      const qrSnapshot = await getDocs(qrQuery);

      if (!qrSnapshot.empty) {
        const qrData = qrSnapshot.docs[0].data();
        const userUid = qrData.userData?.uid || qrData.uid || qrData.userId;
        
        if (!userUid) {
          throw new Error("User ID not found in QR code");
        }

        let userData: UserData;
        let symptomReports: any[] = [];

        const userQuery = query(collection(db, "users"), where("uid", "==", userUid));
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          userData = { ...userSnapshot.docs[0].data(), uid: userUid } as UserData;
          
          try {
            const reportsQuery = query(
              collection(db, "symptomReports"),
              where("userId", "==", userUid),
              orderBy("createdAt", "desc")
            );
            const reportsSnapshot = await getDocs(reportsQuery);
            symptomReports = reportsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
          } catch (reportErr) {
            console.log("Using cached symptom reports");
            symptomReports = qrData.symptomReports || [];
          }
        } else {
          userData = qrData.userData as UserData;
          symptomReports = qrData.symptomReports || [];
        }
        
        const liveData: QRCodeData = {
          qrId,
          userData,
          symptomReports,
          createdAt: qrData.createdAt,
          updatedAt: serverTimestamp()
        };
        
        // Play beep sound first
        const audio = new Audio(beepSound);
        audio.play().then(() => {
          // Text-to-speech after beep completes
          const utterance = new SpeechSynthesisUtterance(`Welcome ${userData.firstName}`);
          window.speechSynthesis.speak(utterance);
        }).catch(err => {
          console.error('Error playing beep:', err);
          // Still play TTS even if beep fails
          const utterance = new SpeechSynthesisUtterance(`Welcome ${userData.firstName}`);
          window.speechSynthesis.speak(utterance);
        });
        
        // Stop scanner and show modal
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
          scannerRef.current = null;
        }
        setScanning(false);
        setScannedData(liveData);
        setModalOpen(true);
        setError(null);
        isProcessingRef.current = false;
        
        toast({
          title: "QR Code Scanned",
          description: `Resident: ${userData.firstName} ${userData.lastName}`,
        });
      } else {
        isProcessingRef.current = false;
        setError("Invalid QR Code. Resident not found.");
        toast({
          title: "Invalid QR Code",
          description: "This QR code is not registered in the system.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      isProcessingRef.current = false;
      console.error("Error fetching QR data:", err);
      setError(err.message || "Failed to fetch resident data. Please try again.");
      toast({
        title: "Error",
        description: err.message || "Failed to fetch resident data.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const onScanError = useCallback((errorMessage: string) => {
    // Ignore common scanning errors to reduce console noise
    if (!errorMessage.includes('NotFoundException')) {
      console.log("Scan error:", errorMessage);
    }
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    setScannedData(null);
    setVisibleReports(10);
  };

  const handleMarkVisit = async () => {
    setConfirmDialog({ show: true, type: 'visit' });
  };

  const handleDeleteVisit = async (visitId: string) => {
    setConfirmDialog({ show: true, type: 'delete', id: visitId });
  };

  const confirmAction = async () => {
    if (confirmDialog.type === 'visit' && scannedData) {
      try {
        await addDoc(collection(db, 'residentVisits'), {
          residentName: `${scannedData.userData.firstName} ${scannedData.userData.middleInitial} ${scannedData.userData.lastName}`,
          qrId: scannedData.qrId,
          selfieUrl: scannedData.userData.documents.selfieUrl,
          visitDate: serverTimestamp(),
          scannedBy: user?.displayName || 'BHW'
        });

        setConfirmDialog({ show: false, type: 'visit' });
        closeModal();
        
        setTimeout(() => {
          toast({
            title: "Visit Recorded",
            description: "Resident visit has been marked successfully.",
          });
        }, 100);
        
        fetchVisits();
      } catch (error) {
        console.error('Error marking visit:', error);
        toast({
          title: "Error",
          description: "Failed to record visit.",
          variant: "destructive",
        });
      }
    } else if (confirmDialog.type === 'delete' && confirmDialog.id) {
      try {
        await deleteDoc(doc(db, 'residentVisits', confirmDialog.id));
        
        setConfirmDialog({ show: false, type: 'visit' });
        
        setTimeout(() => {
          toast({
            title: "Visit Deleted",
            description: "Visit record has been removed.",
          });
        }, 100);
        
        fetchVisits();
      } catch (error) {
        console.error('Error deleting visit:', error);
        toast({
          title: "Error",
          description: "Failed to delete visit.",
          variant: "destructive",
        });
      }
    }
  };

  const handleStopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
    setScanning(false);
    setError(null);
    isProcessingRef.current = false;
  };

  // Pagination
  const totalPages = Math.ceil(visits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVisits = visits.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="h-full flex flex-col">
      {!scanning && (
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">QR Code Scanner</h1>
              <p className="text-gray-600 mt-2">Scan resident QR codes and track visits</p>
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#1B365D] to-[#2d4a7c] rounded-[2px] blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
              <Button onClick={() => setScanning(true)} className="relative bg-gradient-to-r rounded-[2px]! from-[#1B365D] to-[#2d4a7c] hover:from-[#152a4a] hover:to-[#1B365D] text-white px-6 py-6 cursor-pointer shadow-lg">
                <Scan className="mr-2 h-5 w-5" />
                <span className="font-semibold">Start Scanning</span>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2px] p-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="bg-[#1B365D] p-3 rounded-[2px]">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Visits</p>
                  <p className="text-2xl font-bold text-gray-900">{visits.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[2px] p-4 border border-green-100">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 p-3 rounded-[2px]">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {visits.filter(v => v.visitDate?.toDate?.()?.toDateString() === new Date().toDateString()).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-[2px] p-4 border border-purple-100">
              <div className="flex items-center gap-3">
                <div className="bg-purple-600 p-3 rounded-[2px]">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Unique Residents</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(visits.map(v => v.qrId)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visits Table */}
          <div className="bg-white rounded-[2px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#1B365D]" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Visits</h2>
            </div>
            
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1B365D] rounded-full animate-spin mx-auto"></div>
              </div>
            ) : visits.length === 0 ? (
              <div className="p-12 text-center">
                <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Visits Yet</h3>
                <p className="text-gray-600">Start scanning QR codes to track resident visits.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Resident Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      QR ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Visit Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Scanned By
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedVisits.map((visit, index) => (
                    <tr key={visit.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {visit.selfieUrl ? (
                            <img 
                              src={visit.selfieUrl} 
                              alt={visit.residentName}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-900">{visit.residentName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-700">
                        {visit.qrId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {visit.visitDate?.toDate?.()?.toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {visit.scannedBy}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteVisit(visit.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-[2px] transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && visits.length > 0 && (
            <div className="px-6 py-4 border-t flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, visits.length)} of {visits.length} visits
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <Button
                    key={number}
                    variant={currentPage === number ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(number)}
                    className={`cursor-pointer ${currentPage === number ? "bg-[#1B365D] hover:bg-[#1B365D]/90" : ""}`}
                  >
                    {number}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="cursor-pointer"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {scanning && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col p-4">
          <div className="flex justify-between items-center p-4 bg-gray-900 text-white rounded-t-lg">
            <div className="text-sm">Point QR code to the camera</div>
            <div className="flex items-center gap-3">
              <img src="/sentinel_ph_logo.png" alt="SentinelPH" className="h-8" />
            </div>
            <Button onClick={handleStopScanning} variant="destructive" size="sm" className="rounded-[2px]!">
              Stop Scanning
            </Button>
          </div>
          <div className="flex-1 overflow-hidden rounded-b-lg">
            <div id="qr-reader" className="w-full h-full"></div>
          </div>
          {error && (
            <div className="absolute bottom-8 left-8 right-8 bg-red-500 text-white rounded-lg p-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[90vh] overflow-y-auto p-0">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#1B365D]" />
              <DialogTitle className="text-xl">Resident Information</DialogTitle>
            </div>
            <Button onClick={closeModal} variant="ghost" size="icon" className="cursor-pointer">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {scannedData && (
            <div className="p-4 space-y-4">
              {/* Two Column Layout: Personal Info + Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Side - Personal Information */}
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-[2px] p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-[#1B365D]" />
                      <h3 className="font-semibold text-base text-gray-900">Personal Details</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-600">Full Name</p>
                        <p className="font-medium text-sm">
                          {scannedData.userData.firstName} {scannedData.userData.middleInitial} {scannedData.userData.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">QR ID</p>
                        <p className="font-medium font-mono text-sm">{scannedData.qrId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <p className="font-medium text-sm">{scannedData.userData.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Contact Number</p>
                        <p className="font-medium text-sm">{scannedData.userData.contactNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Community Role</p>
                        <p className="font-medium text-sm">{scannedData.userData.communityRole}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Status</p>
                        <span className={`inline-block px-2 py-1 rounded-[2px] text-xs font-medium ${
                          scannedData.userData.status === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {scannedData.userData.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-[2px] p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-[#1B365D]" />
                      <h3 className="font-semibold text-base text-gray-900">Address</h3>
                    </div>
                    <p className="text-gray-700 text-sm">
                      {scannedData.userData.address.barangay}, {scannedData.userData.address.municipality}, {scannedData.userData.address.region}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-[2px] p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-[#1B365D]" />
                      <h3 className="font-semibold text-base text-gray-900">Documents</h3>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <p className="text-xs text-gray-600 mb-1">ID Type</p>
                        <p className="font-medium text-sm">{scannedData.userData.documents.idType}</p>
                      </div>
                      {scannedData.userData.documents.validIdUrl && (
                        <div className="flex-shrink-0">
                          <p className="text-xs text-gray-600 mb-1">Valid ID</p>
                          <img 
                            src={scannedData.userData.documents.validIdUrl} 
                            alt="Valid ID" 
                            className="w-20 h-20 object-cover rounded-[2px] cursor-pointer hover:opacity-80 transition-opacity" 
                            onClick={() => setImageModal({ open: true, url: scannedData.userData.documents.validIdUrl, title: 'Valid ID' })}
                          />
                        </div>
                      )}
                      {scannedData.userData.documents.selfieUrl && (
                        <div className="flex-shrink-0">
                          <p className="text-xs text-gray-600 mb-1">Selfie</p>
                          <img 
                            src={scannedData.userData.documents.selfieUrl} 
                            alt="Selfie" 
                            className="w-20 h-20 object-cover rounded-[2px] cursor-pointer hover:opacity-80 transition-opacity" 
                            onClick={() => setImageModal({ open: true, url: scannedData.userData.documents.selfieUrl, title: 'Selfie' })}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side - Charts and Trends */}
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-[2px] p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="h-4 w-4 text-[#1B365D]" />
                      <h3 className="font-semibold text-base text-gray-900">Health Trends</h3>
                    </div>
                    
                    {/* Report Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white rounded-[2px] p-3 border">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {scannedData.symptomReports?.filter(r => r.reportType === 'self').length || 0}
                          </div>
                          <div className="text-xs text-gray-600">Self Reports</div>
                        </div>
                      </div>
                      <div className="bg-white rounded-[2px] p-3 border">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {scannedData.symptomReports?.filter(r => r.reportType === 'observed').length || 0}
                          </div>
                          <div className="text-xs text-gray-600">Observed</div>
                        </div>
                      </div>
                    </div>

                    {/* Simple Bar Chart */}
                    <div className="bg-white rounded-[2px] p-3 border">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Report Activity (Last 7 Days)</h4>
                      <div className="flex items-end justify-between h-20 gap-1">
                        {(() => {
                          const last7Days = Array.from({ length: 7 }, (_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() - (6 - i));
                            return date;
                          });
                          
                          return last7Days.map((date, index) => {
                            const dayReports = scannedData.symptomReports?.filter(report => {
                              const reportDate = report.createdAt?.toDate?.() || new Date(report.createdAt || 0);
                              return reportDate.toDateString() === date.toDateString();
                            }).length || 0;
                            
                            const maxHeight = Math.max(...last7Days.map(d => {
                              return scannedData.symptomReports?.filter(r => {
                                const rd = r.createdAt?.toDate?.() || new Date(r.createdAt || 0);
                                return rd.toDateString() === d.toDateString();
                              }).length || 0;
                            }), 1);
                            
                            const height = maxHeight > 0 ? (dayReports / maxHeight) * 60 : 0;
                            
                            return (
                              <div key={index} className="flex flex-col items-center flex-1">
                                <div 
                                  className="bg-[#1B365D] rounded-t-sm w-full min-h-[4px] transition-all"
                                  style={{ height: `${Math.max(height, 4)}px` }}
                                  title={`${dayReports} reports on ${date.toLocaleDateString()}`}
                                ></div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Line Chart - Same as Observations */}
                    <div className="bg-white rounded-[2px] p-3 border">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">7-Day Trend Analysis</h4>
                      <div className="relative h-32">
                        <svg className="w-full h-full" viewBox="0 0 300 120">
                          {(() => {
                            const last7Days = Array.from({ length: 7 }, (_, i) => {
                              const date = new Date();
                              date.setDate(date.getDate() - (6 - i));
                              return date;
                            });
                            
                            const dataPoints = last7Days.map(date => {
                              const dayReports = scannedData.symptomReports?.filter(report => {
                                const reportDate = report.createdAt?.toDate?.() || new Date(report.createdAt || 0);
                                return reportDate.toDateString() === date.toDateString();
                              }).length || 0;
                              return dayReports;
                            });
                            
                            const verifiedPoints = last7Days.map(date => {
                              const dayVerified = scannedData.symptomReports?.filter(report => {
                                const reportDate = report.createdAt?.toDate?.() || new Date(report.createdAt || 0);
                                return reportDate.toDateString() === date.toDateString() && report.status === 'verified';
                              }).length || 0;
                              return dayVerified;
                            });
                            
                            const maxValue = Math.max(...dataPoints, ...verifiedPoints, 1);
                            const width = 300;
                            const height = 120;
                            const padding = 20;
                            
                            // Create paths for lines
                            const totalPath = dataPoints.map((value, index) => {
                              const x = padding + (index * (width - 2 * padding)) / (dataPoints.length - 1);
                              const y = height - padding - ((value / maxValue) * (height - 2 * padding));
                              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                            }).join(' ');
                            
                            const verifiedPath = verifiedPoints.map((value, index) => {
                              const x = padding + (index * (width - 2 * padding)) / (verifiedPoints.length - 1);
                              const y = height - padding - ((value / maxValue) * (height - 2 * padding));
                              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                            }).join(' ');
                            
                            return (
                              <>
                                {/* Grid lines */}
                                <defs>
                                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                                  </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)" />
                                
                                {/* Total Reports Line */}
                                <path
                                  d={totalPath}
                                  fill="none"
                                  stroke="#3B82F6"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                
                                {/* Verified Reports Line */}
                                <path
                                  d={verifiedPath}
                                  fill="none"
                                  stroke="#10B981"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                
                                {/* Total Reports Data points */}
                                {dataPoints.map((value, index) => {
                                  const x = padding + (index * (width - 2 * padding)) / (dataPoints.length - 1);
                                  const y = height - padding - ((value / maxValue) * (height - 2 * padding));
                                  return (
                                    <circle
                                      key={`total-${index}`}
                                      cx={x}
                                      cy={y}
                                      r="3"
                                      fill="#3B82F6"
                                    >
                                      <title>{`${last7Days[index].toLocaleDateString()}: ${value} total reports`}</title>
                                    </circle>
                                  );
                                })}
                                
                                {/* Verified Reports Data points */}
                                {verifiedPoints.map((value, index) => {
                                  const x = padding + (index * (width - 2 * padding)) / (verifiedPoints.length - 1);
                                  const y = height - padding - ((value / maxValue) * (height - 2 * padding));
                                  return (
                                    <circle
                                      key={`verified-${index}`}
                                      cx={x}
                                      cy={y}
                                      r="3"
                                      fill="#10B981"
                                    >
                                      <title>{`${last7Days[index].toLocaleDateString()}: ${value} verified reports`}</title>
                                    </circle>
                                  );
                                })}
                                
                                {/* Y-axis labels */}
                                <text x="5" y="25" fontSize="10" fill="#6b7280" textAnchor="start">{maxValue}</text>
                                <text x="5" y="105" fontSize="10" fill="#6b7280" textAnchor="start">0</text>
                                
                                {/* Legend */}
                                <g transform="translate(220, 15)">
                                  <circle cx="0" cy="0" r="3" fill="#3B82F6" />
                                  <text x="8" y="4" fontSize="10" fill="#6b7280">Total</text>
                                  <circle cx="0" cy="15" r="3" fill="#10B981" />
                                  <text x="8" y="19" fontSize="10" fill="#6b7280">Verified</text>
                                </g>
                              </>
                            );
                          })()}
                        </svg>
                      </div>
                    </div>

                    {/* Status Distribution */}
                    <div className="bg-white rounded-[2px] p-3 border">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Report Status</h4>
                      <div className="space-y-2">
                        {(() => {
                          const verified = scannedData.symptomReports?.filter(r => r.status === 'verified').length || 0;
                          const pending = scannedData.symptomReports?.filter(r => r.status === 'pending').length || 0;
                          const total = verified + pending;
                          
                          return (
                            <>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <span className="text-sm text-gray-700">Verified</span>
                                </div>
                                <span className="text-sm font-medium">{verified}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                  <span className="text-sm text-gray-700">Pending</span>
                                </div>
                                <span className="text-sm font-medium">{pending}</span>
                              </div>
                              {total > 0 && (
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full transition-all"
                                    style={{ width: `${(verified / total) * 100}%` }}
                                  ></div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section - Symptom Reports History (Full Width) */}
              <div className="bg-gray-50 rounded-[2px] p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-[#1B365D]" />
                  <h3 className="font-semibold text-base text-gray-900">
                    Symptom Reports History ({scannedData.symptomReports?.length || 0})
                  </h3>
                </div>
                
                <div className="flex gap-6 border-b border-gray-300 mb-3 relative">
                  <button
                    onClick={() => {
                      setReportTab('self');
                      setVisibleReports(10);
                    }}
                    className={`pb-2 text-sm font-medium transition-colors relative cursor-pointer ${
                      reportTab === 'self' ? 'text-[#1B365D]' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Self-Reported ({scannedData.symptomReports?.filter(r => r.reportType === 'self').length || 0})
                    {reportTab === 'self' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1B365D]"></div>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setReportTab('observed');
                      setVisibleReports(10);
                    }}
                    className={`pb-2 text-sm font-medium transition-colors relative cursor-pointer ${
                      reportTab === 'observed' ? 'text-[#1B365D]' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Observed ({scannedData.symptomReports?.filter(r => r.reportType === 'observed').length || 0})
                    {reportTab === 'observed' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1B365D]"></div>
                    )}
                  </button>
                </div>

                {scannedData.symptomReports && scannedData.symptomReports.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(() => {
                      const filteredReports = scannedData.symptomReports
                        .filter(report => report.reportType === reportTab)
                        .sort((a, b) => {
                          const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
                          const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
                          return bDate.getTime() - aDate.getTime();
                        });
                      
                      const displayedReports = filteredReports.slice(0, visibleReports);
                      const hasMore = filteredReports.length > visibleReports;
                      
                      return (
                        <>
                          {displayedReports.map((report, index) => (
                            <div key={index} className="bg-white rounded-[2px] p-3 border">
                              <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs px-2 py-1 rounded-[2px] ${
                                  report.status === "verified" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {report.status}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {report.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{report.description}</p>
                              <div className="flex flex-wrap gap-1">
                                {report.symptoms?.map((symptom: string, idx: number) => (
                                  <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-[2px]">
                                    {symptom}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                          {hasMore && (
                            <button
                              onClick={() => setVisibleReports(prev => prev + 10)}
                              className="w-full py-2 text-sm text-[#1B365D] hover:bg-gray-50 rounded-[2px] border border-dashed border-gray-300 cursor-pointer"
                            >
                              Load More ({filteredReports.length - visibleReports} remaining)
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No {reportTab === 'self' ? 'self-reported' : 'observed'} symptom reports available</p>
                )}
              </div>

              <Button onClick={handleMarkVisit} className="w-full cursor-pointer bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Resident Visit
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.show} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, show: open })}>
        <DialogContent className="!max-w-md p-0">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Action</h3>
            <p className="text-gray-600 mb-6">
              {confirmDialog.type === 'visit'
                ? 'Are you sure you want to mark this as a resident visit?'
                : 'Are you sure you want to delete this visit record? This action cannot be undone.'}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setConfirmDialog({ show: false, type: 'visit' })}
                variant="outline"
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAction}
                className={`cursor-pointer ${
                  confirmDialog.type === 'visit' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      <Dialog open={imageModal.open} onOpenChange={(open) => setImageModal({ ...imageModal, open })}>
        <DialogContent className="!max-w-[90vw] !w-auto max-h-[90vh] p-0">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-3 flex items-center justify-between z-10">
            <DialogTitle className="text-lg">{imageModal.title}</DialogTitle>
            <Button onClick={() => setImageModal({ open: false, url: '', title: '' })} variant="ghost" size="icon" className="cursor-pointer">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4 flex items-center justify-center">
            <img src={imageModal.url} alt={imageModal.title} className="max-w-full max-h-[75vh] object-contain" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
