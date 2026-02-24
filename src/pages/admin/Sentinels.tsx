import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Plus, Shield, MapPin, Mail, Phone, Edit, Trash2, ArrowLeft, Award } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TableSkeleton from '@/components/ui/TableSkeleton';

const initialSentinels = [
  { id: 1, name: "Carlos Mendoza", bhwId: 1, barangay: "Ermita", role: "Sari-Sari Store Owner", email: "carlos@sentinel.ph", phone: "+63-917-111-2222", trustScore: 85, status: "Active" },
  { id: 2, name: "Linda Ramos", bhwId: 1, barangay: "Ermita", role: "Tricycle Driver", email: "linda@sentinel.ph", phone: "+63-917-222-3333", trustScore: 92, status: "Active" },
  { id: 3, name: "Roberto Cruz", bhwId: 2, barangay: "Malate", role: "Market Vendor", email: "roberto@sentinel.ph", phone: "+63-917-333-4444", trustScore: 78, status: "Active" },
  { id: 4, name: "Elena Torres", bhwId: 3, barangay: "Bagong Pag-asa", role: "Barangay Tanod", email: "elena@sentinel.ph", phone: "+63-917-444-5555", trustScore: 88, status: "Active" },
  { id: 5, name: "Miguel Santos", bhwId: 4, barangay: "Poblacion", role: "Religious Leader", email: "miguel@sentinel.ph", phone: "+63-917-555-6666", trustScore: 95, status: "Active" },
  { id: 6, name: "Jose Tan", bhwId: 6, barangay: "Lahug", role: "Sari-Sari Store Owner", email: "jose@sentinel.ph", phone: "+63-32-111-2222", trustScore: 87, status: "Active" },
  { id: 7, name: "Maria Lim", bhwId: 6, barangay: "Lahug", role: "Market Vendor", email: "maria.lim@sentinel.ph", phone: "+63-32-222-3333", trustScore: 91, status: "Active" },
  { id: 8, name: "Pedro Uy", bhwId: 6, barangay: "Lahug", role: "Tricycle Driver", email: "pedro@sentinel.ph", phone: "+63-32-333-4444", trustScore: 83, status: "Active" },
  { id: 9, name: "Rosa Fernandez", bhwId: 7, barangay: "Guadalupe", role: "Barangay Tanod", email: "rosa@sentinel.ph", phone: "+63-32-444-5555", trustScore: 89, status: "Active" },
  { id: 10, name: "Antonio Garcia", bhwId: 7, barangay: "Guadalupe", role: "Religious Leader", email: "antonio@sentinel.ph", phone: "+63-32-555-6666", trustScore: 94, status: "Active" },
  { id: 11, name: "Carmen Diaz", bhwId: 7, barangay: "Guadalupe", role: "Sari-Sari Store Owner", email: "carmen@sentinel.ph", phone: "+63-32-666-7777", trustScore: 86, status: "Active" },
  { id: 12, name: "Ramon Villar", bhwId: 8, barangay: "Mabolo", role: "Market Vendor", email: "ramon@sentinel.ph", phone: "+63-32-777-8888", trustScore: 90, status: "Active" },
  { id: 13, name: "Luz Mendoza", bhwId: 8, barangay: "Mabolo", role: "Tricycle Driver", email: "luz@sentinel.ph", phone: "+63-32-888-9999", trustScore: 85, status: "Active" },
  { id: 14, name: "Eduardo Ramos", bhwId: 8, barangay: "Mabolo", role: "Barangay Tanod", email: "eduardo@sentinel.ph", phone: "+63-32-999-0000", trustScore: 88, status: "Active" },
];

export default function Sentinels() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bhwFilter = searchParams.get('bhw');
  const barangayFilter = searchParams.get('barangay');
  
  const [sentinels, setSentinels] = useState(initialSentinels);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSentinel, setSelectedSentinel] = useState<any>(null);
  const [newSentinel, setNewSentinel] = useState({
    name: '', bhwId: bhwFilter || '', barangay: barangayFilter || '', role: '', email: '', phone: ''
  });
  const itemsPerPage = 10;

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    if (bhwFilter) {
      setSearchQuery('');
      setCurrentPage(1);
    }
  }, [bhwFilter]);

  const filteredSentinels = useMemo(() => {
    let filtered = sentinels;
    if (bhwFilter) {
      filtered = filtered.filter(s => s.bhwId === parseInt(bhwFilter));
    }
    if (searchQuery) {
      filtered = filtered.filter(sentinel => 
        sentinel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sentinel.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sentinel.barangay.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [searchQuery, sentinels, bhwFilter]);

  const totalPages = Math.ceil(filteredSentinels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSentinels = filteredSentinels.slice(startIndex, startIndex + itemsPerPage);

  const handleAddSentinel = () => {
    const newId = Math.max(...sentinels.map(s => s.id)) + 1;
    setSentinels([...sentinels, { 
      id: newId, 
      ...newSentinel, 
      bhwId: parseInt(newSentinel.bhwId),
      trustScore: 50, 
      status: 'Active' 
    }]);
    setNewSentinel({ name: '', bhwId: bhwFilter || '', barangay: barangayFilter || '', role: '', email: '', phone: '' });
    setIsAddDialogOpen(false);
  };

  const handleEditSentinel = () => {
    setSentinels(sentinels.map(s => s.id === selectedSentinel.id ? selectedSentinel : s));
    setIsEditDialogOpen(false);
    setSelectedSentinel(null);
  };

  const handleDeleteSentinel = () => {
    setSentinels(sentinels.filter(s => s.id !== selectedSentinel.id));
    setIsDeleteDialogOpen(false);
    setSelectedSentinel(null);
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        {bhwFilter && (
          <Button variant="ghost" onClick={() => navigate('/admin/bhws')} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to BHWs
          </Button>
        )}
        <h1 className="text-3xl font-bold text-[#1B365D] mb-2">
          {barangayFilter ? `${barangayFilter} Sentinels` : 'Community Sentinels'}
        </h1>
        <p className="text-gray-600">Manage sentinel accounts and trust scores</p>
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
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#1B365D] hover:bg-[#1B365D]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sentinel
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Sentinel</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newSentinel.name}
                      onChange={(e) => setNewSentinel({...newSentinel, name: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={newSentinel.role}
                      onChange={(e) => setNewSentinel({...newSentinel, role: e.target.value})}
                      placeholder="e.g., Sari-Sari Store Owner"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="barangay">Barangay</Label>
                    <Input
                      id="barangay"
                      value={newSentinel.barangay}
                      onChange={(e) => setNewSentinel({...newSentinel, barangay: e.target.value})}
                      placeholder="Barangay"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newSentinel.email}
                      onChange={(e) => setNewSentinel({...newSentinel, email: e.target.value})}
                      placeholder="email@sentinel.ph"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newSentinel.phone}
                      onChange={(e) => setNewSentinel({...newSentinel, phone: e.target.value})}
                      placeholder="+63-XXX-XXX-XXXX"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddSentinel} className="bg-[#1B365D] hover:bg-[#1B365D]/90">Add Sentinel</Button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barangay</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trust Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
                    <span className="text-sm text-gray-600">{sentinel.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{sentinel.barangay}</span>
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
                      <Award className="h-4 w-4 text-gray-400" />
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTrustScoreColor(sentinel.trustScore)}`}>
                        {sentinel.trustScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {sentinel.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSentinel(sentinel);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSentinel(sentinel);
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Sentinel</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={selectedSentinel?.name || ''}
                onChange={(e) => setSelectedSentinel({...selectedSentinel, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Input
                id="edit-role"
                value={selectedSentinel?.role || ''}
                onChange={(e) => setSelectedSentinel({...selectedSentinel, role: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-barangay">Barangay</Label>
              <Input
                id="edit-barangay"
                value={selectedSentinel?.barangay || ''}
                onChange={(e) => setSelectedSentinel({...selectedSentinel, barangay: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={selectedSentinel?.email || ''}
                onChange={(e) => setSelectedSentinel({...selectedSentinel, email: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={selectedSentinel?.phone || ''}
                onChange={(e) => setSelectedSentinel({...selectedSentinel, phone: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSentinel} className="bg-[#1B365D] hover:bg-[#1B365D]/90">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{selectedSentinel?.name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSentinel} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
