import { motion } from 'motion/react';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-[#FAFAFA] dark:bg-neutral-950 transition-colors duration-300">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 80, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full opacity-[0.35] dark:opacity-[0.15] mix-blend-multiply dark:mix-blend-screen filter blur-[100px] max-w-[800px] max-h-[800px]"
        style={{ backgroundColor: '#06B6D4' }} // Teal
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -100, 0],
          y: [0, 100, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full opacity-[0.35] dark:opacity-[0.15] mix-blend-multiply dark:mix-blend-screen filter blur-[120px] max-w-[700px] max-h-[700px]"
        style={{ backgroundColor: '#F97316' }} // Orange
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 120, -60, 0],
          y: [0, -80, 40, 0],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-[-10%] left-[20%] w-[70vw] h-[70vw] rounded-full opacity-[0.25] dark:opacity-[0.1] mix-blend-multiply dark:mix-blend-screen filter blur-[140px] max-w-[1000px] max-h-[1000px]"
        style={{ backgroundColor: '#06B6D4' }} // Teal
      />
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          x: [0, -60, 60, 0],
          y: [0, -40, 80, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute top-[40%] left-[10%] w-[50vw] h-[50vw] rounded-full opacity-[0.25] dark:opacity-[0.1] mix-blend-multiply dark:mix-blend-screen filter blur-[130px] max-w-[700px] max-h-[700px]"
        style={{ backgroundColor: '#F97316' }} // Orange
      />
    </div>
  );
}
