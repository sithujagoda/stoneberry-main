"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function NavbarAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-12 h-4 bg-neutral-200/50 animate-pulse rounded-sm" />;
  }

  if (session) {
    const displayName = session.user?.firstname || session.user?.email?.split("@")[0] || "User";
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
          Hi, {displayName}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-black transition-colors px-2 py-1"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="text-xs font-semibold uppercase tracking-wider text-black px-4 py-2 hover:opacity-75 transition-opacity"
    >
      Login
    </Link>
  );
}
