import { extractDocxText } from "@/lib/docx-browser";
import { extractEpubText } from "@/lib/epub-browser";
import { extractPdfText } from "@/lib/pdf-browser";

export type IngestionMode = "full-audio" | "summary-podcast" | "both";
export type IngestionVoice = "sulafat" | "schedar";

export interface BrowserSection {
  sectionIndex: number;
  sourceRef: string;
  text: string;
}

export function supportedTextFile(file: Pick<File, "name" | "type">) {
  const name = file.name.toLowerCase();
  return name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".docx") ||
    name.endsWith(".epub") || name.endsWith(".pdf") ||
    file.type === "text/plain" || file.type === "text/markdown" ||
    file.type === "application/pdf" || file.type === "application/epub+zip" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

export async function readBrowserDocumentText(file: File) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return extractDocxText(file);
  }
  if (name.endsWith(".epub") || file.type === "application/epub+zip") {
    return extractEpubText(file);
  }
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    return extractPdfText(file);
  }
  return file.text();
}

function chunkSection(text: string, sourceRef: string, sections: BrowserSection[], limit: number) {
  for (let offset = 0; offset < text.length; offset += limit) {
    const chunk = text.slice(offset, offset + limit).trim();
    if (!chunk) continue;
    sections.push({
      sectionIndex: sections.length,
      sourceRef: offset === 0 ? sourceRef : `${sourceRef}:part:${Math.floor(offset / limit) + 1}`,
      text: chunk,
    });
  }
}

export function sectionText(value: string, limit = 22000): BrowserSection[] {
  const normalized = value.replace(/\r\n?/g, "\n").trim();
  if (!normalized) return [];

  if (normalized.includes("\f")) {
    const sections: BrowserSection[] = [];
    normalized.split("\f").forEach((pageText, pageIndex) => {
      const text = pageText.trim();
      if (text) chunkSection(text, `page:${pageIndex + 1}`, sections, limit);
    });
    return sections;
  }

  const blocks = normalized.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  const sections: BrowserSection[] = [];
  let current = "";

  for (const block of blocks) {
    if (current && current.length + block.length + 2 > limit) {
      sections.push({ sectionIndex: sections.length, sourceRef: `section:${sections.length + 1}`, text: current });
      current = "";
    }
    if (block.length > limit) {
      chunkSection(block, `section:${sections.length + 1}`, sections, limit);
    } else {
      current = current ? `${current}\n\n${block}` : block;
    }
  }
  if (current) sections.push({ sectionIndex: sections.length, sourceRef: `section:${sections.length + 1}`, text: current });
  return sections;
}

export function canonicalSections(sections: BrowserSection[]) {
  return [...sections].sort((a, b) => a.sectionIndex - b.sectionIndex)
    .map((section) => `${section.sectionIndex}:${section.sourceRef}\n${section.text}`).join("\n\n");
}

export async function sha256(value: string | ArrayBuffer) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
