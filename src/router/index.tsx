import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import LandingPage from "@/pages/public/LandingPage";
import AboutPage from "@/pages/public/AboutPage";
import PublicMapPage from "@/pages/public/PublicMapPage";
import RegionPage from "@/pages/public/RegionPage";
import PricingPage from "@/pages/public/PricingPage";
import RegisterPage from "@/pages/public/RegisterPage";
import AdminLayout from "@/layouts/admin/AdminLayout";
import BhwLayout from "@/layouts/bhw/BhwLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import BhwDashboard from "@/pages/bhw/BhwDashboard";
import BhwProfile from "@/pages/bhw/BhwProfile";
import BhwSettings from "@/pages/bhw/BhwSettings";
import BhwSentinels from "@/pages/bhw/BhwSentinels";
import BhwReports from "@/pages/bhw/BhwReports";
import BhwMap from "@/pages/bhw/BhwMap";
import BhwObservations from "@/pages/bhw/BhwObservations";
import QRScanner from "@/pages/bhw/QRScanner";
import OutbreakResponse from "@/pages/bhw/OutbreakResponse";
import Announcements from "@/pages/bhw/Announcements";
import Regions from "@/pages/admin/Regions";
import Municipalities from "@/pages/admin/Municipalities";
import BHWs from "@/pages/admin/BHWs";
import Sentinels from "@/pages/admin/Sentinels";
import Map from "@/pages/admin/Map";
import AdminSubscribers from "@/pages/admin/AdminSubscribers";
import { useAuth } from "@/contexts/AuthContext";

export default function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/map" element={<PublicMapPage />} />
      <Route path="/region/:regionId" element={<RegionPage />} />
      <Route path="/signin" element={<div className="pt-20 p-8">Sign In Page</div>} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* BHW Routes */}
      <Route path="/bhw" element={
        <ProtectedRoute requiredRole="bhw">
          <BhwLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<BhwDashboard />} />
        <Route path="profile" element={<BhwProfile />} />
        <Route path="sentinels" element={<BhwSentinels />} />
        <Route path="qr-scanner" element={<QRScanner />} />
        <Route path="observations" element={<BhwObservations />} />
        <Route path="reports" element={<BhwReports />} />
        <Route path="map" element={<BhwMap />} />
        <Route path="outbreak-response" element={<OutbreakResponse />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="settings" element={<BhwSettings />} />
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="regions" element={<Regions />} />
        <Route path="municipalities" element={<Municipalities />} />
        <Route path="barangays" element={<div className="p-8"><h1 className="text-2xl font-bold">Barangays</h1></div>} />
        <Route path="bhws" element={<BHWs />} />
        <Route path="sentinels" element={<Sentinels />} />
        <Route path="observations" element={<div className="p-8"><h1 className="text-2xl font-bold">Observations</h1></div>} />
        <Route path="alerts" element={<div className="p-8"><h1 className="text-2xl font-bold">Alerts</h1></div>} />
        <Route path="subscribers" element={<AdminSubscribers />} />
        <Route path="map" element={<Map />} />
        <Route path="settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Settings</h1></div>} />
      </Route>
      
      {/* Dashboard redirect based on role */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          {user?.role === "admin" ? <Navigate to="/admin/dashboard" replace /> :
           user?.role === "bhw" ? <Navigate to="/bhw/dashboard" replace /> :
           <div className="pt-20 p-8">Dashboard (Protected)</div>}
        </ProtectedRoute>
      } />
    </Routes>
  );
}
