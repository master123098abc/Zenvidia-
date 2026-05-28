import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, CheckCircle2, Search, UserCheck, Play, Instagram } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ReelsManager from './ReelsManager';

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [creators, setCreators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingReelsForCreator, setEditingReelsForCreator] = useState<any>(null);

  useEffect(() => {
    fetchCreators(activeTab.toLowerCase());
  }, [activeTab]);

  // GLOBAL SAFETY NET
  useEffect(() => {
    const safety = setTimeout(() => {
      setIsLoading(false);
    }, 4000);
    return () => clearTimeout(safety);
  }, []);

  const fetchCreators = async (status: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .ilike('status', status)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      if (data && data.length > 0) setCreators(data);
    } catch (err: any) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await supabase.from('creators').update({ status: 'active' }).eq('id', id);
      fetchCreators(activeTab.toLowerCase());
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await supabase.from('creators').update({ status: 'rejected' }).eq('id', id);
      fetchCreators(activeTab.toLowerCase());
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-neutral-950 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold text-white flex items-center">
              <ShieldCheck className="w-8 h-8 mr-3 text-cyan-400" />
              Admin Control Panel
            </h1>
            <p className="text-neutral-400 mt-2">Manage creator approvals and platform safety.</p>
          </div>
          <button onClick={onLogout} className="text-sm font-bold text-neutral-500 hover:text-white transition-colors">
            Sign Out
          </button>
        </div>

        <div className="flex space-x-2 border-b border-neutral-800 pb-px">
          {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-bold transition-all relative ${
                activeTab === tab ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {tab === 'PENDING' ? 'Pending Approvals' : tab === 'APPROVED' ? 'Active Creators' : 'Rejected'}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
              )}
            </button>
          ))}
        </div>

        <div>
          {isLoading ? (
            <div className="flex justify-center p-12">
               <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : creators.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center text-neutral-500">
               No {activeTab.toLowerCase()} creators found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creators.map((c) => (
                <div key={c.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
                      {c.profile_url ? (
                        <img src={c.profile_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="font-bold text-xl">{c.ig_handle?.[0]}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">@{c.ig_handle}</h3>
                      <p className="text-sm text-neutral-400">{c.primary_niche}</p>
                      <p className="text-[10px] text-cyan-400 uppercase tracking-widest mt-1">
                        {c.follower_count?.toLocaleString()} Followers
                      </p>
                    </div>
                  </div>
                  
                  {activeTab === 'PENDING' && (
                    <div className="flex gap-2 mt-6">
                      <button 
                        onClick={() => handleApprove(c.id)}
                        className="flex-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/50 py-2.5 rounded-xl font-bold flex items-center justify-center transition-colors"
                      >
                         <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                      </button>
                      <button 
                        onClick={() => handleReject(c.id)}
                        className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 py-2.5 rounded-xl font-bold transition-colors"
                      >
                         Reject
                      </button>
                    </div>
                  )}

                  <div className="mt-4">
                     <button
                        onClick={() => setEditingReelsForCreator(c)}
                        className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 py-2 rounded-xl font-bold flex items-center justify-center transition-colors"
                     >
                        <Instagram className="w-4 h-4 mr-2 text-pink-500" /> Manage Reels
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Manage Reels Modal */}
      {editingReelsForCreator && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 rounded-[2.5rem] p-6 sm:p-8 w-full max-w-5xl shadow-2xl relative border border-neutral-800 max-h-[90vh] overflow-y-auto">
             <button 
               onClick={() => setEditingReelsForCreator(null)}
               className="absolute top-6 right-6 text-neutral-500 hover:text-white"
             >
               ✕
             </button>
             <h2 className="text-2xl font-bold text-white mb-2">Manage Reels for @{editingReelsForCreator.ig_handle}</h2>
             <p className="text-neutral-400 mb-6">You can add up to 10 Instagram Reel URLs.</p>
             
             <ReelsManager 
               creatorId={editingReelsForCreator.id}
               initialReelUrls={Array.from({length: 10}).map((_, i) => editingReelsForCreator[`reel_url_${i+1}`])}
               onSaved={() => {
                 setEditingReelsForCreator(null);
                 fetchCreators(activeTab.toLowerCase());
               }}
             />
          </div>
        </div>
      )}
    </div>
  );
}
