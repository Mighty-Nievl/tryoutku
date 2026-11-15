import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";

type Env = { DB: D1Database };

interface AttemptPayload {
  id: string;
  kind: string;
  refId: string;
  refName: string;
  createdAt: string;
  durationSec: number;
  totalQuestions: number;
  correct: number;
  score: number;
  perSubtest: Record<string, { correct: number; total: number }>;
  answers: Record<string, number>;
  questionIds: string[];
}

const app = new Hono<{ Bindings: Env }>().basePath("/api");

/* ---------- util validasi ---------- */

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

function parseAttempt(value: unknown): AttemptPayload | null {
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
    const n = num(picked, 0, 9);
    if (n === null) return null;
    answers[key.slice(0, 64)] = n;
  }

  const perSubtest: Record<string, { correct: number; total: number }> = {};
  for (const [key, bucket] of Object.entries(value.perSubtest)) {
    if (!isObject(bucket)) return null;
    const c = num(bucket.correct, 0, 500);
    const t = num(bucket.total, 0, 500);
    if (c === null || t === null) return null;
    perSubtest[key.slice(0, 32)] = { correct: c, total: t };
  }

  return {
    id,
    kind,
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

/* ---------- routes ---------- */

app.get("/health", (c) =>
  c.json({
    ok: true,
    service: "tryoutku-api",
    runtime: "hono @ cloudflare pages functions",
    time: new Date().toISOString(),
  })
);

app.post("/attempts", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!isObject(body)) return c.json({ error: "Body JSON tidak valid" }, 400);

  const deviceId = str(body.deviceId, 64);
  const player = typeof body.player === "string" ? body.player.slice(0, 32) : null;
  const attempt = parseAttempt(body.attempt);

  if (!deviceId || !attempt) return c.json({ error: "Data attempt tidak lengkap" }, 400);

  await c.env.DB.prepare(
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

  return c.json({ ok: true, id: attempt.id });
});

app.get("/attempts", async (c) => {
  const deviceId = str(c.req.query("deviceId"), 64);
  if (!deviceId) return c.json({ error: "deviceId wajib diisi" }, 400);
  const limit = Math.min(Math.max(Number(c.req.query("limit")) || 50, 1), 200);

  const { results } = await c.env.DB.prepare(
    `SELECT id, player, kind, ref_id, ref_name, created_at, duration_sec,
            total_questions, correct, score, per_subtest, answers, question_ids
       FROM attempts WHERE device_id = ? ORDER BY created_at DESC LIMIT ?`
  )
    .bind(deviceId, limit)
    .all<Record<string, unknown>>();

  return c.json({
    attempts: (results ?? []).map((row) => ({
      id: row.id,
      player: row.player,
      kind: row.kind,
      refId: row.ref_id,
      refName: row.ref_name,
      createdAt: row.created_at,
      durationSec: row.duration_sec,
      totalQuestions: row.total_questions,
      correct: row.correct,
      score: row.score,
      perSubtest: JSON.parse(String(row.per_subtest)),
      answers: JSON.parse(String(row.answers)),
      questionIds: JSON.parse(String(row.question_ids)),
    })),
  });
});

app.get("/attempts/:id", async (c) => {
  const id = c.req.param("id");
  const row = await c.env.DB.prepare(
    `SELECT id, kind, ref_id, ref_name, created_at, duration_sec, total_questions,
            correct, score, per_subtest, answers, question_ids
       FROM attempts WHERE id = ?`
  )
    .bind(id)
    .first<Record<string, unknown>>();

  if (!row) return c.json({ error: "Attempt tidak ditemukan" }, 404);

  return c.json({
    attempt: {
      id: row.id,
      kind: row.kind,
      refId: row.ref_id,
      refName: row.ref_name,
      createdAt: row.created_at,
      durationSec: row.duration_sec,
      totalQuestions: row.total_questions,
      correct: row.correct,
      score: row.score,
      perSubtest: JSON.parse(String(row.per_subtest)),
      answers: JSON.parse(String(row.answers)),
      questionIds: JSON.parse(String(row.question_ids)),
    },
  });
});

app.delete("/attempts", async (c) => {
  const deviceId = str(c.req.query("deviceId"), 64);
  if (!deviceId) return c.json({ error: "deviceId wajib diisi" }, 400);
  const result = await c.env.DB.prepare("DELETE FROM attempts WHERE device_id = ?")
    .bind(deviceId)
    .run();
  return c.json({ ok: true, deleted: result.meta.changes ?? 0 });
});

app.get("/leaderboard", async (c) => {
  const ref = str(c.req.query("ref"), 64);
  const limit = Math.min(Math.max(Number(c.req.query("limit")) || 10, 1), 50);

  const query = ref
    ? c.env.DB.prepare(
        `SELECT player, score, correct, total_questions, duration_sec, created_at
           FROM attempts WHERE kind = 'tryout' AND ref_id = ?
          ORDER BY score DESC, duration_sec ASC, created_at ASC LIMIT ?`
      ).bind(ref, limit)
    : c.env.DB.prepare(
        `SELECT player, score, correct, total_questions, duration_sec, created_at
           FROM attempts WHERE kind = 'tryout'
          ORDER BY score DESC, duration_sec ASC, created_at ASC LIMIT ?`
      ).bind(limit);

  const { results } = await query.all<Record<string, unknown>>();
  return c.json({
    ref: ref ?? "semua",
    rows: (results ?? []).map((row, index) => ({
      rank: index + 1,
      player: row.player ?? "Anonim",
      score: row.score,
      correct: row.correct,
      total: row.total_questions,
      durationSec: row.duration_sec,
      createdAt: row.created_at,
    })),
  });
});

app.get("/stats", async (c) => {
  const totals = await c.env.DB.prepare(
    `SELECT COUNT(*) AS attempts, AVG(score) AS avg_score FROM attempts`
  ).first<{ attempts: number; avg_score: number | null }>();

  const { results } = await c.env.DB.prepare(
    `SELECT ref_id, ref_name, COUNT(*) AS count, AVG(score) AS avg_score
       FROM attempts GROUP BY ref_id, ref_name ORDER BY count DESC LIMIT 20`
  ).all<{ ref_id: string; ref_name: string; count: number; avg_score: number }>();

  return c.json({
    attempts: totals?.attempts ?? 0,
    avgScore: totals?.avg_score ? Math.round(totals.avg_score) : 0,
    perPaket: (results ?? []).map((row) => ({
      refId: row.ref_id,
      refName: row.ref_name,
      count: row.count,
      avgScore: Math.round(row.avg_score ?? 0),
    })),
  });
});

app.notFound((c) => c.json({ error: `Rute tidak dikenal: ${c.req.path}` }, 404));

app.onError((error, c) => {
  console.error("API error", error);
  return c.json({ error: "Terjadi kesalahan pada server" }, 500);
});

export const onRequest = handle(app);
