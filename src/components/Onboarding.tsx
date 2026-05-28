import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building, User, ChevronRight, Check, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';

import GlowingFlower from './GlowingFlower';

interface OnboardingProps {
  onComplete: (role: 'CREATOR' | 'BRAND', handle: string, dataObj?: any) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [role, setRole] = useState<'CREATOR' | 'BRAND' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const [existingAvatarUrl, setExistingAvatarUrl] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUserId(data.user.id);
        const metaRole = data.user.user_metadata?.role;
        const avatarUrl = data.user.user_metadata?.avatar_url;
        if (metaRole === 'brand' || metaRole === 'BRAND') setRole('BRAND');
        else if (metaRole === 'creator' || metaRole === 'CREATOR') setRole('CREATOR');
        else {
          const intent = localStorage.getItem('zenvidia_role_intent');
          if (intent === 'brand') setRole('BRAND');
          else if (intent === 'creator') setRole('CREATOR');
          else setRole('CREATOR'); // Default fallback if somehow still null
        }
        
        localStorage.removeItem('zenvidia_role_intent');

        if (avatarUrl) {
           setExistingAvatarUrl(avatarUrl);
           setBProfileUrl(avatarUrl);
        }
      }
    });
  }, []);

  // Creator fields
  const [cName, setCName] = useState('');
  const [cIgHandle, setCIgHandle] = useState('');
  const [cFollowers, setCFollowers] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cPrimaryNiche, setCPrimaryNiche] = useState('');
  const [cSecondaryNiche, setCSecondaryNiche] = useState('');
  const [cPrimaryLanguage, setCPrimaryLanguage] = useState('');
  const [cSecondaryLanguage, setCSecondaryLanguage] = useState('');
  
  const nicheOptions = ['Fashion', 'Beauty', 'Lifestyle', 'Tech', 'Gaming', 'Fitness', 'Food', 'Travel', 'Education', 'Finance', 'Comedy', 'Other'];
  const languageOptions = ['Assamese', 'Bodo', 'Karbi', 'Bengali', 'English', 'Hindi', 'Marathi', 'Telugu', 'Tamil', 'Gujarati', 'Urdu', 'Other'];

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const isCreatorFormValid = Boolean(cName && cFollowers && (photoFile || existingAvatarUrl) && cPrimaryNiche && cPrimaryLanguage && termsAccepted);

  // Brand fields
  const [bBusinessName, setBBusinessName] = useState('');
  const [bIgHandle, setBIgHandle] = useState('');
  const [bBusinessType, setBBusinessType] = useState('');
  const [bBudget, setBBudget] = useState('');
  const [bPhone, setBPhone] = useState('');
  const [bCity, setBCity] = useState('');
  const [bProfileUrl, setBProfileUrl] = useState('');
  const [bEmail, setBEmail] = useState('');

  const handlePhotoUpload = async (file: File): Promise<string> => {
    const CLOUDINARY_CLOUD_NAME = 'dooosiyxw';
    const CLOUDINARY_UPLOAD_PRESET = 'Zenvidia'; 
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    });
    
    const data = await res.json();
    if (!data.secure_url) throw new Error("Upload failed");
    return data.secure_url;
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (role === 'CREATOR' && !isCreatorFormValid) {
        setErrorMsg('Please fill out all mandatory fields correctly.');
        return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    console.log("Starting onboarding submission...");

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user?.id) {
        throw new Error("User session not found. Please log in again.");
      }
      
      const currentUserId = authData.user.id;
      let insertError;
      let uploadedPhotoUrl = existingAvatarUrl;

      if (role === 'CREATOR') {
        console.log("Inserting creator...", { user_id: currentUserId, ig_handle: cIgHandle });
        
        if (photoFile) {
           uploadedPhotoUrl = await handlePhotoUpload(photoFile);
        }

        const { error } = await supabase.from('creators').insert({
          user_id: currentUserId,
          ig_handle: cIgHandle,
          follower_count: parseInt(cFollowers) || 0,
          profile_url: uploadedPhotoUrl,
          primary_niche: cPrimaryNiche,
          secondary_niche: cSecondaryNiche,
          primary_language: cPrimaryLanguage,
          secondary_language: cSecondaryLanguage
        });
        insertError = error;
      } else {
        console.log("Inserting brand...", { user_id: currentUserId, business_name: bBusinessName });
        const { error } = await supabase.from('brands').insert({
          user_id: currentUserId,
          business_name: bBusinessName,
          ig_handle: bIgHandle,
          business_type: bBusinessType,
          budget: parseInt(bBudget) || 0,
          phone: bPhone,
          city: bCity,
          profile_url: bProfileUrl,
          email: bEmail
        });
        insertError = error;
      }
      
      if (insertError) {
        console.error("Supabase Insert Error:", insertError);
        if (insertError.message && insertError.message.includes("row-level security")) {
           throw new Error("Row-Level Security (RLS) is blocking the save. Please disable RLS or add an INSERT policy for this table in your Supabase dashboard.");
        }
        throw insertError;
      }
      
      console.log("Insert successful, calling onComplete()");
      if (role === 'CREATOR') {
          onComplete('CREATOR', cIgHandle, {
            user_id: currentUserId,
            ig_handle: cIgHandle,
            follower_count: parseInt(cFollowers) || 0,
            profile_url: uploadedPhotoUrl,
            niche: cPrimaryNiche,
            primary_niche: cPrimaryNiche,
            secondary_niche: cSecondaryNiche,
            primary_language: cPrimaryLanguage,
            secondary_language: cSecondaryLanguage,
            status: 'pending' // Usually pending by default
          });
      } else {
          onComplete('BRAND', bIgHandle, {
            user_id: currentUserId,
            business_name: bBusinessName,
            ig_handle: bIgHandle,
            business_type: bBusinessType,
            budget: parseInt(bBudget) || 0,
            phone: bPhone,
            city: bCity,
            profile_url: bProfileUrl,
            email: bEmail
          });
      }
    } catch (err: any) {
      console.error("Supabase Error:", err);
      const msg = typeof err === 'string' ? err : (err?.message || JSON.stringify(err) || "Failed to save profile.");
      setErrorMsg("Error: " + msg);
    } finally {
      console.log("Resetting isSubmitting to false");
      setIsSubmitting(false);
    }
  };

  const termsContent = (
    <div className="w-full">
      <div className="flex items-start gap-2 pt-2">
        <input 
          type="checkbox" 
          required 
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-1 peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-neutral-600 bg-neutral-900 checked:border-cyan-500 checked:bg-cyan-500 transition-all" 
        />
        <label className="text-xs text-neutral-400 leading-relaxed cursor-pointer" onClick={() => setShowTerms(!showTerms)}>
          I agree to the Zenvidia Terms of Service and Honor Code (5% fee). 
          <span className="text-cyan-500 ml-1 hover:underline">Read Terms {showTerms ? '▲' : '▼'}</span>
        </label>
      </div>
      <AnimatePresence>
        {showTerms && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-3"
          >
            <div className="max-h-24 overflow-y-auto bg-gray-900/50 p-3 rounded-lg border border-neutral-800 text-[10px] text-neutral-400 space-y-2">
              <p><strong>1. Age Limit (13+):</strong> You certify that you are at least 13 years of age or older.</p>
              <p><strong>2. Media License:</strong> You grant Zenvidia a non-exclusive license to display your public profile and content for platform operations.</p>
              <p><strong>3. Honor Code & Platform Fee:</strong> Zenvidia takes a 5% transaction fee on successfully completed brand deals mediated through the platform.</p>
              <p><strong>4. Direct Payment Waiver:</strong> Circumventing platform payments for deals initiated on Zenvidia is a violation of the Honor Code.</p>
              <p><strong>5. Authenticity:</strong> You certify that your followers and engagement data represent authentic human interactions.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderCreatorForm = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-white mb-2">Creator Profile</h2>
        <p className="text-neutral-400">Let brands know what you're all about.</p>
      </div>

      <div className="flex justify-center md:col-span-2 mb-4">
        <label className="w-24 h-24 rounded-full bg-gray-800 border-2 border-teal-400 flex items-center justify-center cursor-pointer relative overflow-hidden group">
          {(photoFile || existingAvatarUrl) ? (
            <img src={photoFile ? URL.createObjectURL(photoFile) : existingAvatarUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-8 h-8 text-neutral-400 group-hover:text-white transition-colors" />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-xs font-bold w-min text-center leading-tight">Change<br/>Photo</span>
          </div>
          <input 
            type="file" 
            accept="image/*"
            onChange={e => setPhotoFile(e.target.files ? e.target.files[0] : null)} 
            className="hidden" 
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pl-1">Full Name <span className="text-red-500">*</span></label>
          <input type="text" value={cName} onChange={e => setCName(e.target.value)} placeholder="e.g., Rahul Sharma, Priya Singh" className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" required />
        </div>
        
        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pl-1">Instagram Handle</label>
          <input type="text" value={cIgHandle} onChange={e => setCIgHandle(e.target.value)} placeholder="@yourhandle" className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pl-1">Follower Count <span className="text-red-500">*</span></label>
          <input type="number" value={cFollowers} onChange={e => setCFollowers(e.target.value)} placeholder="e.g. 10000" className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" required />
        </div>
        
        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pl-1">Primary Niche <span className="text-red-500">*</span></label>
          <select value={cPrimaryNiche} onChange={e => setCPrimaryNiche(e.target.value)} className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none appearance-none" required>
            <option value="" disabled>Select Niche</option>
            {nicheOptions.map(opt => <option key={`pri-niche-${opt}`} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pl-1">Secondary Niche</label>
          <select value={cSecondaryNiche} onChange={e => setCSecondaryNiche(e.target.value)} className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none appearance-none">
            <option value="">None / Optional</option>
            {nicheOptions.map(opt => <option key={`sec-niche-${opt}`} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pl-1">Primary Language <span className="text-red-500">*</span></label>
          <select value={cPrimaryLanguage} onChange={e => setCPrimaryLanguage(e.target.value)} className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none appearance-none" required>
            <option value="" disabled>Select Language</option>
            {languageOptions.map(opt => <option key={`pri-lang-${opt}`} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pl-1">Secondary Language</label>
          <select value={cSecondaryLanguage} onChange={e => setCSecondaryLanguage(e.target.value)} className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none appearance-none">
            <option value="">None / Optional</option>
            {languageOptions.map(opt => <option key={`sec-lang-${opt}`} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>

      {errorMsg && <p className="text-red-400 text-sm text-center">{errorMsg}</p>}

      {termsContent}

      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !isCreatorFormValid}
          className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center space-x-2 ${
            isSubmitting || !isCreatorFormValid 
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed shadow-none' 
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20'
          }`}
        >
          <span>{isSubmitting ? 'Saving Profile & Uploading...' : 'Complete Profile'}</span>
          {!isSubmitting && <Check className="w-5 h-5" />}
        </button>
      </div>
    </motion.div>
  );

  const renderBrandForm = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-white mb-2">Brand Profile</h2>
        <p className="text-neutral-400">Tell us about your business.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pl-1">Business Name</label>
          <input type="text" value={bBusinessName} onChange={e => setBBusinessName(e.target.value)} placeholder="e.g., Tata Motors, Zomato, Nykaa" className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pl-1">Instagram Handle</label>
          <input type="text" value={bIgHandle} onChange={e => setBIgHandle(e.target.value)} placeholder="@yourbrand" className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pl-1">Business Type</label>
          <input type="text" value={bBusinessType} onChange={e => setBBusinessType(e.target.value)} placeholder="e.g. E-commerce, SaaS, Cafe" className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pl-1">Monthly Marketing Budget (₹)</label>
          <input type="text" value={bBudget} onChange={e => setBBudget(e.target.value)} placeholder="e.g., ₹50,000" className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pl-1">Phone Number</label>
          <input type="tel" value={bPhone} onChange={e => setBPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pl-1">City</label>
          <input type="text" value={bCity} onChange={e => setBCity(e.target.value)} placeholder="e.g., Mumbai, Delhi, Guwahati" className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pl-1">Contact Email</label>
          <input type="email" value={bEmail} onChange={e => setBEmail(e.target.value)} placeholder="hello@company.com" className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pl-1">Website or Profile URL</label>
          <input type="text" value={bProfileUrl} onChange={e => setBProfileUrl(e.target.value)} placeholder="https://yourcompany.com" className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
        </div>
      </div>

      {errorMsg && <p className="text-red-400 text-sm text-center">{errorMsg}</p>}

      {termsContent}

      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !termsAccepted}
          className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center space-x-2 ${
            isSubmitting || !termsAccepted
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed shadow-none' 
              : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-500/20'
          }`}
        >
          <span>{isSubmitting ? 'Saving...' : 'Complete Profile'}</span>
          {!isSubmitting && <Check className="w-5 h-5" />}
        </button>
      </div>
    </motion.div>
  );

  if (!role) return null;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden bg-[#000]">
      
      <div className="w-full max-w-2xl bg-gray-950/80 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden z-0 text-white">
        <div className="absolute inset-0 -z-10 w-full h-full">
          <GlowingFlower />
        </div>
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {role === 'CREATOR' && <div key="creator">{renderCreatorForm()}</div>}
            {role === 'BRAND' && <div key="brand">{renderBrandForm()}</div>}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
