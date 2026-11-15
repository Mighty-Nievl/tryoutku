"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "kertas" | "putih" | "gelap" | "oled";

export interface ThemeMeta {
  id: Theme;
  label: string;
  hint: string;
  dark: boolean;
  /** warna bilah peramban di ponsel */
  chrome: string;
}

export const THEMES: ThemeMeta[] = [
  { id: "kertas", label: "Kertas", hint: "Krem hangat, seperti kertas ujian.", dark: false, chrome: "#F6F2E9" },
  { id: "putih", label: "Putih", hint: "Putih bersih dengan garis tipis.", dark: false, chrome: "#FFFFFF" },
  { id: "gelap", label: "Gelap", hint: "Abu gelap, tidak menyilaukan malam.", dark: true, chrome: "#161613" },
  { id: "oled", label: "OLED", hint: "Hitam pekat, hemat daya di layar OLED.", dark: true, chrome: "#000000" },
];

const KEY = "tryoutku:theme";
const IDS = THEMES.map((item) => item.id);

interface ThemeValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeValue>({ theme: "kertas", setTheme: () => {} });

/** Nilai lama ("light"/"dark") tetap dikenali supaya pilihan pengguna tidak hilang. */
export function normalizeTheme(value: string | null | undefined): Theme {
  if (value === "light") return "kertas";
  if (value === "dark") return "gelap";
  if (value && (IDS as string[]).includes(value)) return value as Theme;
  return "kertas";
}

export function applyTheme(theme: Theme) {
  const meta = THEMES.find((item) => item.id === theme) ?? THEMES[0];
  const root = document.documentElement;
  root.dataset.theme = meta.id;
  root.classList.toggle("dark", meta.dark);
  let tag = document.querySelector('meta[name="theme-color"]');
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", "theme-color");
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", meta.chrome);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("kertas");

  useEffect(() => {
    const stored = normalizeTheme(window.localStorage.getItem(KEY));
    setThemeState(stored);
    applyTheme(stored);
  }, []);

  function setTheme(next: Theme) {
    setThemeState(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // Mode privat: pilihan tidak bertahan, tampilan tetap berubah untuk sesi ini.
    }
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
