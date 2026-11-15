"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getHistory } from "@/lib/storage";
import { computeStreak, summarize, unlockedBadges, BADGES } from "@/lib/gamification";
import type { Attempt } from "@/lib/types";
import LevelBar from "./LevelBar";

const DAY_LABELS = ["S", "S", "R", "K", "J", "S", "M"];

function lastSevenDays(attempts: Attempt[]): { label: string; active: boolean }[] {
  const days = new Set(
    attempts.map((attempt) => {
      const date = new Date(attempt.createdAt);
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    })
  );
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return { label: DAY_LABELS[date.getDay()], active: days.has(key) };
  });
}

/** Ringkasan progres: level, streak tujuh hari, dan lencana yang sudah terbuka. */
export default function ProgressPanel() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setAttempts(getHistory());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  const stats = summarize(attempts);
  const streak = computeStreak(attempts);
  const owned = unlockedBadges(stats);
  const preview = BADGES.filter((badge) => owned.includes(badge.id)).slice(0, 3);
  const week = lastSevenDays(attempts);

  return (
    <div>
      <LevelBar />

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <div>
          <p className="label">Streak</p>
          <p className="num mt-0.5 font-serif text-xl font-semibold">{streak.current} hari</p>
        </div>
        <div className="flex items-end gap-1.5" aria-hidden="true">
          {week.map((day, i) => (
            <span key={i} className="flex flex-col items-center gap-1">
              <span
                className={`motion-pop grid h-7 w-7 place-items-center rounded-sm border text-[10px] font-semibold ${
                  day.active
                    ? "border-accent bg-accent text-paper"
                    : "border-line text-muted"
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {day.label}
              </span>
            </span>
          ))}
        </div>
        <p className="text-xs text-muted">
          {streak.current === 0
            ? "Belum ada sesi hari ini."
            : streak.current === 1
              ? "Sesi pertama hari ini sudah tercatat."
              : `Sudah ${streak.current} hari berturut-turut.`}
        </p>
      </div>

      <div className="mt-5">
        <p className="label">Lencana terbuka</p>
        {preview.length === 0 ? (
          <p className="mt-1.5 text-sm text-muted">
            Belum ada. Lencana pertama terbuka setelah kamu menyelesaikan satu sesi.
          </p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {preview.map((badge) => (
              <li
                key={badge.id}
                className="flex items-center gap-2 rounded-sm border border-accent/40 bg-accent/10 px-2 py-1 text-xs"
              >
                <span className="grid h-6 w-6 place-items-center rounded-sm bg-accent text-[10px] font-bold text-paper">
                  {badge.mark}
                </span>
                {badge.name}
              </li>
            ))}
            {owned.length > preview.length ? (
              <li className="flex items-center px-1 text-xs text-muted">
                +{owned.length - preview.length} lagi
              </li>
            ) : null}
          </ul>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link href="/tantangan" className="btn-primary">
          Tantangan harian
        </Link>
        <Link href="/profil" className="text-sm font-medium text-muted hover:text-ink">
          Lihat semua lencana dan atur profil
        </Link>
      </div>
    </div>
  );
}
