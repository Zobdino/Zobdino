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
    icon: "/favicon.svg",
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
