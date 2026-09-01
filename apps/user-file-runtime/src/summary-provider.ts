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

export function geminiPersianSummaryProvider(apiKey: string): SummaryProvider {
  const key = apiKey.trim();
  if (!key) throw new Error("gemini-api-key-not-configured");

  return {
    async summarize(text) {
      const source = text.trim();
      if (!source) throw new Error("summary-source-empty");

      const model = "gemini-2.5-flash";
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text: [
                "متن زیر را به فارسی روان، دقیق و وفادار به منبع خلاصه کن.",
                "خلاصه باید برای شنیدن مناسب باشد، نکات کلیدی را حفظ کند و اطلاعاتی خارج از متن اضافه نکند.",
                "خروجی فقط متن خلاصه باشد.",
                "",
                source.slice(0, 120000),
              ].join("\n"),
            }],
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096,
          },
        }),
      });

      if (response.status === 429) {
        const error = new Error("summary-provider-quota-exhausted");
        Object.assign(error, { status: 429 });
        throw error;
      }
      if (!response.ok) {
        throw new Error(`summary-provider-http-${response.status}`);
      }

      const payload = await response.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const summary = payload.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("\n")
        .trim();

      if (!summary) throw new Error("summary-provider-empty-response");
      return {
        text: summary,
        provider: "gemini",
        model,
      };
    },
  };
}
