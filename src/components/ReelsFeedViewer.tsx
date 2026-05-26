import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { X, Heart, MessageCircle, Share2, Instagram, Play, Volume2, VolumeX } from 'lucide-react';

interface ReelData {
  url: string;
  creatorId: number;
  creatorName: string;
  creatorHandle: string;
  creatorPhoto: string;
  niche: string;
  followers?: number;
}

export default function ReelsFeedViewer({ onClose, onCollab }: { onClose: () => void, onCollab?: (creatorId: number) => void }) {
  const [reels, setReels] = useState<ReelData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<number | null>(0);

  useEffect(() => {
    // Add escape key listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    async function fetchReels() {
      setLoading(true);
      const timeoutId = setTimeout(() => setLoading(false), 5000);
      try {
        const { data, error } = await supabase
          .from('creators')
          .select('*');
        
      if (!error && data) {
        let allReels: ReelData[] = [];
        data.forEach((creator: any) => {
          for (let i = 1; i <= 10; i++) {
             const url = creator[`reel_url_${i}`];
             
             // MAP STRINGS DIRECTLY: plain Cloudinary .mp4 string URLs
             if (url && typeof url === 'string' && url.trim().length > 0) {
               // Only push if it looks like a valid URL (begins with http to avoid any old corrupted JSON blobs)
               if (url.trim().startsWith('http')) {
                 allReels.push({
                   url: url.trim(),
                   creatorId: creator.id,
                   creatorName: creator.full_name || creator.ig_handle || 'Creator',
                   creatorHandle: creator.ig_handle || 'user',
                   creatorPhoto: creator.profile_url || `https://unavatar.io/instagram/${creator.ig_handle}`,
                   niche: creator.niche || creator.primary_niche || 'Digital Creator',
                   followers: creator.follower_count || 0
                 });
               }
             }
          }
        });
        
        // Shuffle the reels
        for (let i = allReels.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allReels[i], allReels[j]] = [allReels[j], allReels[i]];
        }
        setReels(allReels);
      }
      } catch (err) {
        console.error("Error fetching reels:", err);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    }
    fetchReels();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
         <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6 text-center">
         <button onClick={onClose} className="absolute top-6 right-6 text-white hover:text-red-400 p-2 z-50">
            <X className="w-8 h-8" />
         </button>
         <Instagram className="w-16 h-16 text-neutral-700 mb-4" />
         <h2 className="text-2xl font-bold text-white mb-2">No Reels Found</h2>
         <p className="text-neutral-500">Check back later when creators upload their content.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] bg-black overflow-hidden flex flex-col"
    >
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white hover:text-red-400 z-50 bg-black/40 backdrop-blur-md p-3 rounded-full hover:bg-neutral-800 transition shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center w-12 h-12"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="h-[calc(100vh-64px)] w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth hide-scrollbar relative">
         {reels.map((reel, index) => (
           <ReelCard key={index} reel={reel} index={index} activeVideoId={activeVideoId} setActiveVideoId={setActiveVideoId} onCollab={onCollab} />
         ))}
      </div>
    </motion.div>
  );
}

const ReelCard: React.FC<{ reel: ReelData, index: number, activeVideoId: number | null, setActiveVideoId: (id: number) => void, onCollab?: (creatorId: number) => void }> = ({ reel, index, activeVideoId, setActiveVideoId, onCollab }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [userMuted, setUserMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isActive = activeVideoId === index;

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.6,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveVideoId(index);
        }
      });
    }, options);

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [index, setActiveVideoId]);

  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
      if (!userMuted) {
        setIsMuted(false);
      }
      if (videoRef.current) {
        videoRef.current.play().catch(e => console.log('play error', e));
      }
    } else {
      setIsPlaying(false);
      setIsMuted(true);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [isActive, userMuted]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    setUserMuted(true);
  };

  return (
    <div className="w-full h-full snap-start snap-always relative flex items-center justify-center bg-black">
         <>
           {/* Native HTML5 Video Player */}
           <video src={reel.url} loop muted={isMuted} playsInline preload="metadata" className="w-full h-full object-cover absolute inset-0 z-10 cursor-pointer" onClick={togglePlay} ref={videoRef} onWaiting={() => setIsBuffering(true)} onLoadStart={() => setIsBuffering(true)} onPlaying={() => setIsBuffering(false)} onCanPlay={() => setIsBuffering(false)} />
           
           {/* Mute/Unmute Button */}
           <button 
             onClick={handleMuteToggle}
             className="absolute bottom-6 right-4 z-[50] p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-black/60 transition shadow-lg"
           >
             {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
           </button>

           {isBuffering && (
             <div className="absolute inset-0 z-[15] flex items-center justify-center pointer-events-none">
               <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(20,184,166,0.5)]"></div>
             </div>
           )}

           {!isPlaying && !isBuffering && (
             <div className="absolute inset-0 z-[15] flex items-center justify-center pointer-events-none">
               <div className="bg-black/50 p-4 rounded-full backdrop-blur-sm">
                 <Play className="w-12 h-12 text-white fill-white pl-1" />
               </div>
             </div>
           )}
         </>

       {/* Top 'See on Instagram' Overlay Button */}
       <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[20]">
          <a
            href={`https://instagram.com/${reel.creatorHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black/50 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 hover:bg-black/70 transition shadow-[0_4px_15px_rgba(0,0,0,0.5)]"
          >
            🔗 See on Instagram
          </a>
       </div>

       {/* Bottom Gradient overlay */}
       <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-black via-black/80 to-transparent z-[12] pointer-events-none flex flex-col justify-end p-4 pb-6 sm:p-8 sm:pb-8">
         
         <div className="flex items-end justify-between pointer-events-auto">
            
            {/* Creator Info (Left) */}
            <div className="flex-1 mr-4">
               <div className="flex items-center gap-3 mb-2">
                  <img 
                    src={reel.creatorPhoto} 
                    alt={reel.creatorHandle} 
                    className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-teal-500 rounded-full object-cover"
                    onError={(e) => { e.currentTarget.style.display='none'; }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                       <h3 className="text-white font-bold text-base sm:text-lg leading-tight drop-shadow-md truncate max-w-[200px]">{reel.creatorName}</h3>
                    </div>
                    <p className="text-teal-400 text-sm font-semibold truncate">@{reel.creatorHandle}</p>
                  </div>
               </div>
               <div className="flex gap-2 mb-2">
                 <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded text-xs font-bold text-white tracking-widest uppercase shadow-sm">
                    {reel.niche}
                 </span>
               </div>
            </div>

            {/* Interaction Tools (Right) */}
            <div className="flex flex-col items-center gap-6 sm:gap-7 pb-2">
              <button className="flex flex-col items-center gap-1.5 group">
                 <div className="bg-black/40 backdrop-blur-md p-3.5 rounded-full text-white group-hover:text-red-500 group-hover:bg-red-500/20 transition-all border border-white/10">
                    <Heart className="w-7 h-7 sm:w-8 sm:h-8" />
                 </div>
                 <span className="text-white text-xs font-bold drop-shadow-md">Like</span>
              </button>
              <button className="flex flex-col items-center gap-1.5 group">
                 <div className="bg-black/40 backdrop-blur-md p-3.5 rounded-full text-white group-hover:text-blue-400 group-hover:bg-blue-400/20 transition-all border border-white/10">
                    <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8" />
                 </div>
                 <span className="text-white text-xs font-bold drop-shadow-md">Comment</span>
              </button>
              <button className="flex flex-col items-center gap-1.5 group">
                 <div className="bg-black/40 backdrop-blur-md p-3.5 rounded-full text-white group-hover:text-teal-400 group-hover:bg-teal-400/20 transition-all border border-white/10">
                    <Share2 className="w-7 h-7 sm:w-8 sm:h-8" />
                 </div>
                 <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
              </button>
            </div>
         </div>

         {/* Collab Button */}
         <div className="mt-4 pointer-events-auto">
            <button 
              onClick={() => onCollab && onCollab(reel.creatorId)}
              className="w-full bg-gradient-to-r from-teal-500 to-orange-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] active:scale-95 transition-all flex items-center justify-center uppercase text-sm tracking-wider"
            >
              🔥 Collab Now
            </button>
         </div>
         
       </div>
    </div>
  );
}
