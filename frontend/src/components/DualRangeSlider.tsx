import React, { useState, useEffect, useCallback, useRef } from 'react';

interface DualRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
}

export default function DualRangeSlider({ min, max, value, onChange, step = 1 }: DualRangeSliderProps) {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);
  
  // Sync if parent updates
  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
  }, [value[0], value[1]]);

  const getPercent = useCallback(
    (val: number) => Math.round(((val - min) / (max - min)) * 100),
    [min, max]
  );

  return (
    <div className="relative w-full h-6 flex items-center mt-2">
      <style dangerouslySetInnerHTML={{__html: `
        .multi-range-thumb {
          pointer-events: none;
          position: absolute;
          height: 0;
          width: 100%;
          outline: none;
          z-index: 4;
          -webkit-appearance: none;
          background: transparent;
        }
        .multi-range-thumb::-webkit-slider-thumb {
          pointer-events: all;
          width: 14px;
          height: 14px;
          -webkit-appearance: none;
          background-color: #A98467;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .multi-range-thumb::-moz-range-thumb {
          pointer-events: all;
          width: 14px;
          height: 14px;
          background-color: #A98467;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
      `}} />
      
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={(event) => {
          const val = Math.min(Number(event.target.value), maxVal - step);
          setMinVal(val);
          onChange([val, maxVal]);
        }}
        className="multi-range-thumb"
        style={{ zIndex: minVal > max - 100 ? "5" : "3" }}
      />
      
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={(event) => {
          const val = Math.max(Number(event.target.value), minVal + step);
          setMaxVal(val);
          onChange([minVal, val]);
        }}
        className="multi-range-thumb"
      />

      <div className="relative w-full">
        {/* Dotted Track background */}
        <div className="absolute w-full flex justify-between px-1 top-1/2 -translate-y-1/2 z-0">
          {[...Array(25)].map((_, i) => (
            <div key={i} className="w-[3px] h-[3px] rounded-full bg-neutral-200"></div>
          ))}
        </div>
        
        {/* Active Track (Brownish) */}
        <div
          style={{
            left: `${getPercent(minVal)}%`,
            width: `${getPercent(maxVal) - getPercent(minVal)}%`
          }}
          className="absolute h-1 bg-[#A98467]/30 rounded-full top-1/2 -translate-y-1/2 z-10"
        />
      </div>
    </div>
  );
}
