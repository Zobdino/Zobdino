import Image from "next/image";
import Link from "next/link";
import { Clock3, Headphones, LoaderCircle, Play } from "lucide-react";

import { getEpisodeVoiceLabelFa, isProductionAudio } from "@/lib/audio";
import { episodes } from "@/lib/episodes";
import type { Book } from "@/lib/books";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const bookEpisodes = episodes.filter((item) => item.bookSlug === book.slug);
  const episode =
    bookEpisodes.find((item) => isProductionAudio(item.audio)) ??
    bookEpisodes.find((item) => item.audio.status === "ready") ??
    bookEpisodes[0];
  const ready = episode?.audio.status === "ready";
  const productionAudio = episode ? isProductionAudio(episode.audio) : false;
  const voiceLabel = episode ? getEpisodeVoiceLabelFa(episode.audio) : null;

  const durationLabel =
    episode && episode.audio.durationSeconds > 0
      ? `${Math.ceil(episode.audio.durationSeconds / 60).toLocaleString("fa-IR")} دقیقه`
      : null;

  return (
    <Link
      href={`/books/${book.slug}`}
      className="z-focus group block overflow-hidden rounded-[1.7rem] border border-black/8 bg-white/68 p-3.5 shadow-[0_18px_50px_-35px_rgba(76,29,149,.35)] transition duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_24px_65px_-35px_rgba(76,29,149,.42)] dark:border-white/8 dark:bg-white/[0.025] dark:hover:border-violet-500/40"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.3rem] bg-zinc-900">
        <Image
          src={book.coverUrl}
          alt={`جلد ${book.titleFa}`}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-[1.025]"
        />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="rounded-full border border-white/12 bg-black/72 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
            {book.category}
          </span>

          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold backdrop-blur ${
            ready
              ? "border-emerald-300/30 bg-emerald-950/80 text-emerald-100"
              : "border-white/12 bg-black/72 text-zinc-200"
          }`}>
            {ready ? <Headphones size={13} /> : <LoaderCircle size={13} />}
            {ready ? "آماده شنیدن" : "صوت در حال آماده‌سازی"}
          </span>
        </div>

        {ready ? (
          <span className="absolute bottom-3 left-3 grid size-12 place-items-center rounded-full bg-white text-violet-700 shadow-xl transition group-hover:scale-105" aria-hidden="true">
            <Play size={20} fill="currentColor" />
          </span>
        ) : null}
      </div>

      <div className="px-1 pb-1 pt-4">
        <p className="text-xs font-bold tracking-wide text-violet-700 dark:text-violet-300">{book.titleEn}</p>
        <h3 className="mt-1 text-xl font-black transition group-hover:text-violet-700 dark:group-hover:text-violet-300">{book.titleFa}</h3>
        <p className="mt-2 text-sm z-muted">{book.authorFa}</p>

        {ready && voiceLabel ? (
          <p className="mt-3 text-xs z-muted">
            روایت {productionAudio ? "تأییدشده" : "در دسترس"}: <span className="font-black text-[var(--page-fg)]">{voiceLabel}</span>
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-black/7 pt-4 text-sm dark:border-white/8">
          {durationLabel ? (
            <span className="inline-flex items-center gap-1.5 z-muted">
              <Clock3 size={15} />
              {durationLabel}
            </span>
          ) : (
            <span className="z-muted">خلاصه فارسی در دسترس</span>
          )}

          <span className="font-black text-violet-700 dark:text-violet-300">
            {ready ? "شروع شنیدن ←" : "دیدن کتاب ←"}
          </span>
        </div>
      </div>
    </Link>
  );
}
