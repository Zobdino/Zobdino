export type PreviewBook = {
  title: string;
  language: string;
  status: 'preview' | 'published';
  cover?: string;
};

export function BookCard({ book }: { book: PreviewBook }) {
  return (
    <article>
      <h3>{book.title}</h3>
      <p>{book.language}</p>
      <span>{book.status}</span>
    </article>
  );
}
