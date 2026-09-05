import Image from "next/image";
import { notFound } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Headphones,
  Lightbulb,
  ListChecks,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import BookAudioExperience from "@/components/BookAudioExperience";
import { atomicHabitsReference } from "@/content/atomic-habits-reference";
import { deepWorkReference } from "@/content/deep-work-reference";
import { isProductionAudio } from "@/lib/audio";
import { books } from "@/lib/books";
import { episodes } from "@/lib/episodes";

const referenceContentBySlug = {
  "atomic-habits": atomicHabitsReference,
  "deep-work": deepWorkReference,
} as const;

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
  const canonicalEpisodes = bookEpisodes.filter((item) => isProductionAudio(item.audio));
  const canonicalEpisode = canonicalEpisodes[0];
  const episode = canonicalEpisode ?? bookEpisodes[0];
  const ready = bookEpisodes.some((item) => item.audio.status === "ready");
  const productionAudio = canonicalEpisodes.length > 0;
  const referenceContent = referenceContentBySlug[book.slug as keyof typeof referenceContentBySlug];
  const isReferenceComplete = Boolean(referenceContent);
  const hasApprovedDualVoice = canonicalEpisodes.length === 2;

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
              {isReferenceComplete && hasApprovedDualVoice ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-black text-violet-700 dark:text-violet-300">
                  <ShieldCheck size={14} /> نمونه کامل زبدینو
                </span>
              ) : null}
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
              {isReferenceComplete ? <span className="inline-flex items-center gap-2"><ShieldCheck size={16} /> Evidence منبع‌دار</span> : null}
            </div>
          </div>
        </div>
      </section>

      <div className="z-container py-10 md:py-14">
        {referenceContent ? (
          <>
            <nav aria-label={`بخش‌های ${book.titleFa}`} className="mb-10 flex flex-wrap gap-2 rounded-2xl border border-black/7 bg-white/70 p-2 dark:border-white/8 dark:bg-white/[0.03]">
              {[
                ["#summary", "خلاصه"],
                ["#player", "صوت"],
                ["#evidence", "Evidence"],
                ["#transcript", "متن صوت"],
                ["#actions", "اقدام عملی"],
              ].map(([href, label]) => (
                <a key={href} href={href} className="z-focus rounded-xl px-4 py-2.5 text-sm font-black z-muted transition hover:bg-violet-500/10 hover:text-violet-700 dark:hover:text-violet-300">
                  {label}
                </a>
              ))}
            </nav>

            <section id="summary" className="mb-12 scroll-mt-24">
              <div className="mb-7 max-w-3xl">
                <p className="z-eyebrow">خلاصه زبدینو</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">کتاب در چهار ایده اصلی</h2>
                <p className="mt-3 text-sm leading-7 z-muted md:text-base md:leading-8">
                  این خلاصه با زبان مستقل زبدینو نوشته شده و به‌جای بازتولید متن کتاب، چارچوب‌های اصلی را برای فهم سریع و کاربرد عملی توضیح می‌دهد.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {referenceContent.summary.map((item, index) => (
                  <article key={item.title} className="rounded-[1.75rem] border border-black/7 bg-white/75 p-6 dark:border-white/8 dark:bg-white/[0.035]">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-700 text-sm font-black text-white">
                      {(index + 1).toLocaleString("fa-IR")}
                    </div>
                    <h3 className="text-xl font-black">{item.title}</h3>
                    <p className="mt-3 text-sm leading-8 z-muted md:text-base">{item.body}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : null}

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

        {referenceContent ? (
          <section id="evidence" className="mb-12 scroll-mt-24">
            <div className="mb-7 max-w-3xl">
              <p className="z-eyebrow">Evidence</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">ادعاهای اصلی به منبع قابل بررسی وصل‌اند</h2>
              <p className="mt-3 text-sm leading-7 z-muted md:text-base md:leading-8">
                Evidence این صفحه از منابع رسمی یا متادیتای معتبر استفاده می‌کند تا کاربر بتواند مبنای اطلاعات را مستقل بررسی کند.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {referenceContent.evidence.map((item) => (
                <article key={item.sourceUrl} className="rounded-[1.75rem] border border-emerald-500/15 bg-emerald-500/[0.045] p-6">
                  <div className="inline-flex items-center gap-2 text-sm font-black text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck size={17} /> {item.sourceType}
                  </div>
                  <p className="mt-4 leading-8">{item.claim}</p>
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="z-focus mt-5 inline-flex items-center gap-2 rounded-xl text-sm font-black text-violet-700 dark:text-violet-300">
                    {item.sourceLabel} <ExternalLink size={15} />
                  </a>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {referenceContent ? (
          <section id="actions" className="mb-12 scroll-mt-24">
            <div className="mb-7 max-w-3xl">
              <p className="z-eyebrow">از دانستن به انجام دادن</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">پنج اقدام برای امروز</h2>
            </div>
            <ol className="grid gap-4 md:grid-cols-2">
              {referenceContent.actions.map((action, index) => (
                <li key={action} className="flex gap-4 rounded-3xl border border-black/7 bg-white/70 p-5 dark:border-white/8 dark:bg-white/[0.035]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
                    {index === 0 ? <Lightbulb size={18} /> : <ListChecks size={18} />}
                  </span>
                  <span className="leading-8">{action}</span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

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
