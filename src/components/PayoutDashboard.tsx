import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ShieldAlert, BadgeCheck, FileText, CalendarCheck, ExternalLink, Lock, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function PayoutDashboard() {
  const [deals, setDeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    setIsLoading(true);
    try {
       const { data: userData } = await supabase.auth.getUser();
       if (!userData?.user) {
         setDeals([]);
         return;
       }

       // Could be a brand or creator, but deals table holds both
       const { data: creator } = await supabase.from('creators').select('id').eq('user_id', userData.user.id).single();
       const { data: brand } = await supabase.from('brands').select('id').eq('user_id', userData.user.id).single();

       let query = supabase.from('deals').select('*').order('created_at', { ascending: false });
       
       if (creator) {
         query = query.eq('creator_id', creator.id);
       } else if (brand) {
         query = query.eq('brand_id', brand.id);
       }

       const { data, error } = await query;
       if (!error && data) {
         setDeals(data);
       }
    } catch (err) {
       console.error("Error fetching deals:", err);
    } finally {
       setIsLoading(false);
    }
  };

  const completedDeals = deals.filter(d => d.status === 'completed' || d.status === 'COMPLETED');
  const activeDeals = deals.filter(d => d.status !== 'completed' && d.status !== 'COMPLETED' && d.status !== 'declined');

  const totalEarnings = completedDeals.reduce((sum, d) => sum + (d.price || 0), 0);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-neutral-900 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-white">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">Payouts & Active Deals</h1>
        <p className="text-gray-400 mt-2">Manage your collaborations, track earnings, and settle platform fees.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
         <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-sm flex flex-col justify-center">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">Active Deals</p>
            <h2 className="text-4xl font-display font-bold text-white">{activeDeals.length}</h2>
         </div>
         <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-sm flex flex-col justify-center">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">Total Earnings</p>
            <h2 className="text-4xl font-display font-bold text-teal-400">₹{totalEarnings.toLocaleString()}</h2>
         </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      ) : deals.length === 0 ? (
        <div className="bg-gray-800 rounded-3xl p-12 text-center shadow-2xl border border-gray-700 relative overflow-hidden">
          <div className="w-16 h-16 bg-gray-900 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <Search className="w-8 h-8" />
           </div>
           <h3 className="text-xl font-bold text-white mb-2">No deals found</h3>
           <p className="text-gray-400">Complete a campaign to see it listed here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {deals.map(deal => {
            const isCompleted = deal.status === 'completed' || deal.status === 'COMPLETED';
            const dealValue = deal.price || 0;
            const platformFee = Math.round(dealValue * 0.05);

            return (
              <motion.div 
                key={deal.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-700 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4">
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${isCompleted ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800/50' : 'bg-orange-900/40 text-orange-400 border-orange-800/50'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isCompleted ? 'Completed' : 'Active'}</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex items-center space-x-3">
                       <div>
                         <p className="text-xs font-bold text-teal-500 uppercase tracking-widest">Deal #{deal.id}</p>
                         <h3 className="text-xl font-bold text-white">Collaboration Campaign</h3>
                       </div>
                    </div>

                    <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-700">
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400 font-medium">Total Deal Value</span>
                          <span className="text-xl font-bold text-white">₹{dealValue.toLocaleString()}</span>
                       </div>
                       
                       <div className="border-l-4 border-teal-500 bg-teal-900/20 p-4 rounded-r-xl mt-4">
                          <h4 className="font-bold text-teal-400 text-sm mb-1 flex items-center">
                            <Lock className="w-4 h-4 mr-1.5" /> Zenvidia Honor Code
                          </h4>
                          <div className="flex justify-between items-center text-sm font-medium">
                             <span className="text-gray-300">5% Platform Fee</span>
                             <span className="text-white font-bold">₹{platformFee.toLocaleString()}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-2">
                             Payable upon successful direct collaboration to sustain the platform.
                          </p>
                       </div>
                    </div>

                    {isCompleted && dealValue > 0 && (
                      <a 
                        href={`https://wa.me/916003727271?text=Hi%20Zenvidia,%20I've%20completed%20Deal%20%23${deal.id}%20worth%20%E2%82%B9${dealValue}.%20I'm%20ready%20to%20pay%20my%205%25%20Zenvidia%20Honor%20Fee%20(%E2%82%B9${platformFee}).`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full mt-4 flex items-center justify-center space-x-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-[#25D366]/20 transition-all transform hover:-translate-y-0.5"
                      >
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        <span>WhatsApp Admin to Pay Platform Fee</span>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
