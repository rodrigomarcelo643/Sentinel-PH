import { motion } from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
    FileText, 
  ChevronUp,
  ChevronDown,
  Building2,
  CreditCard,
  MapPin,
  Calendar,
  X
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { collection, getDocs, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Registration {
  id: string;
  uid: string;
  officeName: string;
  fullName: string;
  accountType: string;
  subscription: string;
  region: string;
  municipality: string;
  barangay: string;
  address: string;
  email: string;
  phone: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  amount?: string;
  documentUrls?: string[];
  numberOfMunicipalities?: number;
  createdAt: any;
  paymentDetails?: {
    amount: string;
    method: string;
    reference: string;
    timestamp: string;
  };
}

export default function AdminSubscribers() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [imageModal, setImageModal] = useState<{ open: boolean; url: string }>({ open: false, url: "" });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const regRef = collection(db, "registrations");
      const snapshot = await getDocs(regRef);

      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          // Ensure fallback for missing fields
          officeName: d.officeName || "N/A",
          fullName: d.fullName || "N/A",
          status: d.status || "pending",
          paymentStatus: d.paymentStatus || "pending",
        } as Registration;
      });

      setRegistrations(data);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reg: Registration) => {
    if (!reg) return;
    try {
      const batch = writeBatch(db);
      
      // Update registration status
      const regRef = doc(db, "registrations", reg.id);
      batch.update(regRef, { status: "approved" });

      // Update user status
      const userRef = doc(db, "users", reg.uid);
      batch.update(userRef, { status: "active", role: reg.accountType === 'regional' ? 'regional_admin' : 'municipal_admin' });

      await batch.commit();

      setRegistrations(
        registrations.map((r) => (r.id === reg.id ? { ...r, status: "approved" } : r))
      );
      setIsApproveDialogOpen(false);
      setSelectedReg(null);
    } catch (error) {
      console.error("Error approving registration:", error);
    }
  };

  const handleReject = async (reg: Registration) => {
    if (!reg) return;
    try {
      const batch = writeBatch(db);
      
      const regRef = doc(db, "registrations", reg.id);
      batch.update(regRef, { status: "rejected" });

      const userRef = doc(db, "users", reg.uid);
      batch.update(userRef, { status: "rejected" });

      await batch.commit();

      setRegistrations(
        registrations.map((r) => (r.id === reg.id ? { ...r, status: "rejected" } : r))
      );
      setIsRejectDialogOpen(false);
      setSelectedReg(null);
    } catch (error) {
      console.error("Error rejecting registration:", error);
    }
  };

  const filteredRegistrations = useMemo(() => {
    let filtered = registrations;
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.officeName.toLowerCase().includes(lowerQ) ||
          r.fullName.toLowerCase().includes(lowerQ) ||
          r.municipality.toLowerCase().includes(lowerQ) ||
          r.subscription.toLowerCase().includes(lowerQ)
      );
    }

    if (sortField) {
      filtered.sort((a, b) => {
        const aVal = (a as any)[sortField];
        const bVal = (b as any)[sortField];
        
        // Handle timestamps/dates
        if (sortField === 'createdAt' && aVal?.seconds && bVal?.seconds) {
           return sortDirection === "asc" ? aVal.seconds - bVal.seconds : bVal.seconds - aVal.seconds;
        }
        
        // String comparison
        const aStr = String(aVal || "").toLowerCase();
        const bStr = String(bVal || "").toLowerCase();
        
        if (sortDirection === "asc") {
          return aStr > bStr ? 1 : -1;
        } else {
          return aStr < bStr ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [searchQuery, registrations, statusFilter, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRegs = filteredRegistrations.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>;
      case "pending":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case "rejected":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return (
        <div className="flex flex-col">
          <ChevronUp className="h-3 w-3 text-gray-300 -mb-0.5" />
          <ChevronDown className="h-3 w-3 text-gray-300 -mt-0.5" />
        </div>
      );
    }
    return sortDirection === "asc" ? (
      <div className="flex flex-col">
        <ChevronUp className="h-3 w-3 text-[#1B365D] -mb-0.5" />
        <ChevronDown className="h-3 w-3 text-gray-300 -mt-0.5" />
      </div>
    ) : (
      <div className="flex flex-col">
        <ChevronUp className="h-3 w-3 text-gray-300 -mb-0.5" />
        <ChevronDown className="h-3 w-3 text-[#1B365D] -mt-0.5" />
      </div>
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
        <h1 className="text-3xl font-bold text-[#1B365D] dark:text-white mb-2">
          Subscribers
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage subscription requests and organization accounts
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <div className="p-4 border-b dark:border-gray-700 flex flex-col gap-4 items-start justify-between lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
              <Building2 className="h-6 w-6 text-[#1B365D] dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                All Subscriptions
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filteredRegistrations.length} records found
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full lg:flex-row lg:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-45">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search office, name..."
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
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort("officeName")}>
                  <div className="flex items-center gap-1">Organization <SortIcon field="officeName" /></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort("subscription")}>
                  <div className="flex items-center gap-1">Plan <SortIcon field="subscription" /></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort("status")}>
                  <div className="flex items-center gap-1">Status <SortIcon field="status" /></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {paginatedRegs.map((reg, index) => (
                <motion.tr
                  key={reg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={reg.documentUrls?.[0]} />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {reg.officeName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{reg.officeName}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{reg.fullName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium capitalize text-gray-900 dark:text-white">{reg.subscription}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{reg.accountType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-900 dark:text-white">{reg.municipality}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{reg.region}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`font-medium ${reg.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {reg.paymentStatus?.toUpperCase() || 'PENDING'}
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-600 dark:text-gray-300 capitalize">{reg.paymentMethod}</span>
                      </div>
                      {reg.paymentDetails?.amount && (
                         <span className="text-xs font-mono text-gray-500">₱{parseFloat(reg.paymentDetails.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(reg.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedReg(reg);
                          setIsViewDialogOpen(true);
                        }}
                        className="border-[#1B365D] text-[#1B365D] hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950/30 h-8 px-2 text-xs"
                      >
                        View
                      </Button>
                      {reg.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedReg(reg);
                              setIsApproveDialogOpen(true);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white h-8 px-2 text-xs"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedReg(reg);
                              setIsRejectDialogOpen(true);
                            }}
                            className="h-8 px-2 text-xs"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls - Reused from BhwSentinels */}
        <div className="px-4 lg:px-6 py-4 border-t dark:border-gray-700 flex flex-col gap-4 items-center justify-between lg:flex-row">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRegistrations.length)} of {filteredRegistrations.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-7xl! max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
          </DialogHeader>
          {selectedReg && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="font-semibold text-[#1B365D] mb-3 flex items-center gap-2"><Building2 className="h-4 w-4"/> Organization Info</h3>
                  <div className="grid grid-cols-1 gap-y-3 text-sm">
                    <div className="grid grid-cols-3"><span className="text-gray-500 col-span-1">Office Name</span><span className="font-medium col-span-2">{selectedReg.officeName}</span></div>
                    <div className="grid grid-cols-3"><span className="text-gray-500 col-span-1">Head Officer</span><span className="font-medium col-span-2">{selectedReg.fullName}</span></div>
                    <div className="grid grid-cols-3"><span className="text-gray-500 col-span-1">Email</span><span className="font-medium break-all col-span-2">{selectedReg.email}</span></div>
                    <div className="grid grid-cols-3"><span className="text-gray-500 col-span-1">Phone</span><span className="font-medium col-span-2">{selectedReg.phone}</span></div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="font-semibold text-[#1B365D] mb-3 flex items-center gap-2"><MapPin className="h-4 w-4"/> Location</h3>
                  <div className="grid grid-cols-1 gap-y-3 text-sm">
                    <div className="grid grid-cols-3"><span className="text-gray-500 col-span-1">Region</span><span className="font-medium col-span-2">{selectedReg.region}</span></div>
                    <div className="grid grid-cols-3"><span className="text-gray-500 col-span-1">Municipality</span><span className="font-medium col-span-2">{selectedReg.municipality}</span></div>
                    <div className="grid grid-cols-3"><span className="text-gray-500 col-span-1">Barangay</span><span className="font-medium col-span-2">{selectedReg.barangay}</span></div>
                    <div className="grid grid-cols-3"><span className="text-gray-500 col-span-1">Address</span><span className="font-medium col-span-2">{selectedReg.address}</span></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="font-semibold text-[#1B365D] mb-3 flex items-center gap-2"><CreditCard className="h-4 w-4"/> Plan & Payment</h3>
                  <div className="grid grid-cols-1 gap-y-3 text-sm">
                    <div className="grid grid-cols-2">
                      <div><span className="text-gray-500 block">Plan</span><span className="font-medium capitalize">{selectedReg.subscription}</span></div>
                      <div><span className="text-gray-500 block">Type</span><span className="font-medium capitalize">{selectedReg.accountType}</span></div>
                    </div>
                    {selectedReg.accountType === 'regional' && selectedReg.numberOfMunicipalities && (
                      <div className="grid grid-cols-2">
                        <div><span className="text-gray-500 block">Municipalities</span><span className="font-medium">{selectedReg.numberOfMunicipalities}</span></div>
                        <div><span className="text-gray-500 block">Rate</span><span className="font-medium">₱1,000 / municipality</span></div>
                      </div>
                    )}
                    <div className="grid grid-cols-2">
                      <div><span className="text-gray-500 block">Status</span><span className={`font-medium capitalize ${selectedReg.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{selectedReg.paymentStatus}</span></div>
                      <div><span className="text-gray-500 block">Amount</span><span className="font-medium">₱{parseFloat(selectedReg.paymentDetails?.amount || "0").toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                    </div>
                    <div><span className="text-gray-500 block">Reference</span><span className="font-medium text-xs font-mono">{selectedReg.paymentDetails?.reference || 'N/A'}</span></div>
                    
                    <div className="mt-2 pt-3 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-gray-500">Payment Method</span>
                        <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{selectedReg.paymentMethod?.replace('_', ' ')}</span>
                            {selectedReg.paymentMethod?.includes('maya') && <img src="/pay_maya_logo.jpg" alt="Maya" className="h-6 w-auto object-contain" />}
                            {selectedReg.paymentMethod === 'gcash' && <img src="/gcash_logo.png" alt="GCash" className="h-6 w-auto object-contain" />}
                        </div>
                    </div>
                  </div>
                </div>

                <div>
                   <h3 className="font-semibold text-[#1B365D] mb-3 flex items-center gap-2"><FileText className="h-4 w-4"/> Documents</h3>
                   {selectedReg.documentUrls && selectedReg.documentUrls.length > 0 ? (
                     <div className="grid grid-cols-2 gap-3">
                        {selectedReg.documentUrls.map((url, idx) => (
                          <div 
                            key={idx} 
                            className="relative group cursor-pointer border rounded-lg overflow-hidden bg-gray-100 aspect-video hover:ring-2 hover:ring-[#1B365D] transition-all"
                            onClick={() => setImageModal({ open: true, url })}
                          >
                            <img src={url} alt={`Document ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-xs px-2 py-1 rounded shadow-sm font-medium transition-opacity">View</span>
                            </div>
                          </div>
                        ))}
                     </div>
                   ) : (
                     <p className="text-sm text-gray-500 italic">No documents uploaded.</p>
                   )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve <strong>{selectedReg?.officeName}</strong>? This will activate their account and grant access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedReg && handleApprove(selectedReg)} className="bg-green-600 hover:bg-green-700">Approve</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this subscription? This action cannot be undone easily.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedReg && handleReject(selectedReg)} className="bg-red-600 hover:bg-red-700">Reject</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Viewer Dialog */}
      <Dialog open={imageModal.open} onOpenChange={(open) => setImageModal({ ...imageModal, open })}>
        <DialogContent className="max-w-4xl w-auto p-0 bg-transparent border-none shadow-none flex items-center justify-center">
             <div className="relative">
                <img src={imageModal.url} alt="Document View" className="max-h-[85vh] max-w-[90vw] object-contain rounded-md shadow-2xl" />
                <button onClick={() => setImageModal({ ...imageModal, open: false })} className="absolute -top-4 -right-4 bg-white text-gray-800 rounded-full p-1 shadow-lg hover:bg-gray-100"><X className="h-5 w-5" /></button>
             </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}