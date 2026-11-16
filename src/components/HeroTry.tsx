"use client";

import { useState } from "react";
import Link from "next/link";
import type { Question } from "@/lib/types";
import { LETTERS } from "@/lib/scoring";
import { SUBTEST_BY_ID } from "@/lib/subtests";
import { IconArrowRight, IconCheck, IconClock } from "./icons";
import Mascot from "./Mascot";

interface Props {
  /** tiga soal lintas subtes; setelah terjawab pengunjung bisa lanjut */
  questions: Question[];
  /** waktu paket yang ditampilkan di kepala kartu */
  timer: string;
  paketName: string;
  paketHref: string;
}

/**
 * Pratinjau soal yang bisa dikerjakan, bukan dipamerkan. Kunci dan pembahasan
 * baru terbuka setelah pengunjung memilih — momen "saya bisa nggak ya?" itulah
 * yang menjual produk, bukan jawaban yang disuapkan. Umpan balik memakai
 * aria-live supaya pengguna pembaca layar ikut mendengar hasilnya, dan soal
 * berikutnya bisa dilanjutkan tanpa muat ulang.
 */
export default function HeroTry({ questions, timer, paketName, paketHref }: Props) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const question = questions[index];
  const subtes = question ? SUBTEST_BY_ID[question.subtest] : undefined;
  const answered = picked !== null;
  const benar = question !== undefined && picked === question.answer;
  const adaLanjutan = questions.length > 1;
  const jawab = question?.options ?? [];

  function lanjut() {
    setIndex((i) => (i + 1) % questions.length);
    setPicked(null);
  }

  if (!question) return null;

  return (
    <div id="coba" className="card flex h-full flex-col overflow-hidden text-ink">
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
          {jawab.slice(0, 4).map((option, indexOpsi) => {
            const isPicked = picked === indexOpsi;
            const isCorrectKey = answered && indexOpsi === question.answer;
            const tone = isCorrectKey
              ? "border-accent bg-accent/10"
              : isPicked
                ? "border-danger bg-danger/10"
                : answered
                  ? "border-line text-muted"
                  : "border-ink/25 hover:border-ink/50 dark:border-ink/40";
            return (
              <li key={indexOpsi}>
                <button
                  type="button"
                  onClick={() => setPicked(indexOpsi)}
                  aria-pressed={isPicked}
                  disabled={answered}
                  className={`flex w-full items-center gap-2.5 rounded-md border px-3 py-1.5 text-left transition-all lg:py-2 disabled:cursor-default ${
                    answered ? "" : "hover:-translate-y-px"
                  } ${tone}`}
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
                    {LETTERS[indexOpsi]}
                  </span>
                  <span className="min-w-0 flex-1 text-[13px] leading-snug lg:text-sm">
                    {option}
                  </span>
                  {isCorrectKey ? (
                    <span className="motion-pop inline-flex shrink-0 items-center gap-1 rounded-sm bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-paper">
                      <IconCheck size={10} />
                      benar
                    </span>
                  ) : null}
                  {isPicked && !benar ? (
                    <span className="motion-pop shrink-0 rounded-sm bg-danger px-1.5 py-0.5 text-[10px] font-semibold text-paper">
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
            Soal {index + 1} dari {questions.length} — klik satu pilihan, dinilai detik itu
            juga, seperti di tryout sungguhan.
          </p>
        ) : null}
      </div>

      {answered ? (
        <div
          aria-live="polite"
          className="animate-rise border-t border-line bg-raised/60 px-4 py-3 lg:px-5"
        >
          <div className="flex items-start gap-3">
            <Mascot
              size={42}
              mood={benar ? "senang" : "bingung"}
              react={benar ? "benar" : "salah"}
              className="-mt-1 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold">
                {benar ? "Tepat." : "Belum tepat."}{" "}
                <span className="font-normal text-muted">Kunci: {LETTERS[question.answer]}.</span>
              </p>
              <p className="label mt-2">Pembahasan</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{question.explanation}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-4 py-2.5">
        {answered && adaLanjutan ? (
          <button
            type="button"
            onClick={lanjut}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink transition-colors hover:text-accent"
          >
            Soal berikutnya
            <IconArrowRight size={14} />
          </button>
        ) : null}
        <Link
          href={paketHref}
          className={`inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-accent ${
            answered && adaLanjutan ? "sm:ml-auto" : ""
          }`}
        >
          Kerjakan {paketName} penuh <IconArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
