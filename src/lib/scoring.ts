import type { Attempt, Question } from "./types";
import { SUBTEST_BY_ID } from "./subtests";

export interface ScoredPerSubtest {
  id: string;
  name: string;
  short: string;
  correct: number;
  total: number;
  percent: number;
}

export interface ScoredResult {
  total: number;
  correct: number;
  wrong: number;
  blank: number;
  percent: number;
  /** estimasi kasar skala 200-800, BUKAN skor IRT resmi */
  estimate: number;
  perSubtest: ScoredPerSubtest[];
  weakest: ScoredPerSubtest | null;
}

export function scoreAnswers(
  questions: Question[],
  answers: Record<string, number>
): ScoredResult {
  const perSubMap = new Map<string, { correct: number; total: number }>();
  let correct = 0;
  let blank = 0;

  for (const q of questions) {
    const bucket = perSubMap.get(q.subtest) ?? { correct: 0, total: 0 };
    bucket.total += 1;
    const picked = answers[q.id];
    if (picked === undefined) {
      blank += 1;
    } else if (picked === q.answer) {
      correct += 1;
      bucket.correct += 1;
    }
    perSubMap.set(q.subtest, bucket);
  }

  const total = questions.length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  const perSubtest: ScoredPerSubtest[] = [...perSubMap.entries()].map(
    ([id, v]) => {
      const meta = SUBTEST_BY_ID[id];
      return {
        id,
        name: meta?.name ?? id,
        short: meta?.short ?? id.toUpperCase(),
        correct: v.correct,
        total: v.total,
        percent: v.total === 0 ? 0 : Math.round((v.correct / v.total) * 100),
      };
    }
  );

  const weakest =
    perSubtest.length === 0
      ? null
      : perSubtest.reduce((min, cur) => (cur.percent < min.percent ? cur : min));

  return {
    total,
    correct,
    wrong: total - correct - blank,
    blank,
    percent,
    estimate: Math.min(800, Math.round(200 + percent * 6)),
    perSubtest,
    weakest,
  };
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const LETTERS = ["A", "B", "C", "D", "E"];

export function toAttemptPayload(
  base: Pick<Attempt, "kind" | "refId" | "refName" | "durationSec">,
  questions: Question[],
  answers: Record<string, number>,
  result: ScoredResult
): Omit<Attempt, "id" | "createdAt"> {
  return {
    ...base,
    totalQuestions: result.total,
    correct: result.correct,
    score: result.percent,
    perSubtest: Object.fromEntries(
      result.perSubtest.map((p) => [p.id, { correct: p.correct, total: p.total }])
    ),
    answers,
    questionIds: questions.map((q) => q.id),
  };
}
