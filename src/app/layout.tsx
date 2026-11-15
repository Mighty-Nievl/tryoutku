import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import TopBar from "@/components/TopBar";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
  display: "swap",
});

const serif = IBM_Plex_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["500", "600", "700"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tryoutku.pages.dev"),
  title: {
    default: "TryOutku - Simulasi Ujian SMA & UTBK SNBT",
    template: "%s | TryOutku",
  },
  description:
    "Tryout daring untuk persiapan UTBK SNBT dan ujian sekolah SMA: timer, penilaian otomatis, dan pembahasan tiap butir.",
  keywords: [
    "tryout SNBT",
    "UTBK",
    "ujian sekolah SMA",
    "latihan soal SMA",
    "tryout online",
  ],
  authors: [{ name: "Rezal Helvin Bramantara" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "TryOutku",
    title: "TryOutku - Simulasi Ujian SMA & UTBK SNBT",
    description: "Latihan soal bergaya ujian: timer, pembahasan, dan analisis per subtes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${sans.variable} ${serif.variable} ${mono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <TopBar />
          <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
