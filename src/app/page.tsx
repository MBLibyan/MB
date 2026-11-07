"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Search,
  Music,
  Film,
  Clock,
  HardDrive,
  Calendar,
  Download,
  Volume2,
  X,
  ChevronsUp,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import MediaPlayer from "@/components/MediaPlayer";
import { MediaItem } from "@/types/media";
import {
  fetchMediaItems,
  formatDuration,
  formatFileSize,
} from "@/lib/supabase";

export default function PublicViewerPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "mp3" | "mp4">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Media Player State
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const worksSectionRef = useRef<HTMLDivElement | null>(null);

  const loadWorks = async () => {
    setLoading(true);
    const res = await fetchMediaItems();
    setItems(res.items);
    setLoading(false);
  };

  useEffect(() => {
    loadWorks();
    const handleUpdate = () => {
      loadWorks();
    };
    window.addEventListener("mb-media-updated", handleUpdate);
    return () => window.removeEventListener("mb-media-updated", handleUpdate);
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesType =
        filterType === "all" || item.media_type === filterType;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q));
      return matchesType && matchesQuery;
    });
  }, [items, filterType, searchQuery]);

  const audioCount = useMemo(
    () => items.filter((i) => i.media_type === "mp3").length,
    [items]
  );
  const videoCount = useMemo(
    () => items.filter((i) => i.media_type === "mp4").length,
    [items]
  );

  const handleTogglePlayItem = (item: MediaItem) => {
    if (activeItem?.id === item.id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveItem(item);
      setIsPlaying(true);
    }
  };

  const handlePlayRandomSeamless = () => {
    const pool = filteredItems.length > 0 ? filteredItems : items;
    if (pool.length === 0) return;
    const randomIdx = Math.floor(Math.random() * pool.length);
    setActiveItem(pool[randomIdx]);
    setIsPlaying(true);
  };

  const scrollToWorks = (newFilter?: "all" | "mp3" | "mp4") => {
    if (newFilter) {
      setFilterType((prev) => (prev === newFilter && newFilter !== "all" ? "all" : newFilter));
    }
    setTimeout(() => {
      worksSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const formatDateArabic = (iso: string) => {
    try {
      return new Intl.DateTimeFormat("ar-LY", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(iso));
    } catch {
      return iso.slice(0, 10);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0F13] text-[#F5F2EB] flex flex-col pb-40">
      <Navbar />

      {/* ====================================================================
          LUXURY DARK & CHAMPAGNE GOLD HERO STAGE (MATCHING REFERENCE IMAGE)
          ==================================================================== */}
      <section className="relative overflow-hidden border-b border-[#C6A664]/20">
        {/* 3D Architectural Background Panels */}
        <div className="pointer-events-none absolute inset-0 flex justify-center">
          {/* Left Dark Wing with Geometric Gold Lines */}
          <div className="flex-1 bg-gradient-to-b from-[#14171E] to-[#0B0D11] relative overflow-hidden">
            <svg
              className="absolute inset-0 w-full h-full opacity-35"
              viewBox="0 0 200 600"
              preserveAspectRatio="none"
            >
              <line x1="0" y1="80" x2="180" y2="210" stroke="#C6A664" strokeWidth="1" />
              <line x1="0" y1="220" x2="160" y2="110" stroke="#C6A664" strokeWidth="0.8" />
              <line x1="0" y1="360" x2="190" y2="490" stroke="#C6A664" strokeWidth="1" />
              <line x1="20" y1="520" x2="180" y2="390" stroke="#C6A664" strokeWidth="0.9" />
              <polygon
                points="0,420 95,480 40,560 0,540"
                fill="none"
                stroke="#C6A664"
                strokeWidth="0.8"
              />
            </svg>
          </div>

          {/* Center Raised 3D Monolith Column */}
          <div className="w-[64%] sm:w-[58%] max-w-xl bg-gradient-to-b from-[#2A2F3A] via-[#181B22] to-[#0E1015] shadow-[0_0_70px_20px_rgba(0,0,0,0.95)] border-x border-white/[0.06] relative" />

          {/* Right Dark Wing with Geometric Gold Lines */}
          <div className="flex-1 bg-gradient-to-b from-[#14171E] to-[#0B0D11] relative overflow-hidden">
            <svg
              className="absolute inset-0 w-full h-full opacity-35"
              viewBox="0 0 200 600"
              preserveAspectRatio="none"
            >
              <line x1="200" y1="120" x2="20" y2="260" stroke="#C6A664" strokeWidth="1" />
              <line x1="200" y1="310" x2="10" y2="440" stroke="#C6A664" strokeWidth="1.2" />
              <line x1="180" y1="490" x2="30" y2="370" stroke="#C6A664" strokeWidth="0.8" />
            </svg>
          </div>
        </div>

        {/* Left & Right Ambient Gold Soundwave Equalizers */}
        <div
          dir="ltr"
          className="pointer-events-none absolute inset-x-0 top-[36%] -translate-y-1/2 flex items-center justify-between px-1 sm:px-6 opacity-55"
        >
          {/* Left Gold Waveform */}
          <div className="flex items-center gap-[3px] h-24">
            {[18, 35, 65, 42, 88, 54, 30, 72, 46, 25, 40, 20, 14, 22].map(
              (h, idx) => (
                <span
                  key={idx}
                  style={{ height: `${h}%` }}
                  className="w-[2px] rounded-full bg-gradient-to-b from-transparent via-[#C6A664] to-transparent"
                />
              )
            )}
          </div>

          {/* Right Gold Waveform */}
          <div className="flex items-center gap-[3px] h-24">
            {[14, 22, 40, 25, 46, 72, 30, 54, 88, 42, 65, 35, 18, 12].map(
              (h, idx) => (
                <span
                  key={idx}
                  style={{ height: `${h}%` }}
                  className="w-[2px] rounded-full bg-gradient-to-b from-transparent via-[#C6A664] to-transparent"
                />
              )
            )}
          </div>
        </div>

        {/* Foreground Hero Content Container */}
        <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 pt-6 pb-8 flex flex-col items-center">
          {/* 1. Top Pill Search Bar */}
          <div className="w-full relative mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن عمل صوتي أو مرئي..."
              className="w-full h-12 sm:h-13 pr-12 pl-10 rounded-full bg-[#0B0D11]/95 border border-white/10 focus:border-[#C6A664]/75 text-sm text-[#F5F2EB] placeholder-slate-500 shadow-[inset_0_2px_8px_rgba(0,0,0,0.85)] focus:outline-none transition-all"
            />
            <Search className="w-5 h-5 text-[#C6A664] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 2. Centerpiece Gold Studio Microphone + Heartbeat Waveform SVG */}
          <div
            onClick={() => {
              if (filteredItems.length > 0) {
                handleTogglePlayItem(filteredItems[0]);
              }
            }}
            className="relative my-1 cursor-pointer group select-none"
            title="اضغط لتشغيل أحدث عمل"
          >
            {/* Subtle Gold Radial Glow Behind Mic */}
            <div className="pointer-events-none absolute inset-0 rounded-full bg-[#C6A664]/15 blur-3xl scale-90 group-hover:bg-[#C6A664]/25 transition-all" />

            <svg
              width="210"
              height="205"
              viewBox="0 0 220 215"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-48 h-48 sm:w-56 sm:h-56 relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)] transition-transform duration-300 group-hover:scale-[1.03]"
            >
              <defs>
                <linearGradient id="micGold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#EAD095" />
                  <stop offset="50%" stopColor="#C6A664" />
                  <stop offset="100%" stopColor="#947439" />
                </linearGradient>
              </defs>

              {/* Upper Microphone Capsule */}
              <path
                d="M 88 68 V 44 C 88 30 98 20 110 20 C 122 20 132 30 132 44 V 68"
                stroke="url(#micGold)"
                strokeWidth="8.5"
                strokeLinecap="round"
              />
              {/* Grille Slots inside Upper Capsule */}
              <line
                x1="117"
                y1="34"
                x2="129"
                y2="34"
                stroke="url(#micGold)"
                strokeWidth="5.5"
                strokeLinecap="round"
              />
              <line
                x1="117"
                y1="46"
                x2="129"
                y2="46"
                stroke="url(#micGold)"
                strokeWidth="5.5"
                strokeLinecap="round"
              />

              {/* Lower Microphone Capsule */}
              <path
                d="M 88 106 V 114 C 88 127 98 137 110 137 C 122 137 132 127 132 114 V 106"
                stroke="url(#micGold)"
                strokeWidth="8.5"
                strokeLinecap="round"
              />

              {/* U-Shaped Microphone Cradle */}
              <path
                d="M 69 102 V 113 C 69 136 87 154 110 154 C 133 154 151 136 151 113 V 102"
                stroke="url(#micGold)"
                strokeWidth="8.5"
                strokeLinecap="round"
              />

              {/* Vertical Stand & Rounded Base */}
              <line
                x1="110"
                y1="154"
                x2="110"
                y2="188"
                stroke="url(#micGold)"
                strokeWidth="8.5"
                strokeLinecap="round"
              />
              <path
                d="M 78 192 C 92 185 128 185 142 192"
                stroke="url(#micGold)"
                strokeWidth="8.5"
                strokeLinecap="round"
              />

              {/* Dark Backdrop Cutout for the Pulse Waveform Line */}
              <path
                d="M 14 91 H 54 L 65 109 L 80 68 L 93 102 L 103 48 L 116 116 L 130 72 L 141 96 L 154 46 L 169 108 L 180 91 H 206"
                stroke="#181B22"
                strokeWidth="15"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Gold Heartbeat / Audio Pulse Waveform Line */}
              <path
                d="M 14 91 H 54 L 65 109 L 80 68 L 93 102 L 103 48 L 116 116 L 130 72 L 141 96 L 154 46 L 169 108 L 180 91 H 206"
                stroke="url(#micGold)"
                strokeWidth="7.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* 3. Four Feature / Filter Icons Row (Audio, Video, Control, Seamless) */}
          <div
            dir="ltr"
            className="w-full grid grid-cols-4 gap-2 sm:gap-4 my-4 px-1"
          >
            {/* Audio Button */}
            <button
              type="button"
              onClick={() => scrollToWorks("mp3")}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="h-10 flex items-center justify-center text-[#C6A664] group-hover:scale-110 transition-transform">
                <svg
                  className="w-9 h-9"
                  viewBox="0 0 36 36"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
                  <line x1="6" y1="16" x2="6" y2="20" />
                  <line x1="11" y1="12" x2="11" y2="24" />
                  <line x1="16" y1="7" x2="16" y2="29" />
                  <line x1="21" y1="13" x2="21" y2="23" />
                  <line x1="26" y1="9" x2="26" y2="27" />
                  <line x1="31" y1="15" x2="31" y2="21" />
                </svg>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  filterType === "mp3"
                    ? "bg-[#C6A664] text-[#0E1014] border-[#E7C986] shadow-[0_0_12px_rgba(198,166,100,0.5)]"
                    : "bg-[#2B261F]/90 text-[#D8C292] border-[#C6A664]/35 group-hover:border-[#C6A664]"
                }`}
              >
                Audio
              </span>
            </button>

            {/* Video Button */}
            <button
              type="button"
              onClick={() => scrollToWorks("mp4")}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="h-10 flex items-center justify-center text-[#C6A664] group-hover:scale-110 transition-transform">
                <svg
                  className="w-9 h-9"
                  viewBox="0 0 36 36"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="4" y="9" width="20" height="18" rx="4" />
                  <polygon points="12,14 12,22 18,18" fill="currentColor" stroke="none" />
                  <path d="M 24 15 L 32 11 V 25 L 24 21 Z" />
                </svg>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  filterType === "mp4"
                    ? "bg-[#C6A664] text-[#0E1014] border-[#E7C986] shadow-[0_0_12px_rgba(198,166,100,0.5)]"
                    : "bg-[#2B261F]/90 text-[#D8C292] border-[#C6A664]/35 group-hover:border-[#C6A664]"
                }`}
              >
                Video
              </span>
            </button>

            {/* Control Button */}
            <button
              type="button"
              onClick={() => scrollToWorks("all")}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="h-10 flex items-center justify-center text-[#C6A664] group-hover:scale-110 transition-transform">
                <svg
                  className="w-9 h-9"
                  viewBox="0 0 36 36"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <line x1="6" y1="10" x2="30" y2="10" />
                  <circle cx="14" cy="10" r="3" fill="#181B22" />
                  <line x1="6" y1="18" x2="30" y2="18" />
                  <circle cx="23" cy="18" r="3" fill="#181B22" />
                  <line x1="6" y1="26" x2="30" y2="26" />
                  <circle cx="16" cy="26" r="3" fill="#181B22" />
                </svg>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  filterType === "all"
                    ? "bg-[#383024] text-[#F1DFB6] border-[#C6A664]/70"
                    : "bg-[#2B261F]/90 text-[#D8C292] border-[#C6A664]/35 group-hover:border-[#C6A664]"
                }`}
              >
                Control
              </span>
            </button>

            {/* Seamless Button */}
            <button
              type="button"
              onClick={handlePlayRandomSeamless}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="h-10 flex items-center justify-center text-[#C6A664] group-hover:scale-110 transition-transform">
                <svg
                  className="w-9 h-9"
                  viewBox="0 0 36 36"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M 6 12 H 12 C 17 12 19 24 24 24 H 30" />
                  <polyline points="26 20 30 24 26 28" />
                  <path d="M 6 24 H 12 C 17 24 19 12 24 12 H 30" />
                  <polyline points="26 8 30 12 26 16" />
                </svg>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#2B261F]/90 text-[#D8C292] border border-[#C6A664]/35 group-hover:border-[#C6A664] transition-all">
                Seamless
              </span>
            </button>
          </div>

          {/* 4. Two Primary Gold-Bordered Action Buttons */}
          <div className="w-full flex flex-col items-end gap-3 mt-3 px-1">
            <button
              type="button"
              onClick={() => {
                const target =
                  filteredItems.length > 0 ? filteredItems[0] : items[0];
                if (target) handleTogglePlayItem(target);
              }}
              className="w-full sm:w-[76%] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#25211A] via-[#3A3122] to-[#25211A] hover:from-[#312B20] hover:via-[#4A3E2A] hover:to-[#312B20] border border-[#C6A664]/80 gold-border-glow flex items-center justify-center gap-3 text-base sm:text-lg font-bold text-[#F5EFE0] transition-all active:scale-[0.99]"
            >
              <Play className="w-5 h-5 text-[#D8BC7E] fill-current shrink-0" />
              <span>تشغيل أحدث عمل الآن</span>
            </button>

            <Link
              href="/admin"
              className="w-[82%] sm:w-[64%] py-3 px-5 rounded-2xl bg-[#14171E]/95 hover:bg-[#1C2029] border border-[#C6A664]/60 flex items-center justify-center gap-2.5 text-sm sm:text-base font-bold text-[#EAE2D0] shadow-lg transition-all"
            >
              <span>إدارة ورفع الأعمال</span>
              <ChevronsUp className="w-5 h-5 text-[#C6A664] shrink-0" />
            </Link>
          </div>

          {/* 5. Three Luxury Gold Stat Cards (Video, Audio, Total Works) */}
          <div
            dir="ltr"
            className="w-full grid grid-cols-3 gap-3 sm:gap-4 mt-7"
          >
            {/* Left Card: Video Count */}
            <button
              type="button"
              onClick={() => scrollToWorks("mp4")}
              className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#1A1D24]/95 to-[#101217]/95 border transition-all flex flex-col items-center justify-center gap-2 ${
                filterType === "mp4"
                  ? "border-[#E5C883] gold-border-glow"
                  : "border-[#C6A664]/45 hover:border-[#C6A664]"
              }`}
            >
              <svg
                className="w-10 h-10 text-[#C6A664]"
                viewBox="0 0 36 36"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="9" width="19" height="18" rx="4" />
                <path d="M 23 15 L 31 10.5 V 25.5 L 23 21 Z" />
              </svg>
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tabular-nums tracking-tight">
                {videoCount}
              </span>
              <span className="text-[11px] text-[#C6A664]/90 font-semibold">
                مرئيات MP4
              </span>
            </button>

            {/* Center Card: Audio Count */}
            <button
              type="button"
              onClick={() => scrollToWorks("mp3")}
              className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#1A1D24]/95 to-[#101217]/95 border transition-all flex flex-col items-center justify-center gap-2 ${
                filterType === "mp3"
                  ? "border-[#E5C883] gold-border-glow"
                  : "border-[#C6A664]/45 hover:border-[#C6A664]"
              }`}
            >
              <svg
                className="w-10 h-10 text-[#C6A664]"
                viewBox="0 0 36 36"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M 6 21 V 17 C 6 10.4 11.4 5 18 5 C 24.6 5 30 10.4 30 17 V 21" />
                <rect x="5" y="19" width="5" height="9" rx="2.5" />
                <rect x="26" y="19" width="5" height="9" rx="2.5" />
                <line x1="14" y1="20" x2="14" y2="25" />
                <line x1="18" y1="16" x2="18" y2="28" />
                <line x1="22" y1="20" x2="22" y2="25" />
              </svg>
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tabular-nums tracking-tight">
                {audioCount}
              </span>
              <span className="text-[11px] text-[#C6A664]/90 font-semibold">
                صوتيات MP3
              </span>
            </button>

            {/* Right Card: Total Works Count */}
            <button
              type="button"
              onClick={() => scrollToWorks("all")}
              className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#1A1D24]/95 to-[#101217]/95 border transition-all flex flex-col items-center justify-center gap-2 ${
                filterType === "all"
                  ? "border-[#E5C883] gold-border-glow"
                  : "border-[#C6A664]/45 hover:border-[#C6A664]"
              }`}
            >
              <svg
                className="w-10 h-10 text-[#C6A664]"
                viewBox="0 0 36 36"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="5" y="11" width="20" height="18" rx="3" />
                <path d="M 10 8 H 27 C 28.7 8 30 9.3 30 11 V 24" />
                <path d="M 14 5 H 29 C 30.7 5 32 6.3 32 8 V 20" />
                <circle cx="11.5" cy="16.5" r="2" />
                <path d="M 6 26 L 13 20 L 18 24 L 21 21 L 25 25" />
              </svg>
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tabular-nums tracking-tight">
                {items.length}
              </span>
              <span className="text-[11px] text-[#C6A664]/90 font-semibold">
                إجمالي الأعمال
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          WORKS SHOWCASE SECTION (DARK OBSIDIAN & GOLD CARDS)
          ==================================================================== */}
      <main
        ref={worksSectionRef}
        className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-8 flex-1"
      >
        {/* Filter Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#C6A664]/20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 rounded-full bg-gradient-to-b from-[#E7C986] to-[#9B7B3E]" />
            <h2 className="text-lg sm:text-xl font-extrabold text-[#F5EFE0]">
              قائمة الأعمال المرفوعة
            </h2>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#C6A664]/15 border border-[#C6A664]/35 text-[#E5C883]">
              {filteredItems.length}
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#14171E] border border-[#C6A664]/30">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === "all"
                  ? "bg-gradient-to-b from-[#D8BC7E] to-[#A68546] text-[#0E1014] shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              الكل ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("mp3")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === "mp3"
                  ? "bg-gradient-to-b from-[#D8BC7E] to-[#A68546] text-[#0E1014] shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              صوتيات MP3 ({audioCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("mp4")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === "mp4"
                  ? "bg-gradient-to-b from-[#D8BC7E] to-[#A68546] text-[#0E1014] shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              فيديو MP4 ({videoCount})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl bg-[#14171E] border border-[#C6A664]/20 p-4 animate-pulse space-y-4"
              >
                <div className="aspect-video rounded-xl bg-white/5" />
                <div className="h-5 w-3/4 bg-white/10 rounded" />
                <div className="h-4 w-full bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl bg-[#14171E] border border-[#C6A664]/30 p-10 text-center max-w-md mx-auto my-6">
            <div className="w-14 h-14 rounded-2xl bg-[#C6A664]/15 border border-[#C6A664]/35 flex items-center justify-center mx-auto mb-4 text-[#D8BC7E]">
              <Music className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              لا توجد أعمال مطابقة حالياً
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              يمكنك إظهار كافة الأعمال أو رفع عمل جديد من لوحة التحكم.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setFilterType("all");
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white"
              >
                إظهار الكل
              </button>
              <Link
                href="/admin"
                className="px-4 py-2 rounded-xl bg-gradient-to-b from-[#D8BC7E] to-[#A68546] text-[#0E1014] text-xs font-bold"
              >
                رفع عمل جديد
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const isCurrent = activeItem?.id === item.id;
              const isItemPlaying = isCurrent && isPlaying;
              const isVideo = item.media_type === "mp4";

              return (
                <article
                  key={item.id}
                  className={`group rounded-2xl bg-gradient-to-b from-[#1A1E27] to-[#12151B] border transition-all duration-300 flex flex-col overflow-hidden ${
                    isCurrent
                      ? "border-[#E5C883] gold-border-glow"
                      : "border-[#C6A664]/30 hover:border-[#C6A664]/75"
                  }`}
                >
                  {/* Visual Preview Stage */}
                  <div
                    onClick={() => handleTogglePlayItem(item)}
                    className="relative aspect-video w-full overflow-hidden cursor-pointer flex items-center justify-center bg-gradient-to-br from-[#1E222B] via-[#13161C] to-[#0B0D11]"
                  >
                    {/* Gold Equalizer Bars Inside Card */}
                    <div className="absolute inset-0 flex items-center justify-center px-8 opacity-45 group-hover:opacity-70 transition-opacity">
                      <div className="flex items-center justify-center gap-1.5 h-16 w-full">
                        {[
                          28, 52, 74, 40, 90, 62, 100, 48, 84, 70, 36, 92, 58,
                          76, 44,
                        ].map((h, idx) => (
                          <span
                            key={idx}
                            style={{ height: `${h}%` }}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              isItemPlaying
                                ? "bg-gradient-to-t from-[#9B7B3E] to-[#E7C986] animate-pulse"
                                : "bg-[#C6A664]/35 group-hover:bg-[#C6A664]/60"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Top Badges */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold backdrop-blur-md bg-[#14171E]/85 border border-[#C6A664]/45 text-[#E5C883]">
                        {isVideo ? (
                          <>
                            <Film className="w-3.5 h-3.5" />
                            <span>MP4 فيديو</span>
                          </>
                        ) : (
                          <>
                            <Music className="w-3.5 h-3.5" />
                            <span>MP3 صوت</span>
                          </>
                        )}
                      </span>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono tabular-nums bg-black/70 backdrop-blur-md text-[#EAE2D0] border border-white/10">
                        <Clock className="w-3 h-3 text-[#C6A664]" />
                        {formatDuration(item.duration)}
                      </span>
                    </div>

                    {/* Center Gold Play/Pause Button */}
                    <div
                      className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-xl ${
                        isItemPlaying
                          ? "bg-gradient-to-b from-[#E7C986] to-[#A88644] text-[#0E1014] scale-105"
                          : "bg-[#14171E]/85 text-[#E5C883] border border-[#C6A664]/60 group-hover:scale-110 group-hover:bg-[#C6A664] group-hover:text-[#0E1014]"
                      }`}
                    >
                      {isItemPlaying ? (
                        <Pause className="w-6 h-6 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      )}
                    </div>

                    {/* Active Playing Status Banner */}
                    {isCurrent && (
                      <div className="absolute bottom-2.5 right-2.5 left-2.5 flex items-center justify-between px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-[#C6A664]/40 text-[11px]">
                        <span className="flex items-center gap-1.5 text-[#E5C883] font-semibold">
                          <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                          {isItemPlaying ? "يعمل الآن..." : "متوقف مؤقتاً"}
                        </span>
                        <span className="font-mono text-slate-300">
                          {item.media_type.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3
                        onClick={() => handleTogglePlayItem(item)}
                        className="text-sm sm:text-base font-bold text-[#F5EFE0] group-hover:text-[#E5C883] transition-colors cursor-pointer line-clamp-1"
                      >
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {item.description || "عمل فني من المعرض الشخصي"}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2 text-[11px] text-slate-400">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#C6A664]/80" />
                          {formatDateArabic(item.created_at)}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 font-mono"
                          dir="ltr"
                        >
                          <HardDrive className="w-3.5 h-3.5 text-[#C6A664]/80" />
                          {formatFileSize(item.file_size)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={item.file_url}
                          download={item.title}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-[#C6A664]/20 text-[#D8BC7E] transition-colors"
                          title="تحميل الملف"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleTogglePlayItem(item)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                            isItemPlaying
                              ? "bg-[#C6A664] text-[#0E1014] border-[#E7C986]"
                              : "bg-[#26221B] hover:bg-[#383123] text-[#E5C883] border-[#C6A664]/45"
                          }`}
                        >
                          {isItemPlaying ? "إيقاف" : "تشغيل"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Built-in Interactive Media Player */}
      <MediaPlayer
        activeItem={activeItem}
        playlist={filteredItems.length > 0 ? filteredItems : items}
        isPlaying={isPlaying}
        onPlayPause={setIsPlaying}
        onSelectTrack={(track) => {
          setActiveItem(track);
          setIsPlaying(true);
        }}
        onClose={() => {
          setActiveItem(null);
          setIsPlaying(false);
        }}
      />
    </div>
  );
}
