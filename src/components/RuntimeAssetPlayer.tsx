"use client";

import { LoaderCircle, Play, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  BrowserRuntimeError,
  fetchBrowserAudioSegment,
  fetchResumedAudioSegment,
  type BrowserRuntimeAsset,
  type BrowserRuntimeAudioSegment,
} from "@/lib/browser-runtime";

interface RuntimeAssetPlayerProps {
  asset: BrowserRuntimeAsset;
  sessionToken?: string;
  resumeToken?: string;
}

function segmentLabel(segment: BrowserRuntimeAudioSegment, index: number) {
  const from = typeof segment.startOffset === "number" ? segment.startOffset.toLocaleString("fa-IR") : null;
  const to = typeof segment.endOffset === "number" ? segment.endOffset.toLocaleString("fa-IR") : null;
  if (from && to) return `بخش ${(index + 1).toLocaleString("fa-IR")} · نویسه ${from} تا ${to}`;
  return `بخش ${(index + 1).toLocaleString("fa-IR")}`;
}

export default function RuntimeAssetPlayer({ asset, sessionToken, resumeToken }: RuntimeAssetPlayerProps) {
  const segments = useMemo(
    () => (asset.audioSegments ?? []).filter((segment) => segment.status === "verified" && segment.playbackPath),
    [asset.audioSegments],
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  async function playSegment(segment: BrowserRuntimeAudioSegment, index: number) {
    if (!segment.playbackPath) return;
    setLoading(true);
    setActiveIndex(index);
    setError("");
    try {
      const blob = resumeToken
        ? await fetchResumedAudioSegment(segment.playbackPath, resumeToken)
        : sessionToken
          ? await fetchBrowserAudioSegment(segment.playbackPath, sessionToken)
          : null;
      if (!blob) throw new BrowserRuntimeError("audio-credential-missing", 401);
      const nextUrl = URL.createObjectURL(blob);
      setAudioUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return nextUrl;
      });
      requestAnimationFrame(() => void audioRef.current?.play());
    } catch (cause) {
      const code = cause instanceof BrowserRuntimeError ? cause.code : "audio-playback-failed";
      setError(
        code === "expired-or-invalid-session" || code === "invalid-resume-token"
          ? "دسترسی خصوصی این فایل معتبر نیست."
          : "پخش این بخش ممکن نشد.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!segments.length) return null;

  return (
    <div className="mt-4 rounded-2xl border border-violet-500/15 bg-white/70 p-3 dark:bg-black/20">
      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
        <ShieldCheck size={15} />
        <span>پخش خصوصی و امن</span>
      </div>

      {audioUrl ? (
        <audio ref={audioRef} className="mt-3 w-full" controls preload="metadata" src={audioUrl} />
      ) : null}

      <div className="mt-3 max-h-44 space-y-2 overflow-y-auto pr-1">
        {segments.map((segment, index) => (
          <button
            key={segment.id ?? `${asset.id}-${index}`}
            type="button"
            disabled={loading}
            onClick={() => void playSegment(segment, index)}
            className="flex w-full items-center justify-between gap-3 rounded-xl border border-black/10 px-3 py-2 text-right text-xs transition hover:border-violet-400/40 hover:bg-violet-500/5 disabled:opacity-50 dark:border-white/10"
          >
            <span className="min-w-0 truncate font-bold">{segmentLabel(segment, index)}</span>
            {loading && activeIndex === index ? <LoaderCircle className="animate-spin" size={15} /> : <Play size={15} className={activeIndex === index ? "text-violet-500" : "text-zinc-400"} />}
          </button>
        ))}
      </div>

      {error ? <p className="mt-2 text-xs text-rose-500" role="alert">{error}</p> : null}
    </div>
  );
}
