"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Github } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";

export default function Footer() {
  const { locale } = useLocale();
  const fa = locale === "fa";

  return (
    <footer className="border-t border-black/7 bg-white/45 dark:border-white/8 dark:bg-white/[0.015]">
      <div className="z-container grid gap-10 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr] md:py-14">
        <div>
          <Link href="/" className="z-focus inline-flex rounded-xl" aria-label={fa ? "صفحه اصلی زبدینو" : "Zobdino home"}>
            <Image
              src="/brand/zobdino-logo.png"
              alt={fa ? "زبدینو" : "Zobdino"}
              width={220}
              height={88}
              sizes="160px"
              className="h-12 w-auto max-w-[160px] object-contain"
            />
          </Link>
          <p className="mt-4 max-w-lg text-sm leading-7 z-muted">
            {fa
              ? "فایل و کتابت را به خلاصه فارسی، شواهد قابل بررسی و تجربه صوتی تبدیل کن؛ در یک مسیر روشن و خصوصی."
              : "Turn documents and books into structured summaries, verifiable evidence, and audio in one private workflow."}
          </p>
          <Link href="/upload" className="z-focus mt-5 inline-flex items-center gap-2 text-sm font-black text-violet-700 dark:text-violet-300">
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
            <a
              href="https://github.com/Zobdino/Zobdino"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Github size={15} /> GitHub
            </a>
            <Link href="/catalog">{fa ? "کتابخانه عمومی" : "Catalog"}</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-black/7 dark:border-white/8">
        <div className="z-container flex flex-col gap-2 py-5 text-xs z-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Zobdino</span>
          <span>{fa ? "ساخته‌شده برای فهم بهتر، نه شلوغی بیشتر." : "Built for clearer understanding, not more clutter."}</span>
        </div>
      </div>
    </footer>
  );
}
