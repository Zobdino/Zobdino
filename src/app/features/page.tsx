"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  BookOpenCheck,
  BrainCircuit,
  Check,
  FileText,
  Headphones,
  Library,
  LockKeyhole,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Waves,
} from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";

const statusStyle = {
  available: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  finishing: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  roadmap: "border-sky-500/30 bg-sky-500/10 text-sky-300",
};

export default function FeaturesPage() {
  const { locale } = useLocale();
  const fa = locale === "fa";
  const Arrow = fa ? ArrowLeft : ArrowRight;

  const copy = fa
    ? {
        eyebrow: "Zobdino Intelligence Platform",
        title: "از یک فایل، تا یک تجربه کامل یادگیری و شنیدن",
        intro:
          "زبدینو فایل شما را فقط خلاصه نمی‌کند. مسیر محصول از ورود فایل تا استخراج، درک، خلاصه فارسی، شواهد منبع، صوت کامل، صوت خلاصه و کتابخانه خصوصی به‌صورت یک جریان قابل ادامه و قابل ممیزی طراحی شده است.",
        primary: "تبدیل فایل",
        secondary: "مشاهده کتابخانه",
        journeyTitle: "مسیر کامل محصول",
        journeyText: "هر مرحله وضعیت مشخص، داده قابل ردیابی و مسیر بازیابی دارد؛ کار گران‌قیمت انجام‌شده نباید با یک وقفه از بین برود.",
        capabilitiesTitle: "امکانات اصلی زبدینو",
        comparisonTitle: "زبدینو در کنار ابزارهای شناخته‌شده",
        comparisonText:
          "این جدول رتبه‌بندی نیست؛ یک مقایسه قابلیت و تمرکز محصول بر اساس اطلاعات عمومی سرویس‌ها در سپتامبر ۲۰۲۶ است. قابلیت‌ها و پلن رقبا ممکن است تغییر کنند.",
        status: { available: "آماده", finishing: "در تکمیل نهایی", roadmap: "نقشه راه" },
        yes: "بله",
        partial: "بخشی / با تمرکز متفاوت",
        no: "تمرکز اصلی نیست",
        planned: "در نقشه راه",
        differentiator: "تمرکز ویژه زبدینو",
        noteTitle: "چرا این ترکیب مهم است؟",
        noteText:
          "Blinkist یک کتابخانه بزرگ خلاصه و قابلیت AI برای استخراج محتوا دارد؛ NotebookLM یک دستیار تحقیق منبع‌محور با citation و Audio Overview است؛ ElevenReader در تبدیل فایل و متن به صدای طبیعی بسیار قوی است. زبدینو روی اتصال همین نیازها در یک مسیر فارسی‌محور، خصوصی، منبع‌دار و قابل ادامه تمرکز می‌کند.",
      }
    : {
        eyebrow: "Zobdino Intelligence Platform",
        title: "From one file to a complete reading and listening workflow",
        intro:
          "Zobdino is designed as more than a summarizer. The product journey connects ingestion, extraction, understanding, Persian summaries, source evidence, full audio, summary audio and a private library in one resumable, auditable flow.",
        primary: "Upload a file",
        secondary: "Browse catalog",
        journeyTitle: "The complete product journey",
        journeyText: "Each stage has an explicit state, traceable data and a recovery path so completed expensive work is preserved across interruptions.",
        capabilitiesTitle: "Core Zobdino capabilities",
        comparisonTitle: "Zobdino alongside established tools",
        comparisonText:
          "This is not a ranking. It is a capability-and-focus snapshot based on public product information available in September 2026. Competitor features and plans may change.",
        status: { available: "Available", finishing: "Finishing", roadmap: "Roadmap" },
        yes: "Yes",
        partial: "Partial / different focus",
        no: "Not a core focus",
        planned: "Roadmap",
        differentiator: "Zobdino focus",
        noteTitle: "Why this combination matters",
        noteText:
          "Blinkist combines a large summary library with AI extraction; NotebookLM is a source-grounded research assistant with citations and Audio Overviews; ElevenReader is highly focused on natural read-aloud across user files. Zobdino focuses on joining those needs into one Persian-first, private, evidence-aware and resumable workflow.",
      };

  const journey = fa
    ? [
        ["ورود فایل", "PDF، EPUB، DOCX، TXT و Markdown", UploadCloud],
        ["استخراج و ساختار", "تقسیم‌بندی، نرمال‌سازی و نقشه فصل", FileText],
        ["درک محتوا", "ایندکس و برنامه‌ریزی خروجی", BrainCircuit],
        ["خلاصه فارسی", "خلاصه ساختاریافته و قابل ردیابی", Sparkles],
        ["شواهد منبع", "ارتباط خروجی با بخش‌های منبع", BookOpenCheck],
        ["صوت", "روایت کامل و صوت خلاصه", AudioLines],
        ["کتابخانه خصوصی", "بازگشت، ادامه و پخش مجدد", Library],
      ]
    : [
        ["Upload", "PDF, EPUB, DOCX, TXT and Markdown", UploadCloud],
        ["Extract & structure", "Sectioning, normalization and chapter map", FileText],
        ["Understand", "Indexing and output planning", BrainCircuit],
        ["Persian summary", "Structured, traceable summary output", Sparkles],
        ["Source evidence", "Links generated output back to source sections", BookOpenCheck],
        ["Audio", "Full narration and summary audio", AudioLines],
        ["Private library", "Reopen, resume and replay", Library],
      ];

  const features = fa
    ? [
        { title: "پنج فرمت اصلی سند", text: "PDF، EPUB، DOCX، TXT و Markdown در قرارداد فعلی محصول پشتیبانی می‌شوند.", icon: FileText, status: "available" as const },
        { title: "خلاصه فارسی منبع‌دار", text: "خلاصه همراه provenance و Evidence طراحی شده تا کاربر بداند خروجی به کدام بخش منبع متکی است.", icon: BookOpenCheck, status: "available" as const },
        { title: "صوت کامل + صوت خلاصه", text: "مسیر روایت کامل و نسخه شنیداری خلاصه در محصول فعال است؛ اولین مجموعه canonical دوصدایی برای عادت‌های اتمی QA و منتشر شده و rollout کتاب‌های بعدی ادامه دارد.", icon: Headphones, status: "available" as const },
        { title: "دو صدای تأییدشده فارسی", text: "Sulafat و Schedar قرارداد رسمی صدای زبدینو هستند؛ هر دو برای عادت‌های اتمی QA شده و به media-v0.2.0-rc.1 ارتقا یافته‌اند.", icon: Waves, status: "available" as const },
        { title: "پردازش قابل ادامه", text: "Checkpoint مرحله‌ای، quota-paused و resume مانع از تولید دوباره بخش‌های تأییدشده می‌شوند.", icon: RefreshCw, status: "available" as const },
        { title: "کتابخانه خصوصی", text: "فایل و خروجی کاربر private-by-default است و تجربه برای بازکردن مجدد و ادامه طراحی شده است.", icon: Library, status: "available" as const },
        { title: "مرز امنیتی مرورگر", text: "مرورگر به secretهای provider و routeهای trusted generation دسترسی مستقیم ندارد.", icon: LockKeyhole, status: "available" as const },
        { title: "QA و ردیابی فایل صوتی", text: "checksum، مدت، provenance و integrity پیش از معرفی یک asset به‌عنوان canonical بررسی می‌شوند.", icon: ShieldCheck, status: "available" as const },
        { title: "حالت‌های خروجی متنوع", text: "Brief کوتاه، خلاصه ۱۵ دقیقه‌ای، Deep Dive و گسترش navigation پیشرفته در نقشه توسعه قرار دارند.", icon: Route, status: "roadmap" as const },
      ]
    : [
        { title: "Five core document formats", text: "PDF, EPUB, DOCX, TXT and Markdown are supported by the current product contract.", icon: FileText, status: "available" as const },
        { title: "Source-grounded Persian summaries", text: "Summary provenance and evidence are designed to show which source sections support generated output.", icon: BookOpenCheck, status: "available" as const },
        { title: "Full audio + summary audio", text: "Full narration and summary-audio paths are active; the first canonical dual-voice set for Atomic Habits has passed QA and shipped, while rollout to additional books continues.", icon: Headphones, status: "available" as const },
        { title: "Two approved Persian voices", text: "Sulafat and Schedar are Zobdino's canonical voice profiles; both are QA-passed and promoted for Atomic Habits in media-v0.2.0-rc.1.", icon: Waves, status: "available" as const },
        { title: "Resumable processing", text: "Stage checkpoints, quota-paused states and resume logic preserve already verified work.", icon: RefreshCw, status: "available" as const },
        { title: "Private library", text: "User files and generated outputs are private by default, with reopen and resume workflows built in.", icon: Library, status: "available" as const },
        { title: "Browser security boundary", text: "Provider secrets and trusted generation routes are never exposed directly to browser code.", icon: LockKeyhole, status: "available" as const },
        { title: "Audio QA and traceability", text: "Checksums, duration, provenance and integrity are validated before an asset can become canonical.", icon: ShieldCheck, status: "available" as const },
        { title: "More output modes", text: "Short briefs, 15-minute summaries, deep dives and richer navigation remain on the product roadmap.", icon: Route, status: "roadmap" as const },
      ];

  const rows = fa
    ? [
        ["آپلود فایل شخصی", "بله", "بله", "بله", "بله"],
        ["PDF / DOCX / TXT", "بله", "بله", "بله", "بله"],
        ["EPUB", "بله", "تمرکز اصلی نیست", "بله", "بله"],
        ["خلاصه منبع‌محور", "تمرکز ویژه زبدینو", "AI Extract / Blinks", "بله + citation", "تمرکز اصلی نیست"],
        ["Evidence / provenance قابل نمایش", "تمرکز ویژه زبدینو", "محدودتر", "بله + citation", "تمرکز اصلی نیست"],
        ["روایت کامل فایل", "بله", "تمرکز اصلی نیست", "Audio Overview متفاوت است", "تمرکز اصلی"],
        ["صوت خلاصه / پادکست", "بله", "بله", "بله، Audio Overview", "محدودتر"],
        ["فارسی‌محور بودن تجربه", "تمرکز ویژه زبدینو", "خیر", "چندزبانه", "چندزبانه"],
        ["Checkpoint و resume مرحله‌ای تولید AI", "تمرکز ویژه زبدینو", "نامشخص عمومی", "نامشخص عمومی", "نامشخص عمومی"],
        ["کتابخانه محتوای آماده بزرگ", "در حال رشد", "۹۰۰۰+ عنوان", "مدل notebook شخصی", "کتابخانه + محتوای شخصی"],
      ]
    : [
        ["Personal file upload", "Yes", "Yes", "Yes", "Yes"],
        ["PDF / DOCX / TXT", "Yes", "Yes", "Yes", "Yes"],
        ["EPUB", "Yes", "Not a core focus", "Yes", "Yes"],
        ["Source-grounded summaries", "Zobdino focus", "AI Extract / Blinks", "Yes + citations", "Not a core focus"],
        ["Visible evidence / provenance", "Zobdino focus", "More limited", "Yes + citations", "Not a core focus"],
        ["Full-file narration", "Yes", "Not a core focus", "Audio Overview is different", "Core focus"],
        ["Summary audio / podcast", "Yes", "Yes", "Yes, Audio Overview", "More limited"],
        ["Persian-first product experience", "Zobdino focus", "No", "Multilingual", "Multilingual"],
        ["Stage-level AI generation checkpoints", "Zobdino focus", "Not publicly specified", "Not publicly specified", "Not publicly specified"],
        ["Large ready-made summary library", "Growing", "9,000+ titles", "Personal notebook model", "Library + personal content"],
      ];

  return (
    <main className="overflow-hidden">
      <section className="relative border-b border-black/10 dark:border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.18),transparent_34%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.12),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-bold text-accent">
              <Sparkles size={16} /> {copy.eyebrow}
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-tight md:text-7xl">{copy.title}</h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-gray-600 md:text-xl dark:text-gray-300">{copy.intro}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/upload" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-bold text-white transition hover:opacity-90">
                {copy.primary}<Arrow size={18} />
              </Link>
              <Link href="/catalog" className="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3 font-bold transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5">
                {copy.secondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-black md:text-5xl">{copy.journeyTitle}</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">{copy.journeyText}</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-7">
          {journey.map(([title, text, Icon], index) => {
            const JourneyIcon = Icon as typeof UploadCloud;
            return (
              <article key={String(title)} className="relative rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent"><JourneyIcon size={21} /></div>
                <div className="text-xs font-black text-accent">{String(index + 1).padStart(2, "0")}</div>
                <h3 className="mt-2 font-black">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{text as string}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-black/10 bg-black/[0.025] dark:border-white/10 dark:bg-white/[0.025]">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <h2 className="text-3xl font-black md:text-5xl">{copy.capabilitiesTitle}</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map(({ title, text, icon: Icon, status }) => (
              <article key={title} className="rounded-3xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#111116]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent"><Icon size={23} /></div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusStyle[status]}`}>{copy.status[status]}</span>
                </div>
                <h3 className="mt-6 text-xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-gray-600 dark:text-gray-400">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="max-w-4xl">
          <h2 className="text-3xl font-black md:text-5xl">{copy.comparisonTitle}</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">{copy.comparisonText}</p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-3xl border border-black/10 dark:border-white/10">
          <table className="w-full min-w-[900px] border-collapse text-start text-sm">
            <thead className="bg-black/[0.04] dark:bg-white/[0.05]">
              <tr>
                {[fa ? "قابلیت / تمرکز" : "Capability / focus", "Zobdino", "Blinkist", "Google NotebookLM", "ElevenReader"].map((head) => (
                  <th key={head} className="border-b border-black/10 px-5 py-4 text-start font-black dark:border-white/10">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]} className="border-b border-black/5 last:border-0 dark:border-white/5">
                  {row.map((cell, index) => (
                    <td key={`${row[0]}-${index}`} className={`px-5 py-4 align-top leading-6 ${index === 1 ? "bg-accent/[0.06] font-bold" : index === 0 ? "font-bold" : "text-gray-600 dark:text-gray-300"}`}>
                      {index === 1 && (cell === "بله" || cell === "Yes") ? <span className="inline-flex items-center gap-1.5"><Check size={16} className="text-emerald-500" />{cell}</span> : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-3 text-sm text-gray-500 md:grid-cols-3 dark:text-gray-400">
          <a className="rounded-2xl border border-black/10 p-4 hover:border-accent/40 dark:border-white/10" href="https://www.blinkist.com/" target="_blank" rel="noreferrer">Blinkist · public product information ↗</a>
          <a className="rounded-2xl border border-black/10 p-4 hover:border-accent/40 dark:border-white/10" href="https://support.google.com/gemininotebook/" target="_blank" rel="noreferrer">Google NotebookLM · public help center ↗</a>
          <a className="rounded-2xl border border-black/10 p-4 hover:border-accent/40 dark:border-white/10" href="https://elevenlabs.io/docs/help-center/product/mobile-apps/eleven-reader/what-is-eleven-reader" target="_blank" rel="noreferrer">ElevenReader · public documentation ↗</a>
        </div>

        <aside className="mt-12 rounded-3xl border border-accent/25 bg-accent/[0.07] p-7 md:p-9">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white"><BrainCircuit size={24} /></div>
          <h3 className="mt-5 text-2xl font-black">{copy.noteTitle}</h3>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-gray-700 dark:text-gray-300">{copy.noteText}</p>
        </aside>
      </section>
    </main>
  );
}
