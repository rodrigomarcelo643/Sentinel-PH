import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Shield, Mail, Phone, ChevronUp, ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const dummySentinels = [
  { id: 1, fullName: "Juan Dela Cruz", role: "Sari-Sari Store Owner", barangay: "Poblacion", municipality: "Cebu City", email: "juan@sentinel.ph", phone: "+63-917-123-4567", status: "approved", documentsCount: 3 },
  { id: 2, fullName: "Maria Santos", role: "Tricycle Driver", barangay: "San Isidro", municipality: "Cebu City", email: "maria@sentinel.ph", phone: "+63-917-234-5678", status: "pending", documentsCount: 2 },
  { id: 3, fullName: "Pedro Reyes", role: "Market Vendor", barangay: "Poblacion", municipality: "Cebu City", email: "pedro@sentinel.ph", phone: "+63-917-345-6789", status: "approved", documentsCount: 4 },
  { id: 4, fullName: "Ana Garcia", role: "Barangay Tanod", barangay: "Bagong Silang", municipality: "Cebu City", email: "ana@sentinel.ph", phone: "+63-917-456-7890", status: "pending", documentsCount: 2 },
  { id: 5, fullName: "Jose Ramos", role: "Religious Leader", barangay: "San Isidro", municipality: "Cebu City", email: "jose@sentinel.ph", phone: "+63-917-567-8901", status: "rejected", documentsCount: 1 },
];

export default function BhwSentinels() {
  const [sentinels, setSentinels] = useState(dummySentinels);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSentinel, setSelectedSentinel] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const itemsPerPage = 10;

  const handleApprove = (id: number) => {
    setSentinels(sentinels.map(s => s.id === id ? { ...s, status: 'approved' } : s));
    setIsApproveDialogOpen(false);
    setSelectedSentinel(null);
  };

  const handleCancel = (id: number) => {
    setSentinels(sentinels.map(s => s.id === id ? { ...s, status: 'pending' } : s));
    setIsCancelDialogOpen(false);
    setSelectedSentinel(null);
  };

  const filteredSentinels = useMemo(() => {
    let filtered = sentinels;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(sentinel => 
        sentinel.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sentinel.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sentinel.barangay.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
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
  }, [searchQuery, sentinels, statusFilter, sortField, sortDirection]);

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

  const totalPages = Math.ceil(filteredSentinels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSentinels = filteredSentinels.slice(startIndex, startIndex + itemsPerPage);

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
        <h1 className="text-3xl font-bold text-[#1B365D] mb-2">Community Sentinels</h1>
        <p className="text-gray-600">Manage sentinel registrations and approvals</p>
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
              <Shield className="h-6 w-6 text-[#1B365D]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">All Sentinels</h2>
              <p className="text-sm text-gray-500">{filteredSentinels.length} sentinels found</p>
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
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search sentinels..."
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
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('fullName')}
                >
                  <div className="flex items-center gap-1">
                    Full Name
                    <SortIcon field="fullName" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center gap-1">
                    Role
                    <SortIcon field="role" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Municipality</th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('barangay')}
                >
                  <div className="flex items-center gap-1">
                    Barangay
                    <SortIcon field="barangay" />
                  </div>
                </th>
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
              {paginatedSentinels.map((sentinel, index) => (
                <motion.tr
                  key={sentinel.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar size="default">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sentinel.fullName}`} alt={sentinel.fullName} />
                        <AvatarFallback>{sentinel.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-900">{sentinel.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{sentinel.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{sentinel.municipality}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{sentinel.barangay}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span>{sentinel.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{sentinel.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(sentinel.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSentinel(sentinel);
                          setIsViewDialogOpen(true);
                        }}
                        className="border-[#1B365D] text-[#1B365D] hover:bg-blue-50"
                      >
                        View
                      </Button>
                      {sentinel.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedSentinel(sentinel);
                            setIsApproveDialogOpen(true);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Approve
                        </Button>
                      )}
                      {sentinel.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSentinel(sentinel);
                            setIsCancelDialogOpen(true);
                          }}
                          className="border-gray-600 text-gray-600 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredSentinels.length)} of {filteredSentinels.length} sentinels
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
            <DialogTitle>Sentinel Registration Details</DialogTitle>
          </DialogHeader>
          {selectedSentinel && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-sm text-gray-900">{selectedSentinel.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="text-sm text-gray-900">{selectedSentinel.role}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Municipality</p>
                  <p className="text-sm text-gray-900">{selectedSentinel.municipality}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Barangay</p>
                  <p className="text-sm text-gray-900">{selectedSentinel.barangay}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{selectedSentinel.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{selectedSentinel.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Documents Uploaded</p>
                  <p className="text-sm text-gray-900">{selectedSentinel.documentsCount} files</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-sm text-gray-900">{getStatusBadge(selectedSentinel.status)}</p>
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
            <AlertDialogTitle>Approve Sentinel Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve <strong>{selectedSentinel?.fullName}</strong> as a community sentinel?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleApprove(selectedSentinel?.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Sentinel Approval</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revert <strong>{selectedSentinel?.fullName}</strong> back to pending status?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleCancel(selectedSentinel?.id)}
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
