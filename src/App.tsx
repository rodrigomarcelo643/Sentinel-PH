import { BrowserRouter, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Navbar from "./components/Navbar";
import AppRoutes from "./router";
import LoadingAnimation from "./components/LoadingAnimation";
import { Toaster } from "@/components/ui/toaster";

function AppContent() {
  const { } = useAuth();
  const location = useLocation();
  
  // Show navbar only on specific public pages
  const showNavbar = location.pathname === '/' ||
                     location.pathname === '/about' ||
                     location.pathname === '/pricing' ||
                     location.pathname === '/map' ||
                     location.pathname.startsWith('/region/') ||
                     location.pathname === '/resident/report';
  
  return (
    <>
      {showNavbar && <Navbar />}
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
      <ThemeProvider>
        <AuthProvider>
          <AnimatePresence mode="wait">
            {loading ? (
              <LoadingAnimation key="loading" />
            ) : (
              <AppContent />
            )}
          </AnimatePresence>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
