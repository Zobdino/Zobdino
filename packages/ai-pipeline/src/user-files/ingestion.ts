import type {
  UserFileFormat,
  UserFileSource,
} from "./contracts.ts";

export interface UserFileExtraction {
  format: UserFileFormat;
  strategy:
    | "inline-text"
    | "existing-pdf-extractor"
    | "existing-epub-extractor";
  sections: Array<{
    index: number;
    sourceRef: string;
    text: string;
  }>;
  characterCount: number;
}

export function resolveExtractionStrategy(
  format: UserFileFormat,
): UserFileExtraction["strategy"] {
  if (format === "txt" || format === "markdown") {
    return "inline-text";
  }

  if (format === "pdf") {
    return "existing-pdf-extractor";
  }

  if (format === "epub") {
    return "existing-epub-extractor";
  }

  throw new Error(
    `No runtime extraction strategy for ${format}.`,
  );
}

export function extractInlineText(
  source: UserFileSource,
  bytes: Uint8Array,
): UserFileExtraction {
  if (
    source.format !== "txt" &&
    source.format !== "markdown"
  ) {
    throw new Error(
      `Inline extraction does not support ${source.format}.`,
    );
  }

  const text = new TextDecoder("utf-8", {
    fatal: true,
  })
    .decode(bytes)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  if (!text) {
    throw new Error("Extracted text is empty.");
  }

  const sections = text
    .split(/\n{2,}/)
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value, index) => ({
      index,
      sourceRef: `block:${index + 1}`,
      text: value,
    }));

  return {
    format: source.format,
    strategy: "inline-text",
    sections,
    characterCount: sections.reduce(
      (sum, section) => sum + section.text.length,
      0,
    ),
  };
}
