"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Heart, ShoppingBag, User, MessageSquare, X, Bell, CheckCheck, ChevronRight } from "lucide-react";
import { useUserStore } from "./UserStoreProvider";

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  link_url: string;
  is_read: boolean;
  created_at: string;
}

export function HeaderIcons() {
  const { cartCount, favoritesCount, unreadMessagesCount, unreadOrdersCount, unreadNotificationsCount, refreshStore } = useUserStore();
  const { data: session, status } = useSession();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchRecentNotifications = async () => {
    if (status !== "authenticated" || !session?.user?.id) return;
    setLoadingNotifications(true);
    try {
      const token = (session as any).accessToken;
      const headers = token ? { "Authorization": `Bearer ${token}` } : undefined;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/notifications?limit=6`, { headers });
      const result = await res.json();
      if (result.success && result.data) {
        setRecentNotifications(result.data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch recent notifications", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleToggleNotifications = () => {
    if (!showNotifications) {
      fetchRecentNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    setShowNotifications(false);
    if (!notif.is_read && status === "authenticated") {
      try {
        const token = (session as any).accessToken;
        const headers = token ? { "Authorization": `Bearer ${token}` } : undefined;
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/notifications/${notif.id}/read`, {
          method: "POST",
          headers
        });
        await refreshStore();
      } catch (err) {
        console.error("Failed to mark notification read", err);
      }
    }
    router.push(notif.link_url || "/notifications");
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status !== "authenticated") return;
    try {
      const token = (session as any).accessToken;
      const headers = token ? { "Authorization": `Bearer ${token}` } : undefined;
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/notifications/read-all`, {
        method: "POST",
        headers
      });
      setRecentNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      await refreshStore();
    } catch (err) {
      console.error("Failed to mark all notifications read", err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/gems/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
    } else {
      router.push(`/gems/browse`);
      setShowSearch(false);
    }
  };

  return (
    <div className="flex items-center gap-4 text-gray-500">
      {/* Interactive Search Bar */}
      <div className="relative flex items-center">
        {showSearch ? (
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-white border border-black rounded-full px-3 py-1.5 shadow-md transition-all duration-300 animate-in fade-in"
          >
            <input
              type="text"
              placeholder="Search gems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-36 sm:w-48 text-xs font-semibold text-black focus:outline-none bg-transparent placeholder:text-neutral-400"
            />
            <button type="submit" className="text-black hover:opacity-75 mr-1" title="Search">
              <Search className="h-3.5 w-3.5 stroke-[2]" />
            </button>
            <button
              type="button"
              onClick={() => setShowSearch(false)}
              className="text-neutral-400 hover:text-black text-xs font-bold pl-1.5 border-l border-neutral-200"
              title="Close"
            >
              <X className="h-3.5 w-3.5 stroke-[2]" />
            </button>
          </form>
        ) : (
          <button 
            type="button"
            onClick={() => setShowSearch(true)} 
            className="hover:text-black transition-colors flex items-center"
            title="Search Gemstones"
          >
            <Search className="h-[18px] w-[18px] stroke-[1.8]" />
          </button>
        )}
      </div>
      
      <Link href="/favorites" className="hover:text-black transition-colors relative flex items-center" title="Favorites">
        <Heart className="h-[18px] w-[18px] stroke-[1.8]" />
        {favoritesCount > 0 && (
          <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {favoritesCount}
          </span>
        )}
      </Link>
      
      <Link href="/cart" className="hover:text-black transition-colors relative flex items-center" title="Cart">
        <ShoppingBag className="h-[18px] w-[18px] stroke-[1.8]" />
        {cartCount > 0 && (
          <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
            {cartCount}
          </span>
        )}
      </Link>
      
      <Link href="/profile" className="hover:text-black transition-colors relative flex items-center" title="Profile & Orders">
        <User className="h-[18px] w-[18px] stroke-[1.8]" />
        {unreadOrdersCount > 0 && (
          <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unreadOrdersCount}
          </span>
        )}
      </Link>
      
      <Link href="/messages" className="hover:text-black transition-colors relative flex items-center" title="Messages">
        <MessageSquare className="h-[18px] w-[18px] stroke-[1.8]" />
        {unreadMessagesCount > 0 && (
          <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unreadMessagesCount}
          </span>
        )}
      </Link>

      {/* Notifications Popover Dropdown */}
      <div className="relative flex items-center" ref={dropdownRef}>
        <button
          type="button"
          onClick={handleToggleNotifications}
          className={`hover:text-black transition-colors relative flex items-center ${showNotifications ? "text-black" : ""}`}
          title="Notifications"
        >
          <Bell className="h-[18px] w-[18px] stroke-[1.8]" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white animate-pulse">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 top-8 w-80 sm:w-96 bg-white border border-neutral-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 text-white">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider">Notifications</h3>
              </div>
              {unreadNotificationsCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-neutral-300 hover:text-white flex items-center gap-1 font-medium transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5 text-amber-400" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
              {loadingNotifications ? (
                <div className="py-8 text-center text-xs text-neutral-400 font-medium">
                  Loading notifications...
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center justify-center text-neutral-400">
                  <Bell className="h-8 w-8 stroke-[1] mb-2 text-neutral-300" />
                  <p className="text-xs font-semibold text-neutral-600">No notifications yet</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">We'll alert you when updates happen!</p>
                </div>
              ) : (
                recentNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                      notif.is_read ? "bg-white hover:bg-neutral-50" : "bg-amber-50/60 hover:bg-amber-100/50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        )}
                        <span className="font-bold text-xs text-neutral-900 truncate">
                          {notif.title}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-neutral-400 font-medium mt-1.5 inline-block">
                        {new Date(notif.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-300 shrink-0 mt-1" />
                  </div>
                ))
              )}
            </div>

            <div className="bg-neutral-50 border-t border-neutral-100 p-2 text-center">
              <Link
                href="/notifications"
                onClick={() => setShowNotifications(false)}
                className="text-xs font-bold text-neutral-900 hover:text-amber-600 transition-colors inline-flex items-center gap-1 py-1 px-3"
              >
                View All Notifications
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
