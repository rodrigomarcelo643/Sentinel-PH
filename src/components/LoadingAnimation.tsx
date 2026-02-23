import { motion } from "framer-motion";

export default function LoadingAnimation() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-100 flex items-center justify-center bg-white overflow-hidden"
    >
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        {/* BIGGER RADAR / SCANNING RINGS */}
        <div className="absolute flex items-center justify-center pointer-events-none">
          {[1, 2, 3, 4, 5].map((ring) => (
            <motion.div
              key={ring}
              className="absolute border-2 border-blue-100 rounded-full"
              initial={{ width: 250, height: 250, opacity: 0 }}
              animate={{
                width: [300, 900], // Significant increase in spread
                height: [300, 900],
                opacity: [1, 0],
              }}
              transition={{
                duration: 4, // Slower, more epic pulse
                repeat: Infinity,
                delay: ring * 1,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {/* LOGO CONTAINER */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center"
        >
          {/* Bigger Logo with Floating Animation */}
          <motion.div
            animate={{
              y: [0, -15, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex justify-center items-center"
          >
            <img
              src="/sentinel_ph_logo.png"
              alt="SentinelPH"
              className="h-32 md:h-40 w-auto "
            />
          </motion.div>

          {/* BIGGER LOADING TEXT / STATUS */}
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex gap-3">
              {[0, 0.2, 0.4].map((delay) => (
                <motion.div
                  key={delay}
                  animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.4, 1, 0.4],
                    backgroundColor: ["#1B365D", "#3b82f6", "#1B365D"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay,
                  }}
                  className="w-3 h-3 bg-[#1B365D] rounded-full shadow-lg shadow-blue-200"
                />
              ))}
            </div>

            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-sm uppercase tracking-[0.4em] font-black text-[#1B365D] ml-[0.8em]"
            >
              Establishing Connection
            </motion.p>
          </div>
        </motion.div>

        {/* Subtle Ambient Glow */}
        <div className="absolute w-125 h-125 bg-blue-100 rounded-full blur-[120px] opacity-30 pointer-events-none" />
      </div>
    </motion.div>
  );
}
