import type { ScoredResult } from "@/lib/scoring";
import { formatDuration } from "@/lib/scoring";
import Mascot from "./Mascot";
import ScoreRing from "./ScoreRing";

interface Props {
  title: string;
  result: ScoredResult;
  durationSec: number;
  children?: React.ReactNode;
}

export default function ResultSummary({ title, result, durationSec, children }: Props) {
  return (
    <section className="animate-rise">
      <div className="card p-5 sm:p-7">
        <p className="h-label">{title}</p>
        <div className="mt-4 flex flex-wrap items-start gap-x-6 gap-y-5">
          <div className="flex items-start gap-4">
            <ScoreRing percent={result.percent} />
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-3">
                <Mascot
                  size={56}
                  mood={result.percent >= 70 ? "senang" : result.percent >= 40 ? "fokus" : "sedih"}
                  react={result.percent >= 70 ? "benar" : "idle"}
                />
                <p className="font-semibold">
                  {result.correct} benar dari {result.total} soal
                </p>
              </div>
              <p className="text-muted">
                Salah {result.wrong} · Kosong {result.blank}
              </p>
              <p className="text-muted">Waktu {formatDuration(durationSec)}</p>
              <p className="chip mt-1">Estimasi nilai {result.estimate}/800</p>
            </div>
          </div>

          <div className="min-w-[180px] flex-1 basis-[220px] space-y-2">
            <p className="label">Rincian per subtes</p>
            {result.perSubtest.map((sub) => (
              <div key={sub.id} className="flex min-w-0 items-center gap-2 text-sm">
                <span className="w-11 shrink-0 text-[11px] font-semibold text-muted">
                  {sub.short}
                </span>
                <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-line">
                  <div
                    className="motion-bar h-full rounded-full bg-brand"
                    style={{ width: `${sub.percent}%` }}
                  />
                </div>
                <span className="num w-11 shrink-0 text-right text-[11px] text-muted">
                  {sub.correct}/{sub.total}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-5 rounded-xl border border-line bg-raised/70 p-3.5 text-sm text-muted">
          {result.percent >= 75
            ? "Sudah kuat. Pertahankan ritme dan fokus pada subtes dengan persentase terendah."
            : result.percent >= 50
              ? "Cukup baik, tetapi masih ada ruang. Ulangi soal yang salah, lalu kerjakan latihan per subtes."
              : "Masih jauh dari target. Baca pembahasan tiap soal, lalu latihan per subtes sebelum mengulang tryout."}
          {result.weakest
            ? ` Subtes terlemah: ${result.weakest.name} (${result.weakest.percent}%).`
            : ""}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">{children}</div>
      </div>
    </section>
  );
}
