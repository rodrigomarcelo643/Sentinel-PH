import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";
import LoadingAnimation from "@/components/LoadingAnimation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
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
