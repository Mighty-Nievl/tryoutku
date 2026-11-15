import Link from "next/link";

export const metadata = {
  title: "Privasi",
  description: "Data apa yang disimpan TryOutku, di mana, untuk apa, dan cara menghapusnya.",
};

export default function PrivasiPage() {
  return (
    <div className="max-w-3xl space-y-6 py-4">
      <header>
        <p className="label">Privasi</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">Data yang disimpan</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          TryOutku tidak meminta akun, email, atau nomor telepon. Berikut rincian data yang benar-benar
          disimpan, di mana, dan cara menghapusnya.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold">Disimpan di perangkatmu</h2>
        <ul className="space-y-2 text-sm leading-relaxed text-muted">
          <li className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>Riwayat sesi: nama paket, skor, jumlah benar, jawaban, dan waktu pengerjaan.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>Draft ujian dan latihan yang belum selesai, termasuk sisa waktu.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>Profil: nama tampilan, avatar, dan pilihan efek suara.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>
              Pengenal perangkat berupa kode acak. Kode ini bukan identitas pribadi dan dibuat hanya
              sekali per browser.
            </span>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold">Dikirim ke server</h2>
        <ul className="space-y-2 text-sm leading-relaxed text-muted">
          <li className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>
              Setiap sesi yang selesai dikirim ke backend: pengenal perangkat, nama tampilan bila
              diisi, nama paket, skor, jumlah benar, dan jawaban per soal.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>
              Tujuannya dua: memulihkan riwayat bila data perangkat hilang, dan menyusun papan skor
              peringkat.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>
              Tidak ada iklan, tidak ada pelacak pihak ketiga, dan tidak ada cookie analitik.
            </span>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold">Cara menghapus</h2>
        <p className="text-sm leading-relaxed text-muted">
          Buka halaman{" "}
          <Link href="/riwayat" className="text-accent underline-offset-4 hover:underline">
            riwayat
          </Link>{" "}
          lalu pilih hapus semua. Tindakan itu menghapus riwayat di perangkat dan di server sekaligus.
          Untuk menghapus profil dan draft, gunakan tombol setel ulang di halaman{" "}
          <Link href="/profil" className="text-accent underline-offset-4 hover:underline">
            profil
          </Link>
          . Menghapus data situs di browser juga menghapus pengenal perangkat, dan setelah itu riwayat
          lama tidak bisa dipulihkan lagi.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold">Anak dan pengawasan</h2>
        <p className="text-sm leading-relaxed text-muted">
          Produk ini ditujukan untuk pelajar SMA. Karena tidak ada akun dan tidak ada data pribadi
          selain nama tampilan yang diisi sendiri, orang tua atau guru bisa memeriksa riwayat langsung
          dari perangkat yang dipakai.
        </p>
      </section>

      <p className="border-t border-line pt-4 text-xs leading-relaxed text-muted">
        Halaman ini menjelaskan perilaku aplikasi apa adanya, bukan dokumen hukum. Kalau kamu memakai
        TryOutku untuk kelas atau sekolah dan butuh pernyataan tertulis, hubungi pembuatnya.
      </p>
    </div>
  );
}
