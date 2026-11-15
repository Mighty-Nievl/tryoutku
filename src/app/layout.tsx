import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import TopBar from "@/components/TopBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tryoutku.vercel.app"),
  title: {
    default: "TryOutku - Simulasi Ujian SMA & UTBK SNBT",
    template: "%s | TryOutku",
  },
  description:
    "Tryout online gratis untuk persiapan UTBK SNBT dan ujian sekolah SMA. Puluhan paket soal, timer, pembahasan tiap soal, dan analisis hasil.",
  keywords: [
    "tryout sna",
    "tryout SNBT",
    "UTBK",
    "ujian sekolah SMA",
    "latihan soal SMA",
    "tryout online gratis",
  ],
  authors: [{ name: "Rezal Helvin Bramantara" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "TryOutku",
    title: "TryOutku - Simulasi Ujian SMA & UTBK SNBT",
    description:
      "Latihan soal bergaya ujian asli: timer, pembahasan, dan analisis per subtes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} ${jakarta.variable} font-sans antialiased`}>
        <ThemeProvider>
          <TopBar />
          <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
