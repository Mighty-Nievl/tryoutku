"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchLeaderboard,
  fetchPublicStats,
  getDeviceId,
  getPlayerName,
  setPlayerName,
  type LeaderRow,
  type PublicStats,
} from "@/lib/api";
import { PAKETS } from "@/lib/pakets";

export default function PapanSkorPage() {
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [paket, setPaket] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const [device, setDevice] = useState("");

  useEffect(() => {
    setName(getPlayerName());
    setDevice(getDeviceId());
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      const [leader, publicStats] = await Promise.all([
        fetchLeaderboard(paket || undefined),
        fetchPublicStats(),
      ]);
      if (!active) return;
      setRows(leader);
      setStats(publicStats);
      setOffline(publicStats === null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [paket]);

  function saveName() {
    setPlayerName(name);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6 py-4">
      <header>
        <p className="h-label">Papan skor</p>
        <h1 className="mt-2 font-serif text-3xl font-extrabold tracking-tight">
          Skor tertinggi semua peserta
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Data dari backend Hono + D1. Setiap tryout yang dikumpulkan tercatat otomatis; urutan
          ditentukan skor lalu waktu pengerjaan tercepat.
        </p>
      </header>

      {offline ? (
        <div className="card border-amber-500/40 p-4 text-sm text-muted">
          Backend belum terjangkau dari halaman ini. Kalau kamu menjalankan mode statis murni
          (`python -m http.server` atau `file://`), jalankan `bun run preview` agar Pages Functions
          (Hono) ikut aktif.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="h-label">Total sesi tercatat</p>
          <p className="mt-1 font-serif text-2xl font-extrabold">{stats?.attempts ?? 0}</p>
        </div>
        <div className="card p-4">
          <p className="h-label">Rata-rata skor</p>
          <p className="mt-1 font-serif text-2xl font-extrabold">{stats?.avgScore ?? 0}%</p>
        </div>
        <div className="card p-4">
          <p className="h-label">Paket paling sering dikerjakan</p>
          <p className="mt-1 truncate font-serif text-base font-bold">
            {stats?.perPaket?.[0]?.refName ?? "Belum ada data"}
          </p>
        </div>
      </div>

      <section className="card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-base font-bold">Peringkat</h2>
          <select
            value={paket}
            onChange={(event) => setPaket(event.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-ink"
          >
            <option value="">Semua paket tryout</option>
            {PAKETS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-muted">Memuat peringkat…</p>
        ) : rows.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Belum ada yang masuk peringkat. Selesaikan satu paket tryout untuk mengisi papan ini.
          </p>
        ) : (
          <ol className="mt-4 divide-y divide-line">
            {rows.map((row) => (
              <li key={`${row.rank}-${row.createdAt}`} className="flex items-center gap-3 py-2.5">
                <span
                  className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-bold ${
                    row.rank <= 3 ? "bg-brand text-white" : "bg-raised text-muted"
                  }`}
                >
                  {row.rank}
                </span>
                <span className="flex-1 truncate text-sm font-medium">{row.player}</span>
                <span className="text-xs text-muted">
                  {row.correct}/{row.total}
                </span>
                <span className="w-14 text-right font-serif text-lg font-extrabold">
                  {row.score}%
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="card p-4 sm:p-5">
        <h2 className="font-serif text-base font-bold">Nama di papan skor</h2>
        <p className="mt-1 text-xs text-muted">
          Dipakai untuk percobaan berikutnya. Tanpa nama, entri tampil sebagai Anonim.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nama tampilan (maks. 24 karakter)"
            maxLength={24}
            className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand"
          />
          <button type="button" className="btn-primary" onClick={saveName}>
            {saved ? "Tersimpan" : "Simpan nama"}
          </button>
        </div>
        <p className="mt-3 text-[11px] text-muted">
          ID perangkat: <code className="font-mono">{device.slice(0, 8) || "belum dibuat"}</code>, dipakai
          backend untuk memisahkan riwayatmu dari pengguna lain.
        </p>
        <p className="mt-2 text-[11px] text-muted">
          Ingin lihat riwayatmu? <Link href="/riwayat" className="text-brand">Buka halaman riwayat</Link>.
        </p>
      </section>
    </div>
  );
}
