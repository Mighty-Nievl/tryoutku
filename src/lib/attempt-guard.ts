import type { Attempt } from "./types";

export type AttemptInput = Omit<Attempt, "id" | "createdAt"> & {
  id: string;
  createdAt: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max
    ? value
    : null;
}

function num(value: unknown, min: number, max: number): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max
    ? Math.round(value)
    : null;
}

/**
 * Validasi satu attempt. Dipakai bersama oleh klien dan Pages Functions supaya
 * bentuk payload hanya punya satu definisi.
 */
export function parseAttempt(value: unknown): AttemptInput | null {
  if (!isObject(value)) return null;

  const id = str(value.id, 64);
  const kind = str(value.kind, 16);
  const refId = str(value.refId, 64);
  const refName = str(value.refName, 120);
  const createdAt = str(value.createdAt, 40);
  const durationSec = num(value.durationSec, 0, 60 * 60 * 12);
  const totalQuestions = num(value.totalQuestions, 1, 500);
  const correct = num(value.correct, 0, 500);
  const score = num(value.score, 0, 100);

  if (!id || !kind || !refId || !refName || !createdAt) return null;
  if (kind !== "tryout" && kind !== "latihan" && kind !== "tantangan") return null;
  if (durationSec === null || totalQuestions === null || correct === null || score === null) {
    return null;
  }
  if (!isObject(value.perSubtest) || !isObject(value.answers) || !Array.isArray(value.questionIds)) {
    return null;
  }
  if (value.questionIds.length === 0 || value.questionIds.length > 500) return null;
  if (!value.questionIds.every((q) => typeof q === "string" && q.length <= 64)) return null;

  const answers: Record<string, number> = {};
  for (const [key, picked] of Object.entries(value.answers)) {
    const option = num(picked, 0, 9);
    if (option === null) return null;
    answers[key.slice(0, 64)] = option;
  }

  const perSubtest: Record<string, { correct: number; total: number }> = {};
  for (const [key, bucket] of Object.entries(value.perSubtest)) {
    if (!isObject(bucket)) return null;
    const subCorrect = num(bucket.correct, 0, 500);
    const subTotal = num(bucket.total, 0, 500);
    if (subCorrect === null || subTotal === null) return null;
    perSubtest[key.slice(0, 32)] = { correct: subCorrect, total: subTotal };
  }

  return {
    id,
    kind: kind as Attempt["kind"],
    refId,
    refName,
    createdAt,
    durationSec,
    totalQuestions,
    correct,
    score,
    perSubtest,
    answers,
    questionIds: value.questionIds as string[],
  };
}
