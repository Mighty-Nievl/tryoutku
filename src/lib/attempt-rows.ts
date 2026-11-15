import type { Attempt, LeaderRow } from "./types";

/** Baris D1 yang belum dipercaya bentuknya. */
export type Row = Record<string, unknown>;

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** JSON dari D1 bisa rusak; jangan sampai satu baris menjatuhkan seluruh respons. */
function jsonRecord<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || value.length === 0) return fallback;
  try {
    const parsed = JSON.parse(value) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

const KINDS: Attempt["kind"][] = ["tryout", "latihan", "tantangan"];

/** Jenis sesi yang tidak dikenal diganti tryout, bukan diteruskan apa adanya. */
function kindOf(value: unknown): Attempt["kind"] {
  return KINDS.includes(value as Attempt["kind"]) ? (value as Attempt["kind"]) : "tryout";
}

export function rowToAttempt(row: Row): Attempt {
  return {
    id: text(row.id),
    kind: kindOf(row.kind),
    refId: text(row.ref_id),
    refName: text(row.ref_name),
    createdAt: text(row.created_at),
    durationSec: num(row.duration_sec),
    totalQuestions: num(row.total_questions),
    correct: num(row.correct),
    score: num(row.score),
    perSubtest: jsonRecord(row.per_subtest, {}),
    answers: jsonRecord(row.answers, {}),
    questionIds: jsonRecord(row.question_ids, []),
  };
}

export function rowToLeaderRow(row: Row, index: number): LeaderRow {
  return {
    rank: index + 1,
    player: text(row.player, "Anonim") || "Anonim",
    score: num(row.score),
    correct: num(row.correct),
    total: num(row.total_questions),
    durationSec: num(row.duration_sec),
    createdAt: text(row.created_at),
  };
}
