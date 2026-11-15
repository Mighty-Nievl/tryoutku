import type { Attempt } from "./types";
import {
  computeStreak,
  levelFor,
  summarize,
  unlockedBadges,
  xpForAttempt,
  type GameStats,
  type LevelInfo,
  type StreakInfo,
} from "./gamification";

export interface SessionReward {
  xp: number;
  level: LevelInfo;
  stats: GameStats;
  streak: StreakInfo;
}

export interface CelebrationState {
  level: LevelInfo;
  badges: string[];
  leveledUp: boolean;
}

export interface SettledSession {
  reward: SessionReward;
  /** null bila tidak ada yang layak dirayakan */
  celebration: CelebrationState | null;
}

/**
 * Menghitung imbalan sesi dari riwayat sebelum simpan ditambah attempt yang baru
 * tersimpan. Satu implementasi untuk tryout, latihan, dan tantangan, supaya
 * aturan perayaan tidak berbeda antar mode.
 */
export function settleSession(historyBefore: Attempt[], attempt: Attempt): SettledSession {
  const riwayat = [attempt, ...historyBefore];
  const before = summarize(historyBefore);
  const after = summarize(riwayat);
  const badgesBefore = unlockedBadges(before);
  const fresh = unlockedBadges(after).filter((id) => !badgesBefore.includes(id));
  const leveledUp = after.level > before.level;

  return {
    reward: {
      xp: xpForAttempt(attempt),
      level: levelFor(after.xp),
      stats: after,
      streak: computeStreak(riwayat),
    },
    celebration: leveledUp || fresh.length > 0 ? { level: levelFor(after.xp), badges: fresh, leveledUp } : null,
  };
}
