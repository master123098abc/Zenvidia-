import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Info, CheckCircle2 } from 'lucide-react';

interface SmartPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName: string;
}

export default function SmartPitchModal({ isOpen, onClose, creatorName }: SmartPitchModalProps) {
  const [bonusBudget, setBonusBudget] = useState(2500);
  const [hasMaxCap, setHasMaxCap] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white shadow-2xl rounded-[2rem] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between sticky top-0 z-10">
            <div>
              <h2 className="font-display text-2xl font-bold text-neutral-900">Send Offer to {creatorName}</h2>
              <p className="text-sm text-neutral-500 font-medium flex items-center mt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500 mr-1.5" /> 
                Escrow Protection Enabled
              </p>
            </div>
            <button onClick={onClose} className="p-2 bg-white border border-neutral-200 rounded-full hover:bg-neutral-100 transition-colors">
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 overflow-y-auto space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Base Pay */}
              <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Fixed Base Pay</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium pb-0.5">₹</span>
                  <input 
                    type="text" 
                    value="1,500" 
                    disabled 
                    className="w-full pl-8 pr-4 py-3 bg-white border border-neutral-200 rounded-xl font-bold text-neutral-900 cursor-not-allowed opacity-80"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 group cursor-help">
                    <Info className="w-4 h-4 text-neutral-400" />
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-neutral-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                      Locked minimum base pay for this creator tier.
                    </div>
                  </div>
                </div>
              </div>

              {/* Bonus Toggle */}
              <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100 flex flex-col justify-center">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Max Budget Cap</label>
                    <p className="text-sm text-neutral-600 font-medium">Limit total bonus payout</p>
                  </div>
                  <button 
                    onClick={() => setHasMaxCap(!hasMaxCap)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${hasMaxCap ? 'bg-cyan-500' : 'bg-neutral-300'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${hasMaxCap ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Fair-Price Slider */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
               <div className="flex justify-between items-end mb-8">
                 <div>
                   <h3 className="font-bold text-neutral-900 flex items-center">
                     Performance Bonus
                     <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded uppercase tracking-wider">Smart Slider</span>
                   </h3>
                   <p className="text-sm text-neutral-500 mt-1">₹500 for every 5,000 True-Reach views</p>
                 </div>
                 <div className="text-right">
                   <span className="text-2xl font-display font-bold text-cyan-600">₹{bonusBudget.toLocaleString()}</span>
                   <span className="text-xs text-neutral-400 block font-medium">Est. Bonus Total</span>
                 </div>
               </div>

               {/* Slider Track with Zones */}
               <div className="relative pt-10 pb-4">
                 {/* Floating Safe Zone Badge */}
                 <div className="absolute top-0 left-1/2 w-1/2 flex justify-center -mt-2">
                   <motion.div 
                     animate={{ y: [0, -4, 0] }}
                     transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                     className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-emerald-500/30 flex items-center whitespace-nowrap"
                   >
                     <CheckCircle2 className="w-3 h-3 mr-1" /> Safe Pick Rate
                   </motion.div>
                 </div>

                 {/* The Track Backgrounds */}
                 <div className="relative h-3 rounded-full flex overflow-hidden bg-neutral-100 mt-2">
                   {/* Budget Zone (Yellow) */}
                   <div className="h-full w-1/3 bg-amber-200/60" />
                   {/* Fair Value Zone (Green) */}
                   <div className="h-full w-2/3 bg-emerald-400/40" />
                 </div>

                 {/* Native Range Input overlapping for functionality */}
                 <input 
                   type="range"
                   min="500"
                   max="10000"
                   step="500"
                   value={bonusBudget || 500}
                   onChange={(e) => setBonusBudget(parseInt(e.target.value) || 500)}
                   className="absolute top-12 left-0 w-full h-3 opacity-0 cursor-pointer z-10"
                 />
                 
                 {/* Custom Thumb Visualizer */}
                 <div 
                   className="absolute top-[41px] w-6 h-6 bg-white border-2 border-cyan-500 rounded-full shadow-md z-0 pointer-events-none transform -translate-x-1/2 transition-all duration-100 ease-out flex items-center justify-center"
                   style={{ left: `${((bonusBudget - 500) / 9500) * 100}%` }}
                 >
                   <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                 </div>
                 
                 <div className="flex justify-between mt-3 text-xs font-bold text-neutral-400">
                   <span>Budget</span>
                   <span>Fair Value</span>
                 </div>
               </div>
            </div>

            {/* Campaign Brief */}
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Campaign Brief</label>
              <textarea 
                rows={4}
                placeholder="Describe your campaign goals, deliverables (e.g., 1 Reel + 2 Stories), and key talking points..."
                className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all font-medium text-neutral-700"
              />
            </div>

            {/* Social Currency Agreement */}
            <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 flex items-start space-x-3">
               <div className="flex-shrink-0 pt-0.5">
                 <input 
                   type="checkbox" 
                   className="w-5 h-5 rounded border-orange-300 text-orange-500 focus:ring-orange-500 bg-white"
                   defaultChecked
                 />
               </div>
               <div>
                 <h4 className="text-sm font-bold text-neutral-900 flex items-center">
                   Social Currency Agreement <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase tracking-wider rounded">Free Beta</span>
                 </h4>
                 <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                   Platform fee waived! I agree that the creator will tag <span className="font-semibold text-neutral-900">@Zenvidia</span> and mention <span className="font-semibold text-neutral-900">'Collab via Zenvidia'</span> in the final post.
                 </p>
               </div>
            </div>
            
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-5 border-t border-neutral-100 bg-white flex justify-between items-center sticky bottom-0 z-10">
             <div className="text-sm font-semibold text-neutral-500">
               Total Escrow Commitment: <span className="text-neutral-900 font-bold ml-1 text-lg">₹{(1500 + (hasMaxCap ? bonusBudget : 0)).toLocaleString()}{!hasMaxCap && '+'}</span>
             </div>
             <button onClick={onClose} className="bg-gradient-to-r from-orange-500 to-[#FF512F] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transform hover:-translate-y-0.5 transition-all text-sm tracking-wide uppercase">
               Fund Escrow & Send Pitch
             </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
