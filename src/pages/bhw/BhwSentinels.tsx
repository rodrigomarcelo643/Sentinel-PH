import { motion } from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  Mail,
  Phone,
  ChevronUp,
  ChevronDown,
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
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { type Sentinel } from "@/@types";

export default function BhwSentinels() {
  const { user } = useAuth();
  const [sentinels, setSentinels] = useState<Sentinel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSentinel, setSelectedSentinel] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSentinels();
  }, [user]);

  const fetchSentinels = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);

      const sentinelsData = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            fullName: `${data.firstName} ${data.middleInitial ? data.middleInitial + " " : ""}${data.lastName}`,
            firstName: data.firstName,
            lastName: data.lastName,
            middleInitial: data.middleInitial,
            communityRole: data.communityRole,
            address: data.address,
            email: data.email,
            contactNumber: data.contactNumber,
            status: data.status,
            documents: data.documents,
            uid: data.uid,
            createdAt: data.createdAt,
          };
        })
        .filter((sentinel) => sentinel.communityRole); // Filter out non-sentinels

      setSentinels(sentinelsData);
    } catch (error) {
      console.error("Error fetching sentinels:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, { status: "approved" });
      setSentinels(
        sentinels.map((s) => (s.id === id ? { ...s, status: "approved" } : s)),
      );
      setIsApproveDialogOpen(false);
      setSelectedSentinel(null);
    } catch (error) {
      console.error("Error approving sentinel:", error);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, { status: "pending" });
      setSentinels(
        sentinels.map((s) => (s.id === id ? { ...s, status: "pending" } : s)),
      );
      setIsCancelDialogOpen(false);
      setSelectedSentinel(null);
    } catch (error) {
      console.error("Error canceling sentinel:", error);
    }
  };

  const filteredSentinels = useMemo(() => {
    let filtered = sentinels;
    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (sentinel) =>
          sentinel.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sentinel.communityRole
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          sentinel.address.barangay
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    if (sortField) {
      filtered.sort((a, b) => {
        const aVal = (a as any)[sortField] || "";
        const bVal = (b as any)[sortField] || "";
        if (sortDirection === "asc") {
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
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  if (loading) {
    return (
      <div className="p-2 bg-gray-50 dark:bg-gray-800 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-[#1B365D] dark:text-white mb-2">
            Community Sentinels
          </h1>
          <p className="text-gray-600 dark:text-white">
            Manage sentinel registrations and approvals
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100"
        >
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-[#1B365D]" />
              </div>
              <div>
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500dark:text-white uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  dark:text-white uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  dark:text-white uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  dark:text-white uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  dark:text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  dark:text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-800">
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 dar:bg-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700  rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700  rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-20 bg-gray-100 dark:bg-gray-700  rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-3 w-36 bg-gray-200 dark:bg-gray-700  rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-28 bg-gray-100 dark:bg-gray-700  rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700  rounded-full animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700  rounded animate-pulse"></div>
                        <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700  rounded animate-pulse"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    );
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return (
        <div className="flex flex-col">
          <ChevronUp className="h-4 w-4 text-gray-300 -mb-1" />
          <ChevronDown className="h-4 w-4 text-gray-300 -mt-1" />
        </div>
      );
    }
    return sortDirection === "asc" ? (
      <div className="flex flex-col">
        <ChevronUp className="h-4 w-4 text-[#1B365D] -mb-1" />
        <ChevronDown className="h-4 w-4 text-gray-300 -mt-1" />
      </div>
    ) : (
      <div className="flex flex-col">
        <ChevronUp className="h-4 w-4 text-gray-300 -mb-1" />
        <ChevronDown className="h-4 w-4 text-[#1B365D] -mt-1" />
      </div>
    );
  };

  const totalPages = Math.ceil(filteredSentinels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSentinels = filteredSentinels.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Approved
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
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
          Community Sentinels
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage sentinel registrations and approvals
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
              <Shield className="h-6 w-6 text-[#1B365D] dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                All Sentinels
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filteredSentinels.length} sentinels found
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
          <table className="w-full min-w-200">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th
                  className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:bg-gray-900  dark:text-white uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("fullName")}
                >
                  <div className="flex items-center gap-1">
                    Full Name
                    <SortIcon field="fullName" />
                  </div>
                </th>
                <th
                  className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:bg-gray-900  dark:text-white tracking-wider cursor-pointer hover:bg-gray-100 hidden sm:table-cell"
                  onClick={() => handleSort("communityRole")}
                >
                  <div className="flex items-center gap-1">
                    Role
                    <SortIcon field="communityRole" />
                  </div>
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:bg-gray-900  dark:text-white tracking-wider hidden md:table-cell">
                  Address
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:bg-gray-900  dark:text-white tracking-wider hidden lg:table-cell">
                  Contact
                </th>
                <th
                  className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500  dark:bg-gray-900 uppercasedark:bg-gray-900  dark:text-white  tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1 ">
                    Status
                    <SortIcon field="status" />
                  </div>
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:bg-gray-900  dark:text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedSentinels.map((sentinel, index) => (
                <motion.tr
                  key={sentinel.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <Avatar size="default">
                        <AvatarImage
                          src={sentinel.documents?.selfieUrl}
                          alt={sentinel.fullName}
                        />
                        <AvatarFallback className="text-xs">
                          {sentinel.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white block truncate">
                          {sentinel.fullName}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-white block truncate sm:hidden">
                          {sentinel.communityRole}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <span className="text-sm text-gray-600 dark:text-white">
                      {sentinel.communityRole}
                    </span>
                  </td>
                  <td className="px-3 lg:px-6 py-4 hidden md:table-cell">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {sentinel.address.municipality}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-white ">
                        {sentinel.address.barangay}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 hidden lg:table-cell">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="truncate max-w-37.5 dark:text-white">
                          {sentinel.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span className="dark:text-white">{sentinel.contactNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(sentinel.status)}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 lg:gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSentinel(sentinel);
                          setIsViewDialogOpen(true);
                        }}
                        className="border-[#1B365D] text-[#1B365D] dark:text-white dark:hover:bg-gray-900 hover:bg-blue-50 text-xs px-2 py-1"
                      >
                        View
                      </Button>
                      {sentinel.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedSentinel(sentinel);
                            setIsApproveDialogOpen(true);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white dark:text-white dark:hover:bg-gray-900 text-xs px-2 py-1"
                        >
                          Approve
                        </Button>
                      )}
                      {sentinel.status === "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSentinel(sentinel);
                            setIsCancelDialogOpen(true);
                          }}
                          className="border-gray-600 text-gray-600 dark:text-white dark:hover:bg-gray-900 hover:bg-gray-50 text-xs px-2 py-1"
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

        <div className="px-4 lg:px-6 py-4 border-t flex flex-col gap-4 items-center justify-between lg:flex-row">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, filteredSentinels.length)} of{" "}
            {filteredSentinels.length} sentinels
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="text-xs px-2 py-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Prev</span>
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum =
                  currentPage <= 3
                    ? i + 1
                    : currentPage >= totalPages - 2
                      ? totalPages - 4 + i
                      : currentPage - 2 + i;
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
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
        <DialogContent className="sm:max-w-150 max-w-200!">
          <DialogHeader>
            <DialogTitle>Sentinel Registration Details</DialogTitle>
          </DialogHeader>
          {selectedSentinel && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedSentinel.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 ">
                    Community Role
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white ">
                    {selectedSentinel.communityRole}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Region</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedSentinel.address.region}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Municipality
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedSentinel.address.municipality}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Barangay</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedSentinel.address.barangay}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedSentinel.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedSentinel.contactNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {getStatusBadge(selectedSentinel.status)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-500 mb-3">
                  Uploaded Documents
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      Selfie Photo
                    </p>
                    <img
                      src={selectedSentinel.documents?.selfieUrl}
                      alt="Selfie"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      Valid ID ({selectedSentinel.documents?.idType})
                    </p>
                    <img
                      src={selectedSentinel.documents?.validIdUrl}
                      alt="Valid ID"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Sentinel Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve{" "}
              <strong>{selectedSentinel?.fullName}</strong> as a community
              sentinel?
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

      <AlertDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Sentinel Approval</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revert{" "}
              <strong>{selectedSentinel?.fullName}</strong> back to pending
              status?
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
