"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { buildPaketQuestions } from "@/lib/bank";
import type { Paket, Question } from "@/lib/types";
import {
  formatDuration,
  scoreAnswers,
  toAttemptPayload,
  type ScoredResult,
} from "@/lib/scoring";
import { saveAttempt } from "@/lib/storage";
import QuestionView from "./QuestionView";
import NavGrid from "./NavGrid";
import ResultSummary from "./ResultSummary";

interface Draft {
  seed: number;
  answers: Record<string, number>;
  flags: Record<string, boolean>;
  startedAt: number;
  deadline: number;
}

export default function TryoutRunner({ paket }: { paket: Paket }) {
  const draftKey = `tryoutku:draft:${paket.id}`;
  const totalMs = paket.durationMin * 60 * 1000;

  const [ready, setReady] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [index, setIndex] = useState(0);
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [startedAt, setStartedAt] = useState(0);
  const [result, setResult] = useState<ScoredResult | null>(null);
  const [durationSec, setDurationSec] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  // Muat draft (soal, jawaban, sisa waktu) atau mulai sesi baru
  useEffect(() => {
    let draft: Draft | null = null;
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (raw) draft = JSON.parse(raw) as Draft;
    } catch {
      draft = null;
    }
    if (!draft) {
      draft = {
        seed: Math.floor(Math.random() * 1_000_000_000),
        answers: {},
        flags: {},
        startedAt: Date.now(),
        deadline: Date.now() + totalMs,
      };
      window.localStorage.setItem(draftKey, JSON.stringify(draft));
    }
    setQuestions(buildPaketQuestions(paket, draft.seed));
    setAnswers(draft.answers ?? {});
    setFlags(draft.flags ?? {});
    setStartedAt(draft.startedAt);
    setDeadline(draft.deadline);
    setReady(true);
  }, [draftKey, paket, totalMs]);

  // Simpan jawaban & tanda ragu
  useEffect(() => {
    if (!ready || result) return;
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) return;
      const draft = JSON.parse(raw) as Draft;
      draft.answers = answers;
      draft.flags = flags;
      window.localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch {
      /* abaikan */
    }
  }, [answers, flags, ready, result, draftKey]);

  useEffect(() => {
    if (!ready || result) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [ready, result]);

  const remaining = Math.max(0, Math.floor((deadline - now) / 1000));
  const answeredCount = Object.keys(answers).length;
  const current = questions[index];

  const finish = useCallback(
    (auto = false) => {
      if (!questions.length || result) return;
      const scored = scoreAnswers(questions, answers);
      const used = Math.min(Math.round((Date.now() - startedAt) / 1000), paket.durationMin * 60);
      setResult(scored);
      setDurationSec(used);
      setShowConfirm(false);
      setAutoSubmitted(auto);
      try {
        window.localStorage.removeItem(draftKey);
      } catch {
        /* abaikan */
      }
      saveAttempt(
        toAttemptPayload(
          { kind: "tryout", refId: paket.id, refName: paket.name, durationSec: used },
          questions,
          answers,
          scored
        )
      );
    },
    [answers, draftKey, paket.durationMin, paket.id, paket.name, questions, result, startedAt]
  );

  // Auto-submit saat waktu habis
  useEffect(() => {
    if (ready && !result && remaining <= 0 && deadline > 0) finish(true);
  }, [remaining, ready, result, deadline, finish]);

  // Pintasan papan tual: 1-5 pilih, panah navigasi, F tandai ragu
  useEffect(() => {
    if (!ready || result) return;
    function onKey(event: KeyboardEvent) {
      if (!current) return;
      const n = Number(event.key);
      if (n >= 1 && n <= current.options.length) {
        setAnswers((prev) => ({ ...prev, [current.id]: n - 1 }));
      } else if (event.key === "ArrowRight") {
        setIndex((i) => Math.min(i + 1, questions.length - 1));
      } else if (event.key === "ArrowLeft") {
        setIndex((i) => Math.max(i - 1, 0));
      } else if (event.key.toLowerCase() === "f") {
        setFlags((prev) => ({ ...prev, [current.id]: !prev[current.id] }));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, questions.length, ready, result]);

  function restart() {
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      /* abaikan */
    }
    const draft: Draft = {
      seed: Math.floor(Math.random() * 1_000_000_000),
      answers: {},
      flags: {},
      startedAt: Date.now(),
      deadline: Date.now() + totalMs,
    };
    window.localStorage.setItem(draftKey, JSON.stringify(draft));
    setQuestions(buildPaketQuestions(paket, draft.seed));
    setAnswers({});
    setFlags({});
    setIndex(0);
    setStartedAt(draft.startedAt);
    setDeadline(draft.deadline);
    setNow(Date.now());
    setResult(null);
    setAutoSubmitted(false);
  }

  if (!ready) {
    return (
      <div className="card p-8 text-center text-sm text-muted">Menyiapkan paket soal…</div>
    );
  }

  if (result) {
    return (
      <div className="space-y-6">
        <ResultSummary
          title={`${paket.name} — selesai${autoSubmitted ? " (waktu habis)" : ""}`}
          result={result}
          durationSec={durationSec}
        >
          <button type="button" className="btn-primary" onClick={restart}>
            Kerjakan ulang
          </button>
          <Link href="/tryout" className="btn-ghost">
            Paket lain
          </Link>
          <Link href="/riwayat" className="btn-ghost">
            Riwayat
          </Link>
        </ResultSummary>

        <section className="space-y-4">
          <h2 className="font-display text-lg font-bold">Pembahasan lengkap</h2>
          {questions.map((q, i) => (
            <div key={q.id} className="card p-5">
              <QuestionView
                question={q}
                index={i}
                total={questions.length}
                selected={answers[q.id]}
                reveal
              />
            </div>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card sticky top-16 z-20 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-sm font-bold">{paket.name}</p>
          <p className="text-xs text-muted">
            {answeredCount} dari {questions.length} soal dijawab
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-xl px-3 py-1.5 font-mono text-sm font-bold tabular-nums ${
              remaining <= 300
                ? "bg-rose-500/15 text-rose-500"
                : "bg-raised text-ink"
            }`}
          >
            {formatDuration(remaining)}
          </span>
          <button type="button" className="btn-primary" onClick={() => setShowConfirm(true)}>
            Selesai
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="card p-5 sm:p-7">
          {current ? (
            <>
              <QuestionView
                question={current}
                index={index}
                total={questions.length}
                selected={answers[current.id]}
                onSelect={(option) =>
                  setAnswers((prev) => ({ ...prev, [current.id]: option }))
                }
              />
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  disabled={index === 0}
                >
                  ← Sebelumnya
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
                  disabled={index === questions.length - 1}
                >
                  Berikutnya →
                </button>
                <button
                  type="button"
                  className="btn-ghost ml-auto"
                  onClick={() =>
                    setFlags((prev) => ({ ...prev, [current.id]: !prev[current.id] }))
                  }
                >
                  {flags[current.id] ? "★ Ragu (aktif)" : "☆ Tandai ragu"}
                </button>
              </div>
              <p className="mt-3 text-[11px] text-muted">
                Pintasan: angka 1–{current.options.length} untuk memilih, ← → untuk berpindah, F
                untuk menandai ragu.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">Tidak ada soal pada paket ini.</p>
          )}
        </div>

        <aside className="card h-fit p-4 lg:sticky lg:top-36">
          <p className="h-label mb-3">Navigasi soal</p>
          <NavGrid
            questions={questions}
            answers={answers}
            flags={flags}
            current={index}
            onJump={setIndex}
          />
        </aside>
      </div>

      {showConfirm ? (
        <div
          className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="card w-full max-w-md p-6">
            <h3 className="font-display text-lg font-bold">Selesai mengerjakan?</h3>
            <p className="mt-2 text-sm text-muted">
              {questions.length - answeredCount > 0
                ? `Masih ada ${questions.length - answeredCount} soal kosong. Jawaban kosong dihitung salah.`
                : "Semua soal sudah dijawab. Jawaban tidak bisa diubah setelah dikumpulkan."}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setShowConfirm(false)}>
                Lanjut mengerjakan
              </button>
              <button type="button" className="btn-primary" onClick={() => finish(false)}>
                Kumpulkan
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
