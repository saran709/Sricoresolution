import React from 'react';
import { motion } from 'motion/react';

export function Loader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6">
      {/* Outer pulsing ring */}
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-20 h-20 rounded-full bg-amber-500/20"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative w-12 h-12 bg-white rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center border border-amber-100"
        >
          {/* Inner animated logo element (abstract square) */}
          <motion.div
            animate={{
              rotate: [0, 90, 180, 270, 360],
              borderRadius: ["20%", "50%", "50%", "20%", "20%"]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-5 h-5 bg-gradient-to-tr from-amber-600 to-amber-400"
          />
        </motion.div>
      </div>
      
      {/* Loading Text */}
      <div className="flex flex-col items-center gap-2">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-sm font-medium text-amber-900/80 tracking-widest uppercase"
        >
          Loading
        </motion.div>
        {/* Progress bar line */}
        <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            animate={{
              x: ["-100%", "100%"]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-1/2 h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center fixed inset-0 z-[100] backdrop-blur-sm">
      <Loader />
    </div>
  );
}
