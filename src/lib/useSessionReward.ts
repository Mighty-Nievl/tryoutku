"use client";

import { useCallback, useState } from "react";
import type { Attempt } from "./types";
import { settleSession, type CelebrationState, type SessionReward } from "./reward";

/**
 * Menyimpan hasil perhitungan imbalan untuk satu sesi. Dipakai tryout dan
 * latihan supaya keduanya menampilkan angka yang sama dengan aturan yang sama.
 */
export function useSessionReward() {
  const [reward, setReward] = useState<SessionReward | null>(null);
  const [celebration, setCelebration] = useState<CelebrationState | null>(null);

  const settle = useCallback((historyBefore: Attempt[], attempt: Attempt) => {
    const settled = settleSession(historyBefore, attempt);
    setReward(settled.reward);
    setCelebration(settled.celebration);
    return settled;
  }, []);

  const reset = useCallback(() => {
    setReward(null);
    setCelebration(null);
  }, []);

  const dismissCelebration = useCallback(() => setCelebration(null), []);

  return { reward, celebration, settle, reset, dismissCelebration };
}
