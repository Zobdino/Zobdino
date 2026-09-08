import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  Headphones,
  Lightbulb,
  ListChecks,
  LoaderCircle,
  Play,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import BookAudioExperience from "@/components/BookAudioExperience";
import LocaleText from "@/components/LocaleText";
import { atomicHabitsReference } from "@/content/atomic-habits-reference";
import { deepWorkReference } from "@/content/deep-work-reference";
import { leadingTeamsReference } from "@/content/leading-teams-reference";
import { thinkAgainReference } from "@/content/think-again-reference";
import { zeroToOneReference } from "@/content/zero-to-one-reference";
import { isProductionAudio } from "@/lib/audio";
import { books } from "@/lib/books";
import { episodes } from "@/lib/episodes";

const referenceContentBySlug = {
  "atomic-habits": atomicHabitsReference,
  "deep-work": deepWorkReference,
  "think-again": thinkAgainReference,
  "zero-to-one": zeroToOneReference,
  "leading-teams": leadingTeamsReference,
} as const;

export async function generateStaticParams() {
  return books.map((book) => ({ slug: book.slug }));
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = books.find((item) => item.slug === slug);
  if (!book) return notFound();

  const bookEpisodes = episodes.filter((item) => item.bookSlug === book.slug);
  const canonicalEpisodes = bookEpisodes.filter((item) => isProductionAudio(item.audio));
  const playerEpisodes = canonicalEpisodes.length > 0 ? canonicalEpisodes : bookEpisodes;
  const canonicalEpisode = canonicalEpisodes[0];
  const episode = canonicalEpisode ?? bookEpisodes[0];
  const ready = bookEpisodes.some((item) => item.audio.status === "ready");
  const productionAudio = canonicalEpisodes.length > 0;
  const referenceContent = referenceContentBySlug[book.slug as keyof typeof referenceContentBySlug];
  const isReferenceComplete = Boolean(referenceContent);
  const hasApprovedDualVoice = canonicalEpisodes.length === 2;
  const durationMinutes = episode ? Math.ceil(episode.audio.durationSeconds / 60) : null;
  const audioUrl = episode?.audio.publicUrl ?? episode?.audio.previewUrl ?? null;

  return (
    <main>
      <section className="border-b border-black/5 dark:border-white/5">
        <div className="z-container py-8 md:py-12">
          <div className="mb-7 flex items-center gap-2 text-sm font-bold z-muted">
            <Link href="/books" className="transition hover:text-violet-700"><LocaleText fa="کتاب‌ها" en="Books" /></Link>
            <span>›</span>
            <span><LocaleText fa={book.titleFa} en={book.titleEn} /></span>
          </div>

          <div className="grid gap-8 md:grid-cols-[220px_1fr] md:items-center md:gap-12">
            <div className="mx-auto w-full max-w-[220px]">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[1.2rem] border border-black/8 bg-[#f3eee5] shadow-[0_20px_55px_rgba(8,37,58,.12)] dark:border-white/10">
                <Image src={book.coverUrl} alt={`${book.titleEn} cover`} fill unoptimized sizes="220px" className="object-cover" priority />
              </div>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-4xl font-black tracking-[-0.04em] text-[#08253a] dark:text-[#fff7e8] md:text-6xl"><LocaleText fa={book.titleFa} en={book.titleEn} /></h1>
              <p className="mt-3 text-lg font-semibold z-muted"><LocaleText fa={book.authorFa} en={book.authorEn} /></p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-black text-violet-700 dark:text-violet-300"><LocaleText fa={book.category} en={book.categoryEn} /></span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${productionAudio ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : ready ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-black/5 z-muted dark:bg-white/5"}`}>
                  {productionAudio ? <CheckCircle2 size={14} /> : ready ? <Headphones size={14} /> : <LoaderCircle size={14} />}
                  <LocaleText fa={productionAudio ? "نسخه صوتی تأییدشده" : ready ? "نسخه صوتی موجود" : "در حال آماده‌سازی"} en={productionAudio ? "Verified audio" : ready ? "Audio available" : "In preparation"} />
                </span>
                {isReferenceComplete && hasApprovedDualVoice ? <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-black text-emerald-700 dark:text-emerald-300"><LocaleText fa="موجود" en="Available" /></span> : null}
              </div>

              <p className="mt-6 text-base leading-8 z-muted md:text-lg md:leading-9"><LocaleText fa={book.description} en={book.descriptionEn} /></p>

              <div className="mt-7 flex flex-wrap gap-3">
                {ready ? (
                  <a href="#player" className="z-focus inline-flex items-center gap-2 rounded-2xl bg-[#f4b62f] px-6 py-3.5 text-sm font-black text-[#08253a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#e5a92d]">
                    <Play size={17} fill="currentColor" /> <LocaleText fa="ادامه شنیدن" en="Continue Listening" />
                  </a>
                ) : null}
                {audioUrl && episode?.audio.downloadable ? (
                  <a href={audioUrl} target="_blank" rel="noreferrer" className="z-focus inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-6 py-3.5 text-sm font-black transition hover:border-violet-300 dark:border-white/10 dark:bg-white/[0.03]">
                    <Download size={17} /> <LocaleText fa="دانلود" en="Download" />
                  </a>
                ) : null}
              </div>

              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm z-muted">
                {durationMinutes ? <span className="inline-flex items-center gap-2"><Clock3 size={16} /><LocaleText fa={`حدود ${durationMinutes.toLocaleString("fa-IR")} دقیقه`} en={`About ${durationMinutes.toLocaleString("en-US")} min`} /></span> : null}
                <span className="inline-flex items-center gap-2"><Sparkles size={16} /><LocaleText fa="خلاصه مستقل فارسی" en="Independent Persian summary" /></span>
                <span className="inline-flex items-center gap-2"><BookOpen size={16} /><LocaleText fa="ایده‌های کلیدی" en="Key ideas" /></span>
                {isReferenceComplete ? <span className="inline-flex items-center gap-2"><ShieldCheck size={16} /><LocaleText fa="Evidence منبع‌دار" en="Traceable evidence" /></span> : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="z-container py-8 md:py-10">
        {referenceContent ? (
          <>
            <nav aria-label={`Sections for ${book.titleEn}`} className="mb-10 flex flex-wrap items-center gap-1 border-b border-black/8 dark:border-white/8">
              <a href="#summary" className="z-focus border-b-2 border-violet-600 px-4 py-3 text-sm font-black text-violet-700 dark:text-violet-300"><LocaleText fa="خلاصه" en="Summary" /></a>
              <a href="#evidence" className="z-focus border-b-2 border-transparent px-4 py-3 text-sm font-black z-muted hover:text-violet-700">Evidence</a>
              <a href="#actions" className="z-focus border-b-2 border-transparent px-4 py-3 text-sm font-black z-muted hover:text-violet-700"><LocaleText fa="اقدام‌های عملی" en="Actions" /></a>
              <a href="#transcript" className="z-focus border-b-2 border-transparent px-4 py-3 text-sm font-black z-muted hover:text-violet-700"><LocaleText fa="متن صوت" en="Audio Text" /></a>
              <a href="#player" className="z-focus border-b-2 border-transparent px-4 py-3 text-sm font-black z-muted hover:text-violet-700"><LocaleText fa="صوت" en="Audio" /></a>
            </nav>

            <section id="summary" className="mb-12 scroll-mt-24">
              <div className="mb-7 max-w-3xl">
                <p className="z-eyebrow"><LocaleText fa="خلاصه زبدینو" en="Zobdino summary" /></p>
                <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl"><LocaleText fa="کتاب در چهار ایده اصلی" en="The book in four core ideas" /></h2>
                <p className="mt-3 text-sm leading-7 z-muted md:text-base md:leading-8"><LocaleText fa="این خلاصه با زبان مستقل زبدینو نوشته شده و به‌جای بازتولید متن کتاب، چارچوب‌های اصلی را برای فهم سریع و کاربرد عملی توضیح می‌دهد." en="This independent Zobdino summary explains the book’s central frameworks for fast understanding and practical use instead of reproducing the original text." /></p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {referenceContent.summary.map((item, index) => (
                  <article key={item.title} className="rounded-[1.5rem] border border-black/7 bg-white/75 p-6 dark:border-white/8 dark:bg-white/[0.035]">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-700 text-sm font-black text-white">{index + 1}</div>
                    <h3 className="text-xl font-black"><LocaleText fa={item.title} en={item.titleEn} /></h3>
                    <p className="mt-3 text-sm leading-8 z-muted md:text-base"><LocaleText fa={item.body} en={item.bodyEn} /></p>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {playerEpisodes.length > 0 ? <BookAudioExperience episodes={playerEpisodes} /> : (
          <section className="mb-12 rounded-[1.5rem] border border-amber-500/15 bg-amber-500/[0.06] p-6 md:p-8">
            <div className="flex items-start gap-4"><div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600 dark:text-amber-300"><LoaderCircle size={22} /></div><div><h2 className="text-xl font-black"><LocaleText fa="نسخه شنیداری این کتاب در حال آماده‌سازی است" en="The audio edition is being prepared" /></h2><p className="mt-2 max-w-2xl text-sm leading-7 z-muted"><LocaleText fa="وقتی نسخه قابل اعتماد آماده شود، پلیر همین‌جا فعال خواهد شد." en="The player will activate here once a verified edition is ready." /></p></div></div>
          </section>
        )}

        {referenceContent ? (
          <section id="evidence" className="mb-12 scroll-mt-24">
            <div className="mb-7 max-w-3xl"><p className="z-eyebrow">Evidence</p><h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl"><LocaleText fa="ادعاهای اصلی به منبع قابل بررسی وصل‌اند" en="Core claims connect to verifiable sources" /></h2><p className="mt-3 text-sm leading-7 z-muted md:text-base md:leading-8"><LocaleText fa="Evidence این صفحه از منابع رسمی یا متادیتای معتبر استفاده می‌کند تا کاربر بتواند مبنای اطلاعات را مستقل بررسی کند." en="This page uses official sources or reliable bibliographic metadata so readers can independently verify the basis of the information." /></p></div>
            <div className="grid gap-4 md:grid-cols-2">{referenceContent.evidence.map((item) => <article key={item.sourceUrl} className="rounded-[1.5rem] border border-emerald-500/15 bg-emerald-500/[0.045] p-6"><div className="inline-flex items-center gap-2 text-sm font-black text-emerald-700 dark:text-emerald-300"><ShieldCheck size={17} /><LocaleText fa={item.sourceType} en={item.sourceTypeEn} /></div><p className="mt-4 leading-8"><LocaleText fa={item.claim} en={item.claimEn} /></p><a href={item.sourceUrl} target="_blank" rel="noreferrer" className="z-focus mt-5 inline-flex items-center gap-2 rounded-xl text-sm font-black text-violet-700 dark:text-violet-300">{item.sourceLabel}<ExternalLink size={15} /></a></article>)}</div>
          </section>
        ) : null}

        {referenceContent ? (
          <section id="actions" className="mb-12 scroll-mt-24">
            <div className="mb-7 max-w-3xl"><p className="z-eyebrow"><LocaleText fa="از دانستن به انجام دادن" en="From knowing to doing" /></p><h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl"><LocaleText fa="پنج اقدام برای امروز" en="Five actions for today" /></h2></div>
            <ol className="grid gap-4 md:grid-cols-2">{referenceContent.actions.map((action, index) => <li key={action.fa} className="flex gap-4 rounded-[1.5rem] border border-black/7 bg-white/70 p-5 dark:border-white/8 dark:bg-white/[0.035]"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-300">{index === 0 ? <Lightbulb size={18} /> : <ListChecks size={18} />}</span><span className="leading-8"><LocaleText fa={action.fa} en={action.en} /></span></li>)}</ol>
          </section>
        ) : null}

        {book.keyIdeas.length > 0 ? (
          <section className="mb-12 pt-4"><div className="mb-7 max-w-2xl"><p className="z-eyebrow"><LocaleText fa="در یک نگاه" en="At a glance" /></p><h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl"><LocaleText fa="ایده‌هایی که باید با خودت ببری" en="Ideas worth taking with you" /></h2></div><ul className="grid gap-4 md:grid-cols-2">{book.keyIdeas.map((idea, index) => <li key={idea} className="flex gap-4 rounded-[1.5rem] border border-black/7 bg-white/70 p-5 dark:border-white/8 dark:bg-white/[0.035]"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-700 text-sm font-black text-white">{index + 1}</span><span className="leading-8">{idea}</span></li>)}</ul></section>
        ) : null}
      </div>
    </main>
  );
}
