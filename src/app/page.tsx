"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Search,
  Music,
  Film,
  Sparkles,
  LayoutGrid,
  List,
  Clock,
  HardDrive,
  Calendar,
  Download,
  SlidersHorizontal,
  Volume2,
  X,
  ArrowUpLeft,
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Media Player State
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col pb-40">
      <Navbar />

      {/* Hero Spotlight Banner */}
      <section className="relative overflow-hidden border-b border-white/[0.07]">
        {/* Ambient Studio Glow */}
        <div className="pointer-events-none absolute -top-24 right-1/4 w-96 h-96 rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 w-96 h-96 rounded-full bg-cyan-500/15 blur-[120px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>المعرض الرقمي الخاص • صوتيات MP3 ومرئيات MP4</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                استعراض أعمالي الصوتية والمرئية{" "}
                <span className="bg-gradient-to-l from-violet-400 via-fuchsia-300 to-cyan-400 bg-clip-text text-transparent">
                  بجودة استوديو
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                مساحة مخصصة لاستعراض وتشغيل كافة الأعمال الصوتية (MP3) والإنتاجات المرئية (MP4) مباشرة عبر مشغل وسائط تفاعلي مدمج يدعم التحكم الكامل والتنقل السلس.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {filteredItems.length > 0 && (
                  <button
                    onClick={() => handleTogglePlayItem(filteredItems[0])}
                    className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-l from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-violet-600/25 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>تشغيل أحدث عمل الآن</span>
                  </button>
                )}

                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-200 text-sm font-medium transition-all"
                >
                  <span>إدارة ورفع الأعمال</span>
                  <ArrowUpLeft className="w-4 h-4 text-violet-400" />
                </Link>
              </div>
            </div>

            {/* Studio Stats Cards */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0">
              <div className="p-4 rounded-2xl bg-[#12141D]/90 border border-white/[0.08] text-center min-w-[105px]">
                <span className="text-xs text-slate-400 block mb-1">
                  إجمالي الأعمال
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
                  {items.length}
                </span>
                <span className="text-[11px] text-emerald-400 block mt-1">
                  متاح للتشغيل
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#12141D]/90 border border-violet-500/20 text-center min-w-[105px]">
                <span className="text-xs text-violet-300 block mb-1">
                  صوتيات MP3
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-violet-400 tabular-nums">
                  {audioCount}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  مقطع صوتي
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#12141D]/90 border border-cyan-500/20 text-center min-w-[105px]">
                <span className="text-xs text-cyan-300 block mb-1">
                  مرئيات MP4
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400 tabular-nums">
                  {videoCount}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  عمل مرئي
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 flex-1">
        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-[#12141D] border border-white/[0.08] mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl shadow-black/20">
          {/* Type Filter Segmented Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#090A0F] border border-white/[0.06] overflow-x-auto">
            <button
              onClick={() => setFilterType("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterType === "all"
                  ? "bg-white/10 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />
              <span>جميع الأعمال ({items.length})</span>
            </button>

            <button
              onClick={() => setFilterType("mp3")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterType === "mp3"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>صوتيات MP3 ({audioCount})</span>
            </button>

            <button
              onClick={() => setFilterType("mp4")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterType === "mp4"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>فيديو MP4 ({videoCount})</span>
            </button>
          </div>

          {/* Search Input & View Mode Switcher */}
          <div className="flex items-center gap-3 flex-1 md:max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بعنوان العمل أو الوصف..."
                className="w-full pr-10 pl-9 py-2.5 rounded-xl bg-[#090A0F] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label="مسح البحث"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Grid vs List View Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-[#090A0F] border border-white/[0.06]">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-violet-600/25 text-violet-300"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="عرض شبكي"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-violet-600/25 text-violet-300"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="عرض قائمة"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="rounded-2xl bg-[#12141D] border border-white/[0.06] p-4 animate-pulse space-y-4"
              >
                <div className="aspect-video rounded-xl bg-white/5" />
                <div className="h-5 w-3/4 bg-white/10 rounded" />
                <div className="h-4 w-full bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl bg-[#12141D] border border-white/[0.08] p-12 text-center max-w-lg mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4 text-violet-400">
              <Music className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              لا توجد أعمال مطابقة لبحثك
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              جرب تغيير فلتر النوع (صوت / فيديو) أو مسح كلمة البحث، أو قم برفع أعمال جديدة من لوحة التحكم.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setFilterType("all");
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors"
              >
                إظهار جميع الأعمال
              </button>
              <Link
                href="/admin"
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-colors"
              >
                رفع عمل جديد
              </Link>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isCurrent = activeItem?.id === item.id;
              const isItemPlaying = isCurrent && isPlaying;
              const isVideo = item.media_type === "mp4";

              return (
                <article
                  key={item.id}
                  className={`group rounded-2xl bg-[#12141D] border transition-all duration-300 flex flex-col overflow-hidden ${
                    isCurrent
                      ? isVideo
                        ? "border-cyan-500/60 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/40"
                        : "border-violet-500/60 shadow-xl shadow-violet-500/10 ring-1 ring-violet-500/40"
                      : "border-white/[0.08] hover:border-white/20 hover:-translate-y-0.5"
                  }`}
                >
                  {/* Visual Preview Stage (16:9) */}
                  <div
                    onClick={() => handleTogglePlayItem(item)}
                    className={`relative aspect-video w-full overflow-hidden cursor-pointer flex items-center justify-center ${
                      isVideo
                        ? "bg-gradient-to-br from-slate-900 via-[#0d1f2d] to-[#090A0F]"
                        : "bg-gradient-to-br from-[#19102c] via-[#111322] to-[#090A0F]"
                    }`}
                  >
                    {/* Decorative Waveform / Cinema Grid */}
                    {isVideo ? (
                      <div className="absolute inset-0 flex items-center justify-center opacity-35 group-hover:opacity-55 transition-opacity">
                        <div className="w-36 h-36 rounded-full bg-cyan-500/20 blur-2xl" />
                        <div className="grid grid-cols-12 gap-1.5 items-end h-20 px-8 w-full">
                          {[35, 60, 45, 80, 55, 95, 70, 50, 85, 65, 40, 75].map(
                            (h, idx) => (
                              <div
                                key={idx}
                                style={{ height: `${h}%` }}
                                className={`w-full rounded-full transition-all ${
                                  isItemPlaying
                                    ? "bg-cyan-400 animate-pulse"
                                    : "bg-cyan-400/40"
                                }`}
                              />
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center px-8">
                        <div className="w-36 h-36 rounded-full bg-violet-500/20 blur-2xl absolute" />
                        <div className="flex items-center justify-center gap-1.5 h-20 w-full">
                          {[
                            28, 52, 74, 40, 90, 62, 100, 48, 84, 70, 36, 92, 58,
                            76, 44, 64, 30,
                          ].map((h, idx) => (
                            <span
                              key={idx}
                              style={{ height: `${h}%` }}
                              className={`flex-1 rounded-full transition-all duration-300 ${
                                isItemPlaying
                                  ? "bg-gradient-to-t from-violet-500 to-cyan-400 animate-pulse"
                                  : "bg-violet-400/30 group-hover:bg-violet-400/50"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold backdrop-blur-md border ${
                          isVideo
                            ? "bg-cyan-500/20 border-cyan-400/35 text-cyan-200"
                            : "bg-violet-500/20 border-violet-400/35 text-violet-200"
                        }`}
                      >
                        {isVideo ? (
                          <>
                            <Film className="w-3.5 h-3.5" />
                            <span>فيديو MP4</span>
                          </>
                        ) : (
                          <>
                            <Music className="w-3.5 h-3.5" />
                            <span>صوت MP3</span>
                          </>
                        )}
                      </span>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono tabular-nums bg-black/60 backdrop-blur-md text-slate-200 border border-white/10">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatDuration(item.duration)}
                      </span>
                    </div>

                    {/* Center Play/Pause Button */}
                    <div
                      className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-xl ${
                        isItemPlaying
                          ? isVideo
                            ? "bg-cyan-500 text-white scale-105 shadow-cyan-500/40"
                            : "bg-violet-600 text-white scale-105 shadow-violet-600/40"
                          : "bg-black/65 text-white border border-white/20 group-hover:scale-110 group-hover:bg-violet-600 group-hover:border-violet-400"
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
                      <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-[11px]">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                          {isItemPlaying ? "قيد التشغيل الآن..." : "متوقف مؤقتاً"}
                        </span>
                        <span className="font-mono text-slate-300">
                          {item.media_type.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3
                        onClick={() => handleTogglePlayItem(item)}
                        className="text-base font-bold text-white group-hover:text-violet-300 transition-colors cursor-pointer line-clamp-1"
                      >
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {item.description || "لا يوجد وصف مضاف لهذا العمل."}
                      </p>
                    </div>

                    {/* Card Footer Metadata & Actions */}
                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2 text-[11px] text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {formatDateArabic(item.created_at)}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 font-mono"
                          dir="ltr"
                        >
                          <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                          {formatFileSize(item.file_size)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={item.file_url}
                          download={item.title}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                          title="تحميل الملف المباشر"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleTogglePlayItem(item)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            isItemPlaying
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : isVideo
                              ? "bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300"
                              : "bg-violet-500/15 hover:bg-violet-500/25 text-violet-300"
                          }`}
                        >
                          {isItemPlaying ? "إيقاف مؤقت" : "تشغيل"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const isCurrent = activeItem?.id === item.id;
              const isItemPlaying = isCurrent && isPlaying;
              const isVideo = item.media_type === "mp4";

              return (
                <div
                  key={item.id}
                  onClick={() => handleTogglePlayItem(item)}
                  className={`p-4 rounded-2xl bg-[#12141D] border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCurrent
                      ? "border-violet-500/60 bg-violet-500/[0.05]"
                      : "border-white/[0.08] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <button
                      type="button"
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                        isItemPlaying
                          ? "bg-violet-600 text-white"
                          : isVideo
                          ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                          : "bg-violet-500/15 text-violet-300 border border-violet-500/30"
                      }`}
                    >
                      {isItemPlaying ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            isVideo
                              ? "bg-cyan-500/20 text-cyan-300"
                              : "bg-violet-500/20 text-violet-300"
                          }`}
                        >
                          {item.media_type.toUpperCase()}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-white truncate">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-slate-400 shrink-0">
                    <span className="font-mono tabular-nums">
                      {formatDuration(item.duration)}
                    </span>
                    <span className="font-mono tabular-nums" dir="ltr">
                      {formatFileSize(item.file_size)}
                    </span>
                    <span className="hidden md:inline">
                      {formatDateArabic(item.created_at)}
                    </span>
                  </div>
                </div>
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
