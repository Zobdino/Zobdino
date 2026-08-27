"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

type Locale = "fa" | "en";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext =
  createContext<LocaleContextValue | null>(null);

const LOCALE_KEY = "zobdino-locale";
const LOCALE_EVENT = "zobdino-locale-change";

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "fa";

  return window.localStorage.getItem(LOCALE_KEY) === "en"
    ? "en"
    : "fa";
}

function subscribeLocale(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", callback);
  window.addEventListener(LOCALE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LOCALE_EVENT, callback);
  };
}

function applyLocale(locale: Locale) {
  if (typeof document === "undefined") return;

  document.documentElement.lang = locale;
  document.documentElement.dir =
    locale === "fa" ? "rtl" : "ltr";
}

export function LocaleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getStoredLocale,
    () => "fa",
  );

  useEffect(() => {
    applyLocale(locale);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale(next) {
        window.localStorage.setItem(LOCALE_KEY, next);
        applyLocale(next);
        window.dispatchEvent(new Event(LOCALE_EVENT));
      },
    }),
    [locale],
  );

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error(
      "useLocale must be used within LocaleProvider",
    );
  }

  return context;
}
