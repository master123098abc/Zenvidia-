import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Moon, Sun, ArrowLeft, Building, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavbarProps {
  onOpenAuth: () => void;
  currentView: 'HOME' | 'BRAND_DASHBOARD' | 'CREATOR_PORTAL' | 'CHAT' | 'DEAL_ROOM' | 'PAYOUT_DASHBOARD' | 'ADMIN_DASHBOARD' | string;
  onNavigate: (view: any) => void;
  currentUserHandle?: string | null;
  currentBrandData?: any;
  userRole?: 'BRAND' | 'CREATOR' | 'ADMIN' | null;
  onLogout?: () => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export default function Navbar({ 
  onOpenAuth, 
  currentView, 
  onNavigate, 
  currentUserHandle, 
  currentBrandData, 
  userRole, 
  onLogout,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}: NavbarProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = isMobileMenuOpen !== undefined ? isMobileMenuOpen : internalIsOpen;
  const setIsOpen = setIsMobileMenuOpen || setInternalIsOpen;

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkStored = localStorage.getItem('zenova_dark_mode') === 'true';
    setIsDark(isDarkStored);
    if (isDarkStored) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('zenova_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('zenova_dark_mode', 'false');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border-b border-white/40 dark:border-neutral-800/40 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo & Back */}
          <div className="flex-shrink-0 flex items-center">
            <AnimatePresence>
              {currentView !== 'HOME' && (
                <motion.button 
                  initial={{ opacity: 0, width: 0, marginRight: 0 }}
                  animate={{ opacity: 1, width: 'auto', marginRight: 12 }}
                  exit={{ opacity: 0, width: 0, marginRight: 0 }}
                  onClick={() => onNavigate('HOME')}
                  className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-300 flex items-center justify-center overflow-hidden"
                  title="Back to Home"
                >
                  <ArrowLeft className="w-5 h-5 flex-shrink-0" />
                </motion.button>
              )}
            </AnimatePresence>
            <div className="cursor-pointer" onClick={() => onNavigate('HOME')}>
              <span className="font-display font-black text-2xl tracking-tighter dark:text-white uppercase text-cyan-500">
                ZENVIDIA
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => onNavigate('HOME')} className={`font-semibold transition-colors ${currentView === 'HOME' ? 'text-orange-500' : 'text-neutral-950 dark:text-neutral-200 hover:text-orange-500 dark:hover:text-orange-400'}`}>Home</button>
            {userRole !== 'CREATOR' && (
              <button onClick={() => onNavigate('BRAND_DASHBOARD')} className={`font-semibold transition-colors ${currentView === 'BRAND_DASHBOARD' ? 'text-cyan-500' : 'text-neutral-950 dark:text-neutral-200 hover:text-cyan-500 dark:hover:text-cyan-400'}`}>For Brands</button>
            )}
            {userRole !== 'BRAND' && (
              <button onClick={() => onNavigate('CREATOR_PORTAL')} className={`font-semibold transition-colors ${currentView === 'CREATOR_PORTAL' ? 'text-orange-500' : 'text-neutral-950 dark:text-neutral-200 hover:text-orange-500 dark:hover:text-orange-400'}`}>For Creators</button>
            )}
            <button onClick={() => onNavigate('DEAL_ROOM')} className={`font-semibold transition-colors ${currentView === 'DEAL_ROOM' ? 'text-cyan-500' : 'text-neutral-950 dark:text-neutral-200 hover:text-cyan-500 dark:hover:text-cyan-400'}`}>Active Deals</button>
            <button onClick={() => onNavigate('PAYOUT_DASHBOARD')} className={`font-semibold transition-colors ${currentView === 'PAYOUT_DASHBOARD' ? 'text-orange-500' : 'text-neutral-950 dark:text-neutral-200 hover:text-orange-500 dark:hover:text-orange-400'}`}>Payouts</button>
            
            <button onClick={toggleDarkMode} className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {currentUserHandle || currentBrandData ? (
               <div className="relative group">
                <button className="flex items-center space-x-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full pr-4 p-1 hover:border-cyan-500/50 transition-colors cursor-default md:cursor-pointer">
                   <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-orange-400 p-[2px]">
                     <div className="w-full h-full rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center overflow-hidden">
                       {currentBrandData?.profile_url ? (
                         <img src={currentBrandData.profile_url} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-sm font-bold uppercase text-neutral-600 dark:text-neutral-300">
                           {currentBrandData ? currentBrandData.business_name[0] : (currentUserHandle ? currentUserHandle[0] : 'U')}
                         </span>
                       )}
                     </div>
                     {userRole === 'BRAND' && (
                       <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white rounded-full p-0.5 border-2 border-white dark:border-neutral-900" title="Brand">
                         <Building className="w-3 h-3" />
                       </div>
                     )}
                     {userRole === 'CREATOR' && (
                       <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-white rounded-full p-0.5 border-2 border-white dark:border-neutral-900" title="Creator">
                         <Star className="w-3 h-3" />
                       </div>
                     )}
                     {userRole === 'ADMIN' && (
                       <div className="absolute -bottom-1 -right-1 bg-purple-500 text-white rounded-full p-0.5 border-2 border-white dark:border-neutral-900" title="Admin">
                         <Building className="w-3 h-3" />
                       </div>
                     )}
                   </div>
                   <span className="font-bold text-sm text-neutral-800 dark:text-white max-w-[100px] truncate">
                     {userRole === 'ADMIN' ? 'Admin' : (currentBrandData ? currentBrandData.business_name : currentUserHandle)}
                   </span>
                </button>

                <div className="absolute right-0 top-full pt-2 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                   <div className="p-2 space-y-1">
                     <button 
                       onClick={() => onNavigate(userRole === 'ADMIN' ? 'ADMIN_DASHBOARD' : (currentBrandData ? 'BRAND_DASHBOARD' : 'CREATOR_PORTAL'))}
                       className="w-full text-left px-4 py-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                     >
                       {userRole === 'ADMIN' ? 'Admin Panel' : 'My Account'}
                     </button>
                     <button 
                       onClick={onLogout}
                       className="w-full text-left px-4 py-2 text-sm font-semibold text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                     >
                       Sign Out
                     </button>
                   </div>
                </div>
              </div>
            ) : (
              <button onClick={onOpenAuth} className="shimmer-btn bg-gradient-to-r from-cyan-500 hover:from-cyan-400 to-orange-500 hover:to-orange-400 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-500/20 transform transition hover:-translate-y-0.5">
                <span className="relative z-10">Get Started</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <button onClick={toggleDarkMode} className="text-neutral-500 dark:text-neutral-400">
              {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-neutral-950 dark:text-white hover:text-orange-500 focus:outline-none"
            >
              {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-white dark:bg-neutral-900 border-t border-gray-100 dark:border-neutral-800 absolute w-full shadow-2xl"
        >
          <div className="px-4 pt-4 pb-6 space-y-3">
            <button onClick={() => { onNavigate('HOME'); setIsOpen(false); }} className={`block w-full text-left px-4 py-3 font-semibold rounded-xl transition-colors ${currentView === 'HOME' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'text-neutral-950 dark:text-neutral-200 hover:bg-orange-50 dark:hover:bg-neutral-800'}`}>Home</button>
            {userRole !== 'CREATOR' && (
              <button onClick={() => { onNavigate('BRAND_DASHBOARD'); setIsOpen(false); }} className={`block w-full text-left px-4 py-3 font-semibold rounded-xl transition-colors ${currentView === 'BRAND_DASHBOARD' ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400' : 'text-neutral-950 dark:text-neutral-200 hover:bg-cyan-50 dark:hover:bg-neutral-800'}`}>For Brands</button>
            )}
            {userRole !== 'BRAND' && (
              <button onClick={() => { onNavigate('CREATOR_PORTAL'); setIsOpen(false); }} className={`block w-full text-left px-4 py-3 font-semibold rounded-xl transition-colors ${currentView === 'CREATOR_PORTAL' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'text-neutral-950 dark:text-neutral-200 hover:bg-orange-50 dark:hover:bg-neutral-800'}`}>For Creators</button>
            )}
            <button onClick={() => { onNavigate('DEAL_ROOM'); setIsOpen(false); }} className={`block w-full text-left px-4 py-3 font-semibold rounded-xl transition-colors ${currentView === 'DEAL_ROOM' ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400' : 'text-neutral-950 dark:text-neutral-200 hover:bg-cyan-50 dark:hover:bg-neutral-800'}`}>Active Deals</button>
            <button onClick={() => { onNavigate('PAYOUT_DASHBOARD'); setIsOpen(false); }} className={`block w-full text-left px-4 py-3 font-semibold rounded-xl transition-colors ${currentView === 'PAYOUT_DASHBOARD' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'text-neutral-950 dark:text-neutral-200 hover:bg-orange-50 dark:hover:bg-neutral-800'}`}>Payouts</button>
            <div className="pt-4 pb-2">
               {currentUserHandle || currentBrandData ? (
                 <>
                   <button onClick={() => { onNavigate(currentBrandData ? 'BRAND_DASHBOARD' : 'CREATOR_PORTAL'); setIsOpen(false); }} className="w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white px-6 py-4 rounded-2xl font-bold shadow-sm active:scale-95 transition-transform min-h-[56px] text-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center space-x-3 mb-2">
                     <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-orange-400 p-[2px]">
                       <div className="w-full h-full rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center overflow-hidden">
                         {currentBrandData?.profile_url ? (
                           <img src={currentBrandData.profile_url} alt="Profile" className="w-full h-full object-cover" />
                         ) : (
                           <span className="text-sm font-bold uppercase text-neutral-600 dark:text-neutral-300">
                             {currentBrandData ? currentBrandData.business_name[0] : (currentUserHandle ? currentUserHandle[0] : 'U')}
                           </span>
                         )}
                       </div>
                       {userRole === 'BRAND' && (
                         <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white rounded-full p-0.5 border-2 border-white dark:border-neutral-900" title="Brand">
                           <Building className="w-3 h-3" />
                         </div>
                       )}
                       {userRole === 'CREATOR' && (
                         <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-white rounded-full p-0.5 border-2 border-white dark:border-neutral-900" title="Creator">
                           <Star className="w-3 h-3" />
                         </div>
                       )}
                     </div>
                     <span>My Account</span>
                   </button>
                   <button onClick={() => { if(onLogout) onLogout(); setIsOpen(false); }} className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-6 py-4 rounded-2xl font-bold active:scale-95 transition-transform min-h-[56px] text-lg">
                     Sign Out
                   </button>
                 </>
               ) : (
                 <button onClick={() => { onOpenAuth(); setIsOpen(false); }} className="w-full bg-gradient-to-r from-cyan-500 to-orange-500 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-transform min-h-[56px] text-lg">
                   Get Started
                 </button>
               )}
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </nav>
  );
}
