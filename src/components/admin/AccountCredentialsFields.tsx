import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isPasswordValid, passwordsMatch } from "@/lib/passwordValidation";

interface AccountCredentialsFieldsProps {
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (value: boolean) => void;
  passwordLabel?: string;
  confirmLabel?: string;
  showRequirements?: boolean;
}

export function AccountCredentialsFields({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordLabel = "Password",
  confirmLabel = "Confirm Password",
  showRequirements = true,
}: AccountCredentialsFieldsProps) {
  const valid = isPasswordValid(password);
  const matched = passwordsMatch(password, confirmPassword);

  return (
    <>
      <div>
        <Label htmlFor="account-password">{passwordLabel} *</Label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="account-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a secure password"
            className="pl-9 pr-9"
            autoComplete="new-password"
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
      <div>
        <Label htmlFor="account-confirm-password">{confirmLabel} *</Label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="account-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            className="pl-9 pr-9"
            autoComplete="new-password"
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
          <p className={`text-xs mt-1 ${matched ? "text-green-600" : "text-red-500"}`}>
            {matched ? "Passwords match" : "Passwords do not match"}
          </p>
        )}
      </div>
      {showRequirements && password.length > 0 && (
        <p className={`text-xs col-span-2 ${valid ? "text-green-600" : "text-gray-500"}`}>
          {valid
            ? "Password meets requirements"
            : "Use at least 8 characters with uppercase, lowercase, and a number"}
        </p>
      )}
    </>
  );
}
