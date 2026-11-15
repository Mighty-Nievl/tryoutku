import type { Question } from "@/lib/types";
import { LETTERS } from "@/lib/scoring";
import { SUBTEST_BY_ID } from "@/lib/subtests";
import { IconClock } from "./icons";

interface Props {
  question: Question;
  /** waktu yang ditampilkan di pojok, hanya hiasan informasi */
  timer?: string;
  footer?: string;
  /** angka ringkas di kaki kartu: soal, waktu, pembahasan */
  stats?: { label: string; value: string }[];
}

/**
 * Pratinjau soal sungguhan dari bank soal. Dipakai di beranda supaya pengunjung
 * melihat bentuk produknya, bukan membaca penjelasan tentang produknya.
 */
export default function QuestionPreview({ question, timer = "45:00", footer, stats }: Props) {
  const subtes = SUBTEST_BY_ID[question.subtest];

  return (
    <div className="card flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <p className="label">Contoh soal{subtes ? ` · ${subtes.short}` : ""}</p>
        <span className="num inline-flex items-center gap-1 rounded-sm bg-accent/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-accent">
          <IconClock size={11} />
          {timer}
        </span>
      </div>

      <div className="p-4 lg:p-5">
        <p className="line-clamp-2 text-sm font-semibold leading-relaxed lg:text-base">{question.question}</p>
        <ul className="mt-3 space-y-1.5">
          {question.options.slice(0, 4).map((option, index) => {
            const correct = index === question.answer;
            return (
              <li
                key={index}
                className={`flex items-start gap-2 rounded-md border px-2.5 py-1 text-xs leading-snug lg:py-1.5 lg:text-[13px] ${
                  correct ? "border-accent bg-accent/10 text-ink" : "border-line text-muted"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`grid h-4 w-4 shrink-0 place-items-center rounded-sm text-[10px] font-semibold ${
                    correct ? "bg-accent text-paper" : "border border-line"
                  }`}
                >
                  {LETTERS[index]}
                </span>
                <span className="line-clamp-2">{option}</span>
                {correct ? (
                  <span className="ml-auto shrink-0 text-[10px] font-semibold text-accent">benar</span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      {stats && stats.length > 0 ? (
        <dl className="mt-auto grid grid-cols-3 border-t border-line bg-raised/60">
          {stats.map((item, index) => (
            <div
              key={item.label}
              className={`px-3 py-2 ${index > 0 ? "border-l border-line" : ""}`}
            >
              <dd
                className={`num text-base font-semibold leading-none ${
                  /^\d+$/.test(item.value) ? "font-serif" : "sans"
                }`}
              >
                {item.value}
              </dd>
              <dt className="mt-0.5 text-[10px] text-muted">{item.label}</dt>
            </div>
          ))}
        </dl>
      ) : null}

      {footer ? (
        <div className="hidden truncate border-t border-line px-4 py-2 text-[11px] text-muted sm:block">{footer}</div>
      ) : null}
    </div>
  );
}
