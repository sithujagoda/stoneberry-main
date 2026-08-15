"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  ShieldCheck,
  Search
} from "lucide-react";

export interface MediaItem {
  url: string;
  label: string;
  type: "image" | "video";
}

export interface GemMediaViewerProps {
  mediaList: MediaItem[];
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  title: string;
}

export default function GemMediaViewer({
  mediaList,
  activeIndex,
  onSelectIndex,
  title
}: GemMediaViewerProps) {
  const currentMedia = mediaList[activeIndex] || mediaList[0] || {
    url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600",
    label: "Sunlight",
    type: "image"
  };

  // --- Main Viewport Loupe (Hover Magnifier) State ---
  const [showLoupe, setShowLoupe] = useState(false);
  const [loupePos, setLoupePos] = useState({ x: 0, y: 0 });
  const imageBoxRef = useRef<HTMLDivElement>(null);

  // --- Zoom & Pan State ---
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // --- Lightbox Modal State ---
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxLoupeActive, setLightboxLoupeActive] = useState(false);
  const [showLightboxLoupe, setShowLightboxLoupe] = useState(false);
  const [lightboxLoupePos, setLightboxLoupePos] = useState({ x: 0, y: 0 });
  const lightboxImgRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when Lightbox modal is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  // Reset states when switching media items
  useEffect(() => {
    setZoomLevel(1);
    setPanPos({ x: 0, y: 0 });
    setShowLoupe(false);
    setShowLightboxLoupe(false);
  }, [activeIndex]);

  // Handle keyboard events for Lightbox modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft" && mediaList.length > 1) {
        onSelectIndex((activeIndex - 1 + mediaList.length) % mediaList.length);
      } else if (e.key === "ArrowRight" && mediaList.length > 1) {
        onSelectIndex((activeIndex + 1) % mediaList.length);
      }
    },
    [isLightboxOpen, activeIndex, mediaList.length, onSelectIndex]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // --- Main Viewport Loupe Move Handler ---
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel > 1 || currentMedia.type === "video" || isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setLoupePos({ x, y });
      if (!showLoupe) setShowLoupe(true);
    } else {
      setShowLoupe(false);
    }
  };

  const handleMouseLeave = () => {
    setShowLoupe(false);
    setIsDragging(false);
  };

  // --- Lightbox Loupe Move Handler ---
  const handleLightboxMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!lightboxLoupeActive || currentMedia.type === "video") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setLightboxLoupePos({ x, y });
      if (!showLightboxLoupe) setShowLightboxLoupe(true);
    } else {
      setShowLightboxLoupe(false);
    }
  };

  const handleLightboxMouseLeave = () => {
    setShowLightboxLoupe(false);
  };

  // --- Zoom In / Out Handlers ---
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
    setShowLoupe(false);
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanPos({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPos({ x: 0, y: 0 });
  };

  // --- Panning Drag Handlers ---
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: panPos.x,
      panY: panPos.y
    };
  };

  const handlePanMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || zoomLevel <= 1) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanPos({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Calculate loupe background positioning for main viewport
  const getLoupeBackgroundStyle = () => {
    if (!imageBoxRef.current) return {};
    const { width, height } = imageBoxRef.current.getBoundingClientRect();
    const loupeDiameter = 144; // w-36 = 144px
    const zoomFactor = 2.5;

    const relX = width > 0 ? loupePos.x / width : 0.5;
    const relY = height > 0 ? loupePos.y / height : 0.5;

    return {
      backgroundImage: `url(${currentMedia.url})`,
      backgroundSize: `${width * zoomFactor}px ${height * zoomFactor}px`,
      backgroundPosition: `${relX * 100}% ${relY * 100}%`,
      left: `${loupePos.x - loupeDiameter / 2}px`,
      top: `${loupePos.y - loupeDiameter / 2}px`
    };
  };

  // Calculate loupe background positioning for Lightbox viewport
  const getLightboxLoupeBackgroundStyle = () => {
    if (!lightboxImgRef.current) return {};
    const { width, height } = lightboxImgRef.current.getBoundingClientRect();
    const loupeDiameter = 192; // w-48 = 192px
    const zoomFactor = 2.8;

    const relX = width > 0 ? lightboxLoupePos.x / width : 0.5;
    const relY = height > 0 ? lightboxLoupePos.y / height : 0.5;

    return {
      backgroundImage: `url(${currentMedia.url})`,
      backgroundSize: `${width * zoomFactor}px ${height * zoomFactor}px`,
      backgroundPosition: `${relX * 100}% ${relY * 100}%`,
      left: `${lightboxLoupePos.x - loupeDiameter / 2}px`,
      top: `${lightboxLoupePos.y - loupeDiameter / 2}px`
    };
  };

  const lightboxContent = isLightboxOpen && mounted ? (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-lg flex flex-col items-center justify-center animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-[10001]">
        <div className="flex items-center gap-4">
          <span className="text-white font-bold text-sm tracking-wide">{title}</span>
          <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-widest">
            {currentMedia.label}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {currentMedia.type === "image" && (
            <button
              type="button"
              onClick={() => setLightboxLoupeActive(!lightboxLoupeActive)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs tracking-wide transition-all border ${
                lightboxLoupeActive
                  ? "bg-[#B87A5B] text-white border-[#B87A5B] shadow-lg scale-105"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/20"
              }`}
              title="Toggle Jeweler's Loupe in Fullscreen"
            >
              <Search className="w-3.5 h-3.5" />
              {lightboxLoupeActive ? "Loupe Active (2.8x)" : "Jeweler's Loupe"}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close Fullscreen (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Left Arrow */}
      {mediaList.length > 1 && (
        <button
          type="button"
          onClick={() =>
            onSelectIndex((activeIndex - 1 + mediaList.length) % mediaList.length)
          }
          className="absolute left-6 z-[10001] p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Previous Item (Left Arrow)"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
      )}

      {/* Right Arrow */}
      {mediaList.length > 1 && (
        <button
          type="button"
          onClick={() => onSelectIndex((activeIndex + 1) % mediaList.length)}
          className="absolute right-6 z-[10001] p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Next Item (Right Arrow)"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      )}

      {/* Full Viewport Media Content */}
      <div className="relative w-full h-[76vh] max-w-5xl flex items-center justify-center px-12">
        {currentMedia.type === "video" ? (
          <video
            src={currentMedia.url}
            controls
            autoPlay
            loop
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
          />
        ) : (
          <div
            ref={lightboxImgRef}
            onMouseMove={handleLightboxMouseMove}
            onMouseLeave={handleLightboxMouseLeave}
            className={`relative w-full max-w-[80vw] h-full flex items-center justify-center ${
              lightboxLoupeActive ? "cursor-crosshair" : "cursor-default"
            }`}
          >
            {/* Circular Loupe inside Lightbox */}
            {showLightboxLoupe && lightboxLoupeActive && (
              <div
                style={getLightboxLoupeBackgroundStyle()}
                className="absolute w-48 h-48 rounded-full border-[3px] border-white shadow-[0_25px_60px_rgba(0,0,0,0.7)] pointer-events-none z-[10002] bg-no-repeat overflow-hidden transition-opacity duration-150 animate-in fade-in"
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <div className="w-2 h-2 rounded-full bg-white border border-black/40" />
                </div>
                <div className="absolute inset-0 rounded-full border border-black/20 pointer-events-none" />
              </div>
            )}

            <Image
              src={currentMedia.url}
              alt={title}
              fill
              priority
              className="object-contain pointer-events-none select-none"
            />
          </div>
        )}
      </div>

      {/* Bottom Thumbnails inside Lightbox */}
      {mediaList.length > 1 && (
        <div className="absolute bottom-6 flex items-center gap-3 bg-black/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 z-[10001]">
          {mediaList.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelectIndex(idx)}
              className={`w-14 h-14 rounded-xl overflow-hidden relative transition-all ${
                activeIndex === idx
                  ? "ring-2 ring-white scale-105 opacity-100"
                  : "opacity-40 hover:opacity-80"
              }`}
            >
              {item.type === "video" ? (
                <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-white text-white" />
                </div>
              ) : (
                <Image src={item.url} alt={item.label} fill className="object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  ) : null;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Outer Card Container */}
      <div className="rounded-[24px] bg-[#F9F8F6] p-6 sm:p-8 relative flex flex-col w-full min-h-[520px] lg:min-h-[620px] items-center justify-between select-none border border-neutral-200/60 shadow-sm">
        
        {/* Tier 1: Dedicated Header Navigation & Controls Row (in normal flow, never overlaps image) */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-200/50 z-20">
          {/* Left: Sunlight & Studio Pill Toggle */}
          <div className="flex items-center">
            {(() => {
              const topToggleItems = mediaList
                .map((item, idx) => ({ item, idx }))
                .filter(
                  ({ item }) =>
                    item.label.toLowerCase() === "sunlight" ||
                    item.label.toLowerCase() === "studio"
                );

              if (topToggleItems.length === 0) return null;

              return (
                <div className="flex items-center bg-neutral-200/70 p-1 rounded-full border border-neutral-300/60 shadow-inner">
                  {topToggleItems.map(({ item, idx }) => {
                    const isActive = activeIndex === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => onSelectIndex(idx)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                          isActive
                            ? "bg-black text-white shadow-sm"
                            : "text-neutral-600 hover:text-black hover:bg-white/50"
                        }`}
                      >
                        {item.type === "video" && <Play className="w-3 h-3 fill-current" />}
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Right: Zoom & Fullscreen Controls Bar */}
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md rounded-full p-1 shadow-sm border border-neutral-200/80 ml-auto">
            {currentMedia.type === "image" && (
              <>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 1}
                  className="p-1.5 rounded-full hover:bg-black/5 disabled:opacity-30 transition-colors text-black"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-2 py-1 text-[11px] font-bold text-black hover:bg-black/5 rounded-full transition-colors"
                  title="Reset Zoom"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>

                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                  className="p-1.5 rounded-full hover:bg-black/5 disabled:opacity-30 transition-colors text-black"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-3.5 bg-neutral-300 mx-0.5" />
              </>
            )}

            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="p-1.5 rounded-full hover:bg-black/5 transition-colors text-black"
              title="Expand Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tier 2: Completely Unobstructed Main Image or Video Viewport */}
        <div
          ref={imageBoxRef}
          onMouseMove={(e) => {
            handleMouseMove(e);
            handlePanMove(e);
          }}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className={`relative w-full max-w-[480px] aspect-square z-10 flex items-center justify-center my-4 ${
            zoomLevel > 1
              ? isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
              : currentMedia.type === "image"
              ? "cursor-crosshair"
              : "cursor-default"
          }`}
        >
          {currentMedia.type === "video" ? (
            <video
              src={currentMedia.url}
              controls
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain rounded-2xl drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
            />
          ) : (
            <>
              {/* Circular Jeweler's Loupe Lens overlay (strictly inside image wrapper) */}
              {showLoupe && zoomLevel === 1 && (
                <div
                  style={getLoupeBackgroundStyle()}
                  className="absolute w-36 h-36 rounded-full border-[3px] border-white shadow-[0_15px_35px_rgba(0,0,0,0.35)] pointer-events-none z-30 bg-no-repeat overflow-hidden transition-opacity duration-150 animate-in fade-in"
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <div className="w-1.5 h-1.5 rounded-full bg-white border border-black/40" />
                  </div>
                  <div className="absolute inset-0 rounded-full border border-black/10 pointer-events-none" />
                </div>
              )}

              <div
                style={{
                  transform: `scale(${zoomLevel}) translate(${panPos.x / zoomLevel}px, ${
                    panPos.y / zoomLevel
                  }px)`,
                  transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)"
                }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <Image
                  src={currentMedia.url}
                  alt={title}
                  fill
                  priority
                  sizes="(max-w-800px) 100vw, 600px"
                  className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] select-none pointer-events-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Tier 3: Bottom Status Row (in normal flow, never overlays image) */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-200/50 z-20">
          <div>
            {currentMedia.type === "image" && zoomLevel === 1 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3.5 py-1.5 text-[10px] font-semibold text-white tracking-wide">
                <Search className="w-3 h-3 text-[#B87A5B]" /> Hover image to magnify with Jeweler&apos;s Loupe
              </span>
            )}
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[10px] font-bold text-black uppercase tracking-widest shadow-sm border border-neutral-200">
            <ShieldCheck className="w-3.5 h-3.5 text-green-700" /> No eye-visible inclusions
          </span>
        </div>
      </div>

      {/* Render Lightbox inside React Portal directly to document.body */}
      {mounted && createPortal(lightboxContent, document.body)}
    </div>
  );
}
