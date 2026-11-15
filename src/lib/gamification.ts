import type { Attempt } from "./types";

export interface LevelInfo {
  level: number;
  name: string;
  minXp: number;
  nextXp: number | null;
  /** 0 sampai 1, menuju level berikutnya */
  progress: number;
  xpIntoLevel: number;
  xpForLevel: number;
}

const LEVELS: { level: number; name: string; minXp: number }[] = [
  { level: 1, name: "Pemula", minXp: 0 },
  { level: 2, name: "Pemanasan", minXp: 150 },
  { level: 3, name: "Rajin", minXp: 400 },
  { level: 4, name: "Terlatih", minXp: 800 },
  { level: 5, name: "Sigap", minXp: 1_400 },
  { level: 6, name: "Tangkas", minXp: 2_200 },
  { level: 7, name: "Cermat", minXp: 3_200 },
  { level: 8, name: "Analitis", minXp: 4_500 },
  { level: 9, name: "Mahir", minXp: 6_000 },
  { level: 10, name: "Jagoan", minXp: 8_000 },
];

/** XP yang didapat dari satu sesi. Dihitung dari jawaban benar, bukan dari lama bermain. */
export function xpForAttempt(attempt: Attempt): number {
  const base =
    attempt.kind === "tryout"
      ? attempt.correct * 10
      : attempt.kind === "tantangan"
        ? attempt.correct * 12
        : attempt.correct * 5;
  const bonus =
    attempt.kind === "tryout" && attempt.score >= 75
      ? 60
      : attempt.kind === "tantangan" && attempt.score >= 80
        ? 30
        : 0;
  return base + bonus;
}

export function totalXp(attempts: Attempt[]): number {
  return attempts.reduce((sum, attempt) => sum + xpForAttempt(attempt), 0);
}

export function levelFor(xp: number): LevelInfo {
  let current = LEVELS[0];
  for (const item of LEVELS) {
    if (xp >= item.minXp) current = item;
  }
  const index = LEVELS.findIndex((item) => item.level === current.level);
  const next = LEVELS[index + 1] ?? null;
  const xpIntoLevel = xp - current.minXp;
  const xpForLevel = next ? next.minXp - current.minXp : 0;

  return {
    level: current.level,
    name: current.name,
    minXp: current.minXp,
    nextXp: next ? next.minXp : null,
    progress: next ? Math.min(1, xpIntoLevel / xpForLevel) : 1,
    xpIntoLevel,
    xpForLevel,
  };
}

function dayKey(iso: string): string {
  const date = new Date(iso);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export interface StreakInfo {
  current: number;
  longest: number;
  activeToday: boolean;
}

export function computeStreak(attempts: Attempt[]): StreakInfo {
  const days = [...new Set(attempts.map((attempt) => dayKey(attempt.createdAt)))].sort();
  if (days.length === 0) return { current: 0, longest: 0, activeToday: false };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i += 1) {
    const prev = new Date(`${days[i - 1]}T00:00:00`);
    const curr = new Date(`${days[i]}T00:00:00`);
    const gap = Math.round((curr.getTime() - prev.getTime()) / 86_400_000);
    run = gap === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const today = dayKey(new Date().toISOString());
  const activeToday = days[days.length - 1] === today;
  let current = 0;
  if (activeToday) {
    current = 1;
    for (let i = days.length - 1; i > 0; i -= 1) {
      const prev = new Date(`${days[i - 1]}T00:00:00`);
      const curr = new Date(`${days[i]}T00:00:00`);
      const gap = Math.round((curr.getTime() - prev.getTime()) / 86_400_000);
      if (gap === 1) current += 1;
      else break;
    }
  }

  return { current, longest, activeToday };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  /** dipakai sebagai penanda visual singkat */
  mark: string;
}

export interface GameStats {
  attempts: number;
  xp: number;
  level: number;
  streak: number;
  bestScore: number;
  subtesDikerjakan: number;
  paketSelesai: number;
  tantangan: number;
  tryout: number;
}

export const BADGES: Badge[] = [
  { id: "awal", name: "Langkah Pertama", description: "Selesaikan satu sesi apa saja.", mark: "1" },
  { id: "sepuluh", name: "Sepuluh Sesi", description: "Selesaikan sepuluh sesi latihan atau tryout.", mark: "10" },
  { id: "streak3", name: "Tiga Hari", description: "Belajar tiga hari berturut-turut.", mark: "3d" },
  { id: "streak7", name: "Seminggu Penuh", description: "Belajar tujuh hari berturut-turut.", mark: "7d" },
  { id: "skor70", name: "Tembus 70", description: "Dapat skor 70% atau lebih di satu sesi.", mark: "70" },
  { id: "skor85", name: "Tembus 85", description: "Dapat skor 85% atau lebih di satu sesi.", mark: "85" },
  { id: "paket3", name: "Tiga Paket", description: "Selesaikan tiga paket tryout berbeda.", mark: "P3" },
  { id: "semua-subtes", name: "Jelajah Subtes", description: "Coba keenam belas subtes dan mapel yang tersedia.", mark: "17" },
  { id: "rajin-tantangan", name: "Tukang Tantangan", description: "Selesaikan lima tantangan harian.", mark: "T5" },
];

export function summarize(attempts: Attempt[]): GameStats {
  const xp = totalXp(attempts);
  const level = levelFor(xp).level;
  const streak = computeStreak(attempts).current;
  const bestScore = attempts.reduce((best, attempt) => Math.max(best, attempt.score), 0);
  const subtes = new Set<string>();
  const paket = new Set<string>();
  let tantangan = 0;
  let tryout = 0;

  for (const attempt of attempts) {
    if (attempt.kind === "tryout") {
      tryout += 1;
      paket.add(attempt.refId);
    }
    if (attempt.kind === "tantangan") tantangan += 1;
    if (attempt.kind === "latihan") subtes.add(attempt.refId);
  }

  return {
    attempts: attempts.length,
    xp,
    level,
    streak,
    bestScore,
    subtesDikerjakan: subtes.size,
    paketSelesai: paket.size,
    tantangan,
    tryout,
  };
}

export function unlockedBadges(stats: GameStats): string[] {
  const unlocked: string[] = [];
  if (stats.attempts >= 1) unlocked.push("awal");
  if (stats.attempts >= 10) unlocked.push("sepuluh");
  if (stats.streak >= 3) unlocked.push("streak3");
  if (stats.streak >= 7) unlocked.push("streak7");
  if (stats.bestScore >= 70) unlocked.push("skor70");
  if (stats.bestScore >= 85) unlocked.push("skor85");
  if (stats.paketSelesai >= 3) unlocked.push("paket3");
  if (stats.subtesDikerjakan >= 17) unlocked.push("semua-subtes");
  if (stats.tantangan >= 5) unlocked.push("rajin-tantangan");
  return unlocked;
}

/** Level penguasaan per subtes dari riwayat latihan subtes itu. */
export function masteryFor(attempts: Attempt[], subtestId: string): { level: number; sesi: number; akurasi: number } {
  const related = attempts.filter((attempt) => attempt.kind === "latihan" && attempt.refId === subtestId);
  if (related.length === 0) return { level: 0, sesi: 0, akurasi: 0 };
  const totalCorrect = related.reduce((sum, attempt) => sum + attempt.correct, 0);
  const totalQuestions = related.reduce((sum, attempt) => sum + attempt.totalQuestions, 0);
  const akurasi = totalQuestions === 0 ? 0 : Math.round((totalCorrect / totalQuestions) * 100);
  const level = Math.max(1, Math.min(5, Math.floor(akurasi / 20) + 1));
  return { level, sesi: related.length, akurasi };
}
