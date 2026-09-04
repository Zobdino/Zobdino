"use client";

import { BookOpen, LoaderCircle, LockKeyhole, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import RuntimeAssetPlayer from "@/components/RuntimeAssetPlayer";
import SourceEvidenceList from "@/components/SourceEvidenceList";
import UserFileJourneyStatus from "@/components/UserFileJourneyStatus";
import {
  BrowserRuntimeError,
  forgetPrivateJob,
  readPrivateLibrary,
  reopenPrivateJob,
  type BrowserJobStatus,
  type PrivateLibraryItem,
} from "@/lib/browser-runtime";

function stageProgress(stage: string) {
  if (stage === "ready" || stage === "failed") return 100;
  if (stage === "quota-paused") return 72;
  const order = ["received", "validating", "extracting", "normalizing", "indexing", "planning", "full-audio", "summarizing", "summary-audio", "quality-check", "ready"];
  const index = order.indexOf(stage);
  return index < 0 ? 8 : Math.round(((index + 1) / order.length) * 100);
}

export default function PrivateLibrary() {
  const [items, setItems] = useState<PrivateLibraryItem[]>([]);
  const [active, setActive] = useState<PrivateLibraryItem | null>(null);
  const [status, setStatus] = useState<BrowserJobStatus | null>(null);
  const [loadingJobId, setLoadingJobId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setItems(readPrivateLibrary()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const verifiedAssets = useMemo(
    () => status?.assets.filter((asset) => asset.status === "verified") ?? [],
    [status],
  );

  async function open(item: PrivateLibraryItem) {
    setLoadingJobId(item.jobId);
    setError("");
    try {
      const next = await reopenPrivateJob(item.jobId, item.resumeToken);
      setActive(item);
      setStatus(next);
      setItems(readPrivateLibrary());
    } catch (cause) {
      const code = cause instanceof BrowserRuntimeError ? cause.code : "private-library-open-failed";
      setError(code === "invalid-resume-token" ? "دسترسی این فایل دیگر معتبر نیست؛ پردازش تازه را از بخش آپلود شروع کنید." : "بازکردن فایل خصوصی ممکن نشد. دوباره تلاش کنید.");
    } finally {
      setLoadingJobId("");
    }
  }

  function remove(jobId: string) {
    forgetPrivateJob(jobId);
    setItems(readPrivateLibrary());
    if (active?.jobId === jobId) {
      setActive(null);
      setStatus(null);
    }
  }

  return (
    <section className="mt-8 min-w-0 rounded-[2rem] border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#10131d] sm:p-5 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-300"><LockKeyhole size={20} /></div>
          <div className="min-w-0"><h2 className="font-black">کتابخانه خصوصی من</h2><p className="mt-1 text-xs leading-5 text-zinc-500">فایل‌های این مرورگر با دسترسی اختصاصی دوباره باز می‌شوند.</p></div>
        </div>
        <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold dark:bg-white/10">{items.length.toLocaleString("fa-IR")} فایل</span>
      </div>

      {items.length ? (
        <div className="mt-5 grid min-w-0 gap-3 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.jobId} className="min-w-0 rounded-2xl border border-black/10 p-4 dark:border-white/10">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0"><p className="truncate font-black" dir="ltr">{item.fileName}</p><p className="mt-1 text-xs text-zinc-500">آخرین بازکردن: {new Date(item.lastOpenedAt).toLocaleString("fa-IR")}</p></div>
                <button type="button" onClick={() => remove(item.jobId)} className="shrink-0 rounded-xl p-2 text-zinc-400 transition hover:bg-rose-500/10 hover:text-rose-500" aria-label="حذف از کتابخانه"><Trash2 size={17} /></button>
              </div>
              <button type="button" disabled={Boolean(loadingJobId)} onClick={() => void open(item)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-950">
                {loadingJobId === item.jobId ? <LoaderCircle className="animate-spin" size={16} /> : <BookOpen size={16} />}
                بازکردن فایل
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-black/10 p-6 text-center text-sm text-zinc-500 dark:border-white/10 sm:p-8">هنوز فایلی در کتابخانه خصوصی این مرورگر ثبت نشده است.</div>
      )}

      {error ? <p className="mt-4 break-words text-sm text-rose-500" role="alert">{error}</p> : null}

      {active && status ? (
        <div className="mt-6 min-w-0 border-t border-black/10 pt-6 dark:border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-3"><div className="min-w-0"><p className="text-xs text-zinc-500">فایل بازشده</p><h3 className="mt-1 truncate font-black" dir="ltr">{active.fileName}</h3></div></div>
          <div className="mt-5 rounded-2xl border border-black/10 p-4 dark:border-white/10">
            <UserFileJourneyStatus stage={status.stage} progress={stageProgress(status.stage)} onRetry={() => void open(active)} retryDisabled={Boolean(loadingJobId)} />
          </div>

          {verifiedAssets.length ? (
            <div className="mt-5 grid min-w-0 gap-4 lg:grid-cols-2">
              {verifiedAssets.map((asset) => (
                <article key={asset.id} className="min-w-0 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
                  <p className="truncate font-black">{asset.kind === "summary" ? "خلاصه فارسی" : asset.kind === "summary-audio" ? "خلاصه صوتی" : asset.kind === "full-audio" ? "روایت کامل" : asset.kind}</p>
                  {asset.kind === "summary" && asset.text ? <p className="mt-3 max-h-72 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-8 text-zinc-600 dark:text-zinc-300">{asset.text}</p> : null}
                  {asset.kind === "summary" ? <SourceEvidenceList evidence={asset.evidence} /> : null}
                  {(asset.kind === "summary-audio" || asset.kind === "full-audio") ? <RuntimeAssetPlayer asset={asset} resumeToken={active.resumeToken} /> : null}
                </article>
              ))}
            </div>
          ) : <p className="mt-5 text-sm text-zinc-500">خروجی تأییدشده‌ای برای این پردازش ثبت نشده است.</p>}
        </div>
      ) : null}
    </section>
  );
}
