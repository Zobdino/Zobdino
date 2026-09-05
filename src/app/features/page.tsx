"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpenCheck, FileText, Headphones, Library, LockKeyhole, RefreshCw, Sparkles, UploadCloud } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

export default function FeaturesPage() {
  const { locale } = useLocale();
  const fa = locale === "fa";
  const Arrow = fa ? ArrowLeft : ArrowRight;

  const copy = fa ? {
    eyebrow:"امکانات زبدینو",
    title:"از فایل خام تا فهم، منبع و صدا؛ در یک مسیر واحد.",
    intro:"زبدینو برای این ساخته شده که یک سند یا کتاب را فقط خلاصه نکند؛ بلکه نتیجه‌ای بدهد که بتوانی بخوانی، منبعش را بررسی کنی، گوش بدهی و بعداً دوباره به آن برگردی.",
    primary:"تبدیل فایل", secondary:"دیدن کتاب‌ها", journeyTitle:"تجربه‌ای که از ابتدا تا انتها به هم وصل است",
    trustTitle:"چرا این تجربه متفاوت است؟", trustText:"خلاصه، Evidence، صوت و کتابخانه خصوصی اجزای جدا از هم نیستند. هر خروجی به همان فایل و همان مسیر پردازش متصل می‌ماند تا تجربه قابل اعتماد و قابل ادامه باشد."
  } : {
    eyebrow:"Zobdino features",
    title:"From a raw file to understanding, evidence and audio in one flow.",
    intro:"Zobdino is built to do more than summarize a document or book. It gives you an output you can read, verify against its source, listen to, and reopen later.",
    primary:"Upload a file", secondary:"Browse books", journeyTitle:"One connected experience from start to finish",
    trustTitle:"What makes the workflow different?", trustText:"Summary, evidence, audio and the private library are not separate tools. Each output stays connected to the same source file and processing journey so the experience remains trustworthy and resumable."
  };

  const features = fa ? [
    [UploadCloud,"ورود ساده فایل","PDF، EPUB، DOCX، TXT و Markdown را وارد کن و مسیر تبدیل را از همان‌جا شروع کن."],
    [Sparkles,"خلاصه فارسی ساختاریافته","به‌جای یک متن پراکنده، ایده‌های اصلی را در یک خروجی خوانا و منظم دریافت کن."],
    [BookOpenCheck,"Evidence قابل بررسی","ببین هر بخش از خلاصه به کدام قسمت منبع متکی است و راحت‌تر به خروجی اعتماد کن."],
    [Headphones,"خلاصه صوتی و روایت کامل","بسته به نوع خروجی، نتیجه را به‌صورت شنیداری هم دنبال کن؛ با دو صدای رسمی فارسی زبدینو."],
    [RefreshCw,"پردازش قابل ادامه","اگر پردازش متوقف شود، کار تأییدشده حفظ می‌شود و مسیر از همان نقطه قابل ادامه است."],
    [Library,"کتابخانه خصوصی","فایل‌ها و خروجی‌های شخصی همان مرورگر را دوباره باز کن، ادامه بده و گوش کن."]
  ] : [
    [UploadCloud,"Simple file intake","Upload PDF, EPUB, DOCX, TXT or Markdown and start the conversion journey from one place."],
    [Sparkles,"Structured Persian summaries","Get a readable, organized view of the key ideas instead of a loose block of generated text."],
    [BookOpenCheck,"Verifiable evidence","See which source sections support each output and evaluate the result with more confidence."],
    [Headphones,"Summary audio and full narration","Listen to the result when audio is available, using Zobdino's two approved Persian voices."],
    [RefreshCw,"Resumable processing","If processing is interrupted, verified work is preserved so the journey can continue instead of restarting."],
    [Library,"Private library","Reopen personal files and outputs in the same browser, continue the journey, and listen again."]
  ];

  const journey = fa ? ["فایل را وارد کن","خلاصه و Evidence را ببین","صدا را گوش بده","در کتابخانه خصوصی نگه دار"] : ["Upload your file","Review summary and evidence","Listen to audio","Keep it in your private library"];

  return <main className="z-container py-10 md:py-16">
    <section className="grid gap-8 lg:grid-cols-[1fr_390px] lg:items-end">
      <div className="max-w-3xl">
        <span className="z-eyebrow">{copy.eyebrow}</span>
        <h1 className="mt-4 text-4xl font-black leading-tight tracking-[-0.045em] text-[#08253a] dark:text-[#fff7e8] md:text-6xl">{copy.title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 z-muted md:text-lg">{copy.intro}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/upload" className="z-focus inline-flex items-center gap-2 rounded-2xl bg-[#f4b62f] px-5 py-3.5 text-sm font-black text-[#08253a] shadow-lg shadow-[#e5a92d]/20 transition hover:bg-[#e5a92d]">{copy.primary}<Arrow size={16}/></Link>
          <Link href="/books" className="z-focus inline-flex items-center gap-2 rounded-2xl border border-[#08253a]/10 bg-white/65 px-5 py-3.5 text-sm font-black dark:border-white/10 dark:bg-white/[0.035]">{copy.secondary}</Link>
        </div>
      </div>
      <div className="z-surface p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f4c66a]/22 text-[#b97c08] dark:text-[#f4c66a]"><FileText size={20}/></span>
          <div><p className="font-black">{copy.journeyTitle}</p><ol className="mt-4 space-y-3">{journey.map((item,index)=><li key={item} className="flex items-center gap-3 text-sm z-muted"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#08253a]/5 text-xs font-black dark:bg-white/[0.06]">{(index+1).toLocaleString(fa?"fa-IR":"en-US")}</span>{item}</li>)}</ol></div>
        </div>
      </div>
    </section>

    <section className="mt-14 md:mt-18"><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{features.map(([Icon,title,text])=>{ const FeatureIcon=Icon as typeof UploadCloud; return <article key={String(title)} className="z-surface p-6"><span className="grid size-11 place-items-center rounded-2xl bg-[#f4c66a]/22 text-[#b97c08] dark:text-[#f4c66a]"><FeatureIcon size={20}/></span><h2 className="mt-5 text-xl font-black">{String(title)}</h2><p className="mt-3 text-sm leading-7 z-muted">{String(text)}</p></article>; })}</div></section>

    <section className="z-surface mt-14 overflow-hidden p-7 md:p-9"><div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-center"><div className="max-w-2xl"><div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300"><LockKeyhole size={18}/><p className="text-sm font-black">{copy.trustTitle}</p></div><p className="mt-4 text-base leading-8 z-muted">{copy.trustText}</p></div><Link href="/upload" className="z-focus inline-flex items-center gap-2 rounded-2xl bg-[#08253a] px-5 py-3.5 text-sm font-black text-[#fff7e8] dark:bg-[#fff7e8] dark:text-[#08253a]">{copy.primary}<Arrow size={16}/></Link></div></section>
  </main>;
}
