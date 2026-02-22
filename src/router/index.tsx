import { Routes, Route } from "react-router-dom";
import LandingPage from "@/components/LandingPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<div className="pt-20 p-8">About Page</div>} />
      <Route path="/map" element={<div className="pt-20 p-8">Map Page</div>} />
      <Route path="/region/:regionId" element={<div className="pt-20 p-8">Region Page</div>} />
      <Route path="/signin" element={<div className="pt-20 p-8">Sign In Page</div>} />
      <Route path="/register" element={<div className="pt-20 p-8">Register Page</div>} />
    </Routes>
  );
}
