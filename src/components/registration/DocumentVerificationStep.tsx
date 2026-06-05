import { useState } from "react";
import { ScanLine, Camera, ChevronDown, X } from "lucide-react";
import { Label } from "@/components/ui/label";

export const ID_TYPES = [
  "Driver's License",
  "Passport",
  "National ID",
  "Voter's ID",
  "SSS ID",
  "UMID",
];

interface DocumentVerificationStepProps {
  errors: string[];
  idType: string;
  setIdType: (value: string) => void;
  validId: File | null;
  validIdPreview: string | null;
  setValidId: (file: File | null, preview: string | null) => void;
  selfie: File | null;
  selfiePreview: string | null;
  setSelfie: (file: File | null, preview: string | null) => void;
}

export function DocumentVerificationStep({
  errors,
  idType,
  setIdType,
  validId,
  validIdPreview,
  setValidId,
  selfie,
  selfiePreview,
  setSelfie,
}: DocumentVerificationStepProps) {
  const [showIdDropdown, setShowIdDropdown] = useState(false);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null, preview: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setter(file, reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#1B365D]">Document Verification</h2>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-3">
          {errors.map((error, index) => (
            <p key={index} className="text-red-600 text-sm">
              • {error}
            </p>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label>Select ID Type *</Label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowIdDropdown(!showIdDropdown)}
            className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-3 text-left text-sm"
          >
            <span className={idType ? "text-gray-900" : "text-gray-500"}>
              {idType || "Select ID Type"}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
          {showIdDropdown && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
              {ID_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setIdType(type);
                    setShowIdDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Valid ID *</Label>
          {validId && (
            <button
              type="button"
              onClick={() => setValidId(null, null)}
              className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <label
          className={`block cursor-pointer rounded-xl border-2 border-dashed overflow-hidden transition-colors ${
            errors.includes("Valid ID is required") ? "border-red-400" : "border-gray-300 hover:border-[#1B365D]"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileSelect(e, setValidId)}
          />
          {validIdPreview ? (
            <img src={validIdPreview} alt="Valid ID" className="w-full h-48 object-cover" />
          ) : (
            <div className="p-8 flex flex-col items-center bg-white">
              <ScanLine className="h-12 w-12 text-[#1B365D]" strokeWidth={1.5} />
              <p className="text-[#1B365D] font-semibold mt-4">Scan or upload your ID</p>
            </div>
          )}
        </label>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Selfie *</Label>
          {selfie && (
            <button
              type="button"
              onClick={() => setSelfie(null, null)}
              className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <label
          className={`block cursor-pointer rounded-xl border-2 border-dashed overflow-hidden transition-colors ${
            errors.includes("Selfie is required") ? "border-red-400" : "border-gray-300 hover:border-[#1B365D]"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => handleFileSelect(e, setSelfie)}
          />
          {selfiePreview ? (
            <img src={selfiePreview} alt="Selfie" className="w-full h-48 object-cover" />
          ) : (
            <div className="p-8 flex flex-col items-center bg-white">
              <Camera className="h-12 w-12 text-[#1B365D]" strokeWidth={1.5} />
              <p className="text-[#1B365D] font-semibold mt-4">Take or upload a selfie</p>
            </div>
          )}
        </label>
      </div>
    </div>
  );
}
