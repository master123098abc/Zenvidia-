import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, Building, User, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import GlowingFlower from './GlowingFlower';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (type: 'BRAND' | 'CREATOR', handle?: string, brandData?: any) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [signupRole, setSignupRole] = useState<'brand' | 'creator' | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const CLOUDINARY_CLOUD_NAME = 'dooosiyxw';
      const CLOUDINARY_UPLOAD_PRESET = 'Zenvidia'; 
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.secure_url) {
          setProfilePicUrl(data.secure_url);
        }
      } catch (err) {
        console.error("Upload failed", err);
      }
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          // Note: for google auth, we might have to handle role selection either before or after
        }
      });
      if (error) {
        setErrorMessage(error.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to initiate Google sign in.");
    }
  };

  const handleAuthSubmit = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Email and password required.");
      return;
    }
    setIsLoggingIn(true);
    setErrorMessage('');
    
    try {
      if (authMode === 'LOGIN') {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Invalid email or password.");
        
        onClose();
      } else {
        if (!termsAccepted) {
          throw new Error('You must accept the terms to continue');
        }

        // Sign Up
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: signupRole, avatar_url: profilePicUrl }
          }
        });

        if (authError) throw authError;
        if (!authData?.user) throw new Error("Failed to sign up.");
        
        onClose(); // The onAuthStateChange in App.tsx will pick this up
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err?.message === "User already registered") {
        setErrorMessage("Account already exists. Please switch to Login.");
      } else {
        setErrorMessage(err?.message || "An unexpected error occurred.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-hidden pt-24 pb-12"
      >

        <motion.div 
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-gray-950/80 backdrop-blur-sm border border-gray-800 text-white rounded-[2rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden my-auto z-0 max-h-[90vh] overflow-y-auto scrollbar-hide"
        >
          <div className="absolute inset-0 -z-10 w-full h-full">
            <GlowingFlower />
          </div>
          <div className="relative z-10">
            <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors z-[100]">
              <X className="w-5 h-5 text-neutral-400" />
            </button>

          <div className="p-8">
            <div className="text-center mb-6 mt-2">
              <h2 className="font-display text-3xl font-bold text-white mb-2">Welcome</h2>
              <p className="text-neutral-400">Join the Zenvidia network.</p>
            </div>

            {/* Top Tabs: Login | Sign Up */}
            <div className="flex p-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl mb-6">
              <button 
                onClick={() => { setAuthMode('LOGIN'); setErrorMessage(''); }}
                className={`flex-1 py-2.5 font-semibold text-sm rounded-lg transition-all ${authMode === 'LOGIN' ? 'bg-white/20 shadow text-white' : 'text-neutral-400 hover:text-white'}`}
              >
                Log In
              </button>
              <button 
                onClick={() => { setAuthMode('SIGNUP'); setErrorMessage(''); }}
                className={`flex-1 py-2.5 font-semibold text-sm rounded-lg transition-all ${authMode === 'SIGNUP' ? 'bg-white/20 shadow text-white' : 'text-neutral-400 hover:text-white'}`}
              >
                Sign Up
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-900/40 border border-red-500/50 rounded-lg text-red-200 text-sm font-medium text-center backdrop-blur-md">
                {errorMessage}
              </div>
            )}

            {authMode === 'SIGNUP' && !signupRole ? (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="text-xl font-bold text-white text-center mb-4">I am a...</h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button 
                    onClick={() => setSignupRole('brand')}
                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-white/10 backdrop-blur-md transition-all text-center group"
                  >
                    <Building className="w-8 h-8 text-neutral-400 group-hover:text-orange-500 mb-2 transition-colors" />
                    <span className="font-bold text-white">Brand</span>
                    <span className="text-xs text-neutral-400 mt-1">Local business</span>
                  </button>
                  <button 
                    onClick={() => setSignupRole('creator')}
                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-teal-500/50 hover:bg-white/10 backdrop-blur-md transition-all text-center group"
                  >
                    <User className="w-8 h-8 text-neutral-400 group-hover:text-teal-500 mb-2 transition-colors" />
                    <span className="font-bold text-white">Creator</span>
                    <span className="text-xs text-neutral-400 mt-1">Influencer</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                {authMode === 'SIGNUP' && (
                  <div className="flex justify-center mb-6">
                    <label className="relative group cursor-pointer w-20 h-20 bg-white/5 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
                      {profilePicUrl ? (
                        <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-neutral-400 group-hover:text-white" />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-white text-xs font-bold">{profilePicUrl ? 'Change' : 'Upload'}</span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                )}
                
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 pl-11 min-h-[56px] bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-md transition-shadow"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                </div>
                <div className="relative">
                  <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pl-11 min-h-[56px] bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-md transition-shadow"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                </div>

                {authMode === 'SIGNUP' && (
                  <div className="mt-2 space-y-2">
                    <label className="flex items-start gap-3 p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                      <div className="relative flex items-center mt-0.5">
                        <input 
                          type="checkbox" 
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/20 bg-white/5 checked:border-teal-500 checked:bg-teal-500 transition-all"
                        />
                        <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 8 7 12 13 4"></polyline>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <span className="text-xs text-neutral-400 font-medium">
                          I agree to the Zenvidia Terms of Service and Honor Code.
                        </span>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowTerms(!showTerms);
                          }}
                          className="text-xs text-teal-400 block mt-1 hover:text-teal-300"
                        >
                          {showTerms ? 'Hide Terms' : 'Show Full Terms'}
                        </button>
                      </div>
                    </label>

                    {showTerms && (
                      <div className="max-h-24 overflow-y-auto bg-white/5 backdrop-blur-md p-3 rounded-lg text-[10px] sm:text-xs text-neutral-400 border border-white/10 space-y-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                        <p><strong>Age Limit:</strong> I confirm I am 13 years of age or older.</p>
                        <p><strong>Media License:</strong> I grant Zenvidia permission to fetch and display my Instagram Reels.</p>
                        <p><strong>Honor Code Fee:</strong> I agree to manually clear the 5% Zenvidia platform fee upon successful completion of direct deals.</p>
                        <p><strong>Direct Payment Waiver:</strong> Zenvidia operates strictly as a discovery platform. All payments are transferred directly between Brands and Creators. Zenvidia is NOT liable for any payment defaults.</p>
                        <p><strong>Authenticity:</strong> I certify my metrics are genuine. No bots allowed.</p>
                      </div>
                    )}
                  </div>
                )}

                <button 
                  onClick={handleAuthSubmit}
                  disabled={isLoggingIn}
                  className={`w-full text-white py-4 rounded-xl font-bold transition duration-300 shadow-lg min-h-[56px] mt-2 disabled:opacity-70 ${
                    signupRole === 'brand' 
                      ? 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-orange-500/20' 
                      : 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 shadow-teal-500/20'
                  }`}
                >
                  {isLoggingIn ? 'Please wait...' : (authMode === 'LOGIN' ? 'Log In' : 'Sign Up')}
                </button>
              </motion.div>
            )}

             {(authMode === 'LOGIN' || (authMode === 'SIGNUP' && signupRole)) && (
               <>
                 <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-800"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-neutral-900 text-neutral-500">Or continue with</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleGoogleAuth}
                  className="w-full bg-white text-neutral-900 py-3.5 rounded-xl font-bold hover:bg-neutral-200 transition duration-300 shadow-sm min-h-[56px] mb-2 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign In with Google
                </button>
               </>
             )}

          </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
