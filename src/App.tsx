import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import GamosaAccent from './components/GamosaAccent';
import Marketplace from './components/Marketplace';
import Footer from './components/Footer';
import AnimatedBackground from './components/AnimatedBackground';
import IntroSequence from './components/IntroSequence';
import AuthModal from './components/AuthModal';
import Onboarding from './components/Onboarding';
import BrandDashboard from './components/BrandDashboard';
import AdminDashboard from './components/AdminDashboard';
import ChatInterface from './components/ChatInterface';
import CreatorPortal from './components/CreatorPortal';
import CreatorInbox from './components/CreatorInbox';
import DealRoom from './components/DealRoom';
import PayoutDashboard from './components/PayoutDashboard';
import ReelsFeedViewer from './components/ReelsFeedViewer';
import BottomNav from './components/BottomNav';
import BorderCat from './components/BorderCat';
import { supabase } from './lib/supabase';
import { playSfx } from './lib/sfx';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [showReelsFeed, setShowReelsFeed] = useState(false);
  const [view, setView] = useState<'HOME' | 'BRAND_DASHBOARD' | 'CREATOR_PORTAL' | 'CHAT' | 'DEAL_ROOM' | 'PAYOUT_DASHBOARD' | 'ONBOARDING' | 'ADMIN_DASHBOARD' | 'INBOX'>('HOME');
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authIntent, setAuthIntent] = useState<'brand' | 'creator' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreatorChatOpen, setIsCreatorChatOpen] = useState(false);
  
  const [currentUserHandle, setCurrentUserHandle] = useState<string | null>(localStorage.getItem('zenova_handle'));
  const [currentBrandData, setCurrentBrandData] = useState<any>(
    localStorage.getItem('zenova_brand') ? JSON.parse(localStorage.getItem('zenova_brand')!) : null
  );
  const [userRole, setUserRole] = useState<'BRAND' | 'CREATOR' | 'ADMIN' | null>(
    localStorage.getItem('zenova_admin') ? 'ADMIN' : (localStorage.getItem('zenova_brand') ? 'BRAND' : (localStorage.getItem('zenova_handle') ? 'CREATOR' : null))
  );
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [activeCreatorId, setActiveCreatorId] = useState<number | null>(null);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('button') || 
        target.closest('a') || 
        target.closest('.cursor-pointer') || 
        target.closest('[role="button"]') ||
        target.tagName.toLowerCase() === 'input'
      ) {
        playSfx('tap');
      }
    };
    
    let touchY = 0;
    let touchX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        touchY = e.touches[0].clientY;
        touchX = e.touches[0].clientX;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const endY = e.changedTouches[0].clientY;
      const endX = e.changedTouches[0].clientX;
      const diffY = Math.abs(endY - touchY);
      const diffX = Math.abs(endX - touchX);

      // Simple swipe detection
      if (diffY > 50 || diffX > 50) {
        playSfx('swipe');
      }
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAuthLoading(false);
    }, 2000);

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        clearTimeout(timer);
        
        if (session?.user?.email === 'admin@zenvidia.com') {
           localStorage.setItem('zenova_admin', 'true');
           setUserRole('ADMIN');
           setView(prev => prev === 'HOME' ? 'ADMIN_DASHBOARD' : prev);
        }
        await handleSessionUser(session?.user, true);
        setIsAuthLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user?.email === 'admin@zenvidia.com') {
           localStorage.setItem('zenova_admin', 'true');
           setUserRole('ADMIN');
        }

        if (_event === 'SIGNED_IN') {
          if (session?.user?.email === 'admin@zenvidia.com') {
             setView(prev => prev === 'HOME' ? 'ADMIN_DASHBOARD' : prev);
          }
          await handleSessionUser(session?.user, false);
        }
        // No SIGNED_OUT handling to completely match requirement
      } catch (err) {
        console.error("Auth change error", err);
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const handleSessionUser = async (user: any, isInitialLoad: boolean = false) => {
    if (!user) {
      // Per instructions: onAuthStateChange should never reset user data, only explicit logout.
      return;
    }

    if (user.email === 'admin@zenvidia.com') {
      return; // Admin doesn't need to load brand/creator profile
    }

    try {
      let brand = null;
      let creator = null;
      
      try {
        const { data, error } = await supabase.from('brands').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (error) throw error;
        brand = data;
      } catch (err) {
        console.error("Safely caught Error fetching brand data:", err);
      }
      
      if (brand) {
        handleLoginSuccess('BRAND', undefined, brand, isInitialLoad);
        return;
      }
      
      try {
        const { data, error } = await supabase.from('creators').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (error) throw error;
        creator = data;
      } catch (err) {
        console.error("Safely caught Error fetching creator data:", err);
      }
        
      if (creator) {
        handleLoginSuccess('CREATOR', creator.ig_handle, undefined, isInitialLoad);
      } else {
        // Needs onboarding
        setView('ONBOARDING');
      }
    } catch (err) {
      console.error("Unhandled error in handleSessionUser:", err);
    }
  };

  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = '';
    }
  }, [showIntro]);

  const handleLoginSuccess = (type: 'BRAND' | 'CREATOR', handle?: string, data?: any, isInitialLoad: boolean = false) => {
    // Read the role intent persisted from Google OAuth
    const persistedIntent = localStorage.getItem('zenvidia_role_intent');
    const intentToUse = authIntent || persistedIntent;

    if (type === 'CREATOR' && handle) {
      localStorage.setItem('zenova_handle', handle);
      setCurrentUserHandle(handle);
      setUserRole('CREATOR');
      if (pendingCreatorId) {
         setPendingCreatorId(null);
         // creators can't message other creators currently, direct to portal
      }
      
      if (!isInitialLoad && intentToUse === 'brand') {
        setView('BRAND_DASHBOARD');
        setAuthIntent(null);
        localStorage.removeItem('zenvidia_role_intent');
      } else if (!isInitialLoad && intentToUse === 'creator') {
        setView('CREATOR_PORTAL');
        setAuthIntent(null);
        localStorage.removeItem('zenvidia_role_intent');
      } else {
        setView(prev => (prev === 'HOME' || prev === 'ONBOARDING') ? 'CREATOR_PORTAL' : prev);
      }
      
    } else if (type === 'BRAND' && data) {
      localStorage.setItem('zenova_brand', JSON.stringify(data));
      setCurrentBrandData(data);
      setUserRole('BRAND');
      if (pendingCreatorId) {
         const pid = pendingCreatorId;
         setPendingCreatorId(null);
         setTimeout(() => handleMessageCreator(pid), 0);
      } else {
         if (!isInitialLoad && intentToUse === 'brand') {
           setView('BRAND_DASHBOARD');
           setAuthIntent(null);
           localStorage.removeItem('zenvidia_role_intent');
         } else if (!isInitialLoad && intentToUse === 'creator') {
           setView('CREATOR_PORTAL');
           setAuthIntent(null);
           localStorage.removeItem('zenvidia_role_intent');
         } else {
           setView(prev => (prev === 'HOME' || prev === 'ONBOARDING') ? 'BRAND_DASHBOARD' : prev);
         }
      }
    }
    
    // Fallback clear just in case
    localStorage.removeItem('zenvidia_role_intent');
    window.scrollTo(0, 0);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUserHandle(null);
      setCurrentBrandData(null);
      setUserRole(null);
      localStorage.clear();
      window.location.href = '/';
    } catch (err) {
      console.error("Sign Out Failed:", err);
    }
  };

  const [pendingCreatorId, setPendingCreatorId] = useState<number | null>(null);

  const handleNavigate = (newView: 'HOME' | 'BRAND_DASHBOARD' | 'CREATOR_PORTAL' | 'CHAT' | 'DEAL_ROOM' | 'PAYOUT_DASHBOARD' | 'INBOX') => {
    if (newView === 'BRAND_DASHBOARD' && !currentBrandData) {
      setAuthIntent('brand');
      setAuthModalOpen(true);
      return;
    }
    if ((newView === 'CREATOR_PORTAL' || newView === 'INBOX') && !currentUserHandle && !currentBrandData) {
      setAuthIntent('creator');
      setAuthModalOpen(true);
      return;
    }
    setView(newView);
    window.scrollTo(0, 0);
  };

  const handleMessageCreator = async (creatorId: number) => {
    if (userRole === 'CREATOR') return; // Strict rule: Creator cannot start any deal
    const { data: userData } = await supabase.auth.getUser();
    const currentUser = userData?.user;

    if (!currentUser) {
      setPendingCreatorId(creatorId);
      setAuthModalOpen(true);
      return;
    }
    
    // Bypass modal and go straight to deal room
    setActiveCreatorId(creatorId);
    setView('CHAT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen text-neutral-950 dark:text-white bg-neutral-50/50 dark:bg-neutral-950 font-sans overflow-x-hidden relative flex flex-col transition-colors duration-300">
      <BorderCat />
      <AnimatePresence>
        {showIntro && <IntroSequence onComplete={() => setShowIntro(false)} />}
      </AnimatePresence>

      <AnimatedBackground />
      <Navbar 
        onOpenAuth={() => setAuthModalOpen(true)} 
        currentView={view} 
        onNavigate={handleNavigate} 
        currentUserHandle={currentUserHandle}
        currentBrandData={currentBrandData}
        userRole={userRole}
        onLogout={handleLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
      
      <main className="flex-1 flex flex-col">
        {isAuthLoading && view !== 'HOME' ? (
          <div className="flex-1 flex items-center justify-center">
             <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mr-3" />
             <p className="text-sm font-medium text-neutral-500">Authenticating...</p>
          </div>
        ) : (
          <>
            {view === 'ONBOARDING' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 w-full relative z-10">
                <Onboarding onComplete={(role, handle, dataObj) => {
              if (role === 'CREATOR') {
                 localStorage.setItem('zenova_handle', handle);
                 setCurrentUserHandle(handle);
                 setUserRole('CREATOR');
                 setView('CREATOR_PORTAL');
              } else {
                 localStorage.setItem('zenova_brand', JSON.stringify(dataObj));
                 setCurrentBrandData(dataObj);
                 setUserRole('BRAND');
                 setView('BRAND_DASHBOARD');
              }
              setAuthModalOpen(false);
              setIsMobileMenuOpen(false);
              window.scrollTo(0, 0);
            }} />
          </motion.div>
        )}

        {(view === 'HOME' || view === 'BRAND_DASHBOARD' || view === 'CREATOR_PORTAL') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {view === 'HOME' && (
              <>
                <Hero onNavigate={handleNavigate} onOpenReels={() => setShowReelsFeed(true)} />
                <GamosaAccent />
              </>
            )}
            
            {/* ALways render marketplace regardless of login state, as requested */}
            <Marketplace onMessageCreator={handleMessageCreator} userRole={userRole} />
          </motion.div>
        )}

        {showReelsFeed && (
           <ReelsFeedViewer 
             onClose={() => setShowReelsFeed(false)} 
             onCollab={(creatorId) => {
               setShowReelsFeed(false);
               handleMessageCreator(creatorId);
             }} 
           />
        )}

        {view === 'BRAND_DASHBOARD' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 w-full relative z-10">
            <BrandDashboard 
              brandData={currentBrandData} 
              onMessage={handleMessageCreator} 
              onLogout={handleLogout}
            />
          </motion.div>
        )}

        {view === 'CREATOR_PORTAL' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 z-10">
            <CreatorPortal currentUserHandle={currentUserHandle} onCollaborate={() => setView('DEAL_ROOM')} onLogout={handleLogout} onLogin={(handle) => handleLoginSuccess('CREATOR', handle)} onChatOpen={setIsCreatorChatOpen} onCompleteProfile={() => setView('ONBOARDING')} />
          </motion.div>
        )}

        {view === 'CHAT' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-h-screen z-10">
            <ChatInterface 
              activeCreatorId={activeCreatorId} 
              onBrowseCreators={() => setView('BRAND_DASHBOARD')}
              currentBrandData={currentBrandData}
            />
          </motion.div>
        )}

        {view === 'INBOX' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 w-full bg-neutral-50 relative z-10 pt-24 pb-20">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex flex-col">
                <CreatorInbox onChatOpen={setIsCreatorChatOpen} />
             </div>
          </motion.div>
        )}

        {view === 'DEAL_ROOM' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-h-screen z-10">
            <DealRoom userRole={userRole === 'CREATOR' ? 'CREATOR' : 'BRAND'} />
          </motion.div>
        )}

        {view === 'PAYOUT_DASHBOARD' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-h-screen z-10 relative">
            <PayoutDashboard />
          </motion.div>
        )}

        {view === 'ADMIN_DASHBOARD' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-h-screen z-10 relative">
            <AdminDashboard onLogout={handleLogout} />
          </motion.div>
        )}
          </>
        )}
      </main>

      <BottomNav 
        currentView={view} 
        userRole={userRole} 
        onNavigate={handleNavigate} 
        onOpenReels={() => setShowReelsFeed(true)}
        isHidden={view === 'CHAT' || isCreatorChatOpen || showReelsFeed} 
      />

      {view === 'HOME' && <Footer />}
    </div>
  );
}
