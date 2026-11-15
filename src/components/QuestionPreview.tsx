import type { Question } from "@/lib/types";
import { LETTERS } from "@/lib/scoring";
import { SUBTEST_BY_ID } from "@/lib/subtests";
import { IconCheck, IconClock } from "./icons";

interface Props {
  question: Question;
  /** waktu yang ditampilkan di pojok, hanya hiasan informasi */
  timer?: string;
  footer?: string;
  /** tampilkan potongan pembahasan asli di bawah opsi */
  showExplanation?: boolean;
  /** angka ringkas di kaki kartu: soal, waktu, pembahasan */
  stats?: { label: string; value: string }[];
}

/**
 * Pratinjau soal sungguhan dari bank soal. Dipakai di beranda supaya pengunjung
 * melihat bentuk produknya — soal, kunci, dan pembahasan — bukan membaca
 * penjelasan tentang produknya.
 */
export default function QuestionPreview({
  question,
  timer = "45:00",
  footer,
  showExplanation = false,
  stats,
}: Props) {
  const subtes = SUBTEST_BY_ID[question.subtest];

  return (
    <div className="card flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <p className="label min-w-0 truncate">
          <span className="sm:hidden">Contoh soal · {subtes?.short ?? ""}</span>
          <span className="hidden sm:inline">
            Contoh soal · {subtes?.name ?? ""} ({subtes?.short ?? ""})
          </span>
        </p>
        <span className="num inline-flex shrink-0 items-center gap-1 rounded-sm bg-accent/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-accent">
          <IconClock size={11} />
          {timer}
        </span>
      </div>

      <div className="p-4 lg:p-5">
        <p className="line-clamp-3 text-sm font-semibold leading-relaxed lg:text-[15px]">
          {question.question}
        </p>
        <ul className="mt-3 space-y-1.5">
          {question.options.slice(0, 4).map((option, index) => {
            const correct = index === question.answer;
            return (
              <li
                key={index}
                className={`flex items-center gap-2.5 rounded-md border px-3 py-1.5 lg:py-2 ${
                  correct ? "border-accent bg-accent/10 text-ink" : "border-line text-muted"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-sm text-[11px] font-semibold ${
                    correct ? "bg-accent text-paper" : "border border-line"
                  }`}
                >
                  {LETTERS[index]}
                </span>
                <span className="line-clamp-2 min-w-0 flex-1 text-[13px] leading-snug lg:text-sm">
                  {option}
                </span>
                {correct ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-paper">
                    <IconCheck size={10} />
                    benar
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      {showExplanation && question.explanation ? (
        <div className="border-t border-line bg-raised/60 px-4 py-3 lg:px-5">
          <p className="label">Pembahasan</p>
          <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted">
            {question.explanation}
          </p>
        </div>
      ) : null}

      {stats && stats.length > 0 ? (
        <dl className="mt-auto grid grid-cols-3 divide-x divide-line border-t border-line bg-raised/60">
          {stats.map((item) => (
            <div key={item.label} className="px-3 py-2.5">
              <dd
                className={`num text-[17px] font-semibold leading-none ${
                  /^\d+$/.test(item.value) ? "font-serif" : "font-sans"
                }`}
              >
                {item.value}
              </dd>
              <dt className="mt-1 text-[10px] text-muted">{item.label}</dt>
            </div>
          ))}
        </dl>
      ) : null}

      {footer ? (
        <div className="hidden truncate border-t border-line px-4 py-2 text-[11px] text-muted sm:block">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
