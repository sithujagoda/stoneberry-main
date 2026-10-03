import React from 'react';

const SHAPES = [
  "Brilliant Cut", "Pentagon Cut", "Pyramid Cut", "Hexagon Cut", "Trillion Cut", "Shield Cut",
  "Emerald Cut", "Round Step Cut", "Kite Cut", "Asscher Cut", "Heart Cut", "Circular Step Cut",
  "Oval Cut", "Baguette Cut", "Lozenge Cut", "Marquise Cut", "Cushion Cut", "Octagon Cut",
  "Trillion Rose Cut", "Radiant Cut"
];

const getShapeIcon = (shape: string) => {
  const s = shape.trim();
  if (s === "Brilliant Cut") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10">
        <polygon points="12 22 2 8 22 8" />
        <polygon points="6 3 18 3 22 8 2 8" />
        <polyline points="7 3 12 8 17 3" />
        <line x1="12" y1="8" x2="12" y2="22" />
        <line x1="7" y1="8" x2="12" y2="22" />
        <line x1="17" y1="8" x2="12" y2="22" />
      </svg>
    );
  }
  if (s === "Pentagon Cut") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10">
        <polygon points="12 2 20 8 17 21 7 21 4 8" />
        <polygon points="12 5 17 9 15 18 9 18 7 9" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="20" y1="8" x2="17" y2="9" />
        <line x1="17" y1="21" x2="15" y2="18" />
        <line x1="7" y1="21" x2="9" y2="18" />
        <line x1="4" y1="8" x2="7" y2="9" />
      </svg>
    );
  }
  if (s === "Pyramid Cut") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10">
        <polygon points="12 2 22 18 2 18" />
        <polygon points="12 6 18 15 6 15" />
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="22" y1="18" x2="18" y2="15" />
        <line x1="2" y1="18" x2="6" y2="15" />
        <line x1="12" y1="15" x2="12" y2="18" />
        <line x1="6" y1="15" x2="12" y2="6" />
        <line x1="18" y1="15" x2="12" y2="6" />
      </svg>
    );
  }
  if (s === "Hexagon Cut") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10">
        <polygon points="12 2 21 7 21 17 12 22 3 17 3 7" />
        <polygon points="12 6 17 9 17 15 12 18 7 15 7 9" />
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="21" y1="7" x2="17" y2="9" />
        <line x1="21" y1="17" x2="17" y2="15" />
        <line x1="12" y1="22" x2="12" y2="18" />
        <line x1="3" y1="17" x2="7" y2="15" />
        <line x1="3" y1="7" x2="7" y2="9" />
      </svg>
    );
  }
  if (s === "Trillion Cut") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10">
        <polygon points="12 2 14 2 22 16 20 20 4 20 2 16 10 2" />
        <polygon points="12 6 17 16 7 16" />
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="20" y1="20" x2="17" y2="16" />
        <line x1="4" y1="20" x2="7" y2="16" />
        <line x1="22" y1="16" x2="17" y2="16" />
        <line x1="2" y1="16" x2="7" y2="16" />
      </svg>
    );
  }
  if (s === "Shield Cut") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10">
        <polygon points="12 2 21 6 18 15 12 22 6 15 3 6" />
        <polygon points="12 6 17 9 15 14 12 18 9 14 7 9" />
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="21" y1="6" x2="17" y2="9" />
        <line x1="18" y1="15" x2="15" y2="14" />
        <line x1="12" y1="22" x2="12" y2="18" />
        <line x1="6" y1="15" x2="9" y2="14" />
        <line x1="3" y1="6" x2="7" y2="9" />
        <line x1="12" y1="22" x2="12" y2="2" />
      </svg>
    );
  }
  if (shape === "Emerald Cut") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10">
        <polygon points="7 2 17 2 21 6 21 18 17 22 7 22 3 18 3 6" />
        <polygon points="9 5 15 5 18 8 18 16 15 19 9 19 6 16 6 8" />
        <line x1="7" y1="2" x2="9" y2="5" />
        <line x1="17" y1="2" x2="15" y2="5" />
        <line x1="21" y1="6" x2="18" y2="8" />
        <line x1="21" y1="18" x2="18" y2="16" />
        <line x1="17" y1="22" x2="15" y2="19" />
        <line x1="7" y1="22" x2="9" y2="19" />
        <line x1="3" y1="18" x2="6" y2="16" />
        <line x1="3" y1="6" x2="6" y2="8" />
      </svg>
    );
  }

  if (s === "Round Step Cut") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10">
        <circle cx="12" cy="12" r="10" />
        <polygon points="9 5 15 5 19 9 19 15 15 19 9 19 5 15 5 9" />
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="8" />
        <line x1="12" y1="22" x2="12" y2="16" />
        <line x1="2" y1="12" x2="8" y2="12" />
        <line x1="22" y1="12" x2="16" y2="12" />
        <line x1="5" y1="5" x2="9" y2="9" />
        <line x1="19" y1="19" x2="15" y2="15" />
        <line x1="19" y1="5" x2="15" y2="9" />
        <line x1="5" y1="19" x2="9" y2="15" />
      </svg>
    );
  }
  if (s === "Kite Cut") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10">
        <polygon points="12 2 20 9 12 22 4 9" />
        <polygon points="12 6 16 10 12 17 8 10" />
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="8" y1="10" x2="16" y2="10" />
      </svg>
    );
  }
  if (s === "Asscher Cut") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10">
        <polygon points="7 3 17 3 21 7 21 17 17 21 7 21 3 17 3 7" />
        <polygon points="9 6 15 6 18 9 18 15 15 18 9 18 6 15 6 9" />
        <rect x="10" y="10" width="4" height="4" />
        <line x1="7" y1="3" x2="10" y2="10" />
        <line x1="17" y1="3" x2="14" y2="10" />
        <line x1="21" y1="7" x2="14" y2="10" />
        <line x1="21" y1="17" x2="14" y2="14" />
        <line x1="17" y1="21" x2="14" y2="14" />
        <line x1="7" y1="21" x2="10" y2="14" />
        <line x1="3" y1="17" x2="10" y2="14" />
        <line x1="3" y1="7" x2="10" y2="10" />
      </svg>
    );
  }
  if (s === "Heart Cut") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10">
        <path d="M12 21.5l-1.45-1.3C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.5z" />
        <path d="M12 17l-1-1C6 11 4 9 4 7c0-1.5 1.5-3 3-3 1 0 2 .5 2.5 1L12 7l2.5-2c.5-.5 1.5-1 2.5-1 1.5 0 3 1.5 3 3 0 2-2 4-7 9l-1 1z" />
        <line x1="12" y1="7" x2="12" y2="17" />
        <polyline points="4 7 8 11 12 12 16 11 20 7" />
        <line x1="7.5" y1="3" x2="8" y2="11" />
        <line x1="16.5" y1="3" x2="16" y2="11" />
      </svg>
    );
  }
  if (s === "Circular Step Cut") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
        <line x1="4.9" y1="4.9" x2="7.1" y2="7.1" />
        <line x1="19.1" y1="19.1" x2="16.9" y2="16.9" />
        <line x1="19.1" y1="4.9" x2="16.9" y2="7.1" />
        <line x1="4.9" y1="19.1" x2="7.1" y2="16.9" />
      </svg>
    );
  }
  if (s === "Oval Cut") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10">
        <rect x="5" y="2" width="14" height="20" rx="7" />
        <rect x="8" y="5" width="8" height="14" rx="4" />
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="5" y1="12" x2="19" y2="12" />
        <line x1="8" y1="5" x2="12" y2="12" />
        <line x1="16" y1="5" x2="12" y2="12" />
        <line x1="8" y1="19" x2="12" y2="12" />
        <line x1="16" y1="19" x2="12" y2="12" />
      </svg>
    );
  }
  if (s === "Baguette Cut") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10">
        <polygon points="6 2 18 2 18 22 6 22" />
        <polygon points="8 4 16 4 16 20 8 20" />
        <polygon points="10 7 14 7 14 17 10 17" />
        <line x1="6" y1="2" x2="10" y2="7" />
        <line x1="18" y1="2" x2="14" y2="7" />
        <line x1="18" y1="22" x2="14" y2="17" />
        <line x1="6" y1="22" x2="10" y2="17" />
      </svg>
    );
  }
  if (s === "Lozenge Cut") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10">
        <polygon points="12 2 22 12 12 22 2 12" />
        <polygon points="12 6 18 12 12 18 6 12" />
        <polygon points="12 9 15 12 12 15 9 12" />
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
      </svg>
    );
  }
  if (s === "Marquise Cut") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10">
        <polygon points="12 22 3 9 21 9" />
        <polygon points="7 4 17 4 21 9 3 9" />
        <line x1="12" y1="4" x2="12" y2="22" />
        <line x1="7" y1="4" x2="12" y2="9" />
        <line x1="17" y1="4" x2="12" y2="9" />
        <line x1="7" y1="9" x2="12" y2="22" />
        <line x1="17" y1="9" x2="12" y2="22" />
      </svg>
    );
  }
  if (s === "Cushion Cut") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10">
        <path d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5z" />
        <polygon points="8 7 16 7 17 16 7 16" />
        <circle cx="12" cy="11.5" r="3" />
        <line x1="8" y1="3" x2="8" y2="7" />
        <line x1="16" y1="3" x2="16" y2="7" />
        <line x1="21" y1="8" x2="17" y2="16" />
        <line x1="3" y1="8" x2="7" y2="16" />
        <line x1="8" y1="21" x2="7" y2="16" />
        <line x1="16" y1="21" x2="17" y2="16" />
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="3" y1="11.5" x2="21" y2="11.5" />
      </svg>
    );
  }
  if (s === "Octagon Cut") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10">
        <polygon points="8 2 16 2 21 7 21 17 16 22 8 22 3 17 3 7" />
        <polygon points="10 5 14 5 17 8 17 16 14 19 10 19 7 16 7 8" />
        <rect x="11" y="9" width="2" height="6" />
        <line x1="8" y1="2" x2="10" y2="5" />
        <line x1="16" y1="2" x2="14" y2="5" />
        <line x1="21" y1="7" x2="17" y2="8" />
        <line x1="21" y1="17" x2="17" y2="16" />
        <line x1="16" y1="22" x2="14" y2="19" />
        <line x1="8" y1="22" x2="10" y2="19" />
        <line x1="3" y1="17" x2="7" y2="16" />
        <line x1="3" y1="7" x2="7" y2="8" />
      </svg>
    );
  }
  if (s === "Trillion Rose Cut") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10">
        <path d="M12 2 C 20 2 22 18 22 18 C 22 18 12 22 2 18 C 2 18 4 2 12 2 Z" />
        <polygon points="12 6 18 16 6 16" />
        <polygon points="12 11 15 16 9 16" />
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="22" y1="18" x2="18" y2="16" />
        <line x1="2" y1="18" x2="6" y2="16" />
      </svg>
    );
  }
  if (s === "Radiant Cut") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10">
        <path d="M12 2 C 12 2 21 11 21 16 C 21 21 17 22 12 22 C 7 22 3 21 3 16 C 3 11 12 2 12 2 Z" />
        <path d="M12 6 C 12 6 17 12 17 16 C 17 19 14 19.5 12 19.5 C 10 19.5 7 19 7 16 C 7 12 12 6 12 6 Z" />
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="3" y1="16" x2="21" y2="16" />
        <line x1="7" y1="12" x2="17" y2="12" />
      </svg>
    );
  }

  // Fallback
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10">
      <polygon points="12 2 22 8.5 12 22 2 8.5 12 2" />
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="22" y1="8.5" x2="2" y2="8.5" />
    </svg>
  );
};

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
          <div className="w-12 h-12 mb-3 relative text-[#A98467] opacity-60 flex items-center justify-center">
            {getShapeIcon(shape)}
          </div>
          <span className="text-[11px] font-semibold text-neutral-700 text-center leading-tight px-1">
            {shape.trim()}
          </span>
        </button>
      ))}
    </div>
  );
}
