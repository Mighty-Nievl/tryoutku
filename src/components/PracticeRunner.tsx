"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BANK_BY_SUBTEST, shuffle } from "@/lib/bank";
import type { Question, Subtest } from "@/lib/types";
import { recordPractice, getPracticeStats, accuracy } from "@/lib/storage";
import { formatDuration, scoreAnswers } from "@/lib/scoring";
import { recordAttempt } from "@/lib/persist";
import QuestionView from "./QuestionView";
import ResultSummary from "./ResultSummary";

export default function PracticeRunner({ subtest }: { subtest: Subtest }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [stat, setStat] = useState(0);
  const answersRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const pool = BANK_BY_SUBTEST[subtest.id] ?? [];
    setQuestions(shuffle(pool, Math.random));
    setStat(accuracy(getPracticeStats()[subtest.id]));
  }, [subtest.id]);

  useEffect(() => {
    if (done) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [done]);

  const current = questions[index];

  function choose(option: number) {
    if (picked !== null || !current) return;
    setPicked(option);
    const isCorrect = option === current.answer;
    const nextAnswers = { ...answersRef.current, [current.id]: option };
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
    recordPractice(subtest.id, isCorrect, current.id);
    setStat(accuracy(getPracticeStats()[subtest.id]));
  }

  function next() {
    if (index + 1 >= questions.length) {
      const all = answersRef.current;
      const scored = scoreAnswers(questions, all);
      recordAttempt(
        {
          kind: "latihan",
          refId: subtest.id,
          refName: `Latihan ${subtest.name}`,
          durationSec: seconds,
        },
        questions,
        all,
        scored
      );
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  }

  function restart() {
    setQuestions(shuffle(BANK_BY_SUBTEST[subtest.id] ?? [], Math.random));
    setIndex(0);
    setPicked(null);
    answersRef.current = {};
    setAnswers({});
    setSeconds(0);
    setDone(false);
  }

  if (questions.length === 0) {
    return <div className="card p-8 text-sm text-muted">Belum ada soal untuk subtes ini.</div>;
  }

  if (done) {
    const scored = scoreAnswers(questions, answers);
    return (
      <div className="space-y-6">
        <ResultSummary
          title={`Latihan ${subtest.name}, selesai`}
          result={scored}
          durationSec={seconds}
        >
          <button type="button" className="btn-primary" onClick={restart}>
            Ulangi latihan
          </button>
          <Link href="/latihan" className="btn-ghost">
            Pilih subtes lain
          </Link>
        </ResultSummary>
        <section className="space-y-4">
          <h2 className="font-serif text-lg font-bold">Pembahasan</h2>
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
      <div className="card flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-sm font-bold">{subtest.name}</p>
          <p className="text-xs text-muted">
            Akurasi subtes {stat}% · {questions.length} soal dalam sesi ini
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="rounded-lg bg-raised px-2.5 py-1 font-mono tabular-nums text-ink">
            {formatDuration(seconds)}
          </span>
          <Link href="/latihan" className="font-medium hover:text-ink">
            Keluar
          </Link>
        </div>
      </div>

      <div className="card p-5 sm:p-7">
        <QuestionView
          question={current}
          index={index}
          total={questions.length}
          selected={picked ?? undefined}
          onSelect={choose}
          reveal={picked !== null}
        />

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-xs text-muted">
            {picked === null
              ? "Pilih satu jawaban untuk melihat pembahasan."
              : picked === current.answer
                ? "Tepat. Lanjut ke soal berikutnya."
                : "Belum tepat. Baca pembahasan lalu lanjut."}
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={next}
            disabled={picked === null}
          >
            {index + 1 >= questions.length ? "Lihat hasil" : "Soal berikutnya →"}
          </button>
        </div>
      </div>
    </div>
  );
}
