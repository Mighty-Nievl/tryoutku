import { describe, expect, test } from "bun:test";
import { formatDate, formatDuration, scoreAnswers, toAttemptPayload } from "./scoring";
import type { Question } from "./types";

const q = (id: string, subtest: string, answer: number): Question => ({
  id,
  subtest,
  question: `Soal ${id}`,
  options: ["a", "b", "c", "d"],
  answer,
  explanation: "karena begitu",
});

const QUESTIONS = [q("Q1", "pu", 0), q("Q2", "pu", 2), q("Q3", "pk", 1), q("Q4", "pk", 3)];

describe("scoreAnswers", () => {
  test("menghitung benar, salah, kosong, dan persentase", () => {
    const result = scoreAnswers(QUESTIONS, { Q1: 0, Q2: 1, Q3: 1 });
    expect(result.total).toBe(4);
    expect(result.correct).toBe(2);
    expect(result.wrong).toBe(1);
    expect(result.blank).toBe(1);
    expect(result.percent).toBe(50);
  });

  test("estimasi nilai memakai skala 200-800 dan tetap di dalam batas", () => {
    expect(scoreAnswers(QUESTIONS, {}).estimate).toBe(200);
    expect(
      scoreAnswers(QUESTIONS, { Q1: 0, Q2: 2, Q3: 1, Q4: 3 }).estimate
    ).toBe(800);
    expect(scoreAnswers(QUESTIONS, { Q1: 0, Q2: 1, Q3: 1 }).estimate).toBe(500);
  });

  test("memecah hasil per subtes dan menandai yang terlemah", () => {
    const result = scoreAnswers(QUESTIONS, { Q1: 0, Q2: 2 });
    expect(result.perSubtest).toEqual([
      { id: "pu", name: "Penalaran Umum", short: "PU", correct: 2, total: 2, percent: 100 },
      {
        id: "pk",
        name: "Pengetahuan Kuantitatif",
        short: "PK",
        correct: 0,
        total: 2,
        percent: 0,
      },
    ]);
    expect(result.weakest?.id).toBe("pk");
  });

  test("tidak membagi nol saat tidak ada soal", () => {
    const result = scoreAnswers([], {});
    expect(result.percent).toBe(0);
    expect(result.weakest).toBeNull();
  });
});

describe("formatDuration", () => {
  test("menit dan detik diberi nol di depan", () => {
    expect(formatDuration(0)).toBe("00:00");
    expect(formatDuration(65)).toBe("01:05");
  });

  test("menyertakan jam bila lebih dari satu jam", () => {
    expect(formatDuration(3725)).toBe("1:02:05");
  });

  test("durasi negatif dijepit ke nol", () => {
    expect(formatDuration(-30)).toBe("00:00");
  });
});

describe("toAttemptPayload", () => {
  test("membentuk payload attempt dari hasil penilaian", () => {
    const answers = { Q1: 0, Q2: 2, Q3: 1, Q4: 3 };
    const result = scoreAnswers(QUESTIONS, answers);
    const payload = toAttemptPayload(
      { kind: "tryout", refId: "demo", refName: "Demo", durationSec: 90 },
      QUESTIONS,
      answers,
      result
    );
    expect(payload.totalQuestions).toBe(4);
    expect(payload.correct).toBe(4);
    expect(payload.score).toBe(100);
    expect(payload.questionIds).toEqual(["Q1", "Q2", "Q3", "Q4"]);
    expect(payload.perSubtest).toEqual({
      pu: { correct: 2, total: 2 },
      pk: { correct: 2, total: 2 },
    });
  });
});

describe("formatDate", () => {
  test("mengembalikan string berisi tahun", () => {
    expect(formatDate("2026-11-15T07:00:00.000Z")).toContain("2026");
  });
});
