"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteRemoteAttempts, pullAttempts } from "@/lib/api";
import { getQuestion } from "@/lib/bank";
import { clearHistory, getHistory } from "@/lib/storage";
import { formatDate, formatDuration } from "@/lib/scoring";
import { SUBTEST_BY_ID } from "@/lib/subtests";
import { PAKET_BY_ID } from "@/lib/pakets";
import type { Attempt } from "@/lib/types";
import QuestionView from "@/components/QuestionView";

type SyncState = "loading" | "cloud" | "local";

function SyncNote({ sync }: { sync: SyncState }) {
  if (sync === "loading") {
    return <p className="text-xs text-muted">Menyelaraskan dengan cloud…</p>;
  }
  if (sync === "cloud") {
    return (
      <p className="flex items-center gap-2 text-xs text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Tersinkron dengan cloud. Riwayat bisa dipulihkan di perangkat ini selama ID perangkat tidak
        dihapus.
      </p>
    );
  }
  return (
    <p className="flex items-center gap-2 text-xs text-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Cloud tidak terjangkau, riwayat ini hanya tersimpan di perangkat.
    </p>
  );
}

export default function RiwayatPage() {
  const [history, setHistory] = useState<Attempt[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [sync, setSync] = useState<SyncState>("loading");

  useEffect(() => {
    const local = getHistory();
    setHistory(local);
    setLoaded(true);

    let active = true;
    (async () => {
      const remote = await pullAttempts();
      if (!active) return;
      if (remote === null) {
        setSync("local");
        return;
      }
      const merged = new Map<string, Attempt>();
      for (const item of [...remote, ...local]) merged.set(item.id, item);
      setHistory([...merged.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
      setSync("cloud");
    })();

    return () => {
      active = false;
    };
  }, []);

  async function removeAll() {
    clearHistory();
    setHistory([]);
    setOpenId(null);
    await deleteRemoteAttempts();
  }

  if (!loaded) {
    return <div className="card p-8 text-sm text-muted">Memuat riwayat…</div>;
  }

  if (history.length === 0) {
    return (
      <div className="space-y-4">
        <div className="card p-8 text-center">
          <h1 className="font-serif text-xl font-bold">Belum ada riwayat</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Setiap tryout dan latihan yang kamu selesaikan akan tercatat di sini, lengkap dengan
            skor dan pembahasannya.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link href="/tryout" className="btn-primary">
              Mulai tryout
            </Link>
            <Link href="/latihan" className="btn-ghost">
              Mulai latihan
            </Link>
          </div>
        </div>
        <SyncNote sync={sync} />
      </div>
    );
  }

  const best = Math.max(...history.map((a) => a.score));

  return (
    <div className="space-y-6 py-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="h-label">Riwayat</p>
          <h1 className="mt-2 font-serif text-3xl font-extrabold tracking-tight">
            {history.length} sesi selesai
          </h1>
          <p className="mt-1 text-sm text-muted">Skor terbaik {best}%</p>
        </div>
        <button type="button" className="btn-ghost text-danger" onClick={removeAll}>
          Hapus semua riwayat
        </button>
      </header>

      <SyncNote sync={sync} />

      <div className="space-y-3">
        {history.map((attempt) => {
          const isOpen = openId === attempt.id;
          const tone =
            attempt.score >= 75
              ? "text-ok"
              : attempt.score >= 50
                ? "text-accent"
                : "text-danger";
          return (
            <article key={attempt.id} className="card p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="chip">
                      {attempt.kind === "tryout" ? "Tryout" : "Latihan"}
                    </span>
                    <h2 className="font-semibold leading-snug">
                      {PAKET_BY_ID[attempt.refId]?.name ?? attempt.refName}
                    </h2>
                  </div>
                  <p className="mt-1.5 text-xs text-muted">
                    {formatDate(attempt.createdAt)} · {attempt.correct}/{attempt.totalQuestions} benar
                    · {formatDuration(attempt.durationSec)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-serif text-2xl font-extrabold ${tone}`}>
                    {attempt.score}%
                  </span>
                  <button
                    type="button"
                    className="btn-ghost px-3 py-1.5 text-xs"
                    onClick={() => setOpenId(isOpen ? null : attempt.id)}
                  >
                    {isOpen ? "Tutup" : "Lihat pembahasan"}
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {Object.entries(attempt.perSubtest).map(([subId, value]) => {
                  const meta = SUBTEST_BY_ID[subId];
                  const percent = value.total ? Math.round((value.correct / value.total) * 100) : 0;
                  return (
                    <span key={subId} className="chip">
                      {meta?.short ?? subId.toUpperCase()} {value.correct}/{value.total} ({percent}%)
                    </span>
                  );
                })}
              </div>

              {isOpen ? (
                <div className="mt-4 space-y-4 border-t border-line pt-4">
                  {attempt.questionIds.map((qid, i) => {
                    const question = getQuestion(qid);
                    if (!question) return null;
                    return (
                      <div key={qid}>
                        <QuestionView
                          question={question}
                          index={i}
                          total={attempt.questionIds.length}
                          selected={attempt.answers[qid]}
                          reveal
                        />
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
