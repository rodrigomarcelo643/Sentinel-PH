import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, FileText, MapPin, Calendar, ChevronUp, ChevronDown, Eye, CheckCircle, XCircle, MoreVertical, Brain, AlertTriangle } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { collection, getDocs, query, orderBy, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { patternAnalysisService, type PatternAnalysisResult } from '@/services/patternAnalysisService';
import { PatternAnalysisModal } from '@/components/ui/PatternAnalysisModal';
import { useToast } from '@/hooks/use-toast';

interface SymptomReport {
  id: string;
  userName: string;
  userId: string;
  reportType: string;
  symptoms: string[];
  customSymptom: string;
  description: string;
  location: string;
  barangay: string;
  latitude: number;
  longitude: number;
  proofImageUrl: string;
  status: string;
  createdAt: any;
  userSelfieUrl?: string;
}

export default function BhwReports() {
  const { } = useAuth();
  const [reports, setReports] = useState<SymptomReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<SymptomReport | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PatternAnalysisResult | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isOutbreakDialogOpen, setIsOutbreakDialogOpen] = useState(false);
  const [outbreakSeverity, setOutbreakSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const { toast } = useToast();
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const reportsRef = collection(db, 'symptomReports');
      const q = query(reportsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const reportsData = await Promise.all(
        snapshot.docs.map(async (reportDoc) => {
          const reportData = reportDoc.data();
          
          // Fetch user data to get selfie
          let userSelfieUrl = '';
          if (reportData.userId) {
            try {
              // Try to find user by userId field
              const usersRef = collection(db, 'users');
              const userQuery = query(usersRef, where('uid', '==', reportData.userId));
              const userSnapshot = await getDocs(userQuery);
              
              if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                userSelfieUrl = userData.documents?.selfieUrl || '';
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
            }
          }
          
          return {
            id: reportDoc.id,
            ...reportData,
            userSelfieUrl
          } as SymptomReport;
        })
      );
      
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
    }
  };

  const handleVerify = async (id: string) => {
    try {
      const reportRef = doc(db, 'symptomReports', id);
      await updateDoc(reportRef, { status: 'verified' });
      setReports(reports.map(r => r.id === id ? { ...r, status: 'verified' } : r));
      setIsVerifyDialogOpen(false);
      setSelectedReport(null);
      
      // Sync QR code after status update
      const report = reports.find(r => r.id === id);
      if (report?.userId) {
        const { syncUserQRCode } = await import('@/services/qrSyncService');
        await syncUserQRCode(report.userId);
      }
    } catch (error) {
      console.error('Error verifying report:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const reportRef = doc(db, 'symptomReports', id);
      await updateDoc(reportRef, { 
        status: 'rejected',
        rejectionReason: rejectionReason || 'No reason provided'
      });
      setReports(reports.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
      setIsRejectDialogOpen(false);
      setSelectedReport(null);
      setRejectionReason('');
      
      // Sync QR code after status update
      const report = reports.find(r => r.id === id);
      if (report?.userId) {
        const { syncUserQRCode } = await import('@/services/qrSyncService');
        await syncUserQRCode(report.userId);
      }
    } catch (error) {
      console.error('Error rejecting report:', error);
    }
  };

  const handleMarkAsOutbreak = async (severity: 'low' | 'medium' | 'high') => {
    if (!selectedReport) return;
    
    try {
      const { addDoc, collection } = await import('firebase/firestore');
      const outbreakAlert = {
        id: `outbreak_${Date.now()}`,
        title: `${severity.toUpperCase()} Risk Outbreak Alert - ${selectedReport.symptoms[0] || 'Unknown'}`,
        riskLevel: severity.toUpperCase(),
        riskScore: severity === 'high' ? 8 : severity === 'medium' ? 5 : 3,
        totalReports: 1,
        affectedResidents: 1,
        clusters: 1,
        topDiseases: [selectedReport.symptoms[0] || 'Unknown Disease'],
        recommendations: [
          'Investigate additional cases in the area',
          'Conduct contact tracing',
          'Monitor for similar symptoms',
          'Alert local health authorities'
        ],
        createdAt: new Date(),
        status: 'pending',
        reportId: selectedReport.id,
        location: selectedReport.barangay || selectedReport.location,
        symptoms: selectedReport.symptoms
      };

      await addDoc(collection(db, 'outbreakAlerts'), outbreakAlert);
      
      toast({
        title: "Outbreak Alert Created",
        description: `Report marked as ${severity} risk outbreak and saved to outbreak response.`,
        variant: "default"
      });
      
      setIsOutbreakDialogOpen(false);
      setSelectedReport(null);
    } catch (error) {
      console.error('Error creating outbreak alert:', error);
      toast({
        title: "Failed to Create Alert",
        description: "Could not create outbreak alert. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveOutbreakAlert = async (analysis: PatternAnalysisResult) => {
    try {
      const { addDoc, collection } = await import('firebase/firestore');
      const outbreakAlert = {
        id: `outbreak_${Date.now()}`,
        title: `${analysis.outbreakRisk} Risk Outbreak Alert`,
        riskLevel: analysis.outbreakRisk,
        riskScore: analysis.riskScore,
        totalReports: analysis.totalReports,
        affectedResidents: analysis.affectedResidents,
        clusters: analysis.clusters.length,
        topDiseases: analysis.diseases.slice(0, 3).map(d => d.disease),
        recommendations: analysis.aiRecommendations || [],
        createdAt: new Date(),
        status: 'pending',
        analysisData: analysis
      };

      await addDoc(collection(db, 'outbreakAlerts'), outbreakAlert);
      
      toast({
        title: "Outbreak Alert Saved",
        description: "Alert has been saved to outbreak response system.",
        variant: "default"
      });
      
      setIsAnalysisModalOpen(false);
    } catch (error) {
      console.error('Error saving outbreak alert:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save outbreak alert. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePatternAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      setIsAnalysisModalOpen(true);
      
      const analysisData = reports
        .filter(r => r.status === 'verified')
        .map(report => ({
          id: report.id,
          symptoms: report.symptoms,
          location: {
            lat: report.latitude,
            lng: report.longitude
          },
          timestamp: report.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          barangay: report.barangay || 'Unknown',
          municipality: report.location || 'Unknown',
          residentId: report.userId
        }));

      if (analysisData.length === 0) {
        toast({
          title: "No Data Available",
          description: "No verified reports found for pattern analysis.",
          variant: "destructive"
        });
        setIsAnalysisModalOpen(false);
        return;
      }

      const result = await patternAnalysisService.analyzePatterns(analysisData);
      setAnalysisResult(result);
      
      toast({
        title: "Pattern Analysis Complete",
        description: `Analysis completed. Outbreak risk: ${result.outbreakRisk}`,
        variant: result.outbreakRisk === 'HIGH' || result.outbreakRisk === 'CRITICAL' ? "destructive" : "default"
      });
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze patterns. Please try again.",
        variant: "destructive"
      });
      setIsAnalysisModalOpen(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredReports = useMemo(() => {
    let filtered = reports;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    if (reportTypeFilter !== 'all') {
      filtered = filtered.filter(r => r.reportType === reportTypeFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(report => 
        report.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.symptoms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (sortField) {
      filtered.sort((a, b) => {
        const aVal = (a as any)[sortField] || '';
        const bVal = (b as any)[sortField] || '';
        if (sortDirection === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }
    
    return filtered;
  }, [searchQuery, reports, statusFilter, reportTypeFilter, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return (
        <div className="flex flex-col">
          <ChevronUp className="h-4 w-4 text-gray-300 -mb-1" />
          <ChevronDown className="h-4 w-4 text-gray-300 -mt-1" />
        </div>
      );
    }
    return sortDirection === 'asc' ? 
      <div className="flex flex-col">
        <ChevronUp className="h-4 w-4 text-[#1B365D] -mb-1" />
        <ChevronDown className="h-4 w-4 text-gray-300 -mt-1" />
      </div> : 
      <div className="flex flex-col">
        <ChevronUp className="h-4 w-4 text-gray-300 -mb-1" />
        <ChevronDown className="h-4 w-4 text-[#1B365D] -mt-1" />
      </div>;
  };

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Verified</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getReportTypeBadge = (type: string) => {
    return type === 'observed' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Observed</span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Personal</span>
    );
  };

  return (
    <div className="p-2 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-[#1B365D] dark:text-white mb-2">Symptom Reports</h1>
        <p className="text-gray-600 dark:text-gray-400">Review and manage community health reports</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <div className="p-4 border-b dark:border-gray-700 flex flex-col gap-4 items-start justify-between lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-[#1B365D] dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Reports</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{filteredReports.length} reports found</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full lg:flex-row lg:w-auto">
            <Button
              onClick={handlePatternAnalysis}
              disabled={isAnalyzing || reports.filter(r => r.status === 'verified').length === 0}
              className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white order-first lg:order-0"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze Patterns
                </>
              )}
            </Button>
            <Select value={reportTypeFilter} onValueChange={setReportTypeFilter}>
              <SelectTrigger className="w-full lg:w-37.5">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="observed">Observed</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-37.5">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-37.5">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
              <tr>
                <th 
                  className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort('userName')}
                >
                  <div className="flex items-center gap-1">
                    Reporter
                    <SortIcon field="userName" />
                  </div>
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Type</th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Symptoms</th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Location</th>
                <th 
                  className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    <SortIcon field="createdAt" />
                  </div>
                </th>
                <th 
                  className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <SortIcon field="status" />
                  </div>
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedReports.map((report, index) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <Avatar size="default">
                        <AvatarImage src={report.userSelfieUrl} alt={report.userName} />
                        <AvatarFallback className="text-xs">{report.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white block truncate">{report.userName}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 block truncate sm:hidden">{getReportTypeBadge(report.reportType)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    {getReportTypeBadge(report.reportType)}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-nowrap gap-1">
                      {report.symptoms.slice(0, window.innerWidth < 640 ? 1 : 2).map((symptom, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          {symptom}
                        </span>
                      ))}
                      {report.symptoms.length > (window.innerWidth < 640 ? 1 : 2) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          +{report.symptoms.length - (window.innerWidth < 640 ? 1 : 2)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="truncate max-w-37.5">{report.barangay || report.location}</span>
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-3 w-3 text-gray-400 hidden sm:inline" />
                      <span className="text-xs sm:text-sm">{formatDate(report.createdAt)}</span>
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(report.status)}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedReport(report);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {report.status === 'pending' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedReport(report);
                                setIsVerifyDialogOpen(true);
                              }}
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Verify Report
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedReport(report);
                                setIsRejectDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject Report
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedReport(report);
                                setIsOutbreakDialogOpen(true);
                              }}
                              className="text-orange-600"
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Mark as Outbreak
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 lg:px-6 py-4 border-t dark:border-gray-700 flex flex-col gap-4 items-center justify-between lg:flex-row">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredReports.length)} of {filteredReports.length} reports
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="text-xs px-2 py-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Prev</span>
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = currentPage <= 3 ? i + 1 : 
                              currentPage >= totalPages - 2 ? totalPages - 4 + i :
                              currentPage - 2 + i;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`text-xs px-2 py-1 ${currentPage === pageNum ? "bg-[#1B365D] hover:bg-[#1B365D]/90" : ""}`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="text-xs px-2 py-1"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-37.5 max-h-[90vh] overflow-y-auto dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle>Symptom Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Reporter Name</p>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedReport.userName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Report Type</p>
                  <p className="text-sm text-gray-900 dark:text-white">{getReportTypeBadge(selectedReport.reportType)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date Reported</p>
                  <p className="text-sm text-gray-900 dark:text-white">{formatDate(selectedReport.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                  <p className="text-sm text-gray-900 dark:text-white">{getStatusBadge(selectedReport.status)}</p>
                </div>
              </div>

              <div className="border-t dark:border-gray-700 pt-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Symptoms Reported</p>
                <div className="flex flex-wrap gap-2">
                  {selectedReport.symptoms.map((symptom, idx) => (
                    <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {symptom}
                    </span>
                  ))}
                  {selectedReport.customSymptom && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {selectedReport.customSymptom}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t dark:border-gray-700 pt-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</p>
                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedReport.description || 'No description provided'}</p>
              </div>

              <div className="border-t dark:border-gray-700 pt-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Location</p>
                <div className="flex items-start gap-2 text-sm text-gray-900 dark:text-white">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p>{selectedReport.location}</p>
                    {selectedReport.barangay && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Barangay: {selectedReport.barangay}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Coordinates: {selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>

              {selectedReport.proofImageUrl && (
                <div className="border-t dark:border-gray-700 pt-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Proof Image</p>
                  <img 
                    src={selectedReport.proofImageUrl} 
                    alt="Proof" 
                    className="w-full h-64 object-contain rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verify Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to verify this report from <strong>{selectedReport?.userName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleVerify(selectedReport?.id!)}
              className="bg-green-600 hover:bg-green-700"
            >
              Verify
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this report from <strong>{selectedReport?.userName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Rejection Reason (Optional)
            </label>
            <Textarea
              placeholder="Provide a reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-25"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectionReason('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleReject(selectedReport?.id!)}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isOutbreakDialogOpen} onOpenChange={setIsOutbreakDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Outbreak</AlertDialogTitle>
            <AlertDialogDescription>
              Mark this report from <strong>{selectedReport?.userName}</strong> as an outbreak alert.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Outbreak Severity Level
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="severity"
                  value="low"
                  checked={outbreakSeverity === 'low'}
                  onChange={(e) => setOutbreakSeverity(e.target.value as 'low' | 'medium' | 'high')}
                  className="text-green-600"
                />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">LOW - Isolated case requiring monitoring</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="severity"
                  value="medium"
                  checked={outbreakSeverity === 'medium'}
                  onChange={(e) => setOutbreakSeverity(e.target.value as 'low' | 'medium' | 'high')}
                  className="text-yellow-600"
                />
                <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">MEDIUM - Potential outbreak requiring investigation</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="severity"
                  value="high"
                  checked={outbreakSeverity === 'high'}
                  onChange={(e) => setOutbreakSeverity(e.target.value as 'low' | 'medium' | 'high')}
                  className="text-red-600"
                />
                <span className="text-sm text-red-600 dark:text-red-400 font-medium">HIGH - Confirmed outbreak requiring immediate response</span>
              </label>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOutbreakSeverity('medium')}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleMarkAsOutbreak(outbreakSeverity)}
              className={`${
                outbreakSeverity === 'high' ? 'bg-red-600 hover:bg-red-700' :
                outbreakSeverity === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700' :
                'bg-green-600 hover:bg-green-700'
              }`}
            >
              Create {outbreakSeverity.toUpperCase()} Alert
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PatternAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => {
          setIsAnalysisModalOpen(false);
          setAnalysisResult(null);
          setIsAnalyzing(false);
        }}
        analysis={analysisResult}
        isLoading={isAnalyzing}
        onSaveOutbreakAlert={handleSaveOutbreakAlert}
      />
    </div>
  );
}
