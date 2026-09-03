"use client";

import { CheckCircle2, Circle, PauseCircle, RotateCcw } from "lucide-react";

interface UserFileJourneyStatusProps {
  stage: string;
  progress: number;
  onRetry?: () => void;
  retryDisabled?: boolean;
}

const STAGE_LABELS: Record<string, string> = {
  received: "ثبت فایل",
  validating: "اعتبارسنجی",
  extracting: "استخراج متن",
  normalizing: "آماده‌سازی",
  indexing: "ساخت نمایه",
  planning: "برنامه‌ریزی خروجی",
  "full-audio": "تولید صوت کامل",
  summarizing: "ساخت خلاصه",
  "summary-audio": "تولید خلاصه صوتی",
  "quality-check": "کنترل کیفیت",
  ready: "آماده",
  "quota-paused": "مکث سهمیه",
  failed: "ناموفق",
};

const JOURNEY = ["received", "extracting", "summarizing", "quality-check", "ready"] as const;

export default function UserFileJourneyStatus({ stage, progress, onRetry, retryDisabled }: UserFileJourneyStatusProps) {
  const currentIndex = JOURNEY.indexOf(stage as (typeof JOURNEY)[number]);
  const terminal = stage === "ready";

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-black">مسیر پردازش فایل</h2>
        <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-600 dark:text-violet-300">
          {STAGE_LABELS[stage] ?? stage}
        </span>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
        <div className="h-full rounded-full bg-violet-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-3 flex justify-between text-xs text-zinc-500"><span>پیشرفت کلی</span><span>{progress.toLocaleString("fa-IR")}%</span></div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {JOURNEY.map((item, index) => {
          const done = terminal || (currentIndex >= 0 && currentIndex >= index);
          return (
            <div key={item} className="min-w-0 rounded-2xl border border-black/10 p-3 text-center dark:border-white/10">
              {done ? <CheckCircle2 className="mx-auto text-emerald-500" size={20} /> : <Circle className="mx-auto text-zinc-400" size={20} />}
              <p className="mt-2 truncate text-xs font-bold">{STAGE_LABELS[item]}</p>
            </div>
          );
        })}
      </div>

      {stage === "quota-paused" ? (
        <div className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm">
          <div className="flex gap-3"><PauseCircle className="shrink-0 text-amber-500" /><div><p className="font-black">پردازش روی checkpoint امن متوقف شده است</p><p className="mt-1 text-zinc-500">خروجی تأییدشده از بین نرفته و می‌توانید بعداً از کتابخانه خصوصی ادامه دهید.</p></div></div>
          {onRetry ? <button type="button" disabled={retryDisabled} onClick={onRetry} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-400/30 px-3 py-2 text-xs font-black text-amber-700 disabled:opacity-40 dark:text-amber-200"><RotateCcw size={14} /> بررسی دوباره وضعیت</button> : null}
        </div>
      ) : null}

      {stage === "failed" ? (
        <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm">
          <p className="font-black text-rose-600 dark:text-rose-300">پردازش کامل نشد</p>
          <p className="mt-1 text-zinc-500">فایل را دوباره بررسی کنید یا از کتابخانه خصوصی برای بازیابی پردازش موجود استفاده کنید.</p>
        </div>
      ) : null}
    </div>
  );
}
