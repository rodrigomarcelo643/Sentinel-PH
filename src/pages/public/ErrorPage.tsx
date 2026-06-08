import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileQuestion,
  Wrench,
  ShieldAlert,
  AlertTriangle,
  Home,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPathForRole } from "@/lib/authRedirects";

interface ErrorPageProps {
  code?: string;
}

interface ErrorConfig {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

const ERROR_CONFIGS: Record<string, ErrorConfig> = {
  "404": {
    title: "Page Not Found",
    description: "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.",
    icon: FileQuestion,
    colorClass: "text-cyan-600",
    bgClass: "bg-cyan-50",
    borderClass: "border-cyan-100",
  },
  "501": {
    title: "Feature Under Construction",
    description: "This feature is currently not implemented or is under active development. We're working hard to make it available soon!",
    icon: Wrench,
    colorClass: "text-amber-600",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-100",
  },
  "500": {
    title: "Internal Server Error",
    description: "Something went wrong on our servers. Our technical team has been notified. Please try again later.",
    icon: ShieldAlert,
    colorClass: "text-rose-600",
    bgClass: "bg-rose-50",
    borderClass: "border-rose-100",
  },
};

const DEFAULT_CONFIG: ErrorConfig = {
  title: "Something Went Wrong",
  description: "An unexpected error occurred. Please try again later or return to the main dashboard.",
  icon: AlertTriangle,
  colorClass: "text-slate-600",
  bgClass: "bg-slate-50",
  borderClass: "border-slate-100",
};

export default function ErrorPage({ code }: ErrorPageProps) {
  const params = useParams();
  const { user } = useAuth();

  const errorCode = code || params.code || "404";
  const config = ERROR_CONFIGS[errorCode] || DEFAULT_CONFIG;
  const IconComponent = config.icon;

  // Determine redirect link based on authentication status
  const redirectPath = user
    ? getDashboardPathForRole(user.role || user.accountType)
    : "/";

  const redirectLabel = user ? "Go to Dashboard" : "Back to Home";

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" as const },
    },
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Centered content area ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          className="w-full max-w-md text-center space-y-6"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Logo */}
          <motion.div variants={fadeUp} className="text-center">
            <Link to={redirectPath} className="inline-block cursor-pointer">
              <img
                src="/logo_main.png"
                alt="HealthWatch"
                className="h-24 w-24 object-contain mx-auto"
              />
            </Link>
          </motion.div>

          {/* Error Code & Icon Illustration */}
          <motion.div variants={fadeUp} className="flex justify-center">
            <div
              className={`relative p-6 rounded-full ${config.bgClass} border ${config.borderClass} shadow-sm`}
            >
              <IconComponent className={`h-12 w-12 ${config.colorClass}`} />
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm"
              >
                {errorCode}
              </motion.span>
            </div>
          </motion.div>

          {/* Heading and Description */}
          <motion.div variants={fadeUp} className="space-y-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
              {config.title}
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
              {config.description}
            </p>
          </motion.div>

          {/* Navigation Action Buttons */}
          <motion.div variants={fadeUp} className="pt-2">
            <Button
              asChild
              className="bg-cyan-600 hover:bg-cyan-700 text-white h-11 px-6 rounded-[5px] font-medium transition-all shadow-sm"
            >
              <Link to={redirectPath} className="flex items-center gap-2">
                {user ? (
                  <LayoutDashboard className="w-4 h-4" />
                ) : (
                  <Home className="w-4 h-4" />
                )}
                {redirectLabel}
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Footer / Copyright ── */}
      <motion.div
        className="p-5 text-center text-xs text-slate-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        © {new Date().getFullYear()} HealthWatch. All rights reserved.
      </motion.div>
    </div>
  );
}
