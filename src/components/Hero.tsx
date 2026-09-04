import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileText, Headphones, ShieldCheck, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-black/5 dark:border-white/5">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.16),transparent_28rem)]" />

      <div className="z-container grid gap-14 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/15 bg-violet-500/8 px-4 py-2 text-sm font-bold text-violet-700 dark:text-violet-300">
            <Sparkles size={16} />
            خلاصه، منبع و صوت فارسی از یک فایل
          </div>

          <h1 className="max-w-3xl text-4xl font-black leading-[1.2] tracking-tight sm:text-5xl md:text-6xl">
            کتاب یا فایل را بده؛
            <span className="block text-violet-700 dark:text-violet-300">زبدینو عصاره‌اش را قابل فهم و شنیدنی می‌کند.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 z-muted md:text-xl md:leading-9">
            فایل را آپلود کن، خلاصه فارسی ساختاریافته بگیر، منبع هر نکته را ببین و همان محتوا را با صدای فارسی گوش کن؛ همه در یک مسیر روشن و خصوصی.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/upload"
              className="z-focus inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-violet-700 px-6 py-3.5 text-base font-black text-white shadow-lg shadow-violet-700/20 transition hover:-translate-y-0.5 hover:bg-violet-800"
            >
              تبدیل فایل
              <ArrowLeft size={18} />
            </Link>

            <Link
              href="/books/atomic-habits"
              className="z-focus inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-6 py-3.5 text-base font-bold backdrop-blur transition hover:border-violet-500/30 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <Headphones size={18} />
              نمونه صوتی واقعی
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm z-muted">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-500" /> بدون نصب</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} className="text-emerald-500" /> فایل خصوصی</span>
            <span className="inline-flex items-center gap-1.5"><FileText size={15} className="text-emerald-500" /> PDF، EPUB، DOCX و متن</span>
          </div>
        </div>

        <div className="relative">
          <div className="z-surface rounded-[2rem] p-4 sm:p-5">
            <div className="rounded-[1.5rem] border border-black/5 bg-white p-5 dark:border-white/5 dark:bg-[#111016] sm:p-7">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="z-eyebrow">مسیر کاربر</p>
                  <h2 className="mt-1 text-xl font-black">از فایل تا فهم و شنیدن</h2>
                </div>
                <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-700 dark:text-violet-300">
                  <Sparkles size={22} />
                </div>
              </div>

              <div className="space-y-3">
                {[
                  ["۱", "آپلود", "فایل یا کتابت را انتخاب کن"],
                  ["۲", "خلاصه فارسی", "نکات اصلی با ساختار روشن"],
                  ["۳", "منبع و شواهد", "بدان هر نتیجه از کجای متن آمده"],
                  ["۴", "صوت", "همان محتوا را با صدای فارسی گوش کن"],
                ].map(([step, title, body]) => (
                  <div key={step} className="flex gap-4 rounded-2xl border border-black/5 bg-black/[0.018] p-4 dark:border-white/5 dark:bg-white/[0.025]">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-700 text-sm font-black text-white">{step}</div>
                    <div>
                      <p className="font-black">{title}</p>
                      <p className="mt-1 text-sm leading-6 z-muted">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
