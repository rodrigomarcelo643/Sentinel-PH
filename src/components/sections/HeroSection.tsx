import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
   ArrowRight, CircleFadingPlus , Activity, 
  
} from "lucide-react";
import Video1 from "@/assets/videos/Video1.mp4"
import Video2 from "@/assets/videos/Video2.mp4"
import Video3 from "@/assets/videos/Video4.mp4"

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden">
      {/* Background Video Grid - Full Coverage */}
      <div className="absolute inset-0 w-full h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full h-full">
          {/* Video 1 */}
          <div className="relative w-full h-full overflow-hidden">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2"
            >
              <source src={Video1} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/60" />
          </div>

          {/* Video 2 */}
          <div className="relative w-full h-full overflow-hidden">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2"
            >
              <source src={Video2} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/60" />
          </div>

          {/* Video 3 */}
          <div className="relative w-full h-full overflow-hidden">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2"
            >
              <source src={Video3} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/60" />
          </div>
        </div>
      </div>

      {/* Enhanced Gradient Overlay for Better Text Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30 z-[5]" />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10 z-[5]" />

      {/* Overlay Content - Centered */}
      <div className="relative z-10 flex items-center justify-center w-full min-h-screen px-4 sm:px-6 lg:px-8 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-5xl mx-auto w-full"
        >
        

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl sm:text-4xl  mt-20 md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Spot symptoms early.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-300">
              Report before it spreads.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-base sm:text-lg text-gray-200 max-w-3xl mx-auto mb-8 leading-relaxed"
          >
            HealthWatch empowers communities to detect and report symptoms instantly. 
            From fever and cough to unusual fatigue — early reporting saves lives. 
            <span className="block text-emerald-300 font-medium mt-2">
              Turn everyday observations into real-time health intelligence.
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link to="/resident/report">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white h-11 !px-8 py-6  rounded-md font-medium transition-all duration-300 group">
                <CircleFadingPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Report Symptoms
                <ArrowRight className="w-5 h-5 ml-2 transition-transform" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:text-white text-white !px-8 py-6 rounded-[5px]  transition-all duration-300">
                <Activity className="w-5 h-5 " />
                Learn Early Detection
              </Button>
            </Link>
          </motion.div>
          
        </motion.div>
      </div>
    </section>
  );
}