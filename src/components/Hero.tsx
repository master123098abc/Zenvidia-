import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRef } from 'react';
import OrbitingCreatorsScene from './OrbitingCreatorsScene';

export default function Hero({ onNavigate, onOpenReels }: { onNavigate: (view: 'BRAND_DASHBOARD' | 'CREATOR_PORTAL') => void, onOpenReels: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  return (
    <section ref={containerRef} className="relative py-40 md:py-56 lg:py-72 overflow-hidden bg-transparent flex items-center justify-center min-h-[90vh]">
      
      {/* Background Dot Grid Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#06B6D4_2px,transparent_2px)] [background-size:48px_48px] opacity-[0.15] pointer-events-none" />

      {/* Orbiting Creators Parallax Background */}
      <OrbitingCreatorsScene />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center justify-center text-center">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center max-w-4xl mx-auto bg-white/40 backdrop-blur-md p-6 sm:p-10 md:p-16 rounded-[2.5rem] border border-white/60 shadow-2xl shadow-cyan-900/5 w-full"
          >
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.02] mb-8 md:mb-12 tracking-tight text-neutral-950 drop-shadow-sm uppercase">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-orange-500">ZENVIDIA</span>
            </h1>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto justify-center flex-wrap shrink-0">
              <button onClick={() => onNavigate('BRAND_DASHBOARD')} className="shimmer-btn flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-orange-500 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-bold text-lg md:text-xl shadow-[0_8px_30px_rgb(249,115,22,0.3)] hover:shadow-[0_8px_30px_rgb(249,115,22,0.5)] transform hover:-translate-y-1 transition duration-300 w-full sm:w-auto min-h-[56px]">
                <span className="relative z-10">For Brands</span>
                <ArrowRight className="relative z-10 w-5 h-5 md:w-6 md:h-6" />
              </button>
              
              <button onClick={() => onNavigate('CREATOR_PORTAL')} className="flex items-center justify-center space-x-2 bg-white/80 backdrop-blur-md text-neutral-900 border border-white hover:border-cyan-500 px-8 md:px-10 py-4 md:py-5 rounded-2xl font-bold text-lg md:text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 w-full sm:w-auto min-h-[56px]">
                <span>For Creators</span>
              </button>
              
              <button onClick={onOpenReels} className="flex items-center justify-center space-x-2 bg-neutral-900 backdrop-blur-md text-white border border-neutral-800 hover:border-teal-500 hover:text-teal-400 px-8 md:px-10 py-4 md:py-5 rounded-2xl font-bold text-lg md:text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 w-full sm:w-auto min-h-[56px]">
                 <span className="text-xl">✨</span>
                 <span>Discover Reels</span>
              </button>
            </div>
            
            <div className="mt-12 md:mt-16 flex items-center space-x-4">
               <div className="flex -space-x-4">
                  {[
                    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80"
                  ].map((img, i) => (
                    <img key={i} src={img} alt="Creator" className="w-12 h-12 rounded-full border-4 border-white object-cover shadow-sm" loading="lazy" />
                  ))}
               </div>
               <div className="text-sm font-semibold text-neutral-800 tracking-wide">
                  <span className="text-orange-500 font-bold text-lg">500+</span> CREATORS
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
