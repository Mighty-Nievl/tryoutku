"use client";

import { useState } from "react";
import Link from "next/link";
import type { Question } from "@/lib/types";
import { LETTERS } from "@/lib/scoring";
import { SUBTEST_BY_ID } from "@/lib/subtests";
import { IconArrowRight, IconCheck, IconClock } from "./icons";

interface Props {
  question: Question;
  /** waktu paket yang ditampilkan di kepala kartu */
  timer: string;
  paketName: string;
  paketHref: string;
}

/**
 * Pratinjau soal yang bisa dikerjakan, bukan dipamerkan. Kunci dan pembahasan
 * baru terbuka setelah pengunjung memilih — momen "saya bisa nggak ya?" itulah
 * yang menjual produk, bukan jawaban yang disuapkan.
 */
export default function HeroTry({ question, timer, paketName, paketHref }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const subtes = SUBTEST_BY_ID[question.subtest];
  const answered = picked !== null;
  const benar = picked === question.answer;

  return (
    <div id="coba" className="card flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <p className="label min-w-0 truncate">
          Coba dulu · {subtes?.name ?? ""} ({subtes?.short ?? ""})
        </p>
        <span className="num inline-flex shrink-0 items-center gap-1 rounded-sm bg-accent/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-accent">
          <IconClock size={11} />
          {timer}
        </span>
      </div>

      <div className="p-4 lg:p-5">
        <p className="text-sm font-semibold leading-relaxed lg:text-[15px]">{question.question}</p>
        <ul className="mt-3 space-y-1.5" role="group" aria-label="Pilih satu jawaban">
          {question.options.slice(0, 4).map((option, index) => {
            const isPicked = picked === index;
            const isCorrectKey = answered && index === question.answer;
            const tone = isCorrectKey
              ? "border-accent bg-accent/10"
              : isPicked
                ? "border-danger bg-danger/10"
                : answered
                  ? "border-line text-muted"
                  : "border-ink/25 hover:border-ink/50 dark:border-ink/40";
            return (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => setPicked(index)}
                  aria-pressed={isPicked}
                  disabled={answered}
                  className={`flex w-full items-center gap-2.5 rounded-md border px-3 py-1.5 text-left transition-colors lg:py-2 disabled:cursor-default ${tone}`}
                >
                  <span
                    aria-hidden="true"
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-sm text-[11px] font-semibold ${
                      isCorrectKey
                        ? "bg-accent text-paper"
                        : isPicked
                          ? "bg-danger text-paper"
                          : "border border-line"
                    }`}
                  >
                    {LETTERS[index]}
                  </span>
                  <span className="min-w-0 flex-1 text-[13px] leading-snug lg:text-sm">
                    {option}
                  </span>
                  {isCorrectKey ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-paper">
                      <IconCheck size={10} />
                      benar
                    </span>
                  ) : null}
                  {isPicked && !benar ? (
                    <span className="shrink-0 rounded-sm bg-danger px-1.5 py-0.5 text-[10px] font-semibold text-paper">
                      pilihanmu
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>

        {!answered ? (
          <p className="mt-3 text-[11px] text-muted">
            Klik satu pilihan — dinilai detik itu juga, seperti di tryout sungguhan.
          </p>
        ) : null}
      </div>

      {answered ? (
        <div className="animate-rise border-t border-line bg-raised/60 px-4 py-3 lg:px-5">
          <p className="text-xs font-semibold">
            {benar ? "Tepat." : "Belum tepat."}{" "}
            <span className="font-normal text-muted">Kunci: {LETTERS[question.answer]}.</span>
          </p>
          <p className="label mt-2">Pembahasan</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">{question.explanation}</p>
        </div>
      ) : null}

      <div className="mt-auto border-t border-line px-4 py-3">
        <Link
          href={paketHref}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-accent"
        >
          Kerjakan {paketName} penuh <IconArrowRight size={14} />
        </Link>
        <p className="sr-only">Contoh soal dari paket {paketName}.</p>
      </div>
    </div>
  );
}
