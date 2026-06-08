import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  ArrowLeft,
  Send,
  CheckCircle2,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Send the reset link via Firebase Auth
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };

      if (firebaseErr.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (firebaseErr.code === "auth/too-many-requests") {
        setError("Too many requests. Please try again later.");
      } else if (firebaseErr.code === "auth/user-not-found") {
        // Always show the success state to prevent email checking/enumeration
        setSuccess(true);
      } else {
        setError(
          firebaseErr.message || "Failed to send reset email. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

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

      {/* ── Top-left back button ── */}
      <motion.div
        className="p-5"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Link
          to="/signin"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-cyan-600 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Sign In
        </Link>
      </motion.div>

      {/* ── Centered form area ── */}
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <motion.div
          className="w-full max-w-sm"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Logo */}
          <motion.div variants={fadeUp} className="text-center mb-8">
            <Link to="/">
              <img
                src="/logo_main.png"
                alt="HealthWatch"
                className="h-24 w-24 object-contain mx-auto"
              />
            </Link>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* ── Success state ── */}
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="text-center space-y-5"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.1,
                  }}
                  className="flex justify-center"
                >
                  <div className="p-4 rounded-full bg-emerald-50 border border-emerald-200">
                    <CheckCircle2 className="h-9 w-9 text-emerald-500" />
                  </div>
                </motion.div>

                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Check your inbox
                  </h2>
                  <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                    We sent a reset link to{" "}
                    <span className="font-medium text-slate-700">{email}</span>.
                    It may take a moment to arrive.
                  </p>
                </div>

                <p className="text-xs text-slate-400">
                  Didn't get it? Check your spam or{" "}
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setEmail("");
                    }}
                    className="text-cyan-600 hover:text-cyan-700 underline"
                  >
                    try again
                  </button>
                  .
                </p>
              </motion.div>
            ) : (
              /* ── Form state ── */
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-5"
                variants={stagger}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
              >
                {/* Heading */}
                <motion.div variants={fadeUp}>
                  <h1 className="text-2xl font-bold text-slate-800">
                    Forgot password?
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Enter your email and we'll send you a reset link.
                  </p>
                </motion.div>

                {/* Error banner */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key="fp-error"
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

                {/* Email field */}
                <motion.div variants={fadeUp} className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder=" "
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pl-10 peer bg-white border-slate-200 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/20"
                    required
                  />
                  <Label
                    htmlFor="reset-email"
                    className="absolute left-10 top-1/2 -translate-y-1/2 bg-white px-1 text-slate-500 transition-all duration-200 peer-focus:top-0 peer-focus:text-xs peer-focus:text-cyan-600 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs"
                  >
                    Email address
                  </Label>
                </motion.div>

                {/* Submit */}
                <motion.div variants={fadeUp}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white w-full h-11 rounded-[5px] font-medium disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? "Sending…" : "Send Reset Link"}
                  </Button>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
