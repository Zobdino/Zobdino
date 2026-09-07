"use client";

import Image from "next/image";
import Link from "next/link";
import { Pause, Play, RotateCcw, RotateCw, X } from "lucide-react";
import { useState } from "react";

import { useLocale } from "@/components/LocaleProvider";
import { usePlayer } from "@/components/player/PlayerProvider";
import { books } from "@/lib/books";
import { episodes } from "@/lib/episodes";

function formatTime(seconds: number, locale: "fa" | "en") {
  const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const minutes = Math.floor(safe / 60);
  const remaining = Math.floor(safe % 60);
  const numberLocale = locale === "fa" ? "fa-IR" : "en-US";
  return `${minutes.toLocaleString(numberLocale)}:${remaining.toLocaleString(numberLocale, { minimumIntegerDigits: 2, useGrouping: false })}`;
}

export default function GlobalMiniPlayer() {
  const { locale } = useLocale();
  const fa = locale === "fa";
  const [dismissedEpisodeId, setDismissedEpisodeId] = useState<string | null>(null);
  const {
    activeEpisode,
    listening,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    activateEpisode,
    togglePlayback,
    seekTo,
    skip,
  } = usePlayer();

  const fallbackEpisode = listening.lastEpisodeId
    ? episodes.find((episode) => episode.id === listening.lastEpisodeId && episode.audio.status === "ready") ?? null
    : null;
  const displayEpisode = activeEpisode ?? fallbackEpisode;
  if (!displayEpisode || dismissedEpisodeId === displayEpisode.id) return null;

  const stored = listening.progress[displayEpisode.id];
  if (!activeEpisode && (!stored || stored.completed || stored.currentTime < 5)) return null;

  const book = books.find((item) => item.slug === displayEpisode.bookSlug) ?? null;
  const active = activeEpisode?.id === displayEpisode.id;
  const displayCurrent = active ? currentTime : stored?.currentTime ?? 0;
  const displayDuration = active ? duration || displayEpisode.audio.durationSeconds : stored?.duration || displayEpisode.audio.durationSeconds;
  const progress = displayDuration > 0 ? Math.min(Math.max((displayCurrent / displayDuration) * 100, 0), 100) : 0;

  const handlePrimary = () => {
    if (active) return togglePlayback();
    setDismissedEpisodeId(null);
    activateEpisode(displayEpisode.id, { autoplay: true, startAt: displayCurrent });
  };

  const handleOpenBook = () => {
    setDismissedEpisodeId(null);
    if (!active) activateEpisode(displayEpisode.id, { autoplay: true, startAt: displayCurrent });
  };

  const handleClose = () => {
    if (active && isPlaying) togglePlayback();
    setDismissedEpisodeId(displayEpisode.id);
  };

  return (
    <aside className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl overflow-hidden rounded-[1.4rem] border border-slate-700/80 bg-[#0b1320]/97 shadow-[0_24px_70px_rgba(4,11,20,.45)] backdrop-blur-xl md:bottom-5" aria-label={fa ? "پلیر سراسری زبدینو" : "Zobdino global player"}>
      <div className="h-1 bg-slate-800"><div className="h-full bg-[#f4b62f] transition-[width]" style={{ width: `${progress}%` }} /></div>
      <div className="flex items-center gap-3 px-3 py-3 md:gap-4 md:px-4">
        {book ? <Image src={book.coverUrl} alt="" width={44} height={58} unoptimized className="h-12 w-9 shrink-0 rounded-md object-cover md:h-14 md:w-11" /> : null}

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black text-[#f4b62f]">{active ? (fa ? "در حال پخش" : "Now playing") : (fa ? "ادامه شنیدن" : "Continue listening")}</p>
          <Link href={`/books/${displayEpisode.bookSlug}#player`} onClick={handleOpenBook} className="mt-0.5 block truncate text-sm font-black text-white hover:text-[#f4b62f] md:text-base">
            {book ? (fa ? book.titleFa : book.titleEn) : displayEpisode.title}
          </Link>
          <p dir="ltr" className="mt-0.5 text-[11px] tabular-nums text-slate-400">{formatTime(displayCurrent, locale)} / {formatTime(displayDuration, locale)}</p>
        </div>

        <div className="hidden items-center gap-1 sm:flex">
          <button type="button" onClick={() => active ? skip(-10) : activateEpisode(displayEpisode.id, { autoplay: false, startAt: Math.max(displayCurrent - 10, 0) })} className="rounded-full p-2 text-slate-300 transition hover:bg-white/8 hover:text-white" aria-label={fa ? "۱۰ ثانیه قبل" : "Back 10 seconds"}><RotateCcw size={19} /></button>
          <button type="button" onClick={handlePrimary} className="grid size-12 place-items-center rounded-full bg-[#f4b62f] text-[#08253a] shadow-lg shadow-black/30" aria-label={active && isPlaying ? (fa ? "توقف" : "Pause") : (fa ? "پخش" : "Play")}>
            {active && isBuffering ? <span className="block h-5 w-5 animate-spin rounded-full border-2 border-[#08253a]/30 border-t-[#08253a]" /> : active && isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
          </button>
          <button type="button" onClick={() => active ? skip(10) : activateEpisode(displayEpisode.id, { autoplay: false, startAt: Math.min(displayCurrent + 10, displayDuration) })} className="rounded-full p-2 text-slate-300 transition hover:bg-white/8 hover:text-white" aria-label={fa ? "۱۰ ثانیه بعد" : "Forward 10 seconds"}><RotateCw size={19} /></button>
        </div>

        <button type="button" onClick={handlePrimary} className="grid size-11 place-items-center rounded-full bg-[#f4b62f] text-[#08253a] sm:hidden" aria-label={active && isPlaying ? (fa ? "توقف" : "Pause") : (fa ? "پخش" : "Play")}>{active && isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}</button>
        <button type="button" onClick={handleClose} className="rounded-full p-2 text-slate-300 transition hover:bg-white/8 hover:text-white" aria-label={fa ? "بستن ادامه شنیدن" : "Close continue listening"} title={fa ? "بستن" : "Close"}><X size={20} /></button>
      </div>

      {active ? <input dir="ltr" type="range" min={0} max={Math.max(displayDuration, 1)} value={Math.min(displayCurrent, Math.max(displayDuration, 1))} onChange={(event) => seekTo(Number(event.target.value))} className="sr-only" aria-label={fa ? "موقعیت پخش پلیر" : "Player position"} /> : null}
    </aside>
  );
}
