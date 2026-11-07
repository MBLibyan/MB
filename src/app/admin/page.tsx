"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Lock,
  Mail,
  KeyRound,
  LogOut,
  UploadCloud,
  FileAudio,
  FileVideo,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
  Play,
  Pause,
  Search,
  Plus,
  Loader2,
  Sparkles,
  ExternalLink,
  X,
  Database,
  Clock,
  HardDrive,
  ShieldCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import MediaPlayer from "@/components/MediaPlayer";
import SetupGuideModal from "@/components/SetupGuideModal";
import { MediaItem, MediaType, UploadProgressState } from "@/types/media";
import {
  getSupabaseClient,
  isSupabaseConfigured,
  fetchMediaItems,
  uploadMediaFileWithProgress,
  createMediaItemRecord,
  updateMediaItemRecord,
  deleteMediaItemCompletely,
  extractMediaDuration,
  formatDuration,
  formatFileSize,
} from "@/lib/supabase";

const DEMO_AUTH_STORAGE_KEY = "mb_demo_admin_session";

export default function AdminDashboardPage() {
  // Authentication State
  const [authChecking, setAuthChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  // Media Inventory State
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [adminSearch, setAdminSearch] = useState("");
  const [adminFilterType, setAdminFilterType] = useState<"all" | "mp3" | "mp4">(
    "all"
  );

  // Upload & Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("mp3");
  const [detectedDuration, setDetectedDuration] = useState<number>(0);
  const [uploadState, setUploadState] = useState<UploadProgressState>({
    phase: "idle",
    percentage: 0,
    loadedBytes: 0,
    totalBytes: 0,
    message: "",
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadAbortRef = useRef<AbortController | null>(null);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editMediaType, setEditMediaType] = useState<MediaType>("mp3");
  const [editSaving, setEditSaving] = useState(false);

  // Delete Confirmation State
  const [deletingItem, setDeletingItem] = useState<MediaItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Built-in Preview Player State inside Admin
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // Check Auth Session
  const checkAuthAndLoad = async () => {
    setAuthChecking(true);
    const configured = isSupabaseConfigured();
    setIsSupabaseLive(configured);
    const supabase = getSupabaseClient();

    if (supabase) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setAdminEmail(session?.user?.email || null);
    } else {
      // Check demo session
      const demoUser =
        typeof window !== "undefined"
          ? window.localStorage.getItem(DEMO_AUTH_STORAGE_KEY)
          : null;
      setAdminEmail(demoUser);
    }
    setAuthChecking(false);
  };

  const loadMediaList = async () => {
    setLoadingItems(true);
    const res = await fetchMediaItems();
    setItems(res.items);
    if (res.error) {
      showToast("error", `تنبيه قاعدة البيانات: ${res.error}`);
    }
    setLoadingItems(false);
  };

  useEffect(() => {
    checkAuthAndLoad();
    loadMediaList();

    const supabase = getSupabaseClient();
    const authSub = supabase?.auth.onAuthStateChange((_event, session) => {
      setAdminEmail(session?.user?.email || null);
    });

    const handleConfigUpdate = () => {
      checkAuthAndLoad();
      loadMediaList();
    };
    window.addEventListener("mb-media-updated", handleConfigUpdate);

    return () => {
      authSub?.data.subscription.unsubscribe();
      window.removeEventListener("mb-media-updated", handleConfigUpdate);
    };
  }, []);

  // Handle Supabase Auth Sign In
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail.trim(),
          password: loginPassword,
        });
        if (error) {
          throw new Error(
            error.message === "Invalid login credentials"
              ? "البريد الإلكتروني أو كلمة المرور غير صحيحة."
              : error.message
          );
        }
        setAdminEmail(data.user?.email || loginEmail.trim());
        showToast("success", "تم تسجيل الدخول بنجاح عبر Supabase Auth!");
      } else {
        // Demo mode login
        const emailToUse = loginEmail.trim() || "admin@mb-studio.ly";
        window.localStorage.setItem(DEMO_AUTH_STORAGE_KEY, emailToUse);
        setAdminEmail(emailToUse);
        showToast(
          "success",
          "تم تسجيل الدخول في وضع المعاينة التفاعلي! يمكنك تجربة رفع وإدارة الملفات."
        );
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "حدث خطأ أثناء تسجيل الدخول.";
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDemoQuickLogin = () => {
    const demoEmail = "admin@mb-studio.ly";
    window.localStorage.setItem(DEMO_AUTH_STORAGE_KEY, demoEmail);
    setAdminEmail(demoEmail);
    showToast("success", "تم الدخول إلى لوحة التحكم في وضع المعاينة التفاعلي.");
  };

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DEMO_AUTH_STORAGE_KEY);
    }
    setAdminEmail(null);
    showToast("success", "تم تسجيل الخروج بنجاح.");
  };

  // Handle File Selection (Drag & Drop or File Picker)
  const processSelectedFile = async (file: File) => {
    const lowerName = file.name.toLowerCase();
    const isVideo =
      file.type.includes("video") ||
      lowerName.endsWith(".mp4") ||
      lowerName.endsWith(".mov") ||
      lowerName.endsWith(".webm");
    const isAudio =
      file.type.includes("audio") ||
      lowerName.endsWith(".mp3") ||
      lowerName.endsWith(".wav") ||
      lowerName.endsWith(".m4a") ||
      lowerName.endsWith(".ogg");

    if (!isVideo && !isAudio) {
      showToast(
        "error",
        "يرجى اختيار ملف صوتي (MP3) أو ملف فيديو (MP4) صالح."
      );
      return;
    }

    const detectedType: MediaType = isVideo ? "mp4" : "mp3";
    setSelectedFile(file);
    setMediaType(detectedType);

    // Pre-fill title if empty
    if (!title.trim()) {
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]+/g, " ");
      setTitle(cleanTitle);
    }

    // Extract duration automatically
    const dur = await extractMediaDuration(file);
    setDetectedDuration(dur);
    setUploadState({
      phase: "idle",
      percentage: 0,
      loadedBytes: 0,
      totalBytes: file.size,
      message: "",
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processSelectedFile(droppedFile);
    }
  };

  // Handle Upload & Save to Supabase Storage + Database
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast("error", "يرجى سحب وإفلات ملف MP3 أو MP4 أولاً.");
      return;
    }
    if (!title.trim()) {
      showToast("error", "يرجى إدخال عنوان العمل.");
      return;
    }

    const controller = new AbortController();
    uploadAbortRef.current = controller;

    try {
      setUploadState({
        phase: "uploading_storage",
        percentage: 1,
        loadedBytes: 0,
        totalBytes: selectedFile.size,
        message: "جاري رفع الملف إلى Supabase Storage...",
      });

      const { publicUrl, storagePath } = await uploadMediaFileWithProgress({
        file: selectedFile,
        mediaType,
        signal: controller.signal,
        onProgress: (percentage, loadedBytes, totalBytes) => {
          setUploadState({
            phase: "uploading_storage",
            percentage,
            loadedBytes,
            totalBytes,
            message: `جاري رفع الملف إلى Supabase Storage (${percentage}%)...`,
          });
        },
      });

      setUploadState((prev) => ({
        ...prev,
        phase: "saving_database",
        percentage: 100,
        message: "جاري حفظ تفاصيل العمل والرابط العام في قاعدة البيانات...",
      }));

      const created = await createMediaItemRecord({
        title: title.trim(),
        description: description.trim(),
        media_type: mediaType,
        file_url: publicUrl,
        storage_path: storagePath,
        file_size: selectedFile.size,
        duration: detectedDuration,
      });

      setItems((prev) => [created, ...prev.filter((i) => i.id !== created.id)]);

      setUploadState({
        phase: "completed",
        percentage: 100,
        loadedBytes: selectedFile.size,
        totalBytes: selectedFile.size,
        message: "تم رفع الملف وحفظ العمل بنجاح!",
      });

      showToast("success", `تم رفع وإضافة "${created.title}" بنجاح!`);

      // Reset form after short delay
      setSelectedFile(null);
      setTitle("");
      setDescription("");
      setDetectedDuration(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setTimeout(() => {
        setUploadState((prev) =>
          prev.phase === "completed"
            ? {
                phase: "idle",
                percentage: 0,
                loadedBytes: 0,
                totalBytes: 0,
                message: "",
              }
            : prev
        );
      }, 3000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "حدث خطأ غير متوقع أثناء الرفع.";
      setUploadState((prev) => ({
        ...prev,
        phase: "error",
        message: msg,
      }));
      showToast("error", msg);
    }
  };

  // Open Edit Modal
  const openEditModal = (item: MediaItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description || "");
    setEditMediaType(item.media_type);
  };

  // Handle Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editTitle.trim()) return;
    setEditSaving(true);
    try {
      const updated = await updateMediaItemRecord(editingItem.id, {
        title: editTitle,
        description: editDescription,
        media_type: editMediaType,
      });
      setItems((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      if (activeItem?.id === updated.id) {
        setActiveItem(updated);
      }
      setEditingItem(null);
      showToast("success", "تم حفظ التعديلات بنجاح.");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "تعذر تحديث تفاصيل العمل.";
      showToast("error", msg);
    } finally {
      setEditSaving(false);
    }
  };

  // Handle Permanent Delete (Storage + Database)
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setDeleteLoading(true);
    try {
      await deleteMediaItemCompletely(deletingItem);
      setItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
      if (activeItem?.id === deletingItem.id) {
        setActiveItem(null);
        setIsPlaying(false);
      }
      showToast(
        "success",
        `تم حذف "${deletingItem.title}" نهائياً من قاعدة البيانات والتخزين.`
      );
      setDeletingItem(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل حذف العمل.";
      showToast("error", msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredAdminItems = useMemo(() => {
    return items.filter((item) => {
      const matchesType =
        adminFilterType === "all" || item.media_type === adminFilterType;
      const q = adminSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q));
      return matchesType && matchesSearch;
    });
  }, [items, adminFilterType, adminSearch]);

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col pb-40">
      <Navbar />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl text-xs sm:text-sm font-semibold transition-all bg-[#12141D]/95 border-white/15">
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span
            className={
              toastMessage.type === "success"
                ? "text-emerald-200"
                : "text-rose-200"
            }
          >
            {toastMessage.text}
          </span>
        </div>
      )}

      {authChecking ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex items-center gap-3 text-slate-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
            <span>جاري التحقق من جلسة المسؤول (Supabase Auth)...</span>
          </div>
        </div>
      ) : !adminEmail ? (
        /* ====================================================================
           UNAUTHENTICATED VIEW: SUPABASE AUTH ADMIN LOGIN GATE
           ==================================================================== */
        <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
          <div className="pointer-events-none absolute top-1/4 right-1/3 w-96 h-96 rounded-full bg-[#C6A664]/10 blur-[130px]" />

          <div className="w-full max-w-md rounded-3xl bg-[#14171E] border border-[#C6A664]/45 shadow-2xl p-6 sm:p-8 relative z-10 gold-border-glow">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#26221B] border border-[#C6A664]/60 flex items-center justify-center text-[#E5C883] mb-4 shadow-lg">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#F5EFE0]">
                تسجيل دخول المسؤول
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
                لوحة التحكم المحمية لإدارة ورفع ملفات الصوت (MP3) والفيديو (MP4)
              </p>
            </div>

            {authError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#D8C292] mb-1.5">
                  البريد الإلكتروني للأدمن
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#C6A664] absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    dir="ltr"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@yourdomain.com"
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[#0B0D11] border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#C6A664] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D8C292] mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#C6A664] absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    dir="ltr"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[#0B0D11] border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#C6A664] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-b from-[#E7C986] to-[#A68546] hover:brightness-105 disabled:opacity-50 text-[#0E1014] text-sm font-extrabold shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري تسجيل الدخول...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>تسجيل الدخول إلى لوحة التحكم</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* ====================================================================
           AUTHENTICATED ADMIN DASHBOARD WORKSPACE
           ==================================================================== */
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 flex-1 space-y-8">
          {/* Admin Header Bar */}
          <div className="p-5 rounded-2xl bg-[#12141D] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/35 flex items-center justify-center text-violet-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-extrabold text-white">
                    لوحة تحكم وإدارة الأعمال
                  </h1>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold border bg-emerald-500/15 border-emerald-500/30 text-emerald-300">
                    متصل بـ Supabase
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  المسؤول المسجل: {adminEmail}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-xs font-semibold text-rose-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>

          {/* 2-Column Studio Workspace: Upload Studio + Inventory Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Column 1 (Right in RTL - 5 cols): Drag & Drop Upload & Details Form */}
            <section className="lg:col-span-5 rounded-2xl bg-[#12141D] border border-white/[0.08] p-5 sm:p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      رفع عمل جديد (MP3 / MP4)
                    </h2>
                    <p className="text-xs text-slate-400">
                      رفع مباشر إلى Supabase Storage مع حفظ الرابط العام
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* Drag & Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                    isDraggingOver
                      ? "border-cyan-400 bg-cyan-500/10 scale-[1.01]"
                      : selectedFile
                      ? "border-emerald-500/50 bg-emerald-500/[0.05]"
                      : "border-white/15 hover:border-violet-500/50 bg-[#090A0F]/60 hover:bg-violet-500/[0.04]"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mp3,.mp4,audio/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) processSelectedFile(file);
                    }}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                        {mediaType === "mp4" ? (
                          <FileVideo className="w-6 h-6" />
                        ) : (
                          <FileAudio className="w-6 h-6" />
                        )}
                      </div>
                      <p className="text-sm font-bold text-white truncate px-2">
                        {selectedFile.name}
                      </p>
                      <div className="flex items-center justify-center gap-3 text-xs text-slate-400 font-mono">
                        <span>{formatFileSize(selectedFile.size)}</span>
                        <span>•</span>
                        <span>{mediaType.toUpperCase()}</span>
                        {detectedDuration > 0 && (
                          <>
                            <span>•</span>
                            <span>{formatDuration(detectedDuration)}</span>
                          </>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 pt-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>إزالة واختيار ملف آخر</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 py-2">
                      <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center mx-auto">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-200">
                          اسحب وأفلت ملف الصوت أو الفيديو هنا
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          أو اضغط لاستعراض الملفات من جهازك (يدعم MP3 و MP4)
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <span className="px-2.5 py-0.5 rounded-md bg-violet-500/15 text-violet-300 text-[11px] font-mono">
                          MP3 Audio
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 text-[11px] font-mono">
                          MP4 Video
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Work Type Selector (MP3 / MP4) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    نوع العمل
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setMediaType("mp3")}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                        mediaType === "mp3"
                          ? "bg-violet-600/20 border-violet-500 text-violet-200 shadow-inner"
                          : "bg-[#090A0F] border-white/10 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <FileAudio className="w-4 h-4 text-violet-400" />
                      <span>عمل صوتي (MP3)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMediaType("mp4")}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                        mediaType === "mp4"
                          ? "bg-cyan-600/20 border-cyan-500 text-cyan-200 shadow-inner"
                          : "bg-[#090A0F] border-white/10 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <FileVideo className="w-4 h-4 text-cyan-400" />
                      <span>عمل مرئي (MP4)</span>
                    </button>
                  </div>
                </div>

                {/* Work Title Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    عنوان العمل <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: معزوفة الأفق السينمائي / إعلان مرئي..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0F] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                {/* Work Description Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    وصف العمل وتفاصيله
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="أضف نبذة مختصرة عن هذا العمل، الأدوات المستخدمة، أو سياق الإنتاج..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0F] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  />
                </div>

                {/* LIVE PROGRESS BAR (شريط التقدم الحي أثناء الرفع) */}
                {uploadState.phase !== "idle" && (
                  <div className="p-4 rounded-xl bg-[#090A0F] border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span
                        className={`font-semibold flex items-center gap-1.5 min-w-0 ${
                          uploadState.phase === "error"
                            ? "text-rose-400"
                            : uploadState.phase === "completed"
                            ? "text-emerald-400"
                            : "text-cyan-300"
                        }`}
                      >
                        {(uploadState.phase === "uploading_storage" ||
                          uploadState.phase === "saving_database") && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                        )}
                        {uploadState.phase === "completed" && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        <span className="truncate">{uploadState.message}</span>
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold tabular-nums text-white">
                          {uploadState.percentage}%
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              uploadState.phase === "uploading_storage" ||
                              uploadState.phase === "saving_database"
                            ) {
                              uploadAbortRef.current?.abort();
                            }
                            setUploadState({
                              phase: "idle",
                              percentage: 0,
                              loadedBytes: 0,
                              totalBytes: 0,
                              message: "",
                            });
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/35 text-rose-200 text-[11px] font-bold transition-colors"
                          title="إغلاق أو إلغاء"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>
                            {uploadState.phase === "uploading_storage"
                              ? "إلغاء"
                              : "إغلاق"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-150 rounded-full ${
                          uploadState.phase === "error"
                            ? "bg-rose-500"
                            : uploadState.phase === "completed"
                            ? "bg-emerald-500"
                            : "bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400"
                        }`}
                        style={{ width: `${uploadState.percentage}%` }}
                      />
                    </div>

                    {uploadState.totalBytes > 0 && (
                      <div
                        className="flex items-center justify-between text-[11px] font-mono text-slate-400"
                        dir="ltr"
                      >
                        <span>{formatFileSize(uploadState.loadedBytes)}</span>
                        <span>{formatFileSize(uploadState.totalBytes)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Upload Button */}
                <button
                  type="submit"
                  disabled={
                    uploadState.phase === "uploading_storage" ||
                    uploadState.phase === "saving_database"
                  }
                  className="w-full py-3 rounded-xl bg-gradient-to-l from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  {uploadState.phase === "uploading_storage" ||
                  uploadState.phase === "saving_database" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الرفع والحفظ...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>رفع الملف وحفظ العمل في المعرض</span>
                    </>
                  )}
                </button>
              </form>
            </section>

            {/* Column 2 (Left in RTL - 7 cols): Uploaded Works Management Table / List */}
            <section className="lg:col-span-7 rounded-2xl bg-[#12141D] border border-white/[0.08] p-5 sm:p-6 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.07] pb-4">
                <div>
                  <h2 className="text-base font-bold text-white">
                    إدارة الأعمال المرفوعة حالياً ({items.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    معاينة، تعديل التفاصيل، أو الحذف النهائي من قاعدة البيانات و Supabase Storage
                  </p>
                </div>

                {/* Filter Pills inside Admin */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090A0F] border border-white/[0.06] self-start">
                  <button
                    onClick={() => setAdminFilterType("all")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      adminFilterType === "all"
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    الكل ({items.length})
                  </button>
                  <button
                    onClick={() => setAdminFilterType("mp3")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      adminFilterType === "mp3"
                        ? "bg-violet-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    MP3
                  </button>
                  <button
                    onClick={() => setAdminFilterType("mp4")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      adminFilterType === "mp4"
                        ? "bg-cyan-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    MP4
                  </button>
                </div>
              </div>

              {/* Search inside Admin Inventory */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="ابحث في الأعمال المرفوعة..."
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[#090A0F] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Works Table / List */}
              {loadingItems ? (
                <div className="space-y-3 py-6">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="h-16 rounded-xl bg-white/[0.03] animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredAdminItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  لا توجد أعمال مطابقة حالياً. قم برفع عمل جديد من النموذج الجانبي.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAdminItems.map((item) => {
                    const isCurrent = activeItem?.id === item.id;
                    const isItemPlaying = isCurrent && isPlaying;
                    const isVideo = item.media_type === "mp4";

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl bg-[#090A0F]/80 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isCurrent
                            ? "border-violet-500/50 bg-violet-500/[0.04]"
                            : "border-white/[0.07] hover:border-white/15"
                        }`}
                      >
                        {/* Work Info & Preview Play Button */}
                        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (isCurrent) {
                                setIsPlaying(!isPlaying);
                              } else {
                                setActiveItem(item);
                                setIsPlaying(true);
                              }
                            }}
                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                              isItemPlaying
                                ? "bg-violet-600 border-violet-400 text-white shadow-lg shadow-violet-600/30"
                                : isVideo
                                ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25"
                                : "bg-violet-500/15 border-violet-500/30 text-violet-300 hover:bg-violet-500/25"
                            }`}
                            title={isItemPlaying ? "إيقاف المعاينة" : "تشغيل ومعاينة"}
                          >
                            {isItemPlaying ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                                  isVideo
                                    ? "bg-cyan-500/20 text-cyan-300"
                                    : "bg-violet-500/20 text-violet-300"
                                }`}
                              >
                                {item.media_type.toUpperCase()}
                              </span>
                              <h3 className="text-sm font-bold text-white truncate">
                                {item.title}
                              </h3>
                            </div>

                            <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                              {item.description || "بدون وصف"}
                            </p>

                            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 font-mono">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(item.duration)}
                              </span>
                              <span dir="ltr" className="inline-flex items-center gap-1">
                                <HardDrive className="w-3 h-3" />
                                {formatFileSize(item.file_size)}
                              </span>
                              <span className="truncate max-w-[160px]" dir="ltr">
                                {item.storage_path}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Admin Actions: Open Direct Link, Edit Details, Permanent Delete */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <a
                            href={item.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="فتح الرابط المباشر (Public URL)"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 text-xs font-semibold transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>تعديل</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingItem(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </main>
      )}

      {/* ====================================================================
          EDIT WORK DETAILS MODAL
          ==================================================================== */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#12141D] border border-white/15 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#090A0F]/60">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-violet-400" />
                <span>تعديل تفاصيل العمل</span>
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  عنوان العمل
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0F] border border-white/10 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  نوع العمل
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditMediaType("mp3")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold ${
                      editMediaType === "mp3"
                        ? "bg-violet-600/20 border-violet-500 text-violet-200"
                        : "bg-[#090A0F] border-white/10 text-slate-400"
                    }`}
                  >
                    صوت (MP3)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMediaType("mp4")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold ${
                      editMediaType === "mp4"
                        ? "bg-cyan-600/20 border-cyan-500 text-cyan-200"
                        : "bg-[#090A0F] border-white/10 text-slate-400"
                    }`}
                  >
                    فيديو (MP4)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  الوصف
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0F] border border-white/10 text-sm text-white focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white flex items-center gap-1.5"
                >
                  {editSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          PERMANENT DELETE CONFIRMATION MODAL (DB + SUPABASE STORAGE)
          ==================================================================== */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#12141D] border border-rose-500/30 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  تأكيد الحذف النهائي
                </h3>
                <p className="text-xs text-slate-400">
                  سيتم حذف العمل من قاعدة البيانات ومن Supabase Storage نهائياً
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090A0F] border border-white/10 text-xs space-y-1">
              <p className="font-bold text-slate-200">{deletingItem.title}</p>
              <p className="font-mono text-slate-500" dir="ltr">
                {deletingItem.storage_path}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
              >
                تراجع
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-rose-600/25"
              >
                {deleteLoading && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                <span>نعم، احذف العمل نهائياً</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Setup Guide Modal */}
      <SetupGuideModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
      />

      {/* Built-in Interactive Media Player for Admin Preview */}
      <MediaPlayer
        activeItem={activeItem}
        playlist={filteredAdminItems.length > 0 ? filteredAdminItems : items}
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
