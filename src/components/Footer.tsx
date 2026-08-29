"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

export default function Footer() {
  const { locale } = useLocale();
  const fa = locale === "fa";

  return (
    <footer className="mt-20 border-t border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src="/brand/zobdino-logo.png" alt="Zobdino" className="h-11 w-auto object-contain" />
          </div>
          <p className="mt-4 max-w-xl text-sm leading-7 text-black/60 dark:text-white/60">
            {fa ? "زبدینو فایل‌های متنی و کتاب‌ها را به خلاصه هوشمند، نسخه صوتی و تجربه شنیداری ساختاریافته تبدیل می‌کند." : "Zobdino turns documents and books into structured summaries, full audio, and intelligent listening experiences."}
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-black">{fa ? "محصول" : "Product"}</p>
          <div className="flex flex-col gap-2 text-sm text-black/60 dark:text-white/60">
            <Link href="/catalog">{fa ? "کتابخانه" : "Catalog"}</Link>
            <Link href="/books">{fa ? "کتاب‌ها" : "Books"}</Link>
            <Link href="/about">{fa ? "درباره" : "About"}</Link>
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm font-black">{fa ? "توسعه" : "Developers"}</p>
          <div className="flex flex-col gap-2 text-sm text-black/60 dark:text-white/60">
            <a href="https://github.com/Zobdino/Zobdino" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
              <ExternalLink size={15} /> GitHub
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-black/10 px-4 py-5 text-center text-xs text-black/50 dark:border-white/10 dark:text-white/50">© 2026 Zobdino</div>
    </footer>
  );
}
