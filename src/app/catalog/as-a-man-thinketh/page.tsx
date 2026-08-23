import { BookDetail } from '@/components/preview/BookDetail';
import { PreviewAudioPlayer } from '@/components/preview/PreviewAudioPlayer';
import { getPreviewBook } from '@/lib/catalog';

export default function BookPreviewPage() {
  const book = getPreviewBook('as-a-man-thinketh');

  return (
    <main>
      <BookDetail book={book} />
      <PreviewAudioPlayer />
    </main>
  );
}
