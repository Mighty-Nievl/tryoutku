"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BANK_BY_SUBTEST, shuffle } from "@/lib/bank";
import type { Question, Subtest } from "@/lib/types";
import {
  accuracy,
  clearPracticeDraft,
  getPracticeDraft,
  getPracticeStats,
  recordPractice,
  savePracticeDraft,
} from "@/lib/storage";
import { formatDuration, scoreAnswers } from "@/lib/scoring";
import { recordAttempt } from "@/lib/persist";
import { getHistory } from "@/lib/storage";
import { useSessionReward } from "@/lib/useSessionReward";
import { getProfile } from "@/lib/profile";
import { playSound } from "@/lib/sound";
import QuestionView from "./QuestionView";
import ResultSummary from "./ResultSummary";
import Dialog from "./Dialog";
import Mascot from "./Mascot";
import SessionReward from "./SessionReward";
import Celebration from "./Celebration";

export default function PracticeRunner({ subtest }: { subtest: Subtest }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [stat, setStat] = useState(0);
  const [resumed, setResumed] = useState(false);
  const [askExit, setAskExit] = useState(false);
  const [reaction, setReaction] = useState<"idle" | "benar" | "salah">("idle");
  const [xpPop, setXpPop] = useState(false);
  const { reward, celebration, settle, reset: resetReward, dismissCelebration } = useSessionReward();
  const answersRef = useRef<Record<string, number>>({});
  const startedAtRef = useRef(Date.now());

  // Pulihkan sesi yang belum selesai, atau mulai sesi baru
  useEffect(() => {
    const pool = BANK_BY_SUBTEST[subtest.id] ?? [];
    setStat(accuracy(getPracticeStats()[subtest.id]));

    const draft = getPracticeDraft(subtest.id);
    if (draft) {
      const byId = new Map(pool.map((q) => [q.id, q]));
      const restored = draft.questionIds
        .map((id) => byId.get(id))
        .filter((q): q is Question => Boolean(q));
      if (restored.length === draft.questionIds.length) {
        setQuestions(restored);
        answersRef.current = draft.answers;
        setAnswers(draft.answers);
        const startIndex = Math.min(draft.index, restored.length - 1);
        setIndex(startIndex);
        setPicked(draft.answers[restored[startIndex].id] ?? null);
        startedAtRef.current = draft.startedAt;
        setSeconds(Math.max(0, Math.round((Date.now() - draft.startedAt) / 1000)));
        setResumed(true);
        return;
      }
    }

    const fresh = shuffle(pool, Math.random);
    const startedAt = Date.now();
    startedAtRef.current = startedAt;
    setQuestions(fresh);
    answersRef.current = {};
    setAnswers({});
    setIndex(0);
    setPicked(null);
    setSeconds(0);
    savePracticeDraft({
      subtest: subtest.id,
      questionIds: fresh.map((q) => q.id),
      answers: {},
      index: 0,
      startedAt,
    });
  }, [subtest.id]);

  useEffect(() => {
    if (done) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [done]);

  const current = questions[index];

  function persistDraft(patch: { answers?: Record<string, number>; index?: number }) {
    if (questions.length === 0) return;
    savePracticeDraft({
      subtest: subtest.id,
      questionIds: questions.map((q) => q.id),
      answers: patch.answers ?? answersRef.current,
      index: patch.index ?? index,
      startedAt: startedAtRef.current,
    });
  }

  function choose(option: number) {
    if (picked !== null || !current) return;
    setPicked(option);
    const nextAnswers = { ...answersRef.current, [current.id]: option };
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
    persistDraft({ answers: nextAnswers });
    const correct = option === current.answer;
    playSound(correct ? "benar" : "salah", getProfile().sound);
    setReaction(correct ? "benar" : "salah");
    setXpPop(correct);
    window.setTimeout(() => {
      setReaction("idle");
      setXpPop(false);
    }, 900);
    recordPractice(subtest.id, correct, current.id);
    setStat(accuracy(getPracticeStats()[subtest.id]));
  }

  async function next() {
    if (index + 1 >= questions.length) {
      const all = answersRef.current;
      const scored = scoreAnswers(questions, all);
      const historyBefore = getHistory();
      clearPracticeDraft(subtest.id);
      setDone(true);
      setResumed(false);
      const { attempt } = await recordAttempt(
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
      settle(historyBefore, attempt);
      return;
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setPicked(answersRef.current[questions[nextIndex].id] ?? null);
    persistDraft({ index: nextIndex });
  }

  function restart() {
    const fresh = shuffle(BANK_BY_SUBTEST[subtest.id] ?? [], Math.random);
    const startedAt = Date.now();
    startedAtRef.current = startedAt;
    setQuestions(fresh);
    setIndex(0);
    setPicked(null);
    answersRef.current = {};
    setAnswers({});
    setSeconds(0);
    setDone(false);
    setResumed(false);
    resetReward();
    setXpPop(false);
    savePracticeDraft({
      subtest: subtest.id,
      questionIds: fresh.map((q) => q.id),
      answers: {},
      index: 0,
      startedAt,
    });
  }

  if (questions.length === 0) {
    return (
      <div className="card p-8 text-sm text-muted" role="status">
        Belum ada soal untuk subtes ini.
      </div>
    );
  }

  if (done) {
    const scored = scoreAnswers(questions, answers);
    return (
      <div className="space-y-6">
        <h1 className="sr-only">Hasil latihan {subtest.name}</h1>
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
        {reward ? (
          <SessionReward
            xp={reward.xp}
            level={reward.level}
            stats={reward.stats}
            streak={reward.streak}
          />
        ) : null}
        <section className="space-y-4">
          <h2 className="font-serif text-lg font-semibold">Pembahasan</h2>
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
        {celebration ? (
          <Celebration
            open
            leveledUp={celebration.leveledUp}
            level={celebration.level}
            newBadges={celebration.badges}
            onClose={dismissCelebration}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="sr-only">Latihan {subtest.name}</h1>

      <div className="card flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-sm font-semibold">{subtest.name}</p>
          <p className="text-xs text-muted">
            Akurasi subtes {stat}% · soal {index + 1} dari {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="num rounded-md bg-raised px-2.5 py-1 font-mono text-ink">
            {formatDuration(seconds)}
          </span>
          <button type="button" className="btn-ghost" onClick={() => setAskExit(true)}>
            Keluar
          </button>
        </div>
      </div>

      {resumed ? (
        <div className="card flex flex-wrap items-center justify-between gap-3 border-accent/40 px-4 py-3 text-sm">
          <p className="text-muted">
            Melanjutkan sesi yang belum selesai, ada {Object.keys(answers).length} jawaban tersimpan.
          </p>
          <button type="button" className="btn-ghost" onClick={restart}>
            Mulai ulang
          </button>
        </div>
      ) : null}

      <div className="card p-5 sm:p-7">
        <QuestionView
          question={current}
          index={index}
          total={questions.length}
          selected={picked ?? undefined}
          onSelect={choose}
          reveal={picked !== null}
        />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Mascot
              size={44}
              mood={reaction === "salah" ? "sedih" : picked === null ? "fokus" : "senang"}
              react={reaction}
            />
            {xpPop ? (
              <span className="num rounded-sm border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[11px] font-semibold text-accent motion-pop">
                +5 XP
              </span>
            ) : null}
            <p className="text-xs text-muted" role="status">
              {picked === null
                ? "Pilih satu jawaban untuk melihat pembahasan."
                : picked === current.answer
                  ? "Tepat. Lanjut ke soal berikutnya."
                  : "Belum tepat. Baca pembahasan lalu lanjut."}
            </p>
          </div>
          <button type="button" className="btn-primary" onClick={next} disabled={picked === null}>
            {index + 1 >= questions.length ? "Lihat hasil" : "Soal berikutnya"}
          </button>
        </div>
      </div>

      <Dialog
        open={askExit}
        title="Keluar dari latihan?"
        onClose={() => setAskExit(false)}
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setAskExit(false)}>
              Lanjut mengerjakan
            </button>
            <Link href="/latihan" className="btn-primary">
              Keluar
            </Link>
          </>
        }
      >
        {Object.keys(answers).length > 0
          ? `${Object.keys(answers).length} jawaban tersimpan. Kamu bisa melanjutkan dari soal ${index + 1} kapan saja.`
          : "Belum ada jawaban tersimpan. Sesi ini tidak akan tercatat."}
      </Dialog>
    </div>
  );
}
