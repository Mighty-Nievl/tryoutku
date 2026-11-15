import type { Attempt } from "./types";

const HISTORY_KEY = "tryoutku:v1:history";
const PRACTICE_KEY = "tryoutku:v1:practice";
const MAX_HISTORY = 100;

export interface PracticeStat {
  subtest: string;
  attempted: number;
  correct: number;
  masteredIds: string[];
  lastAt: string;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage penuh / private mode: abaikan */
  }
}

export function getHistory(): Attempt[] {
  return read<Attempt[]>(HISTORY_KEY, []);
}

export function saveAttempt(input: Omit<Attempt, "id" | "createdAt">): Attempt {
  const record: Attempt = {
    ...input,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `a-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  const next = [record, ...getHistory()].slice(0, MAX_HISTORY);
  write(HISTORY_KEY, next);
  return record;
}

export function clearHistory(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(HISTORY_KEY);
}

export function getPracticeStats(): Record<string, PracticeStat> {
  return read<Record<string, PracticeStat>>(PRACTICE_KEY, {});
}

export function recordPractice(
  subtest: string,
  isCorrect: boolean,
  questionId: string
): void {
  const all = getPracticeStats();
  const prev: PracticeStat =
    all[subtest] ?? { subtest, attempted: 0, correct: 0, masteredIds: [], lastAt: "" };
  const mastered = new Set(prev.masteredIds);
  if (isCorrect) mastered.add(questionId);
  all[subtest] = {
    subtest,
    attempted: prev.attempted + 1,
    correct: prev.correct + (isCorrect ? 1 : 0),
    masteredIds: [...mastered],
    lastAt: new Date().toISOString(),
  };
  write(PRACTICE_KEY, all);
}

export function accuracy(stat?: PracticeStat): number {
  if (!stat || stat.attempted === 0) return 0;
  return Math.round((stat.correct / stat.attempted) * 100);
}

/* ---------- draft latihan: sesi tidak hilang saat pengguna keluar ---------- */

export interface PracticeDraft {
  subtest: string;
  questionIds: string[];
  answers: Record<string, number>;
  index: number;
  startedAt: number;
}

function practiceDraftKey(subtest: string): string {
  return `tryoutku:v1:practice-draft:${subtest}`;
}

export function getPracticeDraft(subtest: string): PracticeDraft | null {
  const draft = read<PracticeDraft | null>(practiceDraftKey(subtest), null);
  if (!draft || !Array.isArray(draft.questionIds) || draft.questionIds.length === 0) return null;
  return draft;
}

export function savePracticeDraft(draft: PracticeDraft): void {
  write(practiceDraftKey(draft.subtest), draft);
}

export function clearPracticeDraft(subtest: string): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(practiceDraftKey(subtest));
}
