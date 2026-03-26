import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Shield, MapPin, Mail, Phone, Users, ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import TableSkeleton from '@/components/ui/TableSkeleton';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function RegionalSentinels() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [sentinels, setSentinels] = useState<any[]>([]);
  const [bhws, setBhws] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedSentinel, setSelectedSentinel] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [municipalityFilter, setMunicipalityFilter] = useState<string>('all');
  const [bhwFilter, setBhwFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [newSentinel, setNewSentinel] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    municipality: '',
    assignedBHW: '',
    status: 'active',
    createdBy: user?.uid,
    createdAt: serverTimestamp()
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSentinels();
    fetchBHWs();
    fetchMunicipalities();
  }, []);

  const fetchMunicipalities = async () => {
    try {
      const municipalitiesRef = collection(db, 'municipalities');
      const querySnapshot = await getDocs(municipalitiesRef);
      const municipalityData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMunicipalities(municipalityData);
    } catch (error) {
      console.error('Error fetching municipalities:', error);
    }
  };

  const fetchBHWs = async () => {
    try {
      const registrationsRef = collection(db, 'registrations');
      const q = query(registrationsRef, where('role', '==', 'bhw'));
      const querySnapshot = await getDocs(q);
      const bhwData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBhws(bhwData);
    } catch (error) {
      console.error('Error fetching BHWs:', error);
    }
  };

  const fetchSentinels = async () => {
    try {
      const sentinelsRef = collection(db, 'sentinels');
      // Fetch all sentinels
      const querySnapshot = await getDocs(sentinelsRef);
      
      const sentinelData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setSentinels(sentinelData);
    } catch (error) {
      console.error('Error fetching sentinels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSentinel = async () => {
    try {
      await addDoc(collection(db, 'sentinels'), {
        ...newSentinel,
        createdAt: serverTimestamp(),
        createdBy: user?.uid
      });
      
      setNewSentinel({
        name: '',
        email: '',
        phone: '',
        address: '',
        municipality: '',
        assignedBHW: '',
        status: 'active',
        createdBy: user?.uid,
        createdAt: serverTimestamp()
      });
      
      setIsAddDialogOpen(false);
      fetchSentinels();
      
      toast({
        title: "Sentinel Added",
        description: "New sentinel has been added successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error('Error adding sentinel:', error);
      toast({
        title: "Error",
        description: "Failed to add sentinel.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (sentinelId: string) => {
    try {
      const sentinelRef = doc(db, 'sentinels', sentinelId);
      await deleteDoc(sentinelRef);
      setSentinels(sentinels.filter(s => s.id !== sentinelId));
      setIsDeleteDialogOpen(false);
      setSelectedSentinel(null);
      
      toast({
        title: "Sentinel Deleted",
        description: "The sentinel has been deleted successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error('Error deleting sentinel:', error);
      toast({
        title: "Error",
        description: "Failed to delete sentinel.",
        variant: "destructive",
      });
    }
  };

  const filteredSentinels = useMemo(() => {
    let filtered = sentinels;
    
    if (municipalityFilter !== 'all') {
      filtered = filtered.filter(s => s.municipality === municipalityFilter);
    }
    
    if (bhwFilter !== 'all') {
      filtered = filtered.filter(s => s.assignedBHW === bhwFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(sentinel => 
        sentinel.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sentinel.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sentinel.municipality?.toLowerCase().includes(searchQuery.toLowerCase())
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
  }, [searchQuery, sentinels, municipalityFilter, bhwFilter, statusFilter, sortField, sortDirection]);

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
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
      case 'inactive':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Inactive</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getBHWName = (bhwId: string) => {
    const bhw = bhws.find(b => b.id === bhwId);
    return bhw ? bhw.fullName : 'Unassigned';
  };

  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#1B365D] mb-2">Regional Sentinels</h1>
            <p className="text-gray-600">Manage all sentinels in the system</p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-[#1B365D] hover:bg-[#1B365D]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Sentinel
          </Button>
        </div>
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={municipalityFilter} onValueChange={setMunicipalityFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by Municipality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Municipalities</SelectItem>
                {municipalities.map((municipality) => (
                  <SelectItem key={municipality.id} value={municipality.name}>{municipality.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={bhwFilter} onValueChange={setBhwFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by BHW" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All BHWs</SelectItem>
                {bhws.map((bhw) => (
                  <SelectItem key={bhw.id} value={bhw.id}>{bhw.fullName}</SelectItem>
                ))}
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
          {loading ? (
            <TableSkeleton rows={10} columns={6} />
          ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Name
                    <SortIcon field="name" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  onClick={() => handleSort('municipality')}
                >
                  <div className="flex items-center gap-1">
                    Municipality
                    <SortIcon field="municipality" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned BHW</th>
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <Shield className="h-4 w-4 text-[#1B365D]" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{sentinel.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{sentinel.municipality}</span>
                    </div>
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
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{getBHWName(sentinel.assignedBHW)}</span>
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSentinel(sentinel);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="border-red-600 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {filteredSentinels.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No sentinels found matching your search.
          </div>
        )}

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

      {/* Add Sentinel Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Sentinel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newSentinel.name}
                  onChange={(e) => setNewSentinel({...newSentinel, name: e.target.value})}
                  placeholder="Enter sentinel name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newSentinel.email}
                  onChange={(e) => setNewSentinel({...newSentinel, email: e.target.value})}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newSentinel.phone}
                  onChange={(e) => setNewSentinel({...newSentinel, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="municipality">Municipality</Label>
                <Select value={newSentinel.municipality} onValueChange={(value) => setNewSentinel({...newSentinel, municipality: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select municipality" />
                  </SelectTrigger>
                  <SelectContent>
                    {municipalities.map((municipality) => (
                      <SelectItem key={municipality.id} value={municipality.name}>{municipality.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assignedBHW">Assigned BHW</Label>
                <Select value={newSentinel.assignedBHW} onValueChange={(value) => setNewSentinel({...newSentinel, assignedBHW: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select BHW" />
                  </SelectTrigger>
                  <SelectContent>
                    {bhws.map((bhw) => (
                      <SelectItem key={bhw.id} value={bhw.id}>{bhw.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={newSentinel.address}
                  onChange={(e) => setNewSentinel({...newSentinel, address: e.target.value})}
                  placeholder="Enter address"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSentinel} className="bg-[#1B365D] hover:bg-[#1B365D]/90">
                Add Sentinel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Sentinel Details</DialogTitle>
          </DialogHeader>
          {selectedSentinel && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-sm text-gray-900">{selectedSentinel.name}</p>
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
                  <p className="text-sm font-medium text-gray-500">Municipality</p>
                  <p className="text-sm text-gray-900">{selectedSentinel.municipality}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Assigned BHW</p>
                  <p className="text-sm text-gray-900">{getBHWName(selectedSentinel.assignedBHW)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-sm text-gray-900">{selectedSentinel.address}</p>
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

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sentinel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{selectedSentinel?.name}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDelete(selectedSentinel?.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
