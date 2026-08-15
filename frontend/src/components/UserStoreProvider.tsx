"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface UserStoreContextType {
  cartCount: number;
  favoritesCount: number;
  unreadMessagesCount: number;
  unreadOrdersCount: number;
  unreadBuyingCount: number;
  unreadSellingCount: number;
  unreadNotificationsCount: number;
  refreshStore: () => Promise<void>;
  isInFavorites: (gemId: number) => boolean;
}

const UserStoreContext = createContext<UserStoreContextType | undefined>(undefined);

export function UserStoreProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [cartCount, setCartCount] = useState(0);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadOrdersCount, setUnreadOrdersCount] = useState(0);
  const [unreadBuyingCount, setUnreadBuyingCount] = useState(0);
  const [unreadSellingCount, setUnreadSellingCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const refreshStore = async () => {
    if (status !== 'authenticated' || !session?.user?.id) {
      setCartCount(0);
      setFavorites([]);
      setUnreadMessagesCount(0);
      setUnreadOrdersCount(0);
      setUnreadBuyingCount(0);
      setUnreadSellingCount(0);
      setUnreadNotificationsCount(0);
      return;
    }

    const userId = session.user.id;
    try {
      const token = (session as any).accessToken;
      const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined;

      const [cartRes, favRes, notifRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/cart/user/${userId}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/favorites/user/${userId}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/notifications`, { headers })
      ]);

      const cartResult = await cartRes.json();
      const favResult = await favRes.json();
      const notifResult = await notifRes.json();

      if (cartResult.success) setCartCount(cartResult.data.length);
      if (favResult.success) setFavorites(favResult.data);
      if (notifResult.success) {
        setUnreadMessagesCount(notifResult.data.unreadMessages || 0);
        setUnreadOrdersCount(notifResult.data.unreadOrders || 0);
        setUnreadBuyingCount(notifResult.data.unreadBuying || 0);
        setUnreadSellingCount(notifResult.data.unreadSelling || 0);
        setUnreadNotificationsCount(notifResult.data.unreadNotifications || 0);
      }
    } catch (err) {
      console.error("Failed to fetch user store state", err);
    }
  };

  useEffect(() => {
    refreshStore();
    let interval: NodeJS.Timeout | null = null;
    if (status === 'authenticated') {
      interval = setInterval(() => {
        refreshStore();
      }, 15000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, session]);

  const isInFavorites = (gemId: number) => {
    return favorites.some(fav => fav.id === gemId);
  };

  return (
    <UserStoreContext.Provider value={{
      cartCount,
      favoritesCount: favorites.length,
      unreadMessagesCount,
      unreadOrdersCount,
      unreadBuyingCount,
      unreadSellingCount,
      unreadNotificationsCount,
      refreshStore,
      isInFavorites
    }}>
      {children}
    </UserStoreContext.Provider>
  );
}

export function useUserStore() {
  const context = useContext(UserStoreContext);
  if (context === undefined) {
    throw new Error('useUserStore must be used within a UserStoreProvider');
  }
  return context;
}
