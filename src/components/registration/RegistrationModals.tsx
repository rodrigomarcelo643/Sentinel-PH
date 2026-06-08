import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  Clock,
  Smartphone,
  Download,
  ShieldCheck,
  Activity,
  Home,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const LOADING_STEPS = [
  "Verifying your documents",
  "Securing your credentials",
  "Submitting to your barangay",
];

const MOBILE_APP_DOWNLOAD_URL = "https://your-app-download-link.com";

interface RegistrationModalsProps {
  isRegistering: boolean;
  showSuccessModal: boolean;
  setShowSuccessModal: (value: boolean) => void;
  onNavigateToHome?: () => void;
}

export function RegistrationModals({
  isRegistering,
  showSuccessModal,
  setShowSuccessModal,
  onNavigateToHome,
}: RegistrationModalsProps) {
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  useEffect(() => {
    if (!isRegistering) {
      setLoadingStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingStepIndex((prev) =>
        prev < LOADING_STEPS.length - 1 ? prev + 1 : prev
      );
    }, 2200);

    return () => clearInterval(interval);
  }, [isRegistering]);

  const handleDownloadApp = () => {
    window.open(MOBILE_APP_DOWNLOAD_URL, "_blank", "noopener,noreferrer");
  };

  const nextSteps = [
    {
      icon: Download,
      title: "Download the HealthWatch mobile app",
      description: "Install the app on your phone to sign in and report symptoms.",
    },
    {
      icon: ShieldCheck,
      title: "Wait for barangay approval",
      description:
        "Your account is under review. Your barangay health worker will verify your registration.",
    },
    {
      icon: Smartphone,
      title: "Log in on the mobile app to check status",
      description:
        "Once approved, sign in with your username and password to confirm your account is active.",
    },
    {
      icon: Activity,
      title: "Start reporting through the app",
      description:
        "Report symptoms early from the mobile app so your community can respond faster.",
    },
  ];

  return (
    <>
      <Dialog open={isRegistering}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-md border-0 p-0 overflow-hidden gap-0"
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col h-[500px] max-h-[85vh]"
          >
            <div className="flex-1 overflow-y-auto px-8 pt-10 pb-9 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="mb-6 flex justify-center"
              >
                <img
                  src="/logo_main.png"
                  alt="HealthWatch"
                  className="h-16 w-16 object-contain"
                />
              </motion.div>

              <Loader2 className="h-11 w-11 animate-spin text-cyan-600 mb-5 mx-auto" />

              <h2 className="text-xl font-semibold text-[#1B365D] text-center">
                Creating your account
              </h2>
              <p className="text-sm text-gray-500 text-center mt-2 mb-6 max-w-[260px] leading-relaxed mx-auto">
                Please keep this window open while we process your registration.
              </p>

              <div className="w-full h-1.5 bg-cyan-100 rounded-full overflow-hidden mb-6">
                <motion.div
                  className="h-full bg-cyan-600 rounded-full"
                  initial={{ width: "8%" }}
                  animate={{ width: ["8%", "45%", "75%", "92%"] }}
                  transition={{
                    duration: 6,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
              </div>

              <div className="w-full space-y-3">
                {LOADING_STEPS.map((step, index) => {
                  const isActive = index === loadingStepIndex;
                  const isDone = index < loadingStepIndex;

                  return (
                    <motion.div
                      key={step}
                      initial={false}
                      animate={{
                        opacity: isActive || isDone ? 1 : 0.45,
                        x: isActive ? 0 : 0,
                      }}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                        isActive ? "bg-cyan-50" : "bg-transparent"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          isActive
                            ? "bg-cyan-600 text-white"
                            : isDone
                              ? "bg-cyan-100 text-cyan-700"
                              : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {isActive ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <span className="text-xs font-bold">{index + 1}</span>
                        )}
                      </div>
                      <p
                        className={`text-sm ${
                          isActive ? "font-medium text-[#1B365D]" : "text-gray-500"
                        }`}
                      >
                        {step}
                        {isActive && "…"}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden gap-0 border-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="max-h-[95vh] overflow-y-auto"
          >
            <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 px-6 pt-3 pb-5 text-center text-white sticky top-0">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide mb-3">
                Account under review
              </span>
              <h2 className="text-2xl font-bold">Registration submitted</h2>
              <p className="mt-3 text-sm text-cyan-50/95 leading-relaxed  mx-auto">
                Thank you for registering. Your barangay will review your account before you can
                sign in and report symptoms.
              </p>
            </div>

            <div className="px-6 py-6 space-y-5 bg-white">
              <div>
                <h3 className="text-sm font-semibold text-[#1B365D] mb-3">What happens next</h3>
                <ul className="space-y-3">
                  {nextSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <li key={step.title} className="flex gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 pt-0.5">
                          <p className="text-sm font-medium text-gray-900 leading-snug">
                            <span className="text-cyan-600 mr-1.5">{index + 1}.</span>
                            {step.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left">
                <p className="text-xs text-amber-900 leading-relaxed">
                  <strong className="font-semibold">Tip:</strong> After your barangay approves your
                  account, open the HealthWatch mobile app and log in with the username and password
                  you just created to verify access before reporting.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 pt-1 sticky bottom-0 bg-white pb-2">
                <Button
                  onClick={() => {
                    handleDownloadApp();
                  }}
                  className="w-full h-11 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md font-medium"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Mobile App
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full h-11 rounded-md font-medium border-gray-200"
                >
                  <Smartphone className="h-4 w-4 mr-2 text-cyan-600" />
                  I&apos;ll test login on the app later
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowSuccessModal(false);
                    onNavigateToHome?.();
                  }}
                  className="w-full h-10 text-gray-600 hover:text-[#1B365D] rounded-md"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}