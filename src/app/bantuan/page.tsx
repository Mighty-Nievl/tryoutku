import Link from "next/link";

export const metadata = {
  title: "Bantuan",
  description: "Cara memakai TryOutku: mode tryout, mode latihan, XP, lencana, dan arti tiap angka.",
};

export default function BantuanPage() {
  return (
    <div className="max-w-3xl space-y-8 py-4">
      <header>
        <p className="label">Bantuan</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">Cara memakai TryOutku</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          TryOutku adalah alat latihan mandiri untuk UTBK SNBT dan ujian sekolah SMA. Semua soal
          berisi kunci dan pembahasan, dan penilaian dilakukan otomatis di perangkatmu.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold">Dua mode utama</h2>
        <div className="card p-5">
          <h3 className="text-sm font-semibold">Tryout</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Kamu memilih paket, lalu mengerjakan sejumlah soal dengan timer sesuai durasi paket.
            Jawaban tersimpan otomatis, termasuk sisa waktu, jadi menutup tab tidak menghapus
            pekerjaan. Setelah dikumpulkan, hasil dipecah per subtes dan setiap butir punya
            pembahasan.
          </p>
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-semibold">Latihan</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Satu subtes atau mapel, satu soal setiap layar, dan jawaban langsung dinilai. Cocok untuk
            memperbaiki materi tertentu setelah melihat subtes terlemah pada hasil tryout. Progres
            latihan juga tersimpan kalau kamu keluar di tengah sesi.
          </p>
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-semibold">Tantangan harian</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Lima soal yang sama untuk semua pengunjung setiap hari, dengan bonus XP. Satu tantangan
            per hari supaya kebiasaan belajarnya terbentuk.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold">Cara XP dan level dihitung</h2>
        <ul className="space-y-2 text-sm leading-relaxed text-muted">
          <li className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>Tryout: 10 XP per jawaban benar, ditambah 60 XP bila skor sesi 75% atau lebih.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>Latihan: 5 XP per jawaban benar.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>
              Tantangan harian: 12 XP per jawaban benar, ditambah 30 XP bila skor 80% atau lebih.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>
              Level naik berdasarkan total XP, dari Pemula sampai Jagoan. XP tidak berkurang kalau
              kamu mendapat skor rendah, tetapi tidak ada XP dari sesi yang tidak diselesaikan.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>
              Streak adalah jumlah hari berturut-turut kamu menyelesaikan minimal satu sesi. Kalau
              satu hari terlewat, streak mulai dari satu lagi.
            </span>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold">Pintasan papan ketik</h2>
        <div className="card p-5 text-sm leading-relaxed text-muted">
          <p>
            Angka 1 sampai 4 memilih jawaban, panah kiri dan kanan berpindah soal, dan huruf F
            menandai soal ragu. Escape menutup dialog. Semua tombol bisa dicapai dengan Tab.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold">Kalau ada yang tidak berjalan</h2>
        <ul className="space-y-2 text-sm leading-relaxed text-muted">
          <li className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>
              Hasil tidak muncul di papan skor: pastikan halaman selesai memuat, lalu buka ulang
              halaman skor. Papan skor butuh koneksi karena datanya dari server.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>
              Riwayat hilang: riwayat lokal terikat pada browser. Menghapus data situs berarti
              kehilangan riwayat di perangkat itu.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>
              Tidak ada suara: efek suara bisa dimatikan di halaman profil, dan browser menahan suara
              sampai kamu menekan sesuatu di halaman.
            </span>
          </li>
        </ul>
      </section>

      <p className="border-t border-line pt-4 text-sm text-muted">
        Istilah angka seperti estimasi nilai dan tingkat soal dijelaskan di{" "}
        <Link href="/glosarium" className="text-accent underline-offset-4 hover:underline">
          glosarium
        </Link>
        .
      </p>
    </div>
  );
}
