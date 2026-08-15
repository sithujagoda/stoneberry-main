import React from 'react';

const INTENSITIES = [
  { name: "Deep", color: "#D1105A" },
  { name: "Vivid", color: "#E83A7E" },
  { name: "Intense", color: "#F76A9E" },
  { name: "Medium Intense", color: "#F996B8" },
  { name: "Light", color: "#FBC6D9" },
  { name: "Very Light", color: "#FDE6EE" },
];

export default function IntensitySelector({ selected, onSelect }: { selected: string, onSelect: (i: string) => void }) {
  return (
    <div className="flex gap-4 w-full">
      {INTENSITIES.map(intensity => (
        <button
          key={intensity.name}
          type="button"
          onClick={() => onSelect(selected === intensity.name ? "Any" : intensity.name)}
          className={`flex-1 flex flex-col items-center justify-center aspect-square border rounded-xl transition-all ${
            selected === intensity.name 
              ? 'border-black bg-neutral-50 shadow-sm' 
              : 'border-neutral-200 hover:border-neutral-400 bg-white'
          }`}
        >
          <div className="w-10 h-10 mb-2 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke={intensity.color} strokeWidth="1" className="w-8 h-8">
               <polygon points="12 2 22 8.5 12 22 2 8.5 12 2" fill={intensity.color} fillOpacity="0.15" />
               <line x1="12" y1="2" x2="12" y2="22" strokeOpacity="0.5" />
               <line x1="22" y1="8.5" x2="2" y2="8.5" strokeOpacity="0.5" />
            </svg>
          </div>
          <span className="text-[10px] font-semibold text-neutral-600 text-center leading-tight px-1">
            {intensity.name}
          </span>
        </button>
      ))}
    </div>
  );
}
