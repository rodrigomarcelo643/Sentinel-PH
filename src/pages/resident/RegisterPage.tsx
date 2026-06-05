import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Check, User, Shield, Lock, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  PersonalDetailsStep,
  DocumentVerificationStep,
  CredentialsStep,
  RegistrationModals,
  isCredentialsStepValid,
} from "@/components/registration";
import { registerUser } from "@/services/registration";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const steps = [
  { number: 1, title: "Personal", description: "Your details", icon: User },
  { number: 2, title: "Verification", description: "Upload documents", icon: Shield },
  { number: 3, title: "Credentials", description: "Create login", icon: Lock },
];

const primaryBtnClass =
  "bg-cyan-600 hover:bg-cyan-700 text-white rounded-md";

export default function ResidentRegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [barangay, setBarangay] = useState("");
  const [communityRole, setCommunityRole] = useState("");
  const [customRole, setCustomRole] = useState("");

  const [idType, setIdType] = useState("");
  const [validId, setValidId] = useState<File | null>(null);
  const [validIdPreview, setValidIdPreview] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleContactChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) {
      setContactNumber(cleaned.substring(1, 11));
    } else if (cleaned.length <= 10) {
      setContactNumber(cleaned);
    }
  };

  const handleNext = () => {
    const newErrors: string[] = [];

    if (currentStep === 1) {
      if (!firstName) newErrors.push("First Name is required");
      if (!lastName) newErrors.push("Last Name is required");
      if (contactNumber.length !== 10) newErrors.push("Valid contact number is required");
      if (!email) newErrors.push("Email is required");
      if (!communityRole) newErrors.push("Community Role is required");
      if (communityRole === "Other (Specify)" && !customRole) {
        newErrors.push("Custom role is required");
      }
    } else if (currentStep === 2) {
      if (!idType) newErrors.push("ID Type is required");
      if (!validId) newErrors.push("Valid ID is required");
      if (!selfie) newErrors.push("Selfie is required");
    }

    setErrors(newErrors);
    if (newErrors.length > 0) return;

    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setErrors([]);
    setCurrentStep(currentStep - 1);
  };

  const handleRegister = async () => {
    const newErrors: string[] = [];

    if (!password) newErrors.push("Password is required");
    if (!confirmPassword) newErrors.push("Confirm Password is required");
    if (password !== confirmPassword) newErrors.push("Passwords do not match");
    if (!agreedToPolicy) newErrors.push("You must agree to the terms and policy");

    setErrors(newErrors);
    if (newErrors.length > 0) return;

    if (!isCredentialsStepValid(password, confirmPassword, agreedToPolicy)) return;
    if (!validId || !selfie) return;

    setIsRegistering(true);

    try {
      await registerUser({
        firstName,
        lastName,
        middleInitial,
        contactNumber,
        email,
        region,
        municipality,
        barangay,
        communityRole: communityRole === "Other (Specify)" ? customRole : communityRole,
        idType,
        validIdFile: validId,
        selfieFile: selfie,
        password,
      });

      await logout();

      setIsRegistering(false);
      setShowSuccessModal(true);
    } catch (error: unknown) {
      setIsRegistering(false);
      const message = error instanceof Error ? error.message : "An error occurred during registration";

      if (message === "Contact number already registered") {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "This contact number is already registered. Please use a different number or login.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: message,
        });
      }
    }
  };

  const progress = (currentStep / steps.length) * 100;
  const isStep3Valid = isCredentialsStepValid(password, confirmPassword, agreedToPolicy);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <header className="w-full px-3 sm:px-6 lg:px-8 pt-3 sm:pt-5">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="gap-1 sm:gap-2 text-gray-600 hover:text-[#1B365D] text-xs sm:text-sm p-2 sm:p-3 -ml-2"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </header>

      <div className="max-w-4xl mx-auto px-2 sm:px-4 pb-4 sm:pb-8 lg:pb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8 lg:mb-12"
        >
          <div className="relative inline-block">
            <img
              src="/logo.png"
              alt="HealthWatch"
              className="h-16 sm:h-20 lg:h-24 mx-auto mb-3 sm:mb-4 lg:mb-6 relative z-10"
            />
            <div className="absolute inset-0 bg-blue-600 rounded-full blur-3xl opacity-20 -z-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B365D] mb-1 sm:mb-2 px-4">
            Create Account
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg px-4">
            Register as a Resident and help protect your barangay
          </p>
        </motion.div>

        <div className="mb-4 sm:mb-6 lg:mb-8 px-2 sm:px-4">
          <div className="flex justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-cyan-700">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-xs sm:text-sm font-medium text-cyan-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress
            value={progress}
            className="h-1.5 sm:h-2 bg-cyan-100 [&>div]:bg-cyan-600"
          />
        </div>

        <div className="mb-6 sm:mb-8 lg:mb-12 relative">
          {/* Connector Line */}
          <div className="absolute top-5 sm:top-6 lg:top-7 left-[15%] right-[15%] h-0.5 bg-gray-200 dark:bg-gray-700 -z-10">
            <div 
              className="h-full bg-cyan-600 transition-all duration-300" 
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between items-start max-w-3xl mx-auto px-2 sm:px-4 relative z-10">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep >= step.number;
              const isCurrent = currentStep === step.number;

              return (
                <div key={step.number} className="flex flex-col items-center flex-1">
                  <motion.div
                    initial={false}
                    animate={{ scale: isCurrent ? 1.1 : 1 }}
                    className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center font-bold mb-2 sm:mb-3 transition-all duration-300 ${
                      isActive
                        ? "bg-cyan-600 text-white"
                        : "bg-gray-200 text-gray-400"
                    } ${isCurrent ? "ring-2 sm:ring-4 ring-cyan-300" : ""}`}
                  >
                    {currentStep > step.number ? (
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                    ) : (
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                    )}
                  </motion.div>
                  <div className="text-center">
                    <span
                      className={`text-xs sm:text-sm font-semibold block transition-colors ${
                        isActive ? "text-cyan-600" : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </span>
                    <span
                      className={`text-xs hidden sm:block mt-1 transition-colors ${
                        isActive ? "text-cyan-600/80" : "text-gray-400"
                      }`}
                    >
                      {step.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 xl:p-10 mx-2 sm:mx-0"
          >
            {currentStep === 1 && (
              <PersonalDetailsStep
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                middleInitial={middleInitial}
                setMiddleInitial={setMiddleInitial}
                contactNumber={contactNumber}
                handleContactChange={handleContactChange}
                email={email}
                setEmail={setEmail}
                region={region}
                setRegion={setRegion}
                municipality={municipality}
                setMunicipality={setMunicipality}
                barangay={barangay}
                setBarangay={setBarangay}
                communityRole={communityRole}
                setCommunityRole={setCommunityRole}
                customRole={customRole}
                setCustomRole={setCustomRole}
                errors={errors}
              />
            )}

            {currentStep === 2 && (
              <DocumentVerificationStep
                errors={errors}
                idType={idType}
                setIdType={setIdType}
                validId={validId}
                validIdPreview={validIdPreview}
                setValidId={(file, preview) => {
                  setValidId(file);
                  setValidIdPreview(preview);
                }}
                selfie={selfie}
                selfiePreview={selfiePreview}
                setSelfie={(file, preview) => {
                  setSelfie(file);
                  setSelfiePreview(preview);
                }}
              />
            )}

            {currentStep === 3 && (
              <CredentialsStep
                errors={errors}
                contactNumber={contactNumber}
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                agreedToPolicy={agreedToPolicy}
                setAgreedToPolicy={setAgreedToPolicy}
              />
            )}

            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              {currentStep === 1 ? (
                <Button
                  onClick={handleNext}
                  className={`w-full h-12 sm:h-14 text-base sm:text-lg font-semibold ${primaryBtnClass}`}
                >
                  Next
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="h-12 sm:h-14 text-base sm:text-lg font-semibold"
                  >
                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Prev
                  </Button>

                  {currentStep < steps.length ? (
                    <Button
                      onClick={handleNext}
                      className={`h-12 sm:h-14 text-base sm:text-lg font-semibold ${primaryBtnClass}`}
                    >
                      Next
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleRegister}
                      disabled={!isStep3Valid || isRegistering}
                      className={`h-12 sm:h-14 text-base sm:text-lg font-semibold disabled:opacity-50 ${primaryBtnClass}`}
                    >
                      {isRegistering ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Submitting…
                        </>
                      ) : (
                        "Register"
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/signin" className="text-[#1B365D] font-semibold underline">
                Sign In
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <RegistrationModals
        isRegistering={isRegistering}
        showSuccessModal={showSuccessModal}
        setShowSuccessModal={setShowSuccessModal}
        onNavigateToHome={() => navigate("/")}
      />
    </div>
  );
}
