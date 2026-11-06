import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "استوديو أعمالي | منصة استعراض الأعمال الصوتية والمرئية (MP3 & MP4)",
  description:
    "منصة ويب متكاملة لاستعراض الأعمال الصوتية (MP3) والمرئية (MP4) مع مشغل وسائط تفاعلي مدمج ولوحة تحكم محمية عبر Supabase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="bg-[#090A0F] text-slate-100 antialiased selection:bg-violet-500/30 selection:text-violet-200">
        {children}
      </body>
    </html>
  );
}
