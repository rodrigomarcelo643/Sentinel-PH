import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, Edit, Save, X, User, Mail, Phone, MapPin, Calendar, Building } from "lucide-react";
import { uploadImage } from "@/services/cloudinaryService";

// Skeleton Loader Component
const SkeletonLoader = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto p-6">
    {/* Header Skeleton */}
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-6">
        <SkeletonLoader className="w-24 h-24 rounded-full" />
        <div className="flex-1">
          <SkeletonLoader className="h-8 w-64 mb-2" />
          <SkeletonLoader className="h-4 w-32 mb-1" />
          <SkeletonLoader className="h-4 w-48" />
        </div>
        <SkeletonLoader className="h-10 w-24" />
      </div>
    </div>
    
    {/* Content Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
          <SkeletonLoader className="h-6 w-40 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((j) => (
              <div key={j}>
                <SkeletonLoader className="h-4 w-24 mb-2" />
                <SkeletonLoader className="h-6 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

interface BHWProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  officeName: string;
  headOfficer: string;
  officialEmail: string;
  address: string;
  municipality: string;
  region: string;
  role: string;
  profilePicture?: string;
  createdAt: any;
  status: string;
  accountType: string;
  subscription: string;
  subscriptionStatus: string;
  estimatedPopulation: string;
  paymentMethod: string;
  documentUrls: string[];
}

export default function BhwProfile() {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<BHWProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (!user?.uid) return;
      
      // Check registrations collection first (where BHW data is stored)
      const registrationsRef = collection(db, "registrations");
      const q = query(registrationsRef, where("uid", "==", user.uid));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setProfile({ 
          uid: user.uid, 
          ...data,
          profilePicture: data.profilePicture || data.documentUrls?.[0] || ''
        } as BHWProfile);
      } else {
        // Fallback: check users collection
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile({ uid: user.uid, ...docSnap.data() } as BHWProfile);
        } else {
          // Create default profile from auth data
          const defaultProfile: BHWProfile = {
            uid: user.uid,
            fullName: user.displayName || '',
            email: user.email || '',
            phone: '',
            officeName: '',
            headOfficer: '',
            officialEmail: user.email || '',
            address: '',
            municipality: '',
            region: '',
            role: 'bhw',
            status: 'pending',
            accountType: 'bhw',
            subscription: 'barangay',
            subscriptionStatus: 'pending',
            estimatedPopulation: '',
            paymentMethod: '',
            documentUrls: [],
            createdAt: new Date()
          };
          setProfile(defaultProfile);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile || !user?.uid) return;
    
    setSaving(true);
    try {
      // Update in registrations collection
      const registrationsRef = collection(db, "registrations");
      const q = query(registrationsRef, where("uid", "==", user.uid));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docRef = doc(db, "registrations", snapshot.docs[0].id);
        await updateDoc(docRef, {
          fullName: profile.fullName,
          phone: profile.phone,
          officeName: profile.officeName,
          headOfficer: profile.headOfficer,
          officialEmail: profile.officialEmail,
          address: profile.address,
          municipality: profile.municipality,
          region: profile.region,
          estimatedPopulation: profile.estimatedPopulation,
        });
      }

      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.uid) return;

    setUploadingAvatar(true);
    try {
      const uploadedUrl = await uploadImage(file);

      // Update in registrations collection
      const registrationsRef = collection(db, "registrations");
      const q = query(registrationsRef, where("uid", "==", user.uid));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docRef = doc(db, "registrations", snapshot.docs[0].id);
        await updateDoc(docRef, {
          profilePicture: uploadedUrl,
        });
      }

      setProfile(prev => prev ? { ...prev, profilePicture: uploadedUrl } : null);
      
      // Update user context to reflect changes in layout
      updateUserProfile({ profilePicture: uploadedUrl });
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully.",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-10xl mx-auto p-2">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                {profile.profilePicture ? (
                  <img 
                    src={profile.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 bg-gray-800 rounded-full p-2 cursor-pointer hover:bg-gray-700 transition-colors shadow-lg">
                <Camera className="h-4 w-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </label>
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.fullName}
              </h1>
              <p className="text-gray-600 font-medium">{profile.accountType?.toUpperCase()}</p>
              <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {profile.address}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <User className="h-5 w-5 text-gray-700" />
            </div>
            Personal Information
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                />
              ) : (
                <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-lg">{profile.fullName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Office Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.officeName || ""}
                  onChange={(e) => setProfile({ ...profile, officeName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                  placeholder="Enter office name"
                />
              ) : (
                <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-lg">{profile.officeName || "Not specified"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Head Officer</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.headOfficer || ""}
                  onChange={(e) => setProfile({ ...profile, headOfficer: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                  placeholder="Enter head officer name"
                />
              ) : (
                <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-lg">{profile.headOfficer || "Not specified"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Phone className="h-5 w-5 text-gray-700" />
            </div>
            Contact Information
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Email</label>
              <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-lg">
                <Mail className="h-4 w-4 text-gray-500" />
                <p className="text-gray-900">{profile.email}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Official Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={profile.officialEmail || ""}
                  onChange={(e) => setProfile({ ...profile, officialEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                  placeholder="Enter official email"
                />
              ) : (
                <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <p className="text-gray-900">{profile.officialEmail || "Not specified"}</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                  placeholder="Enter phone number"
                />
              ) : (
                <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-lg">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <p className="text-gray-900">{profile.phone || "Not specified"}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <MapPin className="h-5 w-5 text-gray-700" />
            </div>
            Location Details
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Complete Address</label>
              {isEditing ? (
                <textarea
                  value={profile.address || ""}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all resize-none"
                  rows={3}
                  placeholder="Enter complete address"
                />
              ) : (
                <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-lg min-h-[80px] flex items-start">{profile.address || "Not specified"}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Municipality</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.municipality || ""}
                    onChange={(e) => setProfile({ ...profile, municipality: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                    placeholder="Enter municipality"
                  />
                ) : (
                  <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-lg">{profile.municipality || "Not specified"}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.region || ""}
                    onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                    placeholder="Enter region"
                  />
                ) : (
                  <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-lg">{profile.region || "Not specified"}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Building className="h-5 w-5 text-gray-700" />
            </div>
            Professional Details
          </h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                <div className="py-3 px-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-medium capitalize">{profile.accountType || "BHW"}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Plan</label>
                <div className="py-3 px-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-medium capitalize">{profile.subscription || "Not specified"}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    profile.status === 'approved' ? 'bg-green-500' : 
                    profile.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <p className="text-gray-900 font-medium capitalize">{profile.status || "Unknown"}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Status</label>
                <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    profile.subscriptionStatus === 'active' ? 'bg-green-500' : 
                    profile.subscriptionStatus === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <p className="text-gray-900 font-medium capitalize">{profile.subscriptionStatus || "Unknown"}</p>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Population</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.estimatedPopulation || ""}
                  onChange={(e) => setProfile({ ...profile, estimatedPopulation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                  placeholder="Enter estimated population"
                />
              ) : (
                <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-lg">{profile.estimatedPopulation || "Not specified"}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Joined</label>
              <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-500" />
                <p className="text-gray-900">
                  {profile.createdAt?.toDate?.()?.toLocaleDateString() || "Not available"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}