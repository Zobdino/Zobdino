export type BookDetailProps = {
  title: string;
  summaryPreview: string;
  language: string;
  voices: string[];
};

export function BookDetail({ title, summaryPreview, language, voices }: BookDetailProps) {
  return (
    <section aria-label="book-detail-preview">
      <h1>{title}</h1>
      <p>{language}</p>
      <p>{summaryPreview}</p>
      <ul>
        {voices.map((voice) => (
          <li key={voice}>{voice}</li>
        ))}
      </ul>
    </section>
  );
}
