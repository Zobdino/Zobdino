import BookCard from "./BookCard";
import type { PreviewBook } from "@/lib/catalog";

type Props = {
  books: PreviewBook[];
};

export function CatalogGrid({ books }: Props) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </section>
  );
}

export default CatalogGrid;
