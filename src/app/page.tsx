import Link from "next/link";
import { ArrowLeft, BookOpen, Headphones, Quote, ShieldCheck, Sparkles } from "lucide-react";

import BookCard from "@/components/BookCard";
import Hero from "@/components/Hero";
import ContinueListening from "@/components/player/ContinueListening";
import { books } from "@/lib/books";

const benefits = [
  {
    icon: Sparkles,
    title: "خلاصه‌ای که واقعاً قابل استفاده است",
    body: "نکات اصلی کتاب یا فایل به فارسی و با ساختار روشن، نه یک متن طولانی و مبهم.",
  },
  {
    icon: Quote,
    title: "هر نکته با ردّ منبع",
    body: "شواهد و provenance کنار نتیجه می‌مانند تا بدانی هر نکته از کجای متن آمده است.",
  },
  {
    icon: Headphones,
    title: "از خواندن به شنیدن",
    body: "خلاصه و تجربه صوتی فارسی را در همان مسیر محصول گوش کن و بعداً ادامه بده.",
  },
];

export default function Home() {
  return (
    <div>
      <Hero />

      <section className="z-container py-14 md:py-20">
        <div className="mb-8 max-w-2xl">
          <p className="z-eyebrow">یک مسیر، نه چند ابزار جدا</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
            از فایل خام تا نتیجه‌ای که می‌شود فهمید، بررسی کرد و شنید
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, body }) => (
            <article key={title} className="rounded-3xl border border-black/7 bg-white/70 p-6 backdrop-blur dark:border-white/8 dark:bg-white/[0.035]">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
                <Icon size={21} />
              </div>
              <h3 className="text-lg font-black">{title}</h3>
              <p className="mt-2 text-sm leading-7 z-muted">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <ContinueListening />

      <section className="z-container py-10 md:py-16">
        <div className="overflow-hidden rounded-[2rem] bg-[#17131f] p-6 text-white md:p-10">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-xs font-bold text-violet-200">
                <Headphones size={14} />
                نمونه واقعی زبدینو
              </div>
              <h2 className="text-2xl font-black md:text-3xl">عادت‌های اتمی را با دو صدای تأییدشده گوش کن</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
                Sulafat و Schedar هر دو روی نسخه canonical زبدینو فعال‌اند؛ همان تجربه‌ای که در QA دسکتاپ و موبایل تأیید شده است.
              </p>
            </div>
            <Link
              href="/books/atomic-habits"
              className="z-focus inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-[#17131f] transition hover:-translate-y-0.5"
            >
              شنیدن نمونه
              <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="z-container py-14 md:py-20">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="z-eyebrow">کتابخانه زبدینو</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">برای شروع، یکی را انتخاب کن</h2>
          </div>
          <Link href="/books" className="z-focus inline-flex items-center gap-2 text-sm font-black text-violet-700 dark:text-violet-300">
            همه کتاب‌ها
            <ArrowLeft size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.slice(0, 3).map((book) => (
            <BookCard key={book.slug} book={book} />
          ))}
        </div>
      </section>

      <section className="z-container pb-20 md:pb-28">
        <div className="grid gap-6 rounded-[2rem] border border-black/7 bg-white/70 p-6 dark:border-white/8 dark:bg-white/[0.035] md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={21} />
            </div>
            <div>
              <h2 className="text-lg font-black">فایل شخصی تو، مسیر شخصی تو</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 z-muted">
                زبدینو برای فایل‌های خصوصی، پردازش مرحله‌ای و قابلیت بازگشت به کتابخانه طراحی شده؛ بدون اینکه تجربه کاربر با جزئیات فنی شلوغ شود.
              </p>
            </div>
          </div>
          <Link href="/upload" className="z-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-black/10 px-5 py-3 text-sm font-black dark:border-white/10">
            <BookOpen size={17} />
            تبدیل فایل من
          </Link>
        </div>
      </section>
    </div>
  );
}
