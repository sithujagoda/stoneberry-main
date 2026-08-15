"use client";

import { useEffect, useState, startTransition } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Info, RefreshCw } from "lucide-react";
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

export default function GemsCatalog() {
  const [gems, setGems] = useState<Gem[]>(MOCK_GEMS);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  // Filters State
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [origin, setOrigin] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const categories = ["All", "Blue Sapphire", "Padparadscha", "Ruby", "Yellow Sapphire", "Cat's Eye", "Alexandrite"];
  const origins = ["All", "Ratnapura", "Elahera", "Balangoda"];

  const fetchGems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "All") params.append("category", category);
      if (origin !== "All") params.append("origin", origin);
      if (minPrice) params.append("min_price", minPrice);
      if (maxPrice) params.append("max_price", maxPrice);

      const response = await fetch(`http://127.0.0.1:8000/api/gems?${params.toString()}`);
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

      let filtered = [...MOCK_GEMS];
      if (category !== "All") {
        filtered = filtered.filter(g => g.category === category);
      }
      if (origin !== "All") {
        filtered = filtered.filter(g => g.origin === origin);
      }
      if (minPrice) {
        filtered = filtered.filter(g => (g.price_usd || 0) >= parseFloat(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter(g => (g.price_usd || 0) <= parseFloat(maxPrice));
      }
      setGems(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGems();
  }, [category, origin, minPrice, maxPrice]);

  const filteredGems = gems.filter((gem) =>
    (gem.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (gem.description && gem.description.toLowerCase().includes(search.toLowerCase())) ||
    (gem.cut_style || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 py-12 font-sans overflow-hidden">
      {/* Header */}
      <div className="pb-8">
        <h1 className="text-2xl font-bold tracking-wide text-black">All Gemstones</h1>
      </div>

      {/* Gems Catalog Grid (No Sidebar) */}
      <div>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          </div>
        ) : filteredGems.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 bg-white rounded-xl">
            <p className="text-gray-500 text-sm font-medium">No gemstones match the selected filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-6 gap-y-12">
            {filteredGems.map((gem) => (
              <GemCard key={gem.id} gem={gem} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredGems.length > 0 && (
        <div className="mt-16 flex items-center justify-end gap-3 text-sm font-semibold text-[#B0B0B0]">
          <button className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 hover:bg-neutral-50 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
          <button className="text-black font-bold px-1 hover:text-black transition-colors">1</button>
          <button className="px-1 hover:text-black transition-colors">2</button>
          <button className="px-1 hover:text-black transition-colors">3</button>
          <span className="px-1 tracking-widest text-neutral-300">. . .</span>
          <button className="px-1 hover:text-black transition-colors">8</button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 hover:bg-neutral-50 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}

      {/* CTA Banner */}
      <div className="mt-24 mb-16 relative flex items-center justify-center py-20">
        {/* Decorative background circle */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-0">
          <div className="w-[500px] h-[500px] bg-[#F9F8F6] rounded-full scale-y-[1.2]"></div>
        </div>

        {/* Oval Banner Container */}
        <div className="relative z-10 w-full max-w-[1000px] bg-white border border-neutral-100/50 rounded-[120px] shadow-[0_8px_40px_rgb(0,0,0,0.03)] py-16 px-16 lg:px-24 flex flex-col md:flex-row items-center justify-between">
          <div className="max-w-xs text-left">
            <h2 className="text-[28px] leading-[1.15] font-semibold text-[#333333] tracking-tight">
              Looking<br />For<br />A<br />Perfect<br />Gemstone?
            </h2>
            <div className="mt-6 flex items-center gap-3 text-neutral-500 font-medium text-[13px]">
              <span>Just browse them</span>
              <div className="h-[1px] w-24 bg-neutral-300 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-r border-t border-neutral-300 rotate-45"></div>
              </div>
            </div>
          </div>

          <div className="mt-10 md:mt-0 flex-shrink-0">
            <Link href="/gems" className="flex items-center gap-2 bg-[#F6F5F2] hover:bg-neutral-200 transition-colors text-black text-[11px] font-bold tracking-wide uppercase px-6 py-3 rounded-full">
              Browse Gems
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
