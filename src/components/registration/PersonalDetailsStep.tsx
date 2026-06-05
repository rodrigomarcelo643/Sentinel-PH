import { useState, useEffect } from "react";
import { MapPin, Loader2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PhilippinesFlag } from "@/components/PhilippinesFlag";
import { geoapifyService } from "@/services/geoapifyService";

export const COMMUNITY_ROLES = [
  "Resident",
  "Sari-Sari Store Owner / Market Vendor",
  "Tricycle Driver / PUV Operator",
  "Barangay Tanod / Leader",
  "Religious Leader / Church Worker",
  "Traditional Healer / Hilot",
  "Pharmacy Staff",
  "Pharmacy Owner",
  "Other (Specify)",
];

interface PersonalDetailsStepProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  middleInitial: string;
  setMiddleInitial: (value: string) => void;
  contactNumber: string;
  handleContactChange: (text: string) => void;
  email: string;
  setEmail: (value: string) => void;
  region: string;
  setRegion: (value: string) => void;
  municipality: string;
  setMunicipality: (value: string) => void;
  barangay: string;
  setBarangay: (value: string) => void;
  communityRole: string;
  setCommunityRole: (value: string) => void;
  customRole: string;
  setCustomRole: (value: string) => void;
  errors: string[];
}

export function PersonalDetailsStep({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  middleInitial,
  setMiddleInitial,
  contactNumber,
  handleContactChange,
  email,
  setEmail,
  region,
  setRegion,
  municipality,
  setMunicipality,
  barangay,
  setBarangay,
  communityRole,
  setCommunityRole,
  customRole,
  setCustomRole,
  errors,
}: PersonalDetailsStepProps) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    if (!region && !municipality && !barangay) {
      getLocation();
    }
  }, []);

  const getLocation = async () => {
    if (!navigator.geolocation) return;

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const result = await geoapifyService.reverseGeocode(latitude, longitude);

        if (result) {
          setRegion(result.state || "Central Visayas");
          setMunicipality(result.city || "Unknown Municipality");
          setBarangay(result.suburb || result.district || "Unknown Barangay");
        } else {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            if (res.ok) {
              const data = await res.json();
              const address = data.address || {};
              setRegion(address.state || address.region || "Central Visayas");
              setMunicipality(
                address.city || address.town || address.municipality || "Unknown Municipality"
              );
              setBarangay(
                address.suburb ||
                  address.neighbourhood ||
                  address.village ||
                  "Unknown Barangay"
              );
            }
          } catch {
            // leave fields empty for manual entry
          }
        }
        setLoadingLocation(false);
      },
      () => setLoadingLocation(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1B365D] mb-4">Basic Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              placeholder="Enter first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={errors.includes("First Name is required") ? "border-red-500" : ""}
            />
            {errors.includes("First Name is required") && (
              <p className="text-red-500 text-sm">First Name is required</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              placeholder="Enter last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={errors.includes("Last Name is required") ? "border-red-500" : ""}
            />
            {errors.includes("Last Name is required") && (
              <p className="text-red-500 text-sm">Last Name is required</p>
            )}
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Label htmlFor="middleInitial">Middle Initial (Optional)</Label>
          <Input
            id="middleInitial"
            placeholder="M.I."
            value={middleInitial}
            onChange={(e) => setMiddleInitial(e.target.value.slice(0, 2).toUpperCase())}
            maxLength={2}
            className="max-w-[120px]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Community Role *</Label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className={`flex w-full items-center justify-between rounded-md border bg-white px-4 py-3 text-left text-sm ${
              errors.includes("Community Role is required") ? "border-red-500" : "border-gray-300"
            }`}
          >
            <span className={communityRole ? "text-gray-900" : "text-gray-500"}>
              {communityRole || "Select your role"}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
          {showRoleDropdown && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg max-h-60 overflow-y-auto">
              {COMMUNITY_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setCommunityRole(role);
                    setShowRoleDropdown(false);
                    if (role !== "Other (Specify)") setCustomRole("");
                  }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.includes("Community Role is required") && (
          <p className="text-red-500 text-sm">Community Role is required</p>
        )}
      </div>

      {communityRole === "Other (Specify)" && (
        <div className="space-y-2">
          <Label htmlFor="customRole">Specify Role *</Label>
          <Input
            id="customRole"
            placeholder="Enter your community role"
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            className={errors.includes("Custom role is required") ? "border-red-500" : ""}
          />
          {errors.includes("Custom role is required") && (
            <p className="text-red-500 text-sm">Custom role is required</p>
          )}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-[#1B365D] mb-4">Contact Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Contact Number *</Label>
            <div
              className={`flex items-center rounded-md border bg-white px-4 ${
                errors.includes("Valid contact number is required") ? "border-red-500" : "border-gray-300"
              }`}
            >
              <PhilippinesFlag className="mr-2" />
              <span className="mr-2 text-sm font-medium text-gray-500">+63</span>
              <div className="mr-2 h-6 w-px bg-gray-300" />
              <input
                type="tel"
                placeholder="9XX XXX XXXX"
                value={contactNumber}
                onChange={(e) => handleContactChange(e.target.value)}
                maxLength={10}
                className="flex-1 py-3 text-sm outline-none bg-transparent"
              />
            </div>
            {errors.includes("Valid contact number is required") && (
              <p className="text-red-500 text-sm">Valid contact number is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.includes("Email is required") ? "border-red-500" : ""}
            />
            {errors.includes("Email is required") && (
              <p className="text-red-500 text-sm">Email is required</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1B365D]">Full Address</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={getLocation}
            disabled={loadingLocation}
            className="gap-2 text-[#1B365D] border-[#1B365D]/20"
          >
            {loadingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            {loadingLocation ? "Getting..." : "Auto-fill"}
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="region">Region *</Label>
            <Input
              id="region"
              placeholder="Enter Region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="municipality">Municipality *</Label>
            <Input
              id="municipality"
              placeholder="Enter Municipality"
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="barangay">Barangay *</Label>
            <Input
              id="barangay"
              placeholder="Enter Barangay"
              value={barangay}
              onChange={(e) => setBarangay(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
