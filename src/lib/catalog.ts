export type PreviewBook = {
  id: string;
  title: string;
  language: string;
  summaryPreview: string;
  voices: string[];
  status: 'preview';
};

const previewBooks: PreviewBook[] = [
  {
    id: 'as-a-man-thinketh',
    title: 'As a Man Thinketh',
    language: 'fa',
    summaryPreview: 'خلاصه پیش‌نمایش کتاب',
    voices: ['Sulafat', 'Iapetus'],
    status: 'preview',
  },
];

export function getPreviewCatalog() {
  return previewBooks;
}

export function getPreviewBook(id: string) {
  return previewBooks.find((book) => book.id === id);
}
