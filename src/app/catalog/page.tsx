import Link from "next/link";
import { ArrowLeft, BookOpen, ShieldCheck } from "lucide-react";

import { CatalogGrid } from "@/components/preview/CatalogGrid";
import { getPreviewCatalog } from "@/lib/catalog";

export default function CatalogPage() {
  const books = getPreviewCatalog();
  return (
    <main className="z-container min-h-screen py-10 md:py-16">
      <section className="mb-10 grid gap-7 lg:grid-cols-[1fr_340px] lg:items-end">
        <div className="max-w-3xl">
          <span className="z-eyebrow">مجموعه عمومی</span>
          <h1 className="mt-4 text-4xl font-black leading-tight tracking-[-0.045em] text-[#08253a] dark:text-[#fff7e8] md:text-6xl">نمونه‌های عمومی زبدینو را ببین.</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 z-muted md:text-lg">این بخش برای عنوان‌هایی است که تجربه خلاصه، منبع و نسخه صوتی آن‌ها را می‌توانیم عمومی نمایش دهیم. فایل‌های شخصی تو هرگز وارد این مجموعه نمی‌شوند.</p>
        </div>
        <div className="z-surface p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"><ShieldCheck size={20}/></span>
            <div><p className="font-black">عمومی، جدا از کتابخانه شخصی</p><p className="mt-1 text-sm leading-7 z-muted">فقط محتوایی که برای نمایش عمومی مناسب است اینجا دیده می‌شود.</p></div>
          </div>
        </div>
      </section>

      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 text-sm font-black"><BookOpen size={17} className="text-[#b97c08] dark:text-[#f4c66a]"/>{books.length.toLocaleString("fa-IR")} عنوان عمومی</div>
        <Link href="/books" className="z-focus inline-flex items-center gap-2 rounded-xl text-sm font-black text-[#b97c08] dark:text-[#f4c66a]">مرور همه کتاب‌ها<ArrowLeft size={16}/></Link>
      </div>
      <CatalogGrid books={books} />
    </main>
  );
}
