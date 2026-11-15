# TryOutku 🎯

Simulasi ujian SMA: persiapan **UTBK SNBT** dan **ujian sekolah**. Dua mode: tryout bertimer dengan penilaian otomatis, dan latihan per subtes dengan pembahasan instan.

**Live:** https://tryoutku.pages.dev — frontend statis di Cloudflare Pages, backend **Hono** berjalan sebagai Pages Functions, data di **D1**.

## ✨ Fitur

- **Mode Tryout** — timer countdown, navigasi grid soal, tandai ragu, auto-submit saat waktu habis, sisa waktu tetap tersimpan walau tab ditutup.
- **Mode Latihan** — per subtes/mapel, jawaban langsung dinilai, pembahasan muncul seketika, akurasi per subtes dilacak.
- **Hasil terperinci** — skor total, benar/salah/kosong, rincian per subtes, penunjukan subtes terlemah, estimasi nilai 200–800.
- **Pembahasan lengkap** — setiap butir punya penjelasan alasan jawaban benar.
- **Riwayat tersinkron** — tersimpan di perangkat *dan* di D1 lewat API; dibuka ulang kapan saja untuk melihat pembahasan per soal.
- **Papan skor** — peringkat lintas peserta dari backend, dengan nama tampilan opsional.
- **Tetap jalan tanpa backend** — kalau API tidak terjangkau, aplikasi menilai dan menyimpan secara lokal.

## 🗂️ Cakupan materi

**UTBK SNBT (7 subtes):** Penalaran Umum, Pengetahuan & Pemahaman Umum, Pemahaman Bacaan & Menulis, Pengetahuan Kuantitatif, Literasi Bahasa Indonesia, Literasi Bahasa Inggris, Penalaran Matematika.

**Ujian sekolah (10 mapel):** Matematika, Bahasa Indonesia, Bahasa Inggris, Fisika, Kimia, Biologi, Ekonomi, Sosiologi, Geografi, Sejarah.

Total **198 soal** dengan kunci dan pembahasan. Lihat `src/data/`.

## 🛠️ Teknologi

- **Frontend:** Next.js 15 App Router, `output: "export"` (statis murni) + Tailwind CSS
- **Backend:** Hono 4 di Cloudflare Pages Functions (`functions/api/[[route]].ts`)
- **Database:** Cloudflare D1 (`attempts`), skema di `schema.sql`
- **Toolchain:** Bun untuk install, build, dan deploy

## 🚀 Development

```bash
bun install
bun run dev         # frontend saja, http://localhost:3000 (API lokal tidak aktif)
bun run typecheck   # tsc untuk app + functions
bun run build       # hasil statis di out/
bun run preview     # wrangler pages dev out → frontend + API Hono + D1 lokal
```

Untuk menguji backend secara lokal, siapkan D1 lokal sekali saja:

```bash
bunx wrangler d1 execute tryoutku-db --local --file=./schema.sql
```

## 📦 Deploy (Cloudflare Pages)

```bash
bun run build
bunx wrangler d1 execute tryoutku-db --remote --file=./schema.sql   # sekali saja
bunx wrangler pages deploy out --project-name tryoutku --branch main
```

`wrangler.toml` sudah memuat `pages_build_output_dir`, binding D1 (`DB`), dan `compatibility_date`, jadi satu perintah deploy mengunggah aset statis + bundle Functions sekaligus.

## 🔌 API

Base: `/api` (Hono, Pages Functions).

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/api/health` | status + runtime |
| POST | `/api/attempts` | simpan attempt `{ deviceId, player?, attempt }` (idempoten per `id`) |
| GET | `/api/attempts?deviceId=&limit=` | riwayat per perangkat |
| GET | `/api/attempts/:id` | detail satu attempt |
| DELETE | `/api/attempts?deviceId=` | hapus semua riwayat perangkat |
| GET | `/api/leaderboard?ref=&limit=` | peringkat tryout (skor desc, waktu asc) |
| GET | `/api/stats` | total sesi, rata-rata skor, paket terpopuler |

Semua payload divalidasi di server (tipe, rentang nilai, panjang string). Body tidak valid ditolak `400`.

## ➕ Menambah soal

Tambahkan objek ke file JSON yang sesuai di `src/data/`:

```json
{
  "id": "PK-13",
  "subtest": "pk",
  "question": "Pertanyaan ...",
  "passage": "Teks stimulus (opsional)",
  "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
  "answer": 0,
  "explanation": "Alasan jawaban benar ...",
  "level": 2
}
```

Aturan: `id` unik, `answer` adalah indeks (0 = A), `subtest` harus cocok dengan id di `src/lib/subtests.ts`. Validasi berjalan saat build — id duplikat atau kunci di luar rentang akan menggagalkan build.

Paket tryout didefinisikan di `src/lib/pakets.ts` (`blueprint`: subtes → jumlah soal).

## 📁 Struktur

```
functions/
└── api/[[route]].ts         # backend Hono (health, attempts, leaderboard, stats)
src/
├── app/                     # halaman: landing, tryout, latihan, papan-skor, riwayat
├── components/              # TryoutRunner, PracticeRunner, QuestionView, dll.
├── data/                    # bank soal per subtes (JSON)
└── lib/                     # bank loader, scoring, storage, api client, tipe, paket
schema.sql                   # tabel D1 + index
wrangler.toml                # konfigurasi Pages + binding D1
```

## ⚠️ Catatan

- Penilaian berjalan di klien; kunci jawaban ikut ter-bundle. Cukup untuk latihan, **bukan** ujian dengan integritas tinggi.
- Identitas berupa `deviceId` acak di localStorage, bukan akun. Menghapus data browser berarti kehilangan akses ke riwayat lama.
- TryOutku adalah alat latihan mandiri, bukan penyelenggara resmi UTBK/SNBT atau ujian sekolah. Estimasi nilai bersifat perkiraan kasar, bukan skor IRT resmi.

---

© 2026 TryOutku — Rezal Helvin Bramantara
