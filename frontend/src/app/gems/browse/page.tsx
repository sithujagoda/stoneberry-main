"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import GemCard, { Gem } from "@/components/GemCard";
import ShapeSelector from "@/components/ShapeSelector";
import IntensitySelector from "@/components/IntensitySelector";
import DualRangeSlider from "@/components/DualRangeSlider";

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
  }
];

function BrowseGemsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams?.get("search") || "";

  const [gems, setGems] = useState<Gem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters State
  const [filters, setFilters] = useState({
    search: initialSearch,
    categoryGroup: "All",
    calibration: "All",
    cutType: "All",
    treatment: "All",
    gemType: "Any",
    shape: "Any",
    color: "Any",
    intensity: "Any",
    clarityType: "All",
    month: "Any",
    length: "",
    width: "",
    height: "",
    minCarat: 0,
    maxCarat: 20,
    origin: "Any",
  });

  useEffect(() => {
    const q = searchParams?.get("search") || "";
    setFilters(prev => ({ ...prev, search: q }));
  }, [searchParams]);

  const fetchGems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search && filters.search.trim()) params.append("search", filters.search.trim());
      if (filters.gemType && filters.gemType !== "Any") params.append("type", filters.gemType);
      if (filters.categoryGroup && filters.categoryGroup !== "All") params.append("category", filters.categoryGroup);
      if (filters.cutType && filters.cutType !== "All") params.append("cut_style", filters.cutType);
      if (filters.treatment && filters.treatment !== "All") params.append("treatment", filters.treatment);
      if (filters.shape && filters.shape !== "Any" && filters.shape !== "All") params.append("shape", filters.shape);
      if (filters.color && filters.color !== "Any") params.append("color", filters.color);
      if (filters.intensity && filters.intensity !== "Any") params.append("intensity", filters.intensity);
      if (filters.clarityType && filters.clarityType !== "All") params.append("clarity", filters.clarityType);
      if (filters.month && filters.month !== "Any") params.append("month", filters.month);
      if (filters.origin && filters.origin !== "Any") params.append("origin", filters.origin);
      if (filters.minCarat > 0) params.append("minCarat", filters.minCarat.toString());
      if (filters.maxCarat < 20) params.append("maxCarat", filters.maxCarat.toString());
      if (filters.length) params.append("length", filters.length);
      if (filters.width) params.append("width", filters.width);
      if (filters.height) params.append("height", filters.height);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/gems?${params.toString()}`);
      if (!response.ok) throw new Error("API response error");
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        setGems(result.data);
      } else {
        throw new Error(result.error || "Malformed API response");
      }
    } catch (err) {
      console.warn("FastAPI backend connection failed. Using mock catalog data.");
      let filteredMock = MOCK_GEMS.filter(gem => {
        if (filters.search && filters.search.trim()) {
          const s = filters.search.trim().toLowerCase();
          if (!gem.name?.toLowerCase().includes(s) && !gem.category?.toLowerCase().includes(s) && !gem.origin?.toLowerCase().includes(s) && !gem.description?.toLowerCase().includes(s)) return false;
        }
        if (filters.gemType !== "Any" && !gem.category?.toLowerCase().includes(filters.gemType.toLowerCase()) && !gem.name?.toLowerCase().includes(filters.gemType.toLowerCase())) return false;
        if (filters.color !== "Any" && !gem.name?.toLowerCase().includes(filters.color.toLowerCase())) return false;
        if (filters.shape !== "Any" && gem.cut_style !== filters.shape) return false;
        const weight = gem.weight_carat ?? 0;
        if (weight < filters.minCarat || weight > filters.maxCarat) return false;
        if (filters.origin !== "Any" && gem.origin !== filters.origin) return false;
        return true;
      });
      setGems(filteredMock);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGems();
  }, [filters]);

  const setFilter = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const PillGroup = ({ options, active, onChange }: { options: string[], active: string, onChange: (v: string) => void }) => (
    <div className="flex flex-wrap gap-3">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(active === opt && opt !== "All" && opt !== "Any" ? (options.includes("All") ? "All" : "Any") : opt)}
          className={`px-5 py-2 rounded-full text-[11px] font-semibold border transition-all ${
            active === opt 
              ? 'border-black bg-white text-black shadow-sm' 
              : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-400'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 py-12 font-sans overflow-hidden">
      
      {/* Page Title & Search Banner */}
      <div className="pb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-black">Browse Gemstones</h1>
          {filters.search && (
            <div className="mt-3 flex items-center gap-3 bg-neutral-100 border border-neutral-300 px-4 py-2 rounded-full w-fit">
              <span className="text-xs font-semibold text-neutral-700">
                Searching for: <strong className="text-black">"{filters.search}"</strong>
              </span>
              <button 
                type="button"
                onClick={() => {
                  setFilter("search", "");
                  router.push("/gems/browse");
                }}
                className="text-xs font-bold text-red-600 hover:text-red-800 uppercase tracking-wider ml-1 pl-2 border-l border-neutral-300"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Filter Container */}
      <div className="bg-white border border-neutral-200 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-10 lg:p-14">
        
        <div className="space-y-10">
          {/* Category */}
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-center gap-6">
            <h3 className="text-[13px] font-bold text-black">Category</h3>
            <PillGroup 
              options={["All", "Loose Stones", "Pairs", "Lot"]} 
              active={filters.categoryGroup} 
              onChange={v => setFilter("categoryGroup", v)} 
            />
          </div>

          {/* Calibration */}
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-center gap-6">
            <h3 className="text-[13px] font-bold text-black">Calibration</h3>
            <PillGroup 
              options={["All", "Calibrated", "Free Style"]} 
              active={filters.calibration} 
              onChange={v => setFilter("calibration", v)} 
            />
          </div>

          {/* Cut */}
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-center gap-6">
            <h3 className="text-[13px] font-bold text-black">Cut</h3>
            <PillGroup 
              options={["All", "Faceted", "Cabochon"]} 
              active={filters.cutType} 
              onChange={v => setFilter("cutType", v)} 
            />
          </div>

          {/* Treatment */}
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-center gap-6">
            <h3 className="text-[13px] font-bold text-black">Treatment</h3>
            <PillGroup 
              options={["All", "Unheated", "Normally Heated"]} 
              active={filters.treatment} 
              onChange={v => setFilter("treatment", v)} 
            />
          </div>

          {/* Gemstone Type */}
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-center gap-6">
            <h3 className="text-[13px] font-bold text-black">Gemstone Type</h3>
            <PillGroup 
              options={["Any", "Sapphire", "Ruby", "Emerald", "Diamond", "Padparadscha", "Spinel", "Cat's Eye"]} 
              active={filters.gemType} 
              onChange={v => setFilter("gemType", v)} 
            />
          </div>

          {/* Shape (Custom Component) */}
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-start gap-6">
            <h3 className="text-[13px] font-bold text-black mt-4">Shape</h3>
            <ShapeSelector selectedShape={filters.shape} onSelect={v => setFilter("shape", v)} />
          </div>

          {/* Color */}
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-center gap-6">
            <h3 className="text-[13px] font-bold text-black">Color</h3>
            <select 
              value={filters.color}
              onChange={e => setFilter("color", e.target.value)}
              className="w-full rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-xs font-semibold text-neutral-700 focus:outline-none focus:border-black appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:10px_10px] bg-[right_1.2rem_center]"
            >
              <option value="Any">Any Color</option>
              <option value="Pink">Pink</option>
              <option value="Blue">Blue</option>
              <option value="Yellow">Yellow</option>
              <option value="Green">Green</option>
              <option value="Red">Red</option>
            </select>
          </div>

          {/* Intensity (Custom Component) */}
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-start gap-6">
            <h3 className="text-[13px] font-bold text-black mt-4">Intensity</h3>
            <IntensitySelector selected={filters.intensity} onSelect={v => setFilter("intensity", v)} />
          </div>

          {/* Clarity */}
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-center gap-6">
            <h3 className="text-[13px] font-bold text-black">Clarity</h3>
            <PillGroup 
              options={["All", "Loop Clean", "Eye Clean", "Included", "Very Slightly Included", "Slightly Included"]} 
              active={filters.clarityType} 
              onChange={v => setFilter("clarityType", v)} 
            />
          </div>

          {/* Birthstone Month */}
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-center gap-6">
            <h3 className="text-[13px] font-bold text-black">Birthstone Month</h3>
            <select 
              value={filters.month}
              onChange={e => setFilter("month", e.target.value)}
              className="w-full rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-xs font-semibold text-neutral-700 focus:outline-none focus:border-black appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:10px_10px] bg-[right_1.2rem_center]"
            >
              <option value="Any">Any Month</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-center gap-6">
            <h3 className="text-[13px] font-bold text-black">Dimensions</h3>
            <div className="flex gap-4 w-full">
              {[
                { label: 'Length', key: 'length' as const },
                { label: 'Width', key: 'width' as const },
                { label: 'Height', key: 'height' as const }
              ].map(dim => (
                <div key={dim.key} className="relative flex-1">
                  <input
                    type="number"
                    step="0.1"
                    placeholder={dim.label}
                    value={filters[dim.key]}
                    onChange={(e) => setFilter(dim.key, e.target.value)}
                    className="w-full rounded-full border border-neutral-200 bg-white pl-5 pr-10 py-2.5 text-xs font-semibold text-neutral-700 focus:outline-none focus:border-black appearance-none placeholder:text-neutral-400 placeholder:font-medium"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400">
                    mm
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Carat (Functional Dual Range Slider) */}
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-center gap-6">
            <h3 className="text-[13px] font-bold text-black">Carat</h3>
            <div className="w-full space-y-1">
              <div className="text-[11px] text-neutral-500 font-bold mb-1">
                {filters.minCarat.toFixed(1)} ct &nbsp;&ndash;&nbsp; {filters.maxCarat.toFixed(1)} ct
              </div>
              <DualRangeSlider 
                min={0} 
                max={20} 
                step={0.5} 
                value={[filters.minCarat, filters.maxCarat]}
                onChange={([min, max]) => {
                  setFilter("minCarat", min);
                  setFilter("maxCarat", max);
                }}
              />
            </div>
          </div>

          {/* Origin */}
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-center gap-6">
            <h3 className="text-[13px] font-bold text-black">Origin</h3>
            <select 
              value={filters.origin}
              onChange={e => setFilter("origin", e.target.value)}
              className="w-full rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-xs font-semibold text-neutral-700 focus:outline-none focus:border-black appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:10px_10px] bg-[right_1.2rem_center]"
            >
              <option value="Any">Any Origin</option>
              <option value="Sri Lanka">Sri Lanka</option>
              <option value="Madagascar">Madagascar</option>
              <option value="Myanmar">Myanmar</option>
            </select>
          </div>

        </div>

        {/* Action Button */}
        <div className="mt-10 flex justify-end">
          <button 
            type="button"
            onClick={() => {
              setFilters({
                search: "",
                categoryGroup: "All",
                calibration: "All",
                cutType: "All",
                treatment: "All",
                gemType: "Any",
                shape: "Any",
                color: "Any",
                intensity: "Any",
                clarityType: "All",
                month: "Any",
                length: "",
                width: "",
                height: "",
                minCarat: 0,
                maxCarat: 20,
                origin: "Any",
              });
              router.push("/gems/browse");
            }}
            className="px-8 py-3 rounded-full bg-[#F5F5F5] hover:bg-neutral-200 transition-colors text-black text-[11px] font-bold uppercase tracking-wide cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="mt-20">
        <h2 className="text-xl font-bold tracking-widest text-[#A98467] mb-10">
          {gems.length < 10 ? `0${gems.length}` : gems.length} Results
        </h2>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#A98467] border-t-transparent" />
          </div>
        ) : gems.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 bg-white rounded-xl">
            <p className="text-gray-500 text-sm font-medium">No gemstones match the selected filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {gems.map((gem) => (
              <GemCard key={gem.id} gem={gem} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default function BrowseGems() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-xs uppercase tracking-widest text-neutral-400">
        Loading Gemstones...
      </div>
    }>
      <BrowseGemsContent />
    </Suspense>
  );
}
