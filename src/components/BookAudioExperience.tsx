"use client";

import { Headphones, Mic2 } from "lucide-react";
import { useMemo, useState } from "react";

import AudioPlayer from "@/components/AudioPlayer";
import TranscriptPanel from "@/components/player/TranscriptPanel";
import { usePlayer } from "@/components/player/PlayerProvider";
import { getEpisodeVoiceLabelFa, isProductionAudio } from "@/lib/audio";
import type { Episode } from "@/lib/episodes";

export default function BookAudioExperience({
  episodes,
}: {
  episodes: readonly Episode[];
}) {
  const { activeEpisode, currentTime, activateEpisode } = usePlayer();
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

  const switchVoice = (episode: Episode) => {
    if (episode.id === selected.id) return;
    const activeIsCurrentBookVariant = options.some(
      (option) => option.id === activeEpisode?.id,
    );

    setSelectedId(episode.id);
    if (activeIsCurrentBookVariant) {
      activateEpisode(episode.id, {
        autoplay: false,
        startAt: currentTime,
      });
    }
  };

  return (
    <>
      <section
        id="player"
        className="mb-8 overflow-hidden rounded-[2rem] border border-black/7 bg-white/80 shadow-sm dark:border-white/8 dark:bg-white/[0.03]"
      >
        <div className="border-b border-black/7 p-5 dark:border-white/8 md:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-black text-violet-700 dark:text-violet-300">
                <Headphones size={17} />
                شنیدن کتاب
              </div>
              <h2 className="mt-2 text-2xl font-black md:text-3xl">{selected.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 z-muted">
                صدا را انتخاب کن، از همان نقطه ادامه بده و بدون خروج از صفحه بین روایت‌ها جابه‌جا شو.
              </p>
            </div>

            {canonicalEpisodes.length > 1 ? (
              <div
                className="grid grid-cols-2 gap-2 rounded-2xl border border-black/8 bg-black/[0.025] p-1.5 dark:border-white/10 dark:bg-white/[0.035]"
                role="group"
                aria-label="انتخاب صدای روایت"
              >
                {canonicalEpisodes.map((episode) => {
                  const active = episode.id === selected.id;
                  return (
                    <button
                      key={episode.id}
                      type="button"
                      onClick={() => switchVoice(episode)}
                      aria-pressed={active}
                      className={`z-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition ${
                        active
                          ? "bg-violet-700 text-white shadow-md shadow-violet-700/15"
                          : "z-muted hover:bg-white dark:hover:bg-white/[0.06]"
                      }`}
                    >
                      <Mic2 size={15} />
                      {getEpisodeVoiceLabelFa(episode.audio)}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <div className="p-5 md:p-7">
          <AudioPlayer episode={selected} />
          <p className="mt-5 text-sm leading-7 z-muted md:text-base md:leading-8">
            {selected.description}
          </p>
        </div>
      </section>

      <div className="mb-10">
        <TranscriptPanel episode={selected} />
      </div>
    </>
  );
}
