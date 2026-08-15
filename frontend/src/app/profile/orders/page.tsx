"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import NegotiationChat from '@/components/NegotiationChat';
import ReviewModal from '@/components/ReviewModal';
import { ChatBubbleLeftRightIcon, StarIcon } from '@heroicons/react/24/outline';

interface PurchaseRequest {
  id: number;
  status: string;
  buyer_id: number;
  seller_id: number;
  created_at: string;
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
    business_name: string;
  };
}

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [isProcessing, setIsProcessing] = useState(false);

  // Review state
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<PurchaseRequest | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchOrders(session.user.id as string);
    }
  }, [status, session]);

  const fetchOrders = async (userId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/purchases/buying/${userId}`);
      const result = await res.json();
      if (result.success) {
        setRequests(result.data);
        // Clear unread flags
        const unreadReqs = result.data.filter((r: PurchaseRequest) => r.buyer_has_unread_updates);
        if (unreadReqs.length > 0) {
          await Promise.all(unreadReqs.map((r: PurchaseRequest) => 
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/purchases/${r.id}/read?user_id=${userId}`, { method: 'PUT' })
          ));
          // Refresh global store to update badge
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('focus')); // Hack to trigger refresh if we had SWR, but we need to use context
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (currentStatus: string) => {
    switch (currentStatus) {
      case 'COMPLETED': return 'bg-[#00A859]/10 text-[#00A859]';
      case 'READY_FOR_BUYING': return 'bg-[#B87A5B]/10 text-[#B87A5B]';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'SELLER_REJECTED':
      case 'BUYER_REJECTED': return 'bg-red-50 text-red-600';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  const openChat = (req: PurchaseRequest) => {
    setSelectedRequest(req);
    setIsChatOpen(true);
  };

  const completePurchase = async (e: React.MouseEvent, reqId: number) => {
    e.stopPropagation();
    if (!session?.user?.id) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/purchases/${reqId}/complete?user_id=${session.user.id}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Purchase completed successfully!");
        fetchOrders(session.user.id as string);
      } else {
        alert(data.error || "Failed to complete purchase");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const submitReview = async (rating: number, comment: string) => {
    if (!session?.user?.id || !reviewTarget) return;
    
    const formData = new FormData();
    formData.append('target_user_id', reviewTarget.seller_id.toString());
    formData.append('reviewer_id', session.user.id as string);
    formData.append('purchase_request_id', reviewTarget.id.toString());
    formData.append('review_type', 'BUYER_REVIEWING_SELLER');
    formData.append('rating', rating.toString());
    if (comment) formData.append('comment', comment);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/reviews/`, {
      method: 'POST',
      body: formData
    });
    
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || data.detail || 'Failed to submit review');
    }
    
    alert('Review submitted successfully!');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  const activeOrders = requests.filter(r => ['PENDING', 'INQUIRY', 'READY_FOR_BUYING'].includes(r.status));
  const historyOrders = requests.filter(r => ['COMPLETED', 'BUYER_REJECTED', 'SELLER_REJECTED'].includes(r.status));
  
  const displayedOrders = activeTab === 'active' ? activeOrders : historyOrders;

  return (
    <div className="max-w-4xl">
      <div className="mb-8 border-b border-neutral-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold tracking-tight text-black">Buying Orders</h3>
          <p className="text-[11px] text-neutral-500 mt-2">Manage your purchases, active negotiations, and past orders.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-colors ${activeTab === 'active' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-500 hover:text-black'}`}
          >
            Active ({activeOrders.length})
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-colors ${activeTab === 'history' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-500 hover:text-black'}`}
          >
            History ({historyOrders.length})
          </button>
        </div>
      </div>

      {displayedOrders.length === 0 ? (
        <div className="rounded border border-dashed border-neutral-300 p-12 text-center">
          <p className="text-[12px] text-neutral-500 uppercase tracking-widest font-bold mb-4">No {activeTab} orders.</p>
          <a href="/gems" className="inline-block rounded bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors">
            Browse Gems
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedOrders.map((req) => (
            <div 
              key={req.id} 
              onClick={() => router.push(`/gems/${req.gem.id}`)}
              className="group cursor-pointer rounded border border-neutral-200 bg-white p-5 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:border-black transition-colors shadow-sm hover:shadow-md"
            >
              {/* Gem Image */}
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-[#F9F8F6]">
                <Image 
                  src={req.gem.sunlight_image_url || '/placeholder.jpg'} 
                  alt={req.gem.name} 
                  fill 
                  className="object-cover" 
                  unoptimized
                />
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                  <h4 className="text-[14px] font-extrabold tracking-tight text-black group-hover:underline">
                    {req.gem.name}
                  </h4>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest ${getStatusColor(req.status)}`}>
                    {req.status.replace(/_/g, ' ')}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-8">
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400">Price</span>
                    <span className="text-[13px] font-bold text-black">${req.gem.price_usd.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400">Seller</span>
                    <span className="text-[13px] text-black">{req.seller.business_name || `${req.seller.firstname} ${req.seller.lastname}`}</span>
                  </div>
                  <div className="hidden md:block">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400">Date</span>
                    <span className="text-[12px] text-neutral-600">{new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-auto mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openChat(req);
                  }}
                  className="w-full sm:w-auto bg-white border border-neutral-300 text-neutral-700 px-4 py-2.5 rounded text-[11px] font-bold uppercase tracking-widest hover:bg-neutral-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" /> Message
                </button>
                {req.status === 'READY_FOR_BUYING' && (
                  <button
                    onClick={(e) => completePurchase(e, req.id)}
                    disabled={isProcessing}
                    className="w-full sm:w-auto bg-[#00A859] text-white px-5 py-2.5 rounded text-[11px] font-bold uppercase tracking-widest hover:bg-[#00904a] transition-colors shadow-sm disabled:opacity-50"
                  >
                    Complete Purchase
                  </button>
                )}
                {req.status === 'COMPLETED' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setReviewTarget(req);
                      setIsReviewOpen(true);
                    }}
                    className="w-full sm:w-auto bg-black text-white px-5 py-2.5 rounded text-[11px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <StarIcon className="w-4 h-4" /> Leave Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Negotiation Drawer */}
      <NegotiationChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        purchaseRequest={selectedRequest}
      />

      {/* Review Modal */}
      {reviewTarget && (
        <ReviewModal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          onSubmit={submitReview}
          targetUserName={reviewTarget.seller.business_name || reviewTarget.seller.firstname || 'Seller'}
        />
      )}
    </div>
  );
}
