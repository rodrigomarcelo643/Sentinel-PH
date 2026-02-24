import { BrowserRouter, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Navbar from "./components/Navbar";
import AppRoutes from "./router";
import LoadingAnimation from "./components/LoadingAnimation";
import { Toaster } from "@/components/ui/toaster";

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  
  // Hide navbar on dashboard routes and register page
  const isDashboardRoute = location.pathname.startsWith('/admin') || 
                          location.pathname.startsWith('/dashboard') ||
                          location.pathname.startsWith('/bhw') ||
                          location.pathname === '/register';
  
  return (
    <>
      {!isDashboardRoute && <Navbar />}
      <AppRoutes />
      <Toaster />
    </>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingAnimation key="loading" />
          ) : (
            <AppContent />
          )}
        </AnimatePresence>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
