import type { Metadata } from "next";
import { CheckCircle2, FileText, Headphones, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

import PrivateLibrary from "@/components/PrivateLibrary";
import UserFileIngestion from "@/components/UserFileIngestion";

export const metadata: Metadata = {
  title: "تبدیل فایل | زبدینو",
  description: "فایل خود را به خلاصه فارسی، شواهد قابل بررسی و تجربه صوتی خصوصی تبدیل کنید.",
};

const steps = [
  [FileText, "فایل را انتخاب کن", "PDF، EPUB، DOCX، Markdown یا متن؛ زبدینو قبل از ارسال، فایل را در مرورگر بررسی می‌کند."],
  [Sparkles, "خلاصه و منبع بگیر", "نکات اصلی به فارسی ساخته می‌شوند و شواهد هر نتیجه کنار آن باقی می‌ماند."],
  [Headphones, "بشنو و ادامه بده", "خروجی صوتی تأییدشده در مسیر خصوصی تو آماده می‌شود و از کتابخانه قابل بازگشت است."],
] as const;

export default function UploadPage() {
  return (
    <main>
      <section className="border-b border-black/5 dark:border-white/5">
        <div className="z-container grid gap-10 py-12 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/15 bg-violet-500/[0.08] px-4 py-2 text-sm font-bold text-violet-700 dark:text-violet-300">
              <LockKeyhole size={16} />
              پردازش خصوصی فایل
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.2] tracking-tight md:text-5xl">
              فایل را بده؛ نتیجه را <span className="text-violet-700 dark:text-violet-300">بخوان، بررسی کن و بشنو.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 z-muted md:text-lg">
              یک مسیر ساده برای تبدیل فایل شخصی به خلاصه فارسی، شواهد منبع و صوت. وضعیت پردازش روشن است و خروجی‌ها در کتابخانه خصوصی تو باقی می‌مانند.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm z-muted">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} className="text-emerald-500" /> خصوصی به‌صورت پیش‌فرض</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-500" /> وضعیت و بازیابی شفاف</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-500" /> منبع کنار خلاصه</span>
            </div>
          </div>

          <div className="grid gap-3">
            {steps.map(([Icon, title, body], index) => (
              <article key={title} className="rounded-3xl border border-black/7 bg-white/70 p-5 backdrop-blur dark:border-white/8 dark:bg-white/[0.035]">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
                    <Icon size={19} />
                  </div>
                  <div>
                    <p className="z-eyebrow">مرحله {(index + 1).toLocaleString("fa-IR")}</p>
                    <h2 className="mt-1 font-black">{title}</h2>
                    <p className="mt-1.5 text-sm leading-7 z-muted">{body}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="z-container py-10 md:py-14">
        <div className="mb-6">
          <p className="z-eyebrow">شروع تبدیل</p>
          <h2 className="mt-2 text-2xl font-black md:text-3xl">فایل و خروجی دلخواهت را انتخاب کن</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 z-muted">
            هیچ مرحله‌ای از پردازش پنهان نیست؛ پس از انتخاب فایل، وضعیت استخراج و پردازش را همین‌جا می‌بینی.
          </p>
        </div>
        <UserFileIngestion />
      </section>

      <section className="border-t border-black/5 dark:border-white/5">
        <div className="z-container py-12 md:py-16">
          <div className="mb-6 max-w-2xl">
            <p className="z-eyebrow">کتابخانه خصوصی</p>
            <h2 className="mt-2 text-2xl font-black md:text-3xl">از جایی که رها کردی ادامه بده</h2>
            <p className="mt-2 text-sm leading-7 z-muted">
              پردازش‌های همین مرورگر را دوباره باز کن، وضعیت را ببین و خروجی‌های آماده را ادامه بده.
            </p>
          </div>
          <PrivateLibrary />
        </div>
      </section>
    </main>
  );
}
