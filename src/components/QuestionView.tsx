import type { Question } from "@/lib/types";
import { LETTERS } from "@/lib/scoring";

interface Props {
  question: Question;
  index: number;
  total: number;
  selected?: number;
  onSelect?: (optionIndex: number) => void;
  /** tampilkan benar/salah + pembahasan */
  reveal?: boolean;
}

export default function QuestionView({
  question,
  index,
  total,
  selected,
  onSelect,
  reveal = false,
}: Props) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="h-label">
          Soal {index + 1} dari {total}
        </span>
        <span className="chip">Tingkat {question.level ?? 2}/3</span>
      </div>

      {question.passage ? (
        <div className="mb-5 rounded-xl border border-line bg-raised/70 p-4 text-sm leading-relaxed text-muted sm:p-5">
          {question.passage.split("\n").map((line, i) => (
            <p key={i} className={i > 0 ? "mt-3" : undefined}>
              {line}
            </p>
          ))}
        </div>
      ) : null}

      <h2 className="text-base font-semibold leading-relaxed sm:text-lg">{question.question}</h2>

      <div className="mt-4 space-y-2.5" role="radiogroup" aria-label="Pilihan jawaban">
        {question.options.map((option, i) => {
          const isSelected = selected === i;
          const isCorrect = reveal && i === question.answer;
          const isWrongPick = reveal && isSelected && i !== question.answer;

          let tone = "option-row";
          if (reveal && isCorrect) tone += " border-ok/70 bg-ok/10";
          else if (reveal && isWrongPick) tone += " border-danger/70 bg-danger/10";
          else if (isSelected) tone += " border-brand bg-brand/10";

          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={reveal || !onSelect}
              onClick={() => onSelect?.(i)}
              className={tone}
            >
              <span
                className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs font-bold ${
                  isSelected || isCorrect
                    ? "border-transparent bg-brand text-white"
                    : "border-line text-muted"
                }`}
              >
                {LETTERS[i]}
              </span>
              <span className="leading-relaxed">{option}</span>
            </button>
          );
        })}
      </div>

      {reveal ? (
        <div className="mt-5 rounded-xl border border-line bg-raised/70 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Jawaban benar
          </p>
          <p className="mt-1 text-sm font-semibold">
            {LETTERS[question.answer]}: {question.options[question.answer]}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{question.explanation}</p>
        </div>
      ) : null}
    </div>
  );
}
