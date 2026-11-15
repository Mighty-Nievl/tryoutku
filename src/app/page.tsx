import type { ReactNode } from "react";
import Link from "next/link";
import { BANK, BANK_BY_SUBTEST } from "@/lib/bank";
import { LETTERS } from "@/lib/scoring";
import { PAKETS, paketSoal } from "@/lib/pakets";
import { SUBTESTS, SUBTEST_BY_ID } from "@/lib/subtests";
import HomeState from "@/components/HomeState";
import HeroTry from "@/components/HeroTry";
import ScoreRing from "@/components/ScoreRing";
import Reveal from "@/components/Reveal";
import { IconArrowRight, IconClock, IconList } from "@/components/icons";

/** Timer hiasan di pratinjau soal, hanya jam dan menit. */
function formatTimer(minutes: number): string {
  return `${String(minutes).padStart(2, "0")}:00`;
}

/**
 * Eyebrow section bernomor seperti daftar isi lembar ujian: nomor mono,
 * judul, lalu garis rambut yang memanjang ke tepi — pemisah visual tanpa
 * kartu atau hiasan baru.
 */
function Eyebrow({ no, children }: { no: string; children: ReactNode }) {
  return (
    <p className="label flex items-center gap-3 uppercase tracking-[0.16em]">
      <span className="font-mono text-[11px]">{no}</span>
      <span>{children}</span>
      <span aria-hidden="true" className="hidden h-px flex-1 bg-line sm:block" />
    </p>
  );
}

/**
 * Contoh kertas skor untuk seksi "Bentuk hasil". Angkanya rekaan tapi konsisten
 * dengan rumus estimasi asli (200 + persen x 6) dan blueprint paket mini
 * (7 subtes x 5 butir), dan di UI diberi label "contoh".
 */
const contohHasil = {
  benar: 24,
  total: 35,
  persen: 69,
  estimasi: 614,
  perSubtes: [
    { id: "pu", short: "PU", benar: 4 },
    { id: "ppu", short: "PPU", benar: 3 },
    { id: "pbm", short: "PBM", benar: 4 },
    { id: "pk", short: "PK", benar: 3 },
    { id: "lit-id", short: "Lit ID", benar: 4 },
    { id: "lit-en", short: "Lit EN", benar: 2 },
    { id: "pm", short: "PM", benar: 4 },
  ],
};

export default function Home() {
  const totalSoal = BANK.length;
  const paketSnbt = PAKETS.filter((item) => item.track === "snbt");
  const paketUtama = paketSnbt[0] ?? PAKETS[0];
  // Soal pendek dengan pembahasan pendek: pratinjau harus selesai di layar
  // tanpa menggulir, termasuk saat pembahasan terbuka.
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

  // Statistik disusun sebagai cakupan, bukan pamer jumlah: 198 soal jujur tapi
  // tipis, sedangkan "7/7 subtes SNBT" adalah janji yang bisa dibuktikan.
  const statistik = [
    { nilai: `${snbt.length}/${snbt.length}`, label: "subtes SNBT tercakup" },
    { nilai: String(sekolah.length), label: "mapel ujian sekolah" },
    { nilai: String(PAKETS.length), label: "paket berwaktu" },
  ];

  const jalurMulai = [
    {
      label: "Belum pernah tryout",
      aksi: `Mulai paket mini ${paketUtama.durationMin} menit`,
      href: `/tryout/${paketUtama.id}`,
    },
    {
      label: "Mau ujian sekolah",
      aksi: "Latihan per mapel, tanpa waktu",
      href: "/latihan",
    },
    {
      label: "Cuma mau cek dua-tiga soal",
      aksi: "Kerjakan contoh di atas, dinilai seketika",
      href: "#coba",
    },
  ];

  return (
    <div className="pb-4">
      {/* ---------- hero ---------- */}
      <section className="border-b border-line pb-10 pt-4 sm:pb-12 sm:pt-8">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_360px] md:items-start lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-14">
          <div className="flex min-w-0 flex-col">
            <p className="label flex items-center gap-3 uppercase tracking-[0.16em]">
              <span>Tryout UTBK SNBT &amp; ujian sekolah SMA</span>
              <span aria-hidden="true" className="hidden h-px flex-1 bg-line lg:block" />
            </p>
            <h1 className="mt-3 max-w-2xl text-balance font-serif text-[clamp(28px,4.6vw,46px)] font-semibold leading-[1.12] tracking-tight">
              Tryout dengan pembahasan dan estimasi nilai.{" "}
              <span className="text-accent">Tanpa akun, tanpa biaya.</span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
              Setiap butir dinilai otomatis dan dibahas satu per satu. Hasilnya dipecah per
              subtes, sampai kamu tahu bagian mana yang perlu digarap. Timer baru jalan setelah
              kamu menekan mulai.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link href={`/tryout/${paketUtama.id}`} className="btn-primary h-11 px-6">
                Mulai tryout
              </Link>
              <Link href="/latihan" className="btn-ghost h-11 px-5">
                Latihan per subtes
              </Link>
            </div>

            <dl className="mt-8 grid max-w-lg grid-cols-3 divide-x divide-line border-y border-line">
              {statistik.map((item, index) => (
                <div key={item.label} className={index === 0 ? "py-3 pr-3" : "py-3 pl-5"}>
                  <dd className="num font-serif text-[clamp(24px,3vw,34px)] font-semibold leading-none">
                    {item.nilai}
                  </dd>
                  <dt className="mt-1.5 text-[11px] leading-snug text-muted">{item.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="min-w-0">
            <HeroTry
              question={contohSoal}
              timer={formatTimer(paketUtama.durationMin)}
              paketName={paketUtama.name}
              paketHref={`/tryout/${paketUtama.id}`}
            />
          </div>
        </div>
      </section>

      <HomeState />

      {/* ---------- mulai dari mana ---------- */}
      <section className="border-b border-line py-12 sm:py-16">
        <Reveal>
          <Eyebrow no="01">Mulai dari mana</Eyebrow>
          <h2 className="mt-2 font-serif text-[clamp(23px,3.2vw,32px)] font-semibold tracking-tight">
            Tiga jalur, sesuai keadaanmu
          </h2>
          <ul className="mt-5">
            {jalurMulai.map((jalur) => (
              <li key={jalur.label} className="border-b border-line last:border-b-0">
                <Link
                  href={jalur.href}
                  className="group flex min-h-14 flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3 sm:flex-nowrap"
                >
                  <span className="font-serif text-base font-semibold sm:text-lg">
                    {jalur.label}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-accent">
                    {jalur.aksi}
                    <IconArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* ---------- dua cara berlatih ---------- */}
      <section className="border-b border-line py-12 sm:py-16">
        <Reveal>
          <Eyebrow no="02">Cara kerja</Eyebrow>
          <h2 className="mt-2 font-serif text-[clamp(23px,3.2vw,32px)] font-semibold tracking-tight">
            Dua cara berlatih
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Link href="/tryout" className="card card-hover flex flex-col p-6">
              <p className="label flex items-center gap-1.5">
                <IconClock size={14} className="text-muted" />
                Mode tryout
              </p>
              <h3 className="mt-2 font-serif text-xl font-semibold">
                {PAKETS.length} paket berwaktu
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Soal acak sesuai komposisi paket, timer berjalan, dinilai otomatis, dan hasil
                dipecah per subtes.
              </p>

              {/* Kisi-kisi dot: tiap kotak satu butir, dikelompokkan dan diberi
                  label subtes supaya grid terbaca sebagai blueprint, bukan tekstur. */}
              <div
                aria-hidden="true"
                className="mt-5 flex flex-wrap gap-x-3 gap-y-2 border-t border-line pt-5"
              >
                {subtesUtama.map((id) => (
                  <span key={id} className="flex items-center gap-1.5">
                    <span className="flex gap-[3px]">
                      {Array.from({ length: paketUtama.blueprint[id] }, (_, i) => (
                        <span
                          key={i}
                          className="h-2 w-2 rounded-[2px] border border-ink/35 dark:border-ink/60"
                        />
                      ))}
                    </span>
                    <span className="num text-[10px] text-muted">
                      {SUBTEST_BY_ID[id]?.short ?? id}
                    </span>
                  </span>
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
              <div
                aria-hidden="true"
                className="mt-5 grid grid-cols-2 gap-1.5 border-t border-line pt-5"
              >
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
        </Reveal>
      </section>

      {/* ---------- bentuk hasil: pita bertekstur, memecah ritme section ---------- */}
      <section className="-mx-4 border-y border-line bg-raised/60 px-4 py-12 sm:-mx-6 sm:px-6 sm:py-16">
        <Reveal>
          <Eyebrow no="03">Bentuk hasil</Eyebrow>
          <h2 className="mt-2 font-serif text-[clamp(23px,3.2vw,32px)] font-semibold tracking-tight">
            Selesai sesi, kamu dapat kertas skor — bukan sekadar angka benar
          </h2>
          <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] md:items-center">
            <div
              className="card p-5"
              role="img"
              aria-label="Contoh kertas skor Tryout SNBT Mini: 24 benar dari 35 soal, estimasi 614 dari 800, terlemah Literasi Bahasa Inggris"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="label">Contoh hasil · {paketUtama.name}</p>
                <span className="chip text-[10px]">contoh, bukan hasilmu</span>
              </div>
              <div className="mt-4 flex items-start gap-4">
                <ScoreRing percent={contohHasil.persen} size={96} />
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">
                    {contohHasil.benar} benar dari {contohHasil.total} soal
                  </p>
                  <p className="num text-muted">Estimasi {contohHasil.estimasi}/800</p>
                  <p className="text-muted">Terlemah: Literasi Bahasa Inggris (40%)</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 border-t border-line pt-4">
                {contohHasil.perSubtes.map((sub) => {
                  const persen = Math.round((sub.benar / 5) * 100);
                  return (
                    <div key={sub.id} className="flex min-w-0 items-center gap-2 text-sm">
                      <span className="w-11 shrink-0 text-[11px] font-semibold text-muted">
                        {sub.short}
                      </span>
                      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-line">
                        <div
                          className={`motion-bar h-full rounded-full ${
                            persen < 50 ? "bg-danger" : "bg-accent"
                          }`}
                          style={{ width: `${persen}%` }}
                        />
                      </div>
                      <span className="num w-9 shrink-0 text-right text-[11px] text-muted">
                        {sub.benar}/5
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="min-w-0 space-y-4 text-sm leading-relaxed text-muted">
              <p>
                Kertas skor memecah hasil per subtes dan memberi estimasi nilai skala 200 sampai
                800. Angka contoh di kiri memakai rumus yang sama dengan hasil tryoutmu: persen
                benar dikali 6, ditambah 200.
              </p>
              <p>
                Dari situ alurnya melingkar: subtes terlemah ditunjukkan, latihan untuk subtes
                itu tinggal satu ketukan, dan sesi yang berhenti di tengah bisa dilanjutkan kapan
                pun.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- cakupan bank soal ---------- */}
      <section className="border-b border-line py-12 sm:py-16">
        <Reveal>
          <Eyebrow no="04">Bank soal</Eyebrow>
          <h2 className="mt-2 font-serif text-[clamp(23px,3.2vw,32px)] font-semibold tracking-tight">
            {SUBTESTS.length} subtes dan mapel, {totalSoal} soal dinilai dan dibahas
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
        </Reveal>
      </section>

      {/* ---------- ajakan penutup ---------- */}
      <section className="py-12 sm:py-16">
        <Reveal>
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div>
              <h2 className="font-serif text-[clamp(23px,3.2vw,32px)] font-semibold tracking-tight">
                {paketUtama.durationMin} menit dari sekarang, kamu sudah tahu posisimu
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                {paketUtama.name}: {soalPaketUtama} soal dari {subtesUtama.length} subtes. Timer
                baru jalan setelah kamu tekan mulai, dan hasilnya langsung menunjuk bagian yang
                perlu digarap.
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
        </Reveal>
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
              Angka di halaman ini dihitung dari bank soal saat build. Contoh kertas skor
              memakai angka rekaan yang mengikuti rumus estimasi. Dibuat oleh Rezal Helvin
              Bramantara, {new Date().getFullYear()}.
            </p>
          </div>
          <nav
            aria-label="Tautan informasi"
            className="flex flex-wrap gap-x-5 gap-y-1 sm:flex-col sm:gap-y-0.5"
          >
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
