const CONTAINER_PATH = "META-INF/container.xml";
const MAX_ENTRY_BYTES = 16 * 1024 * 1024;
const MAX_EPUB_ENTRIES = 4096;

interface ZipEntry {
  name: string;
  compressionMethod: number;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
}

function readU16(view: DataView, offset: number) {
  return view.getUint16(offset, true);
}

function readU32(view: DataView, offset: number) {
  return view.getUint32(offset, true);
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

function listZipEntries(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocd = findEndOfCentralDirectory(bytes);
  if (eocd < 0) throw new Error("epub-invalid-zip");

  const entryCount = readU16(view, eocd + 10);
  if (entryCount > MAX_EPUB_ENTRIES) throw new Error("epub-too-many-entries");

  let offset = readU32(view, eocd + 16);
  const decoder = new TextDecoder();
  const entries = new Map<string, ZipEntry>();

  for (let index = 0; index < entryCount; index += 1) {
    if (offset + 46 > bytes.length || readU32(view, offset) !== 0x02014b50) {
      throw new Error("epub-invalid-central-directory");
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
    if (nameEnd > bytes.length) throw new Error("epub-invalid-entry-name");
    const name = decoder.decode(bytes.subarray(nameStart, nameEnd));
    if (uncompressedSize > MAX_ENTRY_BYTES) throw new Error("epub-entry-too-large");
    entries.set(name, { name, compressionMethod, compressedSize, uncompressedSize, localHeaderOffset });
    offset = nameEnd + extraLength + commentLength;
  }
  return entries;
}

async function inflateRaw(data: Uint8Array) {
  if (typeof DecompressionStream === "undefined") throw new Error("epub-decompression-unavailable");
  const stream = new Blob([Uint8Array.from(data)]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function readZipEntry(bytes: Uint8Array, entry: ZipEntry) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const offset = entry.localHeaderOffset;
  if (offset + 30 > bytes.length || readU32(view, offset) !== 0x04034b50) {
    throw new Error("epub-invalid-local-header");
  }
  const nameLength = readU16(view, offset + 26);
  const extraLength = readU16(view, offset + 28);
  const start = offset + 30 + nameLength + extraLength;
  const end = start + entry.compressedSize;
  if (end > bytes.length) throw new Error("epub-invalid-entry-data");
  const compressed = bytes.subarray(start, end);
  if (entry.compressionMethod === 0) return Uint8Array.from(compressed);
  if (entry.compressionMethod === 8) return inflateRaw(compressed);
  throw new Error("epub-unsupported-compression");
}

function parseXml(xml: string, errorCode: string) {
  const parser = new DOMParser();
  const document = parser.parseFromString(xml, "application/xml");
  if (document.querySelector("parsererror")) throw new Error(errorCode);
  return document;
}

function dirname(path: string) {
  const slash = path.lastIndexOf("/");
  return slash < 0 ? "" : path.slice(0, slash + 1);
}

function normalizePath(path: string) {
  const stack: string[] = [];
  for (const part of path.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") stack.pop();
    else stack.push(part);
  }
  return stack.join("/");
}

function xhtmlToText(xhtml: string) {
  const parser = new DOMParser();
  const document = parser.parseFromString(xhtml, "text/html");
  for (const node of Array.from(document.querySelectorAll("script,style,nav"))) node.remove();
  const blocks = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6,p,li,blockquote,pre"))
    .map((node) => node.textContent?.replace(/\s+/g, " ").trim() ?? "")
    .filter(Boolean);
  return blocks.join("\n\n").trim();
}

export async function extractEpubText(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.length < 4 || bytes[0] !== 0x50 || bytes[1] !== 0x4b) throw new Error("epub-invalid-file");
  const entries = listZipEntries(bytes);

  const containerEntry = entries.get(CONTAINER_PATH);
  if (!containerEntry) throw new Error("epub-container-missing");
  const containerXml = new TextDecoder("utf-8").decode(await readZipEntry(bytes, containerEntry));
  const container = parseXml(containerXml, "epub-invalid-container");
  const rootfile = container.getElementsByTagNameNS("*", "rootfile")[0];
  const packagePath = rootfile?.getAttribute("full-path")?.trim();
  if (!packagePath) throw new Error("epub-package-path-missing");

  const packageEntry = entries.get(packagePath);
  if (!packageEntry) throw new Error("epub-package-missing");
  const packageXml = new TextDecoder("utf-8").decode(await readZipEntry(bytes, packageEntry));
  const packageDoc = parseXml(packageXml, "epub-invalid-package");
  const base = dirname(packagePath);

  const manifest = new Map<string, string>();
  for (const item of Array.from(packageDoc.getElementsByTagNameNS("*", "item"))) {
    const id = item.getAttribute("id")?.trim();
    const href = item.getAttribute("href")?.trim();
    if (id && href) manifest.set(id, normalizePath(`${base}${decodeURIComponent(href.split("#")[0])}`));
  }

  const chapterTexts: string[] = [];
  for (const itemref of Array.from(packageDoc.getElementsByTagNameNS("*", "itemref"))) {
    const idref = itemref.getAttribute("idref")?.trim();
    if (!idref) continue;
    const chapterPath = manifest.get(idref);
    if (!chapterPath) continue;
    const chapterEntry = entries.get(chapterPath);
    if (!chapterEntry) continue;
    const text = xhtmlToText(new TextDecoder("utf-8").decode(await readZipEntry(bytes, chapterEntry)));
    if (text) chapterTexts.push(text);
  }

  const result = chapterTexts.join("\n\n").trim();
  if (!result) throw new Error("epub-empty-document");
  return result;
}
