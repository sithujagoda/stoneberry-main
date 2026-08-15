"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2 } from 'lucide-react';

interface Gem {
  id: number;
  name: string;
  price_usd: number;
  sunlight_image_url: string;
  category: string;
  is_available: boolean;
  created_at: string;
}

export default function ListingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [gems, setGems] = useState<Gem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchGems(session.user.id as string);
    }
  }, [status, session]);

  const fetchGems = async (userId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/gems/seller/${userId}`);
      const result = await res.json();
      if (result.success) {
        setGems(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (gemId: number) => {
    if (!session?.user?.id) return;
    if (window.confirm("Are you sure you want to completely delete this gem listing? This action cannot be undone.")) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/gems/${gemId}?seller_id=${session.user.id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          alert('Listing deleted successfully.');
          setGems(prev => prev.filter(g => g.id !== gemId));
        } else {
          alert('Failed to delete listing.');
        }
      } catch (err) {
        console.error(err);
        alert('An error occurred.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8 border-b border-neutral-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold tracking-tight text-black">My Listings</h3>
          <p className="text-[11px] text-neutral-500 mt-2">Manage all the gemstones you have posted for sale on the marketplace.</p>
        </div>
        <Link 
          href="/sell" 
          className="shrink-0 inline-block rounded bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors text-center"
        >
          Sell a Gem
        </Link>
      </div>

      {gems.length === 0 ? (
        <div className="rounded border border-dashed border-neutral-300 p-12 text-center">
          <p className="text-[12px] text-neutral-500 uppercase tracking-widest font-bold mb-4">You haven't listed any gems yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {gems.map((gem) => (
            <div 
              key={gem.id} 
              className="rounded border border-neutral-200 bg-white p-5 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Gem Image */}
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-[#F9F8F6]">
                <Image 
                  src={gem.sunlight_image_url || '/placeholder.jpg'} 
                  alt={gem.name} 
                  fill 
                  className="object-cover" 
                  unoptimized
                />
              </div>

              {/* Details */}
              <div className="flex-1 w-full">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                  <h4 className="text-[14px] font-extrabold tracking-tight text-black">
                    <Link href={`/gems/${gem.id}`} className="hover:underline">
                      {gem.name}
                    </Link>
                  </h4>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest ${
                    gem.is_available 
                      ? 'bg-[#00A859]/10 text-[#00A859]' 
                      : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {gem.is_available ? 'Available' : 'Unavailable / Sold'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-8 mt-3">
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400">Price</span>
                    <span className="text-[13px] font-bold text-black">${gem.price_usd.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400">Category</span>
                    <span className="text-[13px] text-black">{gem.category}</span>
                  </div>
                  <div className="hidden md:block">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400">Listed On</span>
                    <span className="text-[12px] text-neutral-600">{new Date(gem.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                <button 
                  onClick={() => router.push(`/sell/${gem.id}/edit`)}
                  className="flex items-center justify-center p-2.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                  aria-label="Edit Listing"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(gem.id)}
                  className="flex items-center justify-center p-2.5 rounded bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                  aria-label="Delete Listing"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
