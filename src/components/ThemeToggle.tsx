"use client";

import { THEMES, useTheme } from "./ThemeProvider";

/**
 * Pemilih tema: empat pilihan, bukan tombol bolak-balik, supaya pengguna
 * tidak perlu menebak berapa kali harus menekan untuk sampai ke tema tertentu.
 */
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Tema tampilan"
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {THEMES.map((item) => {
          const active = theme === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(item.id)}
              className={`flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors ${
                active
                  ? "border-accent bg-accent/10 text-ink"
                  : "border-line text-muted hover:border-ink/30 hover:text-ink"
              }`}
            >
              <span
                aria-hidden="true"
                className="h-4 w-4 shrink-0 rounded-sm border border-line"
                style={{ background: item.chrome }}
              />
              {item.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted">
        {THEMES.find((item) => item.id === theme)?.hint ?? ""}
      </p>
    </div>
  );
}
