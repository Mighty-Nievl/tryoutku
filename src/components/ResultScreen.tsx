"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Question } from "@/lib/types";
import type { ScoredResult } from "@/lib/scoring";
import ResultSummary from "./ResultSummary";
import QuestionView from "./QuestionView";
import { LETTERS } from "@/lib/scoring";

type Filter = "all" | "wrong" | "blank";

interface Props {
  paketName: string;
  questions: Question[];
  answers: Record<string, number>;
  result: ScoredResult;
  durationSec: number;
  autoSubmitted: boolean;
  syncState: "idle" | "synced" | "local";
  onRestart: () => void;
  /** kartu imbalan sesi, dirender induk supaya tetap satu sumber data */
  reward?: React.ReactNode;
}

function statusOf(question: Question, answers: Record<string, number>) {
  const picked = answers[question.id];
  if (picked === undefined) return { id: "blank" as const, label: "Kosong" };
  if (picked === question.answer) return { id: "correct" as const, label: "Benar" };
  return { id: "wrong" as const, label: "Salah" };
}

const STATUS_TONE = {
  correct: "text-ok",
  wrong: "text-danger",
  blank: "text-muted",
};

/**
 * Halaman hasil: ringkasan di kolom kiri, pembahasan di kolom kanan (3:7).
 * Di layar sempit pembahasan dibuka lewat tombol dan tampil penuh.
 */
export default function ResultScreen({
  paketName,
  questions,
  answers,
  result,
  durationSec,
  autoSubmitted,
  syncState,
  onRestart,
  reward,
}: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [showReview, setShowReview] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Di layar lebar pembahasan tampil sejak awal; di ponsel tetap tertutup.
  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) setShowReview(true);
  }, []);

  function openReview() {
    setShowReview(true);
    window.requestAnimationFrame(() => {
      headingRef.current?.focus();
      panelRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }

  const wrongCount = questions.filter((q) => statusOf(q, answers).id === "wrong").length;
  const blankCount = questions.filter((q) => statusOf(q, answers).id === "blank").length;

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "Semua", count: questions.length },
    { id: "wrong", label: "Salah", count: wrongCount },
    { id: "blank", label: "Kosong", count: blankCount },
  ];

  const shown = questions.filter((q) => {
    const status = statusOf(q, answers).id;
    if (filter === "all") return true;
    if (filter === "wrong") return status === "wrong";
    return status === "blank";
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(300px,3fr)_7fr] lg:items-start">
      <div className="space-y-4 lg:sticky lg:top-20">
        <p className="text-xs text-muted" role="status">
          {syncState === "synced"
            ? "Tersimpan di perangkat dan tersinkron ke cloud."
            : syncState === "local"
              ? "Tersimpan di perangkat. Cloud tidak terjangkau, hasil tetap aman secara lokal."
              : "Menyimpan hasil…"}
        </p>

        <ResultSummary
          title={`${paketName}, selesai${autoSubmitted ? " (waktu habis)" : ""}`}
          result={result}
          durationSec={durationSec}
        >
          <button type="button" className="btn-primary col-span-2" onClick={onRestart}>
            Kerjakan ulang
          </button>
          <Link href="/tryout" className="btn-ghost">
            Paket lain
          </Link>
          <Link href="/riwayat" className="btn-ghost">
            Riwayat
          </Link>
        </ResultSummary>

        {reward}

        <div className="card p-4">
          <p className="label">Pembahasan</p>
          <p className="mt-1 text-sm text-muted">
            {questions.length} soal, {wrongCount} salah, {blankCount} kosong.
          </p>
          <button
            type="button"
            className="btn-primary mt-3 w-full"
            aria-expanded={showReview}
            aria-controls="panel-pembahasan"
            onClick={() => (showReview ? setShowReview(false) : openReview())}
          >
            {showReview ? "Tutup pembahasan" : "Buka pembahasan"}
          </button>
          <p className="mt-2 text-[11px] text-muted">
            {showReview
              ? "Panel di sebelah kanan sedang terbuka. Tutup untuk menyembunyikannya."
              : "Panel berisi tiap butir beserta alasannya akan terbuka di sebelah kanan."}
          </p>
        </div>
      </div>

      <div
        id="panel-pembahasan"
        ref={panelRef}
        hidden={!showReview}
        className="space-y-4 scroll-mt-20"
      >
        <div className="card sticky top-16 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3">
          <h2 ref={headingRef} tabIndex={-1} className="font-serif text-lg font-semibold">
            Pembahasan
          </h2>
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
          <div className="space-y-4">
            {shown.map((q) => {
              const originalIndex = questions.indexOf(q);
              const status = statusOf(q, answers);
              const picked = answers[q.id];
              return (
                <article key={q.id} className="card p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2.5">
                    <p className="text-sm font-semibold">Soal {originalIndex + 1}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="chip">Tingkat {q.level ?? 2}/3</span>
                      <span className={`font-semibold ${STATUS_TONE[status.id]}`}>
                        {status.label}
                        {picked !== undefined && status.id === "wrong"
                          ? ` (kamu pilih ${LETTERS[picked]})`
                          : ""}
                      </span>
                    </div>
                  </div>
                  <QuestionView
                    question={q}
                    index={originalIndex}
                    total={questions.length}
                    selected={picked}
                    reveal
                    hideMeta
                  />
                </article>
              );
            })}
          </div>
        )}

        <button type="button" className="btn-ghost w-full lg:hidden" onClick={() => setShowReview(false)}>
          Tutup pembahasan
        </button>
      </div>
    </div>
  );
}
