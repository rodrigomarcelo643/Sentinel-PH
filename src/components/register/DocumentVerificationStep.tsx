import { Button } from "@/components/ui/button";
import { CloudUpload, FileText, X, Shield, Check } from "lucide-react";
import { motion } from "framer-motion";
import type { FormData, FormErrors } from '@/@types/pages/register';

interface DocumentVerificationStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  errors: FormErrors;
  touched: { [key: string]: boolean };
  handleBlur: (field: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
  setErrors: (errors: FormErrors) => void;
}

export function DocumentVerificationStep({ formData, errors, touched, handleBlur, handleFileUpload, removeFile }: DocumentVerificationStepProps) {
  const getDocumentRequirements = () => {
    switch (formData.accountType) {
      case "regional": return ["Regional Health Office Authorization Letter", "DOH Accreditation Certificate", "Valid Government ID of Regional Health Officer", "Proof of Office Address", "Official Seal/Logo (Digital Copy)"];
      case "municipal": return ["Municipal Health Office Authorization Letter", "LGU Accreditation Certificate", "Valid Government ID of Municipal Health Officer", "Proof of Office Address", "Barangay Coverage List"];
      case "bhw": return ["BHW Certificate of Training", "Barangay Health Center Authorization", "Valid Government ID", "Proof of Barangay Residence", "BHW Identification Card"];
      default: return [];
    }
  };

  return (
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
                        <img src={imageUrl!} alt={file.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2"><FileText className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-[#1B365D] mb-2" /><p className="text-xs text-gray-500 px-2 text-center truncate w-full">{file.name}</p></div>
                      )}
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)} className="absolute top-1 right-1 sm:top-2 sm:right-2 h-6 w-6 sm:h-8 sm:w-8 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"><X className="h-3 w-3 sm:h-4 sm:w-4" /></Button>
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
  );
}