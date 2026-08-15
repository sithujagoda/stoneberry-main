"use client";

import { useEffect, useState, startTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUp, RefreshCw, Info } from "lucide-react";
import GemCard, { Gem } from "@/components/GemCard";

const MOCK_GEMS: Gem[] = [
  {
    id: 1,
    name: "Ceylon Royal Blue Sapphire",
    description: "An exquisite vivid blue sapphire showing excellent transparency and typical Sri Lankan cornflower blue saturation.",
    category: "Blue Sapphire",
    weight_carat: 4.82,
    price_usd: 12500.00,
    origin: "Ratnapura",
    clarity: "VVS1",
    cut_style: "Cushion",
    certificate_url: "NGJA-2026-9812",
    sunlight_image_url: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600"
  },
  {
    id: 2,
    name: "Ratnapura Padparadscha Sapphire",
    description: "A rare and highly coveted Padparadscha sapphire showing the perfect blend of pink and orange (lotus blossom color).",
    category: "Padparadscha",
    weight_carat: 2.35,
    price_usd: 8900.00,
    origin: "Ratnapura",
    clarity: "VS1",
    cut_style: "Oval",
    certificate_url: "NGJA-2026-1049",
    sunlight_image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600"
  },
  {
    id: 3,
    name: "Elahera Star Ruby",
    description: "A beautiful deep red natural ruby exhibiting a distinct 6-ray star under direct sunlight. Extremely prominent asterism.",
    category: "Ruby",
    weight_carat: 3.50,
    price_usd: 9500.00,
    origin: "Elahera",
    clarity: "VS2",
    cut_style: "Cabochon",
    certificate_url: "GIA-64829104",
    sunlight_image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600"
  },
  {
    id: 4,
    name: "Golden Yellow Sapphire",
    description: "A vibrant golden-yellow sapphire with outstanding brilliance and cut. Free of eye-visible inclusions.",
    category: "Yellow Sapphire",
    weight_carat: 5.10,
    price_usd: 6200.00,
    origin: "Balangoda",
    clarity: "VVS2",
    cut_style: "Round",
    certificate_url: "NGJA-2026-0394",
    sunlight_image_url: "https://images.unsplash.com/photo-1615655404745-a10c243f1015?q=80&w=600"
  },
  {
    id: 5,
    name: "Ceylon Chrysoberyl Cat's Eye",
    description: "A premium honey-colored Chrysoberyl Cat's Eye featuring a razor-sharp, bright eye centered perfectly.",
    category: "Cat's Eye",
    weight_carat: 6.20,
    price_usd: 14500.00,
    origin: "Ratnapura",
    clarity: "IF",
    cut_style: "Cabochon",
    certificate_url: "NGJA-2026-8877",
    sunlight_image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600"
  },
  {
    id: 6,
    name: "Pelmadulla Alexandrite",
    description: "A phenomenal color-change Alexandrite shifting from a forest green in daylight to an attractive raspberry red under incandescent light.",
    category: "Alexandrite",
    weight_carat: 1.85,
    price_usd: 18000.00,
    origin: "Ratnapura",
    clarity: "VS1",
    cut_style: "Emerald",
    certificate_url: "GIA-55910234",
    sunlight_image_url: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600"
  }
];

export default function Home() {
  const [gems, setGems] = useState<Gem[]>(MOCK_GEMS);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState("All");

  const filterTabs = [
    "All",
    "Sapphire",
    "Ruby",
    "Emerald",
    "Spinel",
    "Alexandrite"
  ];

  const filteredGems = activeFilter === "All" 
    ? gems 
    : gems.filter(gem => gem.gemstone_type === activeFilter);

  const fetchGems = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/gems");
      if (!response.ok) throw new Error("API response error");
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        setGems(result.data);
        setIsFallback(false);
      } else {
        throw new Error(result.error || "Malformed API response");
      }
    } catch (err) {
      console.warn("FastAPI backend connection failed. Using mock catalog data.", err);
      setIsFallback(true);
      setGems(MOCK_GEMS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGems();
  }, []);

  return (
    <div className="flex flex-col pb-20">
      
      {/* 1. THREE-COLUMN HERO SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative overflow-visible">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 lg:gap-8 items-stretch">
          
          {/* Left Column: Brand Copy & Main Button (Cols: 5) */}
          <div className="md:col-span-5 flex flex-col justify-between pt-4 md:pt-16 pb-4 relative">
            <div className="space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-widest text-black md:whitespace-nowrap z-20 relative">
                STONEBERRY GEM CO.
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
                Stoneberry Gem Co. is a modern Sri Lankan gem platform where heritage meets a bold, new era of luxury, bringing authenticity, elegance, and trust into the digital world.
              </p>
              <div className="pt-2">
                <Link
                  href="/gems"
                  className="inline-flex items-center gap-4 rounded-full bg-black text-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-md"
                >
                  Shop Now
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black">
                    <ArrowRight className="h-3 w-3 stroke-[3]" />
                  </span>
                </Link>
              </div>
            </div>
            {/* Horizontal line at bottom of Column 1 */}
            <div className="w-full border-t border-black/80 mt-12 md:mt-20" />
          </div>

          {/* Center Column: Portrait Rough Gemstone (Cols: 4) - Overlapping */}
          <div className="md:col-span-4 flex items-center justify-center z-10">
            <div className="relative w-full h-[32rem] md:h-[36rem] md:-mt-16 md:-mb-12 overflow-hidden bg-gray-100 shadow-sm border border-gray-100/50">
              <Image
                src="/images/hero_rough.png"
                alt="Rough Ceylon Gemstones"
                fill
                priority
                sizes="(max-w-600px) 100vw, 400px"
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600";
                }}
              />
            </div>
          </div>

          {/* Right Column: Mini details & tweezers image (Cols: 3) */}
          <div className="md:col-span-3 flex flex-col justify-between pt-4 md:pt-16 pb-4">
            <div className="space-y-6">
              {/* Horizontal line at top of Column 3 */}
              <div className="w-full border-t border-black/80 mb-6" />
              <h2 className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-black leading-relaxed">
                Redefining luxury <br /> with authenticity and <br /> trust
              </h2>
              
              {/* Small Tweezers Frame - Square Aspect */}
              <div className="relative aspect-square w-full max-w-[180px] md:max-w-[220px] overflow-hidden bg-gray-100 shadow-sm">
                <Image
                  src="/images/hero_tweezers.png"
                  alt="Precision Gem Examination"
                  fill
                  sizes="220px"
                  className="object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600";
                  }}
                />
              </div>
            </div>

            <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-800 pt-8 md:pt-4">
              Authentic. Modern. Timeless.
            </p>
          </div>

        </div>
      </section>

      {/* 2. FILTER PILLS BAR */}
      <section className="bg-stoneberry-grey/40 border-y border-gray-100 py-6 my-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 overflow-x-auto pb-2 scrollbar-none w-full">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => startTransition(() => setActiveFilter(tab))}
                className={`flex-1 whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-center transition-colors ${
                  activeFilter === tab
                    ? "bg-black text-white"
                    : "bg-[#EAEAEA] text-neutral-600 hover:bg-[#DFDFDF] hover:text-black"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. GEMSTONE LIST GRID */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {isFallback && (
          <div className="mb-6 flex items-center justify-between gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-600">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>Offline Mode: The FastAPI database server is down. Displaying simulated listings instead.</span>
            </div>
            <button
              onClick={fetchGems}
              className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 font-bold uppercase tracking-wider text-amber-700 hover:bg-amber-500/20"
            >
              <RefreshCw className="h-3 w-3 animate-spin" /> Retry Connection
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
              {filteredGems.map((gem) => (
                <GemCard key={gem.id} gem={gem} />
              ))}
            </div>

            {/* View All Button */}
            <div className="mt-16 flex justify-end">
              <Link 
                href="/gems"
                className="group flex items-center gap-4 text-xs font-extrabold uppercase tracking-widest text-black hover:opacity-75 transition-opacity"
              >
                View All
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition-transform group-hover:-translate-y-1">
                  <ArrowUp className="h-4 w-4 text-black stroke-[2.5]" />
                </span>
              </Link>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
