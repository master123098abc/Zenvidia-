import React, { useState, useEffect } from 'react';
import { Paperclip, Send, Instagram, ArrowLeft, Lightbulb, Handshake, CheckCircle2, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ChatInterfaceProps {
  activeCreatorId?: number | null;
  onBrowseCreators: () => void;
  currentBrandData?: any;
}

export default function ChatInterface({ activeCreatorId, onBrowseCreators, currentBrandData }: ChatInterfaceProps) {
  const [activeChat, setActiveChat] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [mobileView, setMobileView] = useState<'LIST' | 'CHAT'>('LIST');
  const [basePay, setBasePay] = useState(2000);
  const [viewBonus, setViewBonus] = useState(200);
  const [isSending, setIsSending] = useState(false);
  const [dealStatus, setDealStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch unique chats and messages
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState('');

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true);
      const timeoutId = setTimeout(() => setIsLoading(false), 5000);

      try {
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData?.user?.id;
        
        if (uid) {
          // Fetch deals that involve this user (either brand or creator)
          const { data: dealsData, error } = await supabase
            .from('deals')
            .select('*')
            .or('brand_id.eq.' + uid + ',creator_id.eq.' + uid)
            .order('created_at', { ascending: false });

          if (error) console.log("FETCH DEALS ERROR:", error);
          
          let fetchedContacts = dealsData ? dealsData.map(d => {
            const isCreator = d.creator_id === uid;
            return {
              id: isCreator ? d.brand_id : d.creator_id,
              display_name: isCreator ? (d.brand_name || 'Brand') : ('@' + (d.creator_handle || 'creator')),
              ig_handle: d.creator_handle || 'creator',
              follower_count: 5000, 
              profile_url: null,
              brand_id_str: d.brand_id,
              brand_name: d.brand_name || 'Brand',
              deal_id: d.id,
              deal_status: d.status,
              base_pay: d.base_pay || 0,
              view_bonus_per_500: d.view_bonus_per_500 || 0,
              isCreatorView: isCreator 
            };
          }) : [];

          // Deduplicate by deal
          let uniqueContacts = fetchedContacts;
          
          if (activeCreatorId) {
             const { data: creatorInfo } = await supabase.from('creators').select('*').eq('id', activeCreatorId).limit(1).maybeSingle();
             if (creatorInfo && creatorInfo.user_id) {
                 const matchIndex = uniqueContacts.findIndex(c => c.id === creatorInfo.user_id);
                 if (matchIndex >= 0) {
                     // Set to the top
                     const match = uniqueContacts[matchIndex];
                     uniqueContacts.splice(matchIndex, 1);
                     uniqueContacts.unshift(match);
                 } else {
                     // Add an optimistic contact for this creator, with no deal_id
                     uniqueContacts.unshift({
                        id: creatorInfo.user_id,
                        display_name: '@' + (creatorInfo.ig_handle || 'creator'),
                        ig_handle: creatorInfo.ig_handle || 'creator',
                        follower_count: 5000,
                        profile_url: null,
                        brand_id_str: uid,
                        brand_name: currentBrandData?.business_name || 'Brand',
                        deal_id: null, // this will signify a NEW deal being drafted
                        deal_status: null,
                        base_pay: 500,
                        view_bonus_per_500: 100,
                        isCreatorView: false
                     });
                 }
             }
          }

          if (uniqueContacts.length > 0) {
              const targetContact = uniqueContacts[0];
              setActiveChat(targetContact);
              setMobileView('CHAT');
              setDealStatus(targetContact.deal_status || null);
              setBasePay(targetContact.base_pay || 500);
              setViewBonus(targetContact.view_bonus_per_500 || 100);
          } else {
              setActiveChat(null);
          }
          
          setContacts(uniqueContacts);
        }
      } catch (err) {
        console.error("Error fetching contacts:", err);
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [activeCreatorId, currentBrandData]);

  // Fetch real messages for the active chat
  useEffect(() => {
    if (!activeChat || !activeChat.deal_id) return;
    
    const fetchMessages = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;

        const { data, error } = await supabase
          .from('deals')
          .select('last_message')
          .eq('id', activeChat.deal_id)
          .limit(1)
          .maybeSingle();

        if (!error && data && data.last_message) {
           try {
             const msgs = JSON.parse(data.last_message);
             if (Array.isArray(msgs)) {
                // Ensure sender maps to the old logic (it usually used sender_id or sender)
                const mappedMsgs = msgs.map(m => ({
                   ...m,
                   sender: m.sender_id === userData.user.id ? 'ME' : 'THEM' // fallback
                }));
                setMessages(msgs);
             }
           } catch(e) {}
        }
      } catch (e) {}
    };
    
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [activeChat]);

  const handleSendMessage = async () => {
    if (!inputMsg.trim() || !activeChat || !activeChat.deal_id) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      
      const newMsg = {
        sender_id: userData.user.id,
        text: inputMsg.trim(),
        created_at: new Date().toISOString()
      };

      const updatedMsgs = [...messages, newMsg];
      setMessages(updatedMsgs);
      setInputMsg('');

      await supabase.from('deals').update({
        last_message: JSON.stringify(updatedMsgs)
      }).eq('id', activeChat.deal_id);
    } catch (err) {}
  };

  const handleSendDeal = async () => {
    setIsSending(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Not logged in");

      let fetchBrandId = currentBrandData?.id;
      if (!fetchBrandId) {
        const { data: bData } = await supabase.from('brands').select('id').eq('user_id', userData.user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
        fetchBrandId = bData?.id;
      }
      
      const payload = {
        base_pay: basePay,
        view_bonus_per_500: viewBonus,
        status: 'offered'
      };

      if (activeChat.deal_id) {
        const { error } = await supabase.from('deals').update(payload).eq('id', activeChat.deal_id);
        if (error) console.error(error);
      } else {
        // Fallback just in case
        let brandName = currentBrandData?.business_name || 'Brand';
        if (!currentBrandData) {
          const { data: bData } = await supabase.from('brands').select('business_name').eq('id', fetchBrandId).limit(1).maybeSingle();
          if (bData) brandName = bData.business_name;
        }

        const { data, error } = await supabase.from('deals').insert([{
           ...payload,
           brand_id: userData.user.id,
           creator_id: activeChat.id,
           brand_name: brandName,
           creator_handle: activeChat.ig_handle,
           views_after_3days: 0,
           total_paid: 0
        }]).select();
        
        if (error) console.error(error);
        if (data && data[0]) {
           activeChat.deal_id = data[0].id;
        }
      }
      
      setDealStatus('offered');
      
      // Update local contacts to reflect the updated deal
      setContacts(prev => prev.map(c => {
        if (c.id === activeChat.id) {
           return { ...c, deal_status: 'offered', base_pay: basePay, view_bonus_per_500: viewBonus };
        }
        return c;
      }));
    } catch (err) {
      console.error(err);
      alert('Error updating deal');
    }
    setIsSending(false);
  };

  const getSuggestion = () => {
    const followers = activeChat?.follower_count || 0;
    if (followers < 5000) return { base: '₹500 - 1000', bonus: '₹100' };
    if (followers < 10000) return { base: '₹1000 - 2000', bonus: '₹150' };
    return { base: '₹2000 - 4000', bonus: '₹200' };
  };
  const suggestion = getSuggestion();

  return (
    <div className="flex h-screen pt-[72px] md:pt-20 bg-neutral-950 overflow-hidden max-w-[1700px] mx-auto w-full">
      {/* Left Chat List */}
      <div className={`w-full md:w-80 border-r border-neutral-800 flex flex-col bg-neutral-900/50 ${mobileView !== 'LIST' ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 sm:p-6 border-b border-neutral-800 bg-neutral-950">
          <h2 className="font-display text-2xl font-bold text-white tracking-tight">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center p-8">
               <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : contacts.length > 0 ? (
            contacts.map((contact) => (
              <button 
                key={contact.id}
                onClick={() => { 
                  setActiveChat(contact); 
                  setMobileView('CHAT'); 
                  if (contact.deal_status) {
                    setDealStatus(contact.deal_status);
                    if (contact.base_pay) setBasePay(contact.base_pay);
                    if (contact.view_bonus_per_500) setViewBonus(contact.view_bonus_per_500);
                  } else {
                    setDealStatus(null);
                  }
                }}
                className={`w-full flex items-center p-3 rounded-2xl transition-colors ${activeChat?.id === contact.id ? 'bg-neutral-800/80 shadow-sm border border-neutral-700' : 'hover:bg-neutral-800/50 border border-transparent'}`}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden flex-shrink-0 shadow-sm bg-neutral-800 flex items-center justify-center border-2 border-neutral-700">
                  {contact.profile_url ? (
                    <img src={contact.profile_url} alt={contact.display_name || contact.ig_handle} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-neutral-500 uppercase">{(contact.display_name || contact.ig_handle)?.[0]}</span>
                  )}
                </div>
                <div className="ml-4 flex-1 text-left overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-sm sm:text-base text-white truncate">{contact.display_name || ('@' + contact.ig_handle)}</h4>
                    <span className="text-[10px] text-neutral-500 whitespace-nowrap ml-2">New</span>
                  </div>
                  <p className={`text-xs sm:text-sm truncate text-neutral-400`}>Tap to view deal</p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center p-6 mt-10">
               <p className="text-sm text-neutral-500">No active conversations</p>
            </div>
          )}
        </div>
      </div>

      {/* Middle Chat Window / Empty State */}
      <div className={`flex-1 flex flex-col bg-neutral-950 h-full ${mobileView === 'LIST' ? 'hidden md:flex' : 'flex'}`}>
        {!activeChat ? (
           <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
             <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6 shadow-xl border border-neutral-800">
               <MessageSquare className="w-10 h-10 text-cyan-500" />
             </div>
             <h3 className="text-xl font-display font-bold text-white mb-2">No messages yet</h3>
             <p className="text-neutral-400 text-sm max-w-sm mb-8">Browse creators and send your first deal offer</p>
             <button 
               onClick={onBrowseCreators}
               className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
             >
               Browse Creators
             </button>
           </div>
        ) : (
          <>
            {/* Chat Header */}
        <div className="p-3 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950 z-10 w-full shrink-0 h-[76px] sm:h-[84px]">
          <div className="flex items-center">
            <button 
              onClick={() => setMobileView('LIST')}
              className="md:hidden mr-3 p-2 -ml-2 rounded-full hover:bg-neutral-800 text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-neutral-800 border border-neutral-700">
              {activeChat.profile_url ? (
                <img src={activeChat.profile_url} alt={activeChat.display_name || activeChat.ig_handle} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-neutral-500 uppercase">{(activeChat.display_name || activeChat.ig_handle)?.[0]}</span>
              )}
            </div>
            <div className="ml-3 sm:ml-4">
               <div className="flex items-center gap-2">
                 <h3 className="font-bold text-white text-base sm:text-lg">{activeChat.display_name || ('@' + activeChat.ig_handle)}</h3>
                 {dealStatus === 'offered' && <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded uppercase">Deal Pending</span>}
                 {dealStatus === 'accepted' && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded uppercase">Deal Accepted</span>}
               </div>
              <p className="text-xs text-neutral-400 flex items-center font-medium"><span className="w-2 h-2 bg-[#10B981] rounded-full mr-1.5 shadow-[0_0_8px_#10B981]" /> Online</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center text-sm font-bold text-cyan-400 bg-cyan-950/30 border border-cyan-500/20 px-5 py-2.5 rounded-full hover:bg-cyan-900/50 transition-colors">
              <Instagram className="w-4 h-4 mr-2" /> Profile
            </button>
          </div>
        </div>

        {/* Chat Messages and Deal Panel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">Today</span>
            </div>

            {/* Outgoing Deal Proposal */}
            {dealStatus === 'offered' && (
              <div className="flex items-end justify-end max-w-[90%] sm:max-w-[80%] ml-auto mt-6">
                <div className="bg-teal-900/30 border border-teal-500/30 rounded-2xl p-4 sm:p-5 w-full shadow-lg text-left backdrop-blur-md">
                  <div className="flex items-center justify-between mb-3 border-b border-teal-500/20 pb-3">
                    <h4 className="font-bold text-teal-400 flex items-center">
                      <Handshake className="w-5 h-5 mr-2" />
                      Deal Proposal Sent
                    </h4>
                    <span className="text-xs font-bold bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">PENDING</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-400">Base Pay (Upfront)</span>
                      <span className="text-white font-bold text-base">₹{basePay.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-400">View Bonus</span>
                      <span className="text-orange-400 font-bold text-base">₹{viewBonus.toLocaleString()} / 500 views</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Render Text Messages */}
            {messages.map((msg, idx) => {
               const isMe = msg.sender === 'BRAND';
               return (
                 <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full mt-4`}>
                   <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-[15px] sm:text-base ${isMe ? 'bg-cyan-600 text-white border border-cyan-500/20' : 'bg-neutral-800 text-neutral-100 border border-neutral-700'}`}>
                     <p className="leading-relaxed">{msg.text}</p>
                     <span className={`block text-[10px] mt-1.5 opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                       {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span>
                   </div>
                 </div>
               );
            })}
          </div>
          
          {/* BOTTOM SECTION: Deal Panel */}
          <div className="max-w-3xl mx-auto mt-12 border-t border-neutral-800 pt-8 pb-4 space-y-6">
             <div className="flex items-center justify-between mb-2">
               <h2 className="font-display text-xl font-bold text-white flex items-center">
                 <Handshake className="w-5 h-5 mr-2 text-teal-400" />
                 Create New Deal
               </h2>
             </div>

             {/* Section 1: Smart Suggestion Box */}
             <div className="bg-emerald-950/30 border border-emerald-500/50 rounded-2xl p-5 shadow-[0_0_15px_rgba(16,185,129,0.1)] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-3 opacity-20">
                 <Lightbulb className="w-16 h-16 text-emerald-400" />
               </div>
               <h3 className="text-emerald-400 font-bold mb-3 flex items-center text-sm uppercase tracking-wider relative z-10">
                 <Lightbulb className="w-4 h-4 mr-2" />
                 Suggested Deal for {activeChat.display_name || ('@' + activeChat.ig_handle)}
               </h3>
               <p className="text-sm text-neutral-300 font-medium mb-3 relative z-10">Based on {(activeChat.follower_count / 1000).toFixed(0)}K followers:</p>
               <div className="space-y-1.5 relative z-10">
                 <div className="flex justify-between items-center bg-emerald-900/40 p-2.5 rounded-lg border border-emerald-500/20">
                    <span className="text-xs text-neutral-400">Suggested Base</span>
                    <span className="text-sm font-bold text-emerald-300">{suggestion.base}</span>
                 </div>
                 <div className="flex justify-between items-center bg-emerald-900/40 p-2.5 rounded-lg border border-emerald-500/20">
                    <span className="text-xs text-neutral-400">Suggested Bonus</span>
                    <span className="text-sm font-bold text-emerald-300">{suggestion.bonus} / 500 views</span>
                 </div>
               </div>
             </div>

             {/* Section 2: Sliders and Section 3: Summary (Side by side on xl) */}
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
               {/* Sliders */}
               <div className="space-y-6">
                 <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 relative z-10">
                   <div className="flex justify-between items-end mb-4">
                     <div>
                        <label className="block text-sm font-bold text-white mb-1">Base Pay <span className="text-neutral-500 font-normal">(Upfront)</span></label>
                        <p className="text-[10px] text-neutral-400">Paid before content goes live</p>
                     </div>
                     <div className="text-2xl font-display font-bold text-teal-400">₹{basePay.toLocaleString()}</div>
                   </div>
                   <input 
                     type="range" 
                     min="500" max="4000" step="100" 
                     value={basePay}
                     onChange={(e) => setBasePay(Number(e.target.value))}
                     className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-500 relative z-10"
                     style={{
                       background: `linear-gradient(to right, #14b8a6 ${(basePay - 500) / (3500) * 100}%, #262626 ${(basePay - 500) / (3500) * 100}%)`
                     }}
                   />
                   <div className="flex justify-between mt-2 text-[10px] text-neutral-500 font-medium">
                      <span>₹500</span><span>₹4,000</span>
                   </div>
                 </div>

                 <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 relative z-10">
                   <div className="flex justify-between items-end mb-4">
                     <div>
                        <label className="block text-sm font-bold text-white mb-1">View Bonus <span className="text-neutral-500 font-normal">(After 3d)</span></label>
                        <p className="text-[10px] text-neutral-400">Paid per every 500 views</p>
                     </div>
                     <div className="text-2xl font-display font-bold text-orange-400">₹{viewBonus.toLocaleString()}</div>
                   </div>
                   <input 
                     type="range" 
                     min="100" max="5000" step="100" 
                     value={viewBonus}
                     onChange={(e) => setViewBonus(Number(e.target.value))}
                     className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-orange-500 relative z-10"
                     style={{
                       background: `linear-gradient(to right, #f97316 ${(viewBonus - 100) / (4900) * 100}%, #262626 ${(viewBonus - 100) / (4900) * 100}%)`
                     }}
                   />
                   <div className="flex justify-between mt-2 text-[10px] text-neutral-500 font-medium">
                      <span>₹100</span><span>₹5,000</span>
                   </div>
                 </div>
               </div>

               {/* Summary Card */}
               <div className="bg-[#111] p-5 rounded-2xl border border-[#333] shadow-lg sticky top-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-neutral-500" />
                    Deal Summary
                  </h4>
                  <div className="space-y-3 mb-5 border-b border-[#333] pb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Base Pay:</span>
                      <span className="text-white font-bold">₹{basePay.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">View Bonus:</span>
                      <span className="text-white font-bold">₹{viewBonus.toLocaleString()} / 500v</span>
                    </div>
                    
                    <div className="bg-[#1a1a1a] p-3.5 rounded-xl border border-[#2a2a2a] mt-4">
                       <span className="block text-[10px] font-bold text-neutral-500 uppercase mb-2">Example: 10,000 Views</span>
                       <div className="flex justify-between text-sm mb-1 text-neutral-300">
                         <span>Base + Bonus(×20)</span>
                         <span>₹{basePay} + ₹{viewBonus * 20}</span>
                       </div>
                       <div className="flex justify-between text-base font-bold pt-2 border-t border-[#333] mt-2">
                         <span className="text-white">Max Possible</span>
                         <span className="text-teal-400">₹{(basePay + viewBonus * 20).toLocaleString()}</span>
                       </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button 
                      onClick={handleSendDeal}
                      disabled={isSending || dealStatus === 'offered'}
                      className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(13,148,136,0.3)] hover:shadow-[0_0_25px_rgba(13,148,136,0.5)] active:scale-[0.98] flex items-center justify-center"
                    >
                      {isSending ? 'Sending...' : (dealStatus === 'offered' ? 'Offer Sent ✓' : 'Send Deal Offer')}
                    </button>
                    {dealStatus === 'offered' && (
                      <button 
                        onClick={() => setDealStatus('pending')}
                        className="w-full bg-transparent border-2 border-[#333] text-neutral-300 hover:border-neutral-500 hover:text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] text-sm"
                      >
                        Edit / Counter Offer
                      </button>
                    )}
                  </div>
               </div>
             </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-3 sm:p-5 border-t border-neutral-800 bg-neutral-950 shrink-0 h-[80px] sm:h-[88px] flex items-center justify-center">
          <div className="max-w-3xl w-full mx-auto flex items-center bg-neutral-900 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-cyan-500/20 focus-within:border-cyan-500/30 border border-neutral-800 box-border">
            <button className="p-3 text-neutral-500 hover:text-cyan-400 transition-colors self-end">
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea 
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message..." 
              className="flex-1 bg-transparent border-none text-white focus:ring-0 resize-none max-h-32 py-3 text-sm sm:text-base outline-none custom-scrollbar"
              rows={1}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputMsg.trim()}
              className={`p-3 rounded-xl shadow-md transition-colors active:scale-95 self-end ${inputMsg.trim() ? 'bg-cyan-600 text-white hover:bg-cyan-500' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

