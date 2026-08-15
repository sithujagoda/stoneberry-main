"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GemCard, { Gem as GemCardType } from "@/components/GemCard";

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<GemCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.id) {
      fetchFavorites();
    }
  }, [status, session]);

  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/favorites/user/${session?.user?.id}`);
      const data = await res.json();
      if (data.success) {
        setFavorites(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-sans text-xs uppercase tracking-widest text-neutral-500">Loading Favourites...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 font-sans">
      <h1 className="text-2xl font-bold uppercase tracking-widest text-black mb-8 border-b border-black/10 pb-4">Your Favourites</h1>

      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-white border border-neutral-200 rounded-lg max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-6">You haven't saved any gems yet.</p>
          <Link href="/gems" className="inline-block px-8 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors">
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {favorites.map(gem => (
            <GemCard key={gem.id} gem={gem} />
          ))}
        </div>
      )}
    </div>
  );
}
