export const projectStatus = {
  version: "media-v0.2.0-rc.1",
  productionAudio: {
    ready: 5,
    total: 5,
  },
  dualVoice: {
    selectedVoices: [
      "Sulafat / Warm",
      "Schedar / Even",
    ],
    verifiedVariants: 2,
    targetVariants: 10,
    stage:
      "عادت‌های اتمی با هر دو صدای Sulafat و Schedar از QA نهایی عبور کرده، به‌صورت immutable در media-v0.2.0-rc.1 منتشر شده و metadata تأییدشده آن در محصول فعال است. چهار کتاب دیگر تا عبور از همین مسیر QA همچنان با وضعیت قبلی نمایش داده می‌شوند.",
  },
  currentMilestone: {
    title: "Product Completion RC Gate",
    issueNumber: 204,
    issueUrl:
      "https://github.com/Zobdino/Zobdino/issues/204",
  },
  releasesUrl:
    "https://github.com/Zobdino/Zobdino/releases",
} as const;
