import { describe, expect, test } from "bun:test";
import { rowToAttempt, rowToLeaderRow } from "./attempt-rows";

const row = {
  id: "a1",
  kind: "tryout",
  ref_id: "snbt-mini-1",
  ref_name: "Tryout SNBT Mini #1",
  created_at: "2026-11-15T10:00:00.000Z",
  duration_sec: 900,
  total_questions: 35,
  correct: 20,
  score: 57,
  per_subtest: JSON.stringify({ pu: { correct: 5, total: 6 } }),
  answers: JSON.stringify({ Q1: 0 }),
  question_ids: JSON.stringify(["Q1"]),
};

describe("rowToAttempt", () => {
  test("memetakan kolom D1 ke bentuk Attempt", () => {
    const attempt = rowToAttempt(row);
    expect(attempt.id).toBe("a1");
    expect(attempt.refId).toBe("snbt-mini-1");
    expect(attempt.durationSec).toBe(900);
    expect(attempt.perSubtest).toEqual({ pu: { correct: 5, total: 6 } });
    expect(attempt.questionIds).toEqual(["Q1"]);
  });

  test("JSON rusak diganti nilai kosong, bukan melempar", () => {
    const attempt = rowToAttempt({ ...row, answers: "{bukan json", question_ids: null });
    expect(attempt.answers).toEqual({});
    expect(attempt.questionIds).toEqual([]);
  });

  test("angka berbentuk teks dikonversi", () => {
    const attempt = rowToAttempt({ ...row, score: "80", correct: "28" });
    expect(attempt.score).toBe(80);
    expect(attempt.correct).toBe(28);
  });

  test("angka tidak masuk akal jatuh ke nol", () => {
    const attempt = rowToAttempt({ ...row, score: "abc", duration_sec: undefined });
    expect(attempt.score).toBe(0);
    expect(attempt.durationSec).toBe(0);
  });

  test("jenis sesi yang tidak dikenal diganti tryout", () => {
    expect(rowToAttempt({ ...row, kind: "aneh" }).kind).toBe("tryout");
    expect(rowToAttempt({ ...row, kind: "latihan" }).kind).toBe("latihan");
  });
});

describe("rowToLeaderRow", () => {
  test("memberi peringkat berurutan dan nama cadangan", () => {
    const first = rowToLeaderRow({ ...row, player: null, score: 90 }, 0);
    expect(first).toMatchObject({ rank: 1, player: "Anonim", score: 90, total: 35 });
    expect(rowToLeaderRow(row, 4).rank).toBe(5);
  });
});
