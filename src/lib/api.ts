import { KEYS } from "./keys";
import type { Attempt, LeaderRow } from "./types";

export type { LeaderRow };

const KEY_DEVICE = KEYS.device;
const KEY_PLAYER = KEYS.player;

export interface PublicStats {
  attempts: number;
  avgScore: number;
  perPaket: { refId: string; refName: string; count: number; avgScore: number }[];
}

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(KEY_DEVICE);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(KEY_DEVICE, id);
  }
  return id;
}

export function getPlayerName(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(KEY_PLAYER) ?? "";
}

export function setPlayerName(name: string): void {
  if (typeof window === "undefined") return;
  const clean = name.trim().slice(0, 24);
  if (clean) window.localStorage.setItem(KEY_PLAYER, clean);
  else window.localStorage.removeItem(KEY_PLAYER);
}

async function request<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(`/api${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    // API tidak tersedia (mode statis / offline): aplikasi tetap jalan lokal.
    return null;
  }
}

export async function pushAttempt(attempt: Attempt): Promise<boolean> {
  const data = await request<{ ok: boolean }>("/attempts", {
    method: "POST",
    body: JSON.stringify({
      deviceId: getDeviceId(),
      player: getPlayerName() || null,
      attempt,
    }),
  });
  return Boolean(data?.ok);
}

interface RemoteAttempt extends Attempt {
  player?: string | null;
}

export async function pullAttempts(): Promise<Attempt[] | null> {
  const data = await request<{ attempts: RemoteAttempt[] }>(
    `/attempts?deviceId=${encodeURIComponent(getDeviceId())}`
  );
  return data?.attempts ?? null;
}

export async function deleteRemoteAttempts(): Promise<boolean> {
  const data = await request<{ ok: boolean }>(
    `/attempts?deviceId=${encodeURIComponent(getDeviceId())}`,
    { method: "DELETE" }
  );
  return Boolean(data?.ok);
}

export async function fetchLeaderboard(ref?: string): Promise<LeaderRow[]> {
  const query = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  const data = await request<{ rows: LeaderRow[] }>(`/leaderboard${query}`);
  return data?.rows ?? [];
}

export async function fetchPublicStats(): Promise<PublicStats | null> {
  return request<PublicStats>("/stats");
}
