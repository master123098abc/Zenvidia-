import React, { useState } from 'react';
import { ShieldCheck, Send, Paperclip, Lock, CheckCircle2, FileText, Anchor } from 'lucide-react';
import { motion } from 'motion/react';

export default function DealRoom({ userRole, creator }: { userRole: 'BRAND' | 'CREATOR', creator?: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [basePay, setBasePay] = useState<number>(1000);
  const [performanceBonus, setPerformanceBonus] = useState<number>(500);

  const totalValue = (basePay || 0) + (performanceBonus || 0);
  const platformFee = Math.round(totalValue * 0.05);

  const handleSend = () => {
    if (!inputMsg.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: userRole, text: inputMsg, time: 'Now' }]);
    setInputMsg('');
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:pt-[72px] bg-[#0a0a0a] text-white w-full max-w-[1600px] mx-auto overflow-hidden">
      
      {/* Background Dark Starry Theme */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40 mix-blend-screen"
          style={{
            backgroundImage: `radial-gradient(1.5px 1.5px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 40px 70px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 90px 40px, #ffffff, rgba(0,0,0,0))`,
            backgroundSize: '150px 150px'
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/20 via-[#0a0a0a]/80 to-[#0a0a0a]"></div>
      </div>

      {/* Left Panel: Deal Terms */}
      <div className="w-full lg:w-[450px] flex-shrink-0 bg-gray-950/40 border-b lg:border-b-0 lg:border-r border-teal-900/30 p-6 sm:p-8 flex flex-col space-y-6 z-10 overflow-y-auto lg:min-h-0 backdrop-blur-xl relative pb-24 lg:pb-8 pt-[90px] lg:pt-8">
        <div className="mb-2">
           <div className="px-3 py-1 bg-teal-900/50 text-teal-400 text-xs font-bold uppercase tracking-widest rounded-full inline-block mb-4 border border-teal-800">Deal Negotiation</div>
           <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">Campaign Terms</h2>
           <p className="text-gray-400 font-medium mt-1">Creator: @{creator?.ig_handle || 'Creator'}</p>
        </div>

        {/* Action Panel (Deal Terms) */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-teal-500/30 rounded-2xl p-5 shadow-2xl">
           <h3 className="text-lg font-bold text-white mb-5 flex items-center">
             <ShieldCheck className="w-5 h-5 mr-2 text-teal-400" />
             Financials
           </h3>
           
           <div className="space-y-4 mb-6">
             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Base Pay (₹)</label>
               <input 
                 type="number" 
                 value={basePay}
                 onChange={(e) => setBasePay(parseInt(e.target.value) || 0)}
                 className="w-full bg-gray-950 border border-teal-900/50 rounded-xl px-4 py-3 text-white font-medium focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Performance Bonus (₹)</label>
               <input 
                 type="number" 
                 value={performanceBonus}
                 onChange={(e) => setPerformanceBonus(parseInt(e.target.value) || 0)}
                 className="w-full bg-gray-950 border border-teal-900/50 rounded-xl px-4 py-3 text-white font-medium focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
               />
             </div>
           </div>

           <div className="bg-black/40 rounded-xl p-4 border border-teal-900/40 mb-6">
             <div className="text-sm font-medium text-gray-400 mb-1">Total Deal Value</div>
             <div className="text-3xl font-display font-bold text-white">₹{totalValue.toLocaleString()}</div>
           </div>

           <button className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(13,148,136,0.3)] transition-all flex items-center justify-center tracking-wide active:scale-95">
             <CheckCircle2 className="w-5 h-5 mr-2" />
             Accept Deal
           </button>
        </div>

        {/* 5% Honor Code System */}
        <div className="border-l-4 border-teal-400 bg-teal-900/10 p-4 rounded-r-xl mt-2 backdrop-blur-md">
           <h4 className="font-bold text-teal-300 text-sm mb-2 flex items-center">
             <Lock className="w-4 h-4 mr-1.5" /> Zenvidia Honor Code
           </h4>
           <p className="text-sm text-gray-300 font-medium mb-2 leading-relaxed">
             A 5% platform fee <span className="font-bold text-white">(₹{platformFee.toLocaleString()})</span> is payable upon successful direct payout.
           </p>
           <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-3 pt-3 border-t border-teal-900/30">
             Zenvidia operates strictly as a discovery platform. Payments are transferred directly between parties. We rely on your Honor Code.
           </p>
        </div>

      </div>

      {/* Right Panel: Chat Interface */}
      <div className="flex-1 flex flex-col bg-transparent z-10 min-h-[50vh] lg:min-h-0 relative pb-24 lg:pb-0">
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 pt-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => {
              if (msg.sender === 'SYSTEM') {
                 return (
                   <div key={msg.id} className="flex justify-center my-6">
                     <div className="bg-gray-900/80 border border-teal-900/50 text-teal-400 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center shadow-lg backdrop-blur-md">
                       <ShieldCheck className="w-3.5 h-3.5 mr-2" />
                       {msg.text}
                     </div>
                   </div>
                 );
              }

              const isMe = msg.sender === userRole;

              return (
                <div key={msg.id} className={`flex items-end ${isMe ? 'justify-end' : ''}`}>
                  {!isMe && (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-800 border border-teal-900/50 flex-shrink-0 mr-3 flex items-center justify-center font-bold text-teal-500 text-sm">
                      {msg.sender === 'BRAND' ? 'BR' : 'CR'}
                    </div>
                  )}
                  
                  <div className={`
                    max-w-[80%] rounded-2xl px-5 py-3.5 text-[15px] sm:text-base font-medium shadow-lg leading-relaxed
                    ${isMe 
                      ? 'bg-teal-900/30 text-white rounded-br-sm border border-teal-800/30' 
                      : 'bg-gray-800 text-white border border-gray-700/50 rounded-bl-sm'}
                  `}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 sm:p-6 bg-gray-900/80 backdrop-blur-xl border-t border-teal-900/30 relative z-20">
           <div className="max-w-3xl mx-auto">
             <div className="flex items-end bg-gray-950 rounded-2xl p-1.5 border border-teal-900/50 focus-within:ring-1 focus-within:ring-teal-400 focus-within:border-teal-400 transition-all shadow-inner">
               <button className="p-3 text-gray-500 hover:text-teal-400 transition-colors mb-0.5">
                 <Paperclip className="w-5 h-5" />
               </button>
               <input 
                 type="text"
                 value={inputMsg}
                 onChange={(e) => setInputMsg(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                 placeholder="Type your message..." 
                 className="flex-1 bg-transparent border-none focus:ring-0 py-3.5 text-[15px] text-white font-medium placeholder-gray-600 outline-none"
               />
               <button 
                 onClick={handleSend}
                 disabled={!inputMsg.trim()}
                 className={`p-3.5 rounded-xl shadow-md transition-all active:scale-95 mb-0.5 ml-1 ${inputMsg.trim() ? 'bg-teal-600 text-white hover:bg-teal-500 shadow-[0_0_15px_rgba(13,148,136,0.3)]' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
               >
                 <Send className="w-5 h-5 ml-0.5" />
               </button>
             </div>
             <p className="text-center text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest mt-3 flex justify-center items-center">
               <Lock className="w-3.5 h-3.5 mr-1.5 text-teal-600" /> End-to-end Encrypted
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
