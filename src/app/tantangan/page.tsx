"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BANK, shuffle } from "@/lib/bank";
import type { Question } from "@/lib/types";
import { scoreAnswers } from "@/lib/scoring";
import { recordAttempt } from "@/lib/persist";
import { getProfile } from "@/lib/profile";
import { playSound } from "@/lib/sound";
import QuestionView from "@/components/QuestionView";
import Mascot from "@/components/Mascot";

interface Done {
  date: string;
  correct: number;
  total: number;
  score: number;
  xp: number;
}

const KEY = "tryoutku:v1:tantangan";

function todayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/** Soal tantangan dipilih deterministik dari tanggal, jadi semua perangkat dapat set yang sama hari itu. */
function questionsForToday(): Question[] {
  const seed = Number(todayKey().replace(/-/g, ""));
  let rng = seed;
  const next = () => {
    rng = (rng * 1664525 + 1013904223) % 4294967296;
    return rng / 4294967296;
  };
  return shuffle(BANK, next).slice(0, 5);
}

export default function TantanganPage() {
  const questions = useMemo(questionsForToday, []);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState<Done | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Done;
        if (parsed.date === todayKey()) setDone(parsed);
      }
    } catch {
      /* abaikan */
    }
    setReady(true);
  }, []);

  function submit() {
    const scored = scoreAnswers(questions, answers);
    const xp = scored.correct * 12 + (scored.percent >= 80 ? 30 : 0);
    const record: Done = {
      date: todayKey(),
      correct: scored.correct,
      total: scored.total,
      score: scored.percent,
      xp,
    };
    recordAttempt(
      {
        kind: "tantangan",
        refId: `tantangan-${todayKey()}`,
        refName: `Tantangan ${todayKey()}`,
        durationSec: 0,
      },
      questions,
      answers,
      scored
    );
    playSound(scored.percent >= 60 ? "benar" : "salah", getProfile().sound);
    window.localStorage.setItem(KEY, JSON.stringify(record));
    setDone(record);
  }

  if (!ready) {
    return <div className="card p-8 text-sm text-muted">Memuat tantangan…</div>;
  }

  if (done) {
    return (
      <div className="space-y-6 py-4">
        <h1 className="font-serif text-2xl font-semibold">Tantangan hari ini selesai</h1>
        <div className="card flex flex-wrap items-center gap-6 p-5">
          <Mascot mood={done.score >= 60 ? "senang" : "fokus"} size={92} />
          <div>
            <p className="num font-serif text-4xl font-semibold">{done.score}%</p>
            <p className="mt-1 text-sm text-muted">
              {done.correct} dari {done.total} soal benar, dapat {done.xp} XP.
            </p>
            <p className="mt-2 text-xs text-muted">
              Tantangan berikutnya tersedia besok. Satu tantangan per hari supaya latihan tetap
              teratur.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/tryout" className="btn-primary">
            Kerjakan tryout
          </Link>
          <Link href="/latihan" className="btn-ghost">
            Latihan per subtes
          </Link>
          <Link href="/profil" className="btn-ghost">
            Lihat progres
          </Link>
        </div>
      </div>
    );
  }

  const current = questions[index];
  const answered = Object.keys(answers).length;

  return (
    <div className="space-y-4 py-4">
      <header className="flex flex-wrap items-center gap-4">
        <Mascot mood="fokus" size={64} />
        <div>
          <p className="label">Tantangan harian</p>
          <h1 className="mt-1 font-serif text-2xl font-semibold">Lima soal, bonus XP</h1>
          <p className="mt-1 text-sm text-muted">
            {answered} dari {questions.length} dijawab. Soal sama untuk semua orang hari ini.
          </p>
        </div>
      </header>

      <div className="card p-5 sm:p-7">
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
          {index + 1 < questions.length ? (
            <button type="button" className="btn-primary" onClick={() => setIndex((i) => i + 1)}>
              Berikutnya
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={submit}
              disabled={answered === 0}
            >
              Kirim jawaban
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
