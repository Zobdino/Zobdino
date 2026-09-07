"use client";

import BookExplorer from "@/components/BookExplorer";
import { useLocale } from "@/components/LocaleProvider";

export default function BooksPage() {
  const { locale } = useLocale();
  const fa = locale === "fa";

  return (
    <main className="z-container py-10 md:py-14">
      <section className="mx-auto mb-10 max-w-4xl text-center md:mb-12">
        <span className="z-eyebrow">{fa ? "کتاب‌ها" : "Books"}</span>
        <h1 className="mt-4 text-4xl font-black leading-tight tracking-[-0.045em] text-[#08253a] dark:text-[#fff7e8] md:text-6xl">
          {fa ? "کتاب بعدی‌ات را برای فهمیدن انتخاب کن." : "Choose your next book to understand."}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 z-muted md:text-lg">
          {fa
            ? "خلاصه‌های عمیق، شواهد معتبر و اقدام‌های عملی برای رشد واقعی. بین کتاب‌ها جست‌وجو کن و هرجا نسخه صوتی آماده بود همان‌جا شروع به شنیدن کن."
            : "Deep summaries, reliable evidence, and practical actions for real growth. Search the catalog and start listening whenever an approved audio edition is ready."}
        </p>
      </section>
      <BookExplorer />
    </main>
  );
}
