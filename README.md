# TryOutku

Simulasi ujian SMA untuk persiapan UTBK SNBT dan ujian sekolah. Dua mode: tryout bertimer dengan penilaian otomatis, dan latihan per subtes dengan pembahasan instan.

Live: https://tryoutku.pages.dev. Frontend statis di Cloudflare Pages, backend Hono berjalan sebagai Pages Functions, data di D1.

## Fitur

- Mode tryout: timer, navigasi grid soal, tandai ragu, kumpul otomatis saat waktu habis, sisa waktu tetap tersimpan walau tab ditutup.
- Layar mulai sebelum timer berjalan: jumlah soal, durasi, komposisi per subtes, dan konsekuensi waktu habis ditampilkan lebih dulu. Salah tekan tidak memotong waktu.
- Durasi bisa diubah lewat tombol Ubah (5 sampai 180 menit, ada pilihan cepat 15/20/30/45/60/90). Nilainya diingat per paket dan disimpan di dalam draft sesi.
- Mode latihan: per subtes atau mapel, jawaban langsung dinilai, pembahasan muncul seketika, akurasi per subtes dilacak.
- Hasil terperinci: skor total, benar/salah/kosong, rincian per subtes, penanda subtes terlemah, estimasi nilai 200 sampai 800.
- Pembahasan tiap butir berisi alasan jawaban benar.
- Riwayat tersinkron: tersimpan di perangkat dan di D1 lewat API, bisa dibuka ulang kapan saja.
- Papan skor lintas peserta dari backend, dengan nama tampilan opsional.
- Tetap jalan tanpa backend: kalau API tidak terjangkau, aplikasi menilai dan menyimpan secara lokal.
- Pratinjau tautan untuk media sosial: `public/og.png` 1200x630 dibuat oleh `scripts/make-og.py`, plus kartu Twitter ringkas dan metadata per paket tryout. Ikon SVG, favicon, dan apple-touch-icon ikut disertakan.
- Empat tema di halaman profil: kertas (bawaan), putih, gelap, dan OLED hitam pekat. Pilihan disimpan di perangkat dan dipasang sebelum halaman digambar, jadi tidak berkedip saat dimuat.
- Imbalan sesi selalu tampil setelah sesi selesai, bukan hanya saat naik level: XP yang didapat, bar menuju level berikutnya, streak, dan total sesi.
- XP diperkirakan lebih dulu di dialog "Selesai mengerjakan?", memakai rumus yang sama dengan perhitungan setelah sesi disimpan.
- Di mode latihan, jawaban benar memberi umpan balik "+5 XP" singkat di samping maskot.

## Cakupan materi

UTBK SNBT (7 subtes): Penalaran Umum, Pengetahuan dan Pemahaman Umum, Pemahaman Bacaan dan Menulis, Pengetahuan Kuantitatif, Literasi Bahasa Indonesia, Literasi Bahasa Inggris, Penalaran Matematika.

Ujian sekolah (10 mapel): Matematika, Bahasa Indonesia, Bahasa Inggris, Fisika, Kimia, Biologi, Ekonomi, Sosiologi, Geografi, Sejarah.

Total 198 soal dengan kunci dan pembahasan di `src/data/`.

## Teknologi

- Frontend: Next.js 15 App Router, `output: "export"` (statis murni) dan Tailwind CSS.
- Backend: Hono 4 di Cloudflare Pages Functions (`functions/api/[[route]].ts`).
- Database: Cloudflare D1 (tabel `attempts`), skema di `schema.sql`.
- Toolchain: Bun untuk install, build, test, dan deploy.

## Development

```bash
bun install
bun run dev         # frontend saja, http://localhost:3000 (API lokal tidak aktif)
bun test            # 19 test: penilaian, format durasi, integritas bank soal
bun run typecheck   # tsc untuk app dan functions
bun run build       # hasil statis di out/
bun run preview     # wrangler pages dev out: frontend, API Hono, D1 lokal
```

Untuk menguji backend secara lokal, siapkan D1 lokal sekali saja:

```bash
bunx wrangler d1 execute tryoutku-db --local --file=./schema.sql
```

## Deploy (Cloudflare Pages)

```bash
bun run build
bunx wrangler d1 execute tryoutku-db --remote --file=./schema.sql   # sekali saja
bunx wrangler pages deploy out --project-name tryoutku --branch main
```

`wrangler.toml` memuat `pages_build_output_dir`, binding D1 (`DB`), dan `compatibility_date`, jadi satu perintah deploy mengunggah aset statis sekaligus bundle Functions.

## API

Base `/api` (Hono di Pages Functions).

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/api/health` | status dan runtime |
| POST | `/api/attempts` | simpan attempt `{ deviceId, player?, attempt }`, idempoten per `id` |
| GET | `/api/attempts?deviceId=&limit=` | riwayat per perangkat |
| GET | `/api/attempts/:id` | detail satu attempt |
| DELETE | `/api/attempts?deviceId=` | hapus semua riwayat perangkat |
| GET | `/api/leaderboard?ref=&limit=` | peringkat tryout, skor menurun lalu waktu tercepat |
| GET | `/api/stats` | total sesi, rata-rata skor, paket terpopuler |

Payload divalidasi di server (tipe, rentang nilai, panjang string). Body tidak valid ditolak dengan `400`.

## Menambah soal

Tambahkan objek ke berkas JSON yang sesuai di `src/data/`:

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

Aturan: `id` unik, `answer` adalah indeks (0 = A), `subtest` harus cocok dengan id di `src/lib/subtests.ts`. Validasi berjalan saat build dan saat `bun test`, jadi id duplikat atau kunci di luar rentang menggagalkan keduanya.

Paket tryout didefinisikan di `src/lib/pakets.ts` (`blueprint`: subtes ke jumlah soal).

## Arah desain

`DESIGN.md` mencatat arah visual (kertas ujian), palet, alasan tiap pilihan, dan hal yang sengaja tidak dipakai. Aturan antislop yang diikuti berasal dari koleksi `miqdadbadjuber/anti-slop`.

## Struktur

```
functions/
├── api/[[route]].ts         # HTTP saja: rute, validasi, kode status
└── repo.ts                  # semua query D1 di satu tempat
src/
├── app/                     # halaman: landing, tryout, latihan, papan-skor, riwayat
├── components/              # TryoutRunner, PracticeRunner, QuestionView, dll.
├── data/                    # bank soal per subtes (JSON)
└── lib/
    ├── session.ts           # logika sesi sebagai fungsi murni (waktu, navigasi, pilihan)
    ├── reward.ts            # perhitungan imbalan sesi, satu aturan untuk semua mode
    ├── useSessionReward.ts  # pembungkus React untuk reward.ts
    ├── attempt-rows.ts      # pemetaan baris D1 ke bentuk Attempt
    ├── keys.ts              # semua kunci localStorage di satu tempat
    ├── attempt-guard.ts     # validasi attempt, dipakai klien dan server
    ├── scoring.ts           # penilaian jawaban
    ├── gamification.ts      # XP, level, streak, lencana
    ├── bank.ts              # pemuat dan validator bank soal
    ├── storage.ts           # baca tulis penyimpanan perangkat
    ├── persist.ts           # simpan lokal lalu dorong ke API
    ├── api.ts               # klien HTTP
    ├── pakets.ts            # paket tryout
    └── subtests.ts          # daftar subtes dan mapel
schema.sql                   # tabel D1 dan index
wrangler.toml                # konfigurasi Pages dan binding D1
DESIGN.md                    # arah desain dan alasannya
```

Aturan batasnya: `lib` tidak boleh mengimpor dari `components` atau `app`, dan komponen tidak menulis query atau rumus yang sudah ada di `lib`. Logika yang punya aturan (waktu habis, navigasi, imbalan) hidup sebagai fungsi murni di `lib` supaya bisa diuji tanpa browser. Tes ada di `bun test`: 43 tes mencakup penilaian, bank soal, logika sesi, imbalan, dan pemetaan baris D1.

## Catatan

- Penilaian berjalan di klien, kunci jawaban ikut ter-bundle. Cukup untuk latihan, bukan ujian dengan integritas tinggi.
- Identitas berupa `deviceId` acak di localStorage, bukan akun. Menghapus data browser berarti kehilangan akses ke riwayat lama.
- TryOutku adalah alat latihan mandiri, bukan penyelenggara resmi UTBK/SNBT atau ujian sekolah. Estimasi nilai bersifat perkiraan, bukan skor IRT resmi.

---

© 2026 TryOutku, Rezal Helvin Bramantara
