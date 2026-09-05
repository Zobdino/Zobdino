import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";

import PreviewAudioPlayer from "./PreviewAudioPlayer";
import type { PreviewBook } from "@/lib/catalog";

type Props = {
  book: PreviewBook;
};

export function BookDetail({ book }: Props) {
  return (
    <article className="z-container py-10 md:py-16">
      <Link
        href="/catalog"
        className="z-focus inline-flex items-center gap-2 rounded-xl text-sm font-black text-violet-700 dark:text-violet-300"
      >
        <ArrowRight size={15} />
        بازگشت به مجموعه عمومی
      </Link>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
        <div>
          <span className="z-eyebrow">نمونه عمومی زبدینو</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">{book.title}</h1>
          <p className="mt-3 text-lg z-muted">{book.author}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-black/10 bg-white/55 px-3 py-1.5 text-xs font-bold z-muted dark:border-white/10 dark:bg-white/[0.03]">
              {book.language}
            </span>
            <span className="rounded-full border border-black/10 bg-white/55 px-3 py-1.5 text-xs font-bold z-muted dark:border-white/10 dark:bg-white/[0.03]">
              {book.durationLabel}
            </span>
          </div>

          <section className="z-surface mt-8 p-6 md:p-7">
            <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
              <BookOpen size={17} />
              <p className="text-sm font-black">خلاصه فارسی</p>
            </div>
            <p className="mt-4 text-base leading-8 z-muted">{book.summaryPreview}</p>
          </section>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-300" />
            <p className="text-sm leading-7 z-muted">
              این صفحه یک نمونه عمومی است و از کتابخانه خصوصی و فایل‌های شخصی کاربران جدا نگه داشته می‌شود.
            </p>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24">
          <PreviewAudioPlayer voices={book.voices} mediaStatus={book.mediaStatus} />
        </aside>
      </div>
    </article>
  );
}

export default BookDetail;
