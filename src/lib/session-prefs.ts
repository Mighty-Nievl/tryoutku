import { KEYS } from "./keys";
import { clampMinutes } from "./session";

/**
 * Durasi pilihan pengguna per paket. Dipakai sebagai nilai awal saat paket itu
 * dibuka lagi, supaya orang yang biasa mengerjakan 20 menit tidak perlu
 * mengubahnya setiap kali.
 */

type Map = Record<string, number>;

function read(): Map {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEYS.customDurations);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    return parsed as Map;
  } catch {
    return {};
  }
}

export function getCustomMinutes(paketId: string): number | null {
  const value = read()[paketId];
  return typeof value === "number" ? clampMinutes(value, value) : null;
}

export function setCustomMinutes(paketId: string, minutes: number): void {
  if (typeof window === "undefined") return;
  try {
    const map = read();
    map[paketId] = clampMinutes(minutes, minutes);
    window.localStorage.setItem(KEYS.customDurations, JSON.stringify(map));
  } catch {
    /* mode privat: pilihan tidak bertahan, sesi tetap jalan */
  }
}
