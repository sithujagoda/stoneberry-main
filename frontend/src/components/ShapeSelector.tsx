import React from 'react';

const SHAPES = [
  "Brilliant Cut", "Pentagon Cut", "Pyramid Cut", "Hexagon Cut", "Trillion Cut", "Shield Cut",
  "Emerald Cut", "Round Step Cut", "Kite Cut", "Asscher Cut", "Heart Cut", "Circular Step Cut",
  "Oval Cut", "Baguette Cut", "Lozenge Cut", "Marquise Cut", "Cushion Cut", "Octagon Cut",
  "Trillion Rose Cut", "Radiant Cut", "Emerald Cut "
];

export default function ShapeSelector({ selectedShape, onSelect }: { selectedShape: string, onSelect: (s: string) => void }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 w-full">
      {SHAPES.map(shape => (
        <button
          key={shape}
          type="button"
          onClick={() => onSelect(selectedShape === shape.trim() ? "Any" : shape.trim())}
          className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all h-28 ${
            selectedShape === shape.trim() 
              ? 'border-[#B87A5B] bg-[#B87A5B]/5 shadow-sm' 
              : 'border-neutral-200 hover:border-neutral-400 bg-white'
          }`}
        >
          {/* Placeholder for the user's gem images */}
          <div className="w-12 h-12 mb-3 relative text-[#A98467] opacity-60 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10">
              <polygon points="12 2 22 8.5 12 22 2 8.5 12 2" />
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="22" y1="8.5" x2="2" y2="8.5" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-neutral-700 text-center leading-tight px-1">
            {shape.trim()}
          </span>
        </button>
      ))}
    </div>
  );
}
