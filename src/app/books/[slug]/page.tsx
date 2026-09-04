import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock3, Headphones, LoaderCircle, Mic2, Sparkles } from "lucide-react";

import BookAudioExperience from "@/components/BookAudioExperience";
import { getEpisodeVoiceLabelFa, isProductionAudio } from "@/lib/audio";
import { books } from "@/lib/books";
import { episodes } from "@/lib/episodes";
import { APPROVED_VOICE_PROFILES } from "@/lib/voices";

export async function generateStaticParams() {
  return books.map((book) => ({ slug: book.slug }));
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = books.find((item) => item.slug === slug);
  if (!book) return notFound();

  const bookEpisodes = episodes.filter((item) => item.bookSlug === book.slug);
  const canonicalEpisode = bookEpisodes.find((item) =>
    isProductionAudio(item.audio),
  );
  const episode = canonicalEpisode ?? bookEpisodes[0];
  const ready = bookEpisodes.some((item) => item.audio.status === "ready");
  const productionAudio = Boolean(canonicalEpisode);
  const voiceLabel = episode ? getEpisodeVoiceLabelFa(episode.audio) : null;
  const approvedVoices = Object.values(APPROVED_VOICE_PROFILES);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <section className="mb-12 grid gap-8 md:grid-cols-[280px_1fr] md:items-start">
        <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-gray-800 bg-gray-900 shadow-2xl shadow-accent/10">
          <Image
            src={book.coverUrl}
            alt={`جلد ${book.titleFa}`}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 280px"
            className="object-cover"
          />
        </div>

        <div className="pt-2">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent">
              {book.category}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${
                productionAudio
                  ? "border-emerald-700 bg-emerald-950/40 text-emerald-300"
                  : ready
                    ? "border-amber-700 bg-amber-950/30 text-amber-300"
                    : "border-zinc-700 bg-zinc-900/50 text-zinc-300"
              }`}
            >
              {ready ? <Headphones size={14} /> : <LoaderCircle size={14} />}
              {productionAudio
                ? "صوت نهایی تأییدشده"
                : ready
                  ? "صوت قدیمی؛ در انتظار جایگزینی"
                  : "در خط تولید AI"}
            </span>
          </div>

          <p className="text-sm font-semibold text-gray-500">{book.titleEn}</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-6xl">
            {book.titleFa}
          </h1>
          <p className="mt-4 text-xl text-gray-400">
            {book.authorFa} · {book.year.toLocaleString("fa-IR")}
          </p>
          <p className="mt-7 max-w-3xl text-lg leading-9 text-gray-300">
            {book.description}
          </p>

          {episode && (
            <div className="mt-7 flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="inline-flex items-center gap-2">
                <Clock3 size={17} />
                {Math.ceil(episode.audio.durationSeconds / 60).toLocaleString("fa-IR")} دقیقه
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkles size={17} />
                خلاصه مستقل فارسی
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="mb-12 rounded-3xl border border-violet-500/20 bg-violet-500/5 p-5 md:p-7" aria-labelledby="voice-status-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-violet-300">لایه صوت زبدینو</p>
            <h2 id="voice-status-title" className="mt-2 text-2xl font-extrabold">وضعیت صدا و مسیر جایگزینی</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-gray-400">
              زبدینو فقط صدایی را «نهایی» اعلام می‌کند که به یکی از پروفایل‌های رسمی تأییدشده متصل باشد. فایل‌های قدیمی تا زمان انتشار immutable دوصدایی بدون برچسب نهایی باقی می‌مانند.
            </p>
          </div>
          {voiceLabel ? (
            <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${productionAudio ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-amber-500/30 bg-amber-500/10 text-amber-300"}`}>
              صدای فعلی: {voiceLabel}
            </span>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {approvedVoices.map((voice) => (
            <div key={voice.id} className="rounded-2xl border border-gray-800 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-violet-500/10 text-violet-300"><Mic2 size={17} /></div>
                  <div>
                    <p className="font-bold">{voice.labelFa}</p>
                    <p className="mt-1 text-xs text-gray-500" dir="ltr">{voice.providerVoice}</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300">Approved</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {bookEpisodes.length > 0 ? (
        <BookAudioExperience episodes={bookEpisodes} />
      ) : (
        <section className="mb-12 rounded-3xl border border-amber-800/50 bg-amber-950/20 p-7 md:p-9">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-amber-400/10 p-3 text-amber-300">
              <LoaderCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-amber-100">
                اپیزود این کتاب در حال تولید است
              </h2>
              <p className="mt-3 max-w-2xl leading-8 text-amber-100/70">
                تحقیق منابع، ساخت اسکریپت فارسی، تولید صدا و QA به‌صورت
                خودکار انجام می‌شود. تا قبل از تأیید فایل واقعی، هیچ صدای
                placeholder برای این کتاب پخش نمی‌کنیم.
              </p>
            </div>
          </div>
        </section>
      )}

      {book.keyIdeas.length > 0 && (
        <section className="mb-12">
          <div className="mb-6">
            <p className="text-sm font-bold text-accent">در یک نگاه</p>
            <h2 className="mt-2 text-3xl font-extrabold">ایده‌های کلیدی</h2>
          </div>

          <ul className="grid gap-4 md:grid-cols-2">
            {book.keyIdeas.map((idea, index) => (
              <li
                key={idea}
                className="flex gap-4 rounded-2xl border border-gray-800 bg-surface/50 p-5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent font-extrabold text-white">
                  {(index + 1).toLocaleString("fa-IR")}
                </span>
                <span className="text-lg leading-8 text-gray-200">{idea}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
