import type { Question } from "@/lib/types";

interface Props {
  questions: Question[];
  answers: Record<string, number>;
  flags: Record<string, boolean>;
  current: number;
  onJump: (index: number) => void;
}

export default function NavGrid({ questions, answers, flags, current, onJump }: Props) {
  return (
    <div>
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-5">
        {questions.map((q, i) => {
          const answered = answers[q.id] !== undefined;
          const flagged = flags[q.id];
          const isCurrent = i === current;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onJump(i)}
              aria-label={`Soal ${i + 1}${answered ? ", sudah dijawab" : ", belum dijawab"}`}
              className={`relative grid h-9 place-items-center rounded-lg border text-xs font-semibold transition ${
                isCurrent
                  ? "border-brand bg-brand text-white"
                  : answered
                    ? "border-brand/40 bg-brand/15 text-ink"
                    : "border-line bg-surface text-muted hover:border-brand/50"
              }`}
            >
              {i + 1}
              {flagged ? (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400" />
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-brand" /> aktif
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-brand/25 ring-1 ring-brand/40" /> dijawab
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded border border-line" /> kosong
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> ragu
        </span>
      </div>
    </div>
  );
}
