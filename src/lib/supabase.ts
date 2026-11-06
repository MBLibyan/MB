import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { INITIAL_DEMO_MEDIA, MediaItem, MediaType } from "@/types/media";

const RUNTIME_CONFIG_KEY = "mb_supabase_runtime_config_v1";
const DEMO_ITEMS_STORAGE_KEY = "mb_demo_media_items_v1";
const IDB_DB_NAME = "mb_media_blob_store";
const IDB_STORE_NAME = "files";

export interface SupabaseRuntimeConfig {
  url: string;
  anonKey: string;
  bucket: string;
}

let cachedClient: SupabaseClient | null = null;
let cachedConfigSignature = "";

const DEFAULT_SUPABASE_URL = "https://vamvzvopctdfqzpjusbz.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_TwOkDEC5QB9GCcoX5k0yjQ_aR4dLxCm";

export function getSupabaseConfig(): SupabaseRuntimeConfig {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  const envKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    "";
  const envBucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET?.trim() || "media";

  if (
    envUrl &&
    envKey &&
    !envUrl.includes("your-project-id") &&
    envKey !== "your-supabase-anon-key"
  ) {
    return { url: envUrl, anonKey: envKey, bucket: envBucket };
  }

  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(RUNTIME_CONFIG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SupabaseRuntimeConfig>;
        if (parsed.url && parsed.anonKey) {
          return {
            url: parsed.url.trim().replace(/\/+$/, ""),
            anonKey: parsed.anonKey.trim(),
            bucket: (parsed.bucket || "media").trim(),
          };
        }
      }
    } catch {
      // Ignore localStorage parse error
    }
  }

  return {
    url: DEFAULT_SUPABASE_URL,
    anonKey: DEFAULT_SUPABASE_KEY,
    bucket: envBucket,
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith("http"));
}

export function saveRuntimeSupabaseConfig(config: SupabaseRuntimeConfig): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    RUNTIME_CONFIG_KEY,
    JSON.stringify({
      url: config.url.trim().replace(/\/+$/, ""),
      anonKey: config.anonKey.trim(),
      bucket: (config.bucket || "media").trim(),
    })
  );
  cachedClient = null;
  cachedConfigSignature = "";
  window.dispatchEvent(new Event("mb-media-updated"));
}

export function clearRuntimeSupabaseConfig(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(RUNTIME_CONFIG_KEY);
  cachedClient = null;
  cachedConfigSignature = "";
  window.dispatchEvent(new Event("mb-media-updated"));
}

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey || !config.url.startsWith("http")) {
    return null;
  }

  const signature = `${config.url}::${config.anonKey}`;
  if (!cachedClient || cachedConfigSignature !== signature) {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    cachedConfigSignature = signature;
  }

  return cachedClient;
}

// ============================================================================
// IndexedDB Helper for Demo Mode Local File Persistence across "/" and "/admin"
// ============================================================================
function openBlobDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available"));
      return;
    }
    const req = window.indexedDB.open(IDB_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveDemoBlob(storagePath: string, file: Blob): Promise<void> {
  try {
    const db = await openBlobDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_NAME, "readwrite");
      tx.objectStore(IDB_STORE_NAME).put(file, storagePath);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Fallback if IDB blocked
  }
}

async function getDemoBlobUrl(storagePath: string): Promise<string | null> {
  try {
    const db = await openBlobDatabase();
    const blob = await new Promise<Blob | undefined>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_NAME, "readonly");
      const req = tx.objectStore(IDB_STORE_NAME).get(storagePath);
      req.onsuccess = () => resolve(req.result as Blob | undefined);
      req.onerror = () => reject(req.error);
    });
    if (blob) {
      return URL.createObjectURL(blob);
    }
  } catch {
    // Ignore IDB error
  }
  return null;
}

async function deleteDemoBlob(storagePath: string): Promise<void> {
  try {
    const db = await openBlobDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_NAME, "readwrite");
      tx.objectStore(IDB_STORE_NAME).delete(storagePath);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore
  }
}

function getLocalDemoItems(): MediaItem[] {
  if (typeof window === "undefined") return INITIAL_DEMO_MEDIA;
  try {
    const raw = window.localStorage.getItem(DEMO_ITEMS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(
        DEMO_ITEMS_STORAGE_KEY,
        JSON.stringify(INITIAL_DEMO_MEDIA)
      );
      return INITIAL_DEMO_MEDIA;
    }
    return JSON.parse(raw) as MediaItem[];
  } catch {
    return INITIAL_DEMO_MEDIA;
  }
}

function setLocalDemoItems(items: MediaItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_ITEMS_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("mb-media-updated"));
}

// ============================================================================
// Core Data & Storage Operations (Supabase + Demo Fallback)
// ============================================================================

/**
 * جلب جميع الأعمال الصوتية والمرئية مرتبة من الأحدث للأقدم
 */
export async function fetchMediaItems(): Promise<{
  items: MediaItem[];
  source: "supabase" | "demo";
  error?: string;
}> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("media_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return {
        items: getLocalDemoItems(),
        source: "supabase",
        error:
          error.message.includes("media_items") ||
          error.message.includes("schema cache") ||
          error.message.includes("does not exist")
            ? "لم يتم إنشاء جدول media_items في Supabase بعد. يرجى نسخ وتشغيل كود SQL من نافذة (إرشادات Vercel & Supabase) داخل SQL Editor في Supabase."
            : error.message,
      };
    }

    return {
      items: (data || []) as MediaItem[],
      source: "supabase",
    };
  }

  // Demo mode: hydrate any locally uploaded blobs from IndexedDB
  const localItems = getLocalDemoItems();
  const hydrated = await Promise.all(
    localItems.map(async (item) => {
      if (item.storage_path.startsWith("local-upload/")) {
        const blobUrl = await getDemoBlobUrl(item.storage_path);
        if (blobUrl) {
          return { ...item, file_url: blobUrl };
        }
      }
      return item;
    })
  );

  return {
    items: hydrated,
    source: "demo",
  };
}

/**
 * رفع ملف MP3 أو MP4 مباشرة إلى Supabase Storage مع شريط تقدم حي (Live Progress Bar)
 * وإرجاع الرابط العام المباشر (Public URL) ومسار التخزين (storage_path)
 */
export async function uploadMediaFileWithProgress(params: {
  file: File;
  mediaType: MediaType;
  onProgress: (percentage: number, loadedBytes: number, totalBytes: number) => void;
}): Promise<{ publicUrl: string; storagePath: string }> {
  const { file, mediaType, onProgress } = params;
  const supabase = getSupabaseClient();
  const config = getSupabaseConfig();

  // تنظيف اسم الملف لضمان توافقه مع مسارات Supabase Storage
  const ext =
    file.name.split(".").pop()?.toLowerCase() ||
    (mediaType === "mp4" ? "mp4" : "mp3");
  const safeBaseName = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 48) || "work";

  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  if (supabase && config.url && config.anonKey) {
    const storagePath = `${mediaType}/${uniqueId}-${safeBaseName}.${ext}`;

    // الحصول على جلسة الأدمن الحالية لاستخدام رمز المصادقة (Access Token)
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const authToken = session?.access_token || config.anonKey;

    const uploadEndpoint = `${config.url}/storage/v1/object/${encodeURIComponent(
      config.bucket
    )}/${storagePath}`;

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadEndpoint, true);
      xhr.setRequestHeader("Authorization", `Bearer ${authToken}`);
      xhr.setRequestHeader("apikey", config.anonKey);
      xhr.setRequestHeader("x-upsert", "true");
      xhr.setRequestHeader(
        "Content-Type",
        file.type || (mediaType === "mp4" ? "video/mp4" : "audio/mpeg")
      );

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const pct = Math.min(99, Math.round((event.loaded / event.total) * 100));
          onProgress(pct, event.loaded, event.total);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress(100, file.size, file.size);
          resolve();
        } else {
          let errMsg = `فشل رفع الملف إلى Supabase Storage (رمز ${xhr.status})`;
          try {
            const parsed = JSON.parse(xhr.responseText);
            if (parsed.message || parsed.error) {
              errMsg = `${parsed.message || parsed.error}`;
            }
          } catch {
            // Ignore JSON parse error
          }
          reject(new Error(errMsg));
        }
      };

      xhr.onerror = () => {
        reject(new Error("تعذر الاتصال بخادم Supabase Storage أثناء الرفع."));
      };

      xhr.send(file);
    });

    // استخراج رابط التشغيل المباشر (Public URL) من Supabase Storage
    const { data: publicUrlData } = supabase.storage
      .from(config.bucket)
      .getPublicUrl(storagePath);

    return {
      publicUrl: publicUrlData.publicUrl,
      storagePath,
    };
  }

  // وضع المعاينة التجريبي (Demo Mode): محاكاة تقدم الرفع الحي مع حفظ الملف محلياً في IndexedDB
  const storagePath = `local-upload/${mediaType}/${uniqueId}-${safeBaseName}.${ext}`;
  const totalBytes = file.size || 1024 * 1024;
  const steps = 14;
  for (let step = 1; step <= steps; step++) {
    await new Promise((r) => setTimeout(r, 75));
    const pct = Math.round((step / steps) * 100);
    const loaded = Math.round((step / steps) * totalBytes);
    onProgress(pct, loaded, totalBytes);
  }

  await saveDemoBlob(storagePath, file);
  const objectUrl = URL.createObjectURL(file);

  return {
    publicUrl: objectUrl,
    storagePath,
  };
}

/**
 * حفظ بيانات العمل في جدول media_items داخل Supabase Database
 */
export async function createMediaItemRecord(input: {
  title: string;
  description: string;
  media_type: MediaType;
  file_url: string;
  storage_path: string;
  file_size: number;
  duration: number;
}): Promise<MediaItem> {
  const supabase = getSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("media_items")
      .insert([
        {
          title: input.title.trim(),
          description: input.description.trim(),
          media_type: input.media_type,
          file_url: input.file_url,
          storage_path: input.storage_path,
          file_size: input.file_size,
          duration: Math.round(input.duration || 0),
        },
      ])
      .select("*")
      .single();

    if (error) {
      throw new Error(`فشل حفظ البيانات في قاعدة البيانات: ${error.message}`);
    }

    window.dispatchEvent(new Event("mb-media-updated"));
    return data as MediaItem;
  }

  // وضع المعاينة التجريبي
  const newItem: MediaItem = {
    id: `local-${Date.now()}`,
    title: input.title.trim(),
    description: input.description.trim(),
    media_type: input.media_type,
    file_url: input.file_url,
    storage_path: input.storage_path,
    file_size: input.file_size,
    duration: Math.round(input.duration || 0),
    created_at: new Date().toISOString(),
  };

  const existing = getLocalDemoItems();
  setLocalDemoItems([newItem, ...existing]);
  return newItem;
}

/**
 * تعديل تفاصيل العمل المرفوع (العنوان، الوصف، النوع) في Supabase Database
 */
export async function updateMediaItemRecord(
  id: string,
  updates: {
    title: string;
    description: string;
    media_type: MediaType;
  }
): Promise<MediaItem> {
  const supabase = getSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("media_items")
      .update({
        title: updates.title.trim(),
        description: updates.description.trim(),
        media_type: updates.media_type,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new Error(`فشل تحديث بيانات العمل: ${error.message}`);
    }

    window.dispatchEvent(new Event("mb-media-updated"));
    return data as MediaItem;
  }

  const existing = getLocalDemoItems();
  let updatedItem: MediaItem | null = null;
  const next = existing.map((item) => {
    if (item.id === id) {
      updatedItem = {
        ...item,
        title: updates.title.trim(),
        description: updates.description.trim(),
        media_type: updates.media_type,
        updated_at: new Date().toISOString(),
      };
      return updatedItem;
    }
    return item;
  });

  if (!updatedItem) {
    throw new Error("لم يتم العثور على العمل المطلوب تعديله.");
  }

  setLocalDemoItems(next);
  return updatedItem;
}

/**
 * حذف العمل نهائياً من قاعدة البيانات مع حذف الملف الأصلي من Supabase Storage
 */
export async function deleteMediaItemCompletely(item: MediaItem): Promise<void> {
  const supabase = getSupabaseClient();
  const config = getSupabaseConfig();

  if (supabase) {
    // 1. حذف الملف الفعلي من Supabase Storage إذا كان له storage_path
    if (item.storage_path && !item.storage_path.startsWith("demo/")) {
      const { error: storageError } = await supabase.storage
        .from(config.bucket)
        .remove([item.storage_path]);

      if (storageError) {
        console.warn("Storage file removal warning:", storageError.message);
      }
    }

    // 2. حذف السجل من جدول media_items في Supabase Database
    const { error: dbError } = await supabase
      .from("media_items")
      .delete()
      .eq("id", item.id);

    if (dbError) {
      throw new Error(`فشل حذف العمل من قاعدة البيانات: ${dbError.message}`);
    }

    window.dispatchEvent(new Event("mb-media-updated"));
    return;
  }

  // وضع المعاينة التجريبي
  if (item.storage_path.startsWith("local-upload/")) {
    await deleteDemoBlob(item.storage_path);
  }
  const existing = getLocalDemoItems();
  setLocalDemoItems(existing.filter((x) => x.id !== item.id));
}

/**
 * استخراج مدة الملف الصوتي أو المرئي بالثواني تلقائياً عند اختياره
 */
export function extractMediaDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(0);
      return;
    }
    const isVideo =
      file.type.includes("video") || file.name.toLowerCase().endsWith(".mp4");
    const element = document.createElement(isVideo ? "video" : "audio");
    const objectUrl = URL.createObjectURL(file);
    element.preload = "metadata";

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
    };

    const timeout = setTimeout(() => {
      cleanup();
      resolve(0);
    }, 4000);

    element.onloadedmetadata = () => {
      clearTimeout(timeout);
      const dur =
        Number.isFinite(element.duration) && element.duration > 0
          ? Math.round(element.duration)
          : 0;
      cleanup();
      resolve(dur);
    };

    element.onerror = () => {
      clearTimeout(timeout);
      cleanup();
      resolve(0);
    };

    element.src = objectUrl;
  });
}

export function formatDuration(seconds?: number): string {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return "00:00";
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "—";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`;
  }
  const kb = bytes / 1024;
  return `${Math.round(kb)} KB`;
}
