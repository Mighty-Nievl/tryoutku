import type { Paket, Question } from "./types";

// Bank soal dimuat dari file JSON per subtes. Kunci jawaban ikut ter-bundle
// (aplikasi statis tanpa backend, semua penilaian berjalan di browser).
import pu from "@/data/pu.json";
import ppu from "@/data/ppu.json";
import pbm from "@/data/pbm.json";
import pk from "@/data/pk.json";
import litId from "@/data/lit-id.json";
import litEn from "@/data/lit-en.json";
import pm from "@/data/pm.json";
import matWajib from "@/data/mat-wajib.json";
import bindo from "@/data/bindo.json";
import bing from "@/data/bing.json";
import fisika from "@/data/fisika.json";
import kimia from "@/data/kimia.json";
import biologi from "@/data/biologi.json";
import ekonomi from "@/data/ekonomi.json";
import sosiologi from "@/data/sosiologi.json";
import geografi from "@/data/geografi.json";
import sejarah from "@/data/sejarah.json";

const RAW: unknown[] = [
  pu,
  ppu,
  pbm,
  pk,
  litId,
  litEn,
  pm,
  matWajib,
  bindo,
  bing,
  fisika,
  kimia,
  biologi,
  ekonomi,
  sosiologi,
  geografi,
  sejarah,
];

function validate(list: Question[], file: string): Question[] {
  const seen = new Set<string>();
  for (const q of list) {
    if (!q.id || !q.subtest || !q.question || !Array.isArray(q.options)) {
      throw new Error(`Data soal tidak lengkap di ${file}: ${JSON.stringify(q).slice(0, 120)}`);
    }
    if (seen.has(q.id)) throw new Error(`ID soal duplikat: ${q.id} (${file})`);
    seen.add(q.id);
    if (q.answer < 0 || q.answer >= q.options.length) {
      throw new Error(`Kunci jawaban di luar rentang pada soal ${q.id}`);
    }
  }
  return list;
}

export const BANK: Question[] = RAW.flatMap((file, i) =>
  validate(file as Question[], `data[${i}]`)
);

export const BANK_BY_SUBTEST: Record<string, Question[]> = BANK.reduce(
  (acc, q) => {
    (acc[q.subtest] ||= []).push(q);
    return acc;
  },
  {} as Record<string, Question[]>
);

export function getQuestion(id: string): Question | undefined {
  return BANK.find((q) => q.id === id);
}

function mulberry32(seed: number) {
  return function rng() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Bangun set soal untuk satu paket tryout, acak namun deterministik per seed. */
export function buildPaketQuestions(paket: Paket, seed = Date.now()): Question[] {
  const rng = mulberry32(seed);
  const out: Question[] = [];
  for (const [subtestId, count] of Object.entries(paket.blueprint)) {
    const pool = BANK_BY_SUBTEST[subtestId] ?? [];
    if (pool.length === 0) continue;
    out.push(...shuffle(pool, rng).slice(0, Math.min(count, pool.length)));
  }
  return out;
}

/** Jumlah soal yang benar-benar bisa disajikan sebuah paket. */
export function paketCapacity(paket: Paket): number {
  return Object.entries(paket.blueprint).reduce(
    (sum, [subtestId, count]) =>
      sum + Math.min(count, BANK_BY_SUBTEST[subtestId]?.length ?? 0),
    0
  );
}
