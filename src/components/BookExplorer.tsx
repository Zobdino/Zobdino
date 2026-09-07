"use client";

import { Headphones, Search } from "lucide-react";
import { useMemo, useState } from "react";

import BookCard from "@/components/BookCard";
import { useLocale } from "@/components/LocaleProvider";
import { books } from "@/lib/books";
import { episodes } from "@/lib/episodes";

const ALL = "__all__";

export default function BookExplorer() {
  const { locale } = useLocale();
  const fa = locale === "fa";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const [onlyReady, setOnlyReady] = useState(false);

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
    const normalized = query.trim().toLocaleLowerCase(locale === "fa" ? "fa-IR" : "en-US");

    return books.filter((book) => {
      const matchesQuery =
        !normalized ||
        [book.titleFa, book.titleEn, book.authorFa, book.authorEn, book.category, book.categoryEn]
          .join(" ")
          .toLocaleLowerCase(locale === "fa" ? "fa-IR" : "en-US")
          .includes(normalized);

      const matchesCategory = category === ALL || book.category === category;
      const matchesReady = !onlyReady || episodes.some((item) => item.bookSlug === book.slug && item.audio.status === "ready");

      return matchesQuery && matchesCategory && matchesReady;
    });
  }, [category, locale, onlyReady, query]);

  const readyCount = books.filter((book) =>
    episodes.some((episode) => episode.bookSlug === book.slug && episode.audio.status === "ready"),
  ).length;

  const numberLocale = fa ? "fa-IR" : "en-US";

  return (
    <section aria-label={fa ? "جست‌وجو و مرور کتاب‌ها" : "Search and browse books"}>
      <div className="z-surface mb-7 p-4 md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">{fa ? "جست‌وجوی کتاب" : "Search books"}</span>
            <Search
              size={19}
              className={`pointer-events-none absolute top-1/2 -translate-y-1/2 z-muted ${fa ? "right-4" : "left-4"}`}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={fa ? "عنوان، نویسنده یا موضوع را جست‌وجو کن..." : "Search by title, author, or topic..."}
              className={`z-focus w-full rounded-2xl border border-black/10 bg-white/75 py-3.5 text-sm font-semibold outline-none transition placeholder:font-normal placeholder:text-zinc-400 dark:border-white/10 dark:bg-white/[0.035] dark:placeholder:text-zinc-600 ${fa ? "pr-12 pl-4" : "pl-12 pr-4"}`}
            />
          </label>

          <button
            type="button"
            onClick={() => setOnlyReady((value) => !value)}
            aria-pressed={onlyReady}
            className={`z-focus inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3.5 text-sm font-black transition ${
              onlyReady
                ? "border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-500/15"
                : "border-black/10 bg-white/65 hover:border-violet-400 dark:border-white/10 dark:bg-white/[0.035]"
            }`}
          >
            <Headphones size={17} />
            {fa ? "فقط آماده شنیدن" : "Audio ready only"}
          </button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label={fa ? "فیلتر موضوع" : "Topic filter"}>
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className={`z-focus whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition ${
                category === item
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-black/10 bg-white/50 z-muted hover:border-violet-300 hover:text-[var(--page-fg)] dark:border-white/10 dark:bg-white/[0.025]"
              }`}
            >
              {categoryLabel(item)}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-1 text-sm z-muted sm:flex-row sm:items-center sm:justify-between">
        <p>{filtered.length.toLocaleString(numberLocale)} {fa ? "عنوان مطابق انتخاب تو" : "matching titles"}</p>
        <p>{readyCount.toLocaleString(numberLocale)} {fa ? "کتاب با نسخه صوتی آماده" : "books with audio ready"}</p>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((book) => (
            <BookCard key={book.slug} book={book} />
          ))}
        </div>
      ) : (
        <div className="z-surface border-dashed py-16 text-center md:py-20">
          <p className="text-xl font-black">{fa ? "نتیجه‌ای پیدا نشد" : "No results found"}</p>
          <p className="mt-2 text-sm z-muted">{fa ? "عبارت جست‌وجو یا فیلتر موضوع را تغییر بده." : "Try a different search term or topic filter."}</p>
        </div>
      )}
    </section>
  );
}
