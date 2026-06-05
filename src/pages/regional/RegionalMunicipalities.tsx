import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Building, Mail, Phone, Users, ChevronUp, ChevronDown, Trash2, Plus, Edit } from 'lucide-react';
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
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRegionScope } from '@/contexts/RegionScopeContext';
import { isMockUser, updateMockCredential } from '@/data/mockUsers';
import {
  loadMockMunicipalities,
  saveMockMunicipalities,
} from '@/data/dohRegionViiSeedData';
import { AccountCredentialsFields } from '@/components/admin/AccountCredentialsFields';
import { getPasswordValidationError } from '@/lib/passwordValidation';
import {
  buildMunicipalCredentialProfile,
  changeManagedAccountPassword,
  createManagedAccount,
  deleteManagedAccountCredentials,
  updateManagedAccountCredentials,
} from '@/services/adminAccountService';

export default function RegionalMunicipalities() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { basePath, region } = useRegionScope();
  const regionFilter = region || user?.region || '';
  const isDohPortal = basePath === '/doh-r7';
  
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedMunicipality, setSelectedMunicipality] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const emptyMunicipalityForm = () => ({
    name: '',
    region: regionFilter,
    headOfficer: '',
    officialEmail: '',
    phone: '',
    address: '',
    username: '',
    status: 'active',
    createdBy: user?.uid,
    createdAt: serverTimestamp(),
  });
  const [newMunicipality, setNewMunicipality] = useState(emptyMunicipalityForm());
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editPassword, setEditPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);
  const itemsPerPage = 10;

  const resetAddForm = () => {
    setNewMunicipality(emptyMunicipalityForm());
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const resetEditPasswordForm = () => {
    setEditPassword('');
    setEditConfirmPassword('');
    setShowEditPassword(false);
    setShowEditConfirmPassword(false);
  };

  useEffect(() => {
    fetchMunicipalities();
  }, []);

  const fetchMunicipalities = async () => {
    try {
      if (isMockUser(user)) {
        setMunicipalities(loadMockMunicipalities());
        return;
      }

      const municipalitiesRef = collection(db, 'municipalities');
      const q = query(municipalitiesRef, where('region', '==', regionFilter));
      const querySnapshot = await getDocs(q);
      
      const municipalityData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        bhws: 0,
        sentinels: 0
      }));
      
      setMunicipalities(municipalityData);
    } catch (error) {
      console.error('Error fetching municipalities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMunicipality = async () => {
    const passwordError = getPasswordValidationError(newPassword, confirmPassword);
    if (!newMunicipality.name || !newMunicipality.headOfficer || !newMunicipality.officialEmail || !newMunicipality.username) {
      toast({
        title: "Missing fields",
        description: "Please fill in municipality name, head officer, official email, and username.",
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
      const accountId = `mock-muni-${Date.now()}`;
      const entry = {
        ...newMunicipality,
        id: accountId,
        createdAt: new Date().toISOString(),
        bhws: 0,
        sentinels: 0,
      };

      await createManagedAccount(isMockUser(user), {
        accountId,
        email: newMunicipality.officialEmail,
        username: newMunicipality.username,
        password: newPassword,
        profile: buildMunicipalCredentialProfile(newMunicipality, regionFilter),
        registrationData: {
          ...newMunicipality,
          role: 'municipal_admin',
          accountType: 'municipal_admin',
          email: newMunicipality.officialEmail,
          fullName: newMunicipality.headOfficer,
          status: 'approved',
          createdBy: user?.uid,
        },
      });

      if (isMockUser(user)) {
        const current = loadMockMunicipalities();
        saveMockMunicipalities([...current, entry] as typeof current);
      } else {
        await addDoc(collection(db, 'municipalities'), {
          ...newMunicipality,
          createdAt: serverTimestamp(),
          createdBy: user?.uid,
        });
      }

      resetAddForm();
      setIsAddDialogOpen(false);
      fetchMunicipalities();

      toast({
        title: "Municipality Added",
        description: "Municipal admin account auto-approved. They can sign in immediately.",
        variant: "success",
      });
    } catch (error) {
      console.error('Error adding municipality:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add municipality.",
        variant: "destructive",
      });
    }
  };

  const handleToggleMunicipalityActive = async (municipalityId: string, activate: boolean) => {
    const newStatus = activate ? 'active' : 'inactive';
    const municipality = municipalities.find((m) => m.id === municipalityId);
    if (!municipality) return;

    const updatedMunicipality = { ...municipality, status: newStatus };

    try {
      if (isMockUser(user)) {
        const current = loadMockMunicipalities();
        saveMockMunicipalities(
          current.map((m) => (m.id === municipalityId ? updatedMunicipality : m)) as typeof current
        );
        setMunicipalities(current.map((m) => (m.id === municipalityId ? updatedMunicipality : m)));
        updateMockCredential(municipalityId, {
          profile: { status: newStatus === 'active' ? 'approved' : 'inactive' },
        });
      } else {
        const municipalityRef = doc(db, 'municipalities', municipalityId);
        await updateDoc(municipalityRef, {
          status: newStatus,
          updatedAt: serverTimestamp(),
          updatedBy: user?.uid,
        });
        setMunicipalities(
          municipalities.map((m) => (m.id === municipalityId ? updatedMunicipality : m))
        );
      }

      setIsDeactivateDialogOpen(false);
      setIsViewDialogOpen(false);
      setSelectedMunicipality(null);

      toast({
        title: activate ? "Municipality Reactivated" : "Municipality Deactivated",
        description: activate
          ? "The municipal admin can sign in again."
          : "The municipal admin can no longer sign in until reactivated.",
        variant: "success",
      });
    } catch (error) {
      console.error('Error updating municipality status:', error);
      toast({
        title: "Error",
        description: "Failed to update municipality status.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMunicipality = async () => {
    if (!selectedMunicipality) return;

    const hasPasswordChange = editPassword.length > 0 || editConfirmPassword.length > 0;
    if (hasPasswordChange) {
      const passwordError = getPasswordValidationError(editPassword, editConfirmPassword);
      if (passwordError) {
        toast({
          title: "Invalid password",
          description: passwordError,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      if (hasPasswordChange) {
        await changeManagedAccountPassword(
          isMockUser(user),
          selectedMunicipality.id,
          editPassword
        );
      }

      if (isMockUser(user)) {
        await updateManagedAccountCredentials(true, selectedMunicipality.id, {
          email: selectedMunicipality.officialEmail,
          username: selectedMunicipality.username,
          profile: buildMunicipalCredentialProfile(selectedMunicipality, regionFilter),
        });
      }

      if (isMockUser(user)) {
        const current = loadMockMunicipalities();
        saveMockMunicipalities(
          current.map((m) =>
            m.id === selectedMunicipality.id ? selectedMunicipality : m
          ) as typeof current
        );
        setMunicipalities(
          current.map((m) =>
            m.id === selectedMunicipality.id ? selectedMunicipality : m
          )
        );
      } else {
        const municipalityRef = doc(db, 'municipalities', selectedMunicipality.id);
        await updateDoc(municipalityRef, {
          ...selectedMunicipality,
          updatedAt: serverTimestamp(),
          updatedBy: user?.uid
        });
        setMunicipalities(municipalities.map(m => 
          m.id === selectedMunicipality.id ? selectedMunicipality : m
        ));
      }
      
      setIsEditDialogOpen(false);
      setSelectedMunicipality(null);
      resetEditPasswordForm();
      
      toast({
        title: "Municipality Updated",
        description: hasPasswordChange
          ? "Municipality and login password updated successfully."
          : "Municipality has been updated successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error('Error updating municipality:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update municipality.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (municipalityId: string) => {
    try {
      deleteManagedAccountCredentials(isMockUser(user), municipalityId);
      if (isMockUser(user)) {
        const current = loadMockMunicipalities();
        const updated = current.filter((m) => m.id !== municipalityId);
        saveMockMunicipalities(updated);
        setMunicipalities(updated);
      } else {
        const municipalityRef = doc(db, 'municipalities', municipalityId);
        await deleteDoc(municipalityRef);
        setMunicipalities(municipalities.filter(m => m.id !== municipalityId));
      }
      setIsDeleteDialogOpen(false);
      setSelectedMunicipality(null);
      
      toast({
        title: "Municipality Deleted",
        description: "The municipality has been deleted successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error('Error deleting municipality:', error);
      toast({
        title: "Error",
        description: "Failed to delete municipality.",
        variant: "destructive",
      });
    }
  };

  const filteredMunicipalities = useMemo(() => {
    let filtered = municipalities;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(municipality => 
        municipality.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        municipality.headOfficer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        municipality.officialEmail?.toLowerCase().includes(searchQuery.toLowerCase())
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
  }, [searchQuery, municipalities, statusFilter, sortField, sortDirection]);

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

  const totalPages = Math.ceil(filteredMunicipalities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMunicipalities = filteredMunicipalities.slice(startIndex, startIndex + itemsPerPage);

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
            <h1 className="text-3xl font-bold text-[#1B365D] mb-2">
              {isDohPortal ? 'DOH Region VII Municipalities' : 'Regional Municipalities'}
            </h1>
            <p className="text-gray-600">
              {isDohPortal
                ? 'Manage municipalities under Central Visayas (Region VII)'
                : 'Manage municipalities in your region'}
            </p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-[#1B365D] hover:bg-[#1B365D]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Municipality
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
              <Building className="h-6 w-6 text-[#1B365D]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">All Municipalities</h2>
              <p className="text-sm text-gray-500">{filteredMunicipalities.length} municipalities found</p>
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
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search municipalities..."
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
                    Municipality Name
                    <SortIcon field="name" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  onClick={() => handleSort('headOfficer')}
                >
                  <div className="flex items-center gap-1">
                    Head Officer
                    <SortIcon field="headOfficer" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BHWs</th>
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
              {paginatedMunicipalities.map((municipality, index) => (
                <motion.tr
                  key={municipality.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <Building className="h-4 w-4 text-[#1B365D]" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{municipality.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{municipality.headOfficer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span>{municipality.officialEmail}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{municipality.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{municipality.bhws || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(municipality.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedMunicipality(municipality);
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
                          setSelectedMunicipality(municipality);
                          setIsEditDialogOpen(true);
                        }}
                        className="border-gray-600 text-gray-600 hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {municipality.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedMunicipality(municipality);
                            setIsDeactivateDialogOpen(true);
                          }}
                          className="border-gray-500 text-gray-600 hover:bg-gray-50"
                        >
                          Deactivate
                        </Button>
                      )}
                      {municipality.status === 'inactive' && (
                        <Button
                          size="sm"
                          onClick={() => handleToggleMunicipalityActive(municipality.id, true)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Reactivate
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedMunicipality(municipality);
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

        {filteredMunicipalities.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No municipalities found matching your search.
          </div>
        )}

        <div className="px-6 py-4 border-t flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredMunicipalities.length)} of {filteredMunicipalities.length} municipalities
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

      {/* Add Municipality Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Municipality</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Municipality Name</Label>
                <Input
                  id="name"
                  value={newMunicipality.name}
                  onChange={(e) => setNewMunicipality({...newMunicipality, name: e.target.value})}
                  placeholder="Enter municipality name"
                />
              </div>
              <div>
                <Label htmlFor="headOfficer">Head Officer</Label>
                <Input
                  id="headOfficer"
                  value={newMunicipality.headOfficer}
                  onChange={(e) => setNewMunicipality({...newMunicipality, headOfficer: e.target.value})}
                  placeholder="Enter head officer name"
                />
              </div>
              <div>
                <Label htmlFor="officialEmail">Official Email</Label>
                <Input
                  id="officialEmail"
                  type="email"
                  value={newMunicipality.officialEmail}
                  onChange={(e) => setNewMunicipality({...newMunicipality, officialEmail: e.target.value})}
                  placeholder="Enter official email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newMunicipality.phone}
                  onChange={(e) => setNewMunicipality({...newMunicipality, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="username">Login Username</Label>
                <Input
                  id="username"
                  value={newMunicipality.username}
                  onChange={(e) => setNewMunicipality({...newMunicipality, username: e.target.value})}
                  placeholder="Municipal admin username"
                  autoComplete="off"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={newMunicipality.address}
                  onChange={(e) => setNewMunicipality({...newMunicipality, address: e.target.value})}
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
              Manually added municipal admins are auto-approved and can sign in right away. You can deactivate them later if needed.
            </p>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetAddForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleAddMunicipality} className="bg-[#1B365D] hover:bg-[#1B365D]/90">
                Add Municipality
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Municipality Details</DialogTitle>
          </DialogHeader>
          {selectedMunicipality && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Municipality Name</p>
                  <p className="text-sm text-gray-900">{selectedMunicipality.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Head Officer</p>
                  <p className="text-sm text-gray-900">{selectedMunicipality.headOfficer}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Official Email</p>
                  <p className="text-sm text-gray-900">{selectedMunicipality.officialEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Login Username</p>
                  <p className="text-sm text-gray-900">{selectedMunicipality.username || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{selectedMunicipality.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-sm text-gray-900">{selectedMunicipality.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-sm text-gray-900">{getStatusBadge(selectedMunicipality.status)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">BHWs Count</p>
                  <p className="text-sm text-gray-900">{selectedMunicipality.bhws || 0}</p>
                </div>
              </div>
              <div className="flex flex-wrap justify-between gap-2 pt-4 border-t">
                <div className="flex flex-wrap gap-2">
                  {selectedMunicipality.status === 'active' && (
                    <Button
                      variant="outline"
                      className="border-gray-500 text-gray-600 hover:bg-gray-50"
                      onClick={() => setIsDeactivateDialogOpen(true)}
                    >
                      Deactivate
                    </Button>
                  )}
                  {selectedMunicipality.status === 'inactive' && (
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleToggleMunicipalityActive(selectedMunicipality.id, true)}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) resetEditPasswordForm();
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Municipality</DialogTitle>
          </DialogHeader>
          {selectedMunicipality && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Municipality Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedMunicipality.name}
                    onChange={(e) => setSelectedMunicipality({...selectedMunicipality, name: e.target.value})}
                    placeholder="Enter municipality name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-headOfficer">Head Officer</Label>
                  <Input
                    id="edit-headOfficer"
                    value={selectedMunicipality.headOfficer}
                    onChange={(e) => setSelectedMunicipality({...selectedMunicipality, headOfficer: e.target.value})}
                    placeholder="Enter head officer name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-officialEmail">Official Email</Label>
                  <Input
                    id="edit-officialEmail"
                    type="email"
                    value={selectedMunicipality.officialEmail}
                    onChange={(e) => setSelectedMunicipality({...selectedMunicipality, officialEmail: e.target.value})}
                    placeholder="Enter official email"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={selectedMunicipality.phone}
                    onChange={(e) => setSelectedMunicipality({...selectedMunicipality, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-username">Login Username</Label>
                  <Input
                    id="edit-username"
                    value={selectedMunicipality.username || ''}
                    onChange={(e) => setSelectedMunicipality({...selectedMunicipality, username: e.target.value})}
                    placeholder="Municipal admin username"
                    autoComplete="off"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-address">Address</Label>
                  <Textarea
                    id="edit-address"
                    value={selectedMunicipality.address}
                    onChange={(e) => setSelectedMunicipality({...selectedMunicipality, address: e.target.value})}
                    placeholder="Enter address"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={selectedMunicipality.status} onValueChange={(value) => setSelectedMunicipality({...selectedMunicipality, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">Change Login Password (optional)</p>
                <div className="grid grid-cols-1 gap-4">
                  <AccountCredentialsFields
                    password={editPassword}
                    setPassword={setEditPassword}
                    confirmPassword={editConfirmPassword}
                    setConfirmPassword={setEditConfirmPassword}
                    showPassword={showEditPassword}
                    setShowPassword={setShowEditPassword}
                    showConfirmPassword={showEditConfirmPassword}
                    setShowConfirmPassword={setShowEditConfirmPassword}
                    passwordLabel="New Password"
                    confirmLabel="Confirm New Password"
                    showRequirements={editPassword.length > 0}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); resetEditPasswordForm(); }}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateMunicipality} className="bg-[#1B365D] hover:bg-[#1B365D]/90">
                  Update Municipality
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Deactivate Dialog */}
      <AlertDialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Municipality Account</AlertDialogTitle>
            <AlertDialogDescription>
              Deactivate <strong>{selectedMunicipality?.name}</strong>? The municipal admin will not
              be able to sign in until you reactivate the account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedMunicipality &&
                handleToggleMunicipalityActive(selectedMunicipality.id, false)
              }
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
            <AlertDialogTitle>Delete Municipality</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{selectedMunicipality?.name}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDelete(selectedMunicipality?.id)}
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
