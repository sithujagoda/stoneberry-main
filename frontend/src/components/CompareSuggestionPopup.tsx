"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useCompare } from "./CompareProvider";
import { Sparkles, X, Scale, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";

export default function CompareSuggestionPopup() {
  const { suggestedPair, acceptSuggestion, dismissSuggestion, hasDismissedSuggestion } = useCompare();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Do not show on the compare page itself or if dismissed/null
  if (!mounted || !suggestedPair || hasDismissedSuggestion || pathname === "/compare") {
    return null;
  }

  const { gemA, gemB } = suggestedPair;
  const imgA =
    gemA.sunlight_image_url ||
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600";
  const imgB =
    gemB.sunlight_image_url ||
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600";

  const nameA = gemA.name && gemA.name !== "Unknown Gem" ? gemA.name : `${gemA.intensity || ""} ${gemA.color || ""} ${gemA.gemstone_type || "Gemstone"}`.trim();
  const nameB = gemB.name && gemB.name !== "Unknown Gem" ? gemB.name : `${gemB.intensity || ""} ${gemB.color || ""} ${gemB.gemstone_type || "Gemstone"}`.trim();

  return (
    <div className="fixed top-24 right-4 sm:right-6 z-[9500] w-full max-w-sm px-2 animate-in slide-in-from-top-6 duration-300">
      <div className="bg-neutral-950/95 dark:bg-neutral-900 text-white backdrop-blur-xl rounded-2xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-[#B87A5B]/40 flex flex-col gap-4 relative overflow-hidden">
        
        {/* Subtle luxury background glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#B87A5B]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-[#B87A5B]">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-white">
              Compare Suggestion
            </span>
          </div>
          <button
            type="button"
            onClick={dismissSuggestion}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Dismiss forever"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Side-by-side thumbnail previews */}
        <div className="flex items-center justify-center gap-3 py-1">
          <div className="flex flex-col items-center gap-1 w-24">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/20 shadow-md bg-neutral-800">
              <Image src={imgA} alt={nameA} fill className="object-cover" />
            </div>
            <span className="text-[10px] text-neutral-300 font-bold line-clamp-1 text-center w-full">
              {nameA}
            </span>
          </div>

          <div className="w-8 h-8 rounded-full bg-[#B87A5B]/20 border border-[#B87A5B]/40 flex items-center justify-center text-[#B87A5B] shrink-0">
            <Scale className="w-4 h-4" />
          </div>

          <div className="flex flex-col items-center gap-1 w-24">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/20 shadow-md bg-neutral-800">
              <Image src={imgB} alt={nameB} fill className="object-cover" />
            </div>
            <span className="text-[10px] text-neutral-300 font-bold line-clamp-1 text-center w-full">
              {nameB}
            </span>
          </div>
        </div>

        {/* Message */}
        <p className="text-xs text-neutral-300 font-medium leading-relaxed text-center">
          You viewed <strong className="text-white">{nameA}</strong> earlier. Would you like to compare both stones side-by-side to evaluate their quality and pricing?
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={dismissSuggestion}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors text-center"
          >
            No, Thanks
          </button>

          <button
            type="button"
            onClick={acceptSuggestion}
            className="flex-1 py-2.5 rounded-xl bg-[#B87A5B] hover:bg-[#a66b4d] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#B87A5B]/30 hover:scale-105 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Compare Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
