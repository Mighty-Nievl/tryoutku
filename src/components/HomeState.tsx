"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ResumeBanner from "./ResumeBanner";
import { getHistory } from "@/lib/storage";
import { levelFor, summarize, weakestSubtest, type GameStats } from "@/lib/gamification";
import { SUBTEST_BY_ID } from "@/lib/subtests";
import type { WeakSpot } from "@/lib/gamification";
import { DRAFT_PREFIX, PRACTICE_DRAFT_PREFIX } from "@/lib/keys";

interface State {
  stats: GameStats;
  weakest: WeakSpot | null;
  adaDraft: boolean;
}

/**
 * Keadaan pengguna di beranda. Pengunjung baru tidak melihat apa pun di sini,
 * jadi halaman tidak diawali panel progres kosong.
 */
export default function HomeState() {
  const [state, setState] = useState<State | null>(null);

  useEffect(() => {
    const attempts = getHistory();
    const adaDraft = Object.keys(window.localStorage).some(
      (key) => key.startsWith(DRAFT_PREFIX) || key.startsWith(PRACTICE_DRAFT_PREFIX)
    );
    if (attempts.length === 0) {
      setState(adaDraft ? { stats: summarize([]), weakest: null, adaDraft } : null);
      return;
    }
    setState({ stats: summarize(attempts), weakest: weakestSubtest(attempts), adaDraft });
  }, []);

  const draft = <ResumeBanner />;

  // Tanpa riwayat dan tanpa draft, bagian ini tidak dirender sama sekali supaya
  // tidak ada pita kosong bergaris di tengah beranda.
  if (!state) return null;

  const level = levelFor(state.stats.xp);
  const lemah = state.weakest ? SUBTEST_BY_ID[state.weakest.id] : null;

  return (
    <section className="border-b border-line py-6">
    <div className="space-y-3">
      {draft}
      <div className="card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-lg font-semibold">
            {state.stats.attempts > 0 ? "Ringkasan latihanmu" : "Lanjutkan sesi"}
          </h2>
          <Link href="/riwayat" className="text-xs text-muted underline underline-offset-4 hover:text-ink">
            Lihat riwayat
          </Link>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          {[
            { label: "Sesi", value: `${state.stats.attempts}` },
            { label: "Level", value: `${level.level}` },
            { label: "Streak", value: `${state.stats.streak} hari` },
            { label: "Skor terbaik", value: `${state.stats.bestScore}%` },
          ].map((item) => (
            <div key={item.label}>
              <dt className="label">{item.label}</dt>
              <dd className="num mt-0.5 font-serif text-xl font-semibold">{item.value}</dd>
            </div>
          ))}
        </dl>

        {state.weakest && lemah ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
            <p className="text-sm">
              Paling sering salah:{" "}
              <strong className="font-semibold">{lemah.name}</strong>{" "}
              <span className="num text-muted">
                ({state.weakest.correct}/{state.weakest.total}, {state.weakest.percent}%)
              </span>
            </p>
            <Link href={`/latihan/${lemah.id}`} className="btn-primary h-11">
              Latihan {lemah.short}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
    </section>
  );
}
