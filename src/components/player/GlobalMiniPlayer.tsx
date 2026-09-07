"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  X,
} from "lucide-react";
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

  return `${minutes.toLocaleString(numberLocale)}:${remaining.toLocaleString(
    numberLocale,
    {
      minimumIntegerDigits: 2,
      useGrouping: false,
    },
  )}`;
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
    ? episodes.find(
        (episode) =>
          episode.id === listening.lastEpisodeId &&
          episode.audio.status === "ready",
      ) ?? null
    : null;

  const displayEpisode = activeEpisode ?? fallbackEpisode;
  if (!displayEpisode || dismissedEpisodeId === displayEpisode.id) return null;

  const stored = listening.progress[displayEpisode.id];
  if (!activeEpisode && (!stored || stored.completed || stored.currentTime < 5)) {
    return null;
  }

  const book = books.find((item) => item.slug === displayEpisode.bookSlug) ?? null;
  const active = activeEpisode?.id === displayEpisode.id;
  const displayCurrent = active ? currentTime : stored?.currentTime ?? 0;
  const displayDuration = active
    ? duration || displayEpisode.audio.durationSeconds
    : stored?.duration || displayEpisode.audio.durationSeconds;

  const progress =
    displayDuration > 0
      ? Math.min(Math.max((displayCurrent / displayDuration) * 100, 0), 100)
      : 0;

  const handlePrimary = () => {
    if (active) {
      togglePlayback();
      return;
    }

    setDismissedEpisodeId(null);
    activateEpisode(displayEpisode.id, {
      autoplay: true,
      startAt: displayCurrent,
    });
  };

  const handleOpenBook = () => {
    setDismissedEpisodeId(null);
    if (!active) {
      activateEpisode(displayEpisode.id, {
        autoplay: true,
        startAt: displayCurrent,
      });
    }
  };

  const handleClose = () => {
    if (active && isPlaying) togglePlayback();
    setDismissedEpisodeId(displayEpisode.id);
  };

  const displayTitle = book
    ? fa
      ? displayEpisode.title
      : `${book.titleEn} · Persian audio`
    : displayEpisode.title;

  return (
    <aside
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-4xl overflow-hidden rounded-3xl border border-gray-700/80 bg-gray-950/95 shadow-2xl shadow-black/60 backdrop-blur-xl md:bottom-5"
      aria-label={fa ? "پلیر سراسری زبدینو" : "Zobdino global player"}
    >
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-accent transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-3 p-3 md:gap-5 md:p-4">
        {book && (
          <Image
            src={book.coverUrl}
            alt=""
            width={48}
            height={64}
            unoptimized
            className="h-14 w-11 shrink-0 rounded-lg object-cover md:h-16 md:w-12"
          />
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-accent">
            {active ? (fa ? "در حال پخش" : "Now playing") : (fa ? "ادامه شنیدن" : "Continue listening")}
          </p>
          <Link
            href={`/books/${displayEpisode.bookSlug}#player`}
            onClick={handleOpenBook}
            className="mt-1 block truncate font-bold text-white hover:text-accent"
          >
            {displayTitle}
          </Link>
          <p dir="ltr" className="mt-1 text-xs tabular-nums text-gray-500">
            {formatTime(displayCurrent, locale)} / {formatTime(displayDuration, locale)}
          </p>
        </div>

        <div className="hidden items-center gap-1 sm:flex">
          <button
            type="button"
            onClick={() => {
              if (!active) {
                activateEpisode(displayEpisode.id, {
                  autoplay: false,
                  startAt: Math.max(displayCurrent - 15, 0),
                });
              } else {
                skip(-15);
              }
            }}
            className="rounded-full p-2.5 text-gray-400 transition hover:bg-gray-800 hover:text-white"
            aria-label={fa ? "۱۵ ثانیه قبل" : "Back 15 seconds"}
          >
            <SkipBack size={21} />
          </button>

          <button
            type="button"
            onClick={handlePrimary}
            className="rounded-full bg-accent p-3 text-white shadow-lg shadow-accent/30"
            aria-label={active && isPlaying ? (fa ? "توقف" : "Pause") : (fa ? "پخش" : "Play")}
          >
            {active && isBuffering ? (
              <span className="block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : active && isPlaying ? (
              <Pause size={22} fill="currentColor" />
            ) : (
              <Play size={22} fill="currentColor" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (!active) {
                activateEpisode(displayEpisode.id, {
                  autoplay: false,
                  startAt: Math.min(displayCurrent + 15, displayDuration),
                });
              } else {
                skip(15);
              }
            }}
            className="rounded-full p-2.5 text-gray-400 transition hover:bg-gray-800 hover:text-white"
            aria-label={fa ? "۱۵ ثانیه بعد" : "Forward 15 seconds"}
          >
            <SkipForward size={21} />
          </button>
        </div>

        <button
          type="button"
          onClick={handlePrimary}
          className="rounded-full bg-accent p-3 text-white sm:hidden"
          aria-label={active && isPlaying ? (fa ? "توقف" : "Pause") : (fa ? "پخش" : "Play")}
        >
          {active && isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
        </button>

        <button
          type="button"
          onClick={handleClose}
          className="rounded-full p-2.5 text-gray-400 transition hover:bg-gray-800 hover:text-white"
          aria-label={fa ? "بستن ادامه شنیدن" : "Close continue listening"}
          title={fa ? "بستن" : "Close"}
        >
          <X size={20} />
        </button>
      </div>

      {active && (
        <input
          dir="ltr"
          type="range"
          min={0}
          max={Math.max(displayDuration, 1)}
          value={Math.min(displayCurrent, Math.max(displayDuration, 1))}
          onChange={(event) => seekTo(Number(event.target.value))}
          className="sr-only"
          aria-label={fa ? "موقعیت پخش پلیر سراسری" : "Global player position"}
        />
      )}
    </aside>
  );
}
