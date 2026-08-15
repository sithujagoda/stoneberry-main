"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Star, Heart, Scale, MessageSquare, ShoppingBag,
  Check, ArrowRight, ShieldCheck, MapPin, Camera, Play, Video
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import GemCard, { Gem as GemCardType } from "@/components/GemCard";
import { useUserStore } from "@/components/UserStoreProvider";
import { useCompare } from "@/components/CompareProvider";
import GemMediaViewer from "@/components/GemMediaViewer";

export interface Seller {
  id: number;
  firstname?: string;
  lastname?: string;
  email: string;
  profile_image_url?: string;
  created_at: string;
}

export interface Reviewer {
  id: number;
  firstname?: string;
  lastname?: string;
}

export interface Review {
  id: number;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer?: Reviewer;
}

export interface Gem {
  id: number;
  name?: string;
  gemstone_type?: string;
  category?: string;
  cut_style?: string;
  treatment?: string;
  shape?: string;
  color?: string;
  clarity?: string;
  month?: string;
  origin?: string;
  intensity?: string;
  length?: number;
  width?: number;
  height?: number;
  weight_carat?: number;
  price_usd?: number;
  mined?: string;
  cut_by?: string;
  cut_location?: string;
  certified_by?: string;
  certified_location?: string;
  is_available?: boolean;
  sunlight_image_url?: string;
  studio_image_url?: string;
  extra_media_url?: string;
  certificate_url?: string;
  created_at?: string;
  seller_id?: number;
  seller?: Seller;
}

export default function GemDetails({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const gemId = parseInt(unwrappedParams.id, 10);
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id ? parseInt(session.user.id as string) : null;
  const { isInFavorites, refreshStore } = useUserStore();
  const { isInCompare, toggleCompare, recordView } = useCompare();

  const [gem, setGem] = useState<Gem | null>(null);
  const isCompared = gem ? isInCompare(gem.id) : false;
  const [similarGems, setSimilarGems] = useState<GemCardType[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Action State
  const [isProcessing, setIsProcessing] = useState(false);

  // Image Gallery State
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // Dwell Tracker Effect
  useEffect(() => {
    if (!gem) return;
    let seconds = 0;
    const interval = setInterval(() => {
      seconds += 1;
      recordView(gem, seconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [gem, recordView]);

  useEffect(() => {
    const fetchGemData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/gems/${gemId}`);
        const result = await response.json();

        if (response.ok && result.success && result.data) {
          const fetchedGem = result.data;
          setGem(fetchedGem);

          // Fetch similar gems (fallback to all gems for now since there are few in DB)
          const similarRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/gems`);
          const similarResult = await similarRes.json();
          if (similarRes.ok && similarResult.success) {
            // Filter out current gem and limit to 4
            const filtered = (similarResult.data as GemCardType[])
              .filter(g => g.id !== gemId)
              .slice(0, 4);
            setSimilarGems(filtered);
          }

          // Fetch seller reviews
          if (fetchedGem.seller?.id) {
            const reviewsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/reviews/user/${fetchedGem.seller.id}`);
            const reviewsResult = await reviewsRes.json();
            if (reviewsRes.ok && reviewsResult.success) {
              setReviews(reviewsResult.data || []);
            }
          }
        } else {
          throw new Error(result.error || "Gem not found");
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg("The requested gemstone does not exist or the server is unreachable.");
      } finally {
        setLoading(false);
      }
    };

    fetchGemData();
  }, [gemId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  if (errorMsg || !gem) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="rounded-xl border border-red-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-bold text-red-600">Error Sourcing Gem</h2>
          <p className="mt-4 text-sm text-neutral-600">{errorMsg}</p>
          <div className="mt-8">
            <Link
              href="/gems"
              className="inline-flex items-center gap-2 rounded-full bg-black text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Generate Title
  const title = gem.name && gem.name !== "Unknown Gem"
    ? gem.name
    : `${gem.intensity || ""} ${gem.color || ""} ${gem.gemstone_type || "Gemstone"}`.trim().replace(/\s+/g, ' ');

  // Build media list
  const isVideoUrl = (url?: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.endsWith(".mp4") || lower.endsWith(".mov") || lower.endsWith(".webm") || lower.includes("video");
  };

  const mediaList: { url: string; label: string; type: "image" | "video" }[] = [];
  if (gem.sunlight_image_url) {
    mediaList.push({ url: gem.sunlight_image_url, label: "Sunlight", type: isVideoUrl(gem.sunlight_image_url) ? "video" : "image" });
  }
  if (gem.studio_image_url) {
    mediaList.push({ url: gem.studio_image_url, label: "Studio", type: isVideoUrl(gem.studio_image_url) ? "video" : "image" });
  }
  if (gem.extra_media_url) {
    let extraUrls: string[] = [];
    try {
      const p = JSON.parse(gem.extra_media_url);
      extraUrls = Array.isArray(p) ? p : [gem.extra_media_url];
    } catch {
      extraUrls = [gem.extra_media_url];
    }
    extraUrls.forEach((url, i) => {
      if (url) {
        mediaList.push({
          url,
          label: isVideoUrl(url) ? `Video ${i + 1}` : `Extra ${i + 1}`,
          type: isVideoUrl(url) ? "video" : "image"
        });
      }
    });
  }

  const currentMedia = mediaList[activeMediaIndex] || mediaList[0] || {
    url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600",
    label: "Sunlight",
    type: "image" as const
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Calculate dynamic average rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";
  const numReviews = reviews.length > 0 ? reviews.length : 0;

  const sellerId = gem.seller?.id ?? gem.seller_id;
  const isSeller = Boolean(userId && sellerId && Number(userId) === Number(sellerId));
  const isFavourited = isInFavorites(gem.id);

  const toggleFavorite = async () => {
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

  const addToCart = async () => {
    if (!userId) {
      router.push('/login');
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, gem_id: gem.id })
      });
      if (res.ok) {
        refreshStore();
        alert('Added to cart!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const requestToBuy = async () => {
    if (!userId) {
      router.push('/login');
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gem_id: gem.id,
          buyer_id: userId,
          seller_id: gem.seller?.id ?? gem.seller_id
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/profile/orders');
      } else {
        alert(data.error || 'Failed to create request');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const messageSeller = async () => {
    if (!userId) {
      router.push('/login');
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gem_id: gem.id,
          buyer_id: userId,
          seller_id: gem.seller?.id ?? gem.seller_id,
          status: "INQUIRY"
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh store to update notifications if needed
        refreshStore();
        router.push('/messages');
      } else {
        alert(data.error || 'Failed to initialize chat');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 font-sans pb-24">

      {/* Top Breadcrumbs */}
      <div className="mb-8 flex items-center text-[10px] font-bold uppercase tracking-widest text-neutral-400">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/gems" className="hover:text-black transition-colors">Gemstones</Link>
        <span className="mx-2">/</span>
        <Link href="/gems" className="hover:text-black transition-colors">Browse</Link>
        <span className="mx-2">/</span>
        <Link href="/gems" className="hover:text-black transition-colors">Compare</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

        {/* Left Column: Image Gallery & Seller Info (Sticky) */}
        <div className="sticky top-24 space-y-6">

          {/* Interactive Media Viewer with Circular Loupe & Zoom */}
          <GemMediaViewer
            mediaList={mediaList}
            activeIndex={activeMediaIndex}
            onSelectIndex={setActiveMediaIndex}
            title={title}
          />

          {/* Thumbnails */}
          {mediaList.length > 1 && (
            <div className="flex flex-wrap justify-center gap-3">
              {mediaList.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveMediaIndex(idx)}
                  className={`h-20 w-20 rounded-2xl overflow-hidden relative transition-all duration-300 ${
                    activeMediaIndex === idx
                      ? 'ring-2 ring-black ring-offset-2 scale-105 shadow-md'
                      : 'border border-neutral-200 hover:border-black opacity-70 hover:opacity-100'
                  }`}
                >
                  {item.type === "video" ? (
                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center relative">
                      <video src={item.url} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/90 text-black flex items-center justify-center shadow-md">
                          <Play className="w-4 h-4 fill-black ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Image src={item.url} alt={item.label} fill className="object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Seller Card */}
          <div className="rounded-xl border border-neutral-200 bg-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              {sellerId ? (
                <Link href={`/user/${sellerId}`} className="h-10 w-10 rounded-full bg-neutral-200 overflow-hidden relative shrink-0 hover:opacity-90 transition-opacity block">
                  {gem.seller?.profile_image_url ? (
                    <Image src={gem.seller.profile_image_url} alt="Seller Avatar" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold text-[12px] text-neutral-600 uppercase bg-neutral-200">
                      {gem.seller?.firstname?.[0] || 'S'}
                    </div>
                  )}
                </Link>
              ) : (
                <div className="h-10 w-10 rounded-full bg-neutral-200 overflow-hidden relative shrink-0">
                  <div className="h-full w-full flex items-center justify-center font-bold text-[12px] text-neutral-600 uppercase bg-neutral-200">
                    {gem.seller?.firstname?.[0] || 'S'}
                  </div>
                </div>
              )}
              <div>
                {sellerId ? (
                  <Link href={`/user/${sellerId}`} className="text-[12px] font-bold text-black hover:underline block">
                    {gem.seller ? `${gem.seller.firstname || ''} ${gem.seller.lastname || ''}`.trim() || 'Verified Seller' : 'Verified Seller'}
                  </Link>
                ) : (
                  <h4 className="text-[12px] font-bold text-black">{gem.seller ? `${gem.seller.firstname || ''} ${gem.seller.lastname || ''}`.trim() || 'Verified Seller' : 'Verified Seller'}</h4>
                )}
                <p className="text-[10px] text-neutral-500 mt-0.5">Member since {gem.seller ? formatDate(gem.seller.created_at) : 'Recently'}</p>
                {!isSeller && (
                  <button onClick={messageSeller} disabled={isProcessing} className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-[#B87A5B] disabled:opacity-50">
                    <MessageSquare className="w-3 h-3" /> Chat With {gem.seller?.firstname || 'Seller'}
                  </button>
                )}
              </div>
            </div>
            <div>
              {sellerId && (
                <Link href={`/user/${sellerId}`} className="text-[10px] font-semibold text-[#B87A5B] hover:underline px-2.5 py-1 rounded-md hover:bg-amber-50/50 transition-colors">
                  Visit Profile
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Specifications & Checkout */}
        <div className="pt-2">
          {/* Pill */}
          <div className="inline-block rounded bg-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white mb-4">
            Certified Natural
          </div>

          {/* Title & Rating */}
          <h1 className="text-3xl font-extrabold tracking-tight text-black mb-3">{title}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-[#F5C518]">
              {[...Array(Math.round(parseFloat(avgRating)))].map((_, i) => <Star key={`fill-${i}`} className="w-3 h-3 fill-current" />)}
              {[...Array(5 - Math.round(parseFloat(avgRating)))].map((_, i) => <Star key={`empty-${i}`} className="w-3 h-3 text-neutral-300" />)}
            </div>
            <span className="text-[11px] text-neutral-500">{avgRating} - {numReviews} reviews</span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-3xl font-black tracking-tight text-black">${(gem.price_usd || 0).toLocaleString()}</span>
          </div>

          {/* Compare & Wishlist */}
          <div className="flex gap-2 mb-10">
            <button
              type="button"
              onClick={() => gem && toggleCompare(gem as any)}
              className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all ${
                isCompared
                  ? 'border-[#B87A5B] bg-[#B87A5B] text-white shadow-sm'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-black hover:text-black'
              }`}
            >
              <span>{isCompared ? "Compared" : "Compare"}</span>
              <Scale className="w-3 h-3" />
            </button>
            <button 
              onClick={toggleFavorite}
              className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-colors ${
                isFavourited 
                  ? 'border-red-500 bg-red-50 text-red-500' 
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-black hover:text-black'
              }`}
            >
              Wishlist <Heart className={`w-3 h-3 ${isFavourited ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Spec Table */}
          <div className="space-y-3.5 text-[11px] text-black mb-10 border-t border-neutral-200 pt-8">
            <div className="grid grid-cols-[140px_1fr] gap-4">
              <div className="font-bold">Product ID</div>
              <div>SBG{gem.id.toString().padStart(3, '0')}</div>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-4">
              <div className="font-bold">Carat Weight</div>
              <div>{(gem.weight_carat || 0).toFixed(2)} Ct</div>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-4">
              <div className="font-bold">Type</div>
              <div>{gem.gemstone_type || "Sapphire"}</div>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-4">
              <div className="font-bold">Color</div>
              <div>{gem.color || "Blue"} ({gem.category})</div>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-4">
              <div className="font-bold">Shape</div>
              <div>{gem.shape || "Oval"}</div>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-4">
              <div className="font-bold">Cut</div>
              <div>{gem.cut_style || "Faceted"}</div>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-4">
              <div className="font-bold">Intensity</div>
              <div>{gem.intensity || "Vivid"}</div>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-4">
              <div className="font-bold">Clarity</div>
              <div>{gem.clarity || "Eye Clean"}</div>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-4">
              <div className="font-bold">Treatment</div>
              <div>{gem.treatment || "Normally Heated"}</div>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-4">
              <div className="font-bold">Origin</div>
              <div>{gem.origin || "Sri Lanka"}</div>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-4">
              <div className="font-bold">Size</div>
              <div>{gem.length || "-"} mm x {gem.width || "-"} mm x {gem.height || "-"} mm</div>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-4">
              <div className="font-bold">Certificate</div>
              <div>
                {gem.certificate_url ? (
                  <a href={gem.certificate_url} target="_blank" rel="noreferrer" className="text-[#B87A5B] underline underline-offset-2">Click to View Certificate</a>
                ) : <span className="text-[#B87A5B] underline underline-offset-2">Click to View Certificate</span>}
              </div>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-4">
              <div className="font-bold">Birthstone Month</div>
              <div>{gem.month || "September"}</div>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-4">
              <div className="font-bold">Seller</div>
              <div className="text-[#B87A5B]">{gem.seller ? `${gem.seller.firstname || ''} ${gem.seller.lastname || ''}`.trim() || 'Verified Seller' : 'Anura Rathnayake'}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isSeller ? (
              <div className="w-full flex flex-col gap-2">
                <button 
                  onClick={() => router.push(`/sell/${gem.id}/edit`)}
                  className="w-full flex items-center justify-center gap-2 rounded bg-black py-4 text-[12px] font-bold tracking-wide text-white hover:bg-neutral-800 transition-colors"
                >
                  Edit Listing
                </button>
                <button 
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to completely delete this gem listing? This action cannot be undone.")) {
                      try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/gems/${gem.id}?seller_id=${userId}`, {
                          method: 'DELETE'
                        });
                        if (res.ok) {
                          alert('Listing deleted successfully.');
                          router.push('/profile/listings');
                        } else {
                          alert('Failed to delete listing.');
                        }
                      } catch (err) {
                        console.error(err);
                        alert('An error occurred.');
                      }
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded border border-red-500 bg-white py-4 text-[12px] font-bold tracking-wide text-red-500 hover:bg-red-50 transition-colors"
                >
                  Delete Listing
                </button>
              </div>
            ) : gem.is_available === false ? (
              <div className="w-full flex items-center justify-center gap-2 rounded bg-neutral-200 py-4 text-[12px] font-bold tracking-wide text-neutral-500">
                Currently Unavailable
              </div>
            ) : (
              <>
                <button 
                  onClick={addToCart}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 rounded bg-black py-4 text-[12px] font-bold tracking-wide text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to cart
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={requestToBuy}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 rounded border border-neutral-200 bg-white py-4 text-[12px] font-bold tracking-wide text-black hover:bg-neutral-50 transition-colors disabled:opacity-50"
                  >
                    Request to Buy
                  </button>
                  <button 
                    onClick={messageSeller}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 rounded border border-neutral-200 bg-white py-4 text-[12px] font-bold tracking-wide text-black hover:bg-neutral-50 transition-colors disabled:opacity-50"
                  >
                    <MessageSquare className="w-4 h-4" /> Message Seller
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Gem Journey Section */}
      <div className="mt-20 border-t border-neutral-200 pt-16">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-[20px] font-extrabold tracking-wide text-black">Gem Journey</h2>
          <span className="rounded bg-[#F5F4F0] px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-neutral-600">
            Fully Traced
          </span>
        </div>

        <div className="w-full lg:w-[85%] ml-auto space-y-0 relative mt-8">

          <div className="w-px bg-neutral-200 absolute top-4 bottom-4 left-3.5 z-0"></div>

          {/* Step 1: Mined */}
          <div className="flex items-start gap-8 relative pb-8">
            <div className="h-7 w-7 rounded-full bg-[#00A859] flex items-center justify-center shrink-0 z-10">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 rounded border border-neutral-200 bg-white p-5 flex justify-between items-start">
              <div>
                <h3 className="text-[13px] font-bold text-black mb-1">Mined</h3>
                <p className="text-[10px] text-neutral-500">{gem.mined || `${gem.origin}, Sri Lanka`}</p>
                <p className="text-[10px] text-neutral-400 mt-1">Ethically extracted from alluvial deposits</p>
              </div>
              <div className="text-[9px] text-neutral-400">
                {formatDate(gem.created_at)}
              </div>
            </div>
          </div>

          {/* Step 2: Cut & Polished */}
          <div className="flex items-start gap-8 relative pb-8">
            <div className="h-7 w-7 rounded-full bg-[#00A859] flex items-center justify-center shrink-0 z-10">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 rounded border border-neutral-200 bg-white p-5 flex justify-between items-start">
              <div>
                <h3 className="text-[13px] font-bold text-black mb-1">Cut & Polished</h3>
                <p className="text-[10px] text-neutral-500">By Master cutter {gem.cut_by || "Local Artisan"} ({gem.cut_location || gem.origin})</p>
                <p className="text-[10px] text-neutral-400 mt-1">Precision {gem.cut_style?.toLowerCase() || 'faceted'} cut to maximize brilliance</p>
              </div>
              <div className="text-[9px] text-neutral-400">
                {formatDate(gem.created_at)}
              </div>
            </div>
          </div>

          {/* Step 3: Certified */}
          <div className="flex items-start gap-8 relative pb-8">
            <div className="h-7 w-7 rounded-full bg-[#00A859] flex items-center justify-center shrink-0 z-10">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 rounded border border-neutral-200 bg-white p-5 flex justify-between items-start">
              <div>
                <h3 className="text-[13px] font-bold text-black mb-1">Certified</h3>
                <p className="text-[10px] text-neutral-500">{gem.certified_by || "National Gem & Jewelry Authority"} ({gem.certified_location || "Sri Lanka"})</p>
                <p className="text-[10px] text-neutral-400 mt-1">Lab tested and certified as natural, unheated</p>
              </div>
              <div className="text-[9px] text-neutral-400">
                {formatDate(gem.created_at)}
              </div>
            </div>
          </div>

          {/* Step 4: Listed */}
          <div className="flex items-start gap-8 relative">
            <div className="h-7 w-7 rounded-full bg-[#00A859] flex items-center justify-center shrink-0 z-10">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 rounded border border-neutral-200 bg-white p-5 flex justify-between items-start">
              <div>
                <h3 className="text-[13px] font-bold text-black mb-1">Listed</h3>
                <p className="text-[10px] text-neutral-500">Available for Purchase</p>
                <p className="text-[10px] text-neutral-400 mt-1">Ready to become part of your collection</p>
              </div>
              <div className="text-[9px] text-neutral-400">
                {formatDate(gem.created_at)}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-20 border-t border-neutral-200 pt-16">
        <h2 className="text-[20px] font-extrabold tracking-wide text-black mb-8">Seller Reviews</h2>

        <div className="max-w-3xl mx-auto space-y-6">
          {reviews.length === 0 ? (
            <div className="text-[12px] text-neutral-500 bg-neutral-50 rounded-xl p-6 border border-neutral-100 text-center">
              This seller doesn't have any reviews yet.
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b border-neutral-100 pb-6 last:border-0 last:pb-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-[10px] text-neutral-600 uppercase">
                    {review.reviewer?.firstname?.[0] || 'U'}
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-black">{review.reviewer ? `${review.reviewer.firstname || ''} ${review.reviewer.lastname || ''}`.trim() || 'User' : 'Verified Buyer'}</h4>
                    <p className="text-[9px] text-neutral-400">{formatDate(review.created_at)}</p>
                  </div>
                </div>
                <div className="flex text-[#F5C518] mb-2">
                  {[...Array(review.rating)].map((_, i) => <Star key={`r-fill-${i}`} className="w-3 h-3 fill-current" />)}
                  {[...Array(5 - review.rating)].map((_, i) => <Star key={`r-empty-${i}`} className="w-3 h-3 text-neutral-300" />)}
                </div>
                {review.comment && (
                  <p className="text-[11px] text-neutral-600 leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Similar Gemstones Section */}
      {similarGems.length > 0 && (
        <div className="mt-20 border-t border-neutral-200 pt-16">
          <h2 className="text-[18px] font-extrabold tracking-wide text-black mb-8">Similar Gemstones</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {similarGems.map((g) => (
              <GemCard key={g.id} gem={g} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
