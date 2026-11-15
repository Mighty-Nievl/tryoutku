import Link from "next/link";
import { BANK, BANK_BY_SUBTEST } from "@/lib/bank";
import { LETTERS } from "@/lib/scoring";
import { PAKETS, paketSoal } from "@/lib/pakets";
import { SUBTESTS } from "@/lib/subtests";
import HomeState from "@/components/HomeState";
import QuestionPreview from "@/components/QuestionPreview";
import { IconArrowRight, IconClock, IconList } from "@/components/icons";

/** Timer hiasan di pratinjau soal, hanya jam dan menit. */
function formatTimer(minutes: number): string {
  return `${String(minutes).padStart(2, "0")}:00`;
}

export default function Home() {
  const totalSoal = BANK.length;
  const paketSnbt = PAKETS.filter((item) => item.track === "snbt");
  const paketUtama = paketSnbt[0] ?? PAKETS[0];
  // Soal pendek dengan pembahasan pendek dipilih supaya pratinjau tetap satu
  // kartu: soal, kunci, dan pembahasan terlihat tanpa memakan seluruh layar.
  const contohSoal =
    BANK_BY_SUBTEST["pu"]?.find(
      (item) =>
        !item.passage &&
        item.question.length <= 120 &&
        item.explanation.length <= 160
    ) ?? BANK[0];
  const subtesUtama = Object.keys(paketUtama.blueprint);
  const snbt = SUBTESTS.filter((item) => item.track === "snbt");
  const sekolah = SUBTESTS.filter((item) => item.track === "sekolah");
  const soalSnbt = snbt.reduce((n, s) => n + (BANK_BY_SUBTEST[s.id]?.length ?? 0), 0);
  const soalSekolah = sekolah.reduce((n, s) => n + (BANK_BY_SUBTEST[s.id]?.length ?? 0), 0);
  const soalPaketUtama = paketSoal(paketUtama);

  const statistik = [
    { nilai: String(totalSoal), label: "soal" },
    { nilai: String(SUBTESTS.length), label: "subtes & mapel" },
    { nilai: String(PAKETS.length), label: "paket" },
  ];

  return (
    <div className="pb-4">
      {/* ---------- hero ---------- */}
      <section className="border-b border-line pb-10 pt-4 sm:pb-12 sm:pt-8">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_360px] md:items-start lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-14">
          <div className="flex min-w-0 flex-col">
            <p className="label uppercase tracking-[0.16em]">
              Tryout UTBK SNBT &amp; ujian sekolah SMA
            </p>
            <h1 className="mt-3 max-w-xl text-balance font-serif text-[28px] font-semibold leading-[1.16] tracking-tight sm:text-[40px]">
              Latihan soal dengan timer, lengkap dengan pembahasan.
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
              Setiap butir punya kunci dan pembahasan. Timer bisa diubah dan baru berjalan setelah
              kamu menekan mulai.
            </p>

            <div className="mt-7">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <Link href={`/tryout/${paketUtama.id}`} className="btn-primary h-11 px-6">
                  Mulai tryout
                </Link>
                <Link href="/latihan" className="btn-ghost h-11 px-5">
                  Latihan per subtes
                </Link>
              </div>
              <p className="mt-2.5 text-[11px] text-muted">Tanpa akun, tanpa biaya.</p>
            </div>

            <dl className="mt-8 grid max-w-lg grid-cols-3 divide-x divide-line border-y border-line">
              {statistik.map((item, index) => (
                <div key={item.label} className={index === 0 ? "py-3 pr-3" : "py-3 pl-5"}>
                  <dd className="num font-serif text-[26px] font-semibold leading-none">
                    {item.nilai}
                  </dd>
                  <dt className="mt-1 text-[11px] leading-snug text-muted">{item.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="min-w-0">
            <QuestionPreview
              question={contohSoal}
              timer={formatTimer(paketUtama.durationMin)}
              showExplanation
              stats={[
                { label: "soal", value: String(soalPaketUtama) },
                { label: "menit", value: String(paketUtama.durationMin) },
                { label: "subtes", value: String(subtesUtama.length) },
              ]}
              footer={`Dari paket ${paketUtama.name}.`}
            />
          </div>
        </div>
      </section>

      <HomeState />

      {/* ---------- dua cara berlatih ---------- */}
      <section className="border-b border-line py-10 sm:py-12">
        <p className="label uppercase tracking-[0.16em]">Cara kerja</p>
        <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight sm:text-[28px]">
          Dua cara berlatih
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Link href="/tryout" className="card card-hover flex flex-col p-6">
            <p className="label flex items-center gap-1.5">
              <IconClock size={14} className="text-muted" />
              Mode tryout
            </p>
            <h3 className="mt-2 font-serif text-xl font-semibold">{PAKETS.length} paket berwaktu</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Soal acak sesuai komposisi paket, timer berjalan, dinilai otomatis, dan hasil
              dipecah per subtes.
            </p>

            {/* Kisi-kisi dot: satu kotak untuk tiap butir dalam paket utama. */}
            <div
              aria-hidden="true"
              className="mt-5 grid grid-cols-10 gap-1 border-t border-line pt-5"
            >
              {Array.from({ length: soalPaketUtama }, (_, i) => (
                <span key={i} className="aspect-square rounded-[2px] border border-ink/25 dark:border-ink/45" />
              ))}
            </div>
            <p className="num mt-3 text-[11px] text-muted">
              {soalPaketUtama} butir · {paketUtama.durationMin} menit · {subtesUtama.length}{" "}
              subtes dalam {paketUtama.name}
            </p>

            <span className="mt-auto inline-flex pt-4 items-center gap-1 text-sm font-medium text-accent">
              Pilih paket <IconArrowRight size={14} />
            </span>
          </Link>

          <Link href="/latihan" className="card card-hover flex flex-col p-6">
            <p className="label flex items-center gap-1.5">
              <IconList size={14} className="text-muted" />
              Mode latihan
            </p>
            <h3 className="mt-2 font-serif text-xl font-semibold">
              Satu subtes, umpan balik langsung
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Tanpa waktu dan tanpa tekanan. Tiap jawaban langsung dinilai, lengkap dengan
              pembahasan butirnya.
            </p>

            {/* Baris opsi mini: bentuk umpan balik per butir. */}
            <div aria-hidden="true" className="mt-5 grid grid-cols-2 gap-1.5 border-t border-line pt-5">
              {contohSoal.options.slice(0, 4).map((option, index) => {
                const correct = index === contohSoal.answer;
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs ${
                      correct ? "border-accent bg-accent/10 text-ink" : "border-ink/25 text-muted"
                    }`}
                  >
                    <span
                      className={`grid h-4 w-4 shrink-0 place-items-center rounded-sm text-[10px] font-semibold ${
                        correct ? "bg-accent text-paper" : "border border-line"
                      }`}
                    >
                      {LETTERS[index]}
                    </span>
                    <span className="truncate">{option}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] text-muted">
              Dinilai detik itu juga, disertai alasan tiap pilihan.
            </p>

            <span className="mt-auto inline-flex pt-4 items-center gap-1 text-sm font-medium text-accent">
              Pilih subtes <IconArrowRight size={14} />
            </span>
          </Link>
        </div>
      </section>

      {/* ---------- cakupan bank soal ---------- */}
      <section className="border-b border-line py-10 sm:py-12">
        <p className="label uppercase tracking-[0.16em]">Bank soal</p>
        <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight sm:text-[28px]">
          {SUBTESTS.length} subtes dan mapel, semuanya dinilai dan dibahas
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Daftar di bawah dihitung langsung dari bank soal saat halaman dibangun. Pilih satu
          baris untuk langsung latihan subtes itu.
        </p>

        <div className="mt-7 grid gap-x-12 gap-y-8 lg:grid-cols-2">
          {[
            { judul: "UTBK SNBT", group: snbt, total: soalSnbt, href: "/tryout" },
            { judul: "Ujian sekolah SMA", group: sekolah, total: soalSekolah, href: "/latihan" },
          ].map((blok) => (
            <div key={blok.judul}>
              <div className="flex items-baseline justify-between gap-3 border-b border-ink/30 pb-2">
                <h3 className="font-serif text-lg font-semibold">{blok.judul}</h3>
                <p className="num text-xs text-muted">
                  {blok.group.length} subtes · {blok.total} soal
                </p>
              </div>
              <ul>
                {blok.group.map((item) => {
                  const jumlah = BANK_BY_SUBTEST[item.id]?.length ?? 0;
                  return (
                    <li key={item.id} className="border-b border-line">
                      <Link
                        href={`/latihan/${item.id}`}
                        className="group flex min-h-11 items-center gap-3 py-2.5 text-sm transition-colors hover:text-accent"
                      >
                        <span className="num w-12 shrink-0 font-mono text-xs text-muted group-hover:text-accent">
                          {item.short}
                        </span>
                        <span className="min-w-0 flex-1 leading-snug">{item.name}</span>
                        <span className="num shrink-0 text-xs text-muted">{jumlah} soal</span>
                        <IconArrowRight
                          size={13}
                          className="shrink-0 text-transparent transition-colors group-hover:text-accent"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link
                href={blok.href}
                className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-accent"
              >
                {blok.judul === "UTBK SNBT" ? "Lihat paket SNBT" : "Latihan semua mapel"}{" "}
                <IconArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- ajakan penutup ---------- */}
      <section className="py-10 sm:py-12">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-[28px]">
              Siap mencoba {paketUtama.durationMin} menit?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              {paketUtama.name}: {soalPaketUtama} soal dari {subtesUtama.length} subtes. Timer
              baru jalan setelah kamu tekan mulai, dan hasilnya bisa langsung dipakai untuk
              latihan bagian yang paling lemah.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/tryout/${paketUtama.id}`} className="btn-primary h-11 px-6">
              Mulai {paketUtama.name.replace("Tryout ", "")}
            </Link>
            <Link href="/tryout" className="btn-ghost h-11 px-5">
              Lihat semua paket
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line py-8">
        <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="max-w-xl text-xs leading-relaxed text-muted">
            <p>
              TryOutku adalah alat latihan mandiri, bukan penyelenggara resmi UTBK/SNBT maupun
              ujian sekolah. Estimasi nilai memakai skala 200 sampai 800 dan bukan skor IRT
              resmi.
            </p>
            <p className="mt-1.5">
              Angka di halaman ini dihitung dari bank soal saat build. Dibuat oleh Rezal Helvin
              Bramantara, {new Date().getFullYear()}.
            </p>
          </div>
          <nav aria-label="Tautan informasi" className="flex flex-wrap gap-x-5 gap-y-1 sm:flex-col sm:gap-y-0.5">
            {[
              { href: "/bantuan", label: "Bantuan" },
              { href: "/glosarium", label: "Glosarium" },
              { href: "/privasi", label: "Privasi" },
              { href: "/profil", label: "Profil" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-11 items-center text-xs text-muted transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
