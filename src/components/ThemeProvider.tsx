"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_KEY = "zobdino-theme";
const THEME_EVENT = "zobdino-theme-change";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";

  const value = window.localStorage.getItem(THEME_KEY);

  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }

  return "system";
}

function subscribeTheme(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", callback);
  window.addEventListener(THEME_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_EVENT, callback);
  };
}

function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;

  const systemDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;

  const dark =
    theme === "dark" ||
    (theme === "system" && systemDark);

  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getStoredTheme,
    () => "system",
  );

  useEffect(() => {
    applyTheme(theme);

    const media = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    const onSystemChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    media.addEventListener("change", onSystemChange);

    return () => {
      media.removeEventListener("change", onSystemChange);
    };
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme(next) {
        window.localStorage.setItem(THEME_KEY, next);
        applyTheme(next);
        window.dispatchEvent(new Event(THEME_EVENT));
      },
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used within ThemeProvider",
    );
  }

  return context;
}
