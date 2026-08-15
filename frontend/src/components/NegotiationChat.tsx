"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { TrashIcon } from '@heroicons/react/24/outline';

interface Message {
  id: number;
  content: string;
  sender_id: number;
  created_at: string;
}

interface PurchaseRequest {
  id: number;
  status: string;
  buyer_id: number;
  seller_id: number;
}

interface NegotiationChatProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseRequest: PurchaseRequest | null;
  onStatusChange?: (newStatus: string) => void;
}

export default function NegotiationChat({ isOpen, onClose, purchaseRequest, onStatusChange }: NegotiationChatProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id ? parseInt(session.user.id as string) : null;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && purchaseRequest && userId) {
      fetchMessages();
      // Optional: Set up polling here for real-time updates
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, purchaseRequest, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    if (!purchaseRequest || !userId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/messages/request/${purchaseRequest.id}?user_id=${userId}`);
      const result = await res.json();
      if (result.success) {
        setMessages(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !purchaseRequest || !userId) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/messages?sender_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchase_request_id: purchaseRequest.id,
          content: newMessage
        })
      });
      const result = await res.json();
      if (result.success) {
        setMessages(prev => [...prev, result.data]);
        setNewMessage('');
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setIsLoading(false);
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

  if (!isOpen || !purchaseRequest) return null;

  const isSeller = userId === purchaseRequest.seller_id;
  const isCompleted = purchaseRequest.status === 'COMPLETED';
  const isRejected = purchaseRequest.status.includes('REJECTED');
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white z-50 shadow-2xl flex flex-col transform transition-transform border-l border-neutral-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-[#F9F8F6]">
          <div>
            <h3 className="text-xl font-extrabold tracking-tight text-black">Negotiation</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-1">
              {isSeller ? 'Chatting with Buyer' : 'Chatting with Seller'} • {purchaseRequest.status}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded transition-colors text-black"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <p className="text-[11px] text-neutral-500 uppercase tracking-widest font-bold">No messages yet.<br/>Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.sender_id === userId;
              return (
                <div key={msg.id || idx} className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 max-w-[85%]">
                    {isMe && (
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition-all flex-shrink-0"
                        title="Delete message"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                    <div 
                      className={`rounded p-4 text-[13px] leading-relaxed w-full ${
                        isMe 
                          ? 'bg-black text-white' 
                          : 'bg-[#F9F8F6] text-black border border-neutral-200'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-1.5 px-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer / Input Area */}
        <div className="p-6 border-t border-neutral-200 bg-white">
          {isCompleted ? (
            <div className="text-center p-4 bg-[#00A859]/10 rounded border border-[#00A859]/20">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#00A859]">Transaction Completed</p>
              <button className="mt-3 text-[11px] font-bold text-black border-b border-black pb-0.5 hover:text-neutral-500 transition-colors">
                Leave a Review
              </button>
            </div>
          ) : isRejected ? (
            <div className="text-center p-4 bg-red-50 rounded border border-red-100">
              <p className="text-[11px] font-bold uppercase tracking-widest text-red-600">Transaction Ended</p>
            </div>
          ) : (
            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded border border-neutral-200 px-4 py-3 text-[12px] focus:outline-none focus:border-black transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !newMessage.trim()}
                className="bg-black text-white px-5 py-3 rounded disabled:opacity-50 hover:bg-neutral-800 transition-colors flex items-center justify-center"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
