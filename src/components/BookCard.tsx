"use client";

import Image from "next/image";
import Link from "next/link";
import { Headphones } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import { episodes } from "@/lib/episodes";
import type { Book } from "@/lib/books";

export default function BookCard({ book }: { book: Book }) {
  const { locale } = useLocale();
  const fa = locale === "fa";
  const ready = episodes.some((episode) => episode.bookSlug === book.slug && episode.audio.status === "ready");

  return (
    <Link
      href={`/books/${book.slug}`}
      className="z-focus group block rounded-[1.4rem] border border-black/8 bg-white/72 p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg dark:border-white/8 dark:bg-white/[0.03]"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-[1rem] bg-[#f3eee5]">
        <Image
          src={book.coverUrl}
          alt={fa ? `جلد ${book.titleFa}` : `${book.titleEn} cover`}
          fill
          unoptimized
          sizes="(max-width: 768px) 50vw, 20vw"
          className="object-cover transition duration-500 group-hover:scale-[1.02]"
        />
        <span className={`absolute top-2 ${fa ? "right-2" : "left-2"} inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black shadow-sm ${ready ? "bg-emerald-100 text-emerald-800" : "bg-sky-100 text-sky-800"}`}>
          {ready ? <Headphones size={12} /> : null}
          {ready ? (fa ? "موجود" : "Available") : (fa ? "به‌زودی" : "Coming soon")}
        </span>
      </div>

      <div className="px-1 pb-1 pt-4 text-center">
        <h3 className="text-base font-black text-[#08253a] transition group-hover:text-violet-700 dark:text-[#fff7e8]">{fa ? book.titleFa : book.titleEn}</h3>
        <p className="mt-1 text-xs font-semibold z-muted">{fa ? book.authorFa : book.authorEn}</p>
        <p className="mt-2 text-xs font-bold text-violet-700 dark:text-violet-300">{fa ? book.category : book.categoryEn}</p>
      </div>
    </Link>
  );
}
