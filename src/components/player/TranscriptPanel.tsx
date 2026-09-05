"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { Episode } from "@/lib/episodes";
import { usePlayer } from "@/components/player/PlayerProvider";

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remaining = Math.floor(safe % 60);

  return `${minutes.toLocaleString("fa-IR")}:${remaining.toLocaleString(
    "fa-IR",
    {
      minimumIntegerDigits: 2,
      useGrouping: false,
    },
  )}`;
}

export default function TranscriptPanel({
  episode,
}: {
  episode: Episode;
}) {
  const [query, setQuery] = useState("");
  const {
    activeEpisode,
    currentTime,
    activateEpisode,
  } = usePlayer();

  const normalizedQuery = query.trim().toLocaleLowerCase("fa-IR");
  const cues = useMemo(() => episode.transcriptCues ?? [], [episode.transcriptCues]);

  const paragraphs = useMemo(
    () =>
      episode.transcript
        .split(/\n{2,}/u)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
    [episode.transcript],
  );

  const filteredParagraphs = useMemo(
    () =>
      normalizedQuery
        ? paragraphs.filter((paragraph) =>
            paragraph
              .toLocaleLowerCase("fa-IR")
              .includes(normalizedQuery),
          )
        : paragraphs,
    [normalizedQuery, paragraphs],
  );

  const filteredCues = useMemo(
    () =>
      normalizedQuery
        ? cues.filter((cue) =>
            cue.text.toLocaleLowerCase("fa-IR").includes(normalizedQuery),
          )
        : cues,
    [cues, normalizedQuery],
  );

  const exactSyncAvailable = cues.length > 0;

  return (
    <section
      id="transcript"
      className="scroll-mt-24 rounded-[2rem] border border-black/7 bg-white/80 p-6 shadow-sm dark:border-white/8 dark:bg-white/[0.03] md:p-9"
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="z-eyebrow">قابل جست‌وجو</p>
          <h2 className="mt-2 text-3xl font-black">متن روایت</h2>
          <p className="mt-2 text-sm leading-7 z-muted">
            {exactSyncAvailable
              ? "روی هر بخش بزن تا صدا دقیقاً از همان لحظه ادامه پیدا کند."
              : "متن روایت برای مطالعه و جست‌وجو در دسترس است؛ همگام‌سازی دقیق زمانی فقط وقتی cueهای QA موجود باشند فعال می‌شود."}
          </p>
        </div>

        <label className="relative w-full md:max-w-sm">
          <span className="sr-only">جست‌وجو در متن روایت</span>
          <Search
            size={18}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 z-muted"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جست‌وجو در متن..."
            className="z-focus w-full rounded-2xl border border-black/10 bg-white py-3 pr-11 pl-4 text-sm outline-none placeholder:text-black/35 dark:border-white/10 dark:bg-white/[0.035] dark:placeholder:text-white/35"
          />
        </label>
      </div>

      {exactSyncAvailable ? (
        <div className="space-y-2">
          {filteredCues.map((cue) => {
            const active =
              activeEpisode?.id === episode.id &&
              currentTime >= cue.startSeconds &&
              currentTime < cue.endSeconds;

            return (
              <button
                key={`${cue.startSeconds}-${cue.text}`}
                type="button"
                onClick={() =>
                  activateEpisode(episode.id, {
                    autoplay: true,
                    startAt: cue.startSeconds,
                  })
                }
                className={`z-focus grid w-full grid-cols-[64px_1fr] gap-4 rounded-2xl border p-4 text-right transition ${
                  active
                    ? "border-violet-500/30 bg-violet-500/10"
                    : "border-transparent hover:border-black/8 hover:bg-black/[0.025] dark:hover:border-white/8 dark:hover:bg-white/[0.035]"
                }`}
              >
                <span
                  dir="ltr"
                  className="text-xs font-black tabular-nums text-violet-700 dark:text-violet-300"
                >
                  {formatTime(cue.startSeconds)}
                </span>
                <span className="leading-8 z-muted">{cue.text}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-5">
          {filteredParagraphs.map((paragraph, index) => (
            <p
              key={`${index}-${paragraph.slice(0, 30)}`}
              className="text-base leading-9 z-muted md:text-lg md:leading-10"
            >
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {(exactSyncAvailable ? filteredCues : filteredParagraphs).length === 0 && (
        <div className="rounded-2xl border border-dashed border-black/10 py-12 text-center z-muted dark:border-white/10">
          نتیجه‌ای در متن پیدا نشد.
        </div>
      )}
    </section>
  );
}
