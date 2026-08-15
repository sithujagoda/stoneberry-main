import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { Search, Heart, ShoppingBag, User, MessageSquare } from "lucide-react";
import "./globals.css";
import { SessionProvider } from "../components/SessionProvider";
import { NavbarAuth } from "../components/NavbarAuth";
import { HeaderIcons } from "../components/HeaderIcons";



const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Stoneberry Gem Co. | Authenticity, Elegance & Trust",
  description: "Stoneberry Gem Co. is a modern Sri Lankan gem platform where heritage meets a bold, new era of luxury, bringing authenticity, elegance, and trust.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} antialiased`}>
      <body className="min-h-screen bg-stoneberry-beige text-black flex flex-col font-sans">
        <SessionProvider>

        {/* Stoneberry Header */}
        <header className="sticky top-0 z-50 bg-stoneberry-beige/90 backdrop-blur-md border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              {/* Brand Logo */}
              <div className="flex items-center shrink-0">
                <Link href="/" className="flex items-center">
                  <Image 
                    src="/images/gem_logo.png" 
                    alt="Stoneberry Logo" 
                    width={110} 
                    height={36} 
                    priority
                    className="object-contain"
                    style={{ height: "36px", width: "auto" }}
                  />

                </Link>
              </div>

              {/* Navigation Menu */}
              <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-gray-600">
                <Link href="/" className="hover:text-black transition-colors flex items-center">
                  <span className="text-gray-300 mr-1.5 font-light">/</span> Home
                </Link>
                <Link href="/gems" className="hover:text-black transition-colors">
                  Gemstones
                </Link>
                <Link href="/gems/browse" className="hover:text-black transition-colors">
                  Browse
                </Link>
                <Link href="/compare" className="hover:text-black transition-colors">
                  Compare
                </Link>
              </nav>

              {/* Icon Group & Action Buttons */}
              <div className="flex items-center gap-5 sm:gap-6">
                <HeaderIcons />

                <div className="flex items-center gap-2 border-l border-gray-200 pl-4 sm:pl-6">
                  <NavbarAuth />
                  <Link href="/sell" className="rounded-full bg-black text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-sm text-center">
                    Sell Your Gem
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 bg-stoneberry-beige">
          {children}
        </main>

        {/* Stoneberry Footer */}
        <footer className="border-t border-gray-200/80 bg-stoneberry-beige py-16 text-black">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
              
              {/* Left Column: Logo & Tagline */}
              <div className="space-y-6">
                <div>
                  <Image 
                    src="/images/gem_logo.png" 
                    alt="Stoneberry Logo" 
                    width={110} 
                    height={36} 
                    className="object-contain"
                    style={{ height: "36px", width: "auto" }}
                  />

                </div>
                <div className="pt-2">
                  <div className="w-12 border-t-[1.5px] border-black mb-3" />
                  <p className="text-sm font-semibold uppercase tracking-widest text-neutral-800 leading-relaxed max-w-xs">
                    Let's make every gem a part of your story
                  </p>
                </div>
                <div className="flex items-center gap-4 text-neutral-600 pt-2">
                  <a href="#" className="hover:text-black transition-colors" aria-label="Instagram">
                    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  </a>
                  <a href="#" className="hover:text-black transition-colors" aria-label="Facebook">
                    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </a>
                  <a href="#" className="hover:text-black transition-colors" aria-label="Twitter">
                    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                  </a>
                </div>
                <p className="text-[10px] text-gray-400 font-semibold tracking-wider pt-4">
                  &copy; 2026 STONEBERRYGEM CO. ALL RIGHTS RESERVED.
                </p>
              </div>

              {/* Middle Column: Sitemap */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Sitemap</h3>
                <div className="flex flex-wrap gap-x-8 gap-y-3 pt-2 text-xs font-semibold uppercase tracking-wider text-neutral-800">
                  <Link href="/" className="hover:text-black transition-colors">Home</Link>
                  <Link href="/about" className="hover:text-black transition-colors">About Us</Link>
                  <Link href="/gems" className="hover:text-black transition-colors">Gemstones</Link>
                  <Link href="/contact" className="hover:text-black transition-colors">Contact Us</Link>
                </div>
              </div>

              {/* Right Column: Newsletter Suggestion */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Any Suggestions?</h3>
                <div className="pt-2">
                  <div className="relative flex items-center max-w-sm">
                    <input 
                      type="email" 
                      placeholder="Enter your email address" 
                      className="w-full newsletter-input"
                    />
                    <button 
                      type="button" 
                      className="absolute right-0 text-xs font-bold uppercase tracking-widest text-black hover:opacity-75 transition-opacity"
                    >
                      Send &mdash;&gt;
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
