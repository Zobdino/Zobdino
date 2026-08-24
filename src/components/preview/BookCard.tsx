type Book = {
  title: string;
  language: string;
  status: string;
  slug?: string;
};

type Props = {
  book: Book;
};

export function BookCard({ book }: Props) {
  return (
    <article>
      <h2>{book.title}</h2>
      <p>{book.language}</p>
      <span>{book.status}</span>
    </article>
  );
}

export default BookCard;
