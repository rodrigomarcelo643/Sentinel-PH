import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { geoapifyService, type PhilippineRegion, type PhilippineMunicipality, type PhilippineBarangay } from "@/services/geoapifyService";
import { CloudUpload, Check, CreditCard, Building2, UserCog, Mail, Phone, MapPin, User, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Shield, AlertCircle, FileText, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { uploadImage } from "@/services/cloudinaryService";
import { syncUserQRCode } from "@/services/qrSyncService";
import type { FormData, FormErrors } from '@/@types/pages/register';

const steps = [
  { number: 1, title: "Account Type", description: "Select your organization", icon: Building2 },
  { number: 2, title: "Organization Info", description: "Your organization details", icon: Building2 },
  { number: 3, title: "Verification", description: "Upload documents", icon: Shield },
  { number: 4, title: "Credentials", description: "Create login & subscribe", icon: Lock },
];





export default function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  const [isRegistering, setIsRegistering] = useState(false);
  
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
    paymentMethod: "",
    username: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

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
          toast({
            variant: "default",
            title: "Regions loaded successfully",
            description: `Loaded all ${regionsData.length} Philippine regions.`,
          });
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
        console.log(`Loading municipalities for region: ${formData.region}`);
        
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
        console.log(`Loaded ${barangaysData.length} barangays for ${formData.municipality}:`, barangaysData.map(b => b.name));
        
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
    return (
      formData.username.trim().length >= 3 &&
      formData.password.length >= 8 &&
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password) &&
      formData.password === formData.confirmPassword &&
      formData.subscription &&
      formData.paymentMethod &&
      formData.agreeToTerms
    );
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsRegistering(true);

    try {
      // Upload documents to Cloudinary
      toast({
        title: "Uploading documents...",
        description: "Please wait while we upload your documents.",
      });

      const documentUrls: string[] = [];
      for (const file of formData.documents) {
        try {
          const url = await uploadImage(file);
          documentUrls.push(url);
        } catch (error) {
          console.error('Error uploading file:', error);
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      // Map account type to role
      const roleMap: Record<string, string> = {
        regional: "regional_admin",
        municipal: "municipal_admin",
        bhw: "bhw"
      };

      const userRole = roleMap[formData.accountType] || "user";

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Save registration data to Firestore with document URLs
      await addDoc(collection(db, "registrations"), {
        uid: userCredential.user.uid,
        accountType: formData.accountType,
        role: userRole,
        region: formData.region,
        municipality: formData.municipality,
        barangay: formData.barangay,
        officeName: formData.officeName,
        headOfficer: formData.headOfficer,
        address: formData.address,
        estimatedPopulation: formData.estimatedPopulation,
        officialEmail: formData.officialEmail,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        username: formData.username,
        subscription: formData.subscription,
        paymentMethod: formData.paymentMethod,
        status: "pending",
        subscriptionStatus: "pending",
        createdAt: serverTimestamp(),
        documentUrls: documentUrls,
        documentsCount: documentUrls.length,
      });

      // Create user document
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        firstName: formData.fullName.split(' ')[0],
        lastName: formData.fullName.split(' ').slice(1).join(' '),
        email: formData.email,
        contactNumber: formData.phone,
        role: userRole,
        status: "pending",
        createdAt: serverTimestamp()
      });

      // Sync QR code if exists
      await syncUserQRCode(userCredential.user.uid);

      toast({
        variant: "success",
        title: "Registration Successful!",
        description: "Your account has been created. Please check your email for verification.",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "An error occurred during registration. Please try again.",
      });
    } finally {
      setIsRegistering(false);
    }
  };

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

  const getDocumentRequirements = () => {
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

  const progress = (currentStep / steps.length) * 100;

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
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1B365D] mb-1 sm:mb-2">Account Type & Location</h2>
                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Tell us about your organization</p>
                </div>

                <div className="grid gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="accountType" className="mb-2 block font-medium text-sm sm:text-base">
                      Account Type <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.accountType} 
                      onValueChange={(value) => {
                        const subscriptionMap: Record<string, string> = {
                          regional: "provincial",
                          municipal: "municipal",
                          bhw: "barangay"
                        };
                        setFormData({ ...formData, accountType: value, subscription: subscriptionMap[value] || "" });
                        setErrors({ ...errors, accountType: "" });
                      }}
                    >
                      <SelectTrigger className={`h-10 sm:h-12 text-sm sm:text-base ${touched.accountType && errors.accountType ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regional">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-sm sm:text-base">Regional Health Office</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="municipal">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-sm sm:text-base">Municipal Health Office</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="bhw">
                          <div className="flex items-center gap-2">
                            <UserCog className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-sm sm:text-base">Barangay Health Worker</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {touched.accountType && errors.accountType && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.accountType}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="region" className="mb-2 block font-medium text-sm sm:text-base">
                      Region <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.region} 
                      onValueChange={(value) => {
                        setFormData({ ...formData, region: value, municipality: "", barangay: "" }); // Reset municipality and barangay when region changes
                        setErrors({ ...errors, region: "" });
                      }}
                      disabled={loadingRegions}
                    >
                      <SelectTrigger className={`h-10 sm:h-12 text-sm sm:text-base ${touched.region && errors.region ? "border-red-500" : ""}`}>
                        <SelectValue placeholder={loadingRegions ? "Loading regions..." : "Select region"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-48 sm:max-h-60">
                        {regions.length > 0 ? (
                          regions.map((region) => (
                            <SelectItem key={region.code} value={region.name}>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="text-sm sm:text-base">{region.name} - {region.fullName}</span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-6 text-center text-xs sm:text-sm text-gray-500">
                            {loadingRegions ? "Loading regions..." : "No regions available"}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {touched.region && errors.region && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.region}</p>
                    )}
                    {loadingRegions && (
                      <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-gray-500">
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        <span>Loading Philippine regions...</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="municipality" className="mb-2 block font-medium text-sm sm:text-base">
                      Municipality <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.municipality} 
                      onValueChange={(value) => {
                        setFormData({ ...formData, municipality: value, barangay: "" }); // Reset barangay when municipality changes
                        setErrors({ ...errors, municipality: "" });
                      }}
                      disabled={!formData.region || loadingMunicipalities}
                    >
                      <SelectTrigger className={`h-10 sm:h-12 text-sm sm:text-base ${touched.municipality && errors.municipality ? "border-red-500" : ""}`}>
                        <SelectValue placeholder={
                          !formData.region 
                            ? "Select region first" 
                            : loadingMunicipalities 
                            ? "Loading municipalities..." 
                            : "Select municipality"
                        } />
                      </SelectTrigger>
                      <SelectContent className="max-h-48 sm:max-h-60 overflow-y-auto">
                        {municipalities.length > 0 ? (
                          municipalities
                            .filter(muni => muni.name && muni.name.trim() !== '') // Filter out empty names
                            .map((muni, index) => (
                              <SelectItem key={`${muni.name}-${muni.province || muni.region}-${index}`} value={muni.name}>
                                <div className="flex items-center justify-between w-full gap-2">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="text-sm sm:text-base">{muni.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1 flex-wrap">
                                    {muni.type === 'highly_urbanized_city' && (
                                      <span className="text-xs bg-purple-100 text-purple-800 px-1 sm:px-2 py-1 rounded font-medium">HUC</span>
                                    )}
                                    {muni.type === 'independent_component_city' && (
                                      <span className="text-xs bg-blue-100 text-blue-800 px-1 sm:px-2 py-1 rounded font-medium">ICC</span>
                                    )}
                                    {muni.type === 'component_city' && (
                                      <span className="text-xs bg-green-100 text-green-800 px-1 sm:px-2 py-1 rounded font-medium">City</span>
                                    )}
                                    {muni.type === 'municipality' && (
                                      <span className="text-xs bg-gray-100 text-gray-800 px-1 sm:px-2 py-1 rounded">Municipality</span>
                                    )}
                                    {muni.type === 'district' && (
                                      <span className="text-xs bg-orange-100 text-orange-800 px-1 sm:px-2 py-1 rounded">District</span>
                                    )}
                                    {muni.income_class && (
                                      <span className="text-xs text-gray-500 hidden sm:inline">{muni.income_class} Class</span>
                                    )}
                                    {muni.province && (
                                      <span className="text-xs text-gray-500 hidden md:inline">{muni.province}</span>
                                    )}
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                        ) : (
                          <div className="px-2 py-6 text-center text-xs sm:text-sm text-gray-500">
                            {formData.region && !loadingMunicipalities 
                              ? `No municipalities found for ${formData.region}` 
                              : "Select a region first"}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {touched.municipality && errors.municipality && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.municipality}</p>
                    )}
                    {loadingMunicipalities && (
                      <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-gray-500">
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        <span>Loading municipalities...</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="barangay" className="mb-2 block font-medium text-sm sm:text-base">
                      Barangay <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.barangay} 
                      onValueChange={(value) => {
                        setFormData({ ...formData, barangay: value });
                        setErrors({ ...errors, barangay: "" });
                      }}
                      disabled={!formData.municipality || loadingBarangays}
                    >
                      <SelectTrigger className={`h-10 sm:h-12 text-sm sm:text-base ${touched.barangay && errors.barangay ? "border-red-500" : ""}`}>
                        <SelectValue placeholder={
                          !formData.municipality 
                            ? "Select municipality first" 
                            : loadingBarangays 
                            ? "Loading barangays..." 
                            : "Select barangay"
                        } />
                      </SelectTrigger>
                      <SelectContent className="max-h-48 sm:max-h-60 overflow-y-auto">
                        {barangays.length > 0 ? (
                          barangays
                            .filter(brgy => brgy.name && brgy.name.trim() !== '') // Filter out empty names
                            .map((brgy, index) => (
                              <SelectItem key={`${brgy.name}-${brgy.municipality}-${index}`} value={brgy.name}>
                                <div className="flex items-center justify-between w-full gap-2">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="text-sm sm:text-base">{brgy.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1 flex-wrap">
                                    {brgy.type === 'poblacion' && (
                                      <span className="text-xs bg-blue-100 text-blue-800 px-1 sm:px-2 py-1 rounded font-medium">Poblacion</span>
                                    )}
                                    {brgy.type === 'urban' && (
                                      <span className="text-xs bg-green-100 text-green-800 px-1 sm:px-2 py-1 rounded">Urban</span>
                                    )}
                                    {brgy.type === 'rural' && (
                                      <span className="text-xs bg-gray-100 text-gray-800 px-1 sm:px-2 py-1 rounded">Rural</span>
                                    )}
                                    {brgy.postal_code && (
                                      <span className="text-xs text-gray-500 hidden sm:inline">{brgy.postal_code}</span>
                                    )}
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                        ) : (
                          <div className="px-2 py-6 text-center text-xs sm:text-sm text-gray-500">
                            {formData.municipality && !loadingBarangays 
                              ? `No barangays found for ${formData.municipality}` 
                              : "Select a municipality first"}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {touched.barangay && errors.barangay && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.barangay}</p>
                    )}
                    {loadingBarangays && (
                      <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-gray-500">
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        <span>Loading barangays...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1B365D] mb-1 sm:mb-2">
                    {formData.accountType === "regional" ? "Regional Health Office Information" :
                     formData.accountType === "municipal" ? "Municipal Health Office Information" :
                     formData.accountType === "bhw" ? "Barangay Health Worker Information" : "Organization Information"}
                  </h2>
                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Provide your organization details</p>
                </div>

                <div className="grid gap-4 sm:gap-6">
                  {formData.accountType && (
                    <>
                      <div>
                        <Label htmlFor="officeName" className="mb-2 block font-medium text-sm sm:text-base">
                          {formData.accountType === "bhw" ? "Barangay Health Center Name" : "Office Name"} <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          <Input id="officeName" type="text" value={formData.officeName} onChange={(e) => setFormData({ ...formData, officeName: e.target.value })} className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base" placeholder={formData.accountType === "bhw" ? "Enter health center name" : "Enter office name"} />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="headOfficer" className="mb-2 block font-medium text-sm sm:text-base">
                          {formData.accountType === "bhw" ? "Head BHW Name" : "Head Officer Name"} <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          <Input id="headOfficer" type="text" value={formData.headOfficer} onChange={(e) => setFormData({ ...formData, headOfficer: e.target.value })} className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base" placeholder="Enter head officer name" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="address" className="mb-2 block font-medium text-sm sm:text-base">Office Address <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          <Input id="address" type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base" placeholder="Enter complete office address" />
                        </div>
                      </div>
                      {(formData.accountType === "regional" || formData.accountType === "municipal") && (
                        <>
                          <div>
                            <Label htmlFor="estimatedPopulation" className="mb-2 block font-medium text-sm sm:text-base">Estimated Population</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                              <Input id="estimatedPopulation" type="text" value={formData.estimatedPopulation} onChange={(e) => setFormData({ ...formData, estimatedPopulation: e.target.value })} className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base" placeholder="e.g., 1.2M" />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="officialEmail" className="mb-2 block font-medium text-sm sm:text-base">Official Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                              <Input id="officialEmail" type="email" value={formData.officialEmail} onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })} className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base" placeholder="email@gov.ph" />
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                  <div>
                    <Label htmlFor="fullName" className="mb-2 block font-medium text-sm sm:text-base">Contact Person Name <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <Input id="fullName" type="text" value={formData.fullName} onChange={(e) => { setFormData({ ...formData, fullName: e.target.value }); setErrors({ ...errors, fullName: "" }); }} onBlur={() => handleBlur("fullName")} className={`pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base ${touched.fullName && errors.fullName ? "border-red-500" : ""}`} placeholder="Enter contact person name" />
                    </div>
                    {touched.fullName && errors.fullName && (<p className="text-xs sm:text-sm text-red-500 mt-1">{errors.fullName}</p>)}
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-2 block font-medium text-sm sm:text-base">Email Address <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <Input id="email" type="email" value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: "" }); }} onBlur={() => handleBlur("email")} className={`pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base ${touched.email && errors.email ? "border-red-500" : ""}`} placeholder="you@example.com" />
                    </div>
                    {touched.email && errors.email && (<p className="text-xs sm:text-sm text-red-500 mt-1">{errors.email}</p>)}
                  </div>
                  <div>
                    <Label htmlFor="phone" className="mb-2 block font-medium text-sm sm:text-base">Phone Number <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <Input id="phone" type="text" value={formData.phone} onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setErrors({ ...errors, phone: "" }); }} onBlur={() => handleBlur("phone")} className={`pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base ${touched.phone && errors.phone ? "border-red-500" : ""}`} placeholder="+63 XXX XXX XXXX" />
                    </div>
                    {touched.phone && errors.phone && (<p className="text-xs sm:text-sm text-red-500 mt-1">{errors.phone}</p>)}
                  </div>
                </div>
                <Alert className="bg-blue-50 border-blue-200"><AlertCircle className="h-4 w-4 text-blue-600" /><AlertDescription className="text-blue-700 text-sm sm:text-base">We'll use this information to verify your account and send important updates.</AlertDescription></Alert>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1B365D] mb-1 sm:mb-2">Document Verification</h2>
                  <p className="text-gray-600 mb-4 sm:mb-6 text-center text-sm sm:text-base">Please upload the required documents for verification</p>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl p-6 sm:p-8 lg:p-12 text-center hover:border-[#1B365D] transition-all bg-gray-50 hover:bg-blue-50 cursor-pointer">
                    <input id="documents" type="file" multiple accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleFileUpload} onBlur={() => handleBlur("documents")} />
                    <label htmlFor="documents" className="cursor-pointer flex flex-col items-center gap-3 sm:gap-4">
                      <div className="bg-blue-100 p-3 sm:p-4 rounded-full"><CloudUpload className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-[#1B365D]" /></div>
                      <div><p className="text-base sm:text-lg font-semibold text-[#1B365D] mb-1">Click to upload or drag and drop</p><p className="text-xs sm:text-sm text-gray-500">PDF, PNG, JPG up to 10MB each</p></div>
                      <Button type="button" variant="outline" className="mt-2 pointer-events-none text-sm sm:text-base"><CloudUpload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />Browse Files</Button>
                    </label>
                  </div>
                  {touched.documents && errors.documents && (<p className="text-xs sm:text-sm text-red-500 text-center">{errors.documents}</p>)}
                  {formData.documents.length > 0 && ( 
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Uploaded Documents ({formData.documents.length})</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {formData.documents.map((file, index) => {
                          const isImage = file.type.startsWith('image/');
                          const imageUrl = isImage ? URL.createObjectURL(file) : null;
                          
                          return (
                            <div key={index} className="relative group">
                              <div className="aspect-square rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50">
                                {isImage ? (
                                  <img 
                                    src={imageUrl!} 
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center p-2">
                                    <FileText className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-[#1B365D] mb-2" />
                                    <p className="text-xs text-gray-500 px-2 text-center truncate w-full">{file.name}</p>
                                  </div>
                                )}
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeFile(index)} 
                                className="absolute top-1 right-1 sm:top-2 sm:right-2 h-6 w-6 sm:h-8 sm:w-8 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                              >
                                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                              <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {formData.accountType && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                      <h3 className="font-semibold text-[#1B365D] mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg"><Shield className="h-4 w-4 sm:h-5 sm:w-5" />Required Documents:</h3>
                      <ul className="space-y-2">
                        {getDocumentRequirements().map((req, index) => (<li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700"><Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mt-0.5 flex-shrink-0" /><span>{req}</span></li>))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1B365D] mb-1 sm:mb-2">Account Credentials</h2>
                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Create your login and choose a subscription</p>
                </div>

                {/* Username and Password Section */}
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <Label htmlFor="username" className="mb-2 block font-medium text-sm sm:text-base">
                      Username <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <Input
                        id="username"
                        type="text"
                        value={formData.username}
                        onChange={(e) => {
                          setFormData({ ...formData, username: e.target.value });
                          setErrors({ ...errors, username: "" });
                        }}
                        onBlur={() => handleBlur("username")}
                        className={`pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base ${touched.username && errors.username ? "border-red-500" : ""}`}
                        placeholder="Choose a username"
                      />
                    </div>
                    {touched.username && errors.username && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.username}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password" className="mb-2 block font-medium text-sm sm:text-base">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value });
                          setErrors({ ...errors, password: "" });
                        }}
                        onBlur={() => handleBlur("password")}
                        className={`pl-10 sm:pl-12 pr-10 sm:pr-12 h-10 sm:h-12 text-sm sm:text-base ${touched.password && errors.password ? "border-red-500" : ""}`}
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="mb-2 block font-medium text-sm sm:text-base">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => {
                          setFormData({ ...formData, confirmPassword: e.target.value });
                          setErrors({ ...errors, confirmPassword: "" });
                        }}
                        onBlur={() => handleBlur("confirmPassword")}
                        className={`pl-10 sm:pl-12 pr-10 sm:pr-12 h-10 sm:h-12 text-sm sm:text-base ${touched.confirmPassword && errors.confirmPassword ? "border-red-500" : ""}`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                      </button>
                    </div>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Subscription Plans */}
                <div>
                  <Label className="mb-3 sm:mb-4 block font-medium text-sm sm:text-base">
                    Subscription Plan <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {[
                      { id: "barangay", name: "Barangay Plan", price: "300", features: ["Up to 20 sentinels", "Basic analytics", "Email support"] },
                      { id: "municipal", name: "Municipal Plan", price: "1,500", features: ["Unlimited sentinels", "Advanced analytics", "Priority support"] },
                      { id: "provincial", name: "Provincial Plan", price: "4,000", features: ["Regional coverage", "API access", "Dedicated support"] },
                    ].map((plan) => (
                      <motion.div
                        key={plan.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setFormData({ ...formData, subscription: plan.id });
                          setErrors({ ...errors, subscription: "" });
                        }}
                        className={`border-2 rounded-lg sm:rounded-xl p-4 sm:p-6 cursor-pointer transition-all
                          ${formData.subscription === plan.id 
                            ? "border-[#1B365D] bg-blue-50 shadow-lg" 
                            : "border-gray-200 hover:border-[#1B365D] hover:shadow-md"}`}
                      >
                        <h3 className="font-bold text-base sm:text-lg mb-2">{plan.name}</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-[#1B365D] mb-3 sm:mb-4">
                          ₱{plan.price}<span className="text-xs sm:text-sm font-normal text-gray-600">/month</span>
                        </p>
                        <ul className="space-y-1 sm:space-y-2">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                              <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                  {touched.subscription && errors.subscription && (
                    <p className="text-xs sm:text-sm text-red-500 mt-2">{errors.subscription}</p>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <Label htmlFor="paymentMethod" className="mb-2 block font-medium text-sm sm:text-base">
                    Payment Method <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => {
                      setFormData({ ...formData, paymentMethod: value });
                      setErrors({ ...errors, paymentMethod: "" });
                    }}
                  >
                    <SelectTrigger className={`h-10 sm:h-12 text-sm sm:text-base ${touched.paymentMethod && errors.paymentMethod ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gcash">
                        <div className="flex items-center gap-2 text-sm sm:text-base">GCash</div>
                      </SelectItem>
                      <SelectItem value="paymaya"><span className="text-sm sm:text-base">PayMaya</span></SelectItem>
                      <SelectItem value="bank"><span className="text-sm sm:text-base">Bank Transfer</span></SelectItem>
                      <SelectItem value="card"><span className="text-sm sm:text-base">Credit/Debit Card</span></SelectItem>
                    </SelectContent>
                  </Select>
                  {touched.paymentMethod && errors.paymentMethod && (
                    <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.paymentMethod}</p>
                  )}
                  <Alert className="bg-blue-50 border-blue-200 mt-3">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700 text-xs sm:text-sm">
                      Payment will be processed once your account is verified. Complete registration details will be sent to your email.
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Terms Agreement */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.agreeToTerms}
                      onChange={(e) => {
                        setFormData({ ...formData, agreeToTerms: e.target.checked });
                        setErrors({ ...errors, agreeToTerms: "" });
                      }}
                      onBlur={() => handleBlur("agreeToTerms")}
                      className="mt-0.5 sm:mt-1 lg:mt-1.5 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 rounded border-gray-300 text-[#1B365D] focus:ring-[#1B365D] flex-shrink-0 cursor-pointer"
                    />
                    <div className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-600 leading-relaxed cursor-pointer select-none" onClick={() => document.getElementById('terms')?.click()}>
                      I agree to the <a href="/terms" className="text-[#1B365D] font-medium hover:underline transition-colors duration-200 hover:text-blue-700" target="_blank" rel="noopener noreferrer">Terms of Service and Privacy Policy</a>. I confirm that the information provided is accurate and complete.
                    </div>

                  </div>
                  {touched.agreeToTerms && errors.agreeToTerms && (
                    <p className="text-xs sm:text-sm lg:text-base text-red-500 ml-6 sm:ml-8 lg:ml-10 xl:ml-12 font-medium">{errors.agreeToTerms}</p>
                  )}
                </div>

                {/* Demo Notice */}
                <Alert className="bg-yellow-50 border-yellow-200">
                  <CreditCard className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700 text-xs sm:text-sm">
                    This is a demo application. No actual payment will be processed.
                  </AlertDescription>
                </Alert>
              </div>
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
                        isStep4Complete() && !isRegistering
                          ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                          : "bg-gray-400 cursor-not-allowed opacity-60"
                      }`}
                    >
                      {isRegistering ? (
                        <>
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                          <span className="hidden sm:inline">Processing...</span>
                          <span className="sm:hidden">Wait...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          <span className="hidden sm:inline">Complete Registration</span>
                          <span className="sm:hidden">Complete</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Creating Your Account</h3>
            <p className="text-gray-600 text-sm mb-4">Uploading documents and setting up your profile...</p>
            <div className="text-xs text-gray-500">Please wait, this may take a few moments</div>
          </div>
        </div>
      )}
    </div>
  );
}