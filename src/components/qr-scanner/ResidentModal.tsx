import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, MapPin, FileText, Activity, CheckCircle, Brain, X, Eye, Check, XCircle } from "lucide-react";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface QRCodeData {
  qrId: string;
  userData: {
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
  };
  symptomReports: any[];
}

interface ResidentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scannedData: QRCodeData | null;
  onMarkVisit: () => void;
  onAIAnalysis: () => void;
  onImageClick: (url: string, title: string) => void;
}

export default function ResidentModal({ 
  open, 
  onOpenChange, 
  scannedData, 
  onMarkVisit, 
  onAIAnalysis,
  onImageClick 
}: ResidentModalProps) {
  const [reportTab, setReportTab] = useState<'self' | 'observed'>('self');
  const [visibleReports, setVisibleReports] = useState(10);
  const { toast } = useToast();

  const handleVerifyReport = async (reportId: string) => {
    try {
      await updateDoc(doc(db, 'symptomReports', reportId), {
        status: 'verified'
      });
      toast({
        title: "Report Verified",
        description: "Symptom report has been verified successfully.",
      });
      // Update local state instead of reloading
      if (scannedData) {
        const updatedReports = scannedData.symptomReports.map(report => 
          report.id === reportId ? { ...report, status: 'verified' } : report
        );
        scannedData.symptomReports = updatedReports;
      }
    } catch (error) {
      console.error('Error verifying report:', error);
      toast({
        title: "Error",
        description: "Failed to verify report.",
        variant: "destructive",
      });
    }
  };

  const handleCancelVerification = async (reportId: string) => {
    try {
      await updateDoc(doc(db, 'symptomReports', reportId), {
        status: 'pending'
      });
      toast({
        title: "Verification Cancelled",
        description: "Report status changed to pending.",
      });
      // Update local state instead of reloading
      if (scannedData) {
        const updatedReports = scannedData.symptomReports.map(report => 
          report.id === reportId ? { ...report, status: 'pending' } : report
        );
        scannedData.symptomReports = updatedReports;
      }
    } catch (error) {
      console.error('Error cancelling verification:', error);
      toast({
        title: "Error",
        description: "Failed to cancel verification.",
        variant: "destructive",
      });
    }
  };

  if (!scannedData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[90vh] overflow-y-auto p-0">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#1B365D]" />
            <DialogTitle className="text-xl">Resident Information</DialogTitle>
          </div>
          <Button onClick={() => onOpenChange(false)} variant="ghost" size="icon" className="cursor-pointer">
            <X className="h-4 w-4" />
          </Button>
        </div>

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
                        onClick={() => onImageClick(scannedData.userData.documents.validIdUrl, 'Valid ID')}
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
                        onClick={() => onImageClick(scannedData.userData.documents.selfieUrl, 'Selfie')}
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
              </div>
            </div>
          </div>

          {/* Bottom Section - Symptom Reports History */}
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
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {(() => {
                                  const date = report.createdAt?.toDate?.() || new Date(report.createdAt || 0);
                                  return date.toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                  });
                                })()}
                              </span>
                              {report.status === 'pending' ? (
                                <Button
                                  onClick={() => handleVerifyReport(report.id)}
                                  size="sm"
                                  className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Verify
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => handleCancelVerification(report.id)}
                                  size="sm"
                                  variant="outline"
                                  className="h-6 px-2 text-xs border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{report.description}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {report.symptoms?.map((symptom: string, idx: number) => (
                              <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-[2px]">
                                {symptom}
                              </span>
                            ))}
                          </div>
                          {report.proofImageUrl && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-600 mb-1">Proof Image:</p>
                              <div className="flex items-center gap-2">
                                <img 
                                  src={report.proofImageUrl} 
                                  alt="Proof" 
                                  className="w-16 h-16 object-cover rounded-[2px] cursor-pointer hover:opacity-80 transition-opacity" 
                                  onClick={() => onImageClick(report.proofImageUrl, 'Proof Image')}
                                />
                                <Button
                                  onClick={() => onImageClick(report.proofImageUrl, 'Proof Image')}
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-xs"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                          )}
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

          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={onMarkVisit} className="flex-1 cursor-pointer bg-green-600 hover:bg-green-700">
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Resident Visit
            </Button>
            <Button 
              onClick={onAIAnalysis}
              className="flex-1 cursor-pointer bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Brain className="mr-2 h-4 w-4" />
              AI Analysis
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}