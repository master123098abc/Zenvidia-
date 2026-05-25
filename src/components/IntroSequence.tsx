import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

export default function IntroSequence({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1500),
      setTimeout(() => setStage(2), 3000),
      setTimeout(() => setStage(3), 4500),
      setTimeout(() => onComplete(), 7500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-[#050505] flex items-center justify-center overflow-hidden"
      style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
    >
      {/* Stage 6: Background floating particles */}
      {stage >= 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} className="absolute inset-0 pointer-events-none">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 0.4, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
              className={`absolute w-1 h-1 rounded-full ${i % 2 === 0 ? 'bg-cyan-400 shadow-[0_0_10px_#06B6D4]' : 'bg-orange-400 shadow-[0_0_10px_#F97316]'}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Stage 1: Dot -> Ring */}
      {stage < 2 && (
        <motion.div
          initial={{ scale: 0, opacity: 0, borderRadius: '100%' }}
          animate={
            stage === 0 
              ? { scale: [0, 1.5, 1], opacity: 1, backgroundColor: '#06B6D4', boxShadow: '0 0 20px #06B6D4' } 
              : { scale: 30, opacity: 0, backgroundColor: 'transparent', border: '3px solid #06B6D4', boxShadow: '0 0 50px #F97316' }
          }
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute w-4 h-4"
        />
      )}

      {/* Stage 3: Ring Shatter Burst */}
      {stage === 2 && (
        <div className="absolute top-1/2 left-1/2 pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ 
                x: (Math.random() - 0.5) * window.innerWidth * 1.2, 
                y: (Math.random() - 0.5) * window.innerHeight * 1.2, 
                opacity: 0, 
                scale: 0 
              }}
              transition={{ duration: 2, ease: "easeOut" }}
              className={`absolute w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-cyan-500 shadow-[0_0_15px_#06B6D4]' : 'bg-orange-500 shadow-[0_0_15px_#F97316]'}`}
            />
          ))}
        </div>
      )}

      {/* Stages 4 & 5: Title, Subtitle */}
      {stage >= 2 && (
        <div className="relative z-10 flex flex-col items-center pointer-events-none">
          {/* Logo Text */}
          <div className="flex space-x-1 sm:space-x-3 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold">
            {"ZENVIDIA".split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 1.3, filter: 'blur(20px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
                className={char === " " ? "w-3 sm:w-6 md:w-8" : "bg-clip-text text-transparent bg-gradient-to-b from-white via-neutral-100 to-neutral-400"}
              >
                {char}
              </motion.span>
            ))}
          </div>

          {/* Subtitle Reveal */}
          <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-0 text-sm sm:text-lg md:text-xl font-display uppercase tracking-[0.15em] sm:tracking-[0.3em] px-4 text-center">
            {["Where", "Creators", "Meet", "Brands"].map((word, i) => (
              <span key={i} className="relative inline-block">
                {/* Thin text fades up */}
                <motion.span
                  initial={{ opacity: 0, y: 15 }}
                  animate={stage >= 3 ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="block font-light text-neutral-400"
                >
                  {word}
                </motion.span>

                {/* Bold text snaps to replace */}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={stage >= 3 ? { opacity: 1 } : {}}
                  transition={{ duration: 0.05, delay: i * 0.15 + 1.2 }}
                  className={`absolute left-0 top-0 font-bold ${i % 2 === 0 ? 'text-cyan-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]' : 'text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]'}`}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Orbiting Cards (Desktop only) */}
      {stage >= 3 && (
        <div className="absolute inset-0 hidden lg:block pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, rotateZ: Math.random() * 60 - 30 }}
              animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
              transition={{ duration: 1.5, delay: i * 0.15, type: 'spring', bounce: 0.2 }}
              className="absolute top-1/2 left-1/2 w-48 h-64 -mx-24 -my-32"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div 
                className="w-full h-full bg-neutral-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex flex-col justify-end"
                style={{ 
                  animation: `orbit-cards 20s linear infinite`, 
                  animationDelay: `${-i * (20/6)}s`,
                  transformStyle: 'preserve-3d',
                  boxShadow: `inset 0 0 20px rgba(255,255,255,0.02), 0 10px 40px ${i % 2 === 0 ? 'rgba(6,182,212,0.1)' : 'rgba(249,115,22,0.1)'}`
                }}
              >
                 <div className={`w-12 h-12 rounded-full mb-6 relative`}>
                   <div className={`absolute inset-0 rounded-full blur-md opacity-40 ${i % 2 === 0 ? 'bg-cyan-500' : 'bg-orange-500'}`} />
                   <div className={`absolute inset-0 rounded-full border border-white/20 ${i % 2 === 0 ? 'bg-cyan-400/80' : 'bg-orange-400/80'}`} />
                 </div>
                 <div className="w-3/4 h-2 bg-white/20 rounded-full mb-3" />
                 <div className="w-1/2 h-2 bg-white/10 rounded-full" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
