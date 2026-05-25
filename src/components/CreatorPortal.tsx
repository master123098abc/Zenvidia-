import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Instagram, Play, Heart, MessageCircle, AlertTriangle, User, Camera, Image, MessageSquare, Activity, Users, Plus } from 'lucide-react';
import CreatorRegistrationModal from './CreatorRegistrationModal';
import { supabase } from '../lib/supabase';
import CreatorInbox from './CreatorInbox';

export default function CreatorPortal({ onLogout, onLogin, onChatOpen, currentUserHandle, onCollaborate, onCompleteProfile }: { onLogout?: () => void, onLogin?: (handle: string) => void, onChatOpen?: (isOpen: boolean) => void, currentUserHandle?: string | null, onCollaborate?: () => void, onCompleteProfile?: () => void }) {
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [currentHandle, setCurrentHandle] = useState<string | null>(currentUserHandle || localStorage.getItem('zenova_handle'));
  const [creatorData, setCreatorData] = useState<any>(null);

  useEffect(() => {
    if (currentUserHandle) {
       setCurrentHandle(currentUserHandle);
    }
  }, [currentUserHandle]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'PORTFOLIO' | 'INBOX'>('PORTFOLIO');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentHandle) {
      fetchCreatorData(currentHandle);
    }
  }, [currentHandle]);

  const fetchCreatorData = async (handle: string) => {
    setIsLoading(true);
    const timeoutId = setTimeout(() => setIsLoading(false), 5000);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('ig_handle', handle)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setCreatorData(data);
      } else {
        // If not found, maybe invalid handle in localstorage
        setCreatorData(null);
        localStorage.removeItem('zenova_handle');
        setCurrentHandle(null);
        if(onLogout) onLogout();
      }
    } catch (err: any) {
      console.error('Fetch Error:', err);
      setErrorMsg("Failed to load profile data.");
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !creatorData) return;
    
    setIsUploading(true);
    
    try {
      const CLOUDINARY_CLOUD_NAME = 'dooosiyxw';
      const CLOUDINARY_UPLOAD_PRESET = 'Zenvidia'; 
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      
      if (data.secure_url) {
        const newUrl = data.secure_url;
        
        // Save URL to creators table -> profile_url
        const { error } = await supabase
          .from('creators')
          .update({ profile_url: newUrl })
          .eq('id', creatorData.id);
          
        if (!error) {
          setCreatorData({ ...creatorData, profile_url: newUrl });
        }
      }
    } catch (err) {
      console.error("Cloudinary upload error", err);
    }
    
    setIsUploading(false);
  };

  const [newReelUrl, setNewReelUrl] = useState('');
  const [reels, setReels] = useState<string[]>([]);
  const [isSavingReel, setIsSavingReel] = useState(false);

  useEffect(() => {
    if (creatorData) {
      const loadedReels = Array.from({length: 10}).map((_, i) => creatorData[`reel_url_${i+1}`]).filter(Boolean) as string[];
      setReels(loadedReels);
    }
  }, [creatorData]);

  const handleAddReel = async () => {
    if (!newReelUrl.trim() || reels.length >= 10 || !creatorData) return;
    setIsSavingReel(true);
    
    const updatedReels = [newReelUrl.trim(), ...reels].slice(0, 10);
    setReels(updatedReels);
    setNewReelUrl('');
    
    const updateData: any = {};
    for (let i = 0; i < 10; i++) {
        updateData[`reel_url_${i+1}`] = updatedReels[i] || null;
    }
    
    try {
      await supabase.from('creators').update(updateData).eq('id', creatorData.id);
      fetchCreatorData(creatorData.ig_handle);
    } catch (err) {
      console.error(err);
    }
    setIsSavingReel(false);
  };

  const handleRemoveReel = async (indexToRemove: number) => {
    if (!creatorData) return;
    setIsSavingReel(true);
    const updatedReels = reels.filter((_, idx) => idx !== indexToRemove);
    setReels(updatedReels);
    
    const updateData: any = {};
    for (let i = 0; i < 10; i++) {
        updateData[`reel_url_${i+1}`] = updatedReels[i] || null;
    }
    
    try {
      await supabase.from('creators').update(updateData).eq('id', creatorData.id);
      fetchCreatorData(creatorData.ig_handle);
    } catch (err) {
      console.error(err);
    }
    setIsSavingReel(false);
  };

  const handleRegistrationSuccess = (handle: string) => {
    localStorage.setItem('zenova_handle', handle);
    setCurrentHandle(handle);
    if (onLogin) onLogin(handle);
  };

  if (currentHandle && isLoading && !creatorData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Loading your premium profile...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white p-4 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong.</h2>
        <p className="text-neutral-400 max-w-md">{errorMsg}</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col lg:flex-row min-h-screen pt-24 pb-12 bg-[#0a0a0a] text-white px-4 sm:px-6 lg:px-8 gap-8 max-w-[1400px] mx-auto w-full overflow-hidden">
      
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

        {/* Sidebar Onboarding & Profile Preview */}
      <aside className="relative z-10 w-full lg:w-[400px] flex-shrink-0 flex flex-col gap-6">
        
        {/* Onboarding Connect */}
        {!currentHandle && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900/40 backdrop-blur-md p-6 sm:p-8 rounded-[2.5rem] shadow-xl border border-teal-900/50"
          >
            <h2 className="font-display text-2xl font-bold text-white mb-2">Join Zenvidia</h2>
            <p className="text-gray-400 text-sm mb-8">Apply to join Assam's premium creator marketplace and unlock exclusive local brand deals.</p>
            
            <button 
              onClick={() => setIsRegOpen(true)}
              className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white py-4 rounded-2xl font-bold shadow-[0_0_20px_rgba(13,148,136,0.3)] active:scale-95 transition-transform min-h-[56px] hover:opacity-90"
            >
              <Instagram className="w-6 h-6 leading-none" />
              <span className="text-lg">Apply as Creator</span>
            </button>
          </motion.div>
        )}

        {/* Warning Banner / Pending State */}
        {currentHandle && creatorData?.status === 'pending' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-2xl flex items-start shadow-sm"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-amber-900 font-bold text-sm">Under Review</h4>
              <p className="text-amber-700 text-sm mt-1 font-medium">
                Profile under manual review. You are not visible to brands yet. Our founder will verify your application soon.
              </p>
            </div>
          </motion.div>
        )}

        {/* WhatsApp Payout Widget (Active only) */}
        {currentHandle && (creatorData?.status === 'active' || creatorData?.status === 'approved') && (
          <motion.div 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 shadow-sm"
          >
             <h4 className="font-bold text-emerald-900 text-sm mb-2">Claim Payouts</h4>
             <p className="text-emerald-700 text-xs mb-4">You have access to fast payouts for completed collaborations.</p>
             <a 
               href="https://wa.me/916003727271" 
               target="_blank" 
               rel="noopener noreferrer"
               className="w-full flex items-center justify-center space-x-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold shadow-md transition-all transform hover:-translate-y-0.5"
             >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-4 h-4 fill-current">
                 <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
               </svg>
               <span>WhatsApp Admin</span>
             </a>
          </motion.div>
        )}

        {/* Profile Preview Card (Mocking what it looks like after connect) */}
        {currentHandle && creatorData && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/40 backdrop-blur-md rounded-[2.5rem] border border-teal-900/50 p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center relative"
          >
          <div className="absolute top-6 right-6">
            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${(creatorData.status === 'active' || creatorData.status === 'approved') ? 'bg-teal-900/50 text-teal-400 border border-teal-800' : 'bg-gray-800 text-gray-400'}`}>
              {(creatorData.status === 'active' || creatorData.status === 'approved') ? 'Active' : 'Pending'}
            </span>
          </div>

          <div className="flex flex-col items-center gap-4 mb-6 mt-4 w-full">
            <div className="relative group">
              <div 
                className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-teal-400 to-cyan-500 shadow-[0_0_20px_rgba(45,212,191,0.3)] shrink-0 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-full h-full bg-gray-900 rounded-full relative overflow-hidden flex items-center justify-center text-3xl font-display font-bold text-teal-400">
                  <span className="absolute uppercase">{creatorData?.ig_handle?.[0] || 'Z'}</span>
                  <img 
                    src={creatorData?.profile_url || (creatorData?.ig_handle ? `https://unavatar.io/instagram/${creatorData.ig_handle}` : '')}
                    alt={creatorData?.ig_handle || ''}
                    className="absolute inset-0 w-full h-full object-cover z-10 bg-gray-900"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 bg-teal-500 hover:bg-teal-400 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110 disabled:opacity-50 z-20 border-2 border-gray-900"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-2xl text-white truncate mb-1">@{creatorData?.ig_handle}</h4>
              <a href={creatorData?.ig_handle ? `https://instagram.com/${creatorData.ig_handle}` : '#'} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 text-sm mb-3 flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4 mr-1.5" /> Instagram Profile
              </a>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <span className="px-3 py-1 bg-teal-900/30 text-teal-300 rounded-full text-xs font-bold border border-teal-800/50 backdrop-blur-sm">{creatorData?.niche || 'Creator'}</span>
              </div>
            </div>
          </div>
          
          <div className="w-full space-y-3 mt-4">
            <button 
              onClick={() => onCollaborate && onCollaborate()}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(13,148,136,0.3)] transition-all flex items-center justify-center tracking-wide"
            >
              <MessageCircle className="w-5 h-5 mr-2" /> Collaborate
            </button>
            <button
               onClick={() => {
                 localStorage.removeItem('zenova_handle');
                 setCurrentHandle(null);
                 setCreatorData(null);
                 if (onLogout) onLogout();
               }}
               className="w-full mt-2 text-center text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors uppercase tracking-widest"
            >
              Sign Out
            </button>
          </div>
        </motion.div>
        )}
        
        {/* Navigation Tabs - Added below Profile */}
        {currentHandle && creatorData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            <button
              onClick={() => setActiveTab('PORTFOLIO')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                activeTab === 'PORTFOLIO' 
                  ? 'bg-teal-600 text-white font-bold shadow-[0_0_20px_rgba(13,148,136,0.3)]' 
                  : 'bg-gray-900/40 text-gray-400 font-medium hover:bg-gray-800/60 border border-teal-900/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <Image className="w-5 h-5" />
                <span>My Portfolio</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('INBOX')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                activeTab === 'INBOX' 
                  ? 'bg-teal-600 text-white font-bold shadow-[0_0_20px_rgba(13,148,136,0.3)]' 
                  : 'bg-gray-900/40 text-gray-400 font-medium hover:bg-gray-800/60 border border-teal-900/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5" />
                <span>Inbox & Messages</span>
              </div>
              {/* Optional unread badge placeholder */}
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            </button>
          </motion.div>
        )}
      </aside>

      {/* Main Content - Gallery or Inbox */}
      <main className="relative z-10 flex-1 min-w-0">
        <div className="mb-8 pl-2">
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white mb-3">
             {activeTab === 'PORTFOLIO' ? 'Creator Portfolio' : 'Creator Inbox'}
          </h1>
          <p className="text-gray-400 text-lg">
             {activeTab === 'PORTFOLIO' 
               ? 'Manage your portfolio, track analytics, and showcase your best work.' 
               : 'View and reply to messages from Brand partners.'}
          </p>
        </div>

        {activeTab === 'PORTFOLIO' ? (
          <div className="min-h-[500px]">
            {creatorData ? (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                 {/* Premium Stats Grid */}
                 <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="bg-gray-900/40 backdrop-blur-md border border-teal-900/50 p-5 rounded-2xl shadow-xl flex flex-col justify-center">
                     <div className="flex items-center text-gray-400 mb-2 font-medium">
                       <Users className="w-5 h-5 mr-2 text-teal-500" /> Total Followers
                     </div>
                     <div className="text-teal-400 text-3xl font-display font-bold">
                       {(creatorData.follower_count || 0) >= 1000 ? `${((creatorData.follower_count || 0) / 1000).toFixed(1)}K` : (creatorData.follower_count || 0)}
                     </div>
                   </div>
                   <div className="bg-gray-900/40 backdrop-blur-md border border-teal-900/50 p-5 rounded-2xl shadow-xl flex flex-col justify-center">
                     <div className="flex items-center text-gray-400 mb-2 font-medium">
                       <Activity className="w-5 h-5 mr-2 text-teal-500" /> Avg. Engagement
                     </div>
                     <div className="text-teal-400 text-3xl font-display font-bold">
                       {creatorData.engagement_rate ? `~ ${creatorData.engagement_rate}%` : '0%'}
                     </div>
                   </div>
                 </div>

                 {/* Featured Reels Portfolio */}
                 <div className="bg-gray-900/40 backdrop-blur-md border border-teal-900/50 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl">
                   <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                     <Play className="w-6 h-6 mr-3 text-teal-400 fill-teal-400/20" /> 
                     Featured Reels Portfolio
                   </h3>
                   
                   {/* Smart Input */}
                   <div className="flex flex-col sm:flex-row gap-4 mb-8">
                     <div className="relative flex-1">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <Instagram className="h-5 w-5 text-teal-500/50" />
                       </div>
                       <input 
                         type="text" 
                         placeholder="Paste Instagram Reel URL" 
                         value={newReelUrl}
                         onChange={(e) => setNewReelUrl(e.target.value)}
                         className="w-full bg-gray-950/50 border border-teal-900/50 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-500 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all font-medium"
                       />
                     </div>
                     <button 
                       onClick={handleAddReel}
                       disabled={isSavingReel || !newReelUrl.trim()}
                       className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-[0_0_20px_rgba(13,148,136,0.3)] min-w-[140px] flex items-center justify-center disabled:opacity-50 tracking-wide"
                     >
                        {isSavingReel ? 'Saving...' : <><Plus className="w-5 h-5 mr-2" /> Add Reel</>}
                     </button>
                   </div>

                   {/* Visual Grid */}
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                     {reels.map((url, idx) => (
                       <div key={idx} className="aspect-[9/16] rounded-2xl bg-gray-800 relative overflow-hidden group cursor-pointer border border-teal-900/30 shadow-lg">
                         <video 
                           src={url}
                           className="absolute inset-0 w-full h-full object-cover z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                           autoPlay muted loop playsInline
                         />
                         
                         {/* Hover Analytics Overlay */}
                         <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                           <div className="flex items-center justify-between text-white font-bold">
                             <div className="flex items-center space-x-2">
                               <span className="flex items-center"><Play className="w-4 h-4 mr-1 fill-white" /> {Math.floor(Math.random() * 900 + 100)}K</span>
                             </div>
                             <div className="flex items-center space-x-2 text-teal-300">
                               <span className="flex items-center"><Heart className="w-4 h-4 mr-1 fill-teal-400 text-teal-400" /> {Math.floor(Math.random() * 40 + 5)}K</span>
                             </div>
                           </div>
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleRemoveReel(idx); }}
                             className="absolute top-3 right-3 bg-black/60 hover:bg-red-500/80 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                           </button>
                         </div>
                       </div>
                     ))}
                     
                     {reels.length === 0 && (
                       <div className="col-span-2 md:col-span-3 flex justify-center py-12">
                         <div className="flex flex-col items-center bg-gray-900/30 p-8 rounded-3xl border border-dashed border-teal-900/50 max-w-sm w-full text-center">
                           <div className="w-16 h-16 rounded-full bg-teal-900/20 flex items-center justify-center mb-4">
                             <Instagram className="w-8 h-8 text-teal-500" />
                           </div>
                           <h4 className="text-white font-bold text-lg mb-2">No Reels Yet</h4>
                           <p className="text-gray-400 text-sm">Paste your Instagram Reel URL above to start building your premium portfolio.</p>
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[300px] bg-gray-900/40 backdrop-blur-md rounded-[2.5rem] border border-teal-900/50 p-8 text-center relative overflow-hidden shadow-2xl">
                 <h4 className="text-white font-bold text-lg mb-2">No Profile Found</h4>
                 <p className="text-gray-400 mb-6">Your creator profile could not be loaded or may not exist.</p>
                 <button onClick={() => onCompleteProfile && onCompleteProfile()} className="bg-teal-600 px-6 py-3 rounded-2xl text-white font-bold hover:bg-teal-500 transition-colors">
                    Complete Your Profile
                 </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-900/60 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-teal-900/50 min-h-[500px] overflow-hidden flex flex-col pt-0 flex-1">
             <CreatorInbox currentCreatorId={creatorData?.user_id} onChatOpen={onChatOpen} />
          </div>
        )}
      </main>

    <CreatorRegistrationModal 
      isOpen={isRegOpen} 
      onClose={() => setIsRegOpen(false)} 
      onSuccess={handleRegistrationSuccess} 
    />
    </div>
  );
}
