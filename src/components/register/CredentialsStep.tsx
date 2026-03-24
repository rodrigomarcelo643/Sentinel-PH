import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Lock, Eye, EyeOff, Check, CreditCard, Phone, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import type { FormData, FormErrors } from '@/@types/pages/register';

interface CredentialsStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  errors: FormErrors;
  touched: { [key: string]: boolean };
  handleBlur: (field: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  setErrors: (errors: FormErrors) => void;
}

export function CredentialsStep({ formData, setFormData, errors, touched, handleBlur, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, setErrors }: CredentialsStepProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1B365D] mb-1 sm:mb-2">Account Credentials</h2>
        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Create your login and choose a subscription</p>
      </div>

      {/* Username and Password Section */}
      <div className="space-y-4 sm:space-y-6">
        <div>
          <Label htmlFor="username" className="mb-2 block font-medium text-sm sm:text-base">Username <span className="text-red-500">*</span></Label>
          <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" /><Input id="username" type="text" value={formData.username} onChange={(e) => { setFormData({ ...formData, username: e.target.value }); setErrors({ ...errors, username: "" }); }} onBlur={() => handleBlur("username")} className={`pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base ${touched.username && errors.username ? "border-red-500" : ""}`} placeholder="Choose a username" /></div>
          {touched.username && errors.username && (<p className="text-xs sm:text-sm text-red-500 mt-1">{errors.username}</p>)}
        </div>
        <div>
          <Label htmlFor="password" className="mb-2 block font-medium text-sm sm:text-base">Password <span className="text-red-500">*</span></Label>
          <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" /><Input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setErrors({ ...errors, password: "" }); }} onBlur={() => handleBlur("password")} className={`pl-10 sm:pl-12 pr-10 sm:pr-12 h-10 sm:h-12 text-sm sm:text-base ${touched.password && errors.password ? "border-red-500" : ""}`} placeholder="Create a strong password" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}</button></div>
          {touched.password && errors.password && (<p className="text-xs sm:text-sm text-red-500 mt-1">{errors.password}</p>)}
        </div>
        <div>
          <Label htmlFor="confirmPassword" className="mb-2 block font-medium text-sm sm:text-base">Confirm Password <span className="text-red-500">*</span></Label>
          <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" /><Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); setErrors({ ...errors, confirmPassword: "" }); }} onBlur={() => handleBlur("confirmPassword")} className={`pl-10 sm:pl-12 pr-10 sm:pr-12 h-10 sm:h-12 text-sm sm:text-base ${touched.confirmPassword && errors.confirmPassword ? "border-red-500" : ""}`} placeholder="Confirm your password" /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}</button></div>
          {touched.confirmPassword && errors.confirmPassword && (<p className="text-xs sm:text-sm text-red-500 mt-1">{errors.confirmPassword}</p>)}
        </div>
      </div>

      {/* Subscription Plans */}
      <div>
        <Label className="mb-3 sm:mb-4 block font-medium text-sm sm:text-base">Subscription Plan <span className="text-red-500">*</span></Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {formData.accountType === 'bhw' ? (
            <div className="border-2 rounded-lg sm:rounded-xl p-4 sm:p-6 border-[#1B365D] bg-blue-50 shadow-lg">
                <h3 className="font-bold text-base sm:text-lg mb-2">Barangay Plan</h3>
                <p className="text-2xl sm:text-3xl font-bold text-[#1B365D] mb-3 sm:mb-4">₱300<span className="text-xs sm:text-sm font-normal text-gray-600">/month</span></p>
                <ul className="space-y-1 sm:space-y-2">
                    <li className="text-xs sm:text-sm text-gray-600 flex items-center gap-2"><Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />Up to 20 sentinels</li>
                    <li className="text-xs sm:text-sm text-gray-600 flex items-center gap-2"><Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />Basic analytics</li>
                    <li className="text-xs sm:text-sm text-gray-600 flex items-center gap-2"><Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />Email support</li>
                </ul>
            </div>
          ) : formData.accountType === 'regional' ? (
            <div className="border-2 rounded-lg sm:rounded-xl p-4 sm:p-6 border-[#1B365D] bg-blue-50 shadow-lg col-span-1 sm:col-span-2 lg:col-span-3">
              <h3 className="font-bold text-base sm:text-lg mb-2">Regional Contract</h3>
              <p className="text-2xl sm:text-3xl font-bold text-[#1B365D] mb-3 sm:mb-4">₱{(parseInt(formData.numberOfMunicipalities, 10) * 1000).toLocaleString()}<span className="text-xs sm:text-sm font-normal text-gray-600">/month</span></p>
              <ul className="space-y-1 sm:space-y-2">
                  <li className="text-xs sm:text-sm text-gray-600 flex items-center gap-2"><Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />{formData.numberOfMunicipalities} Municipalities</li>
                  <li className="text-xs sm:text-sm text-gray-600 flex items-center gap-2"><Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />Up to 20 barangays per municipality</li>
                  <li className="text-xs sm:text-sm text-gray-600 flex items-center gap-2"><Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />API Access & Dedicated Support</li>
              </ul>
            </div>
          ) : (
            [
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
                className={`border-2 rounded-lg sm:rounded-xl p-4 sm:p-6 cursor-pointer transition-all ${formData.subscription === plan.id ? "border-[#1B365D] bg-blue-50 shadow-lg" : "border-gray-200 hover:border-[#1B365D] hover:shadow-md"}`}
              >
                <h3 className="font-bold text-base sm:text-lg mb-2">{plan.name}</h3>
                <p className="text-2xl sm:text-3xl font-bold text-[#1B365D] mb-3 sm:mb-4">₱{plan.price}<span className="text-xs sm:text-sm font-normal text-gray-600">/month</span></p>
                <ul className="space-y-1 sm:space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-gray-600 flex items-center gap-2"><Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />{feature}</li>
                  ))}
                </ul>
              </motion.div>
            ))
          )}
        </div>
        {touched.subscription && errors.subscription && (<p className="text-xs sm:text-sm text-red-500 mt-2">{errors.subscription}</p>)}
      </div>

      {/* Payment Method */}
      <div>
        <Label htmlFor="paymentMethod" className="mb-2 block font-medium text-sm sm:text-base">Payment Method</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
          <div 
            onClick={() => {
              setFormData({...formData, paymentMethod: 'maya'});
              setErrors({...errors, paymentMethod: ''});
            }}
            className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all ${formData.paymentMethod === 'maya' ? 'border-[#1B365D] bg-blue-50 ring-1 ring-[#1B365D]' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <img src="/pay_maya_logo.jpg" alt="Maya" className="h-15 w-auto object-contain" />
            <div className="font-bold text-[#1B365D] flex items-center gap-2 text-sm "><CreditCard className="h-4 w-4" />Card Payment</div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Checkout</span>
          </div>
          <div 
            onClick={() => {
              setFormData({...formData, paymentMethod: 'maya_wallet'});
              setErrors({...errors, paymentMethod: ''});
            }}
            className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all ${formData.paymentMethod === 'maya_wallet' ? 'border-[#1B365D] bg-blue-50 ring-1 ring-[#1B365D]' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <img src="/pay_maya_logo.jpg" alt="Maya" className="h-15 w-auto object-contain" />
            <div className="font-bold text-[#1B365D] flex items-center gap-2 text-sm "><Wallet className="h-4 w-4" />E-Wallet</div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">QR / Wallet</span>
          </div>
          <div 
            onClick={() => {
              setFormData({...formData, paymentMethod: 'gcash'});
              setErrors({...errors, paymentMethod: ''});
            }}
            className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center  justify-center gap-3 transition-all ${formData.paymentMethod === 'gcash' ? 'border-[#007DFE] bg-blue-50 ring-1 ring-[#007DFE]' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <img src="/gcash_logo.png" alt="GCash" className="h-15 w-auto object-contain" />
            <div className="font-bold text-[#007DFE]  flex items-center gap-2 text-sm"><Wallet className="h-4 w-4" />E-Wallet</div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">QR / Wallet</span>
          </div>
        </div>
        {touched.paymentMethod && errors.paymentMethod && (<p className="text-xs sm:text-sm text-red-500 mt-2">{errors.paymentMethod}</p>)}
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
        {touched.agreeToTerms && errors.agreeToTerms && (<p className="text-xs sm:text-sm lg:text-base text-red-500 ml-6 sm:ml-8 lg:ml-10 xl:ml-12 font-medium">{errors.agreeToTerms}</p>)}
      </div>
    </div>
  );
}