import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPathForRole } from "@/lib/authRedirects";
import {
  findMockCredentialByIdentifier,
  getMockUserByCredentials,
} from "@/data/mockUsers";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import AuthLoading from "@/components/auth/AuthLoading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Zap,
  ShieldCheck,
  Map,
} from "lucide-react";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let loginEmail = username;

    try {
      const mockUser = getMockUserByCredentials(username, password);
      if (mockUser) {
        if (mockUser.status === "pending") {
          setError("Your account is pending approval. Please wait for admin verification.");
          setLoading(false);
          return;
        }
        if (mockUser.status === "rejected" || mockUser.status === "inactive") {
          setError("Your account is not active. Please contact your administrator.");
          setLoading(false);
          return;
        }
        const userData = await login(username, password);
        const role = userData?.role || userData?.accountType;
        navigate(getDashboardPathForRole(role));
        return;
      }

      if (findMockCredentialByIdentifier(username)) {
        setError("Invalid username or password");
        setLoading(false);
        return;
      }

      if (!username.includes("@")) {
        const registrationsRef = collection(db, "registrations");
        const regQuery = query(registrationsRef, where("username", "==", username));
        const regSnapshot = await getDocs(regQuery);

        if (!regSnapshot.empty) {
          const userData = regSnapshot.docs[0].data();
          loginEmail = userData.email;

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

          if (userData.status === "inactive") {
            setError("Your account has been deactivated. Please contact your administrator.");
            setLoading(false);
            return;
          }
        } else {
          const adminsRef = collection(db, "admins");
          const adminQuery = query(adminsRef, where("username", "==", username));
          const adminSnapshot = await getDocs(adminQuery);

          if (adminSnapshot.empty) {
            setError("Invalid username or password");
            setLoading(false);
            return;
          }

          const adminData = adminSnapshot.docs[0].data();
          loginEmail = adminData.email;
        }
      }

      const userData = await login(loginEmail, password);
      const role = userData?.role || userData?.accountType;
      navigate(getDashboardPathForRole(role));
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };

      if (firebaseErr.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please check your credentials.");
      } else if (firebaseErr.code === "auth/user-not-found") {
        setError("User not found. Please check your email or username.");
      } else if (firebaseErr.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (firebaseErr.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError(firebaseErr.message || "Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  const highlights = [
    {
      icon: Zap,
      title: "Early symptom reporting",
      description: "Residents report signs quickly so your barangay can respond sooner.",
    },
    {
      icon: ShieldCheck,
      title: "3-Resident validation",
      description: "Multi-source verification before outbreak alerts are triggered.",
    },
    {
      icon: Map,
      title: "Real-time heatmaps",
      description: "See geographic clustering of symptoms as they emerge.",
    },
  ];

  return (
    <>
      {loading && <AuthLoading />}

      <div className="min-h-screen flex flex-col lg:flex-row bg-white">
        {/* Left side - full image with overlay content */}
        <motion.div
          className="hidden lg:block lg:w-1/2 relative overflow-hidden"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.img
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop"
            alt="Healthcare community"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/75 to-slate-900/80" />

          <div className="absolute inset-0 flex flex-col justify-center px-12">
            <motion.div
              className="space-y-8"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.h1
                variants={fadeUp}
                className="text-4xl lg:text-5xl font-bold text-white leading-tight"
              >
                Spot symptoms early.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-300">
                  Report before it spreads.
                </span>
              </motion.h1>

              <motion.div className="space-y-4 pt-4" variants={staggerContainer}>
                {highlights.map((item, idx) => (
                  <motion.div
                    key={idx}
                    variants={fadeUp}
                    className="flex items-start gap-4"
                  >
                    <div className="p-2 rounded-[5px] bg-cyan-500/25 backdrop-blur-sm border border-cyan-400/30">
                      <item.icon className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">{item.title}</p>
                      <p className="text-sm text-slate-200/80 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            className="absolute bottom-6 left-0 right-0 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <p className="text-xs text-white/40 tracking-wide">
              HealthWatch · Community Health Intelligence
            </p>
          </motion.div>
        </motion.div>

        {/* Right side - sign in form */}
        <motion.div
          className="flex-1 lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.div
            className="w-full max-w-md"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Link to="/" className="inline-block cursor-pointer group">
                <motion.img
                  src="/logo.png"
                  alt="HealthWatch"
                  className="h-40 w-40 object-contain mx-auto mb-4 "
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                />
              </Link>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-5"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="signin-error"
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-[5px] text-sm overflow-hidden"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={fadeUp} className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder=" "
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11 pl-10 peer bg-white border-slate-200 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/20"
                  required
                />
                <Label
                  htmlFor="username"
                  className="absolute left-10 top-1/2 -translate-y-1/2 bg-white px-1 text-slate-500 transition-all duration-200 peer-focus:top-0 peer-focus:text-xs peer-focus:text-cyan-600 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs"
                >
                  Username
                </Label>
              </motion.div>

              <motion.div variants={fadeUp} className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pl-10 pr-10 peer bg-white border-slate-200 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/20"
                  required
                />
                <Label
                  htmlFor="password"
                  className="absolute left-10 top-1/2 -translate-y-1/2 bg-white px-1 text-slate-500 transition-all duration-200 peer-focus:top-0 peer-focus:text-xs peer-focus:text-cyan-600 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs"
                >
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </motion.div>

              <motion.div variants={fadeUp} className="flex justify-end text-sm">
                <a href="#" className="text-cyan-600 hover:text-cyan-700 hover:underline">
                  Forgot password?
                </a>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white w-full h-11 rounded-[5px] font-medium disabled:opacity-50"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </Button>
              </motion.div>

              <motion.p
                variants={fadeUp}
                className="text-center text-sm text-slate-500 pt-2"
              >
                Don&apos;t have an account?{" "}
                <Link
                  to="/resident/register"
                  className="text-cyan-600 font-medium hover:text-cyan-700 hover:underline"
                >
                  Register here
                </Link>
              </motion.p>
            </motion.form>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}