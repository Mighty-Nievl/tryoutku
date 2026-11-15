"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AVATARS, DEFAULT_PROFILE, getProfile, saveProfile, type Profile } from "@/lib/profile";
import { getHistory, clearHistory } from "@/lib/storage";
import {
  BADGES,
  computeStreak,
  levelFor,
  summarize,
  unlockedBadges,
} from "@/lib/gamification";
import { playSound } from "@/lib/sound";
import Avatar from "@/components/Avatar";
import Mascot from "@/components/Mascot";
import LevelBar from "@/components/LevelBar";
import ThemeToggle from "@/components/ThemeToggle";

export default function ProfilPage() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState(() => summarize([]));
  const [badges, setBadges] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProfile(getProfile());
    const history = getHistory();
    setStats(summarize(history));
    setBadges(unlockedBadges(summarize(history)));
    setLoaded(true);
  }, []);

  function update(patch: Partial<Profile>) {
    const next = { ...profile, ...patch };
    setProfile(next);
    saveProfile(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  function reset() {
    clearHistory();
    const fresh: Profile = { ...DEFAULT_PROFILE, createdAt: new Date().toISOString() };
    setProfile(fresh);
    saveProfile(fresh);
    setStats(summarize([]));
    setBadges([]);
  }

  const level = levelFor(stats.xp);

  if (!loaded) {
    return <div className="card p-8 text-sm text-muted">Memuat profil…</div>;
  }

  return (
    <div className="space-y-8 py-4">
      <header className="flex flex-wrap items-center gap-5">
        <Avatar id={profile.avatarId} name={profile.name} size={72} />
        <div>
          <p className="label">Profil</p>
          <h1 className="mt-1 font-serif text-2xl font-semibold">
            {profile.name || "Pelajar tanpa nama"}
          </h1>
          <p className="num mt-1 text-sm text-muted">
            Level {level.level} {level.name} · {stats.xp} XP · streak {stats.streak} hari
          </p>
        </div>
        <Mascot mood={stats.streak > 0 ? "senang" : "fokus"} size={72} className="ml-auto hidden sm:block" />
      </header>

      <section className="card p-5">
        <h2 className="font-serif text-lg font-semibold">Progres</h2>
        <div className="mt-3">
          <LevelBar />
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Sesi selesai", value: stats.attempts },
            { label: "Tryout", value: stats.tryout },
            { label: "Tantangan harian", value: stats.tantangan },
            { label: "Skor terbaik", value: `${stats.bestScore}%` },
          ].map((item) => (
            <div key={item.label}>
              <dt className="label">{item.label}</dt>
              <dd className="num mt-1 font-serif text-xl font-semibold">{item.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-muted">
          Streak terpanjang {computeStreak(getHistorySafe()).longest} hari. XP dihitung dari jawaban
          benar, bukan dari lama aplikasi dibuka.
        </p>
      </section>

      <section className="card p-5">
        <h2 className="font-serif text-lg font-semibold">Nama dan avatar</h2>
        <p className="mt-1 text-xs text-muted">
          Nama tampil di papan skor pada percobaan berikutnya. Avatar hanya tersimpan di perangkat ini.
        </p>

        <label htmlFor="nama" className="label mt-4 block">
          Nama tampilan
        </label>
        <input
          id="nama"
          value={profile.name}
          onChange={(event) => update({ name: event.target.value })}
          maxLength={24}
          placeholder="Contoh: Rani"
          className="mt-1.5 min-h-11 w-full max-w-sm rounded-md border border-line bg-surface px-3 text-sm"
        />

        <fieldset className="mt-5">
          <legend className="label">Avatar</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {AVATARS.map((item) => {
              const active = profile.avatarId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => update({ avatarId: item.id })}
                  aria-pressed={active}
                  aria-label={`Pilih avatar ${item.label}`}
                  className={`grid h-14 w-14 place-items-center rounded-md border transition ${
                    active ? "border-accent bg-accent/10" : "border-line hover:border-ink/40"
                  }`}
                >
                  <Avatar id={item.id} name={profile.name} size={36} />
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              update({ sound: !profile.sound });
              playSound("klik", !profile.sound);
            }}
            aria-pressed={profile.sound}
          >
            Efek suara: {profile.sound ? "aktif" : "mati"}
          </button>
          <span className="text-xs text-muted">{saved ? "Tersimpan." : "Perubahan tersimpan otomatis."}</span>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-serif text-lg font-semibold">Lencana</h2>
        <p className="mt-1 text-xs text-muted">
          Terbuka {badges.length} dari {BADGES.length}. Syaratnya dihitung dari riwayat nyata, bukan
          diberikan otomatis.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {BADGES.map((badge) => {
            const owned = badges.includes(badge.id);
            return (
              <li
                key={badge.id}
                className={`flex items-center gap-3 rounded-md border px-3 py-2 ${
                  owned ? "border-accent/40 bg-accent/10" : "border-line opacity-70"
                }`}
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-sm text-xs font-bold ${
                    owned ? "bg-accent text-paper" : "bg-raised text-muted"
                  }`}
                  aria-hidden="true"
                >
                  {badge.mark}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{badge.name}</span>
                  <span className="block text-xs text-muted">{badge.description}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="font-serif text-lg font-semibold">Data dan pengaturan</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <ThemeToggle />
          <Link href="/bantuan" className="btn-ghost">
            Bantuan
          </Link>
          <Link href="/glosarium" className="btn-ghost">
            Glosarium
          </Link>
          <Link href="/privasi" className="btn-ghost">
            Privasi
          </Link>
          <button type="button" className="btn-ghost text-danger" onClick={reset}>
            Setel ulang profil dan riwayat
          </button>
        </div>
        <p className="mt-3 text-xs text-muted">
          Menyetel ulang menghapus riwayat di perangkat ini. Data yang sudah terkirim ke backend
          tetap tersimpan sampai kamu menghapusnya dari halaman riwayat.
        </p>
      </section>
    </div>
  );
}

function getHistorySafe() {
  return typeof window === "undefined" ? [] : getHistory();
}
