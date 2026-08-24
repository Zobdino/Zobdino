import BookCard from './BookCard';

type Book = {
  title: string;
  language: string;
  status: string;
  slug?: string;
};

type Props = {
  books: Book[];
};

export function CatalogGrid({ books }: Props) {
  return (
    <section>
      {books.map((book) => (
        <BookCard key={book.slug ?? book.title} book={book} />
      ))}
    </section>
  );
}

export default CatalogGrid;
