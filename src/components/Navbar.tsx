"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Disc3, LayoutGrid, Shield } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090A0F]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 p-[1px] shadow-lg shadow-violet-500/20">
            <div className="w-full h-full bg-[#090A0F] rounded-[11px] flex items-center justify-center group-hover:bg-transparent transition-colors">
              <Disc3 className="w-5 h-5 text-violet-400 group-hover:text-white transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                استوديو أعمالي
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
                MP3 &amp; MP4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              المنصة الخاصة لاستعراض الأعمال الصوتية والمرئية
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="flex items-center p-1 rounded-xl bg-[#12141D] border border-white/[0.08]">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pathname === "/"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>المعرض العام</span>
            </Link>

            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pathname?.startsWith("/admin")
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>لوحة التحكم</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
