"use client";

import {
  CheckCircle2,
  Circle,
  FileAudio,
  FileText,
  LoaderCircle,
  LockKeyhole,
  PauseCircle,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  canonicalSections,
  sectionText,
  sha256,
  supportedTextFile,
  type BrowserSection,
  type IngestionMode,
  type IngestionVoice,
} from "@/lib/browser-ingestion";
import {
  BrowserRuntimeError,
  getBrowserJobStatus,
  runBrowserIngestion,
  type BrowserJobStatus,
} from "@/lib/browser-runtime";

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
  sessionToken: string;
}

const STAGES = [
  "received",
  "validating",
  "extracting",
  "normalizing",
  "indexing",
  "planning",
  "full-audio",
  "summarizing",
  "summary-audio",
  "quality-check",
  "ready",
] as const;

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

function runtimeErrorMessage(error: unknown) {
  if (!(error instanceof BrowserRuntimeError)) return "ارتباط امن با سرویس پردازش برقرار نشد. دوباره تلاش کنید.";
  switch (error.code) {
    case "runtime-not-configured": return "Runtime نسخه Preview هنوز برای این محیط تنظیم نشده است.";
    case "session-issuance-limit": return "تعداد درخواست‌های شروع پردازش بیش از حد مجاز است. چند دقیقه دیگر دوباره تلاش کنید.";
    case "expired-or-invalid-session":
    case "invalid-session": return "نشست امن منقضی شده است. پردازش را دوباره شروع کنید.";
    case "content-sha256-mismatch": return "اثر انگشت محتوای ارسالی تطابق ندارد؛ فایل دوباره بررسی شود.";
    case "origin-not-allowed": return "این دامنه اجازه دسترسی به Runtime زبدینو را ندارد.";
    default: return "Runtime درخواست را نپذیرفت. دوباره تلاش کنید.";
  }
}

function stageProgress(stage: string) {
  if (stage === "quota-paused") return 72;
  if (stage === "failed") return 100;
  const index = STAGES.indexOf(stage as (typeof STAGES)[number]);
  return index < 0 ? 8 : Math.round(((index + 1) / STAGES.length) * 100);
}

function assetTitle(kind: string) {
  if (kind === "full-audio") return "فایل صوتی کامل";
  if (kind === "summary-audio") return "خلاصه صوتی";
  if (kind === "summary") return "خلاصه متنی";
  return kind;
}

export default function UserFileIngestion() {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");
  const [prepared, setPrepared] = useState<PreparedFile | null>(null);
  const [runtimeReceipt, setRuntimeReceipt] = useState<RuntimeReceipt | null>(null);
  const [jobStatus, setJobStatus] = useState<BrowserJobStatus | null>(null);
  const [mode, setMode] = useState<IngestionMode>("both");
  const [voice, setVoice] = useState<IngestionVoice>("sulafat");
  const [rights, setRights] = useState(false);

  useEffect(() => {
    if (!runtimeReceipt) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let delay = 2000;

    const poll = async () => {
      try {
        const next = await getBrowserJobStatus(runtimeReceipt.jobId, runtimeReceipt.sessionToken);
        if (cancelled) return;
        setJobStatus(next);
        if (["ready", "failed", "quota-paused"].includes(next.stage)) return;
        delay = Math.min(Math.round(delay * 1.35), 12000);
        timer = setTimeout(() => void poll(), delay);
      } catch (error) {
        if (!cancelled) setMessage(runtimeErrorMessage(error));
      }
    };

    void poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [runtimeReceipt]);

  async function prepare(file: File | undefined) {
    if (!file) return;
    setRights(false);
    setPrepared(null);
    setRuntimeReceipt(null);
    setJobStatus(null);
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
      setPrepared({ file, sections, digest, characters: sections.reduce((sum, item) => sum + item.text.length, 0) });
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
    setJobStatus(null);
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
      setJobStatus({ jobId: receipt.jobId, stage: receipt.stage, assets: [] });
      setStatus("submitted");
      setMessage("فایل ثبت شد؛ وضعیت پردازش به‌صورت امن به‌روزرسانی می‌شود.");
    } catch (error) {
      setStatus("ready");
      setMessage(runtimeErrorMessage(error));
    }
  }

  const canContinue = status === "ready" && rights && Boolean(prepared);
  const busy = status === "reading" || status === "submitting";
  const currentStage = jobStatus?.stage ?? runtimeReceipt?.stage ?? "received";
  const progress = runtimeReceipt ? stageProgress(currentStage) : 0;
  const verifiedAssets = useMemo(() => jobStatus?.assets.filter((asset) => asset.status === "verified") ?? [], [jobStatus]);

  return (
    <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="order-2 space-y-4 xl:order-1">
        <section className="rounded-3xl border border-black/10 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/80">
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-300"><FileText size={19} /><h2 className="font-black">جزئیات فایل</h2></div>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-zinc-500">نام فایل</dt><dd className="max-w-[150px] truncate font-bold" dir="ltr">{fileName || "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">نوع خروجی</dt><dd className="font-bold">{mode === "both" ? "کامل + خلاصه" : mode === "full-audio" ? "صوت کامل" : "خلاصه صوتی"}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">حریم خصوصی</dt><dd className="font-bold text-emerald-600">خصوصی</dd></div>
            {prepared && <div className="flex justify-between"><dt className="text-zinc-500">نویسه‌ها</dt><dd className="font-bold">{prepared.characters.toLocaleString("fa-IR")}</dd></div>}
          </dl>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950/80">
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-300"><LockKeyhole size={19} /><h2 className="font-black">امنیت پردازش</h2></div>
          <p className="mt-4 text-sm leading-7 text-zinc-500">نشست مرورگر محدود و مالکیت job به همان نشست متصل است. مسیرهای تولید و نهایی‌سازی برای مرورگر قابل فراخوانی نیستند.</p>
        </section>
      </aside>

      <div className="order-1 space-y-5 xl:order-2">
        <section className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#10131d]">
          <div className="border-b border-black/10 px-5 py-4 dark:border-white/10"><h2 className="font-black">آپلود جدید</h2></div>
          <div className="p-5 md:p-7">
            <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-violet-400/50 bg-violet-50/50 p-6 text-center transition hover:border-violet-500 dark:bg-violet-950/10">
              <UploadCloud className="mb-3 text-violet-500" size={42} />
              <span className="text-lg font-black">فایل خود را اینجا رها کنید</span>
              <span className="mt-2 text-sm text-zinc-500">یا برای انتخاب TXT / Markdown کلیک کنید</span>
              <input className="sr-only" type="file" accept=".txt,.md,text/plain,text/markdown" disabled={busy} onChange={(event) => void prepare(event.target.files?.[0])} />
            </label>

            {fileName && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-black/10 p-4 dark:border-white/10">
                <div className="min-w-0"><p className="truncate font-bold" dir="ltr">{fileName}</p><p className="text-xs text-zinc-500">{prepared ? `${prepared.sections.length.toLocaleString("fa-IR")} بخش آماده` : "در حال بررسی فایل"}</p></div>
                {busy ? <LoaderCircle className="animate-spin text-violet-500" /> : prepared ? <CheckCircle2 className="text-emerald-500" /> : <Circle className="text-zinc-400" />}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#10131d] md:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
            <div>
              <div className="flex items-center justify-between gap-3"><h2 className="font-black">وضعیت پردازش</h2><span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-600 dark:text-violet-300">{STAGE_LABELS[currentStage] ?? currentStage}</span></div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10"><div className="h-full rounded-full bg-violet-500 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
              <div className="mt-3 flex justify-between text-xs text-zinc-500"><span>پیشرفت کلی</span><span>{progress.toLocaleString("fa-IR")}%</span></div>

              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
                {["received", "validating", "full-audio", "quality-check", "ready"].map((stage) => {
                  const stageIndex = STAGES.indexOf(stage as (typeof STAGES)[number]);
                  const currentIndex = STAGES.indexOf(currentStage as (typeof STAGES)[number]);
                  const done = currentStage === "ready" || (currentIndex >= 0 && currentIndex >= stageIndex);
                  return <div key={stage} className="rounded-2xl border border-black/10 p-3 text-center dark:border-white/10">{done ? <CheckCircle2 className="mx-auto text-emerald-500" size={20} /> : <Circle className="mx-auto text-zinc-400" size={20} />}<p className="mt-2 text-xs font-bold">{STAGE_LABELS[stage]}</p></div>;
                })}
              </div>

              {currentStage === "quota-paused" && (
                <div className="mt-5 flex gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm"><PauseCircle className="shrink-0 text-amber-500" /><div><p className="font-black">پردازش به‌دلیل محدودیت سهمیه متوقف شده است</p><p className="mt-1 text-zinc-500">job و checkpointها حفظ شده‌اند و تکمیل جعلی نمایش داده نمی‌شود.</p></div></div>
              )}
              {message && <p className="mt-4 text-sm text-zinc-500" aria-live="polite">{message}</p>}
            </div>

            <div className="rounded-3xl bg-zinc-950 p-5 text-white">
              <div className="flex items-center gap-2"><ShieldCheck className="text-violet-400" /><h3 className="font-black">تنظیم خروجی</h3></div>
              <label className="mt-5 block text-sm font-bold">نوع خروجی<select value={mode} disabled={busy || Boolean(runtimeReceipt)} onChange={(event) => setMode(event.target.value as IngestionMode)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 p-3"><option value="both">خلاصه صوتی + صوت کامل</option><option value="summary-podcast">فقط خلاصه صوتی</option><option value="full-audio">فقط صوت کامل</option></select></label>
              <label className="mt-4 block text-sm font-bold">صدای روایت<select value={voice} disabled={busy || Boolean(runtimeReceipt)} onChange={(event) => setVoice(event.target.value as IngestionVoice)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 p-3"><option value="sulafat">سولافات — صدای زن</option><option value="schedar">شِدار — صدای مرد</option></select></label>
              <label className="mt-5 flex items-start gap-3 text-sm leading-6"><input type="checkbox" checked={rights} disabled={busy || Boolean(runtimeReceipt)} onChange={(event) => setRights(event.target.checked)} className="mt-1 size-4 accent-violet-500" /><span>مجاز به پردازش این فایل هستم.</span></label>
              <button type="button" disabled={!canContinue || busy || Boolean(runtimeReceipt)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-black transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40" onClick={() => void submit()}>{status === "submitting" && <LoaderCircle size={18} className="animate-spin" />}{status === "submitting" ? "در حال شروع…" : "شروع پردازش"}</button>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#10131d] md:p-7">
          <div className="flex items-center justify-between"><h2 className="font-black">خروجی‌های آماده</h2><span className="text-xs text-zinc-500">فقط assetهای verified نمایش داده می‌شوند</span></div>
          {verifiedAssets.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-3">{verifiedAssets.map((asset) => <article key={asset.id} className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4"><FileAudio className="text-violet-500" /><h3 className="mt-3 font-black">{assetTitle(asset.kind)}</h3><p className="mt-1 text-xs text-emerald-600">تأییدشده</p>{asset.bytes ? <p className="mt-3 text-xs text-zinc-500">{asset.bytes.toLocaleString("fa-IR")} بایت</p> : null}</article>)}</div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-black/10 p-8 text-center text-sm text-zinc-500 dark:border-white/10">خروجی تأییدشده‌ای هنوز آماده نیست. این بخش فقط وضعیت واقعی Runtime را نشان می‌دهد.</div>
          )}
        </section>
      </div>
    </div>
  );
}
