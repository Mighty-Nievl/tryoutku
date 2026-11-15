"use client";

import { useEffect, useState } from "react";
import Mascot from "./Mascot";
import { playSound } from "@/lib/sound";
import { getProfile } from "@/lib/profile";
import { BADGES, type LevelInfo } from "@/lib/gamification";

interface Props {
  open: boolean;
  leveledUp: boolean;
  level: LevelInfo;
  newBadges: string[];
  onClose: () => void;
}

const PARTICLES = Array.from({ length: 18 }, (_, i) => i);

/** Perayaan hanya dipicu kejadian nyata: naik level atau lencana baru. */
export default function Celebration({ open, leveledUp, level, newBadges, onClose }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMounted(true);
    playSound("naik", getProfile().sound);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const badges = BADGES.filter((badge) => newBadges.includes(badge.id));

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-ink/55 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {mounted ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 motion-safe:block">
          {PARTICLES.map((i) => (
            <span
              key={i}
              className="absolute top-0 block rounded-sm"
              style={{
                left: `${(i * 5.5 + 4) % 96}%`,
                width: `${8 + (i % 3) * 4}px`,
                height: `${8 + (i % 3) * 4}px`,
                backgroundColor:
                  i % 3 === 0
                    ? "rgb(var(--accent))"
                    : i % 3 === 1
                      ? "rgb(var(--danger))"
                      : "rgb(var(--ok))",
                animation: `fall ${1000 + (i % 5) * 220}ms cubic-bezier(.2,.6,.4,1) ${i * 55}ms forwards`,
              }}
            />
          ))}
        </div>
      ) : null}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="perayaan-judul"
        className="card relative w-full max-w-sm p-6 text-center motion-safe:animate-rise"
      >
        <Mascot mood="senang" size={104} className="mx-auto" />
        <p className="label mt-2">{leveledUp ? "Level baru" : "Pencapaian"}</p>
        <h2 id="perayaan-judul" className="mt-1 font-serif text-2xl font-semibold">
          {leveledUp ? `Level ${level.level}, ${level.name}` : badges[0]?.name ?? "Lencana baru"}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {leveledUp
            ? `Kerja kerasmu terhitung. Total ${level.minXp + level.xpIntoLevel} XP.`
            : "Satu pencapaian lagi terbuka dari riwayat latihanmu."}
        </p>

        {leveledUp && level.nextXp ? (
          <div className="mt-4">
            <div className="flex items-baseline justify-between text-xs text-muted">
              <span>Menuju level berikutnya</span>
              <span className="num">
                {level.xpIntoLevel}/{level.xpForLevel} XP
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-sm bg-line">
              <div
                className="h-full bg-accent transition-[width] duration-700"
                style={{ width: `${Math.max(4, level.progress * 100)}%` }}
              />
            </div>
          </div>
        ) : null}

        {badges.length > 0 ? (
          <ul className="mt-4 space-y-2 text-left">
            {badges.map((badge) => (
              <li
                key={badge.id}
                className="flex items-center gap-3 rounded-md border border-accent/40 bg-accent/10 px-3 py-2"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-accent text-xs font-bold text-paper">
                  {badge.mark}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{badge.name}</span>
                  <span className="block text-xs text-muted">{badge.description}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <button type="button" className="btn-primary mt-5 w-full" onClick={onClose} autoFocus>
          Lanjut
        </button>
      </div>

      <style>{`@keyframes fall { 0% { transform: translateY(-10px) rotate(0deg); opacity: 1; } 100% { transform: translateY(90vh) rotate(540deg); opacity: 0; } }`}</style>
    </div>
  );
}
