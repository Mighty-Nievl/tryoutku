import { describe, expect, test } from "bun:test";
import {
  clampIndex,
  clampMinutes,
  countAnswered,
  createDraft,
  elapsedSeconds,
  nextIndex,
  parseDraft,
  previousIndex,
  remainingSeconds,
  selectAnswer,
  shouldAutoSubmit,
  timeAnnouncement,
  toggleFlag,
} from "./session";

describe("createDraft", () => {
  test("menetapkan tenggat dari durasi paket", () => {
    const draft = createDraft({ durationMin: 45, now: 1_000, seed: 7 });
    expect(draft.seed).toBe(7);
    expect(draft.startedAt).toBe(1_000);
    expect(draft.deadline).toBe(1_000 + 45 * 60 * 1000);
    expect(draft.answers).toEqual({});
  });

  test("membuat seed berbeda bila tidak diberikan", () => {
    expect(createDraft({ durationMin: 10 }).seed).not.toBe(createDraft({ durationMin: 10 }).seed);
  });
});

describe("waktu", () => {
  test("sisa waktu tidak pernah negatif", () => {
    expect(remainingSeconds(2_000, 1_000)).toBe(1);
    expect(remainingSeconds(1_000, 5_000)).toBe(0);
  });

  test("waktu terpakai dipotong pada durasi paket", () => {
    expect(elapsedSeconds(0, 60_000, 45)).toBe(60);
    expect(elapsedSeconds(0, 99 * 60_000, 45)).toBe(45 * 60);
  });

  test("pengumuman hanya pada detik pertama melewati ambang", () => {
    expect(timeAnnouncement(601, 600)).toBe("Sisa waktu 10 menit.");
    expect(timeAnnouncement(600, 599)).toBeNull();
    expect(timeAnnouncement(301, 300)).toBe("Sisa waktu 5 menit.");
    expect(timeAnnouncement(61, 60)).toBe("Sisa waktu 1 menit.");
    expect(timeAnnouncement(900, 899)).toBeNull();
  });
});

describe("shouldAutoSubmit", () => {
  const base = { ready: true, hasResult: false, remaining: 0, deadline: 1 };

  test("benar saat waktu habis dan sesi berjalan", () => {
    expect(shouldAutoSubmit(base)).toBe(true);
  });

  test("tidak berjalan sebelum siap, setelah selesai, atau tanpa tenggat", () => {
    expect(shouldAutoSubmit({ ...base, ready: false })).toBe(false);
    expect(shouldAutoSubmit({ ...base, hasResult: true })).toBe(false);
    expect(shouldAutoSubmit({ ...base, deadline: 0 })).toBe(false);
    expect(shouldAutoSubmit({ ...base, remaining: 1 })).toBe(false);
  });
});

describe("navigasi", () => {
  test("indeks selalu di dalam rentang", () => {
    expect(clampIndex(-3, 10)).toBe(0);
    expect(clampIndex(99, 10)).toBe(9);
    expect(clampIndex(4, 10)).toBe(4);
    expect(clampIndex(3, 0)).toBe(0);
    expect(nextIndex(8, 10)).toBe(9);
    expect(nextIndex(9, 10)).toBe(9);
    expect(previousIndex(0)).toBe(0);
    expect(previousIndex(5)).toBe(4);
  });
});

describe("jawaban dan tanda ragu", () => {
  test("pilihan di luar rentang diabaikan", () => {
    const answers = { Q1: 1 };
    expect(selectAnswer(answers, "Q2", -1, 4)).toBe(answers);
    expect(selectAnswer(answers, "Q2", 4, 4)).toBe(answers);
    expect(selectAnswer(answers, "Q2", 1.5, 4)).toBe(answers);
    expect(selectAnswer(answers, "Q2", 2, 4)).toEqual({ Q1: 1, Q2: 2 });
  });

  test("tanda ragu berganti dan bisa dilepas", () => {
    const once = toggleFlag({}, "Q1");
    expect(once).toEqual({ Q1: true });
    expect(toggleFlag(once, "Q1")).toEqual({ Q1: false });
  });

  test("menghitung soal terjawab", () => {
    expect(countAnswered({})).toBe(0);
    expect(countAnswered({ Q1: 0, Q2: 3 })).toBe(2);
  });
});

describe("parseDraft", () => {
  test("mengembalikan null untuk isi kosong atau rusak", () => {
    expect(parseDraft(null, 45)).toBeNull();
    expect(parseDraft("bukan json", 45)).toBeNull();
    expect(parseDraft(JSON.stringify({ answers: {} }), 45)).toBeNull();
  });

  test("melengkapi bagian yang hilang dan memakai durasi bawaan", () => {
    const draft = parseDraft(JSON.stringify({ seed: 3, deadline: 9_000 }), 45);
    expect(draft).not.toBeNull();
    expect(draft?.answers).toEqual({});
    expect(draft?.flags).toEqual({});
    expect(draft?.durationMin).toBe(45);
    expect(typeof draft?.startedAt).toBe("number");
  });

  test("durasi pilihan sendiri dipertahankan", () => {
    const draft = parseDraft(JSON.stringify({ seed: 3, deadline: 9_000, durationMin: 25 }), 45);
    expect(draft?.durationMin).toBe(25);
  });
});

describe("clampMinutes", () => {
  test("membatasi ke rentang yang masuk akal", () => {
    expect(clampMinutes(1, 45)).toBe(5);
    expect(clampMinutes(999, 45)).toBe(180);
    expect(clampMinutes(20.4, 45)).toBe(20);
    expect(clampMinutes(Number.NaN, 45)).toBe(45);
    expect(clampMinutes(-3, 45)).toBe(5);
  });
});
