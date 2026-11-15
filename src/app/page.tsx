import Link from "next/link";
import { BANK } from "@/lib/bank";
import { PAKETS, paketSoal } from "@/lib/pakets";
import { SUBTESTS } from "@/lib/subtests";
import HomeState from "@/components/HomeState";

export default function Home() {
  const totalSoal = BANK.length;
  const paketSnbt = PAKETS.filter((item) => item.track === "snbt");
  const paketUtama = paketSnbt[0] ?? PAKETS[0];
  const contohSubtes = SUBTESTS.slice(0, 3);

  return (
    <div className="pb-4">
      <section className="border-b border-line pb-8 pt-8 sm:pt-10">
        <div className="grid gap-6 md:grid-cols-[1fr_300px] md:items-start">
        <div>
        <p className="text-sm font-semibold text-accent">Tryout UTBK SNBT dan ujian sekolah SMA</p>
        <h1 className="mt-2.5 max-w-2xl text-balance font-serif text-3xl font-semibold leading-[1.2] tracking-tight sm:text-4xl">
          Latihan soal dengan timer, lengkap dengan pembahasan.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          Semua soal berisi kunci dan pembahasan. Timer baru berjalan setelah kamu menekan mulai,
          dan durasinya bisa kamu ubah.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
          <Link href={`/tryout/${paketUtama.id}`} className="btn-primary h-11 px-5">
            Mulai · {paketSoal(paketUtama)} soal · {paketUtama.durationMin} menit
          </Link>
          <Link href="/latihan" className="btn-ghost h-11 px-4">
            Latihan per subtes
          </Link>
        </div>

        <ul className="num mt-5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
          <li>{totalSoal} soal</li>
          <li>{SUBTESTS.length} subtes dan mapel</li>
          <li>{PAKETS.length} paket</li>
          <li>tanpa akun</li>
          <li>tanpa biaya</li>
        </ul>
        </div>

        <aside className="card p-4">
          <p className="label">Setelah menekan mulai</p>
          <ol className="mt-2 space-y-2 text-xs leading-relaxed text-muted">
            <li>
              <span className="num font-semibold text-ink">1.</span> Layar mulai menampilkan jumlah
              soal, durasi, dan komposisi. Durasi bisa diubah.
            </li>
            <li>
              <span className="num font-semibold text-ink">2.</span> Soal diambil acak per subtes.
              Jawaban dan sisa waktu tersimpan otomatis.
            </li>
            <li>
              <span className="num font-semibold text-ink">3.</span> Hasil berisi skor, rincian per
              subtes, dan pembahasan tiap butir.
            </li>
          </ol>
        </aside>
        </div>
      </section>

      <HomeState />

      <section className="py-6">
        <h2 className="font-serif text-xl font-semibold tracking-tight">Dua cara berlatih</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Link href="/tryout" className="card card-hover flex flex-col justify-between p-5">
            <div>
              <p className="label">Mode tryout</p>
              <p className="mt-1 font-serif text-lg font-semibold">{PAKETS.length} paket berwaktu</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Soal acak sesuai komposisi paket, dinilai otomatis, hasil dipecah per subtes. Mulai
                dari {paketUtama.name}.
              </p>
            </div>
            <span className="mt-3 text-sm font-medium text-accent">Pilih paket</span>
          </Link>

          <Link href="/latihan" className="card card-hover flex flex-col justify-between p-5">
            <div>
              <p className="label">Mode latihan</p>
              <p className="mt-1 font-serif text-lg font-semibold">Satu subtes, umpan balik langsung</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {SUBTESTS.length} subtes dan mapel, dari{" "}
                {contohSubtes.map((item) => item.short).join(", ")} sampai mapel sekolah. Tiap
                jawaban langsung dinilai.
              </p>
            </div>
            <span className="mt-3 text-sm font-medium text-accent">Pilih subtes</span>
          </Link>
        </div>

      </section>

      <footer className="border-t border-line pt-5 text-xs leading-relaxed text-muted">
        <p>
          TryOutku adalah alat latihan mandiri, bukan penyelenggara resmi UTBK/SNBT maupun ujian
          sekolah. Estimasi nilai memakai skala 200 sampai 800 dan bukan skor IRT resmi.
        </p>
        <p className="mt-1.5">
          Angka di halaman ini dihitung dari bank soal saat build. Dibuat oleh Rezal Helvin
          Bramantara, {new Date().getFullYear()}.
        </p>
        <nav aria-label="Tautan informasi" className="mt-2 flex flex-wrap gap-x-4">
          <Link href="/bantuan" className="inline-flex min-h-11 items-center hover:text-ink">
            Bantuan
          </Link>
          <Link href="/glosarium" className="inline-flex min-h-11 items-center hover:text-ink">
            Glosarium
          </Link>
          <Link href="/privasi" className="inline-flex min-h-11 items-center hover:text-ink">
            Privasi
          </Link>
          <Link href="/profil" className="inline-flex min-h-11 items-center hover:text-ink">
            Profil
          </Link>
        </nav>
      </footer>
    </div>
  );
}
