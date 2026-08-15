"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ArrowRight } from "lucide-react";
import { useUserStore } from "@/components/UserStoreProvider";

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { refreshStore } = useUserStore();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.id) {
      fetchCart();
    }
  }, [status, session]);

  const fetchCart = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/cart/user/${session?.user?.id}`);
      const data = await res.json();
      if (data.success) {
        setCartItems(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (gemId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/cart/${session?.user?.id}/${gemId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setCartItems(prev => prev.filter(item => item.id !== gemId));
        refreshStore();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const checkout = async () => {
    if (!session?.user?.id) return;
    setIsCheckingOut(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/cart/checkout/${session.user.id}`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        refreshStore();
        router.push("/profile/orders");
      } else {
        alert(data.error || "Failed to checkout");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-sans text-xs uppercase tracking-widest text-neutral-500">Loading Cart...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 font-sans">
      <h1 className="text-2xl font-bold uppercase tracking-widest text-black mb-8 border-b border-black/10 pb-4">Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white border border-neutral-200 rounded-lg">
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-6">Your cart is empty.</p>
          <Link href="/gems" className="inline-block px-8 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors">
            Browse Gems
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="divide-y divide-neutral-100">
            {cartItems.map(gem => (
              <div key={gem.id} className="p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-24 h-24 rounded bg-neutral-100 overflow-hidden flex-shrink-0">
                  <Image src={gem.sunlight_image_url || "https://images.unsplash.com/photo-1599643478524-fb66f7eee59d?q=80&w=200"} alt={gem.name || "Gemstone"} fill className="object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col items-start w-full">
                  <div className="flex justify-between w-full mb-1">
                    <Link href={`/gems/${gem.id}`} className="text-sm font-bold text-black hover:underline">{gem.name || `${gem.color || ""} ${gem.gemstone_type || "Gemstone"}`}</Link>
                    <span className="text-sm font-bold text-black">${(gem.price_usd || 0).toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-4">
                    Seller: {gem.seller ? `${gem.seller.firstname || ''} ${gem.seller.lastname || ''}`.trim() || 'Verified Seller' : 'Unknown'}
                  </p>
                  
                  <div className="flex gap-2 text-[10px] font-bold text-neutral-400">
                    <span className="bg-neutral-100 px-2 py-1 rounded">{gem.gemstone_type || "Gem"}</span>
                    <span className="bg-neutral-100 px-2 py-1 rounded">{gem.color || "Colorless"}</span>
                    <span className="bg-neutral-100 px-2 py-1 rounded">{(gem.weight_carat || 0).toFixed(2)} ct</span>
                  </div>
                </div>

                <button 
                  onClick={() => removeItem(gem.id)}
                  className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="bg-neutral-50 p-6 flex flex-col sm:flex-row items-center justify-between border-t border-neutral-200 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Total Value</p>
              <p className="text-xl font-bold text-black">${cartItems.reduce((acc, g) => acc + (g.price_usd || 0), 0).toLocaleString()}</p>
            </div>
            
            <button 
              onClick={checkout}
              disabled={isCheckingOut}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-8 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors rounded disabled:opacity-50"
            >
              Make Requests for All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
