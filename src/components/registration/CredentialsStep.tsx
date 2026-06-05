import { Lock, Eye, EyeOff } from "lucide-react";
import { PhilippinesFlag } from "@/components/PhilippinesFlag";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface CredentialsStepProps {
  errors: string[];
  contactNumber: string;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (value: boolean) => void;
  agreedToPolicy: boolean;
  setAgreedToPolicy: (value: boolean) => void;
}

export function CredentialsStep({
  errors,
  contactNumber,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  agreedToPolicy,
  setAgreedToPolicy,
}: CredentialsStepProps) {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#1B365D]">Account Credentials</h2>

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
        <Label>Username *</Label>
        <div className="flex items-center rounded-md border border-gray-300 bg-gray-50 px-4">
          <PhilippinesFlag className="mr-2" />
          <span className="mr-2 text-sm font-medium text-gray-500">+63</span>
          <div className="mr-2 h-6 w-px bg-gray-300" />
          <span className="py-3 text-sm text-gray-800">{contactNumber}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {confirmPassword.length > 0 && (
          <p className={`text-xs ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
            {passwordsMatch ? "✓ Passwords match" : "✕ Passwords do not match"}
          </p>
        )}
      </div>

      {password.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-700 text-sm font-semibold mb-2">Password Requirements:</p>
          <ul className="space-y-1 text-sm">
            <li className={hasMinLength ? "text-green-600" : "text-gray-400"}>
              {hasMinLength ? "✓" : "○"} At least 8 characters
            </li>
            <li className={hasUpperCase ? "text-green-600" : "text-gray-400"}>
              {hasUpperCase ? "✓" : "○"} One uppercase letter
            </li>
            <li className={hasLowerCase ? "text-green-600" : "text-gray-400"}>
              {hasLowerCase ? "✓" : "○"} One lowercase letter
            </li>
            <li className={hasNumber ? "text-green-600" : "text-gray-400"}>
              {hasNumber ? "✓" : "○"} One number
            </li>
            <li className={hasSpecialChar ? "text-green-600" : "text-gray-400"}>
              {hasSpecialChar ? "✓" : "○"} One special character
            </li>
          </ul>
        </div>
      )}

      <div className="flex items-start gap-3">
        <Checkbox
          id="agreeToPolicy"
          checked={agreedToPolicy}
          onCheckedChange={(checked) => setAgreedToPolicy(checked === true)}
        />
        <label htmlFor="agreeToPolicy" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
          I agree to the{" "}
          <span className="text-[#1B365D] font-semibold underline">Terms and Conditions</span> and{" "}
          <span className="text-[#1B365D] font-semibold underline">Privacy Policy</span>
        </label>
      </div>
    </div>
  );
}

export function isCredentialsStepValid(
  password: string,
  confirmPassword: string,
  agreedToPolicy: boolean
): boolean {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  return Boolean(
    passwordsMatch &&
      hasMinLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar &&
      agreedToPolicy
  );
}
