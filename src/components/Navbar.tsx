"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <header
      dir="ltr"
      className="sticky top-0 z-40 w-full bg-gradient-to-b from-[#2A303C] to-[#1E232D] border-b border-[#C6A664]/30 shadow-lg shadow-black/50"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Custom MB Luxury Serif Monogram Logo */}
        <Link
          href="/"
          className="flex items-center group select-none shrink-0"
          aria-label="MB Studio Home"
        >
          <svg
            width="108"
            height="68"
            viewBox="0 0 130 82"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-24 sm:w-28 h-auto drop-shadow-[0_3px_8px_rgba(0,0,0,0.7)] transition-transform group-hover:scale-[1.03]"
          >
            <defs>
              <linearGradient id="mbGoldGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E9CF93" />
                <stop offset="50%" stopColor="#C5A363" />
                <stop offset="100%" stopColor="#8E6E36" />
              </linearGradient>
            </defs>

            {/* White Serif "M" */}
            <text
              x="6"
              y="64"
              fill="#FFFFFF"
              fontFamily="Georgia, 'Times New Roman', serif"
              fontWeight="bold"
              fontSize="64"
              letterSpacing="-2"
            >
              M
            </text>

            {/* Gold Serif "B" */}
            <text
              x="62"
              y="64"
              fill="url(#mbGoldGrad)"
              fontFamily="Georgia, 'Times New Roman', serif"
              fontWeight="bold"
              fontSize="64"
            >
              B
            </text>

            {/* Signature Golden Swoosh Curve across M & B */}
            <path
              d="M 8 34 C 24 18, 42 52, 68 58 C 82 61, 95 56, 108 46"
              stroke="url(#mbGoldGrad)"
              strokeWidth="4.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 6 38 C 22 24, 42 56, 70 61"
              stroke="#1E232D"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
              opacity="0.65"
            />
          </svg>
        </Link>

        {/* Right: Stacked / Grouped Gold-Bordered Navigation Pills */}
        <div className="flex flex-col items-end gap-2">
          {/* Top Row: Public Gallery Button + Soundwave Circle Emblem */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              dir="rtl"
              className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                isHome
                  ? "bg-gradient-to-b from-[#2B2A27] to-[#1B1C20] border-[#C6A664] text-[#F3E9D2] shadow-[0_0_15px_rgba(198,166,100,0.28)]"
                  : "bg-[#1A1D24]/90 border-[#C6A664]/45 text-slate-300 hover:border-[#C6A664] hover:text-white"
              }`}
            >
              {/* Gold Soundwave Circle Icon */}
              <span className="w-6 h-6 rounded-full border border-[#C6A664]/80 bg-[#14171D] flex items-center justify-center shrink-0">
                <svg
                  className="w-3.5 h-3.5 text-[#D8BC7E]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <line x1="8" y1="9" x2="8" y2="15" />
                  <line x1="12" y1="6" x2="12" y2="18" />
                  <line x1="16" y1="9" x2="16" y2="15" />
                </svg>
              </span>
              <span>المعرض العام</span>
            </Link>

            {/* Circular Gold Soundwave Emblem Button */}
            <Link
              href="/"
              aria-label="استوديو الصوتيات"
              className="w-9 h-9 rounded-full border border-[#C6A664]/65 bg-[#171A21] hover:border-[#E5C883] flex items-center justify-center text-[#D8BC7E] shadow-md transition-all"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="9" strokeOpacity="0.45" />
                <line x1="8.5" y1="10" x2="8.5" y2="14" />
                <line x1="12" y1="7.5" x2="12" y2="16.5" />
                <line x1="15.5" y1="10" x2="15.5" y2="14" />
              </svg>
            </Link>
          </div>

          {/* Bottom Row: Admin Dashboard Button */}
          <Link
            href="/admin"
            dir="rtl"
            className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
              isAdmin
                ? "bg-gradient-to-b from-[#2B2A27] to-[#1B1C20] border-[#C6A664] text-[#F3E9D2] shadow-[0_0_15px_rgba(198,166,100,0.28)]"
                : "bg-[#1A1D24]/90 border-[#C6A664]/55 text-slate-200 hover:border-[#C6A664] hover:text-white"
            }`}
          >
            {/* Gold Hexagon Icon */}
            <svg
              className="w-5 h-5 text-[#D8BC7E] shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 20 7 20 17 12 22 4 17 4 7 12 2" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>لوحة التحكم</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
