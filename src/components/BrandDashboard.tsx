import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, Instagram, MessageCircle, Link as LinkIcon, BadgeCheck, Search, Building, User, CreditCard, LayoutDashboard, Settings, Camera, CheckCircle2, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Keeping type for TS
type Creator = {
  id: number;
  ig_handle: string;
  follower_count: number;
  primary_niche: string;
  profile_url: string;
  status: string;
};

type BrandData = {
  id: number;
  business_name: string;
  ig_handle: string;
  business_type: string;
  monthly_budget: number;
  phone: string;
  city: string;
  email: string;
  profile_url?: string;
  status: string;
  is_verified?: boolean;
};

interface BrandDashboardProps {
  brandData?: BrandData;
  onMessage: (creatorId: number) => void;
  onLogout: () => void;
}

export default function BrandDashboard({ brandData, onMessage, onLogout }: BrandDashboardProps) {
  const [activeTab, setActiveTab] = useState<'BROWSE' | 'CAMPAIGNS' | 'PAYMENTS' | 'PROFILE'>('BROWSE');
  
  // Creators state
  const [filterType, setFilterType] = useState<'ALL' | 'BARTER' | 'PAID'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoadingCreators, setIsLoadingCreators] = useState(false);

  // Profile Upload state
  const [brand, setBrand] = useState<BrandData | undefined>(brandData);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPublicCreators();
  }, []); // EXACTLY AS REQUESTED: [] NOT [user]

  const fetchPublicCreators = async () => {
    setIsLoadingCreators(true);
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('status', 'active');
        
      if (error) throw error;
      setCreators(data ?? []);
    } catch (err) {
      console.error('Error fetching creators', err);
      // Do not reset or clear the creators array if this fails during an auth transition
    } finally {
      setIsLoadingCreators(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !brand) return;
    
    setIsUploading(true);
    
    try {
      // Cloudinary Setup (User provided placeholders: [name], [preset])
      const CLOUDINARY_CLOUD_NAME = '[name]'; 
      const CLOUDINARY_UPLOAD_PRESET = '[preset]'; 
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      const newUrl = data.secure_url;
      
      if (newUrl) {
        // Save URL to brand table -> profile_url
        const { error } = await supabase
          .from('brands')
          .update({ profile_url: newUrl })
          .eq('id', brand.id);
          
        if (!error) {
          setBrand({ ...brand, profile_url: newUrl });
          // Also update local storage so it persists
          localStorage.setItem('zenova_brand', JSON.stringify({ ...brand, profile_url: newUrl }));
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error("Cloudinary upload error", err);
      alert("Photo upload failed. Please check your Cloudinary credentials or network.");
    }
    
    setIsUploading(false);
  };

  const filteredCreators = creators.filter(c => {
    const handleMatch = c?.ig_handle ? c.ig_handle.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const nicheMatch = c?.primary_niche ? c.primary_niche.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    return handleMatch || nicheMatch;
  });

  return (
    <div className="relative flex flex-col lg:flex-row min-h-screen pt-24 pb-12 bg-neutral-950 px-4 sm:px-6 lg:px-8 gap-8 max-w-7xl mx-auto w-full overflow-hidden text-neutral-300">
      
      {/* Sidebar Profile & Nav */}
      <aside className="relative z-10 w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">
        
        {/* Brand Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-neutral-800 to-neutral-900" />
          
          <div className="relative z-10 flex flex-col items-center text-center mt-6">
              <div className="relative group">
                 <div className="w-24 h-24 rounded-full p-[3px] bg-neutral-800 border-2 border-neutral-700 shadow-xl overflow-hidden mb-4 bg-gradient-to-tr from-orange-400 to-orange-600">
                   {brand?.profile_url && brand.profile_url !== '' && !brand.profile_url.includes('unavatar') ? (
                     <img src={brand.profile_url} alt={brand.business_name} className="w-full h-full object-cover rounded-full bg-white" />
                   ) : (
                     <div className="w-full h-full bg-gradient-to-tr from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                       <span className="text-4xl font-display font-bold text-white absolute uppercase">
                         {brand?.business_name?.[0] || 'B'}
                       </span>
                     </div>
                   )}
                 </div>
                
                {activeTab === 'PROFILE' && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute bottom-4 right-0 bg-orange-600 hover:bg-orange-500 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                  accept="image/*"
                />
             </div>
             
             <h2 className="font-display text-2xl font-bold text-white mb-1">{brand?.business_name || 'Brand Name'}</h2>
             <a href={`https://instagram.com/${brand?.ig_handle}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-cyan-500 hover:text-cyan-400 flex items-center mb-4 transition-colors">
               <Instagram className="w-3.5 h-3.5 mr-1" /> @{brand?.ig_handle || 'ig_handle'}
             </a>

             <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center shadow-sm w-max ${
               (brand?.status === 'approved' || brand?.is_verified)
                 ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800' 
                 : brand?.status === 'rejected' 
                 ? 'bg-red-900/40 text-red-400 border border-red-800'
                 : 'bg-amber-900/40 text-amber-400 border border-amber-800'
             }`}>
               {(brand?.status === 'approved' || brand?.is_verified) ? (
                 <><CheckCircle2 className="w-3 h-3 mr-1.5" /> Verified</>
               ) : brand?.status === 'rejected' ? (
                 <><ShieldAlert className="w-3 h-3 mr-1.5" /> Not Approved</>
               ) : (
                 <><BadgeCheck className="w-3 h-3 mr-1.5" /> Under Review</>
               )}
             </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 shadow-sm flex flex-col gap-2">
           <button 
             onClick={() => setActiveTab('BROWSE')}
             className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${
               activeTab === 'BROWSE' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
             }`}
           >
             <Search className="w-5 h-5 opacity-70" />
             <span>Browse Creators</span>
           </button>
           <button 
             onClick={() => setActiveTab('CAMPAIGNS')}
             className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${
               activeTab === 'CAMPAIGNS' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
             }`}
           >
             <LayoutDashboard className="w-5 h-5 opacity-70" />
             <span>Active Campaigns</span>
           </button>
           <button 
             onClick={() => setActiveTab('PAYMENTS')}
             className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${
               activeTab === 'PAYMENTS' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
             }`}
           >
             <CreditCard className="w-5 h-5 opacity-70" />
             <span>Payment History</span>
           </button>
           <button 
             onClick={() => setActiveTab('PROFILE')}
             className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${
               activeTab === 'PROFILE' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
             }`}
           >
             <Settings className="w-5 h-5 opacity-70" />
             <span>Edit Profile</span>
           </button>
        </div>

        <button 
           onClick={onLogout}
           className="mt-auto flex items-center justify-center space-x-2 text-neutral-500 font-bold hover:text-white transition-colors"
        >
          Sign Out
        </button>

      </aside>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 min-w-0">
        
        {/* TAB: BROWSE CREATORS */}
        {activeTab === 'BROWSE' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="font-display text-3xl font-bold text-white">Creator Directory</h1>
                  <p className="text-neutral-400 text-sm mt-1">Find the perfect match for your next campaign.</p>
                </div>
                
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input 
                    type="text" 
                    placeholder="Search niche or handle..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-white text-sm"
                  />
                </div>
             </div>
             
             {/* Filter Pills */}
             <div className="flex gap-2 mb-6 overflow-x-auto pb-2 hide-scrollbar">
                {(['ALL', 'BARTER', 'PAID'] as const).map((type) => (
                  <button 
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border ${
                      filterType === type 
                        ? 'bg-cyan-900/40 text-cyan-400 border-cyan-800' 
                        : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:text-white'
                    }`}
                  >
                     {type === 'ALL' ? 'All Types' : type === 'BARTER' ? 'Barter (Free)' : 'Paid Deals'}
                  </button>
                ))}
             </div>

             {isLoadingCreators ? (
               <div className="flex justify-center items-center h-64">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
               </div>
             ) : filteredCreators.length === 0 ? (
               <div className="bg-neutral-900 rounded-[2rem] p-12 text-center shadow-sm border border-neutral-800">
                 <div className="w-16 h-16 bg-neutral-800 text-neutral-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Search className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-bold text-white">No creators found</h3>
                 <p className="text-neutral-400 mt-2">Adjust your filters or search terms.</p>
                 <p className="text-neutral-500 text-sm mt-4">Note: The application is securely connected to your Supabase `creators` and `brands` tables.<br/>Only approved creators will appear here. If your database is empty, register some creators and approve them in the Admin Dashboard.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                 {filteredCreators.map((creator) => (
                   <motion.div 
                     key={creator.id}
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="bg-neutral-900 rounded-3xl p-6 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col group relative overflow-hidden"
                   >
                     {/* Decorative gradient blur */}
                     <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-900/10 blur-2xl rounded-full pointer-events-none group-hover:bg-cyan-900/20 transition-colors" />

                     <div className="flex items-start justify-between mb-4 relative z-10">
                       <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] shrink-0">
                         <div className="w-full h-full bg-neutral-800 rounded-full relative overflow-hidden flex items-center justify-center">
                           <span className="text-2xl font-display font-bold text-cyan-600 absolute uppercase">
                             {creator?.ig_handle?.[0] || 'Z'}
                           </span>
                           <img 
                             src={creator?.profile_url || (creator?.ig_handle ? `https://unavatar.io/instagram/${creator.ig_handle}` : '')} 
                             alt={creator?.ig_handle || ''}
                             className="absolute inset-0 w-full h-full object-cover z-10 bg-neutral-900"
                             onError={(e) => {
                               e.currentTarget.style.display = 'none';
                             }}
                           />
                         </div>
                       </div>
                       <div className="flex flex-col items-end">
                         <a href={creator?.ig_handle ? `https://instagram.com/${creator.ig_handle}` : '#'} target="_blank" rel="noopener noreferrer" className="bg-neutral-800 hover:bg-neutral-700 p-2 rounded-full transition-colors group/link mb-2 cursor-pointer">
                           <Instagram className="w-4 h-4 text-neutral-400 group-hover/link:text-pink-500 transition-colors" />
                         </a>
                         <span className="px-2.5 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold bg-cyan-900/30 text-cyan-400 border border-cyan-800/50">
                           Paid Collab
                         </span>
                       </div>
                     </div>

                     <div className="relative z-10 mt-2 flex flex-col flex-1">
                       <h3 className="font-bold text-xl text-white flex items-center truncate">
                         @{creator?.ig_handle}
                         <BadgeCheck className="w-4 h-4 ml-1.5 text-emerald-400" />
                       </h3>
                       <p className="text-sm font-semibold text-neutral-500 mb-6">{creator?.primary_niche} Creator</p>

                       <div className="flex justify-between bg-neutral-950 rounded-2xl p-4 mb-6 border border-neutral-800/50">
                         <div className="text-center w-1/2">
                           <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Followers</p>
                           <p className="font-bold text-white text-lg">{(creator?.follower_count || 0) >= 1000 ? `${((creator?.follower_count || 0) / 1000).toFixed(1)}K` : (creator?.follower_count || 0)}</p>
                         </div>
                         <div className="w-px bg-neutral-800" />
                         <div className="text-center w-1/2">
                           <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Engagement</p>
                           <p className="font-bold text-white text-lg">{(creator as any)?.engagement_rate ? `~${(creator as any).engagement_rate}%` : (creator?.follower_count ? `~${Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Math.floor(creator.follower_count * 0.15))}` : 'High')}</p>
                         </div>
                       </div>

                       <div className="mt-auto">
                         <button 
                           onClick={() => onMessage(creator.id)}
                           className="w-full bg-white text-neutral-900 min-h-[48px] rounded-xl font-bold flex items-center justify-center hover:bg-neutral-200 transition-colors shadow-lg active:scale-95"
                         >
                           <MessageCircle className="w-4 h-4 mr-2" /> Message Creator
                         </button>
                       </div>
                     </div>
                   </motion.div>
                 ))}
               </div>
             )}
          </motion.div>
        )}

        {/* TAB: ACTIVE CAMPAIGNS */}
        {activeTab === 'CAMPAIGNS' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center border-2 border-dashed border-neutral-800 rounded-3xl p-8">
            <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mb-4 text-neutral-500">
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Active Campaigns</h3>
            <p className="text-neutral-400 max-w-sm">You haven't initiated any creator collaborations yet. Browse the creator directory to start your first campaign.</p>
            <button onClick={() => setActiveTab('BROWSE')} className="mt-6 font-bold text-cyan-500 hover:text-cyan-400">Browse Creators &rarr;</button>
          </motion.div>
        )}

        {/* TAB: PAYMENT HISTORY */}
        {activeTab === 'PAYMENTS' && (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center border-2 border-dashed border-neutral-800 rounded-3xl p-8">
             <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mb-4 text-neutral-500">
               <CreditCard className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">No Payment History</h3>
             <p className="text-neutral-400 max-w-sm">Complete a paid campaign to see your transactions and invoices here.</p>
           </motion.div>
        )}

        {/* TAB: EDIT PROFILE */}
        {activeTab === 'PROFILE' && (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <h1 className="font-display text-3xl font-bold text-white mb-8">Edit Brand Profile</h1>
             
             <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 max-w-2xl">
               <div className="space-y-6">
                 <div>
                   <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wide mb-2">Business Name</label>
                   <input type="text" defaultValue={brand?.business_name} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none" />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6">
                   <div>
                     <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wide mb-2">Instagram Handle</label>
                     <input type="text" defaultValue={brand?.ig_handle} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wide mb-2">Contact Number</label>
                     <input type="text" defaultValue={brand?.phone} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none" />
                   </div>
                 </div>

                 <div className="pt-4 border-t border-neutral-800 pb-2">
                   <p className="text-sm font-medium text-neutral-500 mb-4 flex items-center">
                      <Camera className="w-4 h-4 mr-2" /> Click the camera icon on your profile picture in the sidebar to upload a new logo via Cloudinary.
                   </p>
                 </div>
                 
                 <button className="bg-white text-neutral-900 font-bold py-3 px-6 rounded-xl hover:bg-neutral-200 transition-colors">
                   Save Changes
                 </button>
               </div>
             </div>
           </motion.div>
        )}
      </main>

    </div>
  );
}
