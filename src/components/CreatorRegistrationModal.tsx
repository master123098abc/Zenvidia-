import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CreatorRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (creatorHandle: string) => void;
}

const NICHES = ['Fashion', 'Food & Dining', 'Lifestyle', 'Travel', 'Tech', 'Education', 'Comedy', 'Art', 'Music', 'Bihu'];
const LANGUAGES = ['Assamese', 'Hindi', 'English', 'Bengali', 'Bodo', 'Other'];

export default function CreatorRegistrationModal({ isOpen, onClose, onSuccess }: CreatorRegistrationModalProps) {
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [followers, setFollowers] = useState('');
  const [niche, setNiche] = useState(NICHES[0]);
  const [niche2, setNiche2] = useState('');
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [language2, setLanguage2] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // 1. Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setErrorMessage(authError.message || JSON.stringify(authError));
        setIsSubmitting(false);
        return;
      }

      const uid = authData?.user?.id;
      if (!uid) {
        setErrorMessage('Authentication failed: No user ID returned from Supabase.');
        setIsSubmitting(false);
        return;
      }

      // 2. Insert into creators table
      const payload = {
        user_id: uid,
        ig_handle: handle.replace('@', ''),
        follower_count: Number(followers),
        profile_url: null,
        primary_niche: niche,
        secondary_niche: niche2,
        primary_language: language,
        secondary_language: language2,
        status: 'pending'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('creators')
        .insert([payload])
        .select();

      if (insertError) {
        console.error('Error inserting creator:', insertError);
        setErrorMessage(insertError.message || insertError.details || JSON.stringify(insertError));
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        onSuccess(handle.replace('@', ''));
        onClose();
      }, 3000);
      
    } catch (err: any) {
      console.error("Catch block error:", err);
      setErrorMessage(err?.message || JSON.stringify(err) || 'An unexpected network error occurred.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] p-6 sm:p-8 custom-scrollbar"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 p-2 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-white mb-2 pr-8">Join as Creator</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6">Apply to join Assam's premier creator marketplace.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide mb-1.5">Instagram Handle</label>
              <input 
                type="text" 
                required
                value={handle || ''}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@username"
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all font-medium text-neutral-900 dark:text-white"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide mb-1.5">Email</label>
                <input 
                  type="email" 
                  required
                  value={email || ''}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@example.com"
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all font-medium text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide mb-1.5">Password</label>
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={password || ''}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all font-medium text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide mb-1.5">Follower Count</label>
              <input 
                type="number" 
                required
                min="0"
                value={followers || ''}
                onChange={(e) => setFollowers(e.target.value)}
                placeholder="e.g. 15000"
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all font-medium text-neutral-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide mb-1.5">Primary Niche</label>
                <select 
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all font-medium text-neutral-900 dark:text-white appearance-none"
                >
                  {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide mb-1.5">Secondary Niche</label>
                <select 
                  value={niche2}
                  onChange={(e) => setNiche2(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all font-medium text-neutral-900 dark:text-white appearance-none text-sm"
                >
                  <option value="">None</option>
                  {NICHES.filter(n => n !== niche).map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide mb-1.5">Primary Language</label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all font-medium text-neutral-900 dark:text-white appearance-none"
                >
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide mb-1.5">Secondary Language</label>
                <select 
                  value={language2}
                  onChange={(e) => setLanguage2(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all font-medium text-neutral-900 dark:text-white appearance-none text-sm"
                >
                  <option value="">None</option>
                  {LANGUAGES.filter(l => l !== language).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-4 bg-gradient-to-r from-orange-500 hover:from-orange-400 to-orange-600 hover:to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Apply Now'}
            </button>
            {errorMessage && (
              <p className="text-red-500 text-sm text-center font-bold mt-2">{errorMessage}</p>
            )}
          </form>

          {/* Success Toast Overlay */}
          <AnimatePresence>
            {showToast && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl text-neutral-900 dark:text-white mb-2">Application Submitted!</h3>
                <p className="text-neutral-600 dark:text-neutral-400">Our founder will manually verify your profile shortly.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
