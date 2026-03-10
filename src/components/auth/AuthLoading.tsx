import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthLoading() {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm" style={{ height: '100vh', width: '100vw' }}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-10 shadow-2xl flex flex-col items-center gap-6 min-w-87.5"
      >
        {/* Logo */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <img src="/transparent_sentinel_ph_logo.png" alt="SentinelPH" className="h-20 w-auto" />
        </motion.div>

        {/* Spinner */}
        <Loader2 className="h-12 w-12 animate-spin text-[#1B365D]" />
        
        {/* Main Text */}
        <div className="text-center space-y-2">
          <motion.h3 
            className="text-2xl font-bold dark:text-white text-[#1B365D]"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Logging In
          </motion.h3>
          <p className="text-sm text-gray-600 dark:text-white">Please wait while we authenticate your credentials</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full dark:bg-gray-700 bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div 
            className="h-full bg-[#1B365D] dark:bg-white "
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
}
