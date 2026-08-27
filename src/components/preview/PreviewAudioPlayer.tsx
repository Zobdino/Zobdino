"use client";

import { useState } from "react";
import type { MediaStatus } from "@/lib/catalog";

type Props = {
  voices: string[];
  mediaStatus: MediaStatus;
};

export function PreviewAudioPlayer({ voices, mediaStatus }: Props) {
  const [selectedVoice, setSelectedVoice] = useState(voices[0] ?? "");

  const ready = mediaStatus === "ready";

  return (
    <section className="rounded-3xl border border-gray-800 bg-black/20 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-bold text-accent">Zobdino Audio</p>
          <h3 className="mt-1 text-xl font-extrabold">پخش نسخه صوتی</h3>
        </div>

        <span className="w-fit rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-400">
          {ready ? "آماده" : "در حال آماده‌سازی"}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {voices.map((voice) => (
          <button
            key={voice}
            type="button"
            onClick={() => setSelectedVoice(voice)}
            className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
              selectedVoice === voice
                ? "border-accent bg-accent/10 text-accent"
                : "border-gray-800 text-gray-400 hover:border-gray-700"
            }`}
          >
            {voice}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-surface/60 p-4">
        {ready ? (
          <p className="text-sm text-gray-300">
            نسخه تأییدشده برای {selectedVoice} آماده پخش است.
          </p>
        ) : (
          <p className="text-sm leading-7 text-gray-400">
            رابط پخش آماده است. فایل نهایی {selectedVoice} پس از تکمیل QA
            به‌صورت خودکار به همین Player متصل می‌شود؛ صفحه محصول به quota
            تولید صوت وابسته نیست.
          </p>
        )}
      </div>
    </section>
  );
}

export default PreviewAudioPlayer;
