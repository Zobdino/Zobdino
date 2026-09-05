import Link from "next/link";
import { ArrowLeft, Headphones, LoaderCircle } from "lucide-react";
import type { PreviewBook } from "@/lib/catalog";

type Props = {
  book: PreviewBook;
};

const mediaLabels = {
  ready: "آماده شنیدن",
  processing: "نسخه صوتی در حال آماده‌سازی",
  unavailable: "فعلاً بدون نسخه صوتی",
};

export function BookCard({ book }: Props) {
  const ready = book.mediaStatus === "ready";

  return (
    <article className="z-surface group p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-300 dark:hover:border-violet-500/40 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black text-violet-700 dark:text-violet-300">نمونه عمومی</p>
          <h2 className="mt-2 text-2xl font-black">{book.title}</h2>
          <p className="mt-1 text-sm z-muted">{book.author}</p>
        </div>

        <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-bold z-muted dark:border-white/10 dark:bg-white/[0.035]">
          {book.language}
        </span>
      </div>

      <p className="mt-5 line-clamp-3 text-sm leading-7 z-muted">{book.summaryPreview}</p>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-black/[0.035] px-3 py-2 text-xs font-bold z-muted dark:bg-white/[0.045]">
        {ready ? <Headphones size={14} /> : <LoaderCircle size={14} />}
        {mediaLabels[book.mediaStatus]}
      </div>

      <div className="mt-6 border-t border-black/7 pt-4 dark:border-white/8">
        <Link
          href={`/catalog/${book.id}`}
          className="z-focus inline-flex items-center gap-2 rounded-xl text-sm font-black text-violet-700 dark:text-violet-300"
        >
          دیدن نمونه
          <ArrowLeft size={15} />
        </Link>
      </div>
    </article>
  );
}

export default BookCard;
