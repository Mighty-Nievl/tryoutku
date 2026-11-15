import { describe, expect, test } from "bun:test";
import { weakestSubtest } from "./gamification";
import type { Attempt } from "./types";

const attempt = (perSubtest: Attempt["perSubtest"]): Attempt => ({
  id: Math.random().toString(36),
  kind: "tryout",
  refId: "snbt-mini-1",
  refName: "Tryout",
  createdAt: "2026-11-15T10:00:00.000Z",
  durationSec: 600,
  totalQuestions: 10,
  correct: 5,
  score: 50,
  perSubtest,
  answers: {},
  questionIds: [],
});

describe("weakestSubtest", () => {
  test("mengembalikan null tanpa riwayat", () => {
    expect(weakestSubtest([])).toBeNull();
  });

  test("memilih persentase terendah", () => {
    const spot = weakestSubtest([
      attempt({ pu: { correct: 5, total: 6 }, pk: { correct: 1, total: 6 } }),
      attempt({ pu: { correct: 4, total: 6 }, pk: { correct: 2, total: 6 } }),
    ]);
    expect(spot).toMatchObject({ id: "pk", correct: 3, total: 12, percent: 25 });
  });

  test("mengabaikan subtes dengan sampel terlalu kecil", () => {
    const spot = weakestSubtest([
      attempt({ pu: { correct: 5, total: 6 }, pm: { correct: 0, total: 2 } }),
    ]);
    expect(spot?.id).toBe("pu");
  });

  test("null bila semua subtes sampelnya kurang", () => {
    expect(weakestSubtest([attempt({ pm: { correct: 0, total: 1 } })])).toBeNull();
  });
});
