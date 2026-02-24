import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import AuthLoading from "@/components/auth/AuthLoading";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Eye, EyeOff } from "lucide-react";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      let loginEmail = username;
      let userRole = null;
      
      // If username doesn't contain @, fetch email from both collections
      if (!username.includes("@")) {
        // First, try registrations collection
        const registrationsRef = collection(db, "registrations");
        const regQuery = query(registrationsRef, where("username", "==", username));
        const regSnapshot = await getDocs(regQuery);
        
        if (!regSnapshot.empty) {
          const userData = regSnapshot.docs[0].data();
          loginEmail = userData.email;
          
          // Check if account is approved
          if (userData.status === "pending") {
            setError("Your account is pending approval. Please wait for admin verification.");
            setLoading(false);
            return;
          }
          
          if (userData.status === "rejected") {
            setError("Your account has been rejected. Please contact support.");
            setLoading(false);
            return;
          }
        } else {
          // Try admins collection as fallback
          const adminsRef = collection(db, "admins");
          const adminQuery = query(adminsRef, where("username", "==", username));
          const adminSnapshot = await getDocs(adminQuery);
          
          if (adminSnapshot.empty) {
            setError("Invalid username or password");
            setLoading(false);
            return;
          }
          
          loginEmail = adminSnapshot.docs[0].data().email;
        }
      }
      
      // Login with Firebase Auth
      await login(loginEmail, password);
      
      // Get current user from auth
      const { auth: firebaseAuth } = await import("@/lib/firebase");
      const currentUser = firebaseAuth.currentUser;
      
      if (!currentUser) {
        setError("Login failed. Please try again.");
        setLoading(false);
        return;
      }
      
      // Fetch user role from registrations first, then admins
      const registrationsRef = collection(db, "registrations");
      const regQuery = query(registrationsRef, where("uid", "==", currentUser.uid));
      const regSnapshot = await getDocs(regQuery);
      
      if (!regSnapshot.empty) {
        const userData = regSnapshot.docs[0].data();
        userRole = userData.role;
      } else {
        // Check admins collection
        const adminsRef = collection(db, "admins");
        const adminQuery = query(adminsRef, where("uid", "==", currentUser.uid));
        const adminSnapshot = await getDocs(adminQuery);
        
        if (!adminSnapshot.empty) {
          const adminData = adminSnapshot.docs[0].data();
          userRole = adminData.role || "admin";
        }
      }
      
      // Force token refresh to update role claim
      await currentUser.getIdToken(true);
      
      onOpenChange(false);
      
      // Redirect based on role
      switch (userRole) {
        case "admin":
        case "regional_admin":
        case "municipal_admin":
          navigate("/admin/dashboard");
          break;
        case "bhw":
          navigate("/bhw/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <AuthLoading />}
      <Dialog open={open && !loading} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader className="items-center">
          <img 
            src="/sentinel_ph_logo.png" 
            alt="SentinelPH" 
            className="h-30 w-auto"
          />
          <DialogTitle className="text-2xl font-bold text-[#1B365D]">
            Welcome Back
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded text-sm">
              {error}
            </div>
          )}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <Input
              id="username"
              type="text"
              placeholder=" "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12 pl-10 peer"
              required
            />
            <Label 
              htmlFor="username"
              className="absolute left-10 top-1/2 -translate-y-1/2 bg-white px-1 text-gray-500 transition-all duration-200 peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#1B365D] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs"
            >
              Username
            </Label>
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 pl-10 pr-10 peer"
              required
            />
            <Label 
              htmlFor="password"
              className="absolute left-10 top-1/2 -translate-y-1/2 bg-white px-1 text-gray-500 transition-all duration-200 peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#1B365D] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs"
            >
              Password
            </Label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex justify-end text-sm">
            <a href="#" className="text-[#CE1126] hover:underline">
              Forgot password?
            </a>
          </div>

          <Button 
            type="submit" 
            className="w-full shadow-lg shadow-[#1B365D]/30"
          >
            Sign In
          </Button>

          <div className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/register" className="text-[#CE1126] font-medium hover:underline">
              Register here
            </a>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
