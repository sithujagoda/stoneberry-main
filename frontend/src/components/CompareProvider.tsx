"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Gem } from "./GemCard";

export interface ViewHistoryEntry {
  gem: Gem;
  dwellSeconds: number;
  lastViewedAt: number;
}

interface CompareContextType {
  compareItems: Gem[];
  toggleCompare: (gem: Gem) => void;
  removeFromCompare: (gemId: number) => void;
  clearCompare: () => void;
  isInCompare: (gemId: number) => boolean;
  // Dwell Tracker & Suggestion State
  recordView: (gem: Gem, dwellSeconds: number) => void;
  suggestedPair: { gemA: Gem; gemB: Gem } | null;
  acceptSuggestion: () => void;
  dismissSuggestion: () => void;
  hasDismissedSuggestion: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const STORAGE_KEY = "gem_compare_storage";
const HISTORY_STORAGE_KEY = "gem_view_history";
const DISMISSED_STORAGE_KEY = "gem_compare_prompt_dismissed";
const MAX_COMPARE_ITEMS = 4;

export function CompareProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [compareItems, setCompareItems] = useState<Gem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Dwell tracker states
  const [viewHistory, setViewHistory] = useState<{ [id: number]: ViewHistoryEntry }>({});
  const [suggestedPair, setSuggestedPair] = useState<{ gemA: Gem; gemB: Gem } | null>(null);
  const [hasDismissedSuggestion, setHasDismissedSuggestion] = useState<boolean>(false);

  // Load state from localStorage on client mount
  useEffect(() => {
    try {
      // 1. Compare items
      const storedCompare = localStorage.getItem(STORAGE_KEY);
      if (storedCompare) {
        const parsed = JSON.parse(storedCompare);
        if (Array.isArray(parsed)) {
          setCompareItems(parsed.slice(0, MAX_COMPARE_ITEMS));
        }
      }

      // 2. View history
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        const parsedHist = JSON.parse(storedHistory);
        if (parsedHist && typeof parsedHist === "object") {
          setViewHistory(parsedHist);
        }
      }

      // 3. Dismissed prompt flag
      const storedDismissed = localStorage.getItem(DISMISSED_STORAGE_KEY);
      if (storedDismissed === "true") {
        setHasDismissedSuggestion(true);
      }
    } catch (err) {
      console.error("Failed to load compare storage from localStorage", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save compareItems to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareItems));
    } catch (err) {
      console.error("Failed to save compare items to localStorage", err);
    }
  }, [compareItems, isLoaded]);

  const toggleCompare = useCallback((gem: Gem) => {
    setCompareItems((prev) => {
      const exists = prev.some((item) => item.id === gem.id);
      if (exists) {
        return prev.filter((item) => item.id !== gem.id);
      } else {
        if (prev.length >= MAX_COMPARE_ITEMS) {
          alert(`You can compare a maximum of ${MAX_COMPARE_ITEMS} gemstones at a time.`);
          return prev;
        }
        return [...prev, gem];
      }
    });
  }, []);

  const removeFromCompare = useCallback((gemId: number) => {
    setCompareItems((prev) => prev.filter((item) => item.id !== gemId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareItems([]);
  }, []);

  const isInCompare = useCallback(
    (gemId: number) => {
      return compareItems.some((item) => item.id === gemId);
    },
    [compareItems]
  );

  // --- Dwell Tracker & Suggestion Logic ---
  const recordView = useCallback(
    (gem: Gem, dwellSeconds: number) => {
      if (!isLoaded) return;

      setViewHistory((prevHist) => {
        const currentEntry = prevHist[gem.id] || {
          gem,
          dwellSeconds: 0,
          lastViewedAt: Date.now()
        };

        // Take max of accumulated seconds for this session/gem
        const updatedDwell = Math.max(currentEntry.dwellSeconds, dwellSeconds);
        const updatedHistory = {
          ...prevHist,
          [gem.id]: {
            gem,
            dwellSeconds: updatedDwell,
            lastViewedAt: Date.now()
          }
        };

        try {
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
        } catch (e) {
          console.error("Failed to save view history", e);
        }

        // Check if we should trigger a comparison suggestion
        if (!hasDismissedSuggestion && !suggestedPair && !isInCompare(gem.id)) {
          // Current gem (Gem B) viewed for at least 12 seconds
          if (updatedDwell >= 12) {
            // Scan for any prior gem (Gem A) viewed for at least 20 seconds
            const candidate = Object.values(updatedHistory).find(
              (entry) =>
                entry.gem.id !== gem.id &&
                entry.dwellSeconds >= 20 &&
                !isInCompare(entry.gem.id)
            );

            if (candidate) {
              setSuggestedPair({ gemA: candidate.gem, gemB: gem });
            }
          }
        }

        return updatedHistory;
      });
    },
    [isLoaded, hasDismissedSuggestion, suggestedPair, isInCompare]
  );

  const acceptSuggestion = useCallback(() => {
    if (!suggestedPair) return;
    const { gemA, gemB } = suggestedPair;

    setCompareItems((prev) => {
      let next = [...prev];
      if (!next.some((g) => g.id === gemA.id) && next.length < MAX_COMPARE_ITEMS) {
        next.push(gemA);
      }
      if (!next.some((g) => g.id === gemB.id) && next.length < MAX_COMPARE_ITEMS) {
        next.push(gemB);
      }
      return next;
    });

    setSuggestedPair(null);
    router.push("/compare");
  }, [suggestedPair, router]);

  const dismissSuggestion = useCallback(() => {
    setSuggestedPair(null);
    setHasDismissedSuggestion(true);
    try {
      localStorage.setItem(DISMISSED_STORAGE_KEY, "true");
    } catch (e) {
      console.error("Failed to save dismissal state", e);
    }
  }, []);

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        toggleCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        recordView,
        suggestedPair,
        acceptSuggestion,
        dismissSuggestion,
        hasDismissedSuggestion
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
