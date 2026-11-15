"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Avatar from "./Avatar";
import { DEFAULT_PROFILE, getProfile, type Profile } from "@/lib/profile";

const NAV = [
  { href: "/tryout", label: "Tryout" },
  { href: "/latihan", label: "Latihan" },
  { href: "/papan-skor", label: "Skor" },
  { href: "/riwayat", label: "Riwayat" },
];

export default function TopBar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  useEffect(() => {
    setProfile(getProfile());
  }, [pathname]);

  const profileActive = pathname.startsWith("/profil");

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center font-serif text-lg font-semibold tracking-tight"
        >
          TryOutku
        </Link>

        <nav aria-label="Navigasi utama" className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center border-b-2 px-2 text-[13px] font-medium transition-colors sm:px-3 sm:text-sm ${
                  active
                    ? "border-accent text-ink"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/profil"
            aria-label={`Profil ${profile.name || "kamu"}`}
            aria-current={profileActive ? "page" : undefined}
            className={`ml-1 grid h-11 w-11 place-items-center rounded-md border transition-colors ${
              profileActive ? "border-accent bg-accent/10" : "border-line hover:border-ink/40"
            }`}
          >
            <Avatar id={profile.avatarId} name={profile.name} size={28} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
