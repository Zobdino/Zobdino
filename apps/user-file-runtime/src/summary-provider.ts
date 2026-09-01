export interface SummaryResult {
  text: string;
  provider: string;
  model: string;
}

export interface SummaryProvider {
  summarize(text: string): Promise<SummaryResult>;
}

export function offlinePersianSummaryProvider(): SummaryProvider {
  return {
    async summarize(text) {
      const source = text.trim();
      if (!source) throw new Error("summary-source-empty");
      const compact = source.replace(/\s+/g, " ").slice(0, 1200);
      return {
        text: `خلاصهٔ آزمایشی زبدینو: ${compact}`,
        provider: "offline-test",
        model: "deterministic-summary-v1",
      };
    },
  };
}
