import { CatalogGrid } from "@/components/preview/CatalogGrid";
import { previewBooks } from "@/content/preview-books";

export default function CatalogPage() {
  return (
    <main>
      <h1>Zobdino Catalog Preview</h1>
      <CatalogGrid books={previewBooks} />
    </main>
  );
}
