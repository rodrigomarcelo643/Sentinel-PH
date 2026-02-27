import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { regions } from "@/data/regions";
import { CloudUpload, Check, CreditCard, Building2, UserCog, Mail, Phone, MapPin, User, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Shield, AlertCircle, Cloud, FileText, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { uploadImage } from "@/services/cloudinaryService";

const steps = [
  { number: 1, title: "Account Type", description: "Select your organization", icon: Building2 },
  { number: 2, title: "Organization Info", description: "Your organization details", icon: Building2 },
  { number: 3, title: "Verification", description: "Upload documents", icon: Shield },
  { number: 4, title: "Credentials", description: "Create login & subscribe", icon: Lock },
];

const municipalities = [
  // Region 7 - Central Visayas (Cebu)
  { name: "Cebu City", region: "Region VII" },
  { name: "Mandaue City", region: "Region VII" },
  { name: "Lapu-Lapu City", region: "Region VII" },
  { name: "Talisay City", region: "Region VII" },
  { name: "Toledo City", region: "Region VII" },
  { name: "Danao City", region: "Region VII" },
  { name: "Carcar City", region: "Region VII" },
  { name: "Naga City", region: "Region VII" },
  { name: "Minglanilla", region: "Region VII" },
  { name: "Consolacion", region: "Region VII" },
  { name: "Liloan", region: "Region VII" },
  { name: "Compostela", region: "Region VII" },
  // Other regions (sample)
  { name: "Manila", region: "NCR" },
  { name: "Quezon City", region: "NCR" },
  { name: "Davao City", region: "Region XI" },
];

interface FormData {
  accountType: string;
  region: string;
  municipality: string;
  officeName: string;
  headOfficer: string;
  address: string;
  estimatedPopulation: string;
  officialEmail: string;
  fullName: string;
  email: string;
  phone: string;
  documents: File[];
  subscription: string;
  paymentMethod: string;
  username: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    accountType: "",
    region: "",
    municipality: "",
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

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1:
        if (!formData.accountType) newErrors.accountType = "Please select an account type";
        if (!formData.region) newErrors.region = "Please select a region";
        if (!formData.municipality.trim()) newErrors.municipality = "Municipality is required";
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

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);

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
      setIsSubmitting(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto relative">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="absolute top-0 left-0 gap-2 text-gray-600 hover:text-[#1B365D]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="relative inline-block">
            <img 
              src="/sentinel_ph_logo.png" 
              alt="SentinelPH" 
              className="h-24 mx-auto mb-6 relative z-10"
            />
            <div className="absolute inset-0 bg-blue-600 rounded-full blur-3xl opacity-20 -z-10"></div>
          </div>
          <h1 className="text-4xl font-bold text-[#1B365D] mb-2">Create Your Account</h1>
          <p className="text-gray-600 text-lg">Join the SentinelPH community and help make your community safer</p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8 px-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-[#1B365D]">Step {currentStep} of {steps.length}</span>
            <span className="text-sm font-medium text-[#1B365D]">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicator */}
        <div className="mb-12">
          <div className="flex justify-between items-start max-w-3xl mx-auto px-4">
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
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold mb-3 
                      ${isActive ? "shadow-lg" : ""} 
                      ${isCurrent ? "ring-4 ring-blue-200" : ""}`}
                  >
                    {currentStep > step.number ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </motion.div>
                  <div className="text-center">
                    <span className={`text-sm font-semibold block transition-colors
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
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10"
          >
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#1B365D] mb-2">Account Type & Location</h2>
                  <p className="text-gray-600 mb-6">Tell us about your organization</p>
                </div>

                <div className="grid gap-6">
                  <div>
                    <Label htmlFor="accountType" className="mb-2 block font-medium">
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
                      <SelectTrigger className={`h-12 ${touched.accountType && errors.accountType ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regional">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>Regional Health Office</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="municipal">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>Municipal Health Office</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="bhw">
                          <div className="flex items-center gap-2">
                            <UserCog className="h-4 w-4" />
                            <span>Barangay Health Worker</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {touched.accountType && errors.accountType && (
                      <p className="text-sm text-red-500 mt-1">{errors.accountType}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="region" className="mb-2 block font-medium">
                      Region <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.region} 
                      onValueChange={(value) => {
                        setFormData({ ...formData, region: value });
                        setErrors({ ...errors, region: "" });
                      }}
                    >
                      <SelectTrigger className={`h-12 ${touched.region && errors.region ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.name} value={region.name}>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{region.name} - {region.fullName}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {touched.region && errors.region && (
                      <p className="text-sm text-red-500 mt-1">{errors.region}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="municipality" className="mb-2 block font-medium">
                      Municipality <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.municipality} 
                      onValueChange={(value) => {
                        setFormData({ ...formData, municipality: value });
                        setErrors({ ...errors, municipality: "" });
                      }}
                    >
                      <SelectTrigger className={`h-12 ${touched.municipality && errors.municipality ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select municipality" />
                      </SelectTrigger>
                      <SelectContent>
                        {municipalities.map((muni) => (
                          <SelectItem key={muni.name} value={muni.name}>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{muni.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {touched.municipality && errors.municipality && (
                      <p className="text-sm text-red-500 mt-1">{errors.municipality}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#1B365D] mb-2">
                    {formData.accountType === "regional" ? "Regional Health Office Information" :
                     formData.accountType === "municipal" ? "Municipal Health Office Information" :
                     formData.accountType === "bhw" ? "Barangay Health Worker Information" : "Organization Information"}
                  </h2>
                  <p className="text-gray-600 mb-6">Provide your organization details</p>
                </div>

                <div className="grid gap-6">
                  {formData.accountType && (
                    <>
                      <div>
                        <Label htmlFor="officeName" className="mb-2 block font-medium">
                          {formData.accountType === "bhw" ? "Barangay Health Center Name" : "Office Name"} <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input id="officeName" type="text" value={formData.officeName} onChange={(e) => setFormData({ ...formData, officeName: e.target.value })} className="pl-10 h-12" placeholder={formData.accountType === "bhw" ? "Enter health center name" : "Enter office name"} />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="headOfficer" className="mb-2 block font-medium">
                          {formData.accountType === "bhw" ? "Head BHW Name" : "Head Officer Name"} <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input id="headOfficer" type="text" value={formData.headOfficer} onChange={(e) => setFormData({ ...formData, headOfficer: e.target.value })} className="pl-10 h-12" placeholder="Enter head officer name" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="address" className="mb-2 block font-medium">Office Address <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input id="address" type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="pl-10 h-12" placeholder="Enter complete office address" />
                        </div>
                      </div>
                      {(formData.accountType === "regional" || formData.accountType === "municipal") && (
                        <>
                          <div>
                            <Label htmlFor="estimatedPopulation" className="mb-2 block font-medium">Estimated Population</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input id="estimatedPopulation" type="text" value={formData.estimatedPopulation} onChange={(e) => setFormData({ ...formData, estimatedPopulation: e.target.value })} className="pl-10 h-12" placeholder="e.g., 1.2M" />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="officialEmail" className="mb-2 block font-medium">Official Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input id="officialEmail" type="email" value={formData.officialEmail} onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })} className="pl-10 h-12" placeholder="email@gov.ph" />
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                  <div>
                    <Label htmlFor="fullName" className="mb-2 block font-medium">Contact Person Name <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input id="fullName" type="text" value={formData.fullName} onChange={(e) => { setFormData({ ...formData, fullName: e.target.value }); setErrors({ ...errors, fullName: "" }); }} onBlur={() => handleBlur("fullName")} className={`pl-10 h-12 ${touched.fullName && errors.fullName ? "border-red-500" : ""}`} placeholder="Enter contact person name" />
                    </div>
                    {touched.fullName && errors.fullName && (<p className="text-sm text-red-500 mt-1">{errors.fullName}</p>)}
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-2 block font-medium">Email Address <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input id="email" type="email" value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: "" }); }} onBlur={() => handleBlur("email")} className={`pl-10 h-12 ${touched.email && errors.email ? "border-red-500" : ""}`} placeholder="you@example.com" />
                    </div>
                    {touched.email && errors.email && (<p className="text-sm text-red-500 mt-1">{errors.email}</p>)}
                  </div>
                  <div>
                    <Label htmlFor="phone" className="mb-2 block font-medium">Phone Number <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input id="phone" type="text" value={formData.phone} onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setErrors({ ...errors, phone: "" }); }} onBlur={() => handleBlur("phone")} className={`pl-10 h-12 ${touched.phone && errors.phone ? "border-red-500" : ""}`} placeholder="+63 XXX XXX XXXX" />
                    </div>
                    {touched.phone && errors.phone && (<p className="text-sm text-red-500 mt-1">{errors.phone}</p>)}
                  </div>
                </div>
                <Alert className="bg-blue-50 border-blue-200"><AlertCircle className="h-4 w-4 text-blue-600" /><AlertDescription className="text-blue-700">We'll use this information to verify your account and send important updates.</AlertDescription></Alert>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#1B365D] mb-2">Document Verification</h2>
                  <p className="text-gray-600 mb-6 text-center">Please upload the required documents for verification</p>
                </div>
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-[#1B365D] transition-all bg-gray-50 hover:bg-blue-50 cursor-pointer">
                    <input id="documents" type="file" multiple accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleFileUpload} onBlur={() => handleBlur("documents")} />
                    <label htmlFor="documents" className="cursor-pointer flex flex-col items-center gap-4">
                      <div className="bg-blue-100 p-4 rounded-full"><CloudUpload className="h-12 w-12 text-[#1B365D]" /></div>
                      <div><p className="text-lg font-semibold text-[#1B365D] mb-1">Click to upload or drag and drop</p><p className="text-sm text-gray-500">PDF, PNG, JPG up to 10MB each</p></div>
                      <Button type="button" variant="outline" className="mt-2 pointer-events-none"><CloudUpload className="h-4 w-4 mr-2" />Browse Files</Button>
                    </label>
                  </div>
                  {touched.documents && errors.documents && (<p className="text-sm text-red-500 text-center">{errors.documents}</p>)}
                  {formData.documents.length > 0 && ( 
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900">Uploaded Documents ({formData.documents.length})</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                                  <div className="w-full h-full flex flex-col items-center justify-center">
                                    <FileText className="h-12 w-12 text-[#1B365D] mb-2" />
                                    <p className="text-xs text-gray-500 px-2 text-center truncate w-full">{file.name}</p>
                                  </div>
                                )}
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeFile(index)} 
                                className="absolute top-2 right-2 h-8 w-8 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                              >
                                <X className="h-4 w-4" />
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
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                      <h3 className="font-semibold text-[#1B365D] mb-4 flex items-center gap-2 text-lg"><Shield className="h-5 w-5" />Required Documents:</h3>
                      <ul className="space-y-2">
                        {getDocumentRequirements().map((req, index) => (<li key={index} className="flex items-start gap-2 text-sm text-gray-700"><Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" /><span>{req}</span></li>))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-[#1B365D] mb-2">Account Credentials</h2>
                  <p className="text-gray-600 mb-6">Create your login and choose a subscription</p>
                </div>

                {/* Username and Password Section */}
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="username" className="mb-2 block font-medium">
                      Username <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="username"
                        type="text"
                        value={formData.username}
                        onChange={(e) => {
                          setFormData({ ...formData, username: e.target.value });
                          setErrors({ ...errors, username: "" });
                        }}
                        onBlur={() => handleBlur("username")}
                        className={`pl-10 h-12 ${touched.username && errors.username ? "border-red-500" : ""}`}
                        placeholder="Choose a username"
                      />
                    </div>
                    {touched.username && errors.username && (
                      <p className="text-sm text-red-500 mt-1">{errors.username}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password" className="mb-2 block font-medium">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value });
                          setErrors({ ...errors, password: "" });
                        }}
                        onBlur={() => handleBlur("password")}
                        className={`pl-10 pr-10 h-12 ${touched.password && errors.password ? "border-red-500" : ""}`}
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="mb-2 block font-medium">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => {
                          setFormData({ ...formData, confirmPassword: e.target.value });
                          setErrors({ ...errors, confirmPassword: "" });
                        }}
                        onBlur={() => handleBlur("confirmPassword")}
                        className={`pl-10 pr-10 h-12 ${touched.confirmPassword && errors.confirmPassword ? "border-red-500" : ""}`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Subscription Plans */}
                <div>
                  <Label className="mb-4 block font-medium">
                    Subscription Plan <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid md:grid-cols-3 gap-4">
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
                        className={`border-2 rounded-xl p-6 cursor-pointer transition-all
                          ${formData.subscription === plan.id 
                            ? "border-[#1B365D] bg-blue-50 shadow-lg" 
                            : "border-gray-200 hover:border-[#1B365D] hover:shadow-md"}`}
                      >
                        <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                        <p className="text-3xl font-bold text-[#1B365D] mb-4">
                          ₱{plan.price}<span className="text-sm font-normal text-gray-600">/month</span>
                        </p>
                        <ul className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                  {touched.subscription && errors.subscription && (
                    <p className="text-sm text-red-500 mt-2">{errors.subscription}</p>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <Label htmlFor="paymentMethod" className="mb-2 block font-medium">
                    Payment Method <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => {
                      setFormData({ ...formData, paymentMethod: value });
                      setErrors({ ...errors, paymentMethod: "" });
                    }}
                  >
                    <SelectTrigger className={`h-12 ${touched.paymentMethod && errors.paymentMethod ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gcash">
                        <div className="flex items-center gap-2">GCash</div>
                      </SelectItem>
                      <SelectItem value="paymaya">PayMaya</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                    </SelectContent>
                  </Select>
                  {touched.paymentMethod && errors.paymentMethod && (
                    <p className="text-sm text-red-500 mt-1">{errors.paymentMethod}</p>
                  )}
                  <Alert className="bg-blue-50 border-blue-200 mt-3">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      Payment will be processed once your account is verified. Complete registration details will be sent to your email.
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Terms Agreement */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.agreeToTerms}
                      onChange={(e) => {
                        setFormData({ ...formData, agreeToTerms: e.target.checked });
                        setErrors({ ...errors, agreeToTerms: "" });
                      }}
                      onBlur={() => handleBlur("agreeToTerms")}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-[#1B365D] focus:ring-[#1B365D]"
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the <a href="/terms" className="text-[#1B365D] font-medium hover:underline">Terms of Service</a> and <a href="/privacy" className="text-[#1B365D] font-medium hover:underline">Privacy Policy</a>. I confirm that the information provided is accurate and complete.
                    </Label>
                  </div>
                  {touched.agreeToTerms && errors.agreeToTerms && (
                    <p className="text-sm text-red-500">{errors.agreeToTerms}</p>
                  )}
                </div>

                {/* Demo Notice */}
                <Alert className="bg-yellow-50 border-yellow-200">
                  <CreditCard className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700">
                    This is a demo application. No actual payment will be processed.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              {currentStep === 1 ? (
                <Button
                  onClick={handleNext}
                  className="w-full bg-[#1B365D] hover:bg-[#1B365D]/90 h-14 text-lg font-semibold"
                >
                  Continue
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="h-14 text-lg font-semibold"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Previous
                  </Button>
                  
                  {currentStep < steps.length ? (
                    <Button
                      onClick={handleNext}
                      className="bg-[#1B365D] hover:bg-[#1B365D]/90 h-14 text-lg font-semibold"
                    >
                      Next
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700 h-14 text-lg font-semibold"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="h-5 w-5 mr-2" />
                          Complete Registration
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
        <p className="text-center text-sm text-gray-500 mt-6">
          Need help? Contact our support team at{' '}
          <a href="mailto:support@sentinelph.com" className="text-[#1B365D] font-medium hover:underline">
            support@sentinelph.com
          </a>
        </p>
      </div>
    </div>
  );
}