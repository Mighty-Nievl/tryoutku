import { describe, expect, test } from "bun:test";
import { BANK, BANK_BY_SUBTEST, buildPaketQuestions, paketCapacity, shuffle } from "./bank";
import { PAKETS } from "./pakets";
import { SUBTEST_BY_ID } from "./subtests";

describe("integritas bank soal", () => {
  test("setiap soal punya id unik", () => {
    const ids = BANK.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("kunci jawaban selalu menunjuk opsi yang ada", () => {
    for (const item of BANK) {
      expect(item.options.length).toBeGreaterThanOrEqual(2);
      expect(item.answer).toBeGreaterThanOrEqual(0);
      expect(item.answer).toBeLessThan(item.options.length);
    }
  });

  test("setiap soal menempel pada subtes yang terdaftar", () => {
    for (const item of BANK) {
      expect(SUBTEST_BY_ID[item.subtest]).toBeDefined();
    }
  });

  test("setiap subtes punya cukup soal untuk satu paket tryout", () => {
    const needed = Math.max(
      ...PAKETS.flatMap((paket) => Object.values(paket.blueprint)),
    );
    for (const [subtest, questions] of Object.entries(BANK_BY_SUBTEST)) {
      expect({ subtest, count: questions.length >= needed }).toEqual({
        subtest,
        count: true,
      });
    }
  });

  test("blueprint setiap paket terpenuhi penuh oleh bank", () => {
    for (const paket of PAKETS) {
      const planned = Object.values(paket.blueprint).reduce((a, b) => a + b, 0);
      expect({ id: paket.id, capacity: paketCapacity(paket) }).toEqual({
        id: paket.id,
        capacity: planned,
      });
    }
  });

  test("blueprint hanya memakai subtes yang dikenal", () => {
    for (const paket of PAKETS) {
      for (const subtest of Object.keys(paket.blueprint)) {
        expect({ paket: paket.id, subtest, known: Boolean(SUBTEST_BY_ID[subtest]) }).toEqual({
          paket: paket.id,
          subtest,
          known: true,
        });
      }
    }
  });
});

describe("buildPaketQuestions", () => {
  test("menghasilkan jumlah soal sesuai blueprint", () => {
    for (const paket of PAKETS) {
      const planned = Object.values(paket.blueprint).reduce((a, b) => a + b, 0);
      const questions = buildPaketQuestions(paket, 12345);
      expect(questions.length).toBe(planned);
      expect(new Set(questions.map((item) => item.id)).size).toBe(questions.length);
    }
  });

  test("seed yang sama memberi set soal yang sama", () => {
    const a = buildPaketQuestions(PAKETS[0], 42).map((item) => item.id);
    const b = buildPaketQuestions(PAKETS[0], 42).map((item) => item.id);
    expect(a).toEqual(b);
  });

  test("seed berbeda memberi urutan berbeda", () => {
    const a = buildPaketQuestions(PAKETS[0], 1).map((item) => item.id);
    const b = buildPaketQuestions(PAKETS[0], 2).map((item) => item.id);
    expect(a).not.toEqual(b);
  });
});

describe("shuffle", () => {
  test("mempertahankan seluruh elemen", () => {
    const input = ["a", "b", "c", "d", "e"];
    const output = shuffle(input, () => 0.5);
    expect(output.sort()).toEqual([...input].sort());
    expect(input).toEqual(["a", "b", "c", "d", "e"]);
  });
});
