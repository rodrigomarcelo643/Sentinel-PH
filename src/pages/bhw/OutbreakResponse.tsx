import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  TrendingUp,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  Send,
  Activity,
  Megaphone,
  X,
  Info,
  Siren,
  Package,
  Droplet,
  Upload,
  Trash2,
} from "lucide-react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import {
  generateOutbreakAnnouncement,
  type OutbreakAnnouncementData,
} from "@/services/outbreakAnnouncementService";
import { useNavigate } from "react-router-dom";
import { showAnnouncementCreatedToast } from "@/services/toastService";
import { uploadImage } from "@/services/cloudinaryService";

const ANNOUNCEMENT_TYPES = [
  { value: "health_advisory", label: "Health Advisory", icon: Info },
  { value: "outbreak_alert", label: "Outbreak Alert", icon: Siren },
  {
    value: "medical_supplies",
    label: "Medical Supplies Arriving",
    icon: Package,
  },
  { value: "water_advisory", label: "Water Advisory", icon: Droplet },
  {
    value: "vaccination_drive",
    label: "Vaccination Drive",
    icon: AlertTriangle,
  },
  { value: "other", label: "Other (Specify)", icon: Megaphone },
];

interface OutbreakAlert {
  id: string;
  disease: string;
  location: string;
  severity: "low" | "medium" | "high";
  cases: number;
  residents: string[] | number;
  trend: "increasing" | "stable" | "decreasing";
  detectedAt: any;
  status: "pending" | "ongoing" | "resolved";
  respondedAt?: any;
  respondedBy?: string;
  title?: string;
  riskScore?: number;
  clusters?: number;
  recommendations?: string[];
  analysisData?: any;
}

export default function OutbreakResponse() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<OutbreakAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "pending" | "ongoing" | "resolved"
  >("pending");
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    alertId: string;
    action: "respond" | "resolve" | "delete";
  }>({ show: false, alertId: "", action: "respond" });
  const [announcementDialog, setAnnouncementDialog] = useState<{
    show: boolean;
    data: OutbreakAnnouncementData | null;
    analysisData: any;
  }>({ show: false, data: null, analysisData: null });
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "outbreak_alert",
    customType: "",
    priority: "high" as "low" | "medium" | "high",
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchOutbreakAlerts();
  }, []);

  const fetchOutbreakAlerts = async () => {
    try {
      // Only fetch saved outbreak alerts from pattern analysis
      const alertsRef = collection(db, "outbreakAlerts");
      const alertsSnapshot = await getDocs(alertsRef);

      const savedAlerts = alertsSnapshot.docs.map((doc) => ({
        id: doc.id,
        disease: doc.data().topDiseases?.[0] || "Unknown Disease",
        location: "Multiple Areas",
        severity: doc.data().riskLevel?.toLowerCase() || "medium",
        cases: doc.data().totalReports || 0,
        residents: doc.data().affectedResidents || 0,
        trend: "increasing",
        detectedAt: doc.data().createdAt,
        status: doc.data().status || "pending",
        title: doc.data().title,
        riskScore: doc.data().riskScore,
        clusters: doc.data().clusters,
        recommendations: doc.data().recommendations || [],
        analysisData: doc.data().analysisData,
      }));

      setAlerts(savedAlerts as OutbreakAlert[]);
    } catch (error) {
      console.error("Error fetching outbreak alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (alertId: string) => {
    setConfirmDialog({ show: true, alertId, action: "respond" });
  };

  const handleResolve = async (alertId: string) => {
    setConfirmDialog({ show: true, alertId, action: "resolve" });
  };

  const handleDelete = async (alertId: string) => {
    setConfirmDialog({ show: true, alertId, action: "delete" });
  };

  const confirmAction = async () => {
    try {
      const alertRef = doc(db, "outbreakAlerts", confirmDialog.alertId);
      if (confirmDialog.action === "respond") {
        await updateDoc(alertRef, {
          status: "ongoing",
          respondedAt: serverTimestamp(),
          respondedBy: user?.displayName || "BHW",
        });
      } else if (confirmDialog.action === "resolve") {
        await updateDoc(alertRef, {
          status: "resolved",
          resolvedAt: serverTimestamp(),
        });
      } else if (confirmDialog.action === "delete") {
        await deleteDoc(alertRef);
      }
      setConfirmDialog({ show: false, alertId: "", action: "respond" });
      fetchOutbreakAlerts();
    } catch (error) {
      console.error("Error updating outbreak:", error);
    }
  };

  const handleCreateAnnouncement = (alert: OutbreakAlert) => {
    if (alert.analysisData) {
      const announcementData = generateOutbreakAnnouncement(alert.analysisData);
      setFormData({
        title: announcementData.title,
        message: announcementData.message,
        type: announcementData.type,
        customType: "",
        priority: announcementData.priority,
        imageUrl: "",
      });
      setAnnouncementDialog({
        show: true,
        data: announcementData,
        analysisData: alert.analysisData,
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData({ ...formData, imageUrl: "" });
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

      const finalType =
        formData.type === "other" ? formData.customType : formData.type;

      await addDoc(collection(db, "announcements"), {
        title: formData.title,
        message: formData.message,
        type: finalType,
        priority: formData.priority,
        imageUrl,
        createdAt: serverTimestamp(),
        createdBy: user?.displayName || "BHW",
        sourceType: "outbreak_response",
        analysisData: announcementDialog.analysisData,
      });

      setAnnouncementDialog({ show: false, data: null, analysisData: null });
      setFormData({
        title: "",
        message: "",
        type: "outbreak_alert",
        customType: "",
        priority: "high",
        imageUrl: "",
      });
      setImageFile(null);
      setImagePreview("");
      showAnnouncementCreatedToast(formData.title);
      navigate("/bhw/announcements");
    } catch (error) {
      console.error("Error creating announcement:", error);
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  const filteredAlerts = alerts.filter((a) => a.status === activeTab);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "low":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === "increasing" ? (
      <TrendingUp className="h-4 w-4 text-red-600" />
    ) : (
      <CheckCircle className="h-4 w-4 text-green-600" />
    );
  };

  return (
    <div className="p-2 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="bg-linear-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 rounded-sm p-6 shadow-sm border border-red-100 dark:border-red-800">
          <div className="flex items-center gap-4">
            <div className="bg-linear-to-br from-red-500 to-orange-600 p-3 rounded-sm shadow-sm">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1B365D] dark:text-white mb-1">
                Outbreak Response
              </h1>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Announcement Creation Dialog */}
      <AnimatePresence>
        {announcementDialog.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() =>
              setAnnouncementDialog({
                show: false,
                data: null,
                analysisData: null,
              })
            }
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-sm shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Create Outbreak Announcement
                </h3>
                <button
                  onClick={() =>
                    setAnnouncementDialog({
                      show: false,
                      data: null,
                      analysisData: null,
                    })
                  }
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter announcement title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={8}
                    placeholder="Enter announcement message"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Announcement Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {ANNOUNCEMENT_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, type: type.value })
                          }
                          className={`flex items-center gap-3 p-3 border rounded-sm transition-all ${
                            formData.type === type.value
                              ? "border-[#1B365D] bg-blue-50 dark:bg-blue-900/20 text-[#1B365D] dark:text-blue-400"
                              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 dark:text-white"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-sm font-medium">
                            {type.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {formData.type === "other" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Specify Type
                    </label>
                    <input
                      type="text"
                      value={formData.customType}
                      onChange={(e) =>
                        setFormData({ ...formData, customType: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter custom announcement type"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority Level
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: "low", label: "Low", color: "bg-yellow-500" },
                      {
                        value: "medium",
                        label: "Medium",
                        color: "bg-orange-500",
                      },
                      { value: "high", label: "High", color: "bg-red-500" },
                    ].map((priority) => (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            priority: priority.value as any,
                          })
                        }
                        className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-sm transition-all ${
                          formData.priority === priority.value
                            ? "border-[#1B365D] bg-blue-50 dark:bg-blue-900/20 dark:text-white"
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 dark:text-white"
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${priority.color}`}
                        ></div>
                        <span className="text-sm font-medium">
                          {priority.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Image (Optional)
                  </label>
                  <div className="space-y-3">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-sm border border-gray-300 dark:border-gray-600"
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
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-sm p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="outbreak-image-upload"
                        />
                        <label
                          htmlFor="outbreak-image-upload"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Click to upload image
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            PNG, JPG up to 10MB
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting || uploadingImage}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#1B365D] text-white px-6 py-3 rounded-sm hover:bg-[#152a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting || uploadingImage ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>
                          {uploadingImage
                            ? "Uploading Image..."
                            : "Publishing..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Publish Announcement</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setAnnouncementDialog({
                        show: false,
                        data: null,
                        analysisData: null,
                      })
                    }
                    disabled={submitting}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 dark:text-white rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmDialog.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() =>
              setConfirmDialog({ show: false, alertId: "", action: "respond" })
            }
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-sm shadow-lg max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Confirm Action
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {confirmDialog.action === "respond"
                  ? "Are you sure you want to respond to this outbreak? This will mark it as ongoing."
                  : confirmDialog.action === "resolve"
                    ? "Are you sure you want to mark this outbreak as resolved?"
                    : "Are you sure you want to delete this outbreak alert? This action cannot be undone."}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() =>
                    setConfirmDialog({
                      show: false,
                      alertId: "",
                      action: "respond",
                    })
                  }
                  className="px-4 py-2 border border-gray-300 dark:border-gray-900 cursor-pointer rounded-sm hover:bg-gray-50  dark:hover:bg-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className={`px-4 py-2 text-white rounded-sm cursor-pointer transition-colors ${
                    confirmDialog.action === "respond"
                      ? "bg-[#1B365D] hover:bg-[#152a4a]"
                      : confirmDialog.action === "resolve"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <>
          {/* Summary Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 dark:bg-gray-700 dark:border-gray-700 rounded-sm shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3"></div>
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
                  </div>
                  <Activity className="h-12 w-12 text-gray-200 dark:text-white " />
                </div>
              </div>
            ))}
          </div>

          {/* Tabs Skeleton */}
          <div className="bg-white dark:bg-gray-700 dark:border-gray-700 rounded-sm shadow-sm border border-gray-100 mb-6">
            <div className="flex border-b">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex-1 px-6 py-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-6  dark:bg-gray-700 dark:border-gray-700 rounded-sm shadow-sm border-l-4 border-l-gray-300 animate-pulse"
              >
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4"></div>
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Pending
                  </p>
                  <h3 className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {alerts.filter((a) => a.status === "pending").length}
                  </h3>
                </div>
                <Clock className="h-12 w-12 text-yellow-200 dark:text-yellow-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 dark:border-gray-700 p-6 rounded-sm shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Ongoing
                  </p>
                  <h3 className="text-3xl font-bold text-orange-600">
                    {alerts.filter((a) => a.status === "ongoing").length}
                  </h3>
                </div>
                <AlertTriangle className="h-12 w-12 text-orange-200" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-sm  dark:bg-gray-800 dark:border-gray-700 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-700  mb-1">
                    Resolved
                  </p>
                  <h3 className="text-3xl font-bold text-green-600">
                    {alerts.filter((a) => a.status === "resolved").length}
                  </h3>
                </div>
                <CheckCircle className="h-12 w-12 text-green-200" />
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex-1 min-w-30 px-4 cursor-pointer sm:px-6 py-4 text-sm font-medium transition-all relative ${
                  activeTab === "pending"
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-gray-600 dark:text-white hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white hover:bg-gray-50"
                }`}
              >
                <span className="truncate">
                  Pending ({alerts.filter((a) => a.status === "pending").length}
                  )
                </span>
                {activeTab === "pending" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("ongoing")}
                className={`flex-1 min-w-30 px-4 sm:px-6 cursor-pointer py-4 text-sm font-medium transition-all relative ${
                  activeTab === "ongoing"
                    ? "text-orange-600"
                    : "text-gray-600 hover:text-gray-900 dark:text-white dark:hover:bg-gray-900 hover:bg-gray-50"
                }`}
              >
                <span className="truncate">
                  Ongoing ({alerts.filter((a) => a.status === "ongoing").length}
                  )
                </span>
                {activeTab === "ongoing" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("resolved")}
                className={`flex-1 min-w-30 px-4 cursor-pointer sm:px-6 py-4 text-sm font-medium transition-all relative ${
                  activeTab === "resolved"
                    ? "text-green-600"
                    : "text-gray-600 hover:text-gray-900 dark:hover:bg-gray-900 dark:text-white dark:bg-gray-800 hover:bg-gray-50"
                }`}
              >
                <span className="truncate">
                  Resolved (
                  {alerts.filter((a) => a.status === "resolved").length})
                </span>
                {activeTab === "resolved" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Outbreak Alerts */}
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="bg-white  dark:bg-gray-800 dark:border-gray-700 p-12 rounded-sm shadow-sm border border-gray-100 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No Active Outbreaks Detected
                </h3>
                <p className="text-gray-600 dark:text-white ">
                  The system is monitoring for patterns. All clear for now.
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800  p-4 sm:p-6 rounded-sm shadow-sm border-l-4 ${
                    alert.severity === 'high' ? 'border-l-red-500' :
                    alert.severity === 'medium' ? 'border-l-orange-500' : 'border-l-yellow-500'
                  }"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:items-center sm:gap-3">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white ">
                          {alert.disease}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xsfont-semibold border ${getSeverityColor(alert.severity)}`}
                          >
                            {alert.severity.toUpperCase()}
                          </span>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(alert.trend)}
                            <span className="text-xs text-gray-600 dark:text-white ">
                              {alert.trend}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 text-sm text-gray-600  dark:text-white mb-3 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{alert.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>
                            {typeof alert.residents === "number"
                              ? `${alert.residents} residents`
                              : `${alert.cases} cases`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            Detected{" "}
                            {alert.detectedAt
                              ?.toDate?.()
                              ?.toLocaleDateString() || "today"}
                          </span>
                        </div>
                      </div>

                      {/* Enhanced Alert Info */}
                      {alert.title && (
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-sm mb-3">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-white mb-2">
                            {alert.title}
                          </h4>
                          <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                            {alert.riskScore && (
                              <p className="text-xs text-gray-600 dark:text-white">
                                Risk Score: {alert.riskScore.toFixed(1)}/10
                              </p>
                            )}
                            {alert.clusters && (
                              <p className="text-xs text-gray-600 dark:text-white">
                                Clusters Detected: {alert.clusters}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Residents List */}
                      {Array.isArray(alert.residents) &&
                        alert.residents.length > 0 && (
                          <div className="bg-blue-50 p-3 sm:p-4 rounded-sm mb-3">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                              Affected Residents ({alert.residents.length}):
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {alert.residents
                                .slice(0, 10)
                                .map((resident, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-white text-gray-700 text-xs rounded-sm border border-gray-200"
                                  >
                                    {resident}
                                  </span>
                                ))}
                              {alert.residents.length > 10 && (
                                <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-sm font-medium">
                                  +{alert.residents.length - 10} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-row gap-2 lg:flex-col lg:ml-4">
                      {alert.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleRespond(alert.id)}
                            className="flex items-center justify-center gap-2 bg-[#1B365D] text-white px-3 sm:px-4 py-2 rounded-sm hover:bg-[#152a4a] transition-colors text-sm"
                          >
                            <Send className="h-4 w-4" />
                            <span className="hidden sm:inline">Respond</span>
                          </button>
                          <button
                            onClick={() => handleCreateAnnouncement(alert)}
                            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-sm hover:bg-blue-700 transition-colors text-sm"
                          >
                            <Megaphone className="h-4 w-4" />
                            <span className="hidden sm:inline">Announce</span>
                          </button>
                        </>
                      )}
                      {alert.status === "ongoing" && (
                        <>
                          <button
                            onClick={() => handleResolve(alert.id)}
                            className="flex items-center justify-center gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-sm hover:bg-green-700 transition-colors text-sm"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              Mark Resolved
                            </span>
                          </button>
                          <button
                            onClick={() => handleCreateAnnouncement(alert)}
                            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-sm hover:bg-blue-700 transition-colors text-sm"
                          >
                            <Megaphone className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              Update Alert
                            </span>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="flex items-center justify-center gap-2 bg-red-600 text-white px-3 sm:px-4 py-2 rounded-sm hover:bg-red-700 transition-colors text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-white mb-2">
                      Recommended Actions:
                    </h4>
                    {alert.recommendations &&
                    alert.recommendations.length > 0 ? (
                      <ul className="space-y-2">
                        {alert.recommendations
                          .slice(0, 4)
                          .map((recommendation, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm text-gray-600 dark:text-white"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                              <span>{recommendation}</span>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                          <span>
                            Alert local health authorities immediately
                          </span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                          <span>Conduct contact tracing in affected area</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                          <span>Issue health advisory to residents</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                          <span>Monitor for additional cases</span>
                        </li>
                      </ul>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
