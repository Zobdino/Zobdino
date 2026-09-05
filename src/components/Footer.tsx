"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";

export default function Footer() {
  const { locale } = useLocale();
  const fa = locale === "fa";

  return (
    <footer className="border-t border-[#08253a]/8 bg-[#fff7e8]/70 dark:border-white/8 dark:bg-[#071b2a]">
      <div className="z-container grid gap-10 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr] md:py-14">
        <div>
          <Link href="/" className="z-focus inline-flex items-center gap-3 rounded-xl" aria-label={fa ? "صفحه اصلی زبدینو" : "Zobdino home"}>
            <Image src="/brand/zobdino-mark-v2.svg" alt="" width={48} height={48} className="h-12 w-12" />
            <div>
              <div className="text-xl font-black tracking-[-0.055em] text-[#08253a] dark:text-[#fff7e8]">{fa ? "زبدینو" : "Zobdino"}</div>
              <div className="mt-0.5 text-xs font-bold text-[#7c766d] dark:text-[#c9c4ba]">{fa ? "دانش، ساده‌تر و عمیق‌تر" : "Knowledge, clearer and deeper"}</div>
            </div>
          </Link>
          <p className="mt-4 max-w-lg text-sm leading-7 z-muted">
            {fa
              ? "کتاب و فایل را به خلاصه کاربردی، شواهد قابل بررسی و تجربه صوتی فارسی تبدیل کن؛ در یک مسیر روشن، خصوصی و قابل اعتماد."
              : "Turn books and documents into useful summaries, verifiable evidence, and audio in one clear private workflow."}
          </p>
          <Link href="/upload" className="z-focus mt-5 inline-flex items-center gap-2 text-sm font-black text-[#b97c08] dark:text-[#f4c66a]">
            {fa ? "تبدیل فایل" : "Upload a file"}
            <ArrowLeft size={16} />
          </Link>
        </div>

        <div>
          <p className="mb-4 text-sm font-black">{fa ? "محصول" : "Product"}</p>
          <div className="flex flex-col gap-3 text-sm z-muted">
            <Link href="/upload">{fa ? "تبدیل فایل" : "Upload"}</Link>
            <Link href="/books">{fa ? "کتاب‌ها" : "Books"}</Link>
            <Link href="/features">{fa ? "امکانات" : "Features"}</Link>
            <Link href="/about">{fa ? "درباره زبدینو" : "About"}</Link>
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-black">{fa ? "منابع" : "Resources"}</p>
          <div className="flex flex-col gap-3 text-sm z-muted">
            <a href="https://github.com/Zobdino/Zobdino" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2"><ExternalLink size={15} /> GitHub</a>
            <Link href="/catalog">{fa ? "کتابخانه عمومی" : "Catalog"}</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-[#08253a]/8 dark:border-white/8">
        <div className="z-container flex flex-col gap-2 py-5 text-xs z-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Zobdino</span>
          <span>{fa ? "دانش کمترِ شلوغ، فهم بیشتر." : "Less noise. More knowledge."}</span>
        </div>
      </div>
    </footer>
  );
}
