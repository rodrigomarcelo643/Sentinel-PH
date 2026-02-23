import { BrowserRouter } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
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
    </BrowserRouter>
  );
}

export default App;
