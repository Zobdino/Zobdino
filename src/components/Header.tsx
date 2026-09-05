"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";

import { useLocale } from "@/components/LocaleProvider";
import { useTheme } from "@/components/ThemeProvider";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const fa = locale === "fa";
  const labels = { upload: fa ? "تبدیل فایل" : "Upload", books: fa ? "کتاب‌ها" : "Books", features: fa ? "امکانات" : "Features", about: fa ? "درباره" : "About" };

  return (
    <header className="sticky top-0 z-50 border-b border-[#08253a]/8 bg-[color:color-mix(in_srgb,var(--page-bg)_90%,transparent)] backdrop-blur-2xl dark:border-white/8">
      <div className="z-container flex h-[76px] items-center justify-between gap-4">
        <Link href="/" className="z-focus inline-flex items-center gap-2.5 rounded-xl" aria-label={fa ? "صفحه اصلی زبدینو" : "Zobdino home"}>
          <Image src="/brand/zobdino-mark-v2.svg" alt="" width={44} height={44} priority className="h-11 w-11" />
          <span className="text-[1.35rem] font-black tracking-[-0.055em] text-[#08253a] dark:text-[#fff7e8]">{fa ? "زبدینو" : "Zobdino"}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label={fa ? "ناوبری اصلی" : "Primary navigation"}>
          <Link href="/books" className="z-focus rounded-xl px-3 py-2 text-sm font-bold z-muted transition hover:bg-[#08253a]/5 hover:text-[var(--page-fg)] dark:hover:bg-white/[0.05]">{labels.books}</Link>
          <Link href="/features" className="z-focus rounded-xl px-3 py-2 text-sm font-bold z-muted transition hover:bg-[#08253a]/5 hover:text-[var(--page-fg)] dark:hover:bg-white/[0.05]">{labels.features}</Link>
          <Link href="/about" className="z-focus rounded-xl px-3 py-2 text-sm font-bold z-muted transition hover:bg-[#08253a]/5 hover:text-[var(--page-fg)] dark:hover:bg-white/[0.05]">{labels.about}</Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button type="button" onClick={() => setLocale(fa ? "en" : "fa")} className="z-focus rounded-xl border border-[#08253a]/10 px-3 py-2 text-xs font-black dark:border-white/10" aria-label={fa ? "تغییر زبان به انگلیسی" : "Switch language to Persian"}>{fa ? "EN" : "FA"}</button>
          <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="z-focus rounded-xl border border-[#08253a]/10 p-2.5 dark:border-white/10" aria-label={fa ? "تغییر حالت نمایش" : "Toggle theme"}>{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>
          <Link href="/upload" className="z-focus inline-flex items-center gap-2 rounded-2xl bg-[#f4b62f] px-4 py-2.5 text-sm font-black text-[#08253a] shadow-sm transition hover:bg-[#e5a92d]">{labels.upload}<ArrowLeft size={16} /></Link>
        </div>

        <button type="button" className="z-focus rounded-xl border border-[#08253a]/10 p-2.5 md:hidden dark:border-white/10" onClick={() => setOpen((value) => !value)} aria-label={open ? (fa ? "بستن منو" : "Close menu") : (fa ? "باز کردن منو" : "Open menu")} aria-expanded={open}>{open ? <X size={21} /> : <Menu size={21} />}</button>
      </div>

      {open && <div className="border-t border-[#08253a]/8 bg-[var(--page-bg)] md:hidden dark:border-white/8"><div className="z-container flex flex-col gap-2 py-4">
        <Link href="/upload" onClick={() => setOpen(false)} className="rounded-2xl bg-[#f4b62f] px-4 py-3 text-sm font-black text-[#08253a]">{labels.upload}</Link>
        <Link href="/books" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-bold">{labels.books}</Link>
        <Link href="/features" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-bold">{labels.features}</Link>
        <Link href="/about" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-bold">{labels.about}</Link>
        <div className="mt-2 flex gap-2 border-t border-[#08253a]/8 pt-3 dark:border-white/8">
          <button type="button" onClick={() => setLocale(fa ? "en" : "fa")} className="rounded-xl border border-[#08253a]/10 px-3 py-2 text-sm font-bold dark:border-white/10">{fa ? "English" : "فارسی"}</button>
          <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-xl border border-[#08253a]/10 px-3 py-2 text-sm font-bold dark:border-white/10">{theme === "dark" ? (fa ? "روشن" : "Light") : (fa ? "تیره" : "Dark")}</button>
        </div>
      </div></div>}
    </header>
  );
}
