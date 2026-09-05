import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileText, Headphones, LockKeyhole, Quote, ShieldCheck, Sparkles } from "lucide-react";

import SourceEvidenceList from "@/components/SourceEvidenceList";
import { APPROVED_VOICE_PROFILES } from "@/lib/voices";

const previewEvidence = [
  {
    sourceRef: "page:1",
    startOffset: 0,
    endOffset: 842,
  },
  {
    sourceRef: "page:2:part:1",
    startOffset: 843,
    endOffset: 1710,
  },
];

export default function UploadResultPreviewPage() {
  const approvedVoices = Object.values(APPROVED_VOICE_PROFILES);

  return (
    <main>
      <section className="border-b border-black/5 dark:border-white/5">
        <div className="z-container py-12 md:py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/[0.08] px-4 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 size={16} />
                نمونه نتیجه پردازش خصوصی
              </div>
              <h1 className="mt-5 text-4xl font-black leading-[1.2] tracking-tight md:text-5xl">
                نتیجه‌ات در سه لایه روشن: <span className="text-violet-700 dark:text-violet-300">خلاصه، منبع و صوت.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 z-muted md:text-lg">
                این پیش‌نمایش نشان می‌دهد یک فایل پس از پردازش چگونه به نتیجه‌ای قابل خواندن، قابل بررسی و قابل شنیدن تبدیل می‌شود.
              </p>
            </div>

            <Link href="/upload" className="z-focus inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-5 py-3 text-sm font-black dark:border-white/10 dark:bg-white/[0.035]">
              تبدیل فایل خودم
              <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </section>

      <div className="z-container py-10 md:py-14">
        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          {[
            [Sparkles, "خلاصه فارسی", "نکات اصلی با ساختار قابل مرور"],
            [Quote, "منبع و شواهد", "ردّ هر نتیجه تا بخش مرتبط فایل"],
            [Headphones, "تجربه صوتی", "خروجی صوتی فقط پس از تأیید"],
          ].map(([Icon, title, body]) => {
            const ResultIcon = Icon as typeof Sparkles;
            return (
              <article key={title as string} className="rounded-3xl border border-black/7 bg-white/70 p-5 dark:border-white/8 dark:bg-white/[0.035]">
                <ResultIcon size={20} className="text-violet-700 dark:text-violet-300" />
                <h2 className="mt-4 font-black">{title as string}</h2>
                <p className="mt-1.5 text-sm leading-7 z-muted">{body as string}</p>
              </article>
            );
          })}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-black/7 bg-white/80 p-6 shadow-sm dark:border-white/8 dark:bg-white/[0.03] sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
                  <FileText size={21} />
                </div>
                <div>
                  <p className="z-eyebrow">خواندن</p>
                  <h2 className="text-xl font-black">خلاصه فارسی</h2>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">آماده</span>
            </div>

            <div className="mt-6 space-y-4 text-[15px] leading-8 z-muted">
              <p>
                خلاصه، ایده‌های اصلی فایل را بدون جداشدن از متن منبع در یک روایت کوتاه و ساختاریافته جمع می‌کند. هدف این است که ابتدا تصویر کلی را سریع بفهمی و بعد روی بخش‌های مهم عمیق‌تر شوی.
              </p>
              <p>
                نکات کلیدی به شواهد متن متصل می‌مانند؛ بنابراین برای بررسی یک ادعا لازم نیست دوباره تمام فایل را از ابتدا جست‌وجو کنی.
              </p>
            </div>

            <div className="mt-8 border-t border-black/7 pt-6 dark:border-white/8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="z-eyebrow">بررسی</p>
                  <h3 className="mt-1 font-black">منابع و شواهد</h3>
                  <p className="mt-1 text-sm leading-7 z-muted">هر ارجاع، محل مرتبط در فایل اصلی را مشخص می‌کند.</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-bold text-violet-700 dark:text-violet-300">
                  <Quote size={13} /> Evidence
                </span>
              </div>
              <SourceEvidenceList evidence={previewEvidence} />
            </div>
          </section>

          <section className="rounded-[2rem] bg-[#17131f] p-6 text-white shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-violet-200">
                <Headphones size={21} />
              </div>
              <div>
                <p className="text-xs font-black text-violet-300">شنیدن</p>
                <h2 className="text-xl font-black">خلاصه صوتی</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/60">صدای تأییدشده را انتخاب کن؛ در مسیر واقعی فقط asset قابل اعتماد در پلیر خصوصی نمایش داده می‌شود.</p>

            <div className="mt-5 space-y-3">
              {approvedVoices.map((voice, index) => (
                <div key={voice.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black">{voice.labelFa}</p>
                      <p className="mt-1 text-xs text-white/45">گزینه {(index + 1).toLocaleString("fa-IR")} روایت</p>
                    </div>
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">تأییدشده</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-black">پخش امن</p>
                  <p className="mt-1 text-xs text-white/45">ادامه از آخرین نقطه شنیدن</p>
                </div>
                <ShieldCheck size={20} className="text-emerald-300" />
              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-2/3 rounded-full bg-violet-400" />
              </div>
              <div className="mt-2 flex justify-between text-xs text-white/40">
                <span>۰۳:۱۸</span>
                <span>۰۵:۰۲</span>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-[2rem] border border-black/7 bg-white/70 p-6 dark:border-white/8 dark:bg-white/[0.035] md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <LockKeyhole size={21} />
              </div>
              <div>
                <h2 className="font-black">نتیجه شخصی در کتابخانه شخصی</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 z-muted">
                  فایل شخصی به‌صورت پیش‌فرض عمومی نمی‌شود. وضعیت پردازش و خروجی‌های آماده برای بازگشت و ادامه در تجربه خصوصی نگه داشته می‌شوند.
                </p>
              </div>
            </div>
            <Link href="/upload" className="z-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-violet-700 px-5 py-3 text-sm font-black text-white">
              شروع با فایل من
              <ArrowLeft size={16} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
