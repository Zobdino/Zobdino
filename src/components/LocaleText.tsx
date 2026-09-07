"use client";

import { useLocale } from "@/components/LocaleProvider";

export default function LocaleText({ fa, en }: { fa: React.ReactNode; en: React.ReactNode }) {
  const { locale } = useLocale();
  return <>{locale === "fa" ? fa : en}</>;
}
