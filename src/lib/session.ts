/**
 * Logika sesi ujian sebagai fungsi murni. Komponen hanya menyimpan state dan
 * memanggil fungsi di sini, jadi aturan seperti "indeks tidak boleh keluar
 * rentang" atau "auto-submit hanya sekali" bisa diuji tanpa browser.
 */

export interface SessionDraft {
  seed: number;
  answers: Record<string, number>;
  flags: Record<string, boolean>;
  startedAt: number;
  deadline: number;
}

export interface DraftInput {
  durationMin: number;
  now?: number;
  seed?: number;
}

export function createSeed(): number {
  return Math.floor(Math.random() * 1_000_000_000);
}

export function createDraft({ durationMin, now = Date.now(), seed }: DraftInput): SessionDraft {
  return {
    seed: seed ?? createSeed(),
    answers: {},
    flags: {},
    startedAt: now,
    deadline: now + durationMin * 60 * 1000,
  };
}

/** Sisa waktu dalam detik, tidak pernah negatif. */
export function remainingSeconds(deadline: number, now: number): number {
  return Math.max(0, Math.floor((deadline - now) / 1000));
}

/** Waktu terpakai dalam detik, dipotong pada durasi paket. */
export function elapsedSeconds(startedAt: number, now: number, durationMin: number): number {
  return Math.min(Math.round((now - startedAt) / 1000), durationMin * 60);
}

export interface AutoSubmitInput {
  ready: boolean;
  hasResult: boolean;
  remaining: number;
  deadline: number;
}

/** Auto-submit hanya berlaku saat sesi siap, belum selesai, dan waktu habis. */
export function shouldAutoSubmit({
  ready,
  hasResult,
  remaining,
  deadline,
}: AutoSubmitInput): boolean {
  return ready && !hasResult && deadline > 0 && remaining <= 0;
}

export function clampIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max(0, index), total - 1);
}

export function nextIndex(index: number, total: number): number {
  return clampIndex(index + 1, total);
}

export function previousIndex(index: number): number {
  return Math.max(0, index - 1);
}

/**
 * Menyimpan pilihan jawaban. Pilihan di luar rentang diabaikan, jadi pintasan
 * papan ketik tidak bisa menyimpan jawaban yang tidak ada.
 */
export function selectAnswer(
  answers: Record<string, number>,
  questionId: string,
  option: number,
  optionCount: number
): Record<string, number> {
  if (!Number.isInteger(option) || option < 0 || option >= optionCount) return answers;
  return { ...answers, [questionId]: option };
}

export function toggleFlag(
  flags: Record<string, boolean>,
  questionId: string
): Record<string, boolean> {
  return { ...flags, [questionId]: !flags[questionId] };
}

export function countAnswered(answers: Record<string, number>): number {
  return Object.keys(answers).length;
}

/**
 * Pengumuman waktu untuk pembaca layar. Mengembalikan teks hanya pada detik
 * pertama melewati ambang, supaya tidak diumumkan berulang setiap detik.
 */
export function timeAnnouncement(previous: number, current: number): string | null {
  const thresholds = [
    { at: 600, text: "Sisa waktu 10 menit." },
    { at: 300, text: "Sisa waktu 5 menit." },
    { at: 60, text: "Sisa waktu 1 menit." },
  ];
  return thresholds.find((item) => previous > item.at && current <= item.at)?.text ?? null;
}

/** Membaca draft dari penyimpanan, mengabaikan isi rusak. */
export function parseDraft(raw: string | null): SessionDraft | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SessionDraft>;
    if (typeof parsed.seed !== "number" || typeof parsed.deadline !== "number") return null;
    return {
      seed: parsed.seed,
      answers: parsed.answers ?? {},
      flags: parsed.flags ?? {},
      startedAt: typeof parsed.startedAt === "number" ? parsed.startedAt : Date.now(),
      deadline: parsed.deadline,
    };
  } catch {
    return null;
  }
}
