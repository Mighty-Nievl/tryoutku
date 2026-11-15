import Link from "next/link";
import { BANK } from "@/lib/bank";
import { PAKETS } from "@/lib/pakets";
import { SUBTESTS, TRACKS } from "@/lib/subtests";

export default function Home() {
  const totalSoal = BANK.length;
  const subtesSnbt = SUBTESTS.filter((s) => s.track === "snbt");
  const mapel = SUBTESTS.filter((s) => s.track === "sekolah");

  return (
    <div className="space-y-16">
      <section className="animate-rise pt-8 sm:pt-14">
        <span className="chip">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Gratis · tanpa akun · progres tersimpan di perangkat
        </span>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
          Latihan ujian yang terasa{" "}
          <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
            seperti ujian asli
          </span>
          .
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Simulasi UTBK SNBT dan ujian sekolah SMA dengan timer, navigasi soal, penilaian otomatis,
          dan pembahasan tiap butir. Lihat tepatnya di mana kamu kehilangan nilai.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/tryout/snbt-mini-1" className="btn-primary px-5 py-3">
            Mulai tryout SNBT
          </Link>
          <Link href="/latihan" className="btn-ghost px-5 py-3">
            Latihan per mapel
          </Link>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Soal siap pakai", value: totalSoal },
            { label: "Subtes & mapel", value: SUBTESTS.length },
            { label: "Paket tryout", value: PAKETS.length },
            { label: "Pembahasan", value: "100%" },
          ].map((item) => (
            <div key={item.label} className="card px-4 py-3.5">
              <dt className="h-label">{item.label}</dt>
              <dd className="mt-1 font-display text-2xl font-extrabold">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="font-display text-2xl font-extrabold tracking-tight">Pilih jalur ujian</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {(["snbt", "sekolah"] as const).map((trackId) => {
            const track = TRACKS[trackId];
            const list = trackId === "snbt" ? subtesSnbt : mapel;
            return (
              <Link
                key={track.id}
                href={`/tryout?track=${track.id}`}
                className="card card-hover group p-6"
              >
                <div className="flex items-start justify-between">
                  <span className="rounded-lg bg-gradient-to-br from-brand to-accent px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                    {trackId === "snbt" ? "UTBK" : "Sekolah"}
                  </span>
                  <span className="text-muted transition group-hover:translate-x-0.5">→</span>
                </div>
                <h3 className="mt-4 font-display text-xl font-bold">{track.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{track.tagline}</p>
                <p className="mt-4 text-xs text-muted">{track.exam}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {list.slice(0, 5).map((s) => (
                    <span key={s.id} className="chip">
                      {s.short}
                    </span>
                  ))}
                  {list.length > 5 ? <span className="chip">+{list.length - 5}</span> : null}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-extrabold tracking-tight">
          Begini cara kerjanya
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Kerjakan dengan timer",
              body: "Timer berjalan seperti ujian sebenarnya, bisa dijeda dengan menutup tab — sisa waktu tersimpan.",
            },
            {
              step: "02",
              title: "Lihat skor per subtes",
              body: "Setiap paket memecah hasil per subtes supaya kamu tahu materi mana yang menahan nilai.",
            },
            {
              step: "03",
              title: "Baca pembahasan",
              body: "Setiap soal punya penjelasan singkat berisi alasan jawaban benar dan jebakan yang perlu dihindari.",
            },
          ].map((item) => (
            <div key={item.step} className="card p-5">
              <span className="font-display text-sm font-extrabold text-brand">{item.step}</span>
              <h3 className="mt-2 font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-line pt-6 text-xs text-muted">
        <p>
          TryOutku — latihan mandiri, bukan penyelenggara resmi UTBK/SNBT maupun ujian sekolah.
          Estimasi nilai bersifat perkiraan kasar, bukan skor IRT resmi.
        </p>
        <p className="mt-1.5">
          Dibuat oleh Rezal Helvin Bramantara · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
