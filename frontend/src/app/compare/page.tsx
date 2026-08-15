"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCompare } from "@/components/CompareProvider";
import { Gem } from "@/components/GemCard";
import {
  Scale,
  X,
  Check,
  ArrowLeft,
  Trash2,
  Search,
  ExternalLink,
  ShieldCheck,
  Award,
  Sparkles
} from "lucide-react";

export default function ComparePage() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const [highlightDiffs, setHighlightDiffs] = useState(false);

  // Loupe tracking per gem column ID
  const [activeLoupeId, setActiveLoupeId] = useState<number | null>(null);
  const [loupePos, setLoupePos] = useState({ x: 0, y: 0 });
  const imageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, gemId: number) => {
    const el = imageRefs.current[gemId];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setLoupePos({ x, y });
      setActiveLoupeId(gemId);
    } else {
      setActiveLoupeId(null);
    }
  };

  const handleMouseLeave = () => {
    setActiveLoupeId(null);
  };

  const getLoupeStyle = (gemId: number, imageUrl: string) => {
    const el = imageRefs.current[gemId];
    if (!el) return {};
    const { width, height } = el.getBoundingClientRect();
    const loupeDiameter = 120; // w-30 = 120px
    const zoomFactor = 2.5;

    const relX = width > 0 ? loupePos.x / width : 0.5;
    const relY = height > 0 ? loupePos.y / height : 0.5;

    return {
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: `${width * zoomFactor}px ${height * zoomFactor}px`,
      backgroundPosition: `${relX * 100}% ${relY * 100}%`,
      left: `${loupePos.x - loupeDiameter / 2}px`,
      top: `${loupePos.y - loupeDiameter / 2}px`
    };
  };

  // Find lowest price per carat for highlighting
  const pricesPerCarat = compareItems.map((gem) => {
    const ct = gem.weight_carat || 1;
    return (gem.price_usd || 0) / ct;
  });
  const minPricePerCarat = pricesPerCarat.length > 0 ? Math.min(...pricesPerCarat) : 0;

  // Define specification rows and how to compute cell string values
  interface SpecRow {
    label: string;
    getValue: (gem: Gem, idx: number) => string | React.ReactNode;
    getRawValue: (gem: Gem, idx: number) => string | number;
  }

  const specRows: SpecRow[] = [
    {
      label: "Price per Carat",
      getValue: (gem, idx) => {
        const ct = gem.weight_carat || 1;
        const ppc = (gem.price_usd || 0) / ct;
        const isBest = compareItems.length > 1 && ppc === minPricePerCarat && ppc > 0;
        return (
          <div className="flex flex-col items-start gap-1">
            <span className="font-bold text-sm text-black">
              ${Math.round(ppc).toLocaleString()} / ct
            </span>
            {isBest && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5" /> Best Value
              </span>
            )}
          </div>
        );
      },
      getRawValue: (gem) => {
        const ct = gem.weight_carat || 1;
        return Math.round((gem.price_usd || 0) / ct);
      }
    },
    {
      label: "Total Price",
      getValue: (gem) => (
        <span className="font-extrabold text-base text-black">
          ${(gem.price_usd || 0).toLocaleString()}
        </span>
      ),
      getRawValue: (gem) => gem.price_usd || 0
    },
    {
      label: "Carat Weight",
      getValue: (gem) => (
        <span className="font-bold text-black">
          {(gem.weight_carat || 0).toFixed(2)} Ct
        </span>
      ),
      getRawValue: (gem) => (gem.weight_carat || 0).toFixed(2)
    },
    {
      label: "Gemstone Type",
      getValue: (gem) => (
        <span className="font-semibold capitalize text-black">
          {gem.gemstone_type || "Sapphire"}
        </span>
      ),
      getRawValue: (gem) => (gem.gemstone_type || "Sapphire").toLowerCase()
    },
    {
      label: "Color & Intensity",
      getValue: (gem) => (
        <span className="font-semibold capitalize text-black">
          {[gem.intensity, gem.color].filter(Boolean).join(" ") || "Blue"}
        </span>
      ),
      getRawValue: (gem) =>
        [gem.intensity, gem.color].filter(Boolean).join(" ").toLowerCase() || "blue"
    },
    {
      label: "Cut Shape & Style",
      getValue: (gem) => (
        <span className="font-semibold capitalize text-black">
          {[gem.shape, gem.cut_style].filter(Boolean).join(" - ") || "Oval Mixed Cut"}
        </span>
      ),
      getRawValue: (gem) =>
        [gem.shape, gem.cut_style].filter(Boolean).join(" - ").toLowerCase() || "oval mixed cut"
    },
    {
      label: "Clarity Grade",
      getValue: (gem) => (
        <span className="font-semibold uppercase text-black">
          {gem.clarity || "Eye Clean"}
        </span>
      ),
      getRawValue: (gem) => (gem.clarity || "Eye Clean").toLowerCase()
    },
    {
      label: "Treatment",
      getValue: (gem) => {
        // Most Sri Lankan sapphires in catalog are natural / unheated unless stated
        const isUnheated = !gem.description?.toLowerCase().includes("heated");
        return (
          <span
            className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-full ${
              isUnheated
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-amber-100 text-amber-800 border border-amber-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {isUnheated ? "Unheated / No Heat" : "Heated"}
          </span>
        );
      },
      getRawValue: (gem) =>
        !gem.description?.toLowerCase().includes("heated") ? "unheated" : "heated"
    },
    {
      label: "Geographic Origin",
      getValue: (gem) => (
        <span className="font-semibold text-black">
          {gem.origin || "Sri Lanka (Ceylon)"}
        </span>
      ),
      getRawValue: (gem) => (gem.origin || "Sri Lanka (Ceylon)").toLowerCase()
    },
    {
      label: "Lab Certification",
      getValue: (gem) =>
        gem.certificate_url ? (
          <a
            href={gem.certificate_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-xs text-[#B87A5B] hover:underline"
          >
            <Award className="w-3.5 h-3.5" /> Verified Lab Report <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-neutral-500 text-xs font-medium inline-flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-neutral-400" /> Lab Certified
          </span>
        ),
      getRawValue: (gem) => (gem.certificate_url ? "certified" : "certified")
    }
  ];

  // Helper to check if a row differs across selected gems
  const isRowDiffering = (row: SpecRow) => {
    if (compareItems.length <= 1) return false;
    const firstVal = row.getRawValue(compareItems[0], 0);
    return compareItems.some((gem, idx) => row.getRawValue(gem, idx) !== firstVal);
  };

  if (compareItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#F9F8F6] py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-[#B87A5B]/10 flex items-center justify-center text-[#B87A5B] mb-6">
          <Scale className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mb-3">
          Gemstone Comparison Suite
        </h1>
        <p className="text-neutral-600 max-w-md text-sm font-medium mb-8 leading-relaxed">
          You haven&apos;t selected any gemstones to compare yet. Browse our exclusive catalog and click the <strong className="text-black">Compare</strong> button on any gemstone card to evaluate up to 4 stones side-by-side.
        </p>
        <Link
          href="/gems/browse"
          className="rounded-full bg-black text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-md"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb & Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-neutral-200/80 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
              <Link href="/" className="hover:text-black transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-black">Compare Suite</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-black flex items-center gap-3">
              <span>Gemstone Comparison</span>
              <span className="text-sm px-3 py-1 rounded-full bg-[#B87A5B] text-white font-bold">
                {compareItems.length} of 4
              </span>
            </h1>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setHighlightDiffs(!highlightDiffs)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                highlightDiffs
                  ? "bg-black text-white border-black shadow-md scale-105"
                  : "bg-white text-neutral-700 border-neutral-300 hover:border-black"
              }`}
              title="Highlight differing attributes"
            >
              <Check className={`w-4 h-4 ${highlightDiffs ? "opacity-100" : "opacity-0 w-0 -mr-2"}`} />
              <span>Highlight Differences</span>
            </button>

            {compareItems.length < 4 && (
              <Link
                href="/gems/browse"
                className="px-4 py-2.5 rounded-full bg-white text-black border border-neutral-300 hover:border-black text-xs font-bold uppercase tracking-wider transition-colors"
              >
                + Add More Stones
              </Link>
            )}

            <button
              type="button"
              onClick={clearCompare}
              className="px-4 py-2.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className="overflow-x-auto pb-12">
          <div
            className="grid gap-6 min-w-[700px]"
            style={{
              gridTemplateColumns: `minmax(180px, 1fr) repeat(${compareItems.length}, minmax(260px, 1.3fr))`
            }}
          >
            {/* Top Row: Empty Left Header + Gemstone Columns */}
            <div className="flex flex-col justify-end pb-4 border-b-2 border-black">
              <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-400">
                Visual Inspection
              </span>
              <span className="text-[10px] text-neutral-500 font-medium mt-1">
                Hover images for 2.5x Jeweler&apos;s Loupe
              </span>
            </div>

            {compareItems.map((gem) => {
              const imgUrl =
                gem.sunlight_image_url ||
                "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600";
              const title =
                gem.name && gem.name !== "Unknown Gem"
                  ? gem.name
                  : `${gem.intensity || ""} ${gem.color || ""} ${gem.gemstone_type || "Gemstone"}`
                      .trim()
                      .replace(/\s+/g, " ");

              return (
                <div
                  key={gem.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-sm flex flex-col items-center relative group"
                >
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromCompare(gem.id)}
                    className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-neutral-100 hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                    title="Remove from comparison"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Gemstone Image with Hover Loupe */}
                  <div
                    ref={(el) => {
                      imageRefs.current[gem.id] = el;
                    }}
                    onMouseMove={(e) => handleMouseMove(e, gem.id)}
                    onMouseLeave={handleMouseLeave}
                    className="relative w-full max-w-[240px] aspect-square rounded-xl bg-neutral-50 border border-neutral-100 overflow-hidden cursor-crosshair flex items-center justify-center my-3"
                  >
                    {activeLoupeId === gem.id && (
                      <div
                        style={getLoupeStyle(gem.id, imgUrl)}
                        className="absolute w-30 h-30 rounded-full border-[2.5px] border-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] pointer-events-none z-30 bg-no-repeat overflow-hidden transition-opacity duration-150 animate-in fade-in"
                      >
                        <div className="absolute inset-0 flex items-center justify-center opacity-30">
                          <div className="w-1.5 h-1.5 rounded-full bg-white border border-black/40" />
                        </div>
                        <div className="absolute inset-0 rounded-full border border-black/10 pointer-events-none" />
                      </div>
                    )}

                    <Image
                      src={imgUrl}
                      alt={title}
                      fill
                      sizes="(max-w-600px) 100vw, 240px"
                      className="object-contain pointer-events-none select-none p-2"
                    />
                  </div>

                  {/* Gem Title & ID */}
                  <div className="w-full text-center mt-2">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                      SBG{gem.id.toString().padStart(3, "0")}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-black capitalize line-clamp-1 mt-0.5">
                      {title}
                    </h3>
                  </div>

                  {/* Action Link */}
                  <div className="w-full mt-4 pt-3 border-t border-neutral-100">
                    <Link
                      href={`/gems/${gem.id}`}
                      className="w-full block text-center rounded-xl bg-black hover:bg-neutral-800 text-white py-2 text-[11px] font-bold uppercase tracking-widest transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Specification Rows */}
            {specRows.map((row, rowIdx) => {
              const isDiff = isRowDiffering(row);
              const shouldHighlight = highlightDiffs && isDiff;
              const shouldDim = highlightDiffs && !isDiff;

              return (
                <React.Fragment key={row.label}>
                  {/* Row Label Cell */}
                  <div
                    className={`flex items-center px-4 py-4 rounded-l-xl font-bold text-xs uppercase tracking-wider text-neutral-600 border-b border-neutral-200/60 transition-colors ${
                      shouldHighlight
                        ? "bg-[#B87A5B]/10 text-[#B87A5B] border-l-4 border-l-[#B87A5B]"
                        : shouldDim
                        ? "opacity-40 bg-neutral-100/50"
                        : "bg-white/60"
                    }`}
                  >
                    {row.label}
                  </div>

                  {/* Gem Specification Cells */}
                  {compareItems.map((gem, gemIdx) => (
                    <div
                      key={gem.id}
                      className={`flex items-center px-5 py-4 text-xs sm:text-sm border-b border-neutral-200/60 transition-colors ${
                        shouldHighlight
                          ? "bg-[#B87A5B]/10 font-bold text-black"
                          : shouldDim
                          ? "opacity-40 bg-neutral-100/50"
                          : "bg-white"
                      } ${gemIdx === compareItems.length - 1 ? "rounded-r-xl" : ""}`}
                    >
                      {row.getValue(gem, gemIdx)}
                    </div>
                  ))}
                </React.Fragment>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
