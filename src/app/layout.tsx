import type { Metadata } from "next";
import type { ReactNode } from "react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { LocaleProvider } from "@/components/LocaleProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import GlobalMiniPlayer from "@/components/player/GlobalMiniPlayer";
import PlayerProvider from "@/components/player/PlayerProvider";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://zobdino.ir"),
  title: "Zobdino | خلاصه، شواهد و صوت فارسی",
  description:
    "زبدینو کتاب‌ها و فایل‌ها را به خلاصه ساختاریافته، شواهد قابل بررسی و تجربه صوتی فارسی تبدیل می‌کند.",
  applicationName: "Zobdino",
  icons: {
    icon: [{ url: "/brand/zobdino-mark-v2.svg", type: "image/svg+xml" }],
    shortcut: "/brand/zobdino-mark-v2.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <LocaleProvider>
            <PlayerProvider>
              <Header />
              <main className="min-h-screen">{children}</main>
              <Footer />
              <GlobalMiniPlayer />
            </PlayerProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
