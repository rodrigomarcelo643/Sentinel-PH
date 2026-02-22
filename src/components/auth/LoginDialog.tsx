import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Eye, EyeOff } from "lucide-react";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login:", { username, password });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="items-center">
          <img 
            src="/sentinel_ph_logo.png" 
            alt="SentinelPH" 
            className="h-30 w-auto"
          />
          <DialogTitle className="text-2xl font-bold text-[#1B365D]">
            Welcome Back
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <Input
              id="username"
              type="text"
              placeholder=" "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12 pl-10 peer"
              required
            />
            <Label 
              htmlFor="username"
              className="absolute left-10 top-1/2 -translate-y-1/2 bg-white px-1 text-gray-500 transition-all duration-200 peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#1B365D] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs"
            >
              Username
            </Label>
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 pl-10 pr-10 peer"
              required
            />
            <Label 
              htmlFor="password"
              className="absolute left-10 top-1/2 -translate-y-1/2 bg-white px-1 text-gray-500 transition-all duration-200 peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#1B365D] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs"
            >
              Password
            </Label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex justify-end text-sm">
            <a href="#" className="text-[#CE1126] hover:underline">
              Forgot password?
            </a>
          </div>

          <Button 
            type="submit" 
            className="w-full shadow-lg shadow-[#1B365D]/30"
          >
            Sign In
          </Button>

          <div className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/register" className="text-[#CE1126] font-medium hover:underline">
              Register here
            </a>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
