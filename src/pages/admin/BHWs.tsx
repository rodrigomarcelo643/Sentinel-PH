import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, UserCog, MapPin, Mail, Phone, ArrowLeft, Shield, X, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TableSkeleton from '@/components/ui/TableSkeleton';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function BHWs() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const municipalityFilter = searchParams.get('municipality');
  
  const [bhws, setBhws] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedBHW, setSelectedBHW] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [municipalityFilterLocal, setMunicipalityFilterLocal] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBHWs();
  }, []);

  const fetchBHWs = async () => {
    try {
      const registrationsRef = collection(db, 'registrations');
      const q = query(registrationsRef, where('role', '==', 'bhw'));
      const querySnapshot = await getDocs(q);
      
      const bhwData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        sentinels: 0 // Set to 0 as requested
      }));
      
      setBhws(bhwData);
    } catch (error) {
      console.error('Error fetching BHWs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bhwId: string) => {
    try {
      const bhwRef = doc(db, 'registrations', bhwId);
      await updateDoc(bhwRef, { status: 'approved' });
      setBhws(bhws.map(b => b.id === bhwId ? { ...b, status: 'approved' } : b));
      setIsApproveDialogOpen(false);
      setSelectedBHW(null);
      toast({
        title: "BHW Approved",
        description: "The BHW registration has been approved successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error('Error approving BHW:', error);
      toast({
        title: "Error",
        description: "Failed to approve BHW registration.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (bhwId: string) => {
    try {
      const bhwRef = doc(db, 'registrations', bhwId);
      await updateDoc(bhwRef, { 
        status: 'rejected',
        rejectionMessage: rejectionMessage 
      });
      setBhws(bhws.map(b => b.id === bhwId ? { ...b, status: 'rejected', rejectionMessage } : b));
      setIsRejectDialogOpen(false);
      setSelectedBHW(null);
      setRejectionMessage('');
    } catch (error) {
      console.error('Error rejecting BHW:', error);
    }
  };

  const handleCancel = async (bhwId: string) => {
    try {
      const bhwRef = doc(db, 'registrations', bhwId);
      await updateDoc(bhwRef, { status: 'pending' });
      setBhws(bhws.map(b => b.id === bhwId ? { ...b, status: 'pending' } : b));
      setIsCancelDialogOpen(false);
      setSelectedBHW(null);
    } catch (error) {
      console.error('Error canceling BHW:', error);
    }
  };

  const handleDelete = async (bhwId: string) => {
    try {
      const bhwRef = doc(db, 'registrations', bhwId);
      await deleteDoc(bhwRef);
      setBhws(bhws.filter(b => b.id !== bhwId));
      setIsDeleteDialogOpen(false);
      setSelectedBHW(null);
    } catch (error) {
      console.error('Error deleting BHW:', error);
    }
  };

  useEffect(() => {
    if (municipalityFilter) {
      setSearchQuery('');
      setCurrentPage(1);
    }
  }, [municipalityFilter]);

  const filteredBHWs = useMemo(() => {
    let filtered = bhws;
    if (municipalityFilter) {
      filtered = filtered.filter(b => b.municipality === municipalityFilter);
    }
    if (municipalityFilterLocal !== 'all') {
      filtered = filtered.filter(b => b.municipality === municipalityFilterLocal);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(bhw => 
        bhw.municipality?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bhw.officeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bhw.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sorting
    if (sortField) {
      filtered.sort((a, b) => {
        const aVal = a[sortField] || '';
        const bVal = b[sortField] || '';
        if (sortDirection === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }
    
    return filtered;
  }, [searchQuery, bhws, municipalityFilter, municipalityFilterLocal, statusFilter, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
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

  const uniqueMunicipalities = useMemo(() => {
    return Array.from(new Set(bhws.map(b => b.municipality).filter(Boolean)));
  }, [bhws]);

  const totalPages = Math.ceil(filteredBHWs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBHWs = filteredBHWs.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        {municipalityFilter && (
          <Button variant="ghost" onClick={() => navigate('/admin/municipalities')} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Municipalities
          </Button>
        )}
        <h1 className="text-3xl font-bold text-[#1B365D] mb-2">
          {municipalityFilter ? `${municipalityFilter} BHWs` : 'Barangay Health Workers'}
        </h1>
        <p className="text-gray-600">Manage BHW accounts and assignments</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100"
      >
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <UserCog className="h-6 w-6 text-[#1B365D]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">All BHWs</h2>
              <p className="text-sm text-gray-500">{filteredBHWs.length} BHWs found</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={municipalityFilterLocal} onValueChange={setMunicipalityFilterLocal}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by Municipality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Municipalities</SelectItem>
                {uniqueMunicipalities.map((municipality) => (
                  <SelectItem key={municipality} value={municipality}>{municipality}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search BHWs..."
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
          {loading ? (
            <TableSkeleton rows={10} columns={7} />
          ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('officeName')}
                >
                  <div className="flex items-center gap-1">
                    Office Name
                    <SortIcon field="officeName" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('municipality')}
                >
                  <div className="flex items-center gap-1">
                    Municipality
                    <SortIcon field="municipality" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('fullName')}
                >
                  <div className="flex items-center gap-1">
                    Contact Person
                    <SortIcon field="fullName" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentinels</th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <SortIcon field="status" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedBHWs.map((bhw, index) => (
                <motion.tr
                  key={bhw.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <MapPin className="h-4 w-4 text-[#1B365D]" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{bhw.officeName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{bhw.municipality}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserCog className="h-4 w-4 text-gray-400" />
                      <span>{bhw.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span>{bhw.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{bhw.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span>{bhw.sentinels}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(bhw.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedBHW(bhw);
                          setIsViewDialogOpen(true);
                        }}
                        className="border-[#1B365D] text-[#1B365D] hover:bg-blue-50"
                      >
                        View
                      </Button>
                      {bhw.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedBHW(bhw);
                              setIsApproveDialogOpen(true);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBHW(bhw);
                              setIsRejectDialogOpen(true);
                            }}
                            className="border-red-600 text-red-600 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {bhw.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBHW(bhw);
                            setIsCancelDialogOpen(true);
                          }}
                          className="border-gray-600 text-gray-600 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                      )}
                      {bhw.status === 'rejected' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBHW(bhw);
                              setIsCancelDialogOpen(true);
                            }}
                            className="border-gray-600 text-gray-600 hover:bg-gray-50"
                          >
                            Revert
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBHW(bhw);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="border-red-600 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {filteredBHWs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No BHWs found matching your search.
          </div>
        )}

        <div className="px-6 py-4 border-t flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredBHWs.length)} of {filteredBHWs.length} BHWs
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
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
                className={currentPage === number ? "bg-[#1B365D] hover:bg-[#1B365D]/90" : ""}
              >
                {number}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>BHW Registration Details</DialogTitle>
          </DialogHeader>
          {selectedBHW && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Office Name</p>
                  <p className="text-sm text-gray-900">{selectedBHW.officeName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Municipality</p>
                  <p className="text-sm text-gray-900">{selectedBHW.municipality}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Region</p>
                  <p className="text-sm text-gray-900">{selectedBHW.region}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Head Officer</p>
                  <p className="text-sm text-gray-900">{selectedBHW.headOfficer}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact Person</p>
                  <p className="text-sm text-gray-900">{selectedBHW.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{selectedBHW.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{selectedBHW.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-sm text-gray-900">{selectedBHW.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Subscription</p>
                  <p className="text-sm text-gray-900 capitalize">{selectedBHW.subscription}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Method</p>
                  <p className="text-sm text-gray-900 uppercase">{selectedBHW.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Documents Uploaded</p>
                  <p className="text-sm text-gray-900">{selectedBHW.documentsCount} files</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-sm text-gray-900">{getStatusBadge(selectedBHW.status)}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve BHW Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve <strong>{selectedBHW?.fullName}</strong> from <strong>{selectedBHW?.officeName}</strong>?
              This will grant them access to the BHW dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleApprove(selectedBHW?.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject BHW Registration</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to reject <strong>{selectedBHW?.fullName}</strong> from <strong>{selectedBHW?.officeName}</strong>.
              Please provide a reason for rejection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-message">Rejection Message</Label>
            <Textarea
              id="rejection-message"
              placeholder="Enter reason for rejection..."
              value={rejectionMessage}
              onChange={(e) => setRejectionMessage(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectionMessage('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleReject(selectedBHW?.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={!rejectionMessage.trim()}
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete BHW Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{selectedBHW?.fullName}</strong> from <strong>{selectedBHW?.officeName}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDelete(selectedBHW?.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel BHW Approval</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revert <strong>{selectedBHW?.fullName}</strong> from <strong>{selectedBHW?.officeName}</strong> back to pending status?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleCancel(selectedBHW?.id)}
              className="bg-gray-600 hover:bg-gray-700"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
