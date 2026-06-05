import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, User, Eye, Check, AlertCircle, MapPin, 
  Camera, X, Smartphone, ArrowRight, Home, Upload, 
  Map, Sparkles, CheckCircle2, ChevronRight, Info
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { uploadImage } from "@/services/cloudinaryService";

const COMMON_SYMPTOMS = [
  "Fever",
  "Cough",
  "Headache",
  "Sore Throat",
  "Fatigue",
  "Body Aches",
  "Runny Nose",
  "Difficulty Breathing",
  "Nausea",
  "Vomiting",
  "Diarrhea",
  "Loss of Taste/Smell",
  "Rash",
  "Chills",
  "Chest Pain",
  "Abdominal Pain",
  "Dizziness",
  "Joint Pain"
];

export default function ReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [reportType, setReportType] = useState<"self" | "observed">("self");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [barangay, setBarangay] = useState("");
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  
  // Reporter info for non-logged in users
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  
  // Media/Upload states
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  
  // System states
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle toggling symptoms
  const handleToggleSymptom = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  // Reset form to initial empty state
  const handleResetForm = () => {
    setReportType("self");
    setSymptoms([]);
    setCustomSymptom("");
    setDescription("");
    setLocation("");
    setBarangay("");
    setCoordinates(null);
    setReporterName("");
    setReporterContact("");
    setProofFile(null);
    setProofPreview(null);
    setErrorMessage("");
    setSubmitSuccess(false);
  };

  // Auto-fill location using Browser Geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ latitude, longitude });
        
        try {
          // Attempt reverse geocoding via free public API or set coords fallback
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          if (res.ok) {
            const data = await res.json();
            const address = data.display_name || "";
            const addressParts = data.address || {};
            
            const suburb = addressParts.suburb || addressParts.neighbourhood || addressParts.village || addressParts.quarter || "";
            const city = addressParts.city || addressParts.town || addressParts.municipality || "";
            
            setBarangay(suburb ? `Brgy. ${suburb}` : "Unknown Barangay");
            setLocation(address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          } else {
            setLocation(`Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            setBarangay("GPS Location");
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          setLocation(`Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          setBarangay("GPS Location");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.error("Location error:", error);
        setErrorMessage("Unable to retrieve your location. Please type it manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle image select
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit emergency report
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (symptoms.length === 0 && !customSymptom.trim()) {
      setErrorMessage("Please select at least one symptom or describe your symptoms.");
      return;
    }
    if (!description.trim()) {
      setErrorMessage("Please enter a description of the situation.");
      return;
    }
    if (!location.trim()) {
      setErrorMessage("Please provide a location/address.");
      return;
    }
    if (!user && !reporterName.trim()) {
      setErrorMessage("Please enter your name for this emergency report.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      let proofImageUrl = "";
      if (proofFile) {
        proofImageUrl = await uploadImage(proofFile);
      }

      const finalReporterName = user 
        ? user.fullName || user.displayName || user.email || "Registered User"
        : reporterName.trim();

      const finalBarangay = barangay.trim() || "Unspecified";

      // Save report document to Firestore under "symptomReports"
      await addDoc(collection(db, "symptomReports"), {
        userId: user?.uid || "web-emergency-guest",
        userName: finalReporterName,
        reporterContact: reporterContact || "Not provided",
        reportType,
        symptoms,
        customSymptom,
        description,
        location,
        barangay: finalBarangay,
        proofImageUrl,
        latitude: coordinates?.latitude || 0,
        longitude: coordinates?.longitude || 0,
        status: "pending",
        isEmergencyWebReport: true,
        createdAt: serverTimestamp(),
      });

      setLoading(false);
      setSubmitSuccess(true);
    } catch (error: any) {
      console.error("Submission failed:", error);
      setErrorMessage(error.message || "Failed to submit the emergency report. Please check your internet connection.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Banner: Mobile app notification */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 overflow-hidden rounded-[8px] bg-gradient-to-r from-[#1B365D] to-indigo-900 shadow-xl border border-indigo-950/20 text-white relative"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent)]" />
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4 flex-1">
              <div className="bg-white/10 p-3 rounded-[6px] shrink-0 border border-white/20">
                <Smartphone className="h-6 w-6 text-cyan-300" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-cyan-400/20 text-cyan-300 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                  <Info className="h-3 w-3" /> Mobile App Available
                </div>
                <h3 className="text-xl font-bold text-white leading-tight">
                  Reporting is Available on Mobile App as a Resident
                </h3>
                <p className="text-sm text-indigo-100 max-w-xl leading-relaxed">
                  For full tracking, verified credentials, QR passport status updates, and interactive notifications, residents are recommended to report using the <strong>HealthWatch App</strong>.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 justify-end">
              <a 
                href="#download" 
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-2.5 rounded-[5px] text-sm font-semibold transition-all duration-200 shadow-lg shadow-teal-500/20"
              >
                Get HealthWatch App
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          <div className="bg-black/20 px-6 md:px-8 py-3 border-t border-white/5 flex items-center justify-between text-xs text-indigo-200">
            <span>However, you can report as an emergency report directly below.</span>
            <span className="font-semibold text-white uppercase tracking-wider text-[10px] bg-red-500/30 text-red-300 px-2 py-0.5 rounded">Emergency Web Route</span>
          </div>
        </motion.div>

        {/* Main Content Form Card */}
        <AnimatePresence mode="wait">
          {!submitSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 rounded-[8px] overflow-hidden"
            >
              {/* Form Header */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-white relative">
                <div className="absolute inset-0 bg-grid-white/[0.02]" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-[6px] text-red-400">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Emergency Symptom Report</h2>
                    <p className="text-xs sm:text-sm text-slate-300">
                      Submit immediate, localized reports to alert local Barangay Health Workers (BHWs).
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
                {errorMessage && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-red-50 dark:bg-red-950/40 border-l-4 border-red-500 p-4 rounded-[4px] flex items-start gap-3"
                  >
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-800 dark:text-red-300">Submission Error</p>
                      <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">{errorMessage}</p>
                    </div>
                  </motion.div>
                )}

                {/* Reporter Identification (Only if NOT logged in) */}
                {!user && (
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 rounded-[8px] border border-slate-100 dark:border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <User className="h-4 w-4 text-[#1B365D]" /> Reporter Contact Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Your Full Name <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          placeholder="e.g. Juan Dela Cruz" 
                          value={reporterName}
                          onChange={(e) => setReporterName(e.target.value)}
                          className="w-full text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[5px] px-3.5 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Mobile / Contact Number</label>
                        <input 
                          type="tel" 
                          placeholder="e.g. 09171234567" 
                          value={reporterContact}
                          onChange={(e) => setReporterContact(e.target.value)}
                          className="w-full text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[5px] px-3.5 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 1: Report Type Choice */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-500" /> 1. Report Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Self-reported */}
                    <div 
                      onClick={() => setReportType("self")}
                      className={`cursor-pointer border rounded-[8px] p-4 flex items-center gap-4 transition-all duration-200 ${
                        reportType === "self" 
                          ? "border-[#1B365D] bg-indigo-50/40 dark:bg-indigo-950/20 ring-1 ring-[#1B365D]" 
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                      }`}
                    >
                      <div className={`p-2.5 rounded-[6px] ${reportType === "self" ? "bg-[#1B365D] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                        <User className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-950 dark:text-white">Self-Reported Case</p>
                        <p className="text-xs text-slate-500">I am currently feeling these symptoms.</p>
                      </div>
                      {reportType === "self" && (
                        <div className="ml-auto bg-[#1B365D] text-white rounded-full p-0.5">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>

                    {/* Observed */}
                    <div 
                      onClick={() => setReportType("observed")}
                      className={`cursor-pointer border rounded-[8px] p-4 flex items-center gap-4 transition-all duration-200 ${
                        reportType === "observed" 
                          ? "border-[#1B365D] bg-indigo-50/40 dark:bg-indigo-950/20 ring-1 ring-[#1B365D]" 
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                      }`}
                    >
                      <div className={`p-2.5 rounded-[6px] ${reportType === "observed" ? "bg-[#1B365D] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                        <Eye className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-950 dark:text-white">Observed Case</p>
                        <p className="text-xs text-slate-500">I am reporting symptoms observed in others.</p>
                      </div>
                      {reportType === "observed" && (
                        <div className="ml-auto bg-[#1B365D] text-white rounded-full p-0.5">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 2: Symptoms Selection */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-slate-900 dark:text-white">
                      2. Common Symptoms <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Select all symptoms that are present.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2.5">
                    {COMMON_SYMPTOMS.map((symptom) => {
                      const isSelected = symptoms.includes(symptom);
                      return (
                        <button
                          type="button"
                          key={symptom}
                          onClick={() => handleToggleSymptom(symptom)}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-200 ${
                            isSelected 
                              ? "bg-[#1B365D] border-[#1B365D] text-white shadow-md shadow-indigo-900/10" 
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                          {symptom}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-1 pt-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Other Symptoms (if not listed above)
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Joint swelling, localized numbness, etc."
                      value={customSymptom}
                      onChange={(e) => setCustomSymptom(e.target.value)}
                      className="w-full text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[5px] px-3.5 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white"
                    />
                  </div>
                </div>

                {/* Step 3: Description Details */}
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-bold text-slate-900 dark:text-white">
                      3. Detailed Description <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Describe the situation, severity, when symptoms started, and any extra details.
                    </p>
                  </div>
                  <textarea 
                    rows={4}
                    placeholder="Describe the symptoms, how long they've been ongoing, number of people affected, or general conditions..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[5px] px-3.5 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white"
                    required
                  />
                </div>

                {/* Step 4: Location Info */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <label className="text-sm font-bold text-slate-900 dark:text-white">
                        4. Incident Location <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Address and Barangay where the symptoms are located.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={locating}
                      className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#1B365D] dark:text-cyan-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 px-3.5 py-2 rounded-[5px] transition-colors shrink-0 disabled:opacity-50"
                    >
                      {locating ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#1B365D] dark:border-cyan-400"></div>
                          Auto-filling GPS...
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3.5 w-3.5" />
                          Auto-Fill Location via GPS
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1 space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Barangay (e.g. Barangay 7)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Barangay Central" 
                        value={barangay}
                        onChange={(e) => setBarangay(e.target.value)}
                        className="w-full text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[5px] px-3.5 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Full Address or landmark</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 123 Rizal Street, near Plaza" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[5px] px-3.5 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  {coordinates && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      GPS coordinates captured: <code className="font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}</code>
                    </div>
                  )}
                </div>

                {/* Step 5: Proof Photo */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-bold text-slate-900 dark:text-white">
                      5. Symptom Proof / Photo (Optional)
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Upload an image showing rash, fever thermometer, swelling, etc. to assist health workers in diagnosis.
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {proofPreview ? (
                      <div className="relative h-32 w-32 rounded-[8px] overflow-hidden border border-slate-200 dark:border-slate-800 group shrink-0">
                        <img 
                          src={proofPreview} 
                          alt="Proof preview" 
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setProofFile(null);
                            setProofPreview(null);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950 py-6 px-4 rounded-[8px] cursor-pointer transition-all duration-200">
                        <Upload className="h-8 w-8 text-slate-400 mb-2" />
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 text-center">Drag or click to upload proof</span>
                        <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, JPEG files only</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    Emergency reports are subject to review by local BHWs.
                  </div>
                  
                  <div className="flex w-full sm:w-auto gap-3 justify-end">
                    <Link
                      to="/"
                      className="inline-flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 px-6 py-2.5 rounded-[5px] text-sm font-semibold transition-colors w-full sm:w-auto"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center justify-center bg-gradient-to-r from-[#1B365D] to-indigo-950 hover:from-indigo-900 hover:to-slate-950 text-white px-7 py-2.5 rounded-[5px] text-sm font-bold shadow-lg transition-all duration-200 w-full sm:w-auto disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting Report...
                        </>
                      ) : (
                        <>
                          Submit Emergency Report
                          <ChevronRight className="h-4 w-4 ml-1.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 rounded-[8px] overflow-hidden p-8 sm:p-12 text-center"
            >
              <div className="max-w-md mx-auto space-y-6">
                <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10 border border-emerald-100 dark:border-emerald-900/30">
                  <CheckCircle2 className="h-10 w-10 animate-bounce" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Emergency Report Submitted!</h2>
                  <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
                    Thank you. Your symptom report has been logged successfully and flagged as an <strong>Emergency Web Entry</strong>.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[8px] p-5 text-left space-y-3.5">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Next Steps:</h4>
                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                    <li className="flex items-start gap-2.5">
                      <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                      <span>Your report is routed to BHWs of <strong>{barangay || "your local area"}</strong> for verification.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                      <span>Please self-isolate if experiencing highly infectious symptoms like high fever or severe cough.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                      <span>For real-time symptom response monitoring and automated digital health passports, please download the mobile app.</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <button
                    onClick={handleResetForm}
                    className="inline-flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 px-6 py-2.5 rounded-[5px] text-sm font-semibold transition-colors"
                  >
                    Submit Another
                  </button>
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-6 py-2.5 rounded-[5px] text-sm font-bold shadow-md shadow-blue-500/20"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Back to Home
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile App Download Info Section */}
        <section id="download" className="mt-16 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-[12px] border border-slate-200 dark:border-slate-850 p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.03),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.02),transparent)]" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-indigo-100 dark:border-indigo-900/40">
                  Mobile Companion
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  Download HealthWatch App
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Unlock robust offline-first caching, scan-to-track passports, real-time alerts, and complete patient-history databases right on your mobile phone.
                </p>
              </div>
              
              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 p-1 rounded-full shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Supports offline data entry with automated cloud sync</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 p-1 rounded-full shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Real-time health intelligence feed & observation reports</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 p-1 rounded-full shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Unique Digital QR Health Passports & multi-step security</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 p-1 rounded-full shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Instant outbreak warnings & two-way community alerts</span>
                </div>
              </div>

              {/* Official, Formal App Download Badges */}
              <div className="pt-4 flex flex-wrap gap-4">
                {/* Formal Google Play Store Button */}
                <a 
                  href="#playstore" 
                  className="inline-flex items-center bg-black hover:bg-slate-950 text-white rounded-[6px] px-4 py-2 border border-slate-800 transition-all duration-200 shadow-md hover:border-slate-700"
                >
                  <svg className="w-6 h-6 mr-3.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 20.29V3.71C3 3.12 3.48 2.68 4.07 2.76L13.71 12L4.07 21.24C3.48 21.32 3 20.88 3 20.29Z" fill="#00E5FF"/>
                    <path d="M17.47 15.6L13.71 12L17.47 8.4C18.06 8.06 18.84 8.5 18.84 9.18V14.82C18.84 15.5 18.06 15.94 17.47 15.6Z" fill="#FFC107"/>
                    <path d="M4.07 2.76L13.71 12L17.47 8.4L4.97 1.25C4.38 0.91 3.6 1.35 3.6 2.03C3.6 2.3 3.78 2.57 4.07 2.76Z" fill="#FF3D00"/>
                    <path d="M4.07 21.24L13.71 12L17.47 15.6L4.97 22.75C4.38 23.09 3.6 22.65 3.6 21.97C3.6 21.7 3.78 21.43 4.07 21.24Z" fill="#4CAF50"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold leading-none">GET IT ON</p>
                    <p className="text-sm font-bold font-sans mt-1.5 leading-none text-white">Google Play</p>
                  </div>
                </a>

                {/* Formal Apple App Store Button */}
                <a 
                  href="#appstore" 
                  className="inline-flex items-center bg-black hover:bg-slate-950 text-white rounded-[6px] px-4 py-2 border border-slate-800 transition-all duration-200 shadow-md hover:border-slate-700"
                >
                  <svg className="w-6 h-6 mr-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.48C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.1 16.67C20.08 16.74 19.67 18.11 18.71 19.5M15.97 4.17C16.63 3.37 17.07 2.28 16.95 1C16 1.04 14.9 1.6 14.24 2.38C13.68 3.04 13.19 4.14 13.34 5.39C14.39 5.47 15.4 4.88 15.97 4.17Z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[8px] text-slate-400 font-semibold leading-none">Download on the</p>
                    <p className="text-sm font-bold font-sans mt-1.5 leading-none text-white">App Store</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="relative bg-slate-50 dark:bg-slate-950/40 p-8 rounded-[12px] border border-slate-100 dark:border-slate-800/60 flex justify-center overflow-hidden h-72 shadow-inner">
              <div className="absolute inset-0 bg-grid-white/[0.01]" />
              
              {/* Decorative components representing the mobile phone layout */}
              <div className="w-44 h-80 bg-slate-950 border-[5px] border-slate-800 rounded-[24px] shadow-2xl relative translate-y-6 flex flex-col overflow-hidden">
                {/* Camera / Notch */}
                <div className="h-4 w-20 bg-slate-800 rounded-full mx-auto mt-2.5 mb-1.5 shrink-0 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 bg-slate-900 rounded-full ml-auto mr-3" />
                </div>
                
                {/* Mobile UI Mockup */}
                <div className="flex-1 bg-slate-900 p-3.5 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold text-slate-400">HealthWatch</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  
                  {/* Mock Chart/Metric Card */}
                  <div className="bg-slate-950 border border-slate-800/80 rounded-[8px] p-2.5 space-y-1.5">
                    <div className="h-1.5 w-8 bg-indigo-500/20 rounded" />
                    <div className="h-2.5 w-16 bg-indigo-400/40 rounded" />
                    <div className="h-1.5 w-10 bg-slate-700 rounded" />
                  </div>

                  {/* Mock Action Item */}
                  <div className="bg-slate-950 border border-slate-800/80 rounded-[8px] p-2.5 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="h-1.5 w-12 bg-slate-700 rounded" />
                      <div className="h-1.5 w-6 bg-slate-800 rounded" />
                    </div>
                    <div className="h-4 w-4 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center">
                      <Check className="h-2.5 w-2.5" />
                    </div>
                  </div>
                  
                  {/* Mock Submit Button */}
                  <div className="h-7 w-full bg-indigo-600 rounded-[6px] mt-auto shrink-0 flex items-center justify-center hover:bg-indigo-700 transition-colors">
                    <span className="text-[7px] text-white font-bold tracking-wider uppercase">File Symptom Report</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
