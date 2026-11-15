"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

const NAV = [
  { href: "/tryout", label: "Tryout" },
  { href: "/latihan", label: "Latihan" },
  { href: "/papan-skor", label: "Skor" },
  { href: "/riwayat", label: "Riwayat" },
];

export default function TopBar() {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-accent text-sm font-extrabold text-white">
            T
          </span>
          <span className="hidden font-display text-base font-extrabold tracking-tight min-[370px]:inline sm:text-lg">
            TryOut<span className="text-brand">ku</span>
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-2 py-2 text-[13px] font-medium transition sm:px-3 sm:text-sm ${
                  active ? "bg-raised text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={toggle}
            aria-label="Ganti tema"
            className="ml-0.5 grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:text-ink sm:ml-1 sm:h-9 sm:w-9"
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </nav>
      </div>
    </header>
  );
}
