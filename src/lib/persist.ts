import { pushAttempt } from "./api";
import { toAttemptPayload } from "./scoring";
import type { ScoredResult } from "./scoring";
import { saveAttempt } from "./storage";
import type { Attempt, Question } from "./types";

type AttemptBase = Pick<Attempt, "kind" | "refId" | "refName" | "durationSec">;

/**
 * Simpan hasil ke perangkat lalu dorong ke API.
 * Mengembalikan true bila tersinkron ke cloud; false berarti hasil hanya lokal.
 */
export async function recordAttempt(
  base: AttemptBase,
  questions: Question[],
  answers: Record<string, number>,
  result: ScoredResult
): Promise<boolean> {
  const saved = saveAttempt(toAttemptPayload(base, questions, answers, result));
  return pushAttempt(saved);
}
