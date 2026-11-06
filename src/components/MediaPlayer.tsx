"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Volume1,
  SkipBack,
  SkipForward,
  Repeat,
  Maximize2,
  Minimize2,
  Film,
  Music,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { MediaItem } from "@/types/media";
import { formatDuration } from "@/lib/supabase";

interface MediaPlayerProps {
  activeItem: MediaItem | null;
  playlist: MediaItem[];
  isPlaying: boolean;
  onPlayPause: (playing: boolean) => void;
  onSelectTrack: (item: MediaItem) => void;
  onClose: () => void;
}

export default function MediaPlayer({
  activeItem,
  playlist,
  isPlaying,
  onPlayPause,
  onSelectTrack,
  onClose,
}: MediaPlayerProps) {
  const mediaRef = useRef<HTMLVideoElement | null>(null);
  const videoStageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [videoExpanded, setVideoExpanded] = useState(true);
  const [hasNativeVideoFrames, setHasNativeVideoFrames] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync activeItem changes
  useEffect(() => {
    if (!activeItem) return;
    setCurrentTime(0);
    setDuration(activeItem.duration || 0);
    setHasNativeVideoFrames(false);
    if (activeItem.media_type === "mp4") {
      setVideoExpanded(true);
    }
  }, [activeItem?.id]);

  // Control play/pause on media element
  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !activeItem) return;

    if (isPlaying) {
      const playPromise = el.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          onPlayPause(false);
        });
      }
    } else {
      el.pause();
    }
  }, [isPlaying, activeItem?.id, activeItem?.file_url]);

  // Apply volume & mute
  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;
    el.volume = isMuted ? 0 : volume;
    el.muted = isMuted;
  }, [volume, isMuted]);

  // Apply playback speed & loop
  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;
    el.playbackRate = playbackRate;
    el.loop = isLooping;
  }, [playbackRate, isLooping]);

  // Animated studio canvas for demo MP4 items that don't have native video frames
  useEffect(() => {
    if (
      !activeItem ||
      activeItem.media_type !== "mp4" ||
      !videoExpanded ||
      hasNativeVideoFrames
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      if (isPlaying) {
        phase += 0.035 * playbackRate;
      } else {
        phase += 0.004;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background dark studio gradient
      const bgGrad = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        20,
        w * 0.5,
        h * 0.5,
        w * 0.7
      );
      if (activeItem.visualizer_theme === "cyber") {
        bgGrad.addColorStop(0, "#0b253a");
        bgGrad.addColorStop(0.6, "#090d1a");
        bgGrad.addColorStop(1, "#05060a");
      } else if (activeItem.visualizer_theme === "gold") {
        bgGrad.addColorStop(0, "#2b1d0e");
        bgGrad.addColorStop(0.6, "#120d18");
        bgGrad.addColorStop(1, "#07070c");
      } else {
        bgGrad.addColorStop(0, "#1f1139");
        bgGrad.addColorStop(0.6, "#0d1021");
        bgGrad.addColorStop(1, "#06070c");
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Animated harmonic waves
      const waveCount = 3;
      for (let wIdx = 0; wIdx < waveCount; wIdx++) {
        ctx.beginPath();
        const amp = (isPlaying ? 36 : 10) * (1 - wIdx * 0.22);
        const freq = 0.012 + wIdx * 0.004;
        for (let x = 0; x <= w; x += 6) {
          const y =
            h / 2 +
            Math.sin(x * freq + phase * (1.2 + wIdx * 0.4)) * amp +
            Math.cos(x * 0.006 - phase) * (amp * 0.5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle =
          wIdx === 0
            ? "rgba(6, 182, 212, 0.75)"
            : wIdx === 1
            ? "rgba(139, 92, 246, 0.65)"
            : "rgba(16, 185, 129, 0.45)";
        ctx.lineWidth = 3 - wIdx * 0.6;
        ctx.stroke();
      }

      // Frequency spectrum bars at bottom
      const bars = 42;
      const barWidth = (w - 120) / bars;
      for (let i = 0; i < bars; i++) {
        const norm =
          Math.abs(Math.sin(i * 0.35 + phase * 1.8) * Math.cos(i * 0.15 - phase)) *
          (isPlaying ? 1 : 0.2);
        const barHeight = Math.max(4, norm * 75);
        const bx = 60 + i * barWidth;
        const by = h - 30 - barHeight;
        ctx.fillStyle =
          i % 2 === 0 ? "rgba(6, 182, 212, 0.45)" : "rgba(139, 92, 246, 0.45)";
        ctx.fillRect(bx, by, barWidth - 4, barHeight);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    activeItem,
    videoExpanded,
    hasNativeVideoFrames,
    isPlaying,
    playbackRate,
  ]);

  const handleStop = useCallback(() => {
    const el = mediaRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setCurrentTime(0);
    onPlayPause(false);
  }, [onPlayPause]);

  const handleSkipSeconds = useCallback(
    (delta: number) => {
      const el = mediaRef.current;
      if (!el) return;
      const maxDur = el.duration || duration || 0;
      const nextTime = Math.max(
        0,
        Math.min(maxDur > 0 ? maxDur : Infinity, el.currentTime + delta)
      );
      el.currentTime = nextTime;
      setCurrentTime(nextTime);
    },
    [duration]
  );

  const handleSeekBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (mediaRef.current) {
      mediaRef.current.currentTime = newTime;
    }
  };

  const handlePrevNext = (direction: "prev" | "next") => {
    if (!activeItem || playlist.length === 0) return;
    const idx = playlist.findIndex((item) => item.id === activeItem.id);
    if (idx === -1) return;
    const nextIdx =
      direction === "next"
        ? (idx + 1) % playlist.length
        : (idx - 1 + playlist.length) % playlist.length;
    onSelectTrack(playlist[nextIdx]);
  };

  const cyclePlaybackRate = () => {
    const rates = [0.75, 1, 1.25, 1.5, 2];
    const next = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(next);
  };

  const toggleFullscreen = async () => {
    if (!videoStageRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await videoStageRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Ignore fullscreen restriction
    }
  };

  if (!activeItem) return null;

  const effectiveDuration = duration > 0 ? duration : activeItem.duration || 30;
  const progressPercent =
    effectiveDuration > 0
      ? Math.min(100, (currentTime / effectiveDuration) * 100)
      : 0;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 pointer-events-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-3 pointer-events-auto">
        {/* Expandable Video Theater Stage when playing MP4 */}
        {activeItem.media_type === "mp4" && videoExpanded && (
          <div
            ref={videoStageRef}
            className="mb-2 rounded-2xl overflow-hidden bg-[#090A0F] border border-cyan-500/30 shadow-2xl shadow-black/90 transition-all"
          >
            {/* Video Stage Top Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#12141D]/90 border-b border-white/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  <Film className="w-3 h-3" />
                  MP4 VIDEO
                </span>
                <h4 className="text-sm font-bold text-white truncate">
                  {activeItem.title}
                </h4>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="ملء الشاشة"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setVideoExpanded(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="تصغير نافذة الفيديو"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Container */}
            <div
              onClick={() => onPlayPause(!isPlaying)}
              className="relative w-full aspect-video max-h-[52vh] bg-black flex items-center justify-center cursor-pointer overflow-hidden"
            >
              {/* Synchronized Studio Visualizer Canvas for Demo MP4 items */}
              {!hasNativeVideoFrames && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={420}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none">
                    <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-mono mb-3">
                      معاينة مرئية سينمائية تفاعلية • MP4 STREAM
                    </span>
                    <h3 className="text-lg sm:text-2xl font-bold text-white max-w-xl drop-shadow">
                      {activeItem.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-lg mt-2 line-clamp-2">
                      {activeItem.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Center Play/Pause Overlay Button */}
              {!isPlaying && (
                <div className="absolute z-20 w-16 h-16 rounded-full bg-cyan-500/90 text-white flex items-center justify-center shadow-xl shadow-cyan-500/40 backdrop-blur-md transition-transform hover:scale-105">
                  <Play className="w-7 h-7 fill-current ml-0.5" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hidden or Embedded HTML5 Media Element (Handles both MP3 and MP4 seamlessly) */}
        <video
          ref={mediaRef}
          src={activeItem.file_url}
          playsInline
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            const el = e.currentTarget;
            if (el.duration && Number.isFinite(el.duration)) {
              setDuration(el.duration);
            }
            if (el.videoWidth > 0 && el.videoHeight > 0) {
              setHasNativeVideoFrames(true);
            } else {
              setHasNativeVideoFrames(false);
            }
          }}
          onEnded={() => {
            if (!isLooping) {
              onPlayPause(false);
            }
          }}
          className={
            activeItem.media_type === "mp4" &&
            videoExpanded &&
            hasNativeVideoFrames
              ? "w-full max-h-[50vh] bg-black rounded-t-2xl object-contain"
              : "hidden"
          }
        />

        {/* Main Glassmorphic Studio Player Deck */}
        <div className="rounded-2xl bg-[#12141D]/95 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/90 p-3 sm:p-4">
          {/* Interactive Timeline Scrubber */}
          <div className="flex items-center gap-3 mb-3" dir="ltr">
            <span className="text-xs font-mono tabular-nums text-slate-300 w-12 text-right">
              {formatDuration(currentTime)}
            </span>

            <div className="relative flex-1 flex items-center group">
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full transition-all duration-75 ${
                    activeItem.media_type === "mp4"
                      ? "bg-gradient-to-r from-cyan-500 to-violet-500"
                      : "bg-gradient-to-r from-violet-500 to-cyan-400"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={effectiveDuration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeekBarChange}
                aria-label="شريط تقدم الوسائط"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <span className="text-xs font-mono tabular-nums text-slate-400 w-12">
              {formatDuration(effectiveDuration)}
            </span>
          </div>

          {/* Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Right Side (RTL): Active Work Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={`relative w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                  activeItem.media_type === "mp4"
                    ? "bg-cyan-500/15 border-cyan-500/35 text-cyan-300"
                    : "bg-violet-500/15 border-violet-500/35 text-violet-300"
                }`}
              >
                {activeItem.media_type === "mp4" ? (
                  <Film className="w-5 h-5" />
                ) : (
                  <Music className="w-5 h-5" />
                )}
                {isPlaying && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                      activeItem.media_type === "mp4"
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "bg-violet-500/20 text-violet-300"
                    }`}
                  >
                    {activeItem.media_type.toUpperCase()}
                  </span>
                  <h4 className="text-sm font-bold text-white truncate">
                    {activeItem.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {activeItem.description || "عمل فني من المعرض الشخصي"}
                </p>
              </div>
            </div>

            {/* Center: Transport Controls (Play, Pause, Stop, -10s, +10s, Prev, Next) */}
            <div
              className="flex items-center gap-1.5 sm:gap-2"
              dir="ltr"
            >
              {/* Previous Track */}
              <button
                onClick={() => handlePrevNext("prev")}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="العمل السابق"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Rewind 10s (تأخير 10 ثوانٍ) */}
              <button
                onClick={() => handleSkipSeconds(-10)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-200 text-xs font-mono transition-colors"
                title="تأخير 10 ثوانٍ"
              >
                <RotateCcw className="w-3.5 h-3.5 text-violet-400" />
                <span>-10s</span>
              </button>

              {/* Play / Pause Main Button */}
              <button
                onClick={() => onPlayPause(!isPlaying)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg transition-all ${
                  activeItem.media_type === "mp4"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/25 hover:brightness-110"
                    : "bg-gradient-to-r from-violet-600 to-indigo-600 shadow-violet-600/25 hover:brightness-110"
                }`}
                title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              {/* Stop Button (إيقاف كامل) */}
              <button
                onClick={handleStop}
                className="p-2 rounded-xl bg-white/[0.05] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition-colors"
                title="إيقاف وإعادة للبداية"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>

              {/* Forward 10s (تقديم 10 ثوانٍ) */}
              <button
                onClick={() => handleSkipSeconds(10)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-200 text-xs font-mono transition-colors"
                title="تقديم 10 ثوانٍ"
              >
                <span>+10s</span>
                <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              </button>

              {/* Next Track */}
              <button
                onClick={() => handlePrevNext("next")}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="العمل التالي"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Left Side (RTL): Volume Slider, Speed, Video Toggle, Close */}
            <div
              className="flex items-center gap-2 sm:gap-3 justify-end flex-1"
              dir="ltr"
            >
              {/* Volume Control */}
              <div className="hidden md:flex items-center gap-2 bg-white/[0.04] px-3 py-1.5 rounded-xl border border-white/[0.06]">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-300 hover:text-white transition-colors"
                  title={isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="w-4 h-4 text-violet-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setVolume(val);
                    if (val > 0 && isMuted) setIsMuted(false);
                  }}
                  aria-label="مستوى الصوت"
                  className="w-20 accent-violet-500 cursor-pointer h-1.5 bg-white/15 rounded-lg"
                />
                <span className="text-[11px] font-mono tabular-nums text-slate-400 w-8 text-right">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>

              {/* Playback Speed */}
              <button
                onClick={cyclePlaybackRate}
                className="px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs font-mono font-semibold text-slate-300 border border-white/[0.06] transition-colors"
                title="سرعة التشغيل"
              >
                {playbackRate}x
              </button>

              {/* Loop Toggle */}
              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`p-2 rounded-xl border transition-colors ${
                  isLooping
                    ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                    : "bg-white/[0.04] border-white/[0.06] text-slate-400 hover:text-white"
                }`}
                title="تكرار التشغيل"
              >
                <Repeat className="w-4 h-4" />
              </button>

              {/* Toggle Video Theater if MP4 */}
              {activeItem.media_type === "mp4" && (
                <button
                  onClick={() => setVideoExpanded(!videoExpanded)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-colors"
                >
                  {videoExpanded ? (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">إخفاء الفيديو</span>
                    </>
                  ) : (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">عرض الفيديو</span>
                    </>
                  )}
                </button>
              )}

              {/* Close Player */}
              <button
                onClick={() => {
                  handleStop();
                  onClose();
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="إغلاق المشغل"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
