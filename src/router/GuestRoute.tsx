import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoadingAnimation from "@/components/LoadingAnimation";
import { getDashboardPathForRole } from "@/lib/authRedirects";

interface GuestRouteProps {
  children: React.ReactNode;
}

/** Auth pages (sign-in, register) — redirect away when already signed in */
export default function GuestRoute({ children }: GuestRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingAnimation />;
  }

  if (user) {
    const role = user.role || user.accountType;
    return <Navigate to={getDashboardPathForRole(role)} replace />;
  }

  return <>{children}</>;
}
