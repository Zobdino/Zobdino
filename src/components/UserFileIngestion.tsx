"use client";

import { CheckCircle2, FileText, LoaderCircle, LockKeyhole, UploadCloud } from "lucide-react";
import { useState } from "react";

import {
  canonicalSections,
  sectionText,
  sha256,
  supportedTextFile,
  type BrowserSection,
  type IngestionMode,
  type IngestionVoice,
} from "@/lib/browser-ingestion";
import { BrowserRuntimeError, runBrowserIngestion } from "@/lib/browser-runtime";

type Status = "idle" | "reading" | "ready" | "submitting" | "submitted" | "error";

interface PreparedFile {
  file: File;
  sections: BrowserSection[];
  digest: string;
  characters: number;
}

interface RuntimeReceipt {
  jobId: string;
  stage: string;
  sectionCount: number;
  characterCount: number;
  contentSha256: string;
}

function runtimeErrorMessage(error: unknown) {
  if (!(error instanceof BrowserRuntimeError)) {
    return "ارتباط امن با سرویس پردازش برقرار نشد. دوباره تلاش کنید.";
  }

  switch (error.code) {
    case "runtime-not-configured":
      return "Runtime نسخه Preview هنوز برای این محیط تنظیم نشده است.";
    case "session-issuance-limit":
      return "تعداد درخواست‌های شروع پردازش بیش از حد مجاز است. چند دقیقه دیگر دوباره تلاش کنید.";
    case "expired-or-invalid-session":
    case "invalid-session":
      return "نشست امن منقضی شده است. پردازش را دوباره شروع کنید.";
    case "content-sha256-mismatch":
      return "اثر انگشت محتوای ارسالی تطابق ندارد؛ فایل دوباره بررسی شود.";
    case "origin-not-allowed":
      return "این دامنه اجازه دسترسی به Runtime زبدینو را ندارد.";
    default:
      return "Runtime درخواست را نپذیرفت. دوباره تلاش کنید.";
  }
}

export default function UserFileIngestion() {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");
  const [prepared, setPrepared] = useState<PreparedFile | null>(null);
  const [runtimeReceipt, setRuntimeReceipt] = useState<RuntimeReceipt | null>(null);
  const [mode, setMode] = useState<IngestionMode>("both");
  const [voice, setVoice] = useState<IngestionVoice>("sulafat");
  const [rights, setRights] = useState(false);

  async function prepare(file: File | undefined) {
    if (!file) return;

    setRights(false);
    setPrepared(null);
    setRuntimeReceipt(null);
    setMessage("");
    setFileName(file.name);

    if (!supportedTextFile(file)) {
      setStatus("error");
      setMessage("فعلاً فقط فایل‌های TXT و Markdown پشتیبانی می‌شوند.");
      return;
    }
    if (file.size > 1_000_000) {
      setStatus("error");
      setMessage("حجم متن برای نسخه آزمایشی باید کمتر از یک مگابایت باشد.");
      return;
    }

    setStatus("reading");
    try {
      const text = await file.text();
      const sections = sectionText(text);
      if (!sections.length || sections.length > 128) throw new Error("invalid-content");
      const digest = await sha256(canonicalSections(sections));
      setPrepared({
        file,
        sections,
        digest,
        characters: sections.reduce((sum, item) => sum + item.text.length, 0),
      });
      setStatus("ready");
    } catch {
      setStatus("error");
      setMessage("متن فایل قابل پردازش نیست. محتوای فایل را بررسی کنید.");
    }
  }

  async function submit() {
    if (!prepared || !rights) return;
    setStatus("submitting");
    setMessage("در حال ایجاد نشست امن و ثبت فایل در Runtime…");
    setRuntimeReceipt(null);

    try {
      const receipt = await runBrowserIngestion({
        file: prepared.file,
        sections: prepared.sections,
        contentSha256: prepared.digest,
        mode,
        voice,
        rightsConfirmed: rights,
      });
      setRuntimeReceipt(receipt);
      setStatus("submitted");
      setMessage("محتوا با موفقیت در Runtime خصوصی زبدینو ثبت شد.");
    } catch (error) {
      setStatus("ready");
      setMessage(runtimeErrorMessage(error));
    }
  }

  const canContinue = status === "ready" && rights && Boolean(prepared);
  const busy = status === "reading" || status === "submitting";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
      <section className="rounded-[2rem] border border-violet-200 bg-white p-5 shadow-sm dark:border-violet-900/70 dark:bg-zinc-950 md:p-8">
        <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-violet-300 bg-violet-50/60 p-6 text-center transition hover:border-violet-500 dark:border-violet-800 dark:bg-violet-950/20">
          <UploadCloud className="mb-4 text-violet-600" size={42} aria-hidden="true" />
          <span className="text-lg font-extrabold">فایل TXT یا Markdown را انتخاب کنید</span>
          <span className="mt-2 text-sm text-zinc-500">متن ابتدا در مرورگر شما خوانده و بخش‌بندی می‌شود.</span>
          <input
            className="sr-only"
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            disabled={busy}
            onChange={(event) => void prepare(event.target.files?.[0])}
          />
        </label>

        {status !== "idle" && (
          <div className="mt-5 rounded-2xl border border-black/10 p-4 dark:border-white/10" aria-live="polite">
            <div className="flex items-center gap-3">
              {busy ? (
                <LoaderCircle className="animate-spin text-violet-600" />
              ) : status === "ready" || status === "submitted" ? (
                <CheckCircle2 className="text-emerald-600" />
              ) : (
                <FileText className="text-rose-600" />
              )}
              <div>
                <p className="font-bold">{fileName || "فایل انتخاب‌شده"}</p>
                <p className="text-sm text-zinc-500">
                  {status === "reading"
                    ? "در حال آماده‌سازی امن…"
                    : status === "submitting"
                      ? "در حال ثبت در Runtime…"
                      : status === "submitted"
                        ? "ثبت Runtime با موفقیت انجام شد."
                        : status === "ready"
                          ? "فایل آماده شروع پردازش است."
                          : message}
                </p>
              </div>
            </div>

            {prepared && (
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-zinc-500">بخش‌ها</dt><dd className="font-bold">{prepared.sections.length.toLocaleString("fa-IR")}</dd></div>
                <div><dt className="text-zinc-500">نویسه‌ها</dt><dd className="font-bold">{prepared.characters.toLocaleString("fa-IR")}</dd></div>
                <div className="col-span-2"><dt className="text-zinc-500">اثر انگشت محتوا</dt><dd className="mt-1 break-all font-mono text-xs" dir="ltr">{prepared.digest}</dd></div>
              </dl>
            )}

            {runtimeReceipt && (
              <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
                <p className="font-bold">رسید Runtime</p>
                <p className="mt-1">مرحله: <span dir="ltr">{runtimeReceipt.stage}</span></p>
                <p className="mt-1 break-all font-mono text-xs" dir="ltr">{runtimeReceipt.jobId}</p>
              </div>
            )}
          </div>
        )}
      </section>

      <aside className="rounded-[2rem] bg-zinc-950 p-5 text-white md:p-7">
        <div className="mb-6 flex items-center gap-3">
          <LockKeyhole className="text-violet-400" />
          <div><h2 className="font-extrabold">تنظیم خروجی</h2><p className="text-xs text-zinc-400">خصوصی و فقط برای شما</p></div>
        </div>
        <label className="block text-sm font-bold">نوع خروجی
          <select value={mode} disabled={busy} onChange={(event) => setMode(event.target.value as IngestionMode)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 p-3">
            <option value="both">خلاصه صوتی + صوت کامل</option>
            <option value="summary-podcast">فقط خلاصه صوتی</option>
            <option value="full-audio">فقط صوت کامل</option>
          </select>
        </label>
        <label className="mt-5 block text-sm font-bold">صدای روایت
          <select value={voice} disabled={busy} onChange={(event) => setVoice(event.target.value as IngestionVoice)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 p-3">
            <option value="sulafat">سولافات — صدای زن</option>
            <option value="schedar">شِدار — صدای مرد</option>
          </select>
        </label>
        <label className="mt-6 flex items-start gap-3 text-sm leading-6">
          <input type="checkbox" checked={rights} disabled={busy} onChange={(event) => setRights(event.target.checked)} className="mt-1 size-4 accent-violet-500" />
          <span>تأیید می‌کنم مجاز به پردازش این فایل هستم و محتوا خصوصی باقی بماند.</span>
        </label>
        <button
          type="button"
          disabled={!canContinue || busy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-extrabold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => void submit()}
        >
          {status === "submitting" && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
          {status === "submitting" ? "در حال شروع…" : "شروع پردازش"}
        </button>
        {message && status !== "error" && <p className="mt-3 text-sm text-violet-200" aria-live="polite">{message}</p>}
      </aside>
    </div>
  );
}
