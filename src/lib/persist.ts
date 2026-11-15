import { pushAttempt } from "./api";
import { toAttemptPayload } from "./scoring";
import type { ScoredResult } from "./scoring";
import { saveAttempt } from "./storage";
import type { Attempt, Question } from "./types";

type AttemptBase = Pick<Attempt, "kind" | "refId" | "refName" | "durationSec">;

export interface RecordedAttempt {
  attempt: Attempt;
  /** true bila backend menerima datanya */
  synced: boolean;
}

/**
 * Simpan hasil ke perangkat lalu dorong ke API. Attempt yang tersimpan
 * dikembalikan supaya pemanggil tidak perlu menebak posisi di riwayat.
 */
export async function recordAttempt(
  base: AttemptBase,
  questions: Question[],
  answers: Record<string, number>,
  result: ScoredResult
): Promise<RecordedAttempt> {
  const attempt = saveAttempt(toAttemptPayload(base, questions, answers, result));
  const synced = await pushAttempt(attempt);
  return { attempt, synced };
}
