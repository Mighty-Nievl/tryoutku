"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { buildPaketQuestions } from "@/lib/bank";
import type { Paket, Question } from "@/lib/types";
import { formatDuration, scoreAnswers, type ScoredResult } from "@/lib/scoring";
import { recordAttempt } from "@/lib/persist";
import QuestionView from "./QuestionView";
import NavGrid from "./NavGrid";
import ResultSummary from "./ResultSummary";
import Dialog from "./Dialog";

interface Draft {
  seed: number;
  answers: Record<string, number>;
  flags: Record<string, boolean>;
  startedAt: number;
  deadline: number;
}

type ResultFilter = "all" | "wrong" | "blank";

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
  const [dialog, setDialog] = useState<null | "submit" | "exit" | "nav">(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [syncState, setSyncState] = useState<"idle" | "synced" | "local">("idle");
  const [announce, setAnnounce] = useState("");
  const [filter, setFilter] = useState<ResultFilter>("all");

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

  // Simpan jawaban dan tanda ragu
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
      /* penyimpanan penuh atau mode privat: draft tetap jalan di memori */
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
      setDialog(null);
      setAutoSubmitted(auto);
      try {
        window.localStorage.removeItem(draftKey);
      } catch {
        /* abaikan */
      }
      recordAttempt(
        { kind: "tryout", refId: paket.id, refName: paket.name, durationSec: used },
        questions,
        answers,
        scored
      ).then((ok) => setSyncState(ok ? "synced" : "local"));
    },
    [answers, draftKey, paket.durationMin, paket.id, paket.name, questions, result, startedAt]
  );

  // Auto-submit saat waktu habis
  useEffect(() => {
    if (ready && !result && remaining <= 0 && deadline > 0) finish(true);
  }, [remaining, ready, result, deadline, finish]);

  // Pengumuman waktu untuk pembaca layar pada ambang 10, 5, dan 1 menit
  const previousRemaining = useRef(remaining);
  useEffect(() => {
    if (!ready || result) return;
    const before = previousRemaining.current;
    previousRemaining.current = remaining;
    const mark = [
      { at: 600, text: "Sisa waktu 10 menit." },
      { at: 300, text: "Sisa waktu 5 menit." },
      { at: 60, text: "Sisa waktu 1 menit." },
    ].find((item) => before > item.at && remaining <= item.at);
    if (mark) setAnnounce(mark.text);
  }, [remaining, ready, result]);

  // Pintasan papan ketik: 1-5 pilih, panah navigasi, F tandai ragu
  useEffect(() => {
    if (!ready || result) return;
    function onKey(event: KeyboardEvent) {
      if (dialog || !current) return;
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
  }, [current, dialog, questions.length, ready, result]);

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
    setFilter("all");
  }

  if (!ready) {
    return (
      <div className="card p-8 text-center text-sm text-muted" role="status">
        Menyiapkan paket soal…
      </div>
    );
  }

  if (result) {
    const wrongIds = new Set(
      questions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== q.answer).map((q) => q.id)
    );
    const blankIds = new Set(questions.filter((q) => answers[q.id] === undefined).map((q) => q.id));
    const shown = questions.filter((q) =>
      filter === "all" ? true : filter === "wrong" ? wrongIds.has(q.id) : blankIds.has(q.id)
    );
    const filters: { id: ResultFilter; label: string; count: number }[] = [
      { id: "all", label: "Semua soal", count: questions.length },
      { id: "wrong", label: "Salah", count: wrongIds.size },
      { id: "blank", label: "Kosong", count: blankIds.size },
    ];

    return (
      <div className="space-y-6">
        <h1 className="sr-only">
          Hasil {paket.name}
        </h1>
        <p className="text-xs text-muted" role="status">
          {syncState === "synced"
            ? "Tersimpan di perangkat dan tersinkron ke cloud."
            : syncState === "local"
              ? "Tersimpan di perangkat. Cloud tidak terjangkau, hasil tetap aman secara lokal."
              : "Menyimpan hasil…"}
        </p>
        <ResultSummary
          title={`${paket.name}, selesai${autoSubmitted ? " (waktu habis)" : ""}`}
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-lg font-semibold">Pembahasan</h2>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Saring pembahasan">
              {filters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  aria-pressed={filter === item.id}
                  className={`min-h-11 rounded-md border px-3 text-xs font-medium transition-colors ${
                    filter === item.id
                      ? "border-accent bg-accent/10 text-ink"
                      : "border-line text-muted hover:text-ink"
                  }`}
                >
                  {item.label} ({item.count})
                </button>
              ))}
            </div>
          </div>

          {shown.length === 0 ? (
            <p className="card p-5 text-sm text-muted">
              Tidak ada soal pada kategori ini. Semua butir terjawab benar.
            </p>
          ) : (
            shown.map((q) => (
              <div key={q.id} className="card p-5">
                <QuestionView
                  question={q}
                  index={questions.indexOf(q)}
                  total={questions.length}
                  selected={answers[q.id]}
                  reveal
                />
              </div>
            ))
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="sr-only">{paket.name}</h1>
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      <div className="card sticky top-16 z-20 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-sm font-semibold">{paket.name}</p>
          <p className="text-xs text-muted">
            {answeredCount} dari {questions.length} soal dijawab
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            role="timer"
            aria-label={`Sisa waktu ${formatDuration(remaining)}`}
            className={`num shrink-0 rounded-md px-3 py-1.5 font-mono text-sm font-semibold ${
              remaining <= 300 ? "bg-danger/15 text-danger" : "bg-raised text-ink"
            }`}
          >
            {formatDuration(remaining)}
          </span>
          <button
            type="button"
            className="btn-ghost whitespace-nowrap px-3 lg:hidden"
            onClick={() => setDialog("nav")}
            aria-haspopup="dialog"
            aria-label="Buka daftar soal"
          >
            Soal
          </button>
          <button
            type="button"
            className="btn-ghost whitespace-nowrap px-3"
            onClick={() => setDialog("exit")}
          >
            Keluar
          </button>
          <button
            type="button"
            className="btn-primary whitespace-nowrap px-3"
            onClick={() => setDialog("submit")}
          >
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
                onSelect={(option) => setAnswers((prev) => ({ ...prev, [current.id]: option }))}
              />
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  disabled={index === 0}
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
                  disabled={index === questions.length - 1}
                >
                  Berikutnya
                </button>
                <button
                  type="button"
                  className="btn-ghost ml-auto"
                  aria-pressed={Boolean(flags[current.id])}
                  onClick={() =>
                    setFlags((prev) => ({ ...prev, [current.id]: !prev[current.id] }))
                  }
                >
                  {flags[current.id] ? "Ragu (aktif)" : "Tandai ragu"}
                </button>
              </div>
              <p className="mt-3 text-[11px] text-muted">
                Pintasan: angka 1 sampai {current.options.length} untuk memilih, panah kiri dan kanan
                untuk berpindah, F untuk menandai ragu.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">Tidak ada soal pada paket ini.</p>
          )}
        </div>

        <aside className="card hidden h-fit p-4 lg:sticky lg:top-36 lg:block">
          <p className="label mb-3">Navigasi soal</p>
          <NavGrid
            questions={questions}
            answers={answers}
            flags={flags}
            current={index}
            onJump={setIndex}
          />
        </aside>
      </div>

      <Dialog
        open={dialog === "submit"}
        title="Selesai mengerjakan?"
        onClose={() => setDialog(null)}
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setDialog(null)}>
              Lanjut mengerjakan
            </button>
            <button type="button" className="btn-primary" onClick={() => finish(false)}>
              Kumpulkan
            </button>
          </>
        }
      >
        {questions.length - answeredCount > 0
          ? `Masih ada ${questions.length - answeredCount} soal kosong. Jawaban kosong dihitung salah.`
          : "Semua soal sudah dijawab. Jawaban tidak bisa diubah setelah dikumpulkan."}
      </Dialog>

      <Dialog
        open={dialog === "exit"}
        title="Keluar dari tryout?"
        onClose={() => setDialog(null)}
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setDialog(null)}>
              Lanjut mengerjakan
            </button>
            <Link href="/tryout" className="btn-primary">
              Keluar ke daftar paket
            </Link>
          </>
        }
      >
        Jawaban, tanda ragu, dan sisa waktu {formatDuration(remaining)} tersimpan di perangkat ini.
        Kamu bisa melanjutkan paket yang sama kapan saja sebelum waktunya habis.
      </Dialog>

      <Dialog
        open={dialog === "nav"}
        title="Daftar soal"
        onClose={() => setDialog(null)}
        footer={
          <button type="button" className="btn-primary" onClick={() => setDialog(null)}>
            Tutup
          </button>
        }
      >
        <div className="text-ink">
          <p className="mb-3 text-xs text-muted">
            {answeredCount} dari {questions.length} soal dijawab. Ketuk nomor untuk berpindah.
          </p>
          <NavGrid
            questions={questions}
            answers={answers}
            flags={flags}
            current={index}
            onJump={(target) => {
              setIndex(target);
              setDialog(null);
            }}
          />
        </div>
      </Dialog>
    </div>
  );
}
