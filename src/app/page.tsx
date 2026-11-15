import Link from "next/link";
import { BANK, BANK_BY_SUBTEST } from "@/lib/bank";
import { PAKETS, paketSoal } from "@/lib/pakets";
import { SUBTESTS } from "@/lib/subtests";
import HomeState from "@/components/HomeState";
import QuestionPreview from "@/components/QuestionPreview";
import { IconClock, IconList } from "@/components/icons";

/** Timer hiasan di pratinjau soal, hanya jam dan menit. */
function formatTimer(minutes: number): string {
  return `${String(minutes).padStart(2, "0")}:00`;
}

export default function Home() {
  const totalSoal = BANK.length;
  const paketSnbt = PAKETS.filter((item) => item.track === "snbt");
  const paketUtama = paketSnbt[0] ?? PAKETS[0];
  const contohSubtes = SUBTESTS.slice(0, 3);
  // Soal pendek dipilih supaya pratinjau tidak memakan seluruh layar.
  const contohSoal =
    BANK_BY_SUBTEST["pu"]?.find((item) => item.question.length <= 150 && !item.passage) ??
    BANK[0];
  const subtesUtama = Object.keys(paketUtama.blueprint);

  return (
    <div className="pb-4">
      <section className="border-b border-line pb-8 pt-8 sm:pt-10">
        <div className="grid gap-6 md:grid-cols-[1fr_300px] md:items-start">
        <div>
        <p className="text-sm font-semibold text-accent">Tryout UTBK SNBT dan ujian sekolah SMA</p>
        <h1 className="mt-2.5 max-w-2xl text-balance font-serif text-[26px] font-semibold leading-[1.2] tracking-tight sm:text-4xl">
          Latihan soal dengan timer dan pembahasan.
        </h1>
        <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          {totalSoal} soal berisi kunci dan pembahasan. Timer bisa diubah, dan baru berjalan setelah
          kamu menekan mulai.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
          <Link href={`/tryout/${paketUtama.id}`} className="btn-primary h-11 px-5">
            Mulai tryout
          </Link>
          <Link href="/latihan" className="btn-ghost h-11 px-4">
            Latihan per subtes
          </Link>
        </div>
        <p className="mt-2 text-[11px] text-muted">Tanpa akun, tanpa biaya.</p>

        </div>

        <div className="min-w-0">
          <QuestionPreview
            question={contohSoal}
            timer={formatTimer(paketUtama.durationMin)}
            stats={[
              { label: "soal", value: String(paketSoal(paketUtama)) },
              { label: "menit", value: String(paketUtama.durationMin) },
              { label: "pembahasan", value: "tiap butir" },
            ]}
            footer={`Potongan dari paket ${paketUtama.name}.`}
          />
        </div>
        </div>

        <p className="num mt-4 text-[11px] text-muted">
          {totalSoal} soal · {SUBTESTS.length} subtes dan mapel · {PAKETS.length} paket
        </p>
      </section>

      <HomeState />

      <section className="py-6">
        <h2 className="font-serif text-xl font-semibold tracking-tight">Dua cara berlatih</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Link href="/tryout" className="card card-hover flex flex-col justify-between p-5">
            <div>
              <p className="label flex items-center gap-1.5">
                <IconClock size={14} className="text-accent" />
                Mode tryout
              </p>
              <p className="mt-1 font-serif text-lg font-semibold">{PAKETS.length} paket berwaktu</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Soal acak sesuai komposisi paket, dinilai otomatis, hasil dipecah per subtes.
              </p>
              <div aria-hidden="true" className="mt-3 flex gap-1">
                {subtesUtama.map((id) => (
                  <span key={id} className="h-1.5 flex-1 rounded-full bg-accent/35" />
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-muted">
                {subtesUtama.length} subtes dalam satu paket
              </p>
            </div>
            <span className="mt-3 text-sm font-medium text-accent">Pilih paket</span>
          </Link>

          <Link href="/latihan" className="card card-hover flex flex-col justify-between p-5">
            <div>
              <p className="label flex items-center gap-1.5">
                <IconList size={14} className="text-accent" />
                Mode latihan
              </p>
              <p className="mt-1 font-serif text-lg font-semibold">Satu subtes, umpan balik langsung</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Dari {contohSubtes.map((item) => item.short).join(", ")} sampai mapel sekolah. Tiap
                jawaban langsung dinilai.
              </p>
              <div aria-hidden="true" className="mt-3 flex flex-wrap gap-1">
                {SUBTESTS.map((item) => (
                  <span key={item.id} className="h-1.5 w-4 rounded-full bg-accent/35" />
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-muted">{SUBTESTS.length} subtes dan mapel</p>
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
