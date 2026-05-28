import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import CreatorCard from './CreatorCard';
import { supabase } from '../lib/supabase';

export default function Marketplace({ onMessageCreator, userRole }: { onMessageCreator?: (id: number) => void, userRole?: 'BRAND' | 'CREATOR' | null }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [creators, setCreators] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    fetchCreators();
  }, []); // ONCE only

  const fetchCreators = async () => {
    try {
      const { data } = await supabase.from('creators').select('*');
      if (data && data.length > 0) {
        setCreators(data);
      }
    } catch (err: any) {
      console.error('Error fetching creators:', err);
      setErrorMsg(err.message || 'Error occurred while fetching data');
    } finally {
      setIsDataLoading(false);
    }
  };

  // GLOBAL SAFETY NET
  useEffect(() => {
    const safety = setTimeout(() => {
      setIsDataLoading(false);
    }, 4000);
    return () => clearTimeout(safety);
  }, []);
  
  // BYPASS ALL CONDITIONAL FILTERS for now. Just map what we have from Supabase.
  const filteredCreators = creators;

  return (
    <section className="py-24 md:py-32 lg:py-48 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-24"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12 mb-8">
            <div className="max-w-3xl text-left">
              <h2 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-neutral-900 leading-[1.05]">
                Discover Local <br className="hidden sm:block" /><span className="bg-clip-text text-transparent bg-gradient-to-l from-orange-500 to-cyan-500">Voices</span>.
              </h2>
            </div>

            {/* Filtering Pills */}
            <div className="flex flex-nowrap overflow-x-auto md:flex-wrap gap-2 pb-4 md:pb-0 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
              {["All", "Fashion", "Food", "Travel", "Tech", "Bihu"].map((filter, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveFilter(filter)}
                  className={`flex-shrink-0 px-6 py-2.5 rounded-full font-bold text-sm transition-all min-h-[44px] ${
                    activeFilter === filter 
                    ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/20" 
                    : "bg-white/60 backdrop-blur-md text-neutral-800 hover:bg-orange-100/80 hover:text-orange-600 border border-white/40 shadow-sm"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full relative max-w-xl">
            <Search className="absolute left-4 top-[14px] w-5 h-5 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search creators by name or handle..." 
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-neutral-800 font-medium transition-all"
            />
          </div>
        </motion.div>

        {/* Creators/Brands Grid/Swipeable List */}
        {errorMsg && (
          <div className="py-20 text-center bg-red-500/10 border border-red-500/20 rounded-2xl mb-8">
             <h3 className="text-xl font-bold text-red-500 mb-2">Error Fetching Data</h3>
             <p className="text-red-400">{errorMsg}</p>
          </div>
        )}
        
        {isDataLoading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-8 h-8 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin mr-3"></div>
            <p className="text-neutral-500 font-medium">Loading Creators...</p>
          </div>
        ) : filteredCreators.length === 0 && !errorMsg ? (
          <div className="py-20 text-center">
             <h3 className="text-xl font-bold text-neutral-900 mb-2">No creators found</h3>
             <p className="text-neutral-500">Try adjusting your filters or search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8 max-w-sm mx-auto sm:max-w-none pb-8 pt-4 px-4 sm:px-0 overflow-y-auto overscroll-behavior-y-contain">
            {filteredCreators.map((item, i) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="w-full"
              >
                <CreatorCard creator={item} onMessageCreator={onMessageCreator} userRole={userRole} />
              </motion.div>
            ))}
          </div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 md:mt-24 text-center"
        >
          <button 
             onClick={() => {
                setActiveFilter("All");
                setSearchQuery("");
                window.scrollBy({ top: -300, behavior: 'smooth' });
             }}
             className="shimmer-btn bg-white/80 backdrop-blur-md border md:border-2 border-white text-neutral-900 px-8 py-4 rounded-xl font-bold hover:border-cyan-500 hover:text-cyan-600 transition-colors shadow-sm relative overflow-hidden w-full sm:w-auto min-h-[56px] text-lg">
            <span className="relative z-10">View All Creators</span>
          </button>
        </motion.div>

      </div>
    </section>
  );
}
