"use client";

import { BookOpen, FolderLock, LoaderCircle, LockKeyhole, Trash2 } from "lucide-react";
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
    <section className="z-surface mt-8 min-w-0 overflow-hidden p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
            <FolderLock size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-black text-violet-700 dark:text-violet-300">فضای شخصی</p>
            <h2 className="mt-1 text-xl font-black">کتابخانه خصوصی من</h2>
            <p className="mt-2 max-w-xl text-sm leading-7 z-muted">فایل‌هایی که در همین مرورگر پردازش کرده‌ای دوباره قابل بازکردن هستند؛ بدون اینکه وارد مجموعه عمومی شوند.</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-black/8 bg-white/60 px-3 py-1.5 text-xs font-black dark:border-white/8 dark:bg-white/[0.035]">
          {items.length.toLocaleString("fa-IR")} فایل
        </span>
      </div>

      {items.length ? (
        <div className="mt-6 grid min-w-0 gap-4 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.jobId} className="min-w-0 rounded-2xl border border-black/8 bg-white/55 p-4 dark:border-white/8 dark:bg-white/[0.025]">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-black" dir="ltr">{item.fileName}</p>
                  <p className="mt-1 text-xs z-muted">آخرین بازکردن: {new Date(item.lastOpenedAt).toLocaleString("fa-IR")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(item.jobId)}
                  className="z-focus shrink-0 rounded-xl p-2 z-muted transition hover:bg-rose-500/10 hover:text-rose-500"
                  aria-label="حذف از کتابخانه"
                >
                  <Trash2 size={17} />
                </button>
              </div>
              <button
                type="button"
                disabled={Boolean(loadingJobId)}
                onClick={() => void open(item)}
                className="z-focus mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--page-fg)] px-4 py-2.5 text-sm font-black text-[var(--page-bg)] transition disabled:opacity-50"
              >
                {loadingJobId === item.jobId ? <LoaderCircle className="animate-spin" size={16} /> : <BookOpen size={16} />}
                بازکردن و ادامه
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-black/[0.015] p-7 text-center dark:border-white/10 dark:bg-white/[0.015] sm:p-9">
          <LockKeyhole className="mx-auto text-violet-700 dark:text-violet-300" size={24} />
          <p className="mt-3 font-black">کتابخانه‌ات هنوز خالی است</p>
          <p className="mt-2 text-sm leading-7 z-muted">بعد از اولین پردازش، فایل و خروجی‌های قابل ادامه را اینجا می‌بینی.</p>
        </div>
      )}

      {error ? <p className="mt-4 break-words text-sm text-rose-500" role="alert">{error}</p> : null}

      {active && status ? (
        <div className="mt-7 min-w-0 border-t border-black/8 pt-7 dark:border-white/8">
          <div className="min-w-0">
            <p className="text-xs font-black text-violet-700 dark:text-violet-300">در حال مشاهده</p>
            <h3 className="mt-1 truncate text-lg font-black" dir="ltr">{active.fileName}</h3>
          </div>

          <div className="mt-5 rounded-2xl border border-black/8 bg-white/50 p-4 dark:border-white/8 dark:bg-white/[0.025]">
            <UserFileJourneyStatus stage={status.stage} progress={stageProgress(status.stage)} onRetry={() => void open(active)} retryDisabled={Boolean(loadingJobId)} />
          </div>

          {verifiedAssets.length ? (
            <div className="mt-5 grid min-w-0 gap-4 lg:grid-cols-2">
              {verifiedAssets.map((asset) => (
                <article key={asset.id} className="min-w-0 rounded-2xl border border-violet-500/15 bg-violet-500/[0.035] p-4">
                  <p className="truncate font-black">{asset.kind === "summary" ? "خلاصه فارسی" : asset.kind === "summary-audio" ? "خلاصه صوتی" : asset.kind === "full-audio" ? "روایت کامل" : asset.kind}</p>
                  {asset.kind === "summary" && asset.text ? <p className="mt-3 max-h-72 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-8 z-muted">{asset.text}</p> : null}
                  {asset.kind === "summary" ? <SourceEvidenceList evidence={asset.evidence} /> : null}
                  {(asset.kind === "summary-audio" || asset.kind === "full-audio") ? <RuntimeAssetPlayer asset={asset} resumeToken={active.resumeToken} /> : null}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm z-muted">خروجی تأییدشده‌ای برای این پردازش ثبت نشده است.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
