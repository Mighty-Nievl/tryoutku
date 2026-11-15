import Link from "next/link";
import { PAKETS } from "@/lib/pakets";
import { paketCapacity } from "@/lib/bank";
import { TRACKS } from "@/lib/subtests";

export const metadata = {
  title: "Pilih paket tryout",
};

export default function TryoutIndex() {
  return (
    <div className="space-y-8 py-4">
      <header>
        <p className="h-label">Mode tryout</p>
        <h1 className="mt-2 font-serif text-3xl font-extrabold tracking-tight">
          Pilih paket, kerjakan dengan timer
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Timer baru berjalan setelah kamu menekan tombol mulai di layar berikutnya. Jawaban
          tersimpan walau halaman ditutup, dan hasil langsung muncul lengkap dengan rincian per
          subtes serta pembahasan.
        </p>
      </header>

      {(["snbt", "sekolah"] as const).map((trackId) => {
        const list = PAKETS.filter((p) => p.track === trackId);
        if (list.length === 0) return null;
        return (
          <section key={trackId}>
            <h2 className="font-serif text-lg font-bold">{TRACKS[trackId].name}</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {list.map((paket, nomor) => {
                const capacity = paketCapacity(paket);
                const titikMasuk = trackId === "snbt" && nomor === 0;
                const planned = Object.values(paket.blueprint).reduce((a, b) => a + b, 0);
                return (
                  <Link
                    key={paket.id}
                    href={`/tryout/${paket.id}`}
                    className="card card-hover flex flex-col p-5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {titikMasuk ? (
                          <p className="mb-1 text-[11px] font-semibold text-accent">
                            Mulai di sini kalau baru pertama
                          </p>
                        ) : null}
                        <h3 className="font-serif text-base font-bold">{paket.name}</h3>
                      </div>
                      <span className="chip shrink-0">{paket.durationMin} menit</span>
                    </div>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                      {paket.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      <span className="chip">{capacity} soal</span>
                      {capacity < planned ? (
                        <span className="chip text-amber-500">
                          bank soal kurang {planned - capacity}
                        </span>
                      ) : null}
                      {Object.keys(paket.blueprint).map((sub) => (
                        <span key={sub} className="chip">
                          {sub.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
