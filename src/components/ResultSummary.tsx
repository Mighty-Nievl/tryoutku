import type { ScoredResult } from "@/lib/scoring";
import { formatDuration } from "@/lib/scoring";
import CountUp from "./CountUp";
import Mascot from "./Mascot";

interface Props {
  title: string;
  result: ScoredResult;
  durationSec: number;
  children?: React.ReactNode;
}

function scoreTone(percent: number) {
  if (percent >= 75) return "text-ok";
  if (percent >= 50) return "text-accent";
  return "text-danger";
}

export default function ResultSummary({ title, result, durationSec, children }: Props) {
  return (
    <section className="animate-rise">
      <div className="card p-5 sm:p-7">
        <p className="h-label">{title}</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="flex items-start gap-5">
            <div>
              <div
                className={`num font-serif text-5xl font-semibold leading-none ${scoreTone(result.percent)}`}
              >
                <CountUp value={result.percent} suffix="%" duration={900} />
              </div>
              <p className="label mt-1.5">skor</p>
            </div>
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

          <div className="space-y-2">
            <p className="h-label">Rincian per subtes</p>
            {result.perSubtest.map((sub) => (
              <div key={sub.id} className="flex items-center gap-3 text-sm">
                <span className="w-14 shrink-0 text-xs font-semibold text-muted">{sub.short}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                  <div
                    className="motion-bar h-full rounded-full bg-brand"
                    style={{ width: `${sub.percent}%` }}
                  />
                </div>
                <span className="w-14 shrink-0 text-right text-xs text-muted">
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

        <div className="mt-5 flex flex-wrap gap-2.5">{children}</div>
      </div>
    </section>
  );
}
