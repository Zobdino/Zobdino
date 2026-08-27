import Link from "next/link";
import type { PreviewBook } from "@/lib/catalog";

type Props = {
  book: PreviewBook;
};

const mediaLabels = {
  ready: "آماده شنیدن",
  processing: "در حال تولید صوت",
  unavailable: "فعلاً بدون صوت",
};

export function BookCard({ book }: Props) {
  return (
    <article className="group rounded-3xl border border-gray-800 bg-surface/50 p-6 transition hover:-translate-y-1 hover:border-accent/60">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-accent">پیش‌نمایش زبدینو</p>
          <h2 className="mt-2 text-2xl font-extrabold">{book.title}</h2>
          <p className="mt-1 text-sm text-gray-500">{book.author}</p>
        </div>

        <span className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-300">
          {book.language}
        </span>
      </div>

      <p className="mt-5 line-clamp-3 text-sm leading-7 text-gray-400">
        {book.summaryPreview}
      </p>

      <div className="mt-6 flex items-center justify-between gap-4">
        <span className="text-xs text-gray-500">
          {mediaLabels[book.mediaStatus]}
        </span>

        <Link
          href={`/catalog/${book.id}`}
          className="text-sm font-bold text-accent hover:underline"
        >
          مشاهده کتاب ←
        </Link>
      </div>
    </article>
  );
}

export default BookCard;
