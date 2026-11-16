import { describe, expect, test } from "bun:test";
import { settleSession } from "./reward";
import type { Attempt } from "./types";

const attempt = (over: Partial<Attempt> = {}): Attempt => ({
  id: over.id ?? "a1",
  kind: "tryout",
  refId: "snbt-mini-1",
  refName: "Tryout SNBT Mini #1",
  createdAt: over.createdAt ?? "2026-11-15T10:00:00.000Z",
  durationSec: 600,
  totalQuestions: 10,
  correct: 10,
  score: 100,
  perSubtest: {},
  answers: {},
  questionIds: [],
  ...over,
});

describe("settleSession", () => {
  test("XP mengikuti jawaban benar dengan aturan tryout", () => {
    const { reward } = settleSession([], attempt({ correct: 4, score: 40 }));
    expect(reward.xp).toBe(40);
  });

  test("bonus skor tinggi ditambahkan pada tryout", () => {
    const { reward } = settleSession([], attempt({ correct: 8, score: 80 }));
    expect(reward.xp).toBe(8 * 10 + 60);
  });

  test("sesi pertama memunculkan lencana, sesi berikutnya tidak", () => {
    const first = settleSession([], attempt({ id: "a1", correct: 4, score: 40 }));
    expect(first.celebration?.badges).toContain("awal");

    const history = [attempt({ id: "a1", correct: 4, score: 40 })];
    const second = settleSession(history, attempt({ id: "a2", correct: 4, score: 40 }));
    expect(second.celebration).toBeNull();
    expect(second.reward.stats.attempts).toBe(2);
  });

  test("naik level dilaporkan sebagai perayaan", () => {
    const history = [attempt({ id: "a1", correct: 7, score: 70 })];
    const { celebration, reward } = settleSession(history, attempt({ id: "a2", correct: 8, score: 80 }));
    expect(celebration?.leveledUp).toBe(true);
    expect(reward.level.level).toBe(2);
  });

  test("streak dihitung dari riwayat termasuk attempt baru", () => {
    // Tanggal mengikuti hari ini supaya test tidak kedaluwarsa; computeStreak
    // hanya menghitung streak berjalan bila ada attempt di hari yang sama.
    const atNoon = (offsetDays: number) => {
      const d = new Date();
      d.setDate(d.getDate() + offsetDays);
      d.setHours(12, 0, 0, 0);
      return d.toISOString();
    };
    const history = [attempt({ id: "a1", createdAt: atNoon(-1) })];
    const { reward } = settleSession(history, attempt({ id: "a2", createdAt: atNoon(0) }));
    expect(reward.streak.current).toBe(2);
  });
});
