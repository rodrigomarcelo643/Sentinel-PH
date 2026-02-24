import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Plus, MapPin, Users, Building2, Mail, Phone, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { regions } from '@/data/regions';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TableSkeleton from '@/components/ui/TableSkeleton';

const initialMunicipalities = [
  { id: 1, name: "Manila", region: "NCR", population: "1.8M", barangays: 897, email: "manila@gov.ph", phone: "+63-2-1234-5678", status: "Active" },
  { id: 2, name: "Quezon City", region: "NCR", population: "2.9M", barangays: 142, email: "qc@gov.ph", phone: "+63-2-8888-8888", status: "Active" },
  { id: 3, name: "Makati", region: "NCR", population: "629K", barangays: 33, email: "makati@gov.ph", phone: "+63-2-8899-9999", status: "Active" },
  { id: 4, name: "Pasig", region: "NCR", population: "803K", barangays: 30, email: "pasig@gov.ph", phone: "+63-2-6431-1111", status: "Active" },
  { id: 5, name: "Taguig", region: "NCR", population: "886K", barangays: 38, email: "taguig@gov.ph", phone: "+63-2-8789-3200", status: "Active" },
  { id: 6, name: "Baguio", region: "CAR", population: "366K", barangays: 129, email: "baguio@gov.ph", phone: "+63-74-442-8931", status: "Active" },
  { id: 7, name: "Davao City", region: "Region XI", population: "1.6M", barangays: 182, email: "davao@gov.ph", phone: "+63-82-227-1234", status: "Active" },
  { id: 8, name: "Cebu City", region: "Region VII", population: "964K", barangays: 80, email: "cebu@gov.ph", phone: "+63-32-255-1234", status: "Active" },
];

export default function Municipalities() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const regionFilter = searchParams.get('region');
  
  const [municipalities, setMunicipalities] = useState(initialMunicipalities);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState<any>(null);
  const [newMunicipality, setNewMunicipality] = useState({
    name: '', region: regionFilter || '', population: '', barangays: '', email: '', phone: ''
  });
  const itemsPerPage = 10;

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    if (regionFilter) {
      setSearchQuery('');
      setCurrentPage(1);
    }
  }, [regionFilter]);

  const filteredMunicipalities = useMemo(() => {
    let filtered = municipalities;
    if (regionFilter) {
      filtered = filtered.filter(m => m.region === regionFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(municipality => 
        municipality.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        municipality.region.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [searchQuery, municipalities, regionFilter]);

  const totalPages = Math.ceil(filteredMunicipalities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMunicipalities = filteredMunicipalities.slice(startIndex, startIndex + itemsPerPage);

  const handleAddMunicipality = () => {
    const newId = Math.max(...municipalities.map(m => m.id)) + 1;
    setMunicipalities([...municipalities, { 
      id: newId, 
      ...newMunicipality, 
      status: 'Active' 
    }]);
    setNewMunicipality({ name: '', region: '', population: '', barangays: '', email: '', phone: '' });
    setIsAddDialogOpen(false);
  };

  const handleEditMunicipality = () => {
    setMunicipalities(municipalities.map(m => 
      m.id === selectedMunicipality.id ? selectedMunicipality : m
    ));
    setIsEditDialogOpen(false);
    setSelectedMunicipality(null);
  };

  const handleDeleteMunicipality = () => {
    setMunicipalities(municipalities.filter(m => m.id !== selectedMunicipality.id));
    setIsDeleteDialogOpen(false);
    setSelectedMunicipality(null);
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        {regionFilter && (
          <Button variant="ghost" onClick={() => navigate('/admin/regions')} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Regions
          </Button>
        )}
        <h1 className="text-3xl font-bold text-[#1B365D] mb-2">
          {regionFilter ? `${regionFilter} Municipalities` : 'Municipalities'}
        </h1>
        <p className="text-gray-600">Manage municipality accounts and details</p>
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
              <Building2 className="h-6 w-6 text-[#1B365D]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">All Municipalities</h2>
              <p className="text-sm text-gray-500">{filteredMunicipalities.length} municipalities found</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
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
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#1B365D] hover:bg-[#1B365D]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Municipality
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Municipality</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Municipality Name</Label>
                    <Input
                      id="name"
                      value={newMunicipality.name}
                      onChange={(e) => setNewMunicipality({...newMunicipality, name: e.target.value})}
                      placeholder="Enter municipality name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="region">Region</Label>
                    <Select value={newMunicipality.region} onValueChange={(value) => setNewMunicipality({...newMunicipality, region: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.name} value={region.name}>
                            {region.name} - {region.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="population">Population</Label>
                      <Input
                        id="population"
                        value={newMunicipality.population}
                        onChange={(e) => setNewMunicipality({...newMunicipality, population: e.target.value})}
                        placeholder="e.g., 1.2M"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="barangays">Barangays</Label>
                      <Input
                        id="barangays"
                        value={newMunicipality.barangays}
                        onChange={(e) => setNewMunicipality({...newMunicipality, barangays: e.target.value})}
                        placeholder="Number"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newMunicipality.email}
                      onChange={(e) => setNewMunicipality({...newMunicipality, email: e.target.value})}
                      placeholder="email@gov.ph"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newMunicipality.phone}
                      onChange={(e) => setNewMunicipality({...newMunicipality, phone: e.target.value})}
                      placeholder="+63-XX-XXXX-XXXX"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddMunicipality} className="bg-[#1B365D] hover:bg-[#1B365D]/90">Add Municipality</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <TableSkeleton rows={10} columns={7} />
          ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Municipality</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Population</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barangays</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/bhws?municipality=${municipality.name}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <MapPin className="h-4 w-4 text-[#1B365D]" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{municipality.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{municipality.region}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{municipality.population}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{municipality.barangays}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span>{municipality.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{municipality.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {municipality.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedMunicipality(municipality);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedMunicipality(municipality);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
            {pageNumbers.map(number => (
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Municipality</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Municipality Name</Label>
              <Input
                id="edit-name"
                value={selectedMunicipality?.name || ''}
                onChange={(e) => setSelectedMunicipality({...selectedMunicipality, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-region">Region</Label>
              <Select value={selectedMunicipality?.region || ''} onValueChange={(value) => setSelectedMunicipality({...selectedMunicipality, region: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.name} value={region.name}>
                      {region.name} - {region.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-population">Population</Label>
                <Input
                  id="edit-population"
                  value={selectedMunicipality?.population || ''}
                  onChange={(e) => setSelectedMunicipality({...selectedMunicipality, population: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-barangays">Barangays</Label>
                <Input
                  id="edit-barangays"
                  value={selectedMunicipality?.barangays || ''}
                  onChange={(e) => setSelectedMunicipality({...selectedMunicipality, barangays: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={selectedMunicipality?.email || ''}
                onChange={(e) => setSelectedMunicipality({...selectedMunicipality, email: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={selectedMunicipality?.phone || ''}
                onChange={(e) => setSelectedMunicipality({...selectedMunicipality, phone: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditMunicipality} className="bg-[#1B365D] hover:bg-[#1B365D]/90">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{selectedMunicipality?.name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMunicipality} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
