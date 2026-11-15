"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BANK_BY_SUBTEST } from "@/lib/bank";
import { SUBTESTS, TRACKS } from "@/lib/subtests";
import { accuracy, getPracticeStats, type PracticeStat } from "@/lib/storage";

export default function LatihanIndex() {
  const [stats, setStats] = useState<Record<string, PracticeStat>>({});

  useEffect(() => {
    setStats(getPracticeStats());
  }, []);

  return (
    <div className="space-y-8 py-4">
      <header>
        <p className="h-label">Mode latihan</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
          Latihan per subtes, pembahasan instan
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Pilih satu subtes atau mapel. Setiap jawaban langsung dinilai dan dijelaskan, cocok untuk
          memperbaiki materi yang masih lemah sebelum tryout berikutnya.
        </p>
      </header>

      {(["snbt", "sekolah"] as const).map((trackId) => (
        <section key={trackId}>
          <h2 className="font-display text-lg font-bold">{TRACKS[trackId].name}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SUBTESTS.filter((s) => s.track === trackId).map((sub) => {
              const total = BANK_BY_SUBTEST[sub.id]?.length ?? 0;
              const stat = stats[sub.id];
              const acc = accuracy(stat);
              return (
                <Link
                  key={sub.id}
                  href={`/latihan/${sub.id}`}
                  className="card card-hover flex flex-col gap-3 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className={`h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br ${sub.tone}`} />
                    <span className="chip">{total} soal</span>
                  </div>
                  <div>
                    <h3 className="font-semibold leading-snug">{sub.name}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{sub.blurb}</p>
                  </div>
                  <div className="mt-auto flex items-center gap-2 text-[11px] text-muted">
                    {stat && stat.attempted > 0 ? (
                      <>
                        <span
                          className={`font-semibold ${
                            acc >= 70 ? "text-emerald-500" : acc >= 40 ? "text-amber-500" : "text-rose-500"
                          }`}
                        >
                          {acc}% benar
                        </span>
                        <span>·</span>
                        <span>{stat.attempted} soal dikerjakan</span>
                      </>
                    ) : (
                      <span>Belum pernah dikerjakan</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
