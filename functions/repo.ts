import type { Attempt, LeaderRow } from "../src/lib/types";
import { rowToAttempt, rowToLeaderRow, type Row } from "../src/lib/attempt-rows";

/**
 * Satu-satunya tempat query D1 ditulis. Rute hanya mengurus HTTP: membaca
 * parameter, memvalidasi, dan memilih kode status.
 */

const ATTEMPT_COLUMNS = `id, kind, ref_id, ref_name, created_at, duration_sec,
  total_questions, correct, score, per_subtest, answers, question_ids`;

export async function saveAttempt(
  db: D1Database,
  deviceId: string,
  player: string | null,
  attempt: Attempt
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO attempts
        (id, device_id, player, kind, ref_id, ref_name, created_at, duration_sec,
         total_questions, correct, score, per_subtest, answers, question_ids)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         player = excluded.player,
         score = excluded.score,
         correct = excluded.correct,
         duration_sec = excluded.duration_sec`
    )
    .bind(
      attempt.id,
      deviceId,
      player,
      attempt.kind,
      attempt.refId,
      attempt.refName,
      attempt.createdAt,
      attempt.durationSec,
      attempt.totalQuestions,
      attempt.correct,
      attempt.score,
      JSON.stringify(attempt.perSubtest),
      JSON.stringify(attempt.answers),
      JSON.stringify(attempt.questionIds)
    )
    .run();
}

export async function listAttempts(
  db: D1Database,
  deviceId: string,
  limit: number
): Promise<Attempt[]> {
  const { results } = await db
    .prepare(
      `SELECT ${ATTEMPT_COLUMNS} FROM attempts
        WHERE device_id = ? ORDER BY created_at DESC LIMIT ?`
    )
    .bind(deviceId, limit)
    .all<Row>();
  return (results ?? []).map(rowToAttempt);
}

export async function findAttempt(db: D1Database, id: string): Promise<Attempt | null> {
  const row = await db
    .prepare(`SELECT ${ATTEMPT_COLUMNS} FROM attempts WHERE id = ?`)
    .bind(id)
    .first<Row>();
  return row ? rowToAttempt(row) : null;
}

export async function deleteAttempts(db: D1Database, deviceId: string): Promise<number> {
  const result = await db.prepare("DELETE FROM attempts WHERE device_id = ?").bind(deviceId).run();
  return result.meta.changes ?? 0;
}

export async function readLeaderboard(
  db: D1Database,
  ref: string | null,
  limit: number
): Promise<LeaderRow[]> {
  const columns = `player, score, correct, total_questions, duration_sec, created_at`;
  const query = ref
    ? db
        .prepare(
          `SELECT ${columns} FROM attempts WHERE kind = 'tryout' AND ref_id = ?
            ORDER BY score DESC, duration_sec ASC, created_at ASC LIMIT ?`
        )
        .bind(ref, limit)
    : db
        .prepare(
          `SELECT ${columns} FROM attempts WHERE kind = 'tryout'
            ORDER BY score DESC, duration_sec ASC, created_at ASC LIMIT ?`
        )
        .bind(limit);

  const { results } = await query.all<Row>();
  return (results ?? []).map(rowToLeaderRow);
}

export interface StatsResult {
  attempts: number;
  avgScore: number;
  perPaket: { refId: string; refName: string; count: number; avgScore: number }[];
}

export async function readStats(db: D1Database): Promise<StatsResult> {
  const totals = await db
    .prepare(`SELECT COUNT(*) AS attempts, AVG(score) AS avg_score FROM attempts`)
    .first<{ attempts: number; avg_score: number | null }>();

  const { results } = await db
    .prepare(
      `SELECT ref_id, ref_name, COUNT(*) AS count, AVG(score) AS avg_score
         FROM attempts GROUP BY ref_id, ref_name ORDER BY count DESC LIMIT 20`
    )
    .all<{ ref_id: string; ref_name: string; count: number; avg_score: number }>();

  return {
    attempts: totals?.attempts ?? 0,
    avgScore: totals?.avg_score ? Math.round(totals.avg_score) : 0,
    perPaket: (results ?? []).map((row) => ({
      refId: row.ref_id,
      refName: row.ref_name,
      count: row.count,
      avgScore: Math.round(row.avg_score ?? 0),
    })),
  };
}
