"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpenCheck, Headphones, LockKeyhole, Sparkles } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

export default function AboutPage() {
  const { locale } = useLocale();
  const fa = locale === "fa";
  const Arrow = fa ? ArrowLeft : ArrowRight;
  const copy = fa ? {
    eyebrow:"درباره زبدینو",
    title:"برای زمانی که می‌خواهی یک متن را واقعاً بفهمی، نه فقط از روی آن رد شوی.",
    intro:"زبدینو یک تجربه فارسی‌محور برای تبدیل کتاب و سند به خلاصه ساختاریافته، Evidence قابل بررسی و صوت است؛ با مسیری که از فایل شخصی تا کتابخانه خصوصی به هم متصل می‌ماند.",
    missionTitle:"هدف ما", missionText:"کم‌کردن فاصله بین داشتن یک منبع و فهمیدن آن. کاربر باید بتواند سریع‌تر ایده‌های اصلی را پیدا کند، منبع را بررسی کند و در زمانی که خواندن ممکن نیست، همان محتوا را گوش بدهد.",
    trustTitle:"اعتماد بخشی از محصول است", trustText:"خروجی فقط به‌خاطر اینکه توسط هوش مصنوعی ساخته شده قابل اعتماد فرض نمی‌شود. زبدینو Evidence، provenance، وضعیت پردازش و فایل‌های تأییدشده را در تجربه نگه می‌دارد تا نتیجه قابل بررسی باشد.",
    privateTitle:"فایل شخصی، خصوصی می‌ماند", privateText:"فایل‌های شخصی در کتابخانه خصوصی همان تجربه نگه داشته می‌شوند و با مجموعه عمومی قاطی نمی‌شوند. کاربر می‌تواند مسیر پردازش را دوباره باز کند و خروجی تأییدشده را ادامه دهد.",
    audioTitle:"شنیدن، یک قابلیت جانبی نیست", audioText:"صوت یکی از خروجی‌های اصلی زبدینو است. برای کتاب‌های آماده، کاربر می‌تواند بین دو صدای رسمی فارسی جابه‌جا شود و بدون از دست دادن موقعیت شنیدن ادامه دهد.",
    cta:"یک فایل را امتحان کن", secondary:"دیدن امکانات"
  } : {
    eyebrow:"About Zobdino",
    title:"For the moments when you want to understand a text, not just move past it.",
    intro:"Zobdino is a Persian-first experience for turning books and documents into structured summaries, verifiable evidence and audio, with one connected journey from a personal file to a private library.",
    missionTitle:"Our purpose", missionText:"Reduce the distance between having a source and understanding it. Users should be able to find the key ideas faster, inspect the source, and listen when reading is not practical.",
    trustTitle:"Trust is part of the product", trustText:"An output is not treated as trustworthy simply because AI generated it. Zobdino keeps evidence, provenance, processing state and verified assets in the experience so results can be inspected.",
    privateTitle:"Personal files stay private", privateText:"Personal files remain inside the private-library experience and are kept separate from the public catalog. Users can reopen processing and continue from verified outputs.",
    audioTitle:"Listening is a first-class outcome", audioText:"Audio is a core Zobdino output. On supported books, users can switch between two approved Persian voices and keep their listening position while changing narration.",
    cta:"Try a file", secondary:"Explore features"
  };

  const pillars = [[Sparkles,copy.missionTitle,copy.missionText],[BookOpenCheck,copy.trustTitle,copy.trustText],[LockKeyhole,copy.privateTitle,copy.privateText],[Headphones,copy.audioTitle,copy.audioText]];

  return <main className="z-container py-10 md:py-16">
    <section className="max-w-4xl">
      <span className="z-eyebrow">{copy.eyebrow}</span>
      <h1 className="mt-4 text-4xl font-black leading-tight tracking-[-0.045em] text-[#08253a] dark:text-[#fff7e8] md:text-6xl">{copy.title}</h1>
      <p className="mt-6 max-w-3xl text-lg leading-9 z-muted">{copy.intro}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/upload" className="z-focus inline-flex items-center gap-2 rounded-2xl bg-[#f4b62f] px-5 py-3.5 text-sm font-black text-[#08253a] shadow-lg shadow-[#e5a92d]/20 transition hover:bg-[#e5a92d]">{copy.cta}<Arrow size={16}/></Link>
        <Link href="/features" className="z-focus inline-flex items-center rounded-2xl border border-[#08253a]/10 bg-white/65 px-5 py-3.5 text-sm font-black dark:border-white/10 dark:bg-white/[0.035]">{copy.secondary}</Link>
      </div>
    </section>

    <section className="mt-14 grid gap-5 md:grid-cols-2">
      {pillars.map(([Icon,title,text]) => { const PillarIcon = Icon as typeof Sparkles; return <article key={String(title)} className="z-surface p-6 md:p-7">
        <span className="grid size-11 place-items-center rounded-2xl bg-[#f4c66a]/22 text-[#b97c08] dark:text-[#f4c66a]"><PillarIcon size={20}/></span>
        <h2 className="mt-5 text-2xl font-black">{String(title)}</h2>
        <p className="mt-3 text-sm leading-8 z-muted md:text-base">{String(text)}</p>
      </article>; })}
    </section>

    <section className="z-surface mt-14 p-7 md:p-9">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="max-w-2xl"><p className="text-sm font-black text-[#b97c08] dark:text-[#f4c66a]">Zobdino</p><p className="mt-3 text-lg font-black leading-8">{fa ? "یک مسیر واحد برای خواندن، بررسی منبع، شنیدن و بازگشت دوباره به چیزی که برایت مهم است." : "One connected path for reading, checking the source, listening, and returning to what matters."}</p></div>
        <Link href="/books" className="z-focus inline-flex items-center gap-2 rounded-2xl bg-[#08253a] px-5 py-3.5 text-sm font-black text-[#fff7e8] dark:bg-[#fff7e8] dark:text-[#08253a]">{fa ? "مرور کتاب‌ها" : "Browse books"}<Arrow size={16}/></Link>
      </div>
    </section>
  </main>;
}
