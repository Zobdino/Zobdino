import { BookCard, PreviewBook } from './BookCard';

export function CatalogGrid({ books }: { books: PreviewBook[] }) {
  return (
    <section>
      {books.map((book) => (
        <BookCard key={book.title} book={book} />
      ))}
    </section>
  );
}
