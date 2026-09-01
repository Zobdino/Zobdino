const PDFJS_VERSION = "6.2.108";
const PDFJS_MODULE_URL = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.min.mjs`;
const PDFJS_WORKER_URL = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;
const MAX_PDF_BYTES = 20 * 1024 * 1024;
const MAX_PDF_PAGES = 300;
const MAX_PDF_CHARACTERS = 3_000_000;

type PdfTextItem = { str?: unknown; hasEOL?: unknown };
type PdfPage = { getTextContent(): Promise<{ items: PdfTextItem[] }> };
type PdfDocument = { numPages: number; getPage(pageNumber: number): Promise<PdfPage>; destroy(): Promise<void> | void };
type PdfJsModule = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument(input: Record<string, unknown>): { promise: Promise<PdfDocument> };
};

async function loadPdfJs(): Promise<PdfJsModule> {
  if (typeof window === "undefined") throw new Error("pdf-browser-only");
  const moduleUrl = PDFJS_MODULE_URL;
  const pdfjs = await import(/* webpackIgnore: true */ moduleUrl) as unknown as PdfJsModule;
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
  return pdfjs;
}

function normalizePageText(items: PdfTextItem[]) {
  const lines: string[] = [];
  let current = "";
  for (const item of items) {
    const value = typeof item.str === "string" ? item.str.replace(/\s+/g, " ").trim() : "";
    if (value) current = current ? `${current} ${value}` : value;
    if (item.hasEOL && current) {
      lines.push(current);
      current = "";
    }
  }
  if (current) lines.push(current);
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function extractPdfText(file: File) {
  if (file.size > MAX_PDF_BYTES) throw new Error("pdf-too-large");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.length < 5 || new TextDecoder().decode(bytes.subarray(0, 5)) !== "%PDF-") {
    throw new Error("pdf-invalid-signature");
  }

  const header = new TextDecoder("latin1").decode(bytes.subarray(0, Math.min(bytes.length, 2_000_000)));
  if (/\/Encrypt\b/.test(header)) throw new Error("pdf-encrypted-or-drm");

  const pdfjs = await loadPdfJs();
  const document = await pdfjs.getDocument({
    data: bytes,
    isEvalSupported: false,
    stopEvent: true,
  }).promise;

  try {
    if (!Number.isSafeInteger(document.numPages) || document.numPages < 1 || document.numPages > MAX_PDF_PAGES) {
      throw new Error("pdf-page-limit");
    }

    const pages: string[] = [];
    let characterCount = 0;
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const text = normalizePageText((await page.getTextContent()).items);
      characterCount += text.length;
      if (characterCount > MAX_PDF_CHARACTERS) throw new Error("pdf-character-limit");
      pages.push(text);
    }

    if (!pages.some((page) => page.length >= 8)) throw new Error("pdf-ocr-required");
    return pages.join("\f");
  } finally {
    await document.destroy();
  }
}
