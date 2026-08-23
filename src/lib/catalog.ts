import { previewBooks } from "@/content/preview-books";

export function getPreviewCatalog() {
  return previewBooks;
}

export function getPreviewBook(id: string) {
  return previewBooks.find((book) => book.id === id);
}
