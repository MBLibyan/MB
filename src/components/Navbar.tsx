"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Disc3,
  LayoutGrid,
  Shield,
  BookOpen,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import SetupGuideModal from "./SetupGuideModal";

export default function Navbar() {
  const pathname = usePathname();
  const [guideOpen, setGuideOpen] = useState(false);
  const [supabaseLive, setSupabaseLive] = useState(false);

  useEffect(() => {
    const syncState = () => {
      setSupabaseLive(isSupabaseConfigured());
    };
    syncState();
    window.addEventListener("mb-media-updated", syncState);
    return () => window.removeEventListener("mb-media-updated", syncState);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090A0F]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 p-[1px] shadow-lg shadow-violet-500/20">
              <div className="w-full h-full bg-[#090A0F] rounded-[11px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                <Disc3 className="w-5 h-5 text-violet-400 group-hover:text-white transition-colors animate-spin-slow" />
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

          {/* Navigation & Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setGuideOpen(true)}
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                supabaseLive
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
              }`}
              title="اضغط لعرض إرشادات الربط بـ Supabase و Vercel"
            >
              {supabaseLive ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>متصل بـ Supabase</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>وضع المعاينة التفاعلي (إعداد Supabase)</span>
                </>
              )}
            </button>

            <button
              onClick={() => setGuideOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">إرشادات Vercel &amp; Supabase</span>
            </button>

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

      <SetupGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  );
}
