interface SourceEvidence {
  sourceRef?: string;
  sourceSha256?: string;
  startOffset?: number;
  endOffset?: number;
}

function persianNumber(value: number) {
  return value.toLocaleString("fa-IR");
}

function sourceLabel(sourceRef: string) {
  const page = sourceRef.match(/^page:(\d+)(?::part:(\d+))?$/);
  if (page) {
    const pageNumber = persianNumber(Number(page[1]));
    return page[2]
      ? `صفحه ${pageNumber}، بخش ${persianNumber(Number(page[2]))}`
      : `صفحه ${pageNumber}`;
  }

  const section = sourceRef.match(/^section:(\d+)(?::part:(\d+))?$/);
  if (section) {
    const sectionNumber = persianNumber(Number(section[1]));
    return section[2]
      ? `بخش ${sectionNumber}، قسمت ${persianNumber(Number(section[2]))}`
      : `بخش ${sectionNumber}`;
  }

  if (sourceRef === "document:1") return "متن اصلی";
  return sourceRef;
}

export default function SourceEvidenceList({ evidence }: { evidence?: unknown }) {
  if (!Array.isArray(evidence) || !evidence.length) return null;

  const items = evidence.filter((item): item is SourceEvidence => Boolean(item && typeof item === "object"));
  if (!items.length) return null;

  return (
    <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black text-emerald-700 dark:text-emerald-300">منابع این خلاصه</p>
        <span className="text-[11px] text-zinc-500">{persianNumber(items.length)} شاهد</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item, index) => {
          const sourceRef = String(item.sourceRef ?? `source:${index + 1}`);
          const hasOffsets = Number.isFinite(item.startOffset) && Number.isFinite(item.endOffset);
          const offsetText = hasOffsets
            ? `${persianNumber(Number(item.startOffset))} تا ${persianNumber(Number(item.endOffset))}`
            : "";
          return (
            <span
              key={`${sourceRef}-${index}`}
              className="rounded-full border border-emerald-500/20 bg-white/70 px-3 py-1.5 text-xs font-bold text-zinc-700 dark:bg-black/20 dark:text-zinc-200"
              title={item.sourceSha256 ? `اثر انگشت منبع: ${item.sourceSha256}` : undefined}
            >
              {sourceLabel(sourceRef)}{offsetText ? ` · نویسه ${offsetText}` : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
}
