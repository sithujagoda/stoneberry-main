"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserCircleIcon, ShoppingBagIcon, TagIcon, Cog6ToothIcon, Square3Stack3DIcon } from '@heroicons/react/24/outline';
import { useUserStore } from '@/components/UserStoreProvider';

const navigation = [
  { name: 'My Details', href: '/profile', icon: UserCircleIcon },
  { name: 'My Listings', href: '/profile/listings', icon: Square3Stack3DIcon },
  { name: 'Buying Orders', href: '/profile/orders', icon: ShoppingBagIcon },
  { name: 'Selling Offers', href: '/profile/selling', icon: TagIcon },
  { name: 'Settings', href: '/profile/settings', icon: Cog6ToothIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { unreadBuyingCount, unreadSellingCount } = useUserStore();

  return (
    <div className="min-h-screen bg-stoneberry-beige pt-10 pb-24 font-sans">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Breadcrumbs */}
        <div className="mb-8 flex items-center text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-black">Profile</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-black mb-12">My Account</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 items-start">
          
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/profile' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      isActive
                        ? 'bg-white border-black text-black shadow-sm'
                        : 'border-transparent text-neutral-500 hover:text-black hover:bg-white/50',
                      'group border flex items-center gap-3 px-4 py-3.5 text-[11px] font-bold uppercase tracking-widest transition-all'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon
                      className={classNames(
                        isActive ? 'text-black' : 'text-neutral-400 group-hover:text-black',
                        'h-4 w-4 shrink-0 transition-colors'
                      )}
                      aria-hidden="true"
                    />
                    <span className="flex-1">{item.name}</span>
                    {item.name === 'Buying Orders' && unreadBuyingCount > 0 && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                        {unreadBuyingCount}
                      </span>
                    )}
                    {item.name === 'Selling Offers' && unreadSellingCount > 0 && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                        {unreadSellingCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-9 mt-8 lg:mt-0">
            {children}
          </div>
          
        </div>
      </div>
    </div>
  );
}
