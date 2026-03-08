import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Plus, Send, AlertCircle, Info, X, ChevronLeft, ChevronRight, Calendar, Package, Siren, Droplet, Edit2, Trash2, Activity, Upload } from 'lucide-react';
import { collection, getDocs, addDoc, serverTimestamp, orderBy, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { uploadImage } from '@/services/cloudinaryService';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  customType?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: any;
  createdBy: string;
  imageUrl?: string;
}

const ANNOUNCEMENT_TYPES = [
  { value: 'health_advisory', label: 'Health Advisory', icon: Info },
  { value: 'outbreak_alert', label: 'Outbreak Alert', icon: Siren },
  { value: 'medical_supplies', label: 'Medical Supplies Arriving', icon: Package },
  { value: 'water_advisory', label: 'Water Advisory', icon: Droplet },
  { value: 'vaccination_drive', label: 'Vaccination Drive', icon: AlertCircle },
  { value: 'other', label: 'Other (Specify)', icon: Megaphone }
];

export default function Announcements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; title: string }>({ show: false, id: '', title: '' });
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'health_advisory',
    customType: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    filterByDate();
  }, [announcements, dateFilter]);

  const fetchAnnouncements = async () => {
    try {
      const announcementsRef = collection(db, 'announcements');
      const q = query(announcementsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Announcement[];
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByDate = () => {
    if (dateFilter === 'all') {
      setFilteredAnnouncements(announcements);
      return;
    }

    const now = new Date();
    const filtered = announcements.filter(announcement => {
      if (!announcement.createdAt) return false;
      const createdDate = announcement.createdAt.toDate();
      
      switch (dateFilter) {
        case 'today':
          return createdDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return createdDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return createdDate >= monthAgo;
        default:
          return true;
      }
    });
    setFilteredAnnouncements(filtered);
    setCurrentPage(1);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, imageUrl: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrl = formData.imageUrl;
      
      // Upload image if selected
      if (imageFile) {
        setUploadingImage(true);
        imageUrl = await uploadImage(imageFile);
      }
      
      const finalType = formData.type === 'other' ? formData.customType : formData.type;
      
      if (editingId) {
        await updateDoc(doc(db, 'announcements', editingId), {
          title: formData.title,
          message: formData.message,
          type: finalType,
          priority: formData.priority,
          imageUrl,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'announcements'), {
          title: formData.title,
          message: formData.message,
          type: finalType,
          priority: formData.priority,
          imageUrl,
          createdAt: serverTimestamp(),
          createdBy: user?.displayName || 'BHW'
        });
      }
      
      setFormData({ title: '', message: '', type: 'health_advisory', customType: '', priority: 'medium', imageUrl: '' });
      setImageFile(null);
      setImagePreview('');
      setEditingId(null);
      setShowModal(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.customType ? 'other' : announcement.type,
      customType: announcement.customType || '',
      priority: announcement.priority,
      imageUrl: announcement.imageUrl || ''
    });
    if (announcement.imageUrl) {
      setImagePreview(announcement.imageUrl);
    }
    setEditingId(announcement.id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'announcements', deleteConfirm.id));
      setDeleteConfirm({ show: false, id: '', title: '' });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ title: '', message: '', type: 'health_advisory', customType: '', priority: 'medium', imageUrl: '' });
    setImageFile(null);
    setImagePreview('');
  };

  const getTypeDisplay = (type: string) => {
    const found = ANNOUNCEMENT_TYPES.find(t => t.value === type);
    return found ? found.label : type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getTypeColor = (type: string) => {
    if (type.includes('outbreak') || type.includes('alert')) return 'bg-red-100 text-red-700 border-red-200';
    if (type.includes('advisory')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (type.includes('supplies') || type.includes('vaccination')) return 'bg-green-100 text-green-700 border-green-200';
    if (type.includes('water')) return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-yellow-500';
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAnnouncements = filteredAnnouncements.slice(startIndex, endIndex);

  return (
    <div className="p-2 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-sm p-4 sm:p-6 shadow-sm border border-blue-100 dark:border-blue-800">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 sm:p-3 rounded-sm shadow-sm">
                <Megaphone className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1B365D] dark:text-white mb-1">Announcements</h1>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Health advisories and important updates for residents</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 bg-[#1B365D] text-white px-3 sm:px-4 py-2 rounded-sm hover:bg-[#152a4a] transition-colors cursor-pointer text-sm sm:text-base w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>New Announcement</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Date Filter */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-2 lg:gap-4">
            <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Date:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Time' },
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' }
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setDateFilter(filter.value as any)}
                className={`px-3 sm:px-4 py-2 rounded-sm text-sm font-medium transition-colors cursor-pointer ${
                  dateFilter === filter.value
                    ? 'bg-[#1B365D] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 lg:ml-auto">
            {filteredAnnouncements.length} announcement{filteredAnnouncements.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-sm shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Announcement' : 'Create New Announcement'}</h3>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-sm transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter announcement title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Enter announcement message"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Announcement Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {ANNOUNCEMENT_TYPES.map(type => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: type.value })}
                          className={`flex items-center gap-3 p-3 border rounded-sm transition-all cursor-pointer ${
                            formData.type === type.value
                              ? 'border-[#1B365D] bg-blue-50 text-[#1B365D]'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-sm font-medium">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {formData.type === 'other' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specify Type</label>
                    <input
                      type="text"
                      value={formData.customType}
                      onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter custom announcement type"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                  <div className="flex gap-3">
                    {[
                      { value: 'low', label: 'Low', color: 'bg-yellow-500' },
                      { value: 'medium', label: 'Medium', color: 'bg-orange-500' },
                      { value: 'high', label: 'High', color: 'bg-red-500' }
                    ].map(priority => (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: priority.value as any })}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-sm transition-all cursor-pointer ${
                          formData.priority === priority.value
                            ? 'border-[#1B365D] bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${priority.color}`}></div>
                        <span className="text-sm font-medium">{priority.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image (Optional)</label>
                  <div className="space-y-3">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-sm border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-sm p-6 text-center hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <Upload className="h-8 w-8 text-gray-400" />
                          <span className="text-sm text-gray-600">Click to upload image</span>
                          <span className="text-xs text-gray-500">PNG, JPG up to 10MB</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting || uploadingImage}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#1B365D] text-white px-6 py-3 rounded-sm hover:bg-[#152a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting || uploadingImage ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{uploadingImage ? 'Uploading Image...' : editingId ? 'Updating...' : 'Publishing...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>{editingId ? 'Update Announcement' : 'Publish Announcement'}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={submitting}
                    className="px-6 py-3 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setDeleteConfirm({ show: false, id: '', title: '' })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-sm shadow-lg max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Announcement</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete <span className="font-semibold">"{deleteConfirm.title}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm({ show: false, id: '', title: '' })}
                  className="px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      {loading ? (
        <>
          {/* Date Filter Skeleton */}
          <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-100 mb-6 animate-pulse">
            <div className="flex items-center gap-4">
              <Activity className="h-5 w-5 text-gray-200" />
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded-sm w-24"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Title', 'Type', 'Priority', 'Date', 'Created By', 'Actions'].map((_, i) => (
                    <th key={i} className="px-6 py-4 text-left">
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                      <div className="h-4 bg-gray-100 rounded w-64"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-gray-200 rounded-sm w-32"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-8 w-8 bg-gray-200 rounded-sm"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded-sm"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="bg-white p-12 rounded-sm shadow-sm border border-gray-100 text-center">
          <Megaphone className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Announcements Found</h3>
          <p className="text-gray-600">
            {dateFilter === 'all' 
              ? 'Create your first announcement to notify residents.'
              : 'No announcements found for the selected date range.'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                      Type
                    </th>
                    <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                      Date
                    </th>
                    <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                      Created By
                    </th>
                    <th className="px-3 lg:px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentAnnouncements.map((announcement, index) => (
                    <motion.tr
                      key={announcement.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-3 lg:px-6 py-4">
                        <div className="flex items-start gap-2 lg:gap-3">
                          {announcement.imageUrl && (
                            <img
                              src={announcement.imageUrl}
                              alt="Announcement"
                              className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-sm border border-gray-200 flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-sm lg:text-base truncate">{announcement.title}</div>
                            <div className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{announcement.message}</div>
                            <div className="sm:hidden mt-2">
                              <span className={`inline-flex px-2 py-1 rounded-sm text-xs font-semibold border ${getTypeColor(announcement.type)}`}>
                                {getTypeDisplay(announcement.type)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 hidden sm:table-cell">
                        <span className={`inline-flex px-3 py-1 rounded-sm text-xs font-semibold border ${getTypeColor(announcement.type)}`}>
                          {getTypeDisplay(announcement.type)}
                        </span>
                      </td>
                      <td className="px-3 lg:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(announcement.priority)}`}></div>
                          <span className="text-sm text-gray-700 capitalize">{announcement.priority}</span>
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 text-sm text-gray-700 hidden md:table-cell">
                        {announcement.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-3 lg:px-6 py-4 text-sm text-gray-700 hidden lg:table-cell">
                        {announcement.createdBy}
                      </td>
                      <td className="px-3 lg:px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 lg:gap-2">
                          <button
                            onClick={() => handleEdit(announcement)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-sm transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ show: true, id: announcement.id, title: announcement.title })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-sm shadow-sm border border-gray-100 mt-4 px-4 lg:px-6 py-4 flex flex-col gap-4 items-center justify-between lg:flex-row">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAnnouncements.length)} of {filteredAnnouncements.length} announcements
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : 
                                  currentPage >= totalPages - 2 ? totalPages - 4 + i :
                                  currentPage - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 sm:px-4 py-2 rounded-sm text-sm font-medium transition-colors cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-[#1B365D] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
