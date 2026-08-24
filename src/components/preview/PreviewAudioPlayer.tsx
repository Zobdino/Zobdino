type Props = {
  voices: string[];
};

export function PreviewAudioPlayer({ voices }: Props) {
  return (
    <section>
      <h3>Audio Preview</h3>
      <ul>
        {voices.map((voice) => (
          <li key={voice}>{voice}</li>
        ))}
      </ul>
    </section>
  );
}

export default PreviewAudioPlayer;
