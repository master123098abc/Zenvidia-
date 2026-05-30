import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Send, ArrowLeft, MessageSquare, Briefcase, CheckCircle, XCircle, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CreatorInboxProps {
  currentCreatorId?: string; // the Auth user's ID
  onChatOpen?: (isOpen: boolean) => void;
}

// Assumed DB Schema:
// 1. "deals" table:
//    - id (uuid)
//    - brand_id (uuid)
//    - creator_id (uuid)
//    - status (text): 'pending', 'negotiating', 'accepted', 'declined'
//    - last_message (text): We stringify an array of message objects here to act as history

export default function CreatorInbox({ currentCreatorId, onChatOpen }: CreatorInboxProps) {
  const [chats, setChats] = useState<any[]>([]); // deals mapped to chats
  const [messages, setMessages] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  
  const [activeTab, setActiveTab] = useState<'MESSAGES' | 'REQUESTS'>('MESSAGES');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  const [mobileView, setMobileView] = useState<'LIST' | 'CHAT'>('LIST');
  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [myLocalId, setMyLocalId] = useState<string | null>(currentCreatorId || null);
  
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterText, setCounterText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const realtimeChannel = useRef<any>(null);

  useEffect(() => {
    fetchInbox();
  }, [currentCreatorId]);

  useEffect(() => {
    // Only subscribe to real-time for ACCEPTED chats/deals
    const acceptedChatIds = chats.filter((c: any) => c.status === 'accepted').map((c: any) => c.id);
    
    if (acceptedChatIds.length > 0) {
      if (realtimeChannel.current) {
        supabase.removeChannel(realtimeChannel.current);
      }
      
      realtimeChannel.current = supabase
        .channel('accepted_messages')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'deals',
            filter: `status=eq.accepted`
          },
          (payload) => {
            const updatedDeal = payload.new;
            if (acceptedChatIds.includes(updatedDeal.id)) {
              if (updatedDeal.last_message) {
                try {
                   const msgs = JSON.parse(updatedDeal.last_message);
                   if (Array.isArray(msgs)) {
                     setMessages(prev => {
                       const withoutCurrent = prev.filter(m => m.chat_id !== updatedDeal.id);
                       // We add chat_id to the parsed messages
                       const mapped = msgs.map((m: any) => ({ ...m, chat_id: updatedDeal.id }));
                       return [...withoutCurrent, ...mapped];
                     });
                   }
                } catch(e) {}
              }
            }
          }
        )
        .subscribe();
    }

    return () => {
      if (realtimeChannel.current) {
        supabase.removeChannel(realtimeChannel.current);
      }
    };
  }, [chats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChatId]);

  useEffect(() => {
    if (onChatOpen) {
      onChatOpen(!!activeChatId);
    }
  }, [activeChatId, onChatOpen]);

  const fetchInbox = async () => {
    setIsLoading(true);
    const timeoutId = setTimeout(() => setIsLoading(false), 5000);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = currentCreatorId || userData?.user?.id;
      if (!uid) return;
      setMyLocalId(uid);

      // Fetch deals where user is involved and not declined
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .or(`brand_id.eq.${uid},creator_id.eq.${uid}`)
        .neq('status', 'declined');

      if (dealsError) {
        console.error("Error fetching deals:", dealsError);
        return;
      }

      if (dealsData && dealsData.length > 0) {
        const mappedChats = dealsData.map(d => ({
          id: d.id,
          initiator_id: d.brand_id,
          recipient_id: d.creator_id,
          status: (d.status || '').trim() || 'pending',
          brand_name: d.brand_name,
          creator_handle: d.creator_handle,
          base_pay: d.base_pay || 0,
          view_bonus_per_500: d.view_bonus_per_500 || 0
        }));
        
        setChats(mappedChats);
        
        let allMessages: any[] = [];
        dealsData.forEach(d => {
          if (d.last_message) {
            try {
              const parsed = JSON.parse(d.last_message);
              if (Array.isArray(parsed)) {
                allMessages = [...allMessages, ...parsed.map(m => ({...m, chat_id: d.id}))];
              } else if (typeof parsed === 'object') {
                allMessages.push({...parsed, chat_id: d.id});
              }
            } catch (e) {
              allMessages.push({
                id: Date.now() + Math.random(),
                chat_id: d.id,
                sender_id: d.brand_id,
                text: d.last_message,
                created_at: d.created_at || new Date().toISOString()
              });
            }
          }
        });
        
        setMessages(allMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
        
        const otherUserIds = mappedChats.map(c => c.initiator_id === uid ? c.recipient_id : c.initiator_id);

        const { data: brandProfiles } = await supabase
          .from('brands')
          .select('user_id, business_name, profile_url')
          .in('user_id', otherUserIds);

        const { data: creatorProfiles } = await supabase
          .from('creators')
          .select('user_id, ig_handle, profile_url')
          .in('user_id', otherUserIds);

        const mergedProfiles: Record<string, any> = {};
        brandProfiles?.forEach(b => mergedProfiles[b.user_id] = { name: b.business_name, url: b.profile_url });
        creatorProfiles?.forEach(c => mergedProfiles[c.user_id] = { name: `@${c.ig_handle}`, url: c.profile_url });
        
        setProfiles(mergedProfiles);
      }
    } catch (err) {
      console.error(err);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (chatId: string, newStatus: string) => {
    try {
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, status: newStatus } : c));
      
      if (newStatus === 'declined') {
        if (activeChatId === chatId) {
          setActiveChatId(null);
          setMobileView('LIST');
        }
      } else if (newStatus === 'accepted') {
        setActiveTab('MESSAGES');
      }

      await supabase.from('deals').update({ status: newStatus }).eq('id', chatId);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to persist messages array to deals table
  const persistMessage = async (msgObj: any, cId: string) => {
     try {
       // get current messages for this chat
       const existingMsgs = messages.filter(m => m.chat_id === cId);
       const updatedList = [...existingMsgs, msgObj].map(m => ({ sender_id: m.sender_id, text: m.text, created_at: m.created_at }));
       await supabase.from('deals').update({ last_message: JSON.stringify(updatedList) }).eq('id', cId);
     } catch(e) {}
  };

  const handleSend = async () => {
    if (!inputMsg.trim() || !activeChatId) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = currentCreatorId || userData?.user?.id;
      if (!uid) return;

      const newMsg = {
        chat_id: activeChatId,
        sender_id: uid,
        text: inputMsg.trim(),
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, newMsg]);
      setInputMsg('');
      
      await persistMessage(newMsg, activeChatId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendCounter = async () => {
    if (!counterText.trim() || !activeChatId) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = currentCreatorId || userData?.user?.id;
      if (!uid) return;

      const counterMsgText = `[COUNTER OFFER] ${counterText.trim()}`;
      
      const newMsg = {
        chat_id: activeChatId,
        sender_id: uid,
        text: counterMsgText,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, newMsg]);
      setCounterText('');
      setShowCounterModal(false);

      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, status: 'negotiating' } : c));
      
      // get current messages for this chat
      const existingMsgs = messages.filter(m => m.chat_id === activeChatId);
      const updatedList = [...existingMsgs, newMsg].map(m => ({ sender_id: m.sender_id, text: m.text, created_at: m.created_at }));
       
      await supabase.from('deals').update({ status: 'negotiating', last_message: JSON.stringify(updatedList) }).eq('id', activeChatId);
    } catch (err) {
      console.error(err);
    }
  };

  const myId = myLocalId; // Simplification

  const visibleChats = chats.filter(c => 
    activeTab === 'MESSAGES' ? c.status === 'accepted' : (c.status === 'pending' || c.status === 'negotiating' || c.status === 'offered')
  );

  const activeChat = chats.find(c => c.id === activeChatId);
  const activeChatProfile = activeChat ? profiles[activeChat.initiator_id === myId ? activeChat.recipient_id : activeChat.initiator_id] : null;
  const activeMessages = messages.filter(m => m.chat_id === activeChatId);
  const isRequestMode = activeChat && (activeChat.status === 'pending' || activeChat.status === 'negotiating' || activeChat.status === 'offered');

  return (
    <div className="flex h-[700px] w-full bg-white rounded-b-[2.5rem] overflow-hidden shadow-sm">
      {/* Left Sidebar */}
      <div className={`w-full md:w-80 border-r border-neutral-100 flex flex-col bg-neutral-50/50 ${mobileView !== 'LIST' ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 sm:p-5 border-b border-neutral-100 bg-white">
          <div className="flex bg-neutral-100/80 p-1 rounded-xl mb-2">
            <button 
              onClick={() => { setActiveTab('MESSAGES'); setActiveChatId(null); }}
              className={`flex-1 text-sm font-bold py-2 rounded-lg transition-all ${activeTab === 'MESSAGES' ? 'bg-white shadow-sm text-neutral-900 border border-neutral-200/50' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              Messages
            </button>
            <button 
              onClick={() => { setActiveTab('REQUESTS'); setActiveChatId(null); }}
              className={`flex-1 text-sm font-bold py-2 rounded-lg transition-all relative ${activeTab === 'REQUESTS' ? 'bg-white shadow-sm text-neutral-900 border border-neutral-200/50' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              Requests
              {chats.some(c => c.status === 'pending' || c.status === 'offered' || c.status === 'negotiating') && (
                <span className="absolute top-2 right-4 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center p-8">
               <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : visibleChats.length > 0 ? (
            visibleChats.map((chat) => {
              const otherId = chat.initiator_id === myId ? chat.recipient_id : chat.initiator_id;
              const profile = profiles[otherId] || { name: 'Unknown' };
              const chatMsgs = messages.filter(m => m.chat_id === chat.id);
              const lastMsg = chatMsgs[chatMsgs.length - 1];
              
              return (
                <button 
                  key={chat.id}
                  onClick={() => { 
                    setActiveChatId(chat.id); 
                    setMobileView('CHAT'); 
                  }}
                  className={`w-full flex items-center p-3 rounded-2xl transition-colors ${activeChatId === chat.id ? 'bg-cyan-50 shadow-sm border border-cyan-100' : 'hover:bg-neutral-100 border border-transparent'}`}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 shadow-sm bg-neutral-100 flex items-center justify-center border border-neutral-200">
                    {profile.url ? (
                      <img src={profile.url} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <Briefcase className="w-5 h-5 text-neutral-400" />
                    )}
                  </div>
                  <div className="ml-4 flex-1 text-left overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-sm text-neutral-900 truncate">{profile.name}</h4>
                      {(chat.status === 'pending' || chat.status === 'offered') && <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">NEW</span>}
                    </div>
                    {lastMsg && (
                      <p className={`text-xs truncate ${lastMsg.sender_id === myId ? 'text-neutral-500' : 'text-neutral-900 font-medium'}`}>
                        {lastMsg.sender_id === myId ? 'You: ' : ''}{lastMsg.text}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center p-6 mt-10">
               <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                 <MessageSquare className="w-6 h-6 text-neutral-300" />
               </div>
               <p className="text-sm font-bold text-neutral-900 mb-1">No active {activeTab === 'MESSAGES' ? 'messages' : 'requests'}</p>
               <p className="text-xs text-neutral-500">Your {activeTab.toLowerCase()} will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Chat Panel */}
      <div className={`flex-1 flex flex-col bg-white h-full relative ${mobileView === 'LIST' ? 'hidden md:flex' : 'flex'}`}>
        {!activeChat ? (
           <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-neutral-50/30">
             <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-neutral-100">
               <MessageSquare className="w-10 h-10 text-cyan-500" />
             </div>
             <h3 className="text-xl font-bold text-neutral-900 mb-2">Select a conversation</h3>
             <p className="text-neutral-500 text-sm max-w-sm">Choose a chat from the sidebar to view messages.</p>
           </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-white z-10 w-full shrink-0">
              <div className="flex items-center">
                <button onClick={() => setMobileView('LIST')} className="md:hidden mr-3 p-2 -ml-2 rounded-full hover:bg-neutral-100 text-neutral-600">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-neutral-50 border border-neutral-200">
                  {activeChatProfile?.url ? (
                    <img src={activeChatProfile.url} alt={activeChatProfile.name} className="w-full h-full object-cover" />
                  ) : (
                    <Briefcase className="w-5 h-5 text-neutral-400" />
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="font-bold text-neutral-900">{activeChatProfile?.name || 'User'}</h3>
                  <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest">{activeChat.status}</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#FAFAFA] flex flex-col">
               <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col space-y-4 pt-4">
                 {activeMessages.map((msg, i) => {
                   const isMe = msg.sender_id === myId;
                   const isCounter = msg.text.startsWith('[COUNTER OFFER]');
                   const displayText = isCounter ? msg.text.replace('[COUNTER OFFER]', '').trim() : msg.text;

                   return (
                     <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}>
                       <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-[15px] sm:text-base border shadow-sm ${isMe ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-white text-neutral-800 border-neutral-200'} ${isCounter ? (isMe ? 'ring-2 ring-orange-400' : 'ring-2 ring-orange-200') : ''}`}>
                         {isCounter && <div className={`text-[10px] uppercase font-bold mb-1 ${isMe ? 'text-orange-200' : 'text-orange-500'}`}>Counter Offer</div>}
                         <p className="leading-relaxed">{displayText}</p>
                         <span className={`block text-[10px] mt-1.5 opacity-60 ${isMe ? 'text-right text-cyan-100' : 'text-left text-neutral-500'}`}>
                           {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                       </div>
                     </motion.div>
                   );
                 })}
                 <div ref={messagesEndRef} />
               </div>
            </div>

            {/* Request Action Bar OR Chat Input */}
            {isRequestMode ? (
              <div className="p-4 border-t border-neutral-200 bg-white shrink-0 flex flex-col items-center">
                <div className="w-full max-w-md bg-cyan-50/50 border border-cyan-100 rounded-2xl p-4 mb-4 text-center">
                   <h4 className="font-bold text-cyan-900 mb-2">Deal Proposal</h4>
                   <div className="flex justify-center items-center space-x-6 text-sm">
                     <div>
                       <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-wide mb-0.5">Base Pay</p>
                       <p className="font-bold text-lg text-neutral-900">₹{activeChat.base_pay?.toLocaleString() || 0}</p>
                     </div>
                     <div className="w-px h-8 bg-cyan-200"></div>
                     <div>
                       <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-wide mb-0.5">Bonus / 500 Views</p>
                       <p className="font-bold text-lg text-teal-600">₹{activeChat.view_bonus_per_500?.toLocaleString() || 0}</p>
                     </div>
                   </div>
                </div>
                <p className="text-sm text-neutral-500 font-medium mb-4 text-center">Respond to business request to unlock chat</p>
                <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
                   <button onClick={() => handleUpdateStatus(activeChat.id, 'accepted')} className="flex-1 bg-neutral-900 border-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center shadow-sm">
                     <CheckCircle className="w-5 h-5 mr-2" /> Accept
                   </button>
                   <button onClick={() => setShowCounterModal(true)} className="flex-1 bg-white border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 text-neutral-700 font-bold py-3 rounded-xl transition-all flex items-center justify-center shadow-sm">
                     <Edit3 className="w-5 h-5 mr-2" /> Counter
                   </button>
                   <button onClick={() => handleUpdateStatus(activeChat.id, 'declined')} className="px-4 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 font-bold rounded-xl transition-all flex items-center justify-center shadow-sm">
                     <XCircle className="w-5 h-5" />
                   </button>
                </div>
              </div>
            ) : (
              <div className="p-3 sm:p-4 border-t border-neutral-100 bg-white shrink-0 flex items-center justify-center">
                <div className="max-w-4xl w-full mx-auto flex items-center bg-neutral-50 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-cyan-500/20 border border-neutral-200 box-border">
                  <input 
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..." 
                    className="flex-1 bg-transparent border-none text-neutral-900 placeholder-neutral-400 focus:ring-0 py-3.5 px-4 text-sm outline-none"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!inputMsg.trim()}
                    className={`p-3 rounded-xl shadow-sm transition-all active:scale-95 ${inputMsg.trim() ? 'bg-cyan-600 text-white hover:bg-cyan-500' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'}`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Counter Offer Modal */}
        <AnimatePresence>
          {showCounterModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] p-6 max-w-md w-full shadow-2xl border border-neutral-100">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-lg text-neutral-900">Send Counter Offer</h3>
                   <button onClick={() => setShowCounterModal(false)} className="text-neutral-400 hover:text-neutral-600"><XCircle className="w-5 h-5"/></button>
                 </div>
                 <p className="text-sm text-neutral-500 mb-4">Propose your rate or terms. The brand will receive your counter offer in their inbox.</p>
                 <textarea
                   value={counterText}
                   onChange={e => setCounterText(e.target.value)}
                   className="w-full h-32 bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-neutral-900 focus:ring-2 focus:ring-cyan-500 outline-none resize-none mb-4"
                   placeholder="e.g. I charge $1000 for a dedicated reel with 3 days of exclusive usage rights."
                 ></textarea>
                 <button 
                   onClick={handleSendCounter}
                   disabled={!counterText.trim()}
                   className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-neutral-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm"
                 >
                   Send Counter Offer
                 </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

