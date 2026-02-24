import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";
import LoadingAnimation from "@/components/LoadingAnimation";
import LandingPage from "@/pages/public/LandingPage";
import PricingPage from "@/pages/public/PricingPage";
import RegisterPage from "@/pages/public/RegisterPage";
import AdminLayout from "@/layouts/admin/AdminLayout";
import BhwLayout from "@/layouts/bhw/BhwLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import BhwDashboard from "@/pages/bhw/BhwDashboard";
import BhwSentinels from "@/pages/bhw/BhwSentinels";
import Regions from "@/pages/admin/Regions";
import Municipalities from "@/pages/admin/Municipalities";
import BHWs from "@/pages/admin/BHWs";
import Sentinels from "@/pages/admin/Sentinels";
import Map from "@/pages/admin/Map";

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const registrationsRef = collection(db, "registrations");
        const regQuery = query(registrationsRef, where("uid", "==", user.uid));
        const regSnapshot = await getDocs(regQuery);
        
        if (!regSnapshot.empty) {
          setUserRole(regSnapshot.docs[0].data().role);
        } else {
          const adminsRef = collection(db, "admins");
          const adminQuery = query(adminsRef, where("uid", "==", user.uid));
          const adminSnapshot = await getDocs(adminQuery);
          
          if (!adminSnapshot.empty) {
            setUserRole(adminSnapshot.docs[0].data().role || "admin");
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserRole();
  }, [user]);
  
  if (authLoading || loading) return <LoadingAnimation />;
  if (!user) return <Navigate to="/" replace />;
  if (requiredRole && userRole !== requiredRole) return <Navigate to="/" replace />;
  
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/about"
        element={<div className="pt-20 p-8">About Page</div>}
      />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/map" element={<div className="pt-20 p-8">Map Page</div>} />
      <Route
        path="/region/:regionId"
        element={<div className="pt-20 p-8">Region Page</div>}
      />
      <Route
        path="/signin"
        element={<div className="pt-20 p-8">Sign In Page</div>}
      />
      <Route path="/register" element={<RegisterPage />} />
      {/* BHW Routes */}
      <Route
        path="/bhw"
        element={
          <ProtectedRoute requiredRole="bhw">
            <BhwLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<BhwDashboard />} />
        <Route path="sentinels" element={<BhwSentinels />} />
        <Route path="observations" element={<div className="p-8"><h1 className="text-2xl font-bold">Observations</h1></div>} />
        <Route path="reports" element={<div className="p-8"><h1 className="text-2xl font-bold">Reports</h1></div>} />
        <Route path="map" element={<div className="p-8"><h1 className="text-2xl font-bold">Map</h1></div>} />
        <Route path="settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Settings</h1></div>} />
      </Route>
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="regions" element={<Regions />} />
        <Route path="municipalities" element={<Municipalities />} />
        <Route path="barangays" element={<div className="p-8"><h1 className="text-2xl font-bold">Barangays</h1></div>} />
        <Route path="bhws" element={<BHWs />} />
        <Route path="sentinels" element={<Sentinels />} />
        <Route path="observations" element={<div className="p-8"><h1 className="text-2xl font-bold">Observations</h1></div>} />
        <Route path="alerts" element={<div className="p-8"><h1 className="text-2xl font-bold">Alerts</h1></div>} />
        <Route path="subscriptions" element={<div className="p-8"><h1 className="text-2xl font-bold">Subscriptions</h1></div>} />
        <Route path="map" element={<Map />} />
        <Route path="settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Settings</h1></div>} />
      </Route>
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <div className="pt-20 p-8">Dashboard (Protected)</div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
