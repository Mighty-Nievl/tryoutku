import type { Paket } from "./types";

export const PAKETS: Paket[] = [
  {
    id: "snbt-mini-1",
    track: "snbt",
    name: "Tryout SNBT Mini #1",
    description: "Paket ringkas semua subtes SNBT. Cocok untuk simulasi 45 menit.",
    durationMin: 45,
    blueprint: { pu: 5, ppu: 5, pbm: 5, pk: 5, "lit-id": 5, "lit-en": 5, pm: 5 },
  },
  {
    id: "snbt-mini-2",
    track: "snbt",
    name: "Tryout SNBT Mini #2",
    description: "Soal berbeda dari paket #1 dengan proporsi subtes yang sama.",
    durationMin: 45,
    blueprint: { pu: 5, ppu: 5, pbm: 5, pk: 5, "lit-id": 5, "lit-en": 5, pm: 5 },
  },
  {
    id: "snbt-tps",
    track: "snbt",
    name: "Fokus TPS",
    description: "Hanya Tes Potensi Skolastik: PU, PPU, PBM, PK.",
    durationMin: 30,
    blueprint: { pu: 6, ppu: 6, pbm: 6, pk: 6 },
  },
  {
    id: "snbt-literasi",
    track: "snbt",
    name: "Fokus Literasi & PM",
    description: "Literasi Bahasa Indonesia, Literasi Bahasa Inggris, Penalaran Matematika.",
    durationMin: 35,
    blueprint: { "lit-id": 6, "lit-en": 6, pm: 6 },
  },
  {
    id: "sekolah-ipa-1",
    track: "sekolah",
    name: "Tryout Ujian Sekolah - IPA",
    description: "Matematika, Fisika, Kimia, Biologi untuk jurusan IPA.",
    durationMin: 60,
    blueprint: { "mat-wajib": 6, fisika: 5, kimia: 5, biologi: 5 },
  },
  {
    id: "sekolah-ips-1",
    track: "sekolah",
    name: "Tryout Ujian Sekolah - IPS",
    description: "Matematika, Ekonomi, Sosiologi, Geografi untuk jurusan IPS.",
    durationMin: 60,
    blueprint: { "mat-wajib": 6, ekonomi: 5, sosiologi: 5, geografi: 5 },
  },
  {
    id: "sekolah-bahasa-1",
    track: "sekolah",
    name: "Tryout Bahasa",
    description: "Bahasa Indonesia dan Bahasa Inggris plus Sejarah.",
    durationMin: 40,
    blueprint: { bindo: 6, bing: 6, sejarah: 5 },
  },
];

export const PAKET_BY_ID: Record<string, Paket> = Object.fromEntries(
  PAKETS.map((p) => [p.id, p])
);

/** Jumlah soal yang diminta blueprint sebuah paket. */
export function paketSoal(paket: Paket): number {
  return Object.values(paket.blueprint).reduce((total, jumlah) => total + jumlah, 0);
}
