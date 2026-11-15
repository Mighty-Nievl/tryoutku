"use client";

import { useEffect, useRef } from "react";
import type { Question } from "@/lib/types";

interface Props {
  questions: Question[];
  answers: Record<string, number>;
  flags: Record<string, boolean>;
  current: number;
  onJump: (index: number) => void;
  /** gulir sel soal aktif ke tengah saat panel dibuka */
  scrollCurrentIntoView?: boolean;
}

export default function NavGrid({
  questions,
  answers,
  flags,
  current,
  onJump,
  scrollCurrentIntoView = false,
}: Props) {
  const currentRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (scrollCurrentIntoView) {
      currentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [scrollCurrentIntoView]);

  return (
    <div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-7 lg:grid-cols-5">
        {questions.map((q, i) => {
          const answered = answers[q.id] !== undefined;
          const flagged = flags[q.id];
          const isCurrent = i === current;
          return (
            <button
              key={q.id}
              ref={isCurrent ? currentRef : undefined}
              type="button"
              onClick={() => onJump(i)}
              aria-label={`Soal ${i + 1}${answered ? ", sudah dijawab" : ", belum dijawab"}${flagged ? ", ditandai ragu" : ""}`}
              aria-current={isCurrent ? "true" : undefined}
              className={`relative grid h-11 min-w-11 place-items-center rounded-md border text-xs font-semibold transition ${
                isCurrent
                  ? "border-brand bg-brand text-paper"
                  : answered
                    ? "border-brand/40 bg-brand/15 text-ink"
                    : "border-line bg-surface text-muted hover:border-brand/50"
              }`}
            >
              {i + 1}
              {answered ? (
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-1.5 bottom-1 h-1 rounded-full ${
                    isCurrent ? "bg-paper/90" : "bg-brand/80"
                  }`}
                />
              ) : null}
              {flagged ? (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400" />
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="grid h-4 w-4 place-items-center rounded-sm border border-brand bg-brand text-[9px] text-paper">
            1
          </span>
          aktif
        </span>
        <span className="flex items-center gap-1.5">
          <span className="relative h-4 w-4 rounded-sm border border-brand/40 bg-brand/15">
            <span className="absolute inset-x-1 bottom-0.5 h-0.5 rounded-full bg-brand/80" />
          </span>
          dijawab
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-4 w-4 rounded-sm border border-line" />
          kosong
        </span>
        <span className="flex items-center gap-1.5">
          <span className="relative h-4 w-4 rounded-sm border border-line">
            <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
          </span>
          ragu
        </span>
      </div>
    </div>
  );
}
