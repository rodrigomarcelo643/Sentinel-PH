import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { geoapifyService, type PhilippineRegion, type PhilippineMunicipality, type PhilippineBarangay } from "@/services/geoapifyService";
import { Check, CreditCard, Building2, ArrowRight, ArrowLeft, Lock, Shield, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { uploadImage } from "@/services/cloudinaryService";
import { syncUserQRCode } from "@/services/qrSyncService";
import type { FormData, FormErrors } from '@/@types/pages/register';
import { useMayaPayment } from "@/hooks/useMayaPayment";
import { initiateMayaWalletPayment } from "@/services/mayaService";
//import { useXenditPayment } from "@/hooks/useXenditPayment";
import { AccountTypeStep } from "@/components/register/AccountTypeStep";
import { OrganizationInfoStep } from "@/components/register/OrganizationInfoStep";
import { DocumentVerificationStep } from "@/components/register/DocumentVerificationStep";
import { CredentialsStep } from "@/components/register/CredentialsStep";
import { RegistrationSuccess } from "@/components/register/RegistrationSuccess";

const steps = [
  { number: 1, title: "Account Type", description: "Select your organization", icon: Building2 },
  { number: 2, title: "Organization Info", description: "Your organization details", icon: Building2 },
  { number: 3, title: "Verification", description: "Upload documents", icon: Shield },
  { number: 4, title: "Credentials", description: "Create login & subscribe", icon: Lock },
];

// Helpers for file persistence across redirects
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const base64ToFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type:mime});
};



export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Maya Payment Hook and States
  const { startPayment: startMayaPayment, loading: isMayaRedirecting } = useMayaPayment();
  // const { startXenditPayment, loading: isXenditRedirecting } = useXenditPayment();
  const isPaymentRedirecting = isMayaRedirecting //|| isXenditRedirecting;
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [creditedAmount, setCreditedAmount] = useState<string>("");
  
  // Location data states
  const [regions, setRegions] = useState<PhilippineRegion[]>([]);
  const [municipalities, setMunicipalities] = useState<PhilippineMunicipality[]>([]);
  const [barangays, setBarangays] = useState<PhilippineBarangay[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    accountType: "",
    region: "",
    municipality: "",
    barangay: "",
    officeName: "",
    headOfficer: "",
    address: "",
    estimatedPopulation: "",
    officialEmail: "",
    fullName: "",
    email: "",
    phone: "",
    documents: [],
    subscription: "",
    paymentMethod: "", // No default, user must choose
    username: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    cardholderName: "",
    gcashNumber: "",
    paymayaNumber: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
  numberOfMunicipalities: "1",
  });

  // Core registration logic - separated to be called either directly or after redirect
  const processRegistration = async (data: FormData, files: File[], amount: string | number) => {
    setIsRegistering(true);
    try {
      // 1. Upload Documents (Only now, after payment success)
      const documentUrls: string[] = [];
      for (const file of files) {
        try {
          const url = await uploadImage(file);
          documentUrls.push(url);
        } catch (error) {
          console.error('Error uploading file:', error);
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      // 2. Create Auth User
      const roleMap: Record<string, string> = {
        regional: "regional_admin",
        municipal: "municipal_admin",
        bhw: "bhw"
      };
      const userRole = roleMap[data.accountType] || "user";

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // 3. Create Firestore Records
      await addDoc(collection(db, "registrations"), {
        uid: userCredential.user.uid,
        accountType: data.accountType,
        role: userRole,
        region: data.region,
        municipality: data.municipality,
        barangay: data.barangay,
        officeName: data.officeName,
        headOfficer: data.headOfficer,
        address: data.address,
        estimatedPopulation: data.estimatedPopulation,
        officialEmail: data.officialEmail,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        username: data.username,
        subscription: data.subscription,
        numberOfMunicipalities: data.accountType === 'regional' ? parseInt(data.numberOfMunicipalities, 10) : null,
        paymentMethod: data.paymentMethod,
        paymentStatus: "paid", // Confirmed paid
        paymentDetails: {
          method: data.paymentMethod,
          amount: amount,
          reference: `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toISOString(),
        },
        status: "pending",
        subscriptionStatus: "active",
        createdAt: serverTimestamp(),
        documentUrls: documentUrls,
        documentsCount: documentUrls.length,
      });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        firstName: data.fullName.split(' ')[0],
        lastName: data.fullName.split(' ').slice(1).join(' '),
        email: data.email,
        contactNumber: data.phone,
        role: userRole,
        status: "pending",
        createdAt: serverTimestamp()
      });

      await syncUserQRCode(userCredential.user.uid);
      
      // Sign out the user to prevent auto-login since approval is pending
      await signOut(auth);
      
      setPaymentSuccess(true);
      setCreditedAmount(amount.toString());

    } catch (error: any) {
      console.error("Registration processing error:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Could not finalize registration.",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle Payment Return from Maya
  useEffect(() => {
    const status = searchParams.get('status');
    const amountParam = searchParams.get('amount');
    
    if (status === 'success') {
      const storedState = sessionStorage.getItem('sentinel_reg_state');
      if (storedState) {
        const { formData: savedData, docFiles } = JSON.parse(storedState);
        // Reconstruct files
        const files = docFiles.map((f: any) => base64ToFile(f.data, f.name));
        
        // Execute registration (upload & db insert)
        processRegistration(savedData, files, amountParam || "0").then(() => {
          sessionStorage.removeItem('sentinel_reg_state');
        });
      }
    } else if (status === 'failed' || status === 'cancel') {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "Transaction was not completed. Please try again.",
      });
      // Restore form data from storage if available so user doesn't lose input
      const storedState = sessionStorage.getItem('sentinel_reg_state');
      if (storedState) {
        const { formData: savedData } = JSON.parse(storedState);
        // We can't easily restore files to file inputs, but we can restore text fields
        // For now, we rely on the component state if they haven't refreshed, 
        // or just let them re-fill if they refreshed.
        // If the component mounted fresh (redirected back), formData is empty.
        setFormData(prev => ({...prev, ...savedData}));
      }
    }
  }, [searchParams, toast]);

  // Load regions on component mount
  useEffect(() => {
    const loadRegions = async () => {
      try {
        setLoadingRegions(true);
        console.log('Testing Geoapify API connection...');
        
        // Test API connection first
        const apiTest = await geoapifyService.testApiConnection();
        console.log('API Test Result:', apiTest);
        
        if (!apiTest.success) {
          console.warn('API test failed:', apiTest.message);
          
          // Show different messages based on the error type
          if (apiTest.message.includes('not configured')) {
            toast({
              variant: "default",
              title: "Using comprehensive offline data",
              description: "All Philippine regions and municipalities available. Add VITE_GEOAPIFY_API_KEY to .env for live data.",
            });
          } else if (apiTest.message.includes('quota exceeded')) {
            toast({
              variant: "default",
              title: "API quota exceeded",
              description: "Using reliable fallback data with complete Philippine coverage.",
            });
          } else if (apiTest.message.includes('Invalid API key')) {
            toast({
              variant: "destructive",
              title: "Invalid API key",
              description: "Please check your VITE_GEOAPIFY_API_KEY in .env file.",
            });
          } else {
            toast({
              variant: "default",
              title: "Using offline data",
              description: "Complete Philippine regions and municipalities available.",
            });
          }
        } else {
          console.log('API connection successful:', apiTest.data);
        }
        
        console.log('Loading Philippine regions...');
        const regionsData = await geoapifyService.getPhilippineRegions();
        setRegions(regionsData);
        
        console.log(`Loaded ${regionsData.length} regions:`, regionsData.map(r => r.name));
        
        // Check if we got all expected regions
        const expectedRegions = ['NCR', 'CAR', 'Region I', 'Region II', 'Region III', 'Region IV-A', 'Region IV-B', 'Region V', 'Region VI', 'Region VII', 'Region VIII', 'Region IX', 'Region X', 'Region XI', 'Region XII', 'Region XIII', 'BARMM'];
        const loadedRegionNames = regionsData.map(r => r.name);
        const missingRegions = expectedRegions.filter(r => !loadedRegionNames.includes(r));
        
        if (missingRegions.length > 0) {
          console.log('Missing regions:', missingRegions);
        }
        
        if (regionsData.length >= 15) {
         /**  toast({
            variant: "default",
            title: "Regions loaded successfully",
            description: `Loaded all ${regionsData.length} Philippine regions.`,
          });*/
        } else {
          toast({
            variant: "default",
            title: "Using comprehensive fallback data",
            description: `All ${regionsData.length} Philippine regions available with extensive municipality coverage.`,
          });
        }
      } catch (error) {
        console.error('Error loading regions:', error);
        toast({
          variant: "default",
          title: "Using offline region data",
          description: "All Philippine regions available with comprehensive municipality coverage.",
        });
      } finally {
        setLoadingRegions(false);
      }
    };

    loadRegions();
  }, [toast]);

  // Load municipalities when region changes
  useEffect(() => {
    const loadMunicipalities = async () => {
      if (!formData.region) {
        setMunicipalities([]);
        return;
      }

      try {
        setLoadingMunicipalities(true);
       // console.log(`Loading municipalities for region: ${formData.region}`);
        
        const municipalitiesData = await geoapifyService.getMunicipalitiesByRegion(formData.region);
        console.log(`Loaded ${municipalitiesData.length} municipalities for ${formData.region}:`, municipalitiesData.map(m => m.name));
        
        setMunicipalities(municipalitiesData);
        
        if (municipalitiesData.length === 0) {
          toast({
            variant: "default",
            title: "No municipalities found",
            description: `No municipalities available for ${formData.region}. Please try a different region.`,
          });
        }
      } catch (error) {
        console.error('Error loading municipalities:', error);
        toast({
          variant: "destructive",
          title: "Error loading municipalities",
          description: "Please try selecting the region again or check your internet connection.",
        });
        setMunicipalities([]);
      } finally {
        setLoadingMunicipalities(false);
      }
    };

    loadMunicipalities();
  }, [formData.region, toast]);

  // Load barangays when municipality changes
  useEffect(() => {
    const loadBarangays = async () => {
      if (!formData.municipality || !formData.region) {
        setBarangays([]);
        return;
      }

      try {
        setLoadingBarangays(true);
        console.log(`Loading barangays for municipality: ${formData.municipality}`);
        
        const barangaysData = await geoapifyService.getBarangaysByMunicipality(formData.municipality, formData.region);
       // console.log(`Loaded ${barangaysData.length} barangays for ${formData.municipality}:`, barangaysData.map(b => b.name));
        
        setBarangays(barangaysData);
        
        if (barangaysData.length === 0) {
          console.log(`No barangays found for ${formData.municipality}`);
        }
      } catch (error) {
        console.error('Error loading barangays:', error);
        setBarangays([]);
      } finally {
        setLoadingBarangays(false);
      }
    };

    loadBarangays();
  }, [formData.municipality, formData.region]);

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1:
        if (!formData.accountType) newErrors.accountType = "Please select an account type";
        if (formData.accountType === 'regional') {
            const numMun = parseInt(formData.numberOfMunicipalities, 10);
            if (!formData.numberOfMunicipalities) {
                newErrors.numberOfMunicipalities = "Please specify the number of municipalities";
            } else if (isNaN(numMun) || numMun < 1) {
                newErrors.numberOfMunicipalities = "Please enter a valid number (at least 1)";
            }
        }
        if (!formData.region) newErrors.region = "Please select a region";
        if (!formData.municipality.trim()) newErrors.municipality = "Municipality is required";
        if (!formData.barangay.trim()) newErrors.barangay = "Barangay is required";
        break;
      case 2:
        if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
        if (!formData.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "Please enter a valid email";
        }
        if (!formData.phone.trim()) {
          newErrors.phone = "Phone number is required";
        } else if (!/^[0-9+\-\s()]{10,}$/.test(formData.phone)) {
          newErrors.phone = "Please enter a valid phone number";
        }
        break;
      case 3:
        if (formData.documents.length === 0) newErrors.documents = "Please upload required documents";
        break;
      case 4:
        if (!formData.subscription) newErrors.subscription = "Please select a subscription plan";
        if (!formData.paymentMethod) newErrors.paymentMethod = "Please select a payment method";
        if (!formData.username.trim()) {
          newErrors.username = "Username is required";
        } else if (formData.username.length < 3) {
          newErrors.username = "Username must be at least 3 characters";
        }
        if (!formData.password) {
          newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
          newErrors.password = "Password must contain uppercase, lowercase, and number";
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
        if (!formData.agreeToTerms) {
          newErrors.agreeToTerms = "You must agree to the terms and conditions";
        }

        // Payment validation
        // Skipped specific card field validation for Maya Sandbox redirect flow
        // as the actual card entry happens on the Maya Checkout page.
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      setTouched({});
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    setTouched({});
  };

  const isStep4Complete = () => {
    const isPaymentComplete = () => {
      return !!formData.paymentMethod; // For Maya redirect, we just need the method selected
    };

    return (
      formData.username.trim().length >= 3 &&
      formData.password.length >= 8 &&
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password) &&
      formData.password === formData.confirmPassword &&
      formData.subscription &&
      formData.paymentMethod &&
      formData.agreeToTerms &&
      isPaymentComplete()
    );
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    // Determine amount
    let amount = 0;
    if (formData.subscription === 'barangay') amount = 300;
    else if (formData.subscription === 'municipal') amount = 1500;
    else if (formData.subscription === 'provincial') amount = 4000;
    
    if (formData.accountType === 'regional') {
      const numMunicipalities = parseInt(formData.numberOfMunicipalities, 10) || 0;
      amount = numMunicipalities * 1000;
    }

    // Branch logic based on payment method
    if (formData.paymentMethod === 'maya') {
      setIsRegistering(true); // Show loading while preparing redirect
      try {
        // 1. Serialize files to base64
        const docFiles = await Promise.all(formData.documents.map(async (file) => ({
          name: file.name,
          data: await fileToBase64(file)
        })));

        // 2. Save state to sessionStorage
        sessionStorage.setItem('sentinel_reg_state', JSON.stringify({
          formData,
          docFiles
        }));

        // 3. Initiate Maya Redirect
        await startMayaPayment({
          amount,
          description: `SentinelPH ${formData.subscription} Plan`,
          requestReferenceNumber: `REF-${Date.now()}`,
          buyer: {
            firstName: formData.fullName.split(' ')[0],
            lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
            contact: {
              email: formData.email,
              phone: formData.phone
            }
          }
        });
      } catch (error) {
        console.error("Payment initiation failed", error);
        setIsRegistering(false);
      }
    } else if (formData.paymentMethod === 'maya_wallet') {
      setIsRegistering(true);
      try {
        // 1. Serialize files to base64
        const docFiles = await Promise.all(formData.documents.map(async (file) => ({
          name: file.name,
          data: await fileToBase64(file)
        })));

        // 2. Save state to sessionStorage
        sessionStorage.setItem('sentinel_reg_state', JSON.stringify({
          formData,
          docFiles
        }));

        // 3. Initiate Maya Wallet Payment
        const response = await initiateMayaWalletPayment({
          amount,
          description: `SentinelPH ${formData.subscription} Plan`,
          requestReferenceNumber: `REF-${Date.now()}`,
          buyer: {
            firstName: formData.fullName.split(' ')[0],
            lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
            contact: {
              email: formData.email,
              phone: formData.phone
            }
          },
          redirectUrl: {
            success: `${window.location.origin}/register?status=success&amount=${amount}`,
            failure: `${window.location.origin}/register?status=failed`,
            cancel: `${window.location.origin}/register?status=cancel`
          }
        });

        if (response.redirectUrl) {
          window.location.href = response.redirectUrl;
        } else {
          throw new Error("No redirect URL received from Maya Wallet");
        }
      } catch (error: any) {
        console.error("Maya Wallet Payment initiation failed", error);
        setIsRegistering(false);
        toast({
          variant: "destructive",
          title: "Payment Failed",
          description: error.message || "Could not initiate Maya Wallet payment.",
        });
      }
    } else {
      // "Manual" / GCash (Direct) / Other flow (Simulated success for demo)
      await processRegistration(formData, formData.documents, amount);
    }
  };

  /* Removed the old handleSubmit logic that did everything at once */
  /*
  const handleSubmitOld = async () => {
    if (!validateStep(4)) return;

    // 1. First register the user to create the account
    setIsRegistering(true);
    try {
  */

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData({ ...formData, documents: [...formData.documents, ...files] });
    setErrors({ ...errors, documents: "" });
  };

  const removeFile = (index: number) => {
    const newDocs = formData.documents.filter((_, i) => i !== index);
    setFormData({ ...formData, documents: newDocs });
  };

  /*const getDocumentRequirements = () => {
    switch (formData.accountType) {
      case "regional":
        return [
          "Regional Health Office Authorization Letter",
          "DOH Accreditation Certificate",
          "Valid Government ID of Regional Health Officer",
          "Proof of Office Address",
          "Official Seal/Logo (Digital Copy)",
        ];
      case "municipal":
        return [
          "Municipal Health Office Authorization Letter",
          "LGU Accreditation Certificate",
          "Valid Government ID of Municipal Health Officer",
          "Proof of Office Address",
          "Barangay Coverage List",
        ];
      case "bhw":
        return [
          "BHW Certificate of Training",
          "Barangay Health Center Authorization",
          "Valid Government ID",
          "Proof of Barangay Residence",
          "BHW Identification Card",
        ];
      default:
        return [];
    }
  };
  */

  const progress = (currentStep / steps.length) * 100;

  // If payment was successful (returned from Maya), show success view
  if (paymentSuccess) {
    return (
      <RegistrationSuccess 
        creditedAmount={creditedAmount} 
        onNavigateHome={() => navigate("/")} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-4 sm:py-8 lg:py-12 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto relative">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="absolute top-0 left-0 gap-1 sm:gap-2 text-gray-600 hover:text-[#1B365D] text-xs sm:text-sm p-2 sm:p-3"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Back</span>
        </Button>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8 lg:mb-12 mt-8 sm:mt-0"
        >
          <div className="relative inline-block">
            <img 
              src="/sentinel_ph_logo.png" 
              alt="SentinelPH" 
              className="h-16 sm:h-20 lg:h-24 mx-auto mb-3 sm:mb-4 lg:mb-6 relative z-10"
            />
            <div className="absolute inset-0 bg-blue-600 rounded-full blur-3xl opacity-20 -z-10"></div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B365D] mb-1 sm:mb-2 px-4">Create Your Account</h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg px-4">Join the SentinelPH community and help make your community safer</p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-4 sm:mb-6 lg:mb-8 px-2 sm:px-4">
          <div className="flex justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-[#1B365D]">Step {currentStep} of {steps.length}</span>
            <span className="text-xs sm:text-sm font-medium text-[#1B365D]">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-1.5 sm:h-2" />
        </div>

        {/* Step Indicator */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <div className="flex justify-between items-start max-w-3xl mx-auto px-2 sm:px-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep >= step.number;
              const isCurrent = currentStep === step.number;
              
              return (
                <div key={step.number} className="flex flex-col items-center flex-1">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                      backgroundColor: isActive ? "#1B365D" : "#E5E7EB",
                      borderColor: isCurrent ? "#3B82F6" : "transparent",
                    }}
                    className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-white font-bold mb-2 sm:mb-3 
                      ${isActive ? "shadow-lg" : ""} 
                      ${isCurrent ? "ring-2 sm:ring-4 ring-blue-200" : ""}`}
                  >
                    {currentStep > step.number ? (
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                    ) : (
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                    )}
                  </motion.div>
                  <div className="text-center">
                    <span className={`text-xs sm:text-sm font-semibold block transition-colors
                      ${isActive ? "text-[#1B365D]" : "text-gray-400"}`}>
                      {step.title}
                    </span>
                    <span className={`text-xs hidden sm:block mt-1 transition-colors
                      ${isActive ? "text-gray-600" : "text-gray-400"}`}>
                      {step.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
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
              <AccountTypeStep 
                formData={formData} 
                setFormData={setFormData} 
                errors={errors} 
                setErrors={setErrors}
                touched={touched} 
                handleBlur={handleBlur} 
                regions={regions} 
                municipalities={municipalities} 
                barangays={barangays} 
                loadingRegions={loadingRegions} 
                loadingMunicipalities={loadingMunicipalities} 
                loadingBarangays={loadingBarangays} 
              />
            )}

            {currentStep === 2 && (
              <OrganizationInfoStep 
                formData={formData} 
                setFormData={setFormData} 
                errors={errors} 
                touched={touched} 
                handleBlur={handleBlur} 
                setErrors={setErrors}
              />
            )}

            {currentStep === 3 && (
              <DocumentVerificationStep 
                formData={formData} 
                setFormData={setFormData} 
                errors={errors} 
                touched={touched} 
                handleBlur={handleBlur} 
                handleFileUpload={handleFileUpload} 
                removeFile={removeFile}
                setErrors={setErrors}
              />
            )}

            {currentStep === 4 && (
              <CredentialsStep 
                formData={formData} 
                setFormData={setFormData} 
                errors={errors} 
                touched={touched} 
                handleBlur={handleBlur} 
                showPassword={showPassword} 
                setShowPassword={setShowPassword} 
                showConfirmPassword={showConfirmPassword} 
                setShowConfirmPassword={setShowConfirmPassword}
                setErrors={setErrors}
              />
            )}

            {/* Navigation Buttons */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              {currentStep === 1 ? (
                <Button
                  onClick={handleNext}
                  className="w-full bg-[#1B365D] hover:bg-[#1B365D]/90 h-12 sm:h-14 text-base sm:text-lg font-semibold"
                >
                  Continue
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
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Back</span>
                  </Button>
                  
                  {currentStep < steps.length ? (
                    <Button
                      onClick={handleNext}
                      className="bg-[#1B365D] hover:bg-[#1B365D]/90 h-12 sm:h-14 text-base sm:text-lg font-semibold"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <span className="sm:hidden">Next</span>
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isRegistering || !isStep4Complete()}
                      className={`h-12 sm:h-14 text-base sm:text-lg font-semibold transition-all duration-200 ${
                        isStep4Complete() && !isRegistering && !isPaymentRedirecting
                          ? "bg-[#1B365D] hover:bg-[#1B365D]/90 cursor-pointer"
                          : "bg-gray-400 cursor-not-allowed opacity-60"
                      }`}
                    >
                      {isRegistering || isPaymentRedirecting ? (
                        <>
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                          <span className="hidden sm:inline">Redirecting...</span>
                          <span className="sm:hidden">Wait...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          <span className="hidden sm:inline">Pay & Register</span>
                          <span className="sm:hidden">Pay</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Help Text */}
        <p className="text-center text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6 px-4">
          Need help? Contact our support team at{' '}
          <a href="mailto:support@sentinelph.com" className="text-[#1B365D] font-medium hover:underline">
            support@sentinelph.com
          </a>
        </p>
      </div>

      {/* Loading Dialog */}
      {isRegistering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          
          <div className="w-full max-w-sm mx-4 rounded-2xl bg-white p-8 shadow-2xl text-center relative overflow-hidden">
            
            {/* Top Gradient Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

            {/* Spinner */}
            <div className="flex justify-center mb-6">
              <div className="relative h-14 w-14">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Creating Your Account
            </h3>

            {/* Description */}
            <p className="text-gray-500 text-sm mb-6">
              Uploading your documents and setting up your profile securely...
            </p>

            {/* Progress Bar Animation */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-blue-600 animate-[loading_1.5s_ease-in-out_infinite]"></div>
            </div>

            {/* Subtext */}
            <p className="text-xs text-gray-400">
              This may take a few seconds. Please don’t close this window.
            </p>
          </div>

          {/* Custom Animation */}
          <style>
            {`
              @keyframes loading {
                0% { width: 0%; }
                50% { width: 70%; }
                100% { width: 100%; }
              }
            `}
          </style>
        </div>
      )}
    </div>
  );
}              