"use client";

import Link from "next/link";
import { ExternalLink, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";

import { useLocale } from "@/components/LocaleProvider";
import { useTheme } from "@/components/ThemeProvider";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();

  const fa = locale === "fa";

  const labels = {
    books: fa ? "کتاب‌ها" : "Books",
    catalog: fa ? "کتابخانه" : "Catalog",
    about: fa ? "درباره زبدینو" : "About",
    github: "GitHub",
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0b0f]/85">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <img src="/brand/zobdino-mark.svg" alt="Zobdino" className="h-9 w-9" />
          <span className="text-xl font-black tracking-tight">Zobdino</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
          <Link href="/books">{labels.books}</Link>
          <Link href="/catalog">{labels.catalog}</Link>
          <Link href="/about">{labels.about}</Link>
          <a
            href="https://github.com/Zobdino/Zobdino"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5"
          >
            <ExternalLink size={16} />
            {labels.github}
          </a>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => setLocale(fa ? "en" : "fa")}
            className="rounded-xl border border-black/10 px-3 py-2 text-xs font-bold dark:border-white/10"
          >
            {fa ? "EN" : "FA"}
          </button>

          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-xl border border-black/10 p-2 dark:border-white/10"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <button
          type="button"
          className="rounded-xl border border-black/10 p-2 md:hidden dark:border-white/10"
          onClick={() => setOpen((value) => !value)}
          aria-label="Menu"
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-black/10 bg-white px-4 py-4 md:hidden dark:border-white/10 dark:bg-[#0b0b0f]">
          <div className="flex flex-col gap-4 text-sm font-semibold">
            <Link href="/books" onClick={() => setOpen(false)}>{labels.books}</Link>
            <Link href="/catalog" onClick={() => setOpen(false)}>{labels.catalog}</Link>
            <Link href="/about" onClick={() => setOpen(false)}>{labels.about}</Link>
            <a href="https://github.com/Zobdino/Zobdino" target="_blank" rel="noreferrer">
              GitHub
            </a>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLocale(fa ? "en" : "fa")}
                className="rounded-xl border border-black/10 px-3 py-2 dark:border-white/10"
              >
                {fa ? "English" : "فارسی"}
              </button>
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-xl border border-black/10 px-3 py-2 dark:border-white/10"
              >
                {theme === "dark" ? "Light" : "Dark"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
