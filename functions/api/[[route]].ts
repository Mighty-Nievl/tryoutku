import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { parseAttempt } from "../../src/lib/attempt-guard";
import {
  deleteAttempts,
  findAttempt,
  listAttempts,
  readLeaderboard,
  readStats,
  saveAttempt,
} from "../repo";

type Env = { DB: D1Database };

const app = new Hono<{ Bindings: Env }>().basePath("/api");

/* Data publik yang jarang berubah: cache sebentar supaya D1 tidak dipukul
   setiap kali halaman papan skor dibuka. */
app.use("*", async (c, next) => {
  await next();
  if (
    c.req.method === "GET" &&
    (c.req.path.endsWith("/stats") || c.req.path.endsWith("/leaderboard"))
  ) {
    c.header("Cache-Control", "public, max-age=60, s-maxage=300");
  }
});

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max
    ? value
    : null;
}

function clampLimit(raw: string | undefined, fallback: number, max: number): number {
  return Math.min(Math.max(Number(raw) || fallback, 1), max);
}

/* ---------- routes: hanya HTTP ---------- */

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

  await saveAttempt(c.env.DB, deviceId, player, attempt);
  return c.json({ ok: true, id: attempt.id });
});

app.get("/attempts", async (c) => {
  const deviceId = str(c.req.query("deviceId"), 64);
  if (!deviceId) return c.json({ error: "deviceId wajib diisi" }, 400);

  const attempts = await listAttempts(c.env.DB, deviceId, clampLimit(c.req.query("limit"), 50, 200));
  return c.json({ attempts });
});

app.get("/attempts/:id", async (c) => {
  const attempt = await findAttempt(c.env.DB, c.req.param("id"));
  if (!attempt) return c.json({ error: "Attempt tidak ditemukan" }, 404);
  return c.json({ attempt });
});

app.delete("/attempts", async (c) => {
  const deviceId = str(c.req.query("deviceId"), 64);
  if (!deviceId) return c.json({ error: "deviceId wajib diisi" }, 400);

  const deleted = await deleteAttempts(c.env.DB, deviceId);
  return c.json({ ok: true, deleted });
});

app.get("/leaderboard", async (c) => {
  const ref = str(c.req.query("ref"), 64);
  const rows = await readLeaderboard(c.env.DB, ref, clampLimit(c.req.query("limit"), 10, 50));
  return c.json({ ref: ref ?? "semua", rows });
});

app.get("/stats", async (c) => c.json(await readStats(c.env.DB)));

app.notFound((c) => c.json({ error: `Rute tidak dikenal: ${c.req.path}` }, 404));

app.onError((error, c) => {
  console.error("API error", error);
  return c.json({ error: "Terjadi kesalahan pada server" }, 500);
});

export const onRequest = handle(app);
