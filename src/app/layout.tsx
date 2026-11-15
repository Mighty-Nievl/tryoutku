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
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "TryOutku",
    title: "TryOutku - Latihan Soal UTBK SNBT & Ujian Sekolah SMA",
    description:
      "198 soal berisi kunci dan pembahasan. Timer bisa diubah, hasil dipecah per subtes, tanpa akun dan tanpa biaya.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "TryOutku: latihan soal dengan timer, lengkap dengan pembahasan.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TryOutku - Latihan Soal UTBK SNBT & Ujian Sekolah SMA",
    description:
      "198 soal berisi kunci dan pembahasan. Timer bisa diubah, hasil dipecah per subtes, tanpa akun dan tanpa biaya.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${sans.variable} ${serif.variable} ${mono.variable} font-sans antialiased`}>
        {/* Tema dipasang sebelum konten digambar supaya tidak berkedip saat memuat. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var m={light:"kertas",dark:"gelap"};var k=localStorage.getItem("tryoutku:theme");k=m[k]||k;if(["kertas","putih","gelap","oled"].indexOf(k)<0)k="kertas";var c={kertas:"#F6F2E9",putih:"#FFFFFF",gelap:"#161613",oled:"#000000"}[k];var d=document.documentElement;d.dataset.theme=k;if(k==="gelap"||k==="oled")d.classList.add("dark");var t=document.querySelector(\'meta[name="theme-color"]\');if(!t){t=document.createElement("meta");t.setAttribute("name","theme-color");document.head.appendChild(t);}t.setAttribute("content",c);}catch(e){}})();',
          }}
        />
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:border focus:border-accent focus:bg-surface focus:px-4 focus:py-2 focus:text-sm"
        >
          Lewati ke konten utama
        </a>
        <ThemeProvider>
          <TopBar />
          <main id="konten" className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
