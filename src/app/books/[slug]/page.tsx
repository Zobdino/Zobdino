import Image from "next/image";
import { notFound } from "next/navigation";
import { BookOpen, CheckCircle2, Clock3, Headphones, LoaderCircle, Sparkles } from "lucide-react";

import BookAudioExperience from "@/components/BookAudioExperience";
import { isProductionAudio } from "@/lib/audio";
import { books } from "@/lib/books";
import { episodes } from "@/lib/episodes";

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
  const canonicalEpisode = bookEpisodes.find((item) => isProductionAudio(item.audio));
  const episode = canonicalEpisode ?? bookEpisodes[0];
  const ready = bookEpisodes.some((item) => item.audio.status === "ready");
  const productionAudio = Boolean(canonicalEpisode);

  return (
    <main>
      <section className="border-b border-black/5 dark:border-white/5">
        <div className="z-container grid gap-8 py-10 md:grid-cols-[250px_1fr] md:items-center md:gap-12 md:py-16">
          <div className="mx-auto w-full max-w-[250px]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[1.75rem] border border-black/8 bg-black/5 shadow-2xl shadow-violet-950/10 dark:border-white/10 dark:bg-white/5">
              <Image
                src={book.coverUrl}
                alt={`جلد ${book.titleFa}`}
                fill
                unoptimized
                sizes="(max-width: 768px) 250px, 250px"
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-violet-500/15 bg-violet-500/[0.08] px-3 py-1.5 text-xs font-black text-violet-700 dark:text-violet-300">
                {book.category}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${productionAudio ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : ready ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-black/5 z-muted dark:bg-white/5"}`}>
                {productionAudio ? <CheckCircle2 size={14} /> : ready ? <Headphones size={14} /> : <LoaderCircle size={14} />}
                {productionAudio ? "نسخه صوتی تأییدشده" : ready ? "نسخه صوتی موجود" : "در حال آماده‌سازی"}
              </span>
            </div>

            <p className="mt-6 text-sm font-bold z-muted">{book.titleEn}</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">{book.titleFa}</h1>
            <p className="mt-4 text-lg font-bold z-muted md:text-xl">
              {book.authorFa} · {book.year.toLocaleString("fa-IR")}
            </p>
            <p className="mt-6 max-w-3xl text-base leading-8 z-muted md:text-lg md:leading-9">{book.description}</p>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm z-muted">
              {episode ? (
                <span className="inline-flex items-center gap-2">
                  <Clock3 size={16} />
                  حدود {Math.ceil(episode.audio.durationSeconds / 60).toLocaleString("fa-IR")} دقیقه
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2"><Sparkles size={16} /> خلاصه مستقل فارسی</span>
              <span className="inline-flex items-center gap-2"><BookOpen size={16} /> ایده‌های کلیدی</span>
            </div>
          </div>
        </div>
      </section>

      <div className="z-container py-10 md:py-14">
        {bookEpisodes.length > 0 ? (
          <BookAudioExperience episodes={bookEpisodes} />
        ) : (
          <section className="mb-12 rounded-[2rem] border border-amber-500/15 bg-amber-500/[0.06] p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600 dark:text-amber-300"><LoaderCircle size={22} /></div>
              <div>
                <h2 className="text-xl font-black">نسخه شنیداری این کتاب در حال آماده‌سازی است</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 z-muted">
                  وقتی نسخه قابل اعتماد آماده شود، پلیر همین‌جا فعال خواهد شد. تا آن زمان هیچ فایل آزمایشی به‌عنوان نسخه نهایی نمایش داده نمی‌شود.
                </p>
              </div>
            </div>
          </section>
        )}

        {book.keyIdeas.length > 0 && (
          <section className="mb-12 pt-4">
            <div className="mb-7 max-w-2xl">
              <p className="z-eyebrow">در یک نگاه</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">ایده‌هایی که باید با خودت ببری</h2>
              <p className="mt-2 text-sm leading-7 z-muted">قبل یا بعد از شنیدن، نکات محوری کتاب را سریع مرور کن.</p>
            </div>

            <ul className="grid gap-4 md:grid-cols-2">
              {book.keyIdeas.map((idea, index) => (
                <li key={idea} className="flex gap-4 rounded-3xl border border-black/7 bg-white/70 p-5 dark:border-white/8 dark:bg-white/[0.035]">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-700 text-sm font-black text-white">
                    {(index + 1).toLocaleString("fa-IR")}
                  </span>
                  <span className="leading-8">{idea}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
