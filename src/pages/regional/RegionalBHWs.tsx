import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, UserCog, MapPin, Mail, Phone, ArrowLeft, Shield, ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';
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
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRegionScope } from '@/contexts/RegionScopeContext';
import { isMockUser, updateMockCredential } from '@/data/mockUsers';
import {
  loadMockBHWs,
  saveMockBHWs,
  loadMockMunicipalities,
} from '@/data/dohRegionViiSeedData';
import { AccountCredentialsFields } from '@/components/admin/AccountCredentialsFields';
import { getPasswordValidationError } from '@/lib/passwordValidation';
import {
  buildBhwCredentialProfile,
  changeManagedAccountPassword,
  createManagedAccount,
  deleteManagedAccountCredentials,
} from '@/services/adminAccountService';

export default function RegionalBHWs() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { basePath, region } = useRegionScope();
  const regionFilter = region || user?.region || '';
  const isDohPortal = basePath === '/doh-r7';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const municipalityFilter = searchParams.get('municipality');
  
  const [bhws, setBhws] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedBHW, setSelectedBHW] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [municipalityFilterLocal, setMunicipalityFilterLocal] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const emptyBHWForm = () => ({
    fullName: '',
    email: '',
    phone: '',
    municipality: '',
    barangay: '',
    address: '',
    officeName: '',
    headOfficer: '',
    username: '',
    region: regionFilter,
    role: 'bhw',
    accountType: 'bhw',
    subscription: 'barangay',
    status: 'approved',
    assignedRegion: regionFilter,
    createdAt: serverTimestamp(),
  });
  const [newBHW, setNewBHW] = useState(emptyBHWForm());
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [changePassword, setChangePassword] = useState('');
  const [changeConfirmPassword, setChangeConfirmPassword] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangeConfirmPassword, setShowChangeConfirmPassword] = useState(false);
  const itemsPerPage = 10;

  const resetAddForm = () => {
    setNewBHW(emptyBHWForm());
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const resetChangePasswordForm = () => {
    setChangePassword('');
    setChangeConfirmPassword('');
    setShowChangePassword(false);
    setShowChangeConfirmPassword(false);
  };

  useEffect(() => {
    fetchBHWs();
    fetchMunicipalities();
  }, []);

  const fetchMunicipalities = async () => {
    try {
      if (isMockUser(user)) {
        setMunicipalities(loadMockMunicipalities());
        return;
      }
      const municipalitiesRef = collection(db, 'municipalities');
      const q = regionFilter
        ? query(municipalitiesRef, where('region', '==', regionFilter))
        : municipalitiesRef;
      const querySnapshot = await getDocs(q);
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
      if (isMockUser(user)) {
        setBhws(loadMockBHWs());
        return;
      }

      const registrationsRef = collection(db, 'registrations');
      const q = regionFilter
        ? query(registrationsRef, where('role', '==', 'bhw'), where('region', '==', regionFilter))
        : query(registrationsRef, where('role', '==', 'bhw'));
      const querySnapshot = await getDocs(q);
      
      const bhwData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        sentinels: 0 // Will be updated when we fetch sentinels
      }));
      
      // Fetch sentinels to get counts
      const sentinelsRef = collection(db, 'sentinels');
      const sentinelsQuery = await getDocs(sentinelsRef);
      const sentinelsData = sentinelsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Count sentinels per BHW
      const bhwWithSentinels = bhwData.map(bhw => {
        const sentinelCount = sentinelsData.filter(s => (s as any).assignedBHW === bhw.id).length;
        return { ...bhw, sentinels: sentinelCount };
      });
      
      setBhws(bhwWithSentinels);
    } catch (error) {
      console.error('Error fetching BHWs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBHW = async () => {
    const passwordError = getPasswordValidationError(newPassword, confirmPassword);
    if (!newBHW.fullName || !newBHW.email || !newBHW.username || !newBHW.municipality || !newBHW.barangay) {
      toast({
        title: "Missing fields",
        description: "Please fill in name, email, username, municipality, and barangay.",
        variant: "destructive",
      });
      return;
    }
    if (passwordError) {
      toast({
        title: "Invalid password",
        description: passwordError,
        variant: "destructive",
      });
      return;
    }

    try {
      const accountId = `mock-bhw-${Date.now()}`;
      const entry = {
        ...newBHW,
        id: accountId,
        region: regionFilter,
        sentinels: 0,
        status: 'approved',
        createdAt: new Date().toISOString(),
      };

      await createManagedAccount(isMockUser(user), {
        accountId,
        email: newBHW.email,
        username: newBHW.username,
        password: newPassword,
        profile: buildBhwCredentialProfile(newBHW, regionFilter),
        registrationData: {
          ...newBHW,
          region: regionFilter,
          sentinels: 0,
          createdBy: user?.uid,
        },
      });

      if (isMockUser(user)) {
        const current = loadMockBHWs();
        saveMockBHWs([...current, entry] as typeof current);
      }

      resetAddForm();
      setIsAddDialogOpen(false);
      fetchBHWs();

      toast({
        title: "BHW Added",
        description: "Account auto-approved. They can sign in immediately with their username or email.",
        variant: "success",
      });
    } catch (error) {
      console.error('Error adding BHW:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add BHW.",
        variant: "destructive",
      });
    }
  };

  const handleToggleBHWActive = async (bhwId: string, activate: boolean) => {
    const newStatus = activate ? 'approved' : 'inactive';
    try {
      if (isMockUser(user)) {
        const current = loadMockBHWs();
        const updated = current.map((b) =>
          b.id === bhwId ? { ...b, status: newStatus } : b
        );
        saveMockBHWs(updated);
        setBhws(updated);
        updateMockCredential(bhwId, { profile: { status: newStatus } });
      } else {
        const bhwRef = doc(db, 'registrations', bhwId);
        await updateDoc(bhwRef, { status: newStatus });
        setBhws(bhws.map((b) => (b.id === bhwId ? { ...b, status: newStatus } : b)));
      }

      setIsDeactivateDialogOpen(false);
      setIsViewDialogOpen(false);
      setSelectedBHW(null);

      toast({
        title: activate ? "BHW Reactivated" : "BHW Deactivated",
        description: activate
          ? "This BHW can sign in again."
          : "This BHW can no longer sign in until reactivated.",
        variant: "success",
      });
    } catch (error) {
      console.error('Error updating BHW status:', error);
      toast({
        title: "Error",
        description: "Failed to update BHW account status.",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    if (!selectedBHW) return;
    const passwordError = getPasswordValidationError(changePassword, changeConfirmPassword);
    if (passwordError) {
      toast({
        title: "Invalid password",
        description: passwordError,
        variant: "destructive",
      });
      return;
    }

    try {
      await changeManagedAccountPassword(
        isMockUser(user),
        selectedBHW.id,
        changePassword
      );
      resetChangePasswordForm();
      setIsChangePasswordOpen(false);
      toast({
        title: "Password Updated",
        description: "The BHW can now sign in with the new password.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password.",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (bhwId: string) => {
    try {
      if (isMockUser(user)) {
        const current = loadMockBHWs();
        const updated = current.map((b) =>
          b.id === bhwId ? { ...b, status: 'approved' } : b
        );
        saveMockBHWs(updated);
        setBhws(updated);
        updateMockCredential(bhwId, {
          profile: { status: 'approved' },
        });
      } else {
        const bhwRef = doc(db, 'registrations', bhwId);
        await updateDoc(bhwRef, { status: 'approved' });
        setBhws(bhws.map(b => b.id === bhwId ? { ...b, status: 'approved' } : b));
      }
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
      if (isMockUser(user)) {
        const current = loadMockBHWs();
        const updated = current.map((b) =>
          b.id === bhwId ? { ...b, status: 'rejected', rejectionMessage } : b
        );
        saveMockBHWs(updated);
        setBhws(updated);
      } else {
        const bhwRef = doc(db, 'registrations', bhwId);
        await updateDoc(bhwRef, { 
          status: 'rejected',
          rejectionMessage: rejectionMessage 
        });
        setBhws(bhws.map(b => b.id === bhwId ? { ...b, status: 'rejected', rejectionMessage } : b));
      }
      setIsRejectDialogOpen(false);
      setSelectedBHW(null);
      setRejectionMessage('');
      toast({
        title: "BHW Rejected",
        description: "The BHW registration has been rejected.",
        variant: "success",
      });
    } catch (error) {
      console.error('Error rejecting BHW:', error);
      toast({
        title: "Error",
        description: "Failed to reject BHW registration.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (bhwId: string) => {
    try {
      deleteManagedAccountCredentials(isMockUser(user), bhwId);
      if (isMockUser(user)) {
        const current = loadMockBHWs();
        const updated = current.filter((b) => b.id !== bhwId);
        saveMockBHWs(updated);
        setBhws(updated);
      } else {
        const bhwRef = doc(db, 'registrations', bhwId);
        await deleteDoc(bhwRef);
        setBhws(bhws.filter(b => b.id !== bhwId));
      }
      setIsDeleteDialogOpen(false);
      setSelectedBHW(null);
      toast({
        title: "BHW Deleted",
        description: "The BHW has been deleted successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error('Error deleting BHW:', error);
      toast({
        title: "Error",
        description: "Failed to delete BHW.",
        variant: "destructive",
      });
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
        bhw.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bhw.email?.toLowerCase().includes(searchQuery.toLowerCase())
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
      case 'inactive':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Deactivated</span>;
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
          <Button variant="ghost" onClick={() => navigate(`${basePath}/municipalities`)} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Municipalities
          </Button>
        )}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#1B365D] mb-2">
              {municipalityFilter
                ? `${municipalityFilter} BHWs`
                : isDohPortal
                  ? 'DOH Region VII BHW Management'
                  : 'Regional BHW Management'}
            </h1>
            <p className="text-gray-600">
              {isDohPortal
                ? 'Manage BHW accounts and registrations in Central Visayas'
                : 'Manage BHW accounts and assignments in your region'}
            </p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-[#1B365D] hover:bg-[#1B365D]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add BHW
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
                <SelectItem value="inactive">Deactivated</SelectItem>
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
            <TableSkeleton rows={10} columns={6} />
          ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  onClick={() => handleSort('fullName')}
                >
                  <div className="flex items-center gap-1">
                    Name
                    <SortIcon field="fullName" />
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
                        <UserCog className="h-4 w-4 text-[#1B365D]" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">{bhw.fullName}</span>
                        <p className="text-xs text-gray-500">{bhw.barangay}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{bhw.municipality}</span>
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
                      <span>{bhw.sentinels || 0}</span>
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
                            setIsDeactivateDialogOpen(true);
                          }}
                          className="border-gray-500 text-gray-600 hover:bg-gray-50"
                        >
                          Deactivate
                        </Button>
                      )}
                      {bhw.status === 'inactive' && (
                        <Button
                          size="sm"
                          onClick={() => handleToggleBHWActive(bhw.id, true)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Reactivate
                        </Button>
                      )}
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

      {/* Add BHW Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New BHW</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={newBHW.fullName}
                  onChange={(e) => setNewBHW({...newBHW, fullName: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newBHW.email}
                  onChange={(e) => setNewBHW({...newBHW, email: e.target.value})}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newBHW.phone}
                  onChange={(e) => setNewBHW({...newBHW, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="officeName">Barangay Health Center</Label>
                <Input
                  id="officeName"
                  value={newBHW.officeName}
                  onChange={(e) => setNewBHW({...newBHW, officeName: e.target.value})}
                  placeholder="Health center name"
                />
              </div>
              <div>
                <Label htmlFor="headOfficer">Head BHW Name</Label>
                <Input
                  id="headOfficer"
                  value={newBHW.headOfficer}
                  onChange={(e) => setNewBHW({...newBHW, headOfficer: e.target.value})}
                  placeholder="Head BHW name"
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newBHW.username}
                  onChange={(e) => setNewBHW({...newBHW, username: e.target.value})}
                  placeholder="Login username"
                />
              </div>
              <div>
                <Label htmlFor="municipality">Municipality</Label>
                <Select value={newBHW.municipality} onValueChange={(value) => setNewBHW({...newBHW, municipality: value})}>
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
              <div className="col-span-2">
                <Label htmlFor="barangay">Barangay</Label>
                <Input
                  id="barangay"
                  value={newBHW.barangay}
                  onChange={(e) => setNewBHW({...newBHW, barangay: e.target.value})}
                  placeholder="Enter barangay"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={newBHW.address}
                  onChange={(e) => setNewBHW({...newBHW, address: e.target.value})}
                  placeholder="Enter address"
                  rows={3}
                />
              </div>
              <AccountCredentialsFields
                password={newPassword}
                setPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
              />
            </div>
            <p className="text-xs text-gray-500">
              Manually added accounts are auto-approved and can sign in right away. You can deactivate them later if needed.
            </p>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetAddForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleAddBHW} className="bg-[#1B365D] hover:bg-[#1B365D]/90">
                Add BHW
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>BHW Details</DialogTitle>
          </DialogHeader>
          {selectedBHW && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-sm text-gray-900">{selectedBHW.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Username</p>
                  <p className="text-sm text-gray-900">{selectedBHW.username || '—'}</p>
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
                  <p className="text-sm font-medium text-gray-500">Health Center</p>
                  <p className="text-sm text-gray-900">{selectedBHW.officeName || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Head BHW</p>
                  <p className="text-sm text-gray-900">{selectedBHW.headOfficer || selectedBHW.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Region</p>
                  <p className="text-sm text-gray-900">{selectedBHW.region || regionFilter}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Municipality</p>
                  <p className="text-sm text-gray-900">{selectedBHW.municipality}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Barangay</p>
                  <p className="text-sm text-gray-900">{selectedBHW.barangay}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Subscription</p>
                  <p className="text-sm text-gray-900 capitalize">{selectedBHW.subscription || 'barangay'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-sm text-gray-900">{selectedBHW.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Account Type</p>
                  <p className="text-sm text-gray-900 uppercase">{selectedBHW.accountType || 'bhw'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-sm text-gray-900">{getStatusBadge(selectedBHW.status)}</p>
                </div>
                {selectedBHW.rejectionMessage && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Rejection Reason</p>
                    <p className="text-sm text-red-600">{selectedBHW.rejectionMessage}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-between gap-2 pt-4 border-t">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsChangePasswordOpen(true)}
                  >
                    Change Password
                  </Button>
                  {selectedBHW.status === 'approved' && (
                    <Button
                      variant="outline"
                      className="border-gray-500 text-gray-600 hover:bg-gray-50"
                      onClick={() => setIsDeactivateDialogOpen(true)}
                    >
                      Deactivate
                    </Button>
                  )}
                  {selectedBHW.status === 'inactive' && (
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleToggleBHWActive(selectedBHW.id, true)}
                    >
                      Reactivate
                    </Button>
                  )}
                </div>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={(open) => {
        setIsChangePasswordOpen(open);
        if (!open) resetChangePasswordForm();
      }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          {selectedBHW && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Set a new password for <strong>{selectedBHW.fullName}</strong> ({selectedBHW.username}).
              </p>
              <div className="grid grid-cols-1 gap-4">
                <AccountCredentialsFields
                  password={changePassword}
                  setPassword={setChangePassword}
                  confirmPassword={changeConfirmPassword}
                  setConfirmPassword={setChangeConfirmPassword}
                  showPassword={showChangePassword}
                  setShowPassword={setShowChangePassword}
                  showConfirmPassword={showChangeConfirmPassword}
                  setShowConfirmPassword={setShowChangeConfirmPassword}
                  passwordLabel="New Password"
                  confirmLabel="Confirm New Password"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => { setIsChangePasswordOpen(false); resetChangePasswordForm(); }}>
                  Cancel
                </Button>
                <Button onClick={handleChangePassword} className="bg-[#1B365D] hover:bg-[#1B365D]/90">
                  Update Password
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve BHW</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve <strong>{selectedBHW?.fullName}</strong>?
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

      {/* Reject Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject BHW</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to reject <strong>{selectedBHW?.fullName}</strong>.
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

      {/* Deactivate Dialog */}
      <AlertDialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate BHW Account</AlertDialogTitle>
            <AlertDialogDescription>
              Deactivate <strong>{selectedBHW?.fullName}</strong>? They will not be able to sign in
              until you reactivate the account. Their data will be kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedBHW && handleToggleBHWActive(selectedBHW.id, false)}
              className="bg-gray-700 hover:bg-gray-800"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete BHW</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{selectedBHW?.fullName}</strong>?
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
    </div>
  );
}
