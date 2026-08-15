"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/components/UserStoreProvider";
import { Bell, CheckCheck, MessageSquare, ShoppingBag, Star, ChevronRight, Filter, AlertCircle, RefreshCw } from "lucide-react";

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  link_url: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const { refreshStore } = useUserStore();
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "SELLING_OFFER" | "BUYING_STATUS" | "NEW_MESSAGE" | "REVIEW_RECEIVED">("all");

  const fetchNotifications = async () => {
    if (status !== "authenticated" || !session?.user?.id) return;
    setLoading(true);
    try {
      const token = (session as any).accessToken;
      const headers = token ? { "Authorization": `Bearer ${token}` } : undefined;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/notifications?limit=100`, { headers });
      const result = await res.json();
      if (result.success && result.data) {
        setNotifications(result.data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotifications();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, session]);

  const handleMarkAsRead = async (notif: NotificationItem, navigate: boolean = true) => {
    if (!notif.is_read && status === "authenticated") {
      try {
        const token = (session as any).accessToken;
        const headers = token ? { "Authorization": `Bearer ${token}` } : undefined;
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/notifications/${notif.id}/read`, {
          method: "POST",
          headers
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        await refreshStore();
      } catch (err) {
        console.error("Failed to mark notification read", err);
      }
    }
    if (navigate && notif.link_url) {
      router.push(notif.link_url);
    }
  };

  const handleMarkAllRead = async () => {
    if (status !== "authenticated") return;
    try {
      const token = (session as any).accessToken;
      const headers = token ? { "Authorization": `Bearer ${token}` } : undefined;
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/notifications/read-all`, {
        method: "POST",
        headers
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      await refreshStore();
    } catch (err) {
      console.error("Failed to mark all read", err);
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !notif.is_read;
    return notif.type === activeFilter;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "SELLING_OFFER":
        return <ShoppingBag className="h-5 w-5 text-emerald-600" />;
      case "BUYING_STATUS":
        return <ShoppingBag className="h-5 w-5 text-blue-600" />;
      case "NEW_MESSAGE":
        return <MessageSquare className="h-5 w-5 text-indigo-600" />;
      case "REVIEW_RECEIVED":
        return <Star className="h-5 w-5 text-amber-500 fill-amber-500" />;
      default:
        return <Bell className="h-5 w-5 text-neutral-600" />;
    }
  };

  const getNotificationBadgeLabel = (type: string) => {
    switch (type) {
      case "SELLING_OFFER":
        return { label: "Selling Offer", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case "BUYING_STATUS":
        return { label: "Order Update", color: "bg-blue-100 text-blue-800 border-blue-200" };
      case "NEW_MESSAGE":
        return { label: "Message", color: "bg-indigo-100 text-indigo-800 border-indigo-200" };
      case "REVIEW_RECEIVED":
        return { label: "Review", color: "bg-amber-100 text-amber-800 border-amber-200" };
      default:
        return { label: "General", color: "bg-neutral-100 text-neutral-800 border-neutral-200" };
    }
  };

  if (status === "unauthenticated") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Sign in Required</h2>
        <p className="text-neutral-600 mb-6">Please log in to view and manage your notifications.</p>
        <button
          onClick={() => router.push("/auth/login")}
          className="bg-black text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-neutral-800 transition-colors shadow-lg"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-md">
                  <Bell className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                    Notification Center
                  </h1>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 mt-2 ml-13">
                Keep track of all your selling offers, order updates, messages, and reviews in one place.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                onClick={() => fetchNotifications()}
                className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="px-4 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <CheckCheck className="h-4 w-4 text-amber-400" />
                  Mark All Read ({unreadCount})
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2 scrollbar-none border-t border-neutral-100 pt-5">
            <Filter className="h-4 w-4 text-neutral-400 shrink-0 mr-1" />
            {[
              { id: "all", label: "All", count: notifications.length },
              { id: "unread", label: "Unread", count: unreadCount },
              { id: "SELLING_OFFER", label: "Selling Offers", count: notifications.filter((n) => n.type === "SELLING_OFFER").length },
              { id: "BUYING_STATUS", label: "Orders & Status", count: notifications.filter((n) => n.type === "BUYING_STATUS").length },
              { id: "NEW_MESSAGE", label: "Messages", count: notifications.filter((n) => n.type === "NEW_MESSAGE").length },
              { id: "REVIEW_RECEIVED", label: "Reviews", count: notifications.filter((n) => n.type === "REVIEW_RECEIVED").length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  activeFilter === tab.id
                    ? "bg-neutral-900 text-white shadow-sm"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80"
                }`}
              >
                {tab.label}
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeFilter === tab.id ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-16 text-center shadow-sm">
            <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm font-bold text-neutral-600">Loading your notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-16 text-center shadow-sm">
            <div className="h-16 w-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
              <Bell className="h-8 w-8 stroke-[1.2]" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-1">No notifications found</h3>
            <p className="text-sm text-neutral-500 max-w-md mx-auto">
              {activeFilter === "unread"
                ? "You're all caught up! There are no unread notifications right now."
                : activeFilter !== "all"
                ? `There are currently no notifications under this category.`
                : "You don't have any notifications yet. When you receive selling offers, order updates, messages, or reviews, they will appear here."}
            </p>
            {activeFilter !== "all" && (
              <button
                onClick={() => setActiveFilter("all")}
                className="mt-6 px-5 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-full text-xs font-bold text-neutral-800 transition-colors"
              >
                View All Notifications
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const badge = getNotificationBadgeLabel(notif.type);
              return (
                <div
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif, true)}
                  className={`group bg-white rounded-2xl border transition-all duration-200 p-5 shadow-sm hover:shadow-md cursor-pointer flex items-start gap-4 ${
                    notif.is_read
                      ? "border-neutral-200/80 hover:border-neutral-300"
                      : "border-amber-400/80 bg-gradient-to-r from-amber-50/40 to-white ring-1 ring-amber-400/20"
                  }`}
                >
                  {/* Icon Box */}
                  <div className={`p-3 rounded-xl shrink-0 ${notif.is_read ? "bg-neutral-100" : "bg-amber-100/80 shadow-inner"}`}>
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Content Box */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        {!notif.is_read && (
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 shadow-sm animate-pulse" title="Unread" />
                        )}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border uppercase tracking-wider ${badge.color}`}>
                          {badge.label}
                        </span>
                        <h4 className="font-bold text-sm text-neutral-900 truncate">
                          {notif.title}
                        </h4>
                      </div>
                      <span className="text-xs font-medium text-neutral-400 shrink-0">
                        {new Date(notif.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                      {notif.message}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-800 group-hover:text-amber-600 transition-colors flex items-center gap-1">
                        Go to {badge.label.toLowerCase()}
                        <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>

                      {!notif.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notif, false);
                          }}
                          className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-700 transition-colors underline"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
