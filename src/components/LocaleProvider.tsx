"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Locale = "fa" | "en";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fa");

  useEffect(() => {
    const saved = localStorage.getItem("zobdino-locale") as Locale | null;
    const initial = saved ?? "fa";
    setLocaleState(initial);
    document.documentElement.lang = initial;
    document.documentElement.dir = initial === "fa" ? "rtl" : "ltr";
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale: (next: Locale) => {
        setLocaleState(next);
        localStorage.setItem("zobdino-locale", next);
        document.documentElement.lang = next;
        document.documentElement.dir = next === "fa" ? "rtl" : "ltr";
      },
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}
