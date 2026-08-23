import PreviewAudioPlayer from './PreviewAudioPlayer';

type Props = {
  book: {
    title: string;
    language: string;
    summaryPreview: string;
    voices: string[];
  };
};

export default function BookDetail({ book }: Props) {
  return (
    <article>
      <h1>{book.title}</h1>
      <p>{book.language}</p>
      <p>{book.summaryPreview}</p>
      <PreviewAudioPlayer voices={book.voices} />
    </article>
  );
}
