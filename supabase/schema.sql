-- ============================================================================
-- إعداد قاعدة البيانات وتخزين الملفات لمنصة استعراض الأعمال (MP3 & MP4)
-- قم بنسخ هذا الكود وتشغيله داخل (SQL Editor) في لوحة تحكم Supabase
-- ============================================================================

-- 1. تفعيل إضافة UUID إذا لم تكن مفعلة
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. إنشاء جدول الأعمال الصوتية والمرئية (media_items)
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

-- 3. تفعيل حماية الصفوف (Row Level Security - RLS)
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- 4. سياسات الأمان للجدول (Database Policies):
-- أ) السماح لجميع الزوار بقراءة واستعراض الأعمال (Public Viewer)
DROP POLICY IF EXISTS "Allow public read access to media_items" ON public.media_items;
CREATE POLICY "Allow public read access to media_items"
  ON public.media_items
  FOR SELECT
  TO public
  USING (true);

-- ب) السماح للأدمن المسجل دخوله فقط بإضافة أعمال جديدة
DROP POLICY IF EXISTS "Allow authenticated admin to insert media_items" ON public.media_items;
CREATE POLICY "Allow authenticated admin to insert media_items"
  ON public.media_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ج) السماح للأدمن المسجل دخوله فقط بتعديل تفاصيل الأعمال
DROP POLICY IF EXISTS "Allow authenticated admin to update media_items" ON public.media_items;
CREATE POLICY "Allow authenticated admin to update media_items"
  ON public.media_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- د) السماح للأدمن المسجل دخوله فقط بحذف الأعمال
DROP POLICY IF EXISTS "Allow authenticated admin to delete media_items" ON public.media_items;
CREATE POLICY "Allow authenticated admin to delete media_items"
  ON public.media_items
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- 5. إنشاء حاوية التخزين (Supabase Storage Bucket) باسم 'media'
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 6. سياسات الأمان لحاوية التخزين (Storage Policies):
-- أ) السماح للزوار بتشغيل وتحميل الملفات العامة من حاوية 'media'
DROP POLICY IF EXISTS "Public Access to Media Bucket" ON storage.objects;
CREATE POLICY "Public Access to Media Bucket"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'media');

-- ب) السماح للأدمن المسجل دخوله برفع ملفات MP3 و MP4 إلى حاوية 'media'
DROP POLICY IF EXISTS "Authenticated Admin Upload to Media Bucket" ON storage.objects;
CREATE POLICY "Authenticated Admin Upload to Media Bucket"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

-- ج) السماح للأدمن المسجل دخوله بتحديث أو حذف الملفات من حاوية 'media'
DROP POLICY IF EXISTS "Authenticated Admin Update Media Bucket" ON storage.objects;
CREATE POLICY "Authenticated Admin Update Media Bucket"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated Admin Delete from Media Bucket" ON storage.objects;
CREATE POLICY "Authenticated Admin Delete from Media Bucket"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'media');
