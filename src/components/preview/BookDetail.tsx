import Link from "next/link";
import PreviewAudioPlayer from "./PreviewAudioPlayer";
import type { PreviewBook } from "@/lib/catalog";

type Props = {
  book: PreviewBook;
};

export function BookDetail({ book }: Props) {
  return (
    <article className="mx-auto max-w-5xl px-4 py-12 md:py-20">
      <Link
        href="/catalog"
        className="text-sm font-bold text-accent hover:underline"
      >
        → بازگشت به کتابخانه
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.25fr_.75fr]">
        <div>
          <p className="text-sm font-bold text-accent">Zobdino Preview</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
            {book.title}
          </h1>
          <p className="mt-3 text-lg text-gray-500">{book.author}</p>

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="rounded-full border border-gray-800 px-3 py-1 text-xs text-gray-400">
              {book.language}
            </span>
            <span className="rounded-full border border-gray-800 px-3 py-1 text-xs text-gray-400">
              {book.durationLabel}
            </span>
          </div>

          <section className="mt-10 rounded-3xl border border-gray-800 bg-surface/40 p-7">
            <p className="text-xs font-bold text-accent">خلاصه پیش‌نمایش</p>
            <p className="mt-4 text-base leading-8 text-gray-300">
              {book.summaryPreview}
            </p>
          </section>
        </div>

        <div className="lg:pt-14">
          <PreviewAudioPlayer
            voices={book.voices}
            mediaStatus={book.mediaStatus}
          />
        </div>
      </div>
    </article>
  );
}

export default BookDetail;
