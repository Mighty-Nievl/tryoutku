/**
 * Semua kunci penyimpanan di satu tempat. Sebelumnya kunci ditulis langsung di
 * enam berkas dengan prefiks yang tidak seragam, sehingga pemindai draft harus
 * menebak formatnya sendiri.
 */

export const KEYS = {
  history: "tryoutku:v1:history",
  practice: "tryoutku:v1:practice",
  device: "tryoutku:v1:device",
  player: "tryoutku:v1:player",
  profile: "tryoutku:v1:profile",
  theme: "tryoutku:theme",
  tantangan: "tryoutku:v1:tantangan",
  customDurations: "tryoutku:v1:custom-durations",
} as const;

export const DRAFT_PREFIX = "tryoutku:draft:";
export const PRACTICE_DRAFT_PREFIX = "tryoutku:v1:practice-draft:";

export function draftKey(paketId: string): string {
  return `${DRAFT_PREFIX}${paketId}`;
}

export function practiceDraftKey(subtestId: string): string {
  return `${PRACTICE_DRAFT_PREFIX}${subtestId}`;
}

/** Mengembalikan id paket dari kunci draft, atau null bila bukan kunci draft. */
export function paketIdFromDraftKey(key: string): string | null {
  return key.startsWith(DRAFT_PREFIX) ? key.slice(DRAFT_PREFIX.length) : null;
}

export function subtestIdFromPracticeDraftKey(key: string): string | null {
  return key.startsWith(PRACTICE_DRAFT_PREFIX) ? key.slice(PRACTICE_DRAFT_PREFIX.length) : null;
}
