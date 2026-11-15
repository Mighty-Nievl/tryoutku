"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Paket } from "@/lib/types";
import { SUBTEST_BY_ID } from "@/lib/subtests";
import { MAX_MINUTES, MIN_MINUTES, clampMinutes } from "@/lib/session";
import { IconPencil } from "./icons";

interface Props {
  paket: Paket;
  questionCount: number;
  defaultMinutes: number;
  onStart: (minutes: number) => void;
}

const PRESETS = [15, 20, 30, 45, 60, 90];

/**
 * Layar sebelum timer berjalan. Timer baru dimulai setelah tombol ditekan,
 * jadi tidak ada waktu yang terpakai karena salah tekan.
 */
export default function StartScreen({
  paket,
  questionCount,
  defaultMinutes,
  onStart,
}: Props) {
  const [minutes, setMinutes] = useState(defaultMinutes);
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(String(defaultMinutes));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const angka = Number(input);
  const durasiSah = Number.isFinite(angka) && angka >= MIN_MINUTES && angka <= MAX_MINUTES;

  const subtes = Object.keys(paket.blueprint)
    .map((id) => SUBTEST_BY_ID[id])
    .filter(Boolean);

  function simpan() {
    const next = clampMinutes(Number(input), defaultMinutes);
    setMinutes(next);
    setInput(String(next));
    setEditing(false);
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="card p-5 sm:p-6">
        <p className="label">Sebelum mulai</p>
        <h2 className="mt-1.5 font-serif text-2xl font-semibold tracking-tight">{paket.name}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{paket.description}</p>

        <dl className="mt-5 divide-y divide-line border-y border-line">
          <div className="flex items-center justify-between gap-3 py-3">
            <dt className="text-sm text-muted">Jumlah soal</dt>
            <dd className="num text-sm font-semibold">{questionCount} soal</dd>
          </div>

          <div className="flex items-center justify-between gap-3 py-3">
            <dt className="text-sm text-muted">Waktu</dt>
            <dd className="flex items-center gap-1.5">
              {editing ? (
                <div className="flex items-center gap-1.5">
                  <input
                    ref={inputRef}
                    type="number"
                    inputMode="numeric"
                    min={MIN_MINUTES}
                    max={MAX_MINUTES}
                    value={input}
                    aria-label={`Durasi dalam menit, ${MIN_MINUTES} sampai ${MAX_MINUTES}`}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") simpan();
                      if (event.key === "Escape") {
                        setInput(String(minutes));
                        setEditing(false);
                      }
                    }}
                    aria-describedby="bantuan-durasi"
                    aria-invalid={input.length > 0 && !durasiSah}
                    className={`num h-11 w-20 rounded-md border bg-surface px-2 text-right text-sm ${
                      input.length > 0 && !durasiSah ? "border-danger" : "border-ink/55"
                    }`}
                  />
                  <span className="text-sm text-muted">menit</span>
                  <button
                    type="button"
                    className="btn-primary h-11 px-3"
                    onClick={simpan}
                    disabled={!durasiSah}
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    className="btn-ghost h-11 px-3"
                    onClick={() => {
                      setInput(String(minutes));
                      setEditing(false);
                    }}
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <>
                  <span className="num text-sm font-semibold">{minutes} menit</span>
                  <button
                    type="button"
                    aria-label={`Ubah durasi, sekarang ${minutes} menit`}
                    onClick={() => setEditing(true)}
                    className="inline-flex h-11 items-center gap-1.5 rounded-md border border-line px-2.5 text-xs font-medium text-muted hover:border-ink/30 hover:text-ink"
                  >
                    <IconPencil size={14} />
                    Ubah
                  </button>
                </>
              )}
            </dd>
          </div>

          <div className="py-3">
            <dt className="text-sm text-muted">Komposisi</dt>
            <dd className="mt-1.5 text-sm">
              {subtes
                .map((item) => `${item.short} ${paket.blueprint[item.id] ?? 0}`)
                .join(" · ")}
            </dd>
          </div>
        </dl>

        {editing ? (
          <div className="mt-3">
            <p
              id="bantuan-durasi"
              className={`text-xs ${input.length > 0 && !durasiSah ? "text-danger" : "text-muted"}`}
            >
              {input.length > 0 && !durasiSah
                ? `Isi antara ${MIN_MINUTES} dan ${MAX_MINUTES} menit.`
                : `Pilih cepat, atau isi sendiri antara ${MIN_MINUTES} dan ${MAX_MINUTES} menit.`}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PRESETS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setInput(String(item))}
                  aria-pressed={Number(input) === item}
                  className={`num h-11 min-w-11 rounded-md border px-3 text-sm font-medium ${
                    Number(input) === item
                      ? "border-accent bg-accent/10 text-ink"
                      : "border-line text-muted hover:border-ink/30 hover:text-ink"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">
              Durasi pilihanmu diingat untuk paket ini, bukan untuk paket lain.
            </p>
          </div>
        ) : null}

        <ul className="mt-4 space-y-1.5 text-xs leading-relaxed text-muted">
          <li>Timer baru berjalan setelah kamu menekan tombol mulai.</li>
          <li>Jawaban dan sisa waktu tersimpan, jadi menutup tab tidak menghanguskan sesi.</li>
          <li>Waktu tidak bertambah saat kamu keluar lalu masuk lagi.</li>
          <li>Kalau waktu habis, jawabanmu otomatis dikumpulkan dan dinilai.</li>
        </ul>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button type="button" className="btn-primary h-11" onClick={() => onStart(minutes)}>
            Mulai sekarang
          </button>
          <Link href="/tryout" className="btn-ghost h-11">
            Pilih paket lain
          </Link>
        </div>
      </div>
    </div>
  );
}
