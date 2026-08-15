"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useUserStore } from '@/components/UserStoreProvider';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';

interface PurchaseRequest {
  id: number;
  gem_id: number;
  status: string;
  buyer_id: number;
  seller_id: number;
  created_at: string;
  updated_at: string;
  buyer_has_unread_updates: boolean;
  seller_has_unread_updates: boolean;
  gem: {
    id: number;
    name: string;
    price_usd: number;
    sunlight_image_url: string;
    category: string;
  };
  seller: {
    firstname: string;
    lastname: string;
    business_name?: string;
    profile_image_url: string;
  };
  buyer: {
    firstname: string;
    lastname: string;
    business_name?: string;
    profile_image_url: string;
  };
}

interface Message {
  id: number;
  content: string;
  sender_id: number;
  created_at: string;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id ? parseInt(session.user.id as string) : null;
  const { refreshStore } = useUserStore();
  
  const [threads, setThreads] = useState<PurchaseRequest[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'authenticated' && userId) {
      fetchThreads(userId);
    }
  }, [status, userId]);

  useEffect(() => {
    if (activeThreadId && userId) {
      fetchMessages(activeThreadId);
      const interval = setInterval(() => {
        fetchMessages(activeThreadId, true);
        fetchThreads(userId, true);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeThreadId, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const fetchThreads = async (uid: number, isPolling: boolean = false) => {
    try {
      const [buyingRes, sellingRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/purchases/buying/${uid}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/purchases/selling/${uid}`)
      ]);
      
      const buyingResult = await buyingRes.json();
      const sellingResult = await sellingRes.json();
      
      let rawThreads: PurchaseRequest[] = [];
      if (buyingResult.success) rawThreads = [...rawThreads, ...buyingResult.data];
      if (sellingResult.success) rawThreads = [...rawThreads, ...sellingResult.data];
      
      const uniqueMap = new Map<number, PurchaseRequest>();
      rawThreads.forEach(t => uniqueMap.set(t.id, t));
      const allThreads = Array.from(uniqueMap.values());
      
      allThreads.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      
      setThreads(allThreads);
    } catch (err) {
      console.error(err);
    } finally {
      if (!isPolling) setIsLoading(false);
    }
  };

  const fetchMessages = async (threadId: number, isPolling: boolean = false) => {
    if (!userId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/messages/request/${threadId}?user_id=${userId}`);
      const result = await res.json();
      if (result.success) {
        setMessages(prev => {
          if (prev.length !== result.data.length) {
            refreshStore();
            return result.data;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeThreadId || !userId) return;

    setIsSending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/messages?sender_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchase_request_id: activeThreadId,
          content: newMessage
        })
      });
      const result = await res.json();
      if (result.success) {
        setMessages(prev => [...prev, result.data]);
        setNewMessage('');
        fetchThreads(userId, true);
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setIsSending(false);
    }
  };

  const deleteMessage = async (messageId: number) => {
    if (!userId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/messages/${messageId}?user_id=${userId}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (result.success) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      }
    } catch (err) {
      console.error("Failed to delete message", err);
    }
  };

  const deleteThread = async (e: React.MouseEvent, threadId: number) => {
    e.stopPropagation();
    if (!userId) return;
    if (!confirm("Are you sure you want to delete this entire conversation?")) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/messages/thread/${threadId}?user_id=${userId}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (result.success) {
        setThreads(prev => prev.filter(t => t.id !== threadId));
        if (activeThreadId === threadId) {
          setActiveThreadId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Failed to delete thread", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />
      </div>
    );
  }

  const activeThread = threads.find(t => t.id === activeThreadId);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-80px)] flex flex-col">
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-black">Messages</h1>
        <p className="text-[12px] font-medium text-neutral-500">Inbox & Negotiations</p>
      </div>

      <div className="flex-1 bg-white border border-neutral-200 rounded-[16px] overflow-hidden flex flex-col md:flex-row shadow-sm min-h-0">
        
        {/* Left Column: Inbox List */}
        <div className={`w-full md:w-[350px] border-r border-neutral-100 flex flex-col ${activeThreadId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-neutral-100 bg-white">
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-[#F5F5F5] border-none px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-neutral-300 transition-colors rounded-[8px] placeholder-neutral-400 font-medium"
            />
          </div>
          <div className="flex-1 overflow-y-auto bg-white">
            {threads.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-neutral-400 font-medium">
                No conversations yet.
              </div>
            ) : (
              threads.map(thread => {
                const isSeller = thread.seller_id === userId;
                const otherParty = isSeller ? thread.buyer : thread.seller;
                const otherName = otherParty?.business_name || `${otherParty?.firstname || ''} ${otherParty?.lastname || ''}`.trim() || 'User';
                const hasUnread = isSeller ? thread.seller_has_unread_updates : thread.buyer_has_unread_updates;
                const isActive = activeThreadId === thread.id;
                
                return (
                  <div 
                    key={thread.id}
                    onClick={() => setActiveThreadId(thread.id)}
                    className={`p-4 border-b border-neutral-50 cursor-pointer transition-all flex items-center gap-3 relative ${isActive ? 'bg-[#F9F8F6]' : 'hover:bg-[#F9F8F6]/50 bg-white'}`}
                  >
                    <div className="h-12 w-12 shrink-0 bg-neutral-100 rounded-full relative overflow-hidden">
                      <Image 
                        src={otherParty?.profile_image_url || '/placeholder.jpg'} 
                        alt={otherName}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-[14px] font-bold truncate text-black">{otherName}</h4>
                        <span className={`text-[11px] shrink-0 ml-2 ${hasUnread ? 'font-bold text-black' : 'text-neutral-400 font-medium'}`}>
                          {new Date(thread.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className={`text-[13px] truncate ${hasUnread ? 'text-black font-semibold' : 'text-neutral-500'}`}>
                        {thread.gem.name}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deleteThread(e, thread.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors shrink-0 ml-1"
                      title="Delete entire conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {hasUnread && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat View */}
        <div className={`flex-1 flex flex-col min-w-0 bg-[#F9F8F6] ${!activeThreadId ? 'hidden md:flex' : 'flex'}`}>
          {!activeThread ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <PaperAirplaneIcon className="h-6 w-6 text-neutral-300" />
              </div>
              <h3 className="text-lg font-bold text-black mb-1">Your Messages</h3>
              <p className="text-[13px] text-neutral-500 font-medium">Select a conversation from the left to start messaging</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-neutral-200 bg-white flex items-center justify-between shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setActiveThreadId(null)}
                    className="md:hidden p-2 -ml-2 text-neutral-500 hover:text-black transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 bg-neutral-100 rounded-[8px] overflow-hidden">
                      <Image 
                        src={activeThread.gem.sunlight_image_url || '/placeholder.jpg'} 
                        alt={activeThread.gem.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <Link href={`/gems/${activeThread.gem_id}`} className="text-[15px] font-bold text-black hover:underline">
                        {activeThread.gem.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[12px] font-medium text-neutral-500">
                          ${activeThread.gem.price_usd.toLocaleString()}
                        </span>
                        <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                          {activeThread.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Link
                    href={`/user/${activeThread.seller_id === userId ? activeThread.buyer_id : activeThread.seller_id}`}
                    className="flex items-center gap-1 text-[12px] font-bold text-[#B87A5B] hover:underline transition-colors bg-amber-50/60 px-3 py-1.5 rounded-[8px]"
                  >
                    View Partner Profile
                  </Link>
                  <button
                    onClick={(e) => deleteThread(e, activeThread.id)}
                    className="flex items-center gap-1.5 text-[12px] font-bold text-red-600 hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-[8px]"
                    title="Delete entire conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Conversation</span>
                  </button>
                  <Link 
                    href={activeThread.seller_id === userId ? '/profile/selling' : '/profile/orders'} 
                    className="hidden sm:flex items-center gap-1 text-[12px] font-bold text-black hover:text-neutral-600 transition-colors"
                  >
                    View Order
                  </Link>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-center">
                    <p className="text-[13px] text-neutral-400 font-medium">Say hello!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = Number(msg.sender_id) === Number(userId);
                    const showTime = index === 0 || new Date(msg.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 10 * 60 * 1000;
                    
                    return (
                      <div key={msg.id} className="flex flex-col">
                        {showTime && (
                          <div className="flex justify-center mb-4">
                            <span className="text-[11px] font-medium text-neutral-400">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2 max-w-[85%] md:max-w-[65%]">
                            {isMe && (
                              <button
                                onClick={() => deleteMessage(msg.id)}
                                className="p-1.5 text-neutral-400 hover:text-red-500 transition-all shrink-0 cursor-pointer"
                                title="Delete message"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            <div 
                              className={`px-5 py-3 text-[14px] leading-relaxed shadow-sm w-full ${
                                isMe 
                                  ? 'bg-black text-white rounded-[20px] rounded-br-[4px]' 
                                  : 'bg-white text-black border border-neutral-100 rounded-[20px] rounded-bl-[4px]'
                              }`}
                            >
                              {msg.content}
                            </div>
                            {!isMe && (
                              <button
                                onClick={() => deleteMessage(msg.id)}
                                className="p-1.5 text-neutral-400 hover:text-red-500 transition-all shrink-0 cursor-pointer"
                                title="Delete message"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-neutral-200 shrink-0">
                {(activeThread.status === 'COMPLETED' || activeThread.status.includes('REJECTED')) ? (
                  <div className="text-center py-3 bg-[#F9F8F6] rounded-[12px]">
                    <p className="text-[12px] font-medium text-neutral-500">
                      This thread is closed for new messages.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={sendMessage} className="flex items-end gap-2 bg-[#F5F5F5] rounded-[24px] p-2 focus-within:ring-1 focus-within:ring-neutral-300 transition-all">
                    <textarea
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(e);
                        }
                      }}
                      placeholder="Message..."
                      className="flex-1 bg-transparent border-none px-4 py-2 text-[14px] focus:outline-none resize-none max-h-[120px] min-h-[40px]"
                      rows={1}
                      disabled={isSending}
                    />
                    <button
                      type="submit"
                      disabled={isSending || !newMessage.trim()}
                      className="bg-black text-white h-10 w-10 rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 disabled:bg-neutral-300 hover:bg-neutral-800 transition-colors shadow-sm"
                    >
                      <PaperAirplaneIcon className="w-5 h-5 pr-0.5" />
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
