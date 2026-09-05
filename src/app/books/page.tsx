import { Headphones, Search, Sparkles } from "lucide-react";

import BookExplorer from "@/components/BookExplorer";

export default function BooksPage() {
  return (
    <main className="z-container py-10 md:py-16">
      <section className="mb-10 grid gap-7 lg:grid-cols-[1fr_360px] lg:items-end">
        <div className="max-w-3xl">
          <span className="z-eyebrow">کتاب‌ها</span>
          <h1 className="mt-4 text-4xl font-black leading-tight tracking-[-0.045em] text-[#08253a] dark:text-[#fff7e8] md:text-6xl">کتاب بعدی‌ات را برای فهمیدن انتخاب کن.</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 z-muted md:text-lg">بین کتاب‌ها جست‌وجو کن، موضوع مورد علاقه‌ات را پیدا کن و هر عنوانی که نسخه صوتی آماده دارد همان‌جا شروع به شنیدن کن.</p>
        </div>
        <div className="z-surface grid gap-3 p-4 sm:grid-cols-3 lg:grid-cols-1">
          {[[Search,"جست‌وجوی سریع","عنوان، نویسنده یا موضوع"],[Headphones,"آماده شنیدن","فیلتر مستقیم نسخه‌های صوتی"],[Sparkles,"خلاصه فارسی","ایده‌های اصلی در یک نگاه"]].map(([Icon,title,description]) => {
            const ItemIcon = Icon as typeof Search;
            return <div key={String(title)} className="flex items-center gap-3 rounded-2xl border border-[#08253a]/8 bg-white/65 p-3 dark:border-white/8 dark:bg-white/[0.025]">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f4c66a]/22 text-[#b97c08] dark:text-[#f4c66a]"><ItemIcon size={18}/></span>
              <div><p className="text-sm font-black">{String(title)}</p><p className="mt-0.5 text-xs z-muted">{String(description)}</p></div>
            </div>;
          })}
        </div>
      </section>
      <BookExplorer />
    </main>
  );
}
