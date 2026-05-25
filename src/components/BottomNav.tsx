import React from 'react';
import { Home, Clapperboard, MessageSquare, User } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: any) => void;
  onOpenReels: () => void;
  isHidden: boolean;
  userRole: 'BRAND' | 'CREATOR' | 'ADMIN' | null;
}

export default function BottomNav({ currentView, onNavigate, onOpenReels, isHidden, userRole }: BottomNavProps) {
  if (isHidden) return null;

  return (
    <div className="fixed md:hidden bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-neutral-800 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        <button 
          onClick={() => onNavigate('HOME')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === 'HOME' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          <Home className="w-6 h-6" />
        </button>

        <button 
          onClick={() => onOpenReels()}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 text-neutral-500 hover:text-teal-400 transition-colors`}
        >
          <Clapperboard className="w-6 h-6" />
        </button>

        <button 
          onClick={() => onNavigate('INBOX')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === 'INBOX' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          <MessageSquare className="w-6 h-6" />
        </button>

        <button 
          onClick={() => {
            if (userRole === 'CREATOR') {
              onNavigate('CREATOR_PORTAL');
            } else if (userRole === 'BRAND') {
              onNavigate('BRAND_DASHBOARD');
            } else {
              onNavigate('HOME'); // defaults to home which opens auth if restricted
            }
          }}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${(currentView === 'CREATOR_PORTAL' || currentView === 'BRAND_DASHBOARD') ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          <User className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
