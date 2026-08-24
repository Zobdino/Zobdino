import { notFound } from 'next/navigation';
import { BookDetail } from '@/components/preview/BookDetail';
import { getPreviewBook } from '@/lib/catalog';

export default function BookPreviewPage() {
  const book = getPreviewBook('as-a-man-thinketh');

  if (!book) {
    notFound();
  }

  return (
    <main>
      <BookDetail book={book} />
    </main>
  );
}
