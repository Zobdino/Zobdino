"use client";

import { CheckCircle2, FileText, LoaderCircle, LockKeyhole, UploadCloud } from "lucide-react";
import { useState } from "react";

import { canonicalSections, sectionText, sha256, supportedTextFile, type IngestionMode, type IngestionVoice } from "@/lib/browser-ingestion";

type Status = "idle" | "reading" | "ready" | "error";

export default function UserFileIngestion() {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState<{ sections: number; characters: number; digest: string } | null>(null);
  const [mode, setMode] = useState<IngestionMode>("both");
  const [voice, setVoice] = useState<IngestionVoice>("sulafat");
  const [rights, setRights] = useState(false);

  async function prepare(file: File | undefined) {
    if (!file) return;
    if (!supportedTextFile(file)) {
      setStatus("error"); setMessage("فعلاً فقط فایل‌های TXT و Markdown پشتیبانی می‌شوند."); return;
    }
    if (file.size > 1_000_000) {
      setStatus("error"); setMessage("حجم متن برای نسخه آزمایشی باید کمتر از یک مگابایت باشد."); return;
    }
    setStatus("reading"); setMessage(""); setFileName(file.name);
    try {
      const text = await file.text();
      const sections = sectionText(text);
      if (!sections.length || sections.length > 128) throw new Error("invalid-content");
      const digest = await sha256(canonicalSections(sections));
      setReceipt({ sections: sections.length, characters: sections.reduce((sum, item) => sum + item.text.length, 0), digest });
      setStatus("ready");
    } catch {
      setStatus("error"); setMessage("متن فایل قابل پردازش نیست. محتوای فایل را بررسی کنید.");
    }
  }

  const canContinue = status === "ready" && rights;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
      <section className="rounded-[2rem] border border-violet-200 bg-white p-5 shadow-sm dark:border-violet-900/70 dark:bg-zinc-950 md:p-8">
        <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-violet-300 bg-violet-50/60 p-6 text-center transition hover:border-violet-500 dark:border-violet-800 dark:bg-violet-950/20">
          <UploadCloud className="mb-4 text-violet-600" size={42} aria-hidden="true" />
          <span className="text-lg font-extrabold">فایل TXT یا Markdown را انتخاب کنید</span>
          <span className="mt-2 text-sm text-zinc-500">متن ابتدا در مرورگر شما خوانده و بخش‌بندی می‌شود.</span>
          <input className="sr-only" type="file" accept=".txt,.md,text/plain,text/markdown" onChange={(event) => void prepare(event.target.files?.[0])} />
        </label>

        {status !== "idle" && (
          <div className="mt-5 rounded-2xl border border-black/10 p-4 dark:border-white/10" aria-live="polite">
            <div className="flex items-center gap-3">
              {status === "reading" ? <LoaderCircle className="animate-spin text-violet-600" /> : status === "ready" ? <CheckCircle2 className="text-emerald-600" /> : <FileText className="text-rose-600" />}
              <div><p className="font-bold">{fileName || "فایل انتخاب‌شده"}</p><p className="text-sm text-zinc-500">{status === "reading" ? "در حال آماده‌سازی امن…" : status === "ready" ? "فایل آماده ادامه فرایند است." : message}</p></div>
            </div>
            {receipt && <dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-zinc-500">بخش‌ها</dt><dd className="font-bold">{receipt.sections.toLocaleString("fa-IR")}</dd></div><div><dt className="text-zinc-500">نویسه‌ها</dt><dd className="font-bold">{receipt.characters.toLocaleString("fa-IR")}</dd></div><div className="col-span-2"><dt className="text-zinc-500">اثر انگشت محتوا</dt><dd className="mt-1 break-all font-mono text-xs" dir="ltr">{receipt.digest}</dd></div></dl>}
          </div>
        )}
      </section>

      <aside className="rounded-[2rem] bg-zinc-950 p-5 text-white md:p-7">
        <div className="mb-6 flex items-center gap-3"><LockKeyhole className="text-violet-400" /><div><h2 className="font-extrabold">تنظیم خروجی</h2><p className="text-xs text-zinc-400">خصوصی و فقط برای شما</p></div></div>
        <label className="block text-sm font-bold">نوع خروجی<select value={mode} onChange={(event) => setMode(event.target.value as IngestionMode)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 p-3"><option value="both">خلاصه صوتی + صوت کامل</option><option value="summary-podcast">فقط خلاصه صوتی</option><option value="full-audio">فقط صوت کامل</option></select></label>
        <label className="mt-5 block text-sm font-bold">صدای روایت<select value={voice} onChange={(event) => setVoice(event.target.value as IngestionVoice)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 p-3"><option value="sulafat">سولافات — صدای زن</option><option value="schedar">شِدار — صدای مرد</option></select></label>
        <label className="mt-6 flex items-start gap-3 text-sm leading-6"><input type="checkbox" checked={rights} onChange={(event) => setRights(event.target.checked)} className="mt-1 size-4 accent-violet-500" /><span>تأیید می‌کنم مجاز به پردازش این فایل هستم و محتوا خصوصی باقی بماند.</span></label>
        <button type="button" disabled={!canContinue} className="mt-6 w-full rounded-xl bg-violet-600 px-4 py-3 font-extrabold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40" onClick={() => setMessage("فایل آماده است. اتصال امن Runtime پس از فعال‌شدن Preview انجام می‌شود.")}>شروع پردازش</button>
        {message && status === "ready" && <p className="mt-3 text-sm text-violet-200" aria-live="polite">{message}</p>}
      </aside>
    </div>
  );
}
