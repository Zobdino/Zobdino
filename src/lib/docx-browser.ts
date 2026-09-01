const DOCX_DOCUMENT_PATH = "word/document.xml";
const MAX_DOCX_ENTRY_BYTES = 16 * 1024 * 1024;

function readU16(view: DataView, offset: number) {
  return view.getUint16(offset, true);
}

function readU32(view: DataView, offset: number) {
  return view.getUint32(offset, true);
}

interface ZipEntry {
  name: string;
  compressionMethod: number;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
}

function findEndOfCentralDirectory(bytes: Uint8Array) {
  const minOffset = Math.max(0, bytes.length - 65_557);
  for (let offset = bytes.length - 22; offset >= minOffset; offset -= 1) {
    if (
      bytes[offset] === 0x50 &&
      bytes[offset + 1] === 0x4b &&
      bytes[offset + 2] === 0x05 &&
      bytes[offset + 3] === 0x06
    ) return offset;
  }
  return -1;
}

function findZipEntry(bytes: Uint8Array, targetName: string): ZipEntry | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocd = findEndOfCentralDirectory(bytes);
  if (eocd < 0) throw new Error("docx-invalid-zip");

  const entryCount = readU16(view, eocd + 10);
  let offset = readU32(view, eocd + 16);
  const decoder = new TextDecoder();

  for (let index = 0; index < entryCount; index += 1) {
    if (offset + 46 > bytes.length || readU32(view, offset) !== 0x02014b50) {
      throw new Error("docx-invalid-central-directory");
    }

    const compressionMethod = readU16(view, offset + 10);
    const compressedSize = readU32(view, offset + 20);
    const uncompressedSize = readU32(view, offset + 24);
    const nameLength = readU16(view, offset + 28);
    const extraLength = readU16(view, offset + 30);
    const commentLength = readU16(view, offset + 32);
    const localHeaderOffset = readU32(view, offset + 42);
    const nameStart = offset + 46;
    const nameEnd = nameStart + nameLength;
    if (nameEnd > bytes.length) throw new Error("docx-invalid-entry-name");
    const name = decoder.decode(bytes.subarray(nameStart, nameEnd));

    if (name === targetName) {
      if (uncompressedSize > MAX_DOCX_ENTRY_BYTES) throw new Error("docx-document-too-large");
      return { name, compressionMethod, compressedSize, uncompressedSize, localHeaderOffset };
    }
    offset = nameEnd + extraLength + commentLength;
  }
  return null;
}

async function inflateRaw(data: Uint8Array) {
  if (typeof DecompressionStream === "undefined") throw new Error("docx-decompression-unavailable");
  const stream = new Blob([Uint8Array.from(data)]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function readZipEntry(bytes: Uint8Array, entry: ZipEntry) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const offset = entry.localHeaderOffset;
  if (offset + 30 > bytes.length || readU32(view, offset) !== 0x04034b50) {
    throw new Error("docx-invalid-local-header");
  }
  const nameLength = readU16(view, offset + 26);
  const extraLength = readU16(view, offset + 28);
  const start = offset + 30 + nameLength + extraLength;
  const end = start + entry.compressedSize;
  if (start < 0 || end > bytes.length) throw new Error("docx-invalid-entry-data");
  const compressed = bytes.subarray(start, end);

  if (entry.compressionMethod === 0) return Uint8Array.from(compressed);
  if (entry.compressionMethod === 8) return inflateRaw(compressed);
  throw new Error("docx-unsupported-compression");
}

function documentXmlToText(xml: string) {
  const parser = new DOMParser();
  const document = parser.parseFromString(xml, "application/xml");
  if (document.querySelector("parsererror")) throw new Error("docx-invalid-document-xml");

  const paragraphs = Array.from(document.getElementsByTagNameNS("*", "p"));
  const text = paragraphs.map((paragraph) => {
    const parts: string[] = [];
    for (const node of Array.from(paragraph.getElementsByTagNameNS("*", "t"))) {
      if (node.textContent) parts.push(node.textContent);
    }
    return parts.join("").trim();
  }).filter(Boolean).join("\n\n").trim();

  if (!text) throw new Error("docx-empty-document");
  return text;
}

export async function extractDocxText(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.length < 4 || bytes[0] !== 0x50 || bytes[1] !== 0x4b) throw new Error("docx-invalid-file");
  const entry = findZipEntry(bytes, DOCX_DOCUMENT_PATH);
  if (!entry) throw new Error("docx-document-part-missing");
  const xmlBytes = await readZipEntry(bytes, entry);
  if (xmlBytes.length > MAX_DOCX_ENTRY_BYTES) throw new Error("docx-document-too-large");
  return documentXmlToText(new TextDecoder("utf-8").decode(xmlBytes));
}
