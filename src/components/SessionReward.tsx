import type { GameStats, LevelInfo, StreakInfo } from "@/lib/gamification";

interface Props {
  /** XP yang baru didapat dari sesi ini */
  xp: number;
  level: LevelInfo;
  stats: GameStats;
  streak: StreakInfo;
}

/**
 * Ringkasan imbalan sesi. Selalu tampil setelah sesi selesai, bukan hanya saat
 * naik level, supaya usaha yang belum cukup untuk naik level tetap terlihat.
 */
export default function SessionReward({ xp, level, stats, streak }: Props) {
  const sisa = level.nextXp ? Math.max(0, level.nextXp - (level.minXp + level.xpIntoLevel)) : 0;
  const totalXp = level.minXp + level.xpIntoLevel;

  return (
    <section className="card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="label">Imbalan sesi</p>
        <p className="num text-lg font-semibold text-accent">
          {xp > 0 ? `+${xp}` : "0"} XP
        </p>
      </div>

      <div className="mt-2.5">
        <div className="flex items-baseline justify-between gap-2 text-xs">
          <span className="font-medium">
            Level {level.level}, {level.name}
          </span>
          <span className="num text-muted">
            {level.xpIntoLevel}/{level.xpForLevel} XP
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-700"
            style={{ width: `${Math.max(3, level.progress * 100)}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-muted">
          {level.nextXp
            ? `${sisa} XP lagi menuju level ${level.level + 1}.`
            : "Level tertinggi sudah tercapai."}
        </p>
      </div>

      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-line pt-3 text-xs">
        <div className="flex items-baseline gap-1.5">
          <dt className="text-muted">Streak</dt>
          <dd className="num font-semibold">{streak.current} hari</dd>
        </div>
        <div className="flex items-baseline gap-1.5">
          <dt className="text-muted">Terpanjang</dt>
          <dd className="num font-semibold">{streak.longest} hari</dd>
        </div>
        <div className="flex items-baseline gap-1.5">
          <dt className="text-muted">Total</dt>
          <dd className="num font-semibold">{stats.attempts} sesi</dd>
        </div>
        <div className="flex items-baseline gap-1.5">
          <dt className="text-muted">XP keseluruhan</dt>
          <dd className="num font-semibold">{totalXp}</dd>
        </div>
      </dl>

      {streak.activeToday && streak.current >= 3 ? (
        <p className="mt-2 text-xs text-muted">
          Streak {streak.current} hari berturut-turut. Jangan putus besok.
        </p>
      ) : null}
    </section>
  );
}
