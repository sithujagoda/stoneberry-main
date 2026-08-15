"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, ShieldCheck, MapPin, Calendar, ArrowLeft, Package, MessageSquare, Award } from "lucide-react";
import GemCard, { Gem } from "@/components/GemCard";

interface PublicUser {
  id: number;
  firstname?: string;
  lastname?: string;
  seller_type?: string;
  business_name?: string;
  province?: string;
  city?: string;
  profile_image_url?: string;
  created_at?: string;
}

interface Review {
  id: number;
  rating: number;
  comment?: string;
  review_type: string;
  created_at: string;
  reviewer?: {
    id: number;
    firstname?: string;
    lastname?: string;
    profile_image_url?: string;
  };
}

export default function PublicUserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [user, setUser] = useState<PublicUser | null>(null);
  const [gems, setGems] = useState<Gem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"gems" | "reviews">("gems");

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

        // Fetch user profile, gems, and reviews in parallel
        const [userRes, gemsRes, reviewsRes] = await Promise.all([
          fetch(`${apiUrl}/api/users/${userId}`),
          fetch(`${apiUrl}/api/gems/seller/${userId}`),
          fetch(`${apiUrl}/api/reviews/user/${userId}`)
        ]);

        const userData = await userRes.json();
        const gemsData = await gemsRes.json();
        const reviewsData = await reviewsRes.json();

        if (userData.success && userData.data) {
          setUser(userData.data);
        }

        if (gemsData.success && gemsData.data) {
          setGems(gemsData.data || []);
        }

        if (reviewsData.success && reviewsData.data) {
          setReviews(reviewsData.data || []);
        }
      } catch (err) {
        console.error("Failed to load user profile data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] py-20 flex flex-col items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-black border-t-transparent rounded-full mb-4" />
        <p className="text-sm font-bold text-neutral-600 tracking-wide uppercase">Loading Profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm">
          <Award className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-black mb-2">User Not Found</h2>
          <p className="text-sm text-neutral-600 mb-6">The profile you are looking for does not exist or has been removed.</p>
          <button
            onClick={() => router.push("/gems")}
            className="bg-black text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
          >
            Browse Gemstones
          </button>
        </div>
      </div>
    );
  }

  const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Member";
  const displayName = user.business_name || fullName;
  const location = [user.city, user.province].filter(Boolean).join(", ");
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Recently";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  return (
    <div className="min-h-screen bg-[#F9F8F6] py-10 pb-24 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-black mb-8 transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Hero Profile Card */}
        <div className="bg-white rounded-[28px] border border-neutral-200/80 shadow-sm p-6 sm:p-10 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-100/30 via-transparent to-transparent pointer-events-none rounded-bl-full" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative z-10">
            {/* Avatar */}
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-3xl bg-neutral-100 border-2 border-white shadow-md overflow-hidden relative shrink-0 flex items-center justify-center">
              {user.profile_image_url ? (
                <Image
                  src={user.profile_image_url}
                  alt={displayName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-3xl sm:text-4xl font-extrabold text-neutral-400 uppercase">
                  {user.firstname?.[0] || displayName[0] || "M"}
                </span>
              )}
            </div>

            {/* User Details */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
                  {displayName}
                </h1>
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200/80 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  Verified {user.seller_type || "Member"}
                </span>
              </div>

              {user.business_name && fullName !== user.business_name && (
                <p className="text-sm font-semibold text-neutral-600 mb-2">
                  Contact: {fullName}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-medium text-neutral-500 mt-3">
                {location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-neutral-400" />
                    {location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  Member since {formatDate(user.created_at)}
                </span>
              </div>

              {/* Quick Stat Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
                <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl px-4 py-2.5 flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <div>
                    <span className="text-sm font-black text-black">{avgRating}</span>
                    <span className="text-[10px] text-neutral-500 block font-bold uppercase tracking-wider">Overall Rating</span>
                  </div>
                </div>

                <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl px-4 py-2.5 flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="text-sm font-black text-black">{reviews.length}</span>
                    <span className="text-[10px] text-neutral-500 block font-bold uppercase tracking-wider">User Reviews</span>
                  </div>
                </div>

                <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl px-4 py-2.5 flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-sm font-black text-black">{gems.length}</span>
                    <span className="text-[10px] text-neutral-500 block font-bold uppercase tracking-wider">Active Listings</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Row */}
        <div className="flex items-center border-b border-neutral-200 mb-8 gap-8">
          <button
            onClick={() => setActiveTab("gems")}
            className={`pb-3 text-sm font-extrabold uppercase tracking-widest transition-all flex items-center gap-2 relative ${
              activeTab === "gems"
                ? "text-black border-b-2 border-black"
                : "text-neutral-400 hover:text-black"
            }`}
          >
            <Package className="w-4 h-4" /> Active Listings ({gems.length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 text-sm font-extrabold uppercase tracking-widest transition-all flex items-center gap-2 relative ${
              activeTab === "reviews"
                ? "text-black border-b-2 border-black"
                : "text-neutral-400 hover:text-black"
            }`}
          >
            <Star className="w-4 h-4" /> Reviews & Reputation ({reviews.length})
          </button>
        </div>

        {/* Tab Content: Active Gems */}
        {activeTab === "gems" && (
          <div>
            {gems.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200/80 p-16 text-center shadow-sm">
                <Package className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-black mb-1">No Active Listings</h3>
                <p className="text-sm text-neutral-500 max-w-md mx-auto">
                  {displayName} does not have any active gemstone listings available for purchase at the moment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {gems.map((gem) => (
                  <GemCard key={gem.id} gem={gem} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Reviews */}
        {activeTab === "reviews" && (
          <div>
            {reviews.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200/80 p-16 text-center shadow-sm">
                <Star className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-black mb-1">No Reviews Yet</h3>
                <p className="text-sm text-neutral-500 max-w-md mx-auto">
                  {displayName} has not received any transaction reviews yet. Reviews appear here after completed orders.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-w-4xl">
                {reviews.map((rev) => {
                  const revName = `${rev.reviewer?.firstname || ""} ${rev.reviewer?.lastname || ""}`.trim() || "Verified Buyer";
                  return (
                    <div
                      key={rev.id}
                      className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-sm flex flex-col sm:flex-row items-start gap-4 transition-all hover:border-neutral-300"
                    >
                      {/* Reviewer Avatar */}
                      <div className="h-12 w-12 rounded-2xl bg-neutral-100 border border-neutral-200 overflow-hidden relative shrink-0 flex items-center justify-center">
                        {rev.reviewer?.profile_image_url ? (
                          <Image
                            src={rev.reviewer.profile_image_url}
                            alt={revName}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="font-bold text-sm text-neutral-600 uppercase">
                            {revName[0] || "V"}
                          </span>
                        )}
                      </div>

                      {/* Review Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-black">{revName}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 border border-neutral-200">
                              {rev.review_type === "BUYER_REVIEWING_SELLER" ? "Buyer Review" : "Seller Review"}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-neutral-400">
                            {new Date(rev.created_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })}
                          </span>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-1 mb-2.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-neutral-200 fill-neutral-200"
                              }`}
                            />
                          ))}
                          <span className="text-xs font-extrabold text-black ml-1.5">{rev.rating}.0</span>
                        </div>

                        {rev.comment && (
                          <p className="text-sm text-neutral-700 leading-relaxed font-normal">
                            &ldquo;{rev.comment}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
