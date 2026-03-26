import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoadingAnimation from "@/components/LoadingAnimation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return <LoadingAnimation />;
  
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role || '')) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
