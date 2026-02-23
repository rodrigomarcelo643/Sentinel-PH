import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoadingAnimation from "@/components/LoadingAnimation";
import LandingPage from "@/pages/public/LandingPage";
import PricingPage from "@/pages/public/PricingPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingAnimation />;
  if (!user) return <Navigate to="/" replace />;
  
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
      <Route
        path="/register"
        element={<div className="pt-20 p-8">Register Page</div>}
      />
      
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
