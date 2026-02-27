import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import LandingPage from "@/pages/public/LandingPage";
import PricingPage from "@/pages/public/PricingPage";
import RegisterPage from "@/pages/public/RegisterPage";
import AdminLayout from "@/layouts/admin/AdminLayout";
import BhwLayout from "@/layouts/bhw/BhwLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import BhwDashboard from "@/pages/bhw/BhwDashboard";
import BhwSentinels from "@/pages/bhw/BhwSentinels";
import BhwReports from "@/pages/bhw/BhwReports";
import BhwMap from "@/pages/bhw/BhwMap";
import Regions from "@/pages/admin/Regions";
import Municipalities from "@/pages/admin/Municipalities";
import BHWs from "@/pages/admin/BHWs";
import Sentinels from "@/pages/admin/Sentinels";
import Map from "@/pages/admin/Map";

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
        <Route path="reports" element={<BhwReports />} />
        <Route path="map" element={<BhwMap />} />
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
