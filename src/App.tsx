import { BrowserRouter } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "./components/Navbar";
import AppRoutes from "./router";
import LoadingAnimation from "./components/LoadingAnimation";

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
            <>
              <Navbar />
              <AppRoutes />
            </>
          )}
        </AnimatePresence>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
