"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildPaketQuestions } from "@/lib/bank";
import type { Paket, Question } from "@/lib/types";
import { formatDuration, scoreAnswers, type ScoredResult } from "@/lib/scoring";
import { recordAttempt } from "@/lib/persist";
import { getHistory } from "@/lib/storage";
import {
  computeStreak,
  levelFor,
  projectedXp,
  summarize,
  unlockedBadges,
  xpForAttempt,
  type GameStats,
  type LevelInfo,
  type StreakInfo,
} from "@/lib/gamification";
import { getProfile } from "@/lib/profile";
import { playSound } from "@/lib/sound";
import QuestionView from "./QuestionView";
import NavGrid from "./NavGrid";
import ResultScreen from "./ResultScreen";
import SessionReward from "./SessionReward";
import Dialog from "./Dialog";
import Celebration from "./Celebration";
import { IconArrowLeft, IconArrowRight, IconCheck, IconClock, IconExit } from "./icons";

interface Draft {
  seed: number;
  answers: Record<string, number>;
  flags: Record<string, boolean>;
  startedAt: number;
  deadline: number;
}

export default function TryoutRunner({ paket }: { paket: Paket }) {
  const draftKey = `tryoutku:draft:${paket.id}`;
  const totalMs = paket.durationMin * 60 * 1000;

  const [ready, setReady] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [index, setIndex] = useState(0);
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [startedAt, setStartedAt] = useState(0);
  const [result, setResult] = useState<ScoredResult | null>(null);
  const [durationSec, setDurationSec] = useState(0);
  const [dialog, setDialog] = useState<null | "submit" | "exit" | "nav">(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [syncState, setSyncState] = useState<"idle" | "synced" | "local">("idle");
  const [announce, setAnnounce] = useState("");
  const [reward, setReward] = useState<{
    xp: number;
    level: LevelInfo;
    stats: GameStats;
    streak: StreakInfo;
  } | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [stuck, setStuck] = useState(false);
  const [bleed, setBleed] = useState<{ ml: number; width: number } | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const [celebration, setCelebration] = useState<{
    level: LevelInfo;
    badges: string[];
    leveledUp: boolean;
  } | null>(null);

  // Kepala sesi melebar saat menempel. Penandanya elemen setinggi 1px di atasnya,
  // jadi status menempel dibaca dari posisi nyata, bukan dari angka gulir.
  useEffect(() => {
    function measure() {
      const node = sentinelRef.current;
      const head = headRef.current;
      if (!node || !head) return;
      // 64px adalah tinggi TopBar: kepala sesi dianggap menempel begitu penanda
      // melewati batas itu.
      const menempel = node.getBoundingClientRect().top < 64;
      setStuck(menempel);
      if (!menempel) {
        setBleed(null);
        return;
      }
      // Lebar layar diukur dari elemen, bukan 100vw, karena 100vw memasukkan
      // lebar scrollbar dan membuat bar melewati tepi kanan.
      const host = head.parentElement?.getBoundingClientRect();
      const width = document.documentElement.clientWidth;
      const ml = host ? -Math.round(host.left) : 0;
      setBleed((prev) =>
        prev && prev.ml === ml && prev.width === width ? prev : { ml, width }
      );
    }
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
    // Penanda baru ada setelah soal siap, jadi pengukuran dipasang ulang saat itu.
  }, [ready]);

  // Muat draft (soal, jawaban, sisa waktu) atau mulai sesi baru
  useEffect(() => {
    let draft: Draft | null = null;
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (raw) draft = JSON.parse(raw) as Draft;
    } catch {
      draft = null;
    }
    if (!draft) {
      draft = {
        seed: Math.floor(Math.random() * 1_000_000_000),
        answers: {},
        flags: {},
        startedAt: Date.now(),
        deadline: Date.now() + totalMs,
      };
      window.localStorage.setItem(draftKey, JSON.stringify(draft));
    }
    setQuestions(buildPaketQuestions(paket, draft.seed));
    setAnswers(draft.answers ?? {});
    setFlags(draft.flags ?? {});
    setStartedAt(draft.startedAt);
    setDeadline(draft.deadline);
    setReady(true);
  }, [draftKey, paket, totalMs]);

  // Simpan jawaban dan tanda ragu
  useEffect(() => {
    if (!ready || result) return;
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) return;
      const draft = JSON.parse(raw) as Draft;
      draft.answers = answers;
      draft.flags = flags;
      window.localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch {
      /* penyimpanan penuh atau mode privat: draft tetap jalan di memori */
    }
  }, [answers, flags, ready, result, draftKey]);

  useEffect(() => {
    if (!ready || result) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [ready, result]);

  const remaining = Math.max(0, Math.floor((deadline - now) / 1000));
  const answeredCount = Object.keys(answers).length;
  const current = questions[index];
  /** Hasil sementara, dipakai untuk memperkirakan XP sebelum dikumpulkan. */
  const pratinjau = useMemo(
    () => (questions.length > 0 ? scoreAnswers(questions, answers) : null),
    [questions, answers]
  );

  const finish = useCallback(
    (auto = false) => {
      if (!questions.length || result) return;
      const scored = scoreAnswers(questions, answers);
      const used = Math.min(Math.round((Date.now() - startedAt) / 1000), paket.durationMin * 60);
      setResult(scored);
      setDurationSec(used);
      setDialog(null);
      setAutoSubmitted(auto);
      try {
        window.localStorage.removeItem(draftKey);
      } catch {
        /* abaikan */
      }
      const historyBefore = getHistory();
      recordAttempt(
        { kind: "tryout", refId: paket.id, refName: paket.name, durationSec: used },
        questions,
        answers,
        scored
      ).then(({ attempt, synced }) => {
        setSyncState(synced ? "synced" : "local");
        // Statistik dihitung dari snapshot sebelum simpan plus attempt yang
        // dikembalikan, jadi tidak bergantung pada urutan riwayat di penyimpanan.
        const riwayat = [attempt, ...historyBefore];
        const before = summarize(historyBefore);
        const after = summarize(riwayat);
        const badgesBefore = unlockedBadges(before);
        const fresh = unlockedBadges(after).filter((id) => !badgesBefore.includes(id));
        const xpSesi = xpForAttempt(attempt);
        setReward({
          xp: xpSesi,
          level: levelFor(after.xp),
          stats: after,
          streak: computeStreak(riwayat),
        });
        if (after.level > before.level || fresh.length > 0) {
          setCelebration({
            level: levelFor(after.xp),
            badges: fresh,
            leveledUp: after.level > before.level,
          });
        }
      });
      playSound(scored.percent >= 60 ? "benar" : "salah", getProfile().sound);
    },
    [answers, draftKey, paket.durationMin, paket.id, paket.name, questions, result, startedAt]
  );

  // Auto-submit saat waktu habis
  useEffect(() => {
    if (ready && !result && remaining <= 0 && deadline > 0) finish(true);
  }, [remaining, ready, result, deadline, finish]);

  // Pengumuman waktu untuk pembaca layar pada ambang 10, 5, dan 1 menit
  const previousRemaining = useRef(remaining);
  useEffect(() => {
    if (!ready || result) return;
    const before = previousRemaining.current;
    previousRemaining.current = remaining;
    const mark = [
      { at: 600, text: "Sisa waktu 10 menit." },
      { at: 300, text: "Sisa waktu 5 menit." },
      { at: 60, text: "Sisa waktu 1 menit." },
    ].find((item) => before > item.at && remaining <= item.at);
    if (mark) setAnnounce(mark.text);
  }, [remaining, ready, result]);

  // Pintasan papan ketik: 1-5 pilih, panah navigasi, F tandai ragu
  useEffect(() => {
    if (!ready || result) return;
    function onKey(event: KeyboardEvent) {
      if (dialog || !current) return;
      const n = Number(event.key);
      if (n >= 1 && n <= current.options.length) {
        setAnswers((prev) => ({ ...prev, [current.id]: n - 1 }));
      } else if (event.key === "ArrowRight") {
        setIndex((i) => Math.min(i + 1, questions.length - 1));
      } else if (event.key === "ArrowLeft") {
        setIndex((i) => Math.max(i - 1, 0));
      } else if (event.key.toLowerCase() === "f") {
        setFlags((prev) => ({ ...prev, [current.id]: !prev[current.id] }));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, dialog, questions.length, ready, result]);

  function restart() {
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      /* abaikan */
    }
    const draft: Draft = {
      seed: Math.floor(Math.random() * 1_000_000_000),
      answers: {},
      flags: {},
      startedAt: Date.now(),
      deadline: Date.now() + totalMs,
    };
    window.localStorage.setItem(draftKey, JSON.stringify(draft));
    setQuestions(buildPaketQuestions(paket, draft.seed));
    setAnswers({});
    setFlags({});
    setIndex(0);
    setStartedAt(draft.startedAt);
    setDeadline(draft.deadline);
    setNow(Date.now());
    setResult(null);
    setAutoSubmitted(false);
    setReward(null);
  }

  if (!ready) {
    return (
      <div className="card p-8 text-center text-sm text-muted" role="status">
        Menyiapkan paket soal…
      </div>
    );
  }

  if (result) {
    return (
      <div>
        <h1 className="sr-only">Hasil {paket.name}</h1>
        <ResultScreen
          paketName={paket.name}
          questions={questions}
          answers={answers}
          result={result}
          durationSec={durationSec}
          autoSubmitted={autoSubmitted}
          syncState={syncState}
          onRestart={restart}
          reward={
            reward ? (
              <SessionReward
                xp={reward.xp}
                level={reward.level}
                stats={reward.stats}
                streak={reward.streak}
              />
            ) : null
          }
        />
        {celebration ? (
          <Celebration
            open
            leveledUp={celebration.leveledUp}
            level={celebration.level}
            newBadges={celebration.badges}
            onClose={() => setCelebration(null)}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="sr-only">{paket.name}</h1>
      <p className="text-sm font-semibold text-muted sm:hidden">{paket.name}</p>
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      <div ref={sentinelRef} aria-hidden="true" className="-mt-4 h-px w-full" />
      <div
        ref={headRef}
        data-stuck={stuck ? "true" : "false"}
        style={stuck && bleed ? { marginLeft: bleed.ml, width: bleed.width } : undefined}
        className={`card sticky top-16 z-20 px-4 py-2.5 transition-[margin,width,border-radius,border-width] duration-200 ease-out sm:px-6 ${
          stuck ? "rounded-none border-x-0 border-b-ink/20" : ""
        }`}
      >
        <div
          className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${
            stuck ? "mx-auto w-full max-w-[69rem]" : ""
          }`}
        >
          <div className="min-w-0 flex-1 basis-full sm:basis-44">
            <p className="hidden truncate text-sm font-semibold sm:block">{paket.name}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <div
                role="progressbar"
                aria-label="Soal yang sudah dijawab"
                aria-valuemin={0}
                aria-valuemax={questions.length}
                aria-valuenow={answeredCount}
                aria-valuetext={`${answeredCount} dari ${questions.length} soal dijawab`}
                className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-line"
              >
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-300"
                  style={{
                    width: `${(answeredCount / Math.max(1, questions.length)) * 100}%`,
                    minWidth: answeredCount > 0 ? "8px" : 0,
                  }}
                />
              </div>
              {questions.length - answeredCount > 0 ? (
                <span
                  aria-label={`${questions.length - answeredCount} soal belum dijawab`}
                  className="shrink-0 text-[11px] text-muted"
                >
                  <span className="num font-semibold text-ink">
                    {questions.length - answeredCount}
                  </span>{" "}
                  belum
                </span>
              ) : (
                <span
                  aria-label="Semua soal sudah dijawab"
                  className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-accent"
                >
                  <IconCheck size={13} className="stroke-[2.4]" />
                  penuh
                </span>
              )}
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:w-auto sm:justify-end sm:gap-6">
            <div className="flex items-center gap-2.5 sm:gap-5">
            <p className="flex shrink-0 items-center gap-1.5">
              <IconClock
                size={15}
                className={remaining <= 300 ? "text-danger" : "text-muted"}
              />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                sisa
              </span>
              <span
                role="timer"
                aria-label={`Sisa waktu ${formatDuration(remaining)}`}
                className={`num font-mono text-[17px] font-semibold leading-none ${
                  remaining <= 300 ? "text-danger" : "text-ink"
                }`}
              >
                {formatDuration(remaining)}
              </span>
            </p>
            <button
              type="button"
              aria-label="Keluar dari tryout"
              className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-md border border-line px-1 text-sm font-medium text-muted hover:border-ink/30 hover:bg-raised hover:text-ink sm:px-3"
              onClick={() => setDialog("exit")}
            >
              <IconExit size={17} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
            </div>
            <button
              type="button"
              className="btn-primary whitespace-nowrap px-3 sm:px-4"
              onClick={() => setDialog("submit")}
            >
              <IconCheck size={16} />
              Selesai
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div
          className="card p-5 pb-28 sm:p-7 lg:pb-7"
          onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)}
          onTouchEnd={(event) => {
            if (touchStart === null) return;
            const delta = (event.changedTouches[0]?.clientX ?? touchStart) - touchStart;
            setTouchStart(null);
            if (Math.abs(delta) < 60) return;
            setIndex((i) =>
              delta < 0 ? Math.min(questions.length - 1, i + 1) : Math.max(0, i - 1)
            );
          }}
        >
          {current ? (
            <>
              <QuestionView
                question={current}
                index={index}
                total={questions.length}
                selected={answers[current.id]}
                onSelect={(option) => setAnswers((prev) => ({ ...prev, [current.id]: option }))}
              />
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="btn-ghost hidden sm:inline-flex"
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  disabled={index === 0}
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  className="btn-primary hidden sm:inline-flex"
                  onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
                  disabled={index === questions.length - 1}
                >
                  Berikutnya
                </button>
                <button
                  type="button"
                  className="btn-ghost w-full justify-center sm:ml-auto sm:w-auto"
                  aria-pressed={Boolean(flags[current.id])}
                  onClick={() =>
                    setFlags((prev) => ({ ...prev, [current.id]: !prev[current.id] }))
                  }
                >
                  {flags[current.id] ? "Ragu (aktif)" : "Tandai ragu"}
                </button>
              </div>
              <p className="mt-3 hidden text-[11px] text-muted sm:block">
                Pintasan: angka 1 sampai {current.options.length} untuk memilih, panah kiri dan kanan
                untuk berpindah, F untuk menandai ragu.
              </p>
              <p className="mt-3 text-[11px] text-muted sm:hidden">
                Geser kiri atau kanan pada kartu soal untuk berpindah. Ketuk bilah di bawah untuk
                melihat semua nomor.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">Tidak ada soal pada paket ini.</p>
          )}
        </div>

        <aside className="card hidden h-fit p-4 lg:sticky lg:top-36 lg:block">
          <p className="label mb-3">Navigasi soal</p>
          <NavGrid
            questions={questions}
            answers={answers}
            flags={flags}
            current={index}
            onJump={setIndex}
          />
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper px-3 py-2.5 lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <button
            type="button"
            className="btn-ghost h-12 w-12 shrink-0 px-0 text-lg"
            aria-label="Soal sebelumnya"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
          >
            <IconArrowLeft size={20} />
          </button>
          <button
            type="button"
            className="btn-primary h-12 min-w-0 flex-1 justify-between px-4"
            onClick={() => setDialog("nav")}
            aria-haspopup="dialog"
            aria-label={`Buka daftar soal, sekarang soal ${index + 1} dari ${questions.length}`}
          >
            <span className="num">
              Soal {index + 1} / {questions.length}
            </span>
            <span className="num text-xs font-normal opacity-80">
              {answeredCount} dijawab
            </span>
          </button>
          <button
            type="button"
            className="btn-ghost h-12 w-12 shrink-0 px-0 text-lg"
            aria-label="Soal berikutnya"
            onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
            disabled={index === questions.length - 1}
          >
            <IconArrowRight size={20} />
          </button>
        </div>
      </div>

      <Dialog
        open={dialog === "submit"}
        title="Selesai mengerjakan?"
        onClose={() => setDialog(null)}
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setDialog(null)}>
              Lanjut mengerjakan
            </button>
            <button type="button" className="btn-primary" onClick={() => finish(false)}>
              Kumpulkan
            </button>
          </>
        }
      >
        <p>
          {questions.length - answeredCount > 0
            ? `Masih ada ${questions.length - answeredCount} soal kosong. Jawaban kosong dihitung salah.`
            : "Semua soal sudah dijawab. Jawaban tidak bisa diubah setelah dikumpulkan."}
        </p>
        {pratinjau ? (
          <p className="mt-2 text-sm">
            Kalau dikumpulkan sekarang: <span className="num">{pratinjau.correct}</span> benar,
            sekitar{" "}
            <span className="num font-semibold">
              {projectedXp("tryout", pratinjau.correct, pratinjau.percent)} XP
            </span>
            .
          </p>
        ) : null}
      </Dialog>

      <Dialog
        open={dialog === "exit"}
        title="Keluar dari tryout?"
        onClose={() => setDialog(null)}
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setDialog(null)}>
              Lanjut mengerjakan
            </button>
            <Link href="/tryout" className="btn-primary">
              Keluar ke daftar paket
            </Link>
          </>
        }
      >
        Jawaban, tanda ragu, dan sisa waktu {formatDuration(remaining)} tersimpan di perangkat ini.
        Kamu bisa melanjutkan paket yang sama kapan saja sebelum waktunya habis.
      </Dialog>

      <Dialog
        open={dialog === "nav"}
        title="Daftar soal"
        variant="sheet"
        onClose={() => setDialog(null)}
        footer={
          <button type="button" className="btn-primary" onClick={() => setDialog(null)}>
            Tutup
          </button>
        }
      >
        <div className="text-ink">
          <p className="mb-3 text-xs text-muted">
            {answeredCount} dari {questions.length} soal dijawab. Ketuk nomor untuk berpindah, atau
            geser kiri dan kanan di kartu soal.
          </p>
          <NavGrid
            questions={questions}
            answers={answers}
            flags={flags}
            current={index}
            scrollCurrentIntoView
            onJump={(target) => {
              setIndex(target);
              setDialog(null);
            }}
          />
        </div>
      </Dialog>
    </div>
  );
}
