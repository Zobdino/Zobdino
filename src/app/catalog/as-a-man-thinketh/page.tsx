import { BookDetail } from "@/components/preview/BookDetail";
import { previewBooks } from "@/content/preview-books";

export default function BookPreviewPage() {
  const book = previewBooks[0];

  return (
    <main>
      <BookDetail book={book} />
    </main>
  );
}
