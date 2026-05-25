import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Instagram, Trash2, CheckCircle2, Play, ExternalLink } from 'lucide-react';

interface ReelsManagerProps {
  creatorId: number;
  initialReelUrls: (string | null)[];
  onSaved: () => void;
  readOnly?: boolean;
}

export default function ReelsManager({ creatorId, initialReelUrls, onSaved, readOnly }: ReelsManagerProps) {
  const [reels, setReels] = useState<string[]>(
    Array.from({ length: 10 }).map((_, i) => initialReelUrls[i] || '')
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const updateData: Record<string, string | null> = {};
    reels.forEach((url, index) => {
      updateData[`reel_url_${index + 1}`] = url.trim() || null;
    });

    const { error } = await supabase
      .from('creators')
      .update(updateData)
      .eq('id', creatorId);

    setIsSaving(false);
    if (!error) {
      onSaved();
    } else {
      alert("Error saving reels.");
    }
  };



  const addedCount = reels.filter(r => r.trim() !== '').length;
  const [playingReel, setPlayingReel] = useState<string | null>(null);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl relative">
      <div className="flex items-center justify-between mb-6 border-b border-neutral-800 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center">
             <Instagram className="w-5 h-5 mr-2 text-teal-400" />
             My Reels
          </h3>
          <p className="text-neutral-400 text-sm mt-1">Add up to 10 Instagram Reel URLs to showcase your premium content.</p>
        </div>
        <div className="text-right">
           <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${addedCount > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'}`}>
              {addedCount > 0 ? `✅ ${addedCount}/10 Added` : '⚠️ No Reels Yet'}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Fields */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {reels.map((url, index) => (
            <div key={index} className="flex flex-col gap-1">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Reel {index + 1}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://res.cloudinary.com/.../video.mp4"
                  value={url}
                  onChange={(e) => {
                    const newReels = [...reels];
                    newReels[index] = e.target.value;
                    setReels(newReels);
                  }}
                  disabled={readOnly}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none placeholder:text-neutral-700"
                />
                <button
                  onClick={() => {
                     const newReels = [...reels];
                     newReels[index] = '';
                     setReels(newReels);
                  }}
                  disabled={readOnly || !url}
                  className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                  title="Clear"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {!readOnly && (
            <div className="pt-4 pb-2 sticky bottom-0 bg-neutral-900 border-t border-neutral-800">
              <button 
                 onClick={handleSave}
                 disabled={isSaving}
                 className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(13,148,136,0.3)] active:scale-95 flex items-center justify-center disabled:opacity-50"
              >
                 {isSaving ? 'Saving...' : <><CheckCircle2 className="w-5 h-5 mr-2" /> Save Reels</>}
              </button>
            </div>
          )}
        </div>

        {/* Previews */}
        <div className="bg-neutral-950 rounded-xl border border-neutral-800 p-4 h-[500px] overflow-y-auto custom-scrollbar">
          <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">Preview</h4>
          <div className="grid grid-cols-2 gap-4">
             {reels.map((url, index) => {
               if (!url.trim()) return null;
               return (
                 <div key={`preview-${index}`} className="relative bg-black rounded-lg overflow-hidden border border-neutral-800 aspect-[9/16] group">
                    <video
                      key={url}
                      src={url}
                      className="w-full h-full object-cover absolute inset-0 z-10 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity"
                      autoPlay={true}
                      muted={true}
                      loop={true}
                      playsInline={true}
                      preload="auto"
                      title={`Reel ${index + 1}`}
                    />
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 bg-black/60 backdrop-blur-sm transition-all duration-300">
                       <button
                         onClick={() => setPlayingReel(url)}
                         className="bg-white text-black px-4 py-2 rounded-full hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all font-bold flex items-center gap-2"
                         title="Play"
                       >
                         <Play className="w-4 h-4 fill-current" /> Play
                       </button>
                       <a
                         href={url}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="bg-neutral-800/80 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-neutral-700 hover:border-neutral-500"
                       >
                         <ExternalLink className="w-3 h-3" /> External Link
                       </a>
                    </div>
                    <div className="absolute top-2 left-2 z-30 bg-black/80 px-2 py-0.5 rounded text-[10px] font-bold text-white border border-neutral-700">
                      R{index + 1}
                    </div>
                 </div>
               );
             })}
             {addedCount === 0 && (
               <div className="col-span-2 flex flex-col items-center justify-center p-10 text-center border-2 border-dashed border-neutral-800 rounded-xl">
                 <Instagram className="w-10 h-10 text-neutral-800 mb-3" />
                 <p className="text-sm font-bold text-neutral-500">No reels added yet</p>
               </div>
             )}
          </div>
        </div>
      </div>

      {playingReel && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-[350px] flex justify-end mb-4">
             <button 
               onClick={() => setPlayingReel(null)}
               className="text-white hover:text-red-400 font-bold bg-neutral-800/50 hover:bg-neutral-800 px-4 py-2 rounded-full transition-colors flex items-center"
             >
               ✕ Close
             </button>
          </div>
          <div className="relative w-full max-w-[350px] aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl">
            <video
              key={playingReel}
              src={playingReel}
              className="w-full h-full border-0 absolute inset-0 z-10"
              autoPlay={true}
              muted={true}
              controls={true}
              playsInline={true}
              preload="auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
