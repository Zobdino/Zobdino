import React from "react";

export type PreviewVoice = {
  id: string;
  name: string;
};

export type PreviewAudioPlayerProps = {
  title: string;
  voices: PreviewVoice[];
};

export function PreviewAudioPlayer({ title, voices }: PreviewAudioPlayerProps) {
  return (
    <section aria-label="audio preview player">
      <h3>{title}</h3>
      <div>
        {voices.map((voice) => (
          <button key={voice.id} type="button">
            {voice.name}
          </button>
        ))}
      </div>
      <button type="button">Play preview</button>
    </section>
  );
}
