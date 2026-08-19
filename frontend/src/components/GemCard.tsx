"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Scale } from "lucide-react";
import { useUserStore } from "./UserStoreProvider";
import { useCompare } from "./CompareProvider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TrustEvidenceScore from "./TrustEvidenceScore";

export interface Gem {
  id: number;
  name?: string;
  description?: string;
  gemstone_type?: string;
  category?: string;
  shape?: string;
  color?: string;
  clarity?: string;
  intensity?: string;
  weight_carat?: number;
  price_usd?: number;
  origin?: string;
  cut_style?: string;
  certificate_url?: string;
  sunlight_image_url?: string;
  trust_evidence?: {
    certificate_score: number;
    provenance_score: number;
    ai_score: number;
    seller_score: number;
    total_score: number;
  };
}

interface GemCardProps {
  gem: Gem;
}

export default function GemCard({ gem }: GemCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id ? parseInt(session.user.id as string) : null;
  const { isInFavorites, refreshStore } = useUserStore();
  const { isInCompare, toggleCompare } = useCompare();

  const isFavourited = isInFavorites(gem.id);
  const isCompared = isInCompare(gem.id);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to gem details
    e.stopPropagation();
    if (!userId) {
      router.push('/login');
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, gem_id: gem.id })
      });
      if (res.ok) refreshStore();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(gem);
  };

  // Use sunlight image if available, else fallback
  const imageUrl = gem.sunlight_image_url || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600";
  
  // Generate a beautiful title if name is not fully formed
  const title = gem.name && gem.name !== "Unknown Gem" ? gem.name : `${gem.intensity || ""} ${gem.color || ""} ${gem.gemstone_type || "Gemstone"}`.trim().replace(/\s+/g, ' ');

  return (
    <Link href={`/gems/${gem.id}`} className="group block text-left">
      {/* Square Image container */}
      <div className="relative aspect-square w-full overflow-hidden bg-white shadow-sm border border-neutral-100 rounded-[12px]">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-w-600px) 100vw, 350px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Compare Button Overlay */}
        <button
          type="button"
          onClick={handleToggleCompare}
          className={`absolute top-3 left-3 px-2.5 py-1.5 rounded-full shadow-sm transition-all z-10 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
            isCompared
              ? 'bg-[#B87A5B] text-white shadow-md scale-105'
              : 'bg-white/80 text-neutral-600 hover:text-black hover:bg-white backdrop-blur-sm'
          }`}
          title={isCompared ? "Remove from comparison" : "Add to comparison"}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{isCompared ? "Compared" : "Compare"}</span>
        </button>

        {/* Wishlist Button Overlay */}
        <button 
          type="button"
          onClick={toggleFavorite}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all z-10 ${
            isFavourited 
              ? 'bg-red-50 text-red-500' 
              : 'bg-white/80 text-neutral-400 hover:text-black hover:bg-white backdrop-blur-sm'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavourited ? 'fill-current' : ''}`} />
        </button>

        {/* Trust Evidence Badge */}
        {gem.trust_evidence && (
          <div className="absolute bottom-3 left-3 z-10">
            <TrustEvidenceScore trustEvidence={gem.trust_evidence} compact />
          </div>
        )}
      </div>

      {/* Gem Info Block */}
      <div className="mt-4 flex flex-col items-start gap-1.5">
        <h3 className="text-[15px] font-bold text-black capitalize line-clamp-1">{title}</h3>
        <p className="text-[12px] text-neutral-500 font-medium">
          {(gem.weight_carat || 0).toFixed(2)} ct &nbsp;&nbsp;&nbsp; {gem.shape || "Mixed Cut"} &nbsp;&nbsp;&nbsp; {gem.clarity || "Unknown"}
        </p>
        <div className="mt-1.5 inline-block rounded-lg bg-[#F5F5F5] px-3 py-1.5 text-[12px] font-bold text-black">
          ${(gem.price_usd || 0).toLocaleString()}
        </div>
      </div>
    </Link>
  );
}
