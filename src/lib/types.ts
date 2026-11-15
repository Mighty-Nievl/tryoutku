export type Track = "snbt" | "sekolah";

export interface Subtest {
  id: string;
  name: string;
  short: string;
  track: Track;
  /** tailwind gradient classes untuk header kartu */
  tone: string;
  blurb: string;
}

export interface Question {
  id: string;
  subtest: string;
  question: string;
  /** stimulus / teks bacaan, opsional */
  passage?: string;
  options: string[];
  /** index jawaban benar pada options */
  answer: number;
  explanation: string;
  /** 1 = mudah, 2 = sedang, 3 = sulit */
  level?: 1 | 2 | 3;
}

export interface Paket {
  id: string;
  track: Track;
  name: string;
  description: string;
  durationMin: number;
  /** subtest id -> jumlah soal */
  blueprint: Record<string, number>;
}

export interface Attempt {
  id: string;
  kind: "tryout" | "latihan" | "tantangan";
  refId: string;
  refName: string;
  createdAt: string;
  durationSec: number;
  totalQuestions: number;
  correct: number;
  score: number;
  perSubtest: Record<string, { correct: number; total: number }>;
  answers: Record<string, number>;
  questionIds: string[];
}
