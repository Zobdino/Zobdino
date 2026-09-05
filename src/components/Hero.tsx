import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle2, Headphones, Play, ShieldCheck, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[#08253a]/6 dark:border-white/5">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_12%,rgba(244,198,106,0.24),transparent_30rem)]" />
      <div className="z-container grid gap-12 py-14 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-20">
        <div>
          <p className="mb-5 text-sm font-bold tracking-wide text-[#6d7479] dark:text-[#d4d0c8]">Small Ideas. Big Changes.</p>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.22] tracking-[-0.055em] text-[#08253a] dark:text-[#fff7e8] sm:text-5xl md:text-[3.45rem]">
            خلاصه‌های صوتی و کاربردی
            <span className="block">برای ساختن یک زندگی بهتر</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 z-muted md:text-lg md:leading-9">زبدینو کتاب‌ها و فایل‌های ارزشمند را برایت خلاصه، منبع‌دار و شنیدنی می‌کند؛ تا در زمان کمتر، عمیق‌تر یاد بگیری و راحت‌تر عمل کنی.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/upload" className="z-focus inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#f4b62f] px-6 py-3.5 text-base font-black text-[#08253a] shadow-[0_12px_30px_rgba(229,169,45,0.22)] transition hover:-translate-y-0.5 hover:bg-[#e5a92d]">تبدیل فایل شخصی<ArrowLeft size={18} /></Link>
            <Link href="/books" className="z-focus inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#08253a]/12 bg-white/60 px-6 py-3.5 text-base font-bold text-[#08253a] backdrop-blur transition hover:border-[#e5a92d]/50 dark:border-white/12 dark:bg-white/[0.04] dark:text-[#fff7e8]"><BookOpen size={18} />مشاهده کتاب‌ها</Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm z-muted">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-600" /> خلاصه ساختاریافته</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} className="text-emerald-600" /> منبع و شواهد</span>
            <span className="inline-flex items-center gap-1.5"><Headphones size={15} className="text-emerald-600" /> صوت فارسی</span>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-[2.25rem] border border-[#08253a]/7 bg-white/58 p-4 shadow-[0_30px_80px_rgba(8,37,58,0.09)] backdrop-blur dark:border-white/8 dark:bg-white/[0.035] sm:p-6">
            <div className="rounded-[1.75rem] bg-[#fff8ea] p-6 dark:bg-[#0b2a40] sm:p-8">
              <div className="mb-5 inline-flex rounded-full bg-[#f4b62f] px-3 py-1 text-xs font-black text-[#08253a]">پیشنهاد ویژه</div>
              <div className="grid gap-6 sm:grid-cols-[150px_1fr] sm:items-center">
                <div className="mx-auto flex aspect-[3/4] w-[132px] flex-col justify-between rounded-lg border border-[#08253a]/10 bg-[#efe3ce] p-4 text-center text-[#5d3f2a] shadow-xl sm:w-[145px]">
                  <span className="text-[10px] font-bold">Tiny Changes, Remarkable Results</span>
                  <strong className="text-2xl leading-tight">Atomic<br/>Habits</strong>
                  <span className="text-xs font-bold">James Clear</span>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#08253a] dark:text-[#fff7e8]">عادت‌های اتمی</p>
                  <p className="mt-1 text-sm z-muted">James Clear</p>
                  <p className="mt-4 text-sm leading-7 z-muted">تغییرهای کوچک، نتایج بزرگ؛ نمونه کامل زبدینو با خلاصه، شواهد، اقدامات عملی و دو صدای تأییدشده.</p>
                  <Link href="/books/atomic-habits" className="z-focus mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#08253a] px-5 py-3 text-sm font-black text-[#fff7e8] transition hover:-translate-y-0.5 dark:bg-[#fff7e8] dark:text-[#08253a]"><Play size={17} fill="currentColor" />همین حالا گوش بده</Link>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs font-bold text-[#08253a] dark:text-[#fff7e8]">
                <span className="rounded-xl border border-[#08253a]/8 bg-white/55 px-2 py-2.5 dark:border-white/8 dark:bg-white/[0.04]">خلاصه</span>
                <span className="rounded-xl border border-[#08253a]/8 bg-white/55 px-2 py-2.5 dark:border-white/8 dark:bg-white/[0.04]">نکات کلیدی</span>
                <span className="rounded-xl border border-[#08253a]/8 bg-white/55 px-2 py-2.5 dark:border-white/8 dark:bg-white/[0.04]">اقدام عملی</span>
              </div>
            </div>
          </div>
          <Sparkles className="absolute -left-4 -top-4 text-[#e5a92d]" size={28} />
        </div>
      </div>
    </section>
  );
}
