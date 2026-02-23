import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Bell, Globe, Activity, Map, Lock,
} from "lucide-react";
import heroBg from "@/assets/images/hero_bg.jpg";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen  flex items-center overflow-hidden bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto w-full pt-8  px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Content / Integrated Circle Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 flex items-center justify-center lg:justify-start"
          >
            
            {/* Main Container for Circle + Content */}
            <div className="relative w-[500px] h-[500px] flex items-center justify-center">
              
              {/* --- ROTATING BACKGROUND ELEMENTS --- */}
              {/* Outer Slow Rotation Ring */}
              <div className="absolute inset-0 rounded-full border border-slate-200 animate-[spin_50s_linear_infinite]" />
              
              {/* Mid-Ring with Dotted Border */}
              <div className="absolute inset-8 rounded-full border-2 border-dashed border-[#1B365D]/10 animate-[spin_30s_linear_reverse_infinite]" />

              {/* Network Nodes (Icons) positioned around the circle */}
              <div className="absolute inset-0 animate-[spin_40s_linear_infinite]">
                {/* Node 1: Map */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm -rotate-[inherit]">
                  <Map className="w-5 h-5 text-[#1B365D]" />
                </div>
                {/* Node 2: Alert */}
                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm -rotate-[inherit]">
                  <Bell className="w-5 h-5 text-[#CE1126]" />
                </div>
                {/* Node 3: Security */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm -rotate-[inherit]">
                  <Lock className="w-5 h-5 text-[#1B365D]" />
                </div>
                {/* Node 4: Global */}
                <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm -rotate-[inherit]">
                  <Globe className="w-5 h-5 text-[#1B365D]" />
                </div>
              </div>

              {/* --- INNER TEXT CONTENT (STATIONARY) --- */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative z-20 text-center flex flex-col items-center px-12"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B365D]/5 border border-[#1B365D]/10 mb-4"
                >
                  <Activity className="w-3 h-3 text-[#CE1126] animate-pulse" />
                  <span className="text-[10px] font-bold text-[#1B365D] uppercase tracking-[0.2em]">Live Network</span>
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
                >
                  <span className="text-[#1B365D]">Observe. </span>
                  <span className="text-[#CE1126]">Report. </span>
                  <br />
                  <span className="text-[#1B365D]">Respond.</span>
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="text-slate-500 text-sm mb-8 max-w-[280px] leading-relaxed"
                >
                  Join a community-driven intelligence network dedicated to Philippine safety and vigilance.
                </motion.p>

                {/* Buttons contained within the circle width */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                  className="flex flex-col w-full max-w-[200px] gap-3"
                >
                  <Button asChild className="bg-[#1B365D] hover:bg-[#1B365D]/90 text-white shadow-md rounded-full h-11">
                    <Link to="/register">Get Started</Link>
                  </Button>
                  <Button variant="ghost" asChild className="border border-[#1B365D] text-[#1B365D] hover:bg-slate-100 rounded-full h-11">
                    <Link to="/about">Learn More</Link>
                  </Button>
                </motion.div>
              </motion.div>
              
            </div>
          </motion.div>

          {/* Right Section / Image remains the same */}
          <div className="absolute top-0 right-0 bottom-0 w-[50%] lg:block hidden">
            <div className="absolute inset-y-0 left-0 w-64 bg-gradient-to-r from-[#f8fafc] via-[#f8fafc]/60 to-transparent z-10"></div>
            <img
              src={heroBg}
              alt="Intelligence Dashboard"
              className="w-full h-full object-cover grayscale-[30%]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}