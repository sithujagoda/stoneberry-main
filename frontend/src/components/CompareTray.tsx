"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCompare } from "./CompareProvider";
import { Scale, X, ArrowRight, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";

export default function CompareTray() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't show tray on the compare page itself or when empty
  if (!mounted || compareItems.length === 0 || pathname === "/compare") {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[8888] w-full max-w-3xl px-4 animate-in slide-in-from-bottom-8 duration-300">
      <div className="bg-neutral-950/90 dark:bg-neutral-900/95 text-white backdrop-blur-xl rounded-2xl p-4 sm:px-6 sm:py-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left: Title and Thumbnails */}
        <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-2 pr-3 border-r border-white/20 shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#B87A5B]/20 flex items-center justify-center text-[#B87A5B]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold tracking-wide">COMPARE</div>
              <div className="text-[10px] text-neutral-400 font-semibold">
                {compareItems.length} of 4 selected
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {compareItems.map((gem) => {
              const imgUrl =
                gem.sunlight_image_url ||
                "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600";
              return (
                <div
                  key={gem.id}
                  className="relative group w-11 h-11 rounded-xl bg-neutral-800 border border-white/20 overflow-hidden shrink-0 transition-transform hover:scale-105"
                  title={gem.name || `Gem #${gem.id}`}
                >
                  <Image
                    src={imgUrl}
                    alt={gem.name || "Gem"}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFromCompare(gem.id);
                    }}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    title="Remove from comparison"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {/* Empty thumbnail placeholders if under 4 */}
            {Array.from({ length: 4 - compareItems.length }).map((_, i) => (
              <div
                key={i}
                className="w-11 h-11 rounded-xl border border-dashed border-white/20 flex items-center justify-center text-white/30 text-[10px] font-bold shrink-0"
              >
                +{i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-3 w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
          <button
            type="button"
            onClick={clearCompare}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
            title="Clear all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <Link
            href="/compare"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B87A5B] hover:bg-[#a66b4d] text-white font-bold text-xs tracking-wide shadow-lg shadow-[#B87A5B]/30 hover:scale-105 transition-all"
          >
            <span>Compare Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
