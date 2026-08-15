"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NegotiationChat from '@/components/NegotiationChat';
import ReviewModal from '@/components/ReviewModal';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
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
  buyer: {
    firstname: string;
    lastname: string;
  };
}

export default function SellingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // Review state
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<PurchaseRequest | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchSales(session.user.id as string);
    }
  }, [status, session]);

  const fetchSales = async (userId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/purchases/selling/${userId}`);
      const result = await res.json();
      if (result.success) {
        setRequests(result.data);
        // Clear unread flags
        const unreadReqs = result.data.filter((r: PurchaseRequest) => r.seller_has_unread_updates);
        if (unreadReqs.length > 0) {
          await Promise.all(unreadReqs.map((r: PurchaseRequest) => 
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/purchases/${r.id}/read?user_id=${userId}`, { method: 'PUT' })
          ));
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('focus')); 
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (requestId: number, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/purchases/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await res.json();
      if (result.success) {
        setRequests(prev => prev.map(req => req.id === requestId ? result.data : req));
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitReview = async (rating: number, comment: string) => {
    if (!session?.user?.id || !reviewTarget) return;
    
    const formData = new FormData();
    formData.append('target_user_id', reviewTarget.buyer_id.toString());
    formData.append('reviewer_id', session.user.id as string);
    formData.append('purchase_request_id', reviewTarget.id.toString());
    formData.append('review_type', 'SELLER_REVIEWING_BUYER');
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
          <h3 className="text-lg font-extrabold tracking-tight text-black">Selling Offers</h3>
          <p className="text-[11px] text-neutral-500 mt-2">Manage incoming offers, negotiate with buyers, and finalize sales.</p>
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
          <p className="text-[12px] text-neutral-500 uppercase tracking-widest font-bold mb-4">No {activeTab} offers.</p>
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
              <div className="flex-1 w-full">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                  <h4 className="text-[14px] font-extrabold tracking-tight text-black group-hover:underline">
                    {req.gem.name}
                  </h4>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest ${getStatusColor(req.status)}`}>
                    {req.status.replace(/_/g, ' ')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-8">
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400">Offer Price</span>
                      <span className="text-[13px] font-bold text-black">${req.gem.price_usd.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400">Potential Buyer</span>
                      <Link
                        href={`/user/${req.buyer_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[13px] font-bold text-black hover:underline block"
                      >
                        {req.buyer.firstname} {req.buyer.lastname}
                      </Link>
                    </div>
                  </div>

                  {/* Actions for Pending Requests and Messaging */}
                  <div className="flex gap-2 items-center flex-wrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openChat(req);
                      }}
                      className="flex items-center gap-1.5 bg-white border border-neutral-300 text-neutral-700 px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest hover:bg-neutral-50 transition-colors shadow-sm"
                    >
                      <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" /> Message
                    </button>
                    {req.status === 'PENDING' && (
                      <>
                        <button 
                          onClick={(e) => updateStatus(req.id, 'READY_FOR_BUYING', e)}
                          className="flex items-center gap-1.5 rounded border border-[#00A859] px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#00A859] hover:bg-[#00A859]/10 transition-colors"
                        >
                          <CheckIcon className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button 
                          onClick={(e) => updateStatus(req.id, 'SELLER_REJECTED', e)}
                          className="flex items-center gap-1.5 rounded border border-red-500 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <XMarkIcon className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}
                    {req.status === 'COMPLETED' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReviewTarget(req);
                          setIsReviewOpen(true);
                        }}
                        className="flex items-center gap-1.5 bg-black text-white px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-sm"
                      >
                        <StarIcon className="w-3.5 h-3.5" /> Leave Review
                      </button>
                    )}
                  </div>
                </div>
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
          targetUserName={reviewTarget.buyer.firstname || 'Buyer'}
        />
      )}
    </div>
  );
}
