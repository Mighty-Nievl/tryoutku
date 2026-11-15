import Link from "next/link";
import { BANK, BANK_BY_SUBTEST } from "@/lib/bank";
import { PAKETS, paketSoal } from "@/lib/pakets";
import { SUBTESTS, TRACKS } from "@/lib/subtests";
import LevelBar from "@/components/LevelBar";
import Mascot from "@/components/Mascot";
import ResumeBanner from "@/components/ResumeBanner";

export default function Home() {
  const totalSoal = BANK.length;
  const subtesSnbt = SUBTESTS.filter((item) => item.track === "snbt");
  const mapel = SUBTESTS.filter((item) => item.track === "sekolah");
  const paketSnbt = PAKETS.filter((item) => item.track === "snbt");

  const daftarSubtes = (track: "snbt" | "sekolah") =>
    SUBTESTS.filter((item) => item.track === track).map((item) => ({
      ...item,
      jumlah: BANK_BY_SUBTEST[item.id]?.length ?? 0,
    }));

  return (
    <div className="pb-4">
      <section className="border-b border-line pb-10 pt-8 sm:pt-12">
        <div className="grid gap-8 md:grid-cols-[1fr_300px] md:items-start">
          <div>
            <p className="text-sm font-semibold text-accent">
              Tryout UTBK SNBT dan ujian sekolah SMA
            </p>
            <h1 className="mt-3 max-w-2xl text-balance font-serif text-4xl font-semibold leading-[1.2] tracking-tight sm:text-5xl">
              Kerjakan soal dengan timer, lalu lihat bagian mana yang menahan
              nilaimu.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
              {totalSoal} soal pilihan ganda dengan kunci dan pembahasan,
              tersusun dalam {PAKETS.length} paket tryout dan {SUBTESTS.length}{" "}
              subtes. Penilaian otomatis, rincian per subtes, dan riwayat yang
              bisa dibuka ulang.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={`/tryout/${paketSnbt[0].id}`} className="btn-primary">
                Mulai {paketSnbt[0].name}
              </Link>
              <Link href="/tantangan" className="btn-ghost">
                Tantangan harian
              </Link>
              <Link href="/latihan" className="text-sm font-medium text-muted hover:text-ink">
                atau pilih subtes sendiri
              </Link>
            </div>
          </div>

          <aside className="card p-4">
            <p className="label">Contoh komposisi paket</p>
            <p className="mt-1.5 font-serif text-lg font-semibold">
              {paketSnbt[0].name}
            </p>
            <p className="num mt-0.5 text-xs text-muted">
              {Object.values(paketSnbt[0].blueprint)[0]} soal per subtes,{" "}
              {paketSnbt[0].durationMin} menit
            </p>
            <ul className="mt-3 border-t border-line">
              {Object.keys(paketSnbt[0].blueprint).map((subtes) => (
                <li key={subtes} className="border-b border-line py-1.5 text-xs">
                  {SUBTESTS.find((item) => item.id === subtes)?.name ?? subtes}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Soal diambil acak dari tiap subtes, jadi tiap percobaan bisa
              berbeda.
            </p>
          </aside>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5 sm:grid-cols-4">
          {[
            { label: "Soal", value: `${totalSoal}` },
            { label: "Subtes dan mapel", value: `${SUBTESTS.length}` },
            { label: "Paket tryout", value: `${PAKETS.length}` },
            {
              label: "Durasi paket",
              value: `${Math.min(...PAKETS.map((p) => p.durationMin))}-${Math.max(
                ...PAKETS.map((p) => p.durationMin),
              )} mnt`,
            },
          ].map((item) => (
            <div key={item.label}>
              <dt className="label">{item.label}</dt>
              <dd className="num mt-1 font-serif text-2xl font-semibold">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-b border-line py-10">
        <div className="grid gap-6 md:grid-cols-[1fr_280px] md:items-start">
          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-tight">Progres kamu</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Setiap jawaban benar menambah XP, dan XP menaikkan level. Streak menghitung berapa hari
              berturut-turut kamu latihan. Semuanya dihitung dari riwayat nyata di perangkat ini.
            </p>
            <div className="mt-4">
              <LevelBar />
            </div>
            <div className="mt-4 space-y-3">
              <ResumeBanner />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/tantangan" className="btn-ghost">
                Tantangan hari ini
              </Link>
              <Link href="/profil" className="btn-ghost">
                Lihat lencana
              </Link>
            </div>
          </div>
          <div className="card flex flex-col items-center gap-3 p-5 text-center">
            <Mascot mood="senang" size={112} />
            <p className="text-sm font-semibold">Pinto menemani latihanmu</p>
            <p className="text-xs leading-relaxed text-muted">
              Maskot pensil ini bereaksi saat jawabanmu benar, salah, atau saat kamu naik level.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-line py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-2xl font-semibold tracking-tight">
            Isi bank soal
          </h2>
          <p className="text-xs text-muted">
            Klik nama subtes untuk berlatih bagian itu saja.
          </p>
        </div>

        <div className="mt-5 grid gap-8 md:grid-cols-2">
          {(["snbt", "sekolah"] as const).map((track) => (
            <div key={track}>
              <h3 className="text-sm font-semibold">{TRACKS[track].name}</h3>
              <p className="mt-1 text-xs text-muted">{TRACKS[track].exam}</p>
              <ul className="mt-3 border-t border-line">
                {daftarSubtes(track).map((item) => (
                  <li
                    key={item.id}
                    className="flex items-baseline gap-3 border-b border-line py-2.5"
                  >
                    <Link
                      href={`/latihan/${item.id}`}
                      className="text-sm hover:underline"
                    >
                      {item.name}
                    </Link>
                    <span className="ml-auto num text-xs text-muted">
                      {item.jumlah} soal
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-line py-10">
        <h2 className="font-serif text-2xl font-semibold tracking-tight">
          Paket tryout
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Setiap paket menarik soal acak dari bank sesuai komposisinya, jadi dua
          percobaan tidak memberi set yang sama.
        </p>
        <ul className="mt-5 border-t border-line">
          {PAKETS.map((paket) => (
            <li key={paket.id} className="border-b border-line py-3.5">
              <Link
                href={`/tryout/${paket.id}`}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1"
              >
                <span className="text-sm font-medium hover:underline">
                  {paket.name}
                </span>
                <span className="num text-xs text-muted">
                  {paketSoal(paket)} soal, {paket.durationMin} menit
                </span>
                <span className="ml-auto text-xs text-muted">
                  {paket.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="py-10">
        <h2 className="font-serif text-2xl font-semibold tracking-tight">
          Yang dicatat setiap sesi
        </h2>
        <dl className="mt-5 grid gap-6 sm:grid-cols-2">
          {[
            {
              istilah: "Waktu pengerjaan",
              arti: "Sisa waktu dihitung dari tenggat, bukan dari hitungan mundur, jadi menutup tab tidak menambah waktu.",
            },
            {
              istilah: "Benar, salah, kosong",
              arti: "Jawaban kosong dihitung terpisah supaya kelihatan mana yang tidak sempat diisi.",
            },
            {
              istilah: "Rincian per subtes",
              arti: "Skor dipecah ke tiap subtes, dengan penanda subtes berpersentase terendah.",
            },
            {
              istilah: "Pembahasan per butir",
              arti: "Setiap soal menyimpan alasan jawaban benar, bisa dibuka ulang dari riwayat.",
            },
          ].map((item) => (
            <div key={item.istilah} className="border-t border-line pt-3">
              <dt className="text-sm font-semibold">{item.istilah}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted">
                {item.arti}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="border-t border-line pt-5 text-xs leading-relaxed text-muted">
        <p>
          TryOutku adalah alat latihan mandiri, bukan penyelenggara resmi
          UTBK/SNBT maupun ujian sekolah. Estimasi nilai memakai skala 200
          sampai 800 dan bukan skor IRT resmi.
        </p>
        <p className="mt-1.5">
          Angka di halaman ini dihitung dari bank soal saat build. Dibuat oleh
          Rezal Helvin Bramantara, {new Date().getFullYear()}.
        </p>
        <nav aria-label="Tautan informasi" className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/bantuan" className="hover:text-ink">
            Bantuan
          </Link>
          <Link href="/glosarium" className="hover:text-ink">
            Glosarium
          </Link>
          <Link href="/privasi" className="hover:text-ink">
            Privasi
          </Link>
          <Link href="/profil" className="hover:text-ink">
            Profil
          </Link>
        </nav>
      </footer>
    </div>
  );
}
