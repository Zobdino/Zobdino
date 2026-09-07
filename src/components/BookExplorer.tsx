"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import BookCard from "@/components/BookCard";
import { useLocale } from "@/components/LocaleProvider";
import { books } from "@/lib/books";

const ALL = "__all__";

export default function BookExplorer() {
  const { locale } = useLocale();
  const fa = locale === "fa";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(books.map((book) => book.category)))],
    [],
  );

  const categoryLabel = (value: string) => {
    if (value === ALL) return fa ? "همه" : "All";
    const book = books.find((item) => item.category === value);
    return fa ? value : book?.categoryEn ?? value;
  };

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(fa ? "fa-IR" : "en-US");
    return books.filter((book) => {
      const matchesQuery =
        !normalized ||
        [book.titleFa, book.titleEn, book.authorFa, book.authorEn, book.category, book.categoryEn]
          .join(" ")
          .toLocaleLowerCase(fa ? "fa-IR" : "en-US")
          .includes(normalized);
      const matchesCategory = category === ALL || book.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [category, fa, query]);

  return (
    <section aria-label={fa ? "جست‌وجو و مرور کتاب‌ها" : "Search and browse books"}>
      <div className="mb-7 rounded-[1.6rem] border border-black/8 bg-white/70 p-4 shadow-sm dark:border-white/8 dark:bg-white/[0.03] md:p-5">
        <label className="relative block">
          <span className="sr-only">{fa ? "جست‌وجوی کتاب" : "Search books"}</span>
          <Search size={19} className={`pointer-events-none absolute top-1/2 -translate-y-1/2 z-muted ${fa ? "left-4" : "right-4"}`} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={fa ? "جست‌وجوی کتاب، نویسنده یا موضوع..." : "Search books, authors, or topics..."}
            className={`z-focus w-full rounded-2xl border border-black/10 bg-white/90 py-4 text-sm font-semibold outline-none transition placeholder:font-normal placeholder:text-zinc-400 dark:border-white/10 dark:bg-white/[0.045] ${fa ? "pr-4 pl-12" : "pl-4 pr-12"}`}
          />
        </label>

        <div className="mt-4 flex flex-wrap justify-center gap-2" aria-label={fa ? "فیلتر موضوع" : "Topic filter"}>
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className={`z-focus whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition ${
                category === item
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-black/10 bg-white/65 z-muted hover:border-violet-300 hover:text-[var(--page-fg)] dark:border-white/10 dark:bg-white/[0.03]"
              }`}
            >
              {categoryLabel(item)}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between gap-3 text-sm z-muted">
        <p>{filtered.length.toLocaleString(fa ? "fa-IR" : "en-US")} {fa ? "کتاب" : "books"}</p>
        <p>{fa ? "مرتب‌سازی: جدیدترین" : "Sort by: Newest"}</p>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {filtered.map((book) => <BookCard key={book.slug} book={book} />)}
        </div>
      ) : (
        <div className="rounded-[1.6rem] border border-dashed border-black/10 py-16 text-center dark:border-white/10">
          <p className="text-xl font-black">{fa ? "نتیجه‌ای پیدا نشد" : "No results found"}</p>
          <p className="mt-2 text-sm z-muted">{fa ? "عبارت جست‌وجو یا فیلتر موضوع را تغییر بده." : "Try a different search term or topic filter."}</p>
        </div>
      )}
    </section>
  );
}
