import { CatalogGrid } from "@/components/preview/CatalogGrid";
import { getPreviewCatalog } from "@/lib/catalog";

export default function CatalogPage() {
  const books = getPreviewCatalog();

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-12 md:py-20">
      <section className="mb-12 max-w-3xl">
        <p className="text-sm font-bold text-accent">کتابخانه زبدینو</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
          کتاب را بفهم، نه فقط تمامش کن.
        </h1>
        <p className="mt-5 text-base leading-8 text-gray-400 md:text-lg">
          خلاصه‌های فارسی ساختاریافته، نسخه صوتی و تجربه مطالعه هوشمند؛
          مستقل از وضعیت لحظه‌ای موتور تولید صوت.
        </p>
      </section>

      <div className="mb-8 flex flex-wrap gap-2 text-xs text-gray-400">
        <span className="rounded-full border border-gray-800 px-3 py-2">
          خلاصه فارسی
        </span>
        <span className="rounded-full border border-gray-800 px-3 py-2">
          دو صدای منتخب
        </span>
        <span className="rounded-full border border-gray-800 px-3 py-2">
          انتشار مرحله‌ای
        </span>
      </div>

      <CatalogGrid books={books} />
    </main>
  );
}
