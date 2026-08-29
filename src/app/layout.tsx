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
  title: "Zobdino | AI Audio Intelligence for Documents",
  description:
    "Zobdino turns documents and books into structured summaries, full audio, and intelligent listening experiences.",
  applicationName: "Zobdino",
  icons: {
    icon: [
      {
        url: "/favicon.png",
        type: "image/png",
        sizes: "48x48",
      },
      {
        url: "/brand/zobdino-icon-192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: "/brand/zobdino-icon-512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
    shortcut: "/favicon.png",
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
