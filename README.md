# TryOutku 🎯

Simulasi ujian SMA: persiapan **UTBK SNBT** dan **ujian sekolah**. Dua mode: tryout bertimer dengan penilaian otomatis, dan latihan per subtes dengan pembahasan instan.

Tanpa akun, tanpa backend — semua progres tersimpan di perangkat (localStorage).

## ✨ Fitur

- **Mode Tryout** — timer countdown, navigasi grid soal, tandai ragu, auto-submit saat waktu habis, sisa waktu tetap tersimpan walau tab ditutup.
- **Mode Latihan** — per subtes/mapel, jawaban langsung dinilai, pembahasan muncul seketika, akurasi per subtes dilacak.
- **Hasil terperinci** — skor total, benar/salah/kosong, rincian per subtes, penunjukan subtes terlemah, estimasi nilai 200–800.
- **Pembahasan lengkap** — setiap butir punya penjelasan alasan jawaban benar.
- **Riwayat** — semua sesi tercatat, bisa dibuka ulang untuk melihat pembahasan per soal.
- **PWA-ready static export** — deploy ke Cloudflare Pages / Vercel / Netlify tanpa server.

## 🗂️ Cakupan materi

**UTBK SNBT (7 subtes):** Penalaran Umum, Pengetahuan & Pemahaman Umum, Pemahaman Bacaan & Menulis, Pengetahuan Kuantitatif, Literasi Bahasa Indonesia, Literasi Bahasa Inggris, Penalaran Matematika.

**Ujian sekolah (10 mapel):** Matematika, Bahasa Indonesia, Bahasa Inggris, Fisika, Kimia, Biologi, Ekonomi, Sosiologi, Geografi, Sejarah.

Total **198 soal** dengan kunci dan pembahasan. Lihat `src/data/`.

## 🛠️ Teknologi

- Next.js 15 (App Router, `output: "export"` — murni statis)
- TypeScript + Tailwind CSS + framer-motion
- Toolchain: **Bun**

## 🚀 Development

```bash
bun install
bun run dev        # http://localhost:3000
bun run typecheck
bun run build      # hasil statis di out/
```

## 📦 Deploy

Contoh Cloudflare Pages:

```bash
bun run build
npx wrangler pages deploy out --project-name tryoutku
```

Vercel: framework Next.js, build command `next build`, output `out`.

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
src/
├── app/                     # halaman (landing, tryout, latihan, riwayat)
├── components/              # TryoutRunner, PracticeRunner, QuestionView, dll.
├── data/                    # bank soal per subtes (JSON)
└── lib/                     # bank loader, scoring, storage, tipe, paket
```

## ⚠️ Catatan

TryOutku adalah alat latihan mandiri, bukan penyelenggara resmi UTBK/SNBT atau ujian sekolah. Estimasi nilai bersifat perkiraan kasar, bukan skor IRT resmi.

---

© 2026 TryOutku — Rezal Helvin Bramantara
