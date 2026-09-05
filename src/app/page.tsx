import Link from "next/link";
import { ArrowLeft, BookOpen, Headphones, Heart, Quote, ShieldCheck, Sparkles } from "lucide-react";

import BookCard from "@/components/BookCard";
import Hero from "@/components/Hero";
import ContinueListening from "@/components/player/ContinueListening";
import { books } from "@/lib/books";

const benefits = [
  { icon: Sparkles, title: "سریع و مفید", body: "در زمان کمتر، نکته‌های مهم‌تر را بفهم و برای استفاده واقعی نگه دار." },
  { icon: BookOpen, title: "کاربردی", body: "خلاصه‌ها فقط کوتاه نیستند؛ برای تصمیم و عمل ساختار دارند." },
  { icon: ShieldCheck, title: "معتبر", body: "نکته‌های مهم با منبع و شواهد قابل بررسی همراه می‌شوند." },
  { icon: Headphones, title: "همیشه همراه", body: "همان محتوا را با صدای فارسی در هر زمان و هر مکان ادامه بده." },
];

export default function Home() {
  return (
    <div>
      <Hero />

      <section className="z-container py-14 md:py-18">
        <div className="mb-8 text-center">
          <p className="z-eyebrow">چرا زبدینو؟</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.045em] text-[#08253a] dark:text-[#fff7e8] md:text-4xl">دانش کمترِ شلوغ، فهم بیشتر</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {benefits.map(({ icon: Icon, title, body }) => (
            <article key={title} className="rounded-3xl border border-[#08253a]/8 bg-white/58 p-6 text-center backdrop-blur dark:border-white/8 dark:bg-white/[0.035]">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4c66a]/24 text-[#b97c08] dark:text-[#f4c66a]"><Icon size={21} /></div>
              <h3 className="text-lg font-black text-[#08253a] dark:text-[#fff7e8]">{title}</h3>
              <p className="mt-2 text-sm leading-7 z-muted">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <ContinueListening />

      <section className="z-container py-10 md:py-16">
        <div className="overflow-hidden rounded-[2.25rem] bg-[#08253a] p-6 text-[#fff7e8] shadow-[0_26px_70px_rgba(8,37,58,0.16)] md:p-10">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#f4c66a]/16 px-3 py-1.5 text-xs font-bold text-[#f4c66a]"><Headphones size={14} />نمونه کامل زبدینو</div>
              <h2 className="text-2xl font-black md:text-3xl">عادت‌های اتمی؛ از خلاصه تا شنیدن و عمل</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#fff7e8]/68 md:text-base">خلاصه ساختاریافته، Evidence، اقدامات عملی و هر دو صدای تأییدشده Sulafat و Schedar در یک تجربه کامل.</p>
            </div>
            <Link href="/books/atomic-habits" className="z-focus inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#f4b62f] px-5 py-3 font-black text-[#08253a] transition hover:-translate-y-0.5">باز کردن نمونه کامل<ArrowLeft size={18} /></Link>
          </div>
        </div>
      </section>

      <section className="z-container py-14 md:py-20">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="z-eyebrow">کتابخانه زبدینو</p><h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#08253a] dark:text-[#fff7e8] md:text-4xl">کتاب‌های مهم، آماده برای فهم عمیق‌تر</h2></div>
          <Link href="/books" className="z-focus inline-flex items-center gap-2 text-sm font-black text-[#b97c08] dark:text-[#f4c66a]">همه کتاب‌ها<ArrowLeft size={16} /></Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{books.slice(0, 3).map((book) => <BookCard key={book.slug} book={book} />)}</div>
      </section>

      <section className="z-container pb-20 md:pb-28">
        <div className="grid gap-6 rounded-[2rem] border border-[#08253a]/8 bg-[#fff7e8]/72 p-6 dark:border-white/8 dark:bg-white/[0.035] md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f4c66a]/24 text-[#b97c08] dark:text-[#f4c66a]"><Heart size={21} /></div>
            <div><h2 className="text-lg font-black text-[#08253a] dark:text-[#fff7e8]">فایل شخصی تو، مسیر شخصی تو</h2><p className="mt-2 max-w-2xl text-sm leading-7 z-muted">فایل را بده؛ زبدینو آن را به خلاصه، شواهد و تجربه صوتی تبدیل می‌کند، بدون اینکه جزئیات فنی تجربه را شلوغ کند.</p></div>
          </div>
          <Link href="/upload" className="z-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#08253a]/12 bg-white/50 px-5 py-3 text-sm font-black text-[#08253a] dark:border-white/10 dark:bg-white/[0.03] dark:text-[#fff7e8]"><Quote size={17} />تبدیل فایل من</Link>
        </div>
      </section>
    </div>
  );
}
