export type MediaStatus = "ready" | "processing" | "unavailable";

export type PreviewBook = {
  id: string;
  title: string;
  author: string;
  language: string;
  summaryPreview: string;
  voices: string[];
  status: "preview";
  mediaStatus: MediaStatus;
  durationLabel: string;
};

const previewBooks: PreviewBook[] = [
  {
    id: "as-a-man-thinketh",
    title: "As a Man Thinketh",
    author: "James Allen",
    language: "فارسی",
    summaryPreview:
      "خلاصه فارسی زبدینو از کتاب «انسان همان است که می‌اندیشد»؛ درباره نقش افکار در شکل‌گیری عادت‌ها، تصمیم‌ها و مسیر زندگی.",
    voices: ["Sulafat", "Schedar"],
    status: "preview",
    mediaStatus: "processing",
    durationLabel: "در حال آماده‌سازی نسخه صوتی",
  },
];

export function getPreviewCatalog() {
  return previewBooks;
}

export function getPreviewBook(id: string) {
  return previewBooks.find((book) => book.id === id);
}
