import { CatalogGrid } from '@/components/preview/CatalogGrid';
import { getPreviewCatalog } from '@/lib/catalog';

export default function CatalogPage() {
  const books = getPreviewCatalog();

  return (
    <main>
      <h1>Zobdino Preview Catalog</h1>
      <CatalogGrid books={books} />
    </main>
  );
}
