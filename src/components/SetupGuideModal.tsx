"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Copy,
  Check,
  Database,
  Cloud,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  getSupabaseConfig,
  isSupabaseConfigured,
  saveRuntimeSupabaseConfig,
  clearRuntimeSupabaseConfig,
} from "@/lib/supabase";

const SQL_SETUP_SCRIPT = `-- 1. إنشاء جدول الأعمال الصوتية والمرئية (media_items)
CREATE TABLE IF NOT EXISTS public.media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  media_type TEXT NOT NULL CHECK (media_type IN ('mp3', 'mp4')),
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  duration INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. تفعيل حماية الصفوف (RLS) وسياسات الوصول
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON public.media_items
  FOR SELECT TO public USING (true);

CREATE POLICY "Admin insert access" ON public.media_items
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin update access" ON public.media_items
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin delete access" ON public.media_items
  FOR DELETE TO authenticated USING (true);

-- 3. إنشاء حاوية التخزين العامة (media bucket) وسياساتها
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public read media bucket" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'media');

CREATE POLICY "Admin upload media bucket" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');

CREATE POLICY "Admin delete media bucket" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'media');`;

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SetupGuideModal({ isOpen, onClose }: SetupGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"vercel" | "sql" | "connect">("vercel");
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const [urlInput, setUrlInput] = useState("");
  const [anonKeyInput, setAnonKeyInput] = useState("");
  const [bucketInput, setBucketInput] = useState("media");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrlInput(cfg.url);
      setAnonKeyInput(cfg.anonKey);
      setBucketInput(cfg.bucket || "media");
      setConfigured(isSupabaseConfigured());
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SETUP_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleCopyEnv = () => {
    const envBlock = `NEXT_PUBLIC_SUPABASE_URL=${urlInput || "https://your-project-id.supabase.co"}\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKeyInput || "your-supabase-anon-key"}\nNEXT_PUBLIC_SUPABASE_BUCKET=${bucketInput || "media"}`;
    navigator.clipboard.writeText(envBlock);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  const handleSaveRuntimeConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !anonKeyInput.trim()) return;
    saveRuntimeSupabaseConfig({
      url: urlInput,
      anonKey: anonKeyInput,
      bucket: bucketInput || "media",
    });
    setConfigured(true);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleClearRuntimeConfig = () => {
    clearRuntimeSupabaseConfig();
    const cfg = getSupabaseConfig();
    setUrlInput(cfg.url);
    setAnonKeyInput(cfg.anonKey);
    setBucketInput(cfg.bucket || "media");
    setConfigured(isSupabaseConfigured());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#12141D] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#090A0F]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                دليل الربط السريع بـ Supabase و Vercel
              </h2>
              <p className="text-xs text-slate-400">
                خطوات إعداد قاعدة البيانات، حاوية الملفات، ومتغيرات البيئة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-[#090A0F]/40 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab("vercel")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all ${
              activeTab === "vercel"
                ? "border-violet-500 text-violet-400 bg-violet-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>1. ربط المفاتيح في Vercel</span>
          </button>
          <button
            onClick={() => setActiveTab("sql")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all ${
              activeTab === "sql"
                ? "border-cyan-500 text-cyan-400 bg-cyan-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>2. كود جدول Supabase SQL</span>
          </button>
          <button
            onClick={() => setActiveTab("connect")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all ${
              activeTab === "connect"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>3. ربط مباشر فوري من المتصفح</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm leading-relaxed text-slate-300">
          {activeTab === "vercel" && (
            <div className="space-y-5">
              <div className="rounded-xl bg-violet-500/10 border border-violet-500/25 p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-100 mb-1">
                    كيفية ربط المفاتيح في Vercel (Environment Variables)
                  </h4>
                  <p className="text-xs text-slate-300">
                    يقرأ تطبيق Next.js مفاتيح الاتصال تلقائياً من متغيرات البيئة التالية عند النشر على Vercel أو في ملف <code className="text-violet-300 font-mono">.env.local</code>.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-violet-600/30 border border-violet-500/40 text-violet-300 flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-slate-100">
                      استخراج المفاتيح من لوحة تحكم Supabase
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      ادخل إلى مشروعك في Supabase ثم انتقل إلى{" "}
                      <code className="text-cyan-300 font-mono">Project Settings → API</code>{" "}
                      وانسخ كلاً من <strong>Project URL</strong> ومفتاح{" "}
                      <strong>anon / public key</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-violet-600/30 border border-violet-500/40 text-violet-300 flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-slate-100">
                        إضافة المتغيرات في Vercel
                      </p>
                      <button
                        onClick={handleCopyEnv}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-200 transition-colors"
                      >
                        {copiedEnv ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ المتغيرات</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                      في لوحة تحكم Vercel، افتح مشروعك ثم انتقل إلى{" "}
                      <code className="text-cyan-300 font-mono">
                        Settings → Environment Variables
                      </code>{" "}
                      وأضف القيم التالية:
                    </p>
                    <pre
                      dir="ltr"
                      className="p-3.5 rounded-xl bg-[#090A0F] border border-white/10 font-mono text-xs text-emerald-300 overflow-x-auto"
                    >
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_BUCKET=media`}
                    </pre>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-violet-600/30 border border-violet-500/40 text-violet-300 flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-slate-100">
                      إنشاء حساب الأدمن في Supabase Auth
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      من قائمة{" "}
                      <code className="text-cyan-300 font-mono">
                        Authentication → Users → Add User
                      </code>{" "}
                      في Supabase، أنشئ بريدك الإلكتروني وكلمة المرور الخاصة بك لتسجيل الدخول في صفحة{" "}
                      <code className="text-violet-300 font-mono">/admin</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "sql" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-100">
                    سكربت تهيئة الجدول وحاوية الملفات (SQL Editor)
                  </h4>
                  <p className="text-xs text-slate-400">
                    انسخ هذا الكود وشغّله مرة واحدة داخل قسم{" "}
                    <code className="text-cyan-300 font-mono">SQL Editor</code> في Supabase.
                  </p>
                </div>
                <button
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">تم نسخ كود SQL!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>نسخ كود SQL بالكامل</span>
                    </>
                  )}
                </button>
              </div>

              <pre
                dir="ltr"
                className="p-4 rounded-xl bg-[#090A0F] border border-white/10 font-mono text-xs text-slate-200 overflow-x-auto max-h-80 leading-relaxed"
              >
                {SQL_SETUP_SCRIPT}
              </pre>
            </div>
          )}

          {activeTab === "connect" && (
            <form onSubmit={handleSaveRuntimeConfig} className="space-y-4">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-100 mb-1">
                    اختبار الربط الفوري بمشروع Supabase الخاص بك
                  </h4>
                  <p className="text-xs text-slate-300">
                    يمكنك إدخال مفاتيح Supabase هنا لتجربة الاتصال الحي بقاعدة بياناتك وحاوية الملفات مباشرة من المتصفح قبل أو أثناء النشر على Vercel.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  رابط المشروع (NEXT_PUBLIC_SUPABASE_URL)
                </label>
                <input
                  type="url"
                  dir="ltr"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0F] border border-white/10 text-slate-100 font-mono text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  المفتاح العام (NEXT_PUBLIC_SUPABASE_ANON_KEY)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  required
                  value={anonKeyInput}
                  onChange={(e) => setAnonKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0F] border border-white/10 text-slate-100 font-mono text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  اسم حاوية التخزين في Supabase Storage (Bucket Name)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={bucketInput}
                  onChange={(e) => setBucketInput(e.target.value)}
                  placeholder="media"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0F] border border-white/10 text-slate-100 font-mono text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>تم حفظ مفاتيح الاتصال وتفعيل الربط المباشر مع Supabase بنجاح!</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                {configured ? (
                  <button
                    type="button"
                    onClick={handleClearRuntimeConfig}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 text-xs font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>إلغاء الربط والعودة لوضع المعاينة</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-500">
                    الوضع الحالي: وضع المعاينة المحلية التفاعلية
                  </span>
                )}

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/20 transition-all"
                >
                  حفظ وتفعيل اتصال Supabase
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
