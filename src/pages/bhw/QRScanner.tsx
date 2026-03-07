import { useState, useEffect, useRef, useCallback } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { doc, collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, History, Brain, User, Activity, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQRSync } from "@/hooks/useQRSync";
import AIAnalysisModal from "@/components/ui/AIAnalysisModal";
import beepSound from "@/assets/sounds/beep.mp3";
import QRScannerHeader from "@/components/qr-scanner/QRScannerHeader";
import TabNavigation from "@/components/qr-scanner/TabNavigation";
import StatsCards from "@/components/qr-scanner/StatsCards";
import VisitsTable from "@/components/qr-scanner/VisitsTable";
import AnalysesTable from "@/components/qr-scanner/AnalysesTable";
import Pagination from "@/components/qr-scanner/Pagination";
import ScannerInterface from "@/components/qr-scanner/ScannerInterface";
import ResidentModal from "@/components/qr-scanner/ResidentModal";

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

interface SavedAnalysis {
  id: string;
  patientUid: string;
  patientName: string;
  patientLocation: string;
  analysisResult: any;
  selfReportsCount: number;
  observedReportsCount: number;
  totalReports: number;
  analyzedBy: string;
  createdAt: any;
  reportDate: string;
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
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; type: 'visit' | 'delete'; id?: string }>({ show: false, type: 'visit' });
  const [activeTab, setActiveTab] = useState<'visits' | 'analyses'>('visits');
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SavedAnalysis | null>(null);
  const [analysisViewOpen, setAnalysisViewOpen] = useState(false);
  const [aiAnalysisOpen, setAiAnalysisOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageModal, setImageModal] = useState<{ open: boolean; url: string; title: string }>({ open: false, url: '', title: '' });
  const itemsPerPage = 10;
  const { toast } = useToast();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    fetchVisits();
    fetchSavedAnalyses();
  }, []);

  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean>(false);

  useEffect(() => {
    // Check if camera permission was previously granted
    checkCameraPermission();
  }, []);

  useEffect(() => {
    if (scanning && !scannerRef.current && cameraPermissionGranted) {
      initializeScanner();
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [scanning, cameraPermissionGranted]);

  const checkCameraPermission = async () => {
    try {
      // Check localStorage first
      const storedPermission = localStorage.getItem('cameraPermissionGranted');
      if (storedPermission === 'true') {
        setCameraPermissionGranted(true);
        return;
      }

      // Try to access camera directly
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (stream) {
        setCameraPermissionGranted(true);
        localStorage.setItem('cameraPermissionGranted', 'true');
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (error) {
      console.log('Camera permission denied or unavailable:', error);
      setCameraPermissionGranted(false);
      localStorage.setItem('cameraPermissionGranted', 'false');
    }
  };

  const initializeScanner = async () => {
    try {
      // Always check permission before initializing
      if (!cameraPermissionGranted) {
        await checkCameraPermission();
        if (!cameraPermissionGranted) {
          setError('Camera permission required to scan QR codes');
          return;
        }
      }
      
      const config = { 
        fps: 10,
        qrbox: function(viewfinderWidth: number, viewfinderHeight: number) {
          return Math.min(viewfinderWidth, viewfinderHeight) * 0.8;
        },
        aspectRatio: 1.0,
        disableFlip: false
      };

      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        config,
        false
      );

      scannerRef.current.render(onScanSuccess, onScanError);
    } catch (error) {
      console.error('Failed to initialize scanner:', error);
      setError('Failed to start camera. Please check permissions.');
    }
  };

  const handleCameraChange = (deviceId: string) => {
    setSelectedCameraId(deviceId);
    
    // Restart scanner with new camera
    if (scannerRef.current && scanning) {
      scannerRef.current.clear().then(() => {
        scannerRef.current = null;
        
        setTimeout(() => {
          const config = { 
            fps: 10,
            aspectRatio: 1.0,
            disableFlip: false,
            videoConstraints: {
              deviceId: { exact: deviceId }
            }
          };

          scannerRef.current = new Html5QrcodeScanner(
            "qr-reader",
            config,
            false
          );

          scannerRef.current.render(onScanSuccess, onScanError);
        }, 500);
      }).catch(console.error);
    }
  };

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
        if (confirmDialog.id.startsWith('analysis_')) {
          // Delete analysis
          const analysisId = confirmDialog.id.replace('analysis_', '');
          await deleteDoc(doc(db, 'aiAnalysisReports', analysisId));
          
          setConfirmDialog({ show: false, type: 'visit' });
          
          setTimeout(() => {
            toast({
              title: "Analysis Deleted",
              description: "AI analysis report has been removed.",
            });
          }, 100);
          
          fetchSavedAnalyses();
        } else {
          // Delete visit
          await deleteDoc(doc(db, 'residentVisits', confirmDialog.id));
          
          setConfirmDialog({ show: false, type: 'visit' });
          
          setTimeout(() => {
            toast({
              title: "Visit Deleted",
              description: "Visit record has been removed.",
            });
          }, 100);
          
          fetchVisits();
        }
      } catch (error) {
        console.error('Error deleting record:', error);
        toast({
          title: "Error",
          description: "Failed to delete record.",
          variant: "destructive",
        });
      }
    }
  };

  const fetchSavedAnalyses = async () => {
    try {
      const analysesRef = collection(db, 'aiAnalysisReports');
      const q = query(analysesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedAnalysis[];
      setSavedAnalyses(data);
    } catch (error) {
      console.error('Error fetching saved analyses:', error);
    }
  };

  const handleDeleteAnalysis = async (analysisId: string) => {
    setConfirmDialog({ show: true, type: 'delete', id: analysisId });
  };
  const viewSavedAnalysis = (analysis: SavedAnalysis) => {
    setSelectedAnalysis(analysis);
    setAnalysisViewOpen(true);
  };
  const handleAIAnalysis = () => {
    if (scannedData && (scannedData.symptomReports.length > 0)) {
      setAiAnalysisOpen(true);
    } else {
      toast({
        title: "No Data to Analyze",
        description: "This resident has no symptom reports to analyze.",
        variant: "destructive",
      });
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
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVisits = visits.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="h-full flex flex-col">
      {!scanning && (
        <div className="p-4 sm:p-6">
          <QRScannerHeader onStartScanning={() => setScanning(true)} />
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          <StatsCards activeTab={activeTab} visits={visits} savedAnalyses={savedAnalyses} />

          {/* Content based on active tab */}
          {activeTab === 'visits' ? (
            <VisitsTable 
              visits={paginatedVisits} 
              loading={loading} 
              onDeleteVisit={(visitId) => handleDeleteVisit(visitId)} 
            />
          ) : (
            <AnalysesTable 
              savedAnalyses={savedAnalyses.slice(startIndex, startIndex + itemsPerPage)} 
              loading={loading} 
              onViewAnalysis={(analysis) => viewSavedAnalysis(analysis)} 
              onDeleteAnalysis={(analysisId) => handleDeleteAnalysis(analysisId)} 
            />
          )}

          {/* Pagination */}
          {!loading && (activeTab === 'visits' ? visits.length > 0 : savedAnalyses.length > 0) && (
            <Pagination 
              currentPage={currentPage}
              totalItems={activeTab === 'visits' ? visits.length : savedAnalyses.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemType={activeTab === 'visits' ? 'visits' : 'analyses'}
            />
          )}
        </div>
      )}

      {scanning && (
        <ScannerInterface 
          error={error} 
          onStopScanning={handleStopScanning}
          onCameraChange={handleCameraChange}
        />
      )}

      <ResidentModal 
        open={modalOpen}
        onOpenChange={setModalOpen}
        scannedData={scannedData}
        onMarkVisit={handleMarkVisit}
        onAIAnalysis={handleAIAnalysis}
        onImageClick={(url, title) => setImageModal({ open: true, url, title })}
      />

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.show} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, show: open })}>
        <DialogContent className="!max-w-md p-0">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Action</h3>
            <p className="text-gray-600 mb-6">
              {confirmDialog.type === 'visit'
                ? 'Are you sure you want to mark this as a resident visit?'
                : confirmDialog.id?.startsWith('analysis_')
                ? 'Are you sure you want to delete this AI analysis report? This action cannot be undone.'
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

      {/* AI Analysis Modal */}
      {scannedData && (
        <AIAnalysisModal
          open={aiAnalysisOpen}
          onOpenChange={setAiAnalysisOpen}
          selfReports={scannedData.symptomReports.filter(r => r.reportType === 'self')}
          observedReports={scannedData.symptomReports.filter(r => r.reportType === 'observed')}
          patientInfo={{
            name: `${scannedData.userData.firstName} ${scannedData.userData.lastName}`,
            uid: scannedData.userData.uid,
            location: `${scannedData.userData.address.barangay}, ${scannedData.userData.address.municipality}`
          }}
        />
      )}

      {/* Saved Analysis View Modal */}
      {selectedAnalysis && (
        <Dialog open={analysisViewOpen} onOpenChange={setAnalysisViewOpen}>
          <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[90vh] overflow-y-auto p-0">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                  <History className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">Saved AI Analysis</DialogTitle>
                  <p className="text-sm text-gray-600">
                    Patient: {selectedAnalysis.patientName} | 
                    Date: {selectedAnalysis.createdAt?.toDate?.()?.toLocaleDateString() || selectedAnalysis.reportDate}
                  </p>
                </div>
              </div>
              <Button onClick={() => setAnalysisViewOpen(false)} variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6">
              {/* Display saved analysis results */}
              <div className="space-y-6">
                {/* Risk Assessment Header */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Risk Assessment</h3>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      selectedAnalysis.analysisResult.riskLevel === 'critical' ? 'bg-red-100 text-red-800' :
                      selectedAnalysis.analysisResult.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                      selectedAnalysis.analysisResult.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedAnalysis.analysisResult.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {selectedAnalysis.analysisResult.riskPercentage}%
                      </div>
                      <p className="text-sm text-gray-600">Risk Level</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {selectedAnalysis.selfReportsCount}
                      </div>
                      <p className="text-sm text-gray-600">Self Reports</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {selectedAnalysis.observedReportsCount}
                      </div>
                      <p className="text-sm text-gray-600">Observed</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-1">
                        {selectedAnalysis.totalReports}
                      </div>
                      <p className="text-sm text-gray-600">Total Reports</p>
                    </div>
                  </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Potential Conditions */}
                    {selectedAnalysis.analysisResult.potentialConditions && selectedAnalysis.analysisResult.potentialConditions.length > 0 && (
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Activity className="h-5 w-5 text-red-500" />
                          <h4 className="font-semibold text-gray-900">Potential Conditions</h4>
                        </div>
                        <div className="space-y-3">
                          {selectedAnalysis.analysisResult.potentialConditions.map((condition: any, index: number) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium text-gray-900">{condition.condition}</h5>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  condition.severity === 'severe' ? 'bg-red-100 text-red-800' :
                                  condition.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {condition.severity}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                                  style={{ width: `${condition.probability}%` }}
                                ></div>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{condition.probability}% probability</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {selectedAnalysis.analysisResult.recommendations && selectedAnalysis.analysisResult.recommendations.length > 0 && (
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle className="h-5 w-5 text-blue-500" />
                          <h4 className="font-semibold text-gray-900">Recommendations</h4>
                        </div>
                        <div className="space-y-3">
                          {selectedAnalysis.analysisResult.recommendations
                            .sort((a: any, b: any) => a.priority - b.priority)
                            .map((rec: any, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                              <div className={`p-1 rounded-full ${
                                rec.type === 'immediate' ? 'bg-red-100' :
                                rec.type === 'followup' ? 'bg-yellow-100' : 'bg-blue-100'
                              }`}>
                                {rec.type === 'immediate' ? <Clock className="h-4 w-4 text-red-600" /> :
                                 rec.type === 'followup' ? <Activity className="h-4 w-4 text-yellow-600" /> :
                                 <CheckCircle className="h-4 w-4 text-blue-600" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    rec.type === 'immediate' ? 'bg-red-100 text-red-800' :
                                    rec.type === 'followup' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {rec.type}
                                  </span>
                                  <span className="text-xs text-gray-500">Priority {rec.priority}</span>
                                </div>
                                <p className="text-sm text-gray-700">{rec.action}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Specialist Recommendations */}
                    {selectedAnalysis.analysisResult.specialistRecommendations && selectedAnalysis.analysisResult.specialistRecommendations.length > 0 && (
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <User className="h-5 w-5 text-green-500" />
                          <h4 className="font-semibold text-gray-900">Specialist Recommendations</h4>
                        </div>
                        <div className="space-y-3">
                          {selectedAnalysis.analysisResult.specialistRecommendations.map((spec: any, index: number) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium text-gray-900">{spec.specialty}</h5>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  spec.urgency === 'emergency' ? 'bg-red-100 text-red-800' :
                                  spec.urgency === 'urgent' ? 'bg-orange-100 text-orange-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {spec.urgency}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{spec.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Health Trends */}
                    {selectedAnalysis.analysisResult.trends && (
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Activity className="h-5 w-5 text-purple-500" />
                          <h4 className="font-semibold text-gray-900">Health Trends</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              selectedAnalysis.analysisResult.trends.improving ? 'bg-green-100' :
                              selectedAnalysis.analysisResult.trends.worsening ? 'bg-red-100' :
                              'bg-gray-100'
                            }`}>
                              {selectedAnalysis.analysisResult.trends.improving ? 
                                <CheckCircle className="h-4 w-4 text-green-600" /> :
                                selectedAnalysis.analysisResult.trends.worsening ? 
                                <X className="h-4 w-4 text-red-600" /> :
                                <Clock className="h-4 w-4 text-gray-600" />
                              }
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {selectedAnalysis.analysisResult.trends.improving ? 'Improving' :
                                 selectedAnalysis.analysisResult.trends.worsening ? 'Worsening' :
                                 'Stable'}
                              </p>
                              <p className="text-sm text-gray-600">{selectedAnalysis.analysisResult.trends.pattern}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* AI Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">AI Summary</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{selectedAnalysis.analysisResult.summary}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

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
