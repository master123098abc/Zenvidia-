import React, { useState, useEffect } from 'react';
import { Instagram, TrendingUp, Share2, Star, User, Play, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';

interface CreatorProps {
  creator: {
    id?: number;
    ig_handle?: string;
    profile_url?: string;
    primary_niche?: string;
    follower_count?: number;
    engagement_rate?: number;
    status?: string;
    primary_language?: string;
    [key: string]: any;
  };
  onMessageCreator?: (id: number) => void;
  userRole?: 'BRAND' | 'CREATOR' | null;
}

const ReelEmbed: React.FC<{ reelUrl?: string | null, igHandle: string, index: number, creatorImage?: string }> = ({ reelUrl, igHandle, index, creatorImage }) => {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="w-24 h-24 flex-shrink-0 snap-center rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 relative shadow-lg group/reel inline-block">
      {reelUrl ? (
        <>
          <video
            key={reelUrl}
            src={reelUrl}
            autoPlay={true}
            muted={isMuted}
            loop={true}
            playsInline={true}
            preload="auto"
            className="w-full h-full object-cover aspect-square absolute inset-0 z-10 pointer-events-none"
          />
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
            className="absolute bottom-1 right-1 z-30 bg-black/40 backdrop-blur-md rounded-full p-1.5 border border-white/10 text-white hover:bg-black/60 transition shadow-lg scale-75"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 z-0">
           {creatorImage ? (
             <img src={creatorImage} alt="" className="w-full h-full object-cover aspect-square" />
           ) : (
             <Play className="w-6 h-6 text-neutral-600" />
           )}
        </div>
      )}
    </div>
  )
}

export default function CreatorCard({ creator, onMessageCreator, userRole }: CreatorProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');

  const parsedReelUrls: (string | null)[] = [];
  if (creator) {
    for (let i = 1; i <= 10; i++) {
       const url = creator[`reel_url_${i}`];
       if (url && typeof url === 'string' && url.trim().length > 0) {
         parsedReelUrls.push(url);
       }
    }
  }
  const displayReels = parsedReelUrls.length > 0 ? parsedReelUrls : [null];

  const igHandle = creator.ig_handle || creator.company_name || 'Unknown Profile';
  const handleString = creator.ig_handle ? `@${creator.ig_handle}` : (creator.company_name ? `Brand` : igHandle);
  const profileUrl = creator.profile_url || creator.logo_url || creator.profile_image || 'https://via.placeholder.com/150';
  const niche = creator.primary_niche || creator.industry || 'General';
  
  const handleClickCard = () => {
    if (userRole === 'CREATOR') return; // Cannot start deal
    if (creator.id && onMessageCreator) {
      onMessageCreator(creator.id);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `https://instagram.com/${igHandle}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${igHandle} on Zenvidia`,
          text: `Check out ${igHandle}'s creator profile!`,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Sharing canceled or error:', error);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div 
      onClick={handleClickCard}
      className="group relative bg-neutral-900/90 backdrop-blur-xl rounded-[2rem] p-3 sm:p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(20,184,166,0.15)] border border-neutral-800 shadow-2xl h-full flex flex-col cursor-pointer overflow-hidden touch-pan-y"
    >
      
      {/* 2.5D Background Accent (visible on hover) */}
       <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-orange-500/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Image Container with Teal Glow */}
      <div className="relative flex-shrink-0 flex justify-center pt-2 pb-2 sm:pb-4">
        {/* Badges Container */}
        <div className="absolute top-0 left-0 flex flex-col gap-1.5 sm:gap-2 items-start z-20">
          {/* Category Badge */}
          <div className="bg-neutral-800/80 border border-neutral-700 backdrop-blur px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold text-neutral-300 shadow-sm uppercase tracking-wider">
            {niche}
          </div>
          {/* Status Badge */}
          {creator.status && (
            <div className={`backdrop-blur px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold shadow-sm uppercase tracking-wider flex items-center gap-1.5 border
              ${creator.status.toLowerCase() === 'pending' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' : 
                creator.status.toLowerCase() === 'active' || creator.status.toLowerCase() === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                'bg-red-500/20 text-red-500 border-red-500/30'}
            `}>
              <span className="text-[10px] sm:text-xs uppercase">{creator.status.toLowerCase() === 'pending' ? '🟡' : creator.status.toLowerCase() === 'active' || creator.status.toLowerCase() === 'approved' ? '🟢' : '🔴'}</span>
              {creator.status}
            </div>
          )}
        </div>

        {/* Instagram Icon */}
        <div className="absolute top-0 right-0 bg-gradient-to-tr from-teal-500 to-teal-400 p-1 sm:p-1.5 rounded-full text-neutral-900 shadow-[0_0_15px_rgba(20,184,166,0.5)]">
          <Instagram className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </div>

        <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full p-[3px] bg-gradient-to-tr from-teal-500 to-cyan-400 shadow-[0_0_20px_rgba(20,184,166,0.3)] mt-6 sm:mt-4 shrink-0">
          <div className="w-full h-full bg-neutral-800 rounded-full relative overflow-hidden flex items-center justify-center">
            {/* Fallback Letter */}
            <span className="text-2xl sm:text-4xl font-display font-bold text-neutral-500 absolute">
              {igHandle[0]?.toUpperCase() || 'Z'}
            </span>
            <img 
              src={profileUrl}
              alt={handleString} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 relative z-10"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* Info Container */}
      <div className="flex flex-col flex-grow text-center relative z-10">
        <h3 className="font-display text-base sm:text-xl font-bold text-white mb-0.5 sm:mb-1 flex items-center justify-center drop-shadow-md">
          {igHandle}
          <div className="ml-1 sm:ml-1.5 w-3 h-3 sm:w-4 sm:h-4 bg-teal-500 rounded-full flex items-center justify-center relative shadow-[0_0_8px_rgba(20,184,166,0.5)]">
            <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </h3>
        <p className="text-xs sm:text-sm font-medium text-teal-400 mb-2 sm:mb-4 drop-shadow-sm line-clamp-1">{handleString}</p>

        {/* Tabs */}
        <div className="flex space-x-4 mb-2 border-b border-neutral-800 pb-1 flex-shrink-0">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveTab('overview'); }}
            className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'overview' ? 'text-teal-400 border-b-2 border-teal-500 -mb-[5px] pb-1' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            Overview
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveTab('reviews'); }}
            className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'reviews' ? 'text-teal-400 border-b-2 border-teal-500 -mb-[5px] pb-1' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            Reviews
          </button>
        </div>

        {activeTab === 'overview' ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col flex-grow text-left"
          >
            {/* 1. Quick Stats Strip (Glassmorphism) */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm mb-3 px-3 py-2 flex flex-wrap items-center justify-start sm:justify-center text-xs relative overflow-hidden group/stats gap-2 sm:gap-3">
               <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-transparent to-orange-500/10 opacity-0 group-hover/stats:opacity-100 transition-opacity" />
               <div className="flex items-center gap-1 z-10 shrink-0">
                 <span>⭐</span>
                 <span className="font-bold text-neutral-200">
                   {creator.follower_count ? Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(creator.follower_count) : '0'}
                 </span>
               </div>
               <div className="w-px h-3 bg-neutral-700 z-10 shrink-0"></div>
               <div className="flex items-center gap-1 z-10 shrink-0">
                 <span>🎯</span>
                 <span className="font-medium text-neutral-300 truncate max-w-[80px]">
                   {niche}
                 </span>
               </div>
               <div className="w-px h-3 bg-neutral-700 z-10 shrink-0 hidden sm:block"></div>
               <div className="flex items-center gap-1 z-10 shrink-0">
                 <span>🗣️</span>
                 <span className="font-medium text-neutral-300">
                   {creator.primary_language || 'EN'}
                 </span>
               </div>
               <div className="w-px h-3 bg-neutral-700 z-10 shrink-0 hidden sm:block"></div>
               <div className="flex items-center gap-1 text-teal-400 font-bold z-10 shrink-0">
                 <span>🚀</span>
                 <span>{creator.engagement_rate ? `~${creator.engagement_rate}%` : (creator.follower_count ? `~${Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Math.floor(creator.follower_count * 0.15))}` : 'High')}</span>
               </div>
            </div>

            {/* 2. Netflix-style Reels Carousel */}
            <div className="mb-2 touch-pan-y" style={{ touchAction: 'pan-y' }}>
              <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Premium Reels</h4>
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-2 -mx-2 px-2">
                 {displayReels.map((url, i) => (
                    <ReelEmbed key={i} reelUrl={url} igHandle={igHandle} index={i} creatorImage={profileUrl} />
                 ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col space-y-2 flex-grow overflow-y-auto pr-1 custom-scrollbar text-left h-full min-h-[500px]"
          >
            <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50 shrink-0">
              <div className="flex items-center mb-2 text-orange-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-[10px] text-neutral-400 font-bold ml-1.5">5.0</span>
              </div>
              <p className="text-sm text-neutral-300 italic leading-snug">"Amazing ROI, very professional and delivered the reels on time!"</p>
            </div>
          </motion.div>
        )}

        <div className="mt-4 flex gap-2 flex-shrink-0">
          {userRole !== 'CREATOR' && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleClickCard(); }}
              className="flex-1 py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white rounded-xl text-sm font-bold flex items-center justify-center transition-colors shadow-lg shadow-teal-500/20 active:scale-[0.98]"
            >
              Message Creator
            </button>
          )}
          <button 
            onClick={handleShare}
            className={`${userRole === 'CREATOR' ? 'w-full' : 'w-12'} py-3.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl text-sm font-bold flex items-center justify-center transition-colors active:scale-[0.98]`}
          >
            <Share2 className="w-4 h-4" /> {userRole === 'CREATOR' && <span className="ml-2">Share Profile</span>}
          </button>
        </div>
      </div>

    </div>
  );
}
