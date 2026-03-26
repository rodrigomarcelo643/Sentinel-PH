import { motion } from "framer-motion";
import { Building2, UserCog, AlertCircle, MapPin, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { FormData, FormErrors } from '@/@types/pages/register';
import type { PhilippineRegion, PhilippineMunicipality, PhilippineBarangay } from "@/services/geoapifyService";

interface AccountTypeStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  errors: FormErrors;
  setErrors: (errors: FormErrors) => void;
  touched: { [key: string]: boolean };
  handleBlur: (field: string) => void;
  regions: PhilippineRegion[];
  municipalities: PhilippineMunicipality[];
  barangays: PhilippineBarangay[];
  loadingRegions: boolean;
  loadingMunicipalities: boolean;
  loadingBarangays: boolean;
}

export function AccountTypeStep({
  formData,
  setFormData,
  errors,
  setErrors,
  touched,
  handleBlur,
  regions,
  municipalities,
  barangays,
  loadingRegions,
  loadingMunicipalities,
  loadingBarangays
}: AccountTypeStepProps) {
  return (
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

        {formData.accountType === 'regional' && (
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="font-semibold text-blue-800">Regional Contract Plan</AlertTitle>
                    <AlertDescription className="text-blue-700 text-sm">
                        This is a pay-as-you-go plan. You will be billed ₱5,000 per municipality per month. Each municipality can manage up to 20 barangays.
                    </AlertDescription>
                </Alert>
                <div>
                    <Label htmlFor="numberOfMunicipalities" className="mb-2 block font-medium text-sm sm:text-base">
                        Number of Municipalities to Enroll <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        <Input 
                            id="numberOfMunicipalities" 
                            type="number" 
                            min="1"
                            value={formData.numberOfMunicipalities} 
                            onChange={(e) => {
                                setFormData({ ...formData, numberOfMunicipalities: e.target.value });
                                setErrors({ ...errors, numberOfMunicipalities: "" });
                            }}
                            onBlur={() => handleBlur("numberOfMunicipalities")}
                            className={`pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base ${touched.numberOfMunicipalities && errors.numberOfMunicipalities ? "border-red-500" : ""}`} 
                            placeholder="e.g., 5" 
                        />
                    </div>
                    {touched.numberOfMunicipalities && errors.numberOfMunicipalities && (<p className="text-xs sm:text-sm text-red-500 mt-1">{errors.numberOfMunicipalities}</p>)}
                </div>
            </motion.div>
        )}

        <div>
          <Label htmlFor="region" className="mb-2 block font-medium text-sm sm:text-base">
            Region <span className="text-red-500">*</span>
         </Label>
          <Select 
            value={formData.region} 
            onValueChange={(value) => {
              setFormData({ ...formData, region: value, municipality: "", barangay: "" });
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
              setFormData({ ...formData, municipality: value, barangay: "" });
              setErrors({ ...errors, municipality: "" });
            }}
            disabled={!formData.region || loadingMunicipalities}
          >
            <SelectTrigger className={`h-10 sm:h-12 text-sm sm:text-base ${touched.municipality && errors.municipality ? "border-red-500" : ""}`}>
              <SelectValue placeholder={!formData.region ? "Select region first" : loadingMunicipalities ? "Loading municipalities..." : "Select municipality"} />
            </SelectTrigger>
            <SelectContent className="max-h-48 sm:max-h-60 overflow-y-auto">
              {municipalities.map((muni, index) => (
                <SelectItem key={`${muni.name}-${index}`} value={muni.name}>
                    <span className="text-sm sm:text-base">{muni.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {touched.municipality && errors.municipality && (<p className="text-xs sm:text-sm text-red-500 mt-1">{errors.municipality}</p>)}
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
              <SelectValue placeholder={!formData.municipality ? "Select municipality first" : loadingBarangays ? "Loading barangays..." : "Select barangay"} />
            </SelectTrigger>
            <SelectContent className="max-h-48 sm:max-h-60 overflow-y-auto">
              {barangays.map((brgy, index) => (<SelectItem key={`${brgy.name}-${index}`} value={brgy.name}><span className="text-sm sm:text-base">{brgy.name}</span></SelectItem>))}
            </SelectContent>
          </Select>
          {touched.barangay && errors.barangay && (<p className="text-xs sm:text-sm text-red-500 mt-1">{errors.barangay}</p>)}
        </div>
      </div>
    </div>
  );
}