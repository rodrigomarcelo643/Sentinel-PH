import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoadingAnimation from "@/components/LoadingAnimation";
import { useEffect, useRef } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const hasNavigated = useRef(false);
  
  // Reset navigation flag when location changes
  useEffect(() => {
    hasNavigated.current = false;
  }, [location.pathname]);
  
  if (loading) return <LoadingAnimation />;
  
  if (!user && !hasNavigated.current) {
    hasNavigated.current = true;
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole && !hasNavigated.current) {
    hasNavigated.current = true;
    return <Navigate to="/" replace />;
  }
  
  // If user exists or we've already navigated, show children
  if (user) {
    return <>{children}</>;
  }
  
  return null;
}
