export type MediaType = "mp3" | "mp4";

export interface MediaItem {
  id: string;
  title: string;
  description: string;
  media_type: MediaType;
  file_url: string;
  storage_path: string;
  file_size?: number;
  duration?: number;
  created_at: string;
  updated_at?: string;
  is_demo?: boolean;
  visualizer_theme?: "nebula" | "cyber" | "gold";
}

export interface UploadProgressState {
  phase: "idle" | "uploading_storage" | "saving_database" | "completed" | "error";
  percentage: number;
  loadedBytes: number;
  totalBytes: number;
  message: string;
}

export const INITIAL_DEMO_MEDIA: MediaItem[] = [
  {
    id: "demo-1",
    title: "معزوفة الأفق السينمائي — توزيع أوركسترالي حديث",
    description:
      "عمل موسيقي تصويري أصلي يمزج بين الآلات الوترية العميقة والمؤثرات المحيطية لخلق أجواء درامية ملهمة للأفلام الوثائقية.",
    media_type: "mp3",
    file_url: "/samples/cinematic-horizon.wav",
    storage_path: "demo/cinematic-horizon.mp3",
    file_size: 4820400,
    duration: 30,
    created_at: "2026-10-28T18:30:00.000Z",
    is_demo: true,
  },
  {
    id: "demo-2",
    title: "العرض المرئي التشويقي — استوديو الإنتاج الإبداعي 4K",
    description:
      "مونتاج مرئي وتصميم حركي (Motion Reel) يستعرض أحدث مشاريع الإخراج البصري والمؤثرات الصوتية المتزامنة بدقة عالية.",
    media_type: "mp4",
    file_url: "/samples/cinematic-horizon.wav",
    storage_path: "demo/creative-studio-reel.mp4",
    file_size: 28450000,
    duration: 30,
    created_at: "2026-10-25T14:15:00.000Z",
    is_demo: true,
    visualizer_theme: "nebula",
  },
  {
    id: "demo-3",
    title: "تقاسيم ليلية هادئة — جلسة تسجيل استوديو حية",
    description:
      "مقطوعة صوتية مسجلة بجودة ماستر نقية تركز على التناغم الصوتي والهدوء الذهني، مناسبة للبث الصوتي والخلفية التأملية.",
    media_type: "mp3",
    file_url: "/samples/studio-oud-ambient.wav",
    storage_path: "demo/studio-oud-ambient.mp3",
    file_size: 3650120,
    duration: 24,
    created_at: "2026-10-19T20:00:00.000Z",
    is_demo: true,
  },
  {
    id: "demo-4",
    title: "فيلم قصير: نبض المدينة الرقمية — إخراج وتصوير",
    description:
      "عمل مرئي فني يستكشف تداخل الإضاءة الليلية مع الإيقاع السريع للحياة المعاصرة، مع معالجة لونية سينمائية وتصميم صوتي محيطي.",
    media_type: "mp4",
    file_url: "/samples/studio-oud-ambient.wav",
    storage_path: "demo/digital-city-pulse.mp4",
    file_size: 41200000,
    duration: 24,
    created_at: "2026-10-12T11:40:00.000Z",
    is_demo: true,
    visualizer_theme: "cyber",
  },
  {
    id: "demo-5",
    title: "الهوية الصوتية الرسمية — بودكاست ما وراء الإبداع",
    description:
      "تصميم الهوية السمعية والمقدمة الموسيقية الرسمية لبرنامج حواري أسبوعي، مع توازن ترددي مخصص لمنصات البودكاست.",
    media_type: "mp3",
    file_url: "/samples/podcast-intro-theme.wav",
    storage_path: "demo/podcast-intro-theme.mp3",
    file_size: 2410800,
    duration: 18,
    created_at: "2026-10-05T09:20:00.000Z",
    is_demo: true,
  },
  {
    id: "demo-6",
    title: "إعلان تجاري مرئي — هوية بصرية وصوتية متكاملة",
    description:
      "مشروع متكامل يجمع بين التحريك ثلاثي الأبعاد والموسيقى التصويرية الخاصة لإطلاق علامة تجارية تقنية.",
    media_type: "mp4",
    file_url: "/samples/podcast-intro-theme.wav",
    storage_path: "demo/brand-launch-spot.mp4",
    file_size: 19800000,
    duration: 18,
    created_at: "2026-09-29T16:50:00.000Z",
    is_demo: true,
    visualizer_theme: "gold",
  },
];
