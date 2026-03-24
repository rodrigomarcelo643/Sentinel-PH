import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, User, MapPin, Mail, Phone, AlertCircle } from "lucide-react";
import type { FormData, FormErrors } from '@/@types/pages/register';

interface OrganizationInfoStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  errors: FormErrors;
  touched: { [key: string]: boolean };
  handleBlur: (field: string) => void;
  setErrors: (errors: FormErrors) => void;
}

export function OrganizationInfoStep({ formData, setFormData, errors, touched, handleBlur, setErrors }: OrganizationInfoStepProps) {
  return (
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
              <Label htmlFor="officeName" className="mb-2 block font-medium text-sm sm:text-base">{formData.accountType === "bhw" ? "Barangay Health Center Name" : "Office Name"} <span className="text-red-500">*</span></Label>
              <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" /><Input id="officeName" type="text" value={formData.officeName} onChange={(e) => setFormData({ ...formData, officeName: e.target.value })} className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base" placeholder={formData.accountType === "bhw" ? "Enter health center name" : "Enter office name"} /></div>
            </div>
            <div>
              <Label htmlFor="headOfficer" className="mb-2 block font-medium text-sm sm:text-base">{formData.accountType === "bhw" ? "Head BHW Name" : "Head Officer Name"} <span className="text-red-500">*</span></Label>
              <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" /><Input id="headOfficer" type="text" value={formData.headOfficer} onChange={(e) => setFormData({ ...formData, headOfficer: e.target.value })} className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base" placeholder="Enter head officer name" /></div>
            </div>
            <div>
              <Label htmlFor="address" className="mb-2 block font-medium text-sm sm:text-base">Office Address <span className="text-red-500">*</span></Label>
              <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" /><Input id="address" type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base" placeholder="Enter complete office address" /></div>
            </div>
            {(formData.accountType === "regional" || formData.accountType === "municipal") && (
              <>
                <div><Label htmlFor="estimatedPopulation" className="mb-2 block font-medium text-sm sm:text-base">Estimated Population</Label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" /><Input id="estimatedPopulation" type="text" value={formData.estimatedPopulation} onChange={(e) => setFormData({ ...formData, estimatedPopulation: e.target.value })} className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base" placeholder="e.g., 1.2M" /></div></div>
                <div><Label htmlFor="officialEmail" className="mb-2 block font-medium text-sm sm:text-base">Official Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" /><Input id="officialEmail" type="email" value={formData.officialEmail} onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })} className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base" placeholder="email@gov.ph" /></div></div>
              </>
            )}
          </>
        )}
        <div>
          <Label htmlFor="fullName" className="mb-2 block font-medium text-sm sm:text-base">Contact Person Name <span className="text-red-500">*</span></Label>
          <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" /><Input id="fullName" type="text" value={formData.fullName} onChange={(e) => { setFormData({ ...formData, fullName: e.target.value }); setErrors({ ...errors, fullName: "" }); }} onBlur={() => handleBlur("fullName")} className={`pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base ${touched.fullName && errors.fullName ? "border-red-500" : ""}`} placeholder="Enter contact person name" /></div>
          {touched.fullName && errors.fullName && (<p className="text-xs sm:text-sm text-red-500 mt-1">{errors.fullName}</p>)}
        </div>
        <div>
          <Label htmlFor="email" className="mb-2 block font-medium text-sm sm:text-base">Email Address <span className="text-red-500">*</span></Label>
          <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" /><Input id="email" type="email" value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: "" }); }} onBlur={() => handleBlur("email")} className={`pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base ${touched.email && errors.email ? "border-red-500" : ""}`} placeholder="you@example.com" /></div>
          {touched.email && errors.email && (<p className="text-xs sm:text-sm text-red-500 mt-1">{errors.email}</p>)}
        </div>
        <div>
          <Label htmlFor="phone" className="mb-2 block font-medium text-sm sm:text-base">Phone Number <span className="text-red-500">*</span></Label>
          <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" /><Input id="phone" type="text" value={formData.phone} onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setErrors({ ...errors, phone: "" }); }} onBlur={() => handleBlur("phone")} className={`pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base ${touched.phone && errors.phone ? "border-red-500" : ""}`} placeholder="+63 XXX XXX XXXX" /></div>
          {touched.phone && errors.phone && (<p className="text-xs sm:text-sm text-red-500 mt-1">{errors.phone}</p>)}
        </div>
      </div>
      <Alert className="bg-blue-50 border-blue-200"><AlertCircle className="h-4 w-4 text-blue-600" /><AlertDescription className="text-blue-700 text-sm sm:text-base">We'll use this information to verify your account and send important updates.</AlertDescription></Alert>
    </div>
  );
}