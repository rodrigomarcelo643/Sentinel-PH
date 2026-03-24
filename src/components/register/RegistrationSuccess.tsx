import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RegistrationSuccessProps {
  creditedAmount: string;
  onNavigateHome: () => void;
}

export function RegistrationSuccess({ creditedAmount, onNavigateHome }: RegistrationSuccessProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center border-t-4 border-green-500"
      >
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted!</h2>
        <p className="text-gray-600 mb-6">Your account is created and under review. Please wait for approval.</p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Amount Paid</p>
          <p className="text-3xl font-bold text-[#1B365D]">PHP {parseFloat(creditedAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Status: Pending Approval
          </div>
        </div>

        <Button 
          onClick={onNavigateHome} 
          className="w-full bg-[#1B365D] hover:bg-[#1B365D]/90"
        >
          Return to Home
        </Button>
      </motion.div>
    </div>
  );
}