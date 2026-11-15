"use client";

import { useEffect, useState } from "react";
import { getHistory } from "@/lib/storage";
import { levelFor, totalXp, computeStreak, xpForAttempt } from "@/lib/gamification";
import type { Attempt } from "@/lib/types";

/** Bar level ringkas untuk header dan landing. */
export default function LevelBar({ compact = false }: { compact?: boolean }) {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setAttempts(getHistory());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return <div className="h-11" aria-hidden="true" />;
  }

  const xp = totalXp(attempts);
  const level = levelFor(xp);
  const streak = computeStreak(attempts).current;

  if (compact) {
    return (
      <div className="flex items-center gap-2.5">
        <span className="num rounded-sm border border-accent/40 bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
          Lv {level.level} {level.name}
        </span>
        <span className="num flex items-center gap-1 text-xs text-muted" title="Streak harian">
          <span aria-hidden="true">●</span>
          {streak} hari
        </span>
        <span className="num text-xs text-muted">{xp} XP</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold">
          Level {level.level}, {level.name}
        </p>
        <p className="num text-xs text-muted">
          {level.nextXp ? `${xp} dari ${level.nextXp} XP` : `${xp} XP, level tertinggi`}
        </p>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-sm bg-line"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(level.progress * 100)}
        aria-label="Progres menuju level berikutnya"
      >
        <div
          className="h-full bg-accent transition-[width] duration-500"
          style={{ width: `${Math.max(2, level.progress * 100)}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-muted">
        {level.nextXp
          ? `${Math.max(0, level.nextXp - xp)} XP lagi untuk naik level.`
          : "Kamu sudah di level tertinggi."}
      </p>
    </div>
  );
}
