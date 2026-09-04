"use client";

import { useMemo, useState } from "react";

import AudioPlayer from "@/components/AudioPlayer";
import TranscriptPanel from "@/components/player/TranscriptPanel";
import { getEpisodeVoiceLabelFa, isProductionAudio } from "@/lib/audio";
import type { Episode } from "@/lib/episodes";

export default function BookAudioExperience({
  episodes,
}: {
  episodes: readonly Episode[];
}) {
  const playableEpisodes = useMemo(
    () => episodes.filter((episode) => episode.audio.status === "ready"),
    [episodes],
  );
  const canonicalEpisodes = useMemo(
    () => playableEpisodes.filter((episode) => isProductionAudio(episode.audio)),
    [playableEpisodes],
  );
  const options = canonicalEpisodes.length > 0 ? canonicalEpisodes : playableEpisodes;
  const [selectedId, setSelectedId] = useState(options[0]?.id ?? "");
  const selected = options.find((episode) => episode.id === selectedId) ?? options[0];

  if (!selected) return null;

  return (
    <>
      <section
        id="player"
        className="mb-12 rounded-3xl border border-gray-800 bg-surface/50 p-5 md:p-8"
      >
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-accent">اپیزود زبدینو</p>
            <h2 className="mt-2 text-2xl font-extrabold">{selected.title}</h2>
          </div>

          {canonicalEpisodes.length > 1 ? (
            <div
              className="grid grid-cols-2 gap-2 rounded-2xl border border-gray-800 bg-background/60 p-1.5"
              role="group"
              aria-label="انتخاب صدای روایت"
            >
              {canonicalEpisodes.map((episode) => {
                const active = episode.id === selected.id;
                return (
                  <button
                    key={episode.id}
                    type="button"
                    onClick={() => setSelectedId(episode.id)}
                    aria-pressed={active}
                    className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                      active
                        ? "bg-accent text-white shadow-lg shadow-accent/20"
                        : "text-gray-400 hover:bg-surface hover:text-[var(--page-fg)]"
                    }`}
                  >
                    {getEpisodeVoiceLabelFa(episode.audio)}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <AudioPlayer episode={selected} />
        <p className="mt-6 text-lg leading-8 text-gray-400">
          {selected.description}
        </p>
      </section>

      <TranscriptPanel episode={selected} />
    </>
  );
}
