import { setPlayerName } from "./api";

export interface Profile {
  name: string;
  avatarId: string;
  mascotMood: "senang" | "fokus" | "sedih";
  sound: boolean;
  createdAt: string;
}

const KEY = "tryoutku:v1:profile";

export const DEFAULT_PROFILE: Profile = {
  name: "",
  avatarId: "a1",
  mascotMood: "senang",
  sound: true,
  createdAt: "",
};

export const AVATARS = [
  { id: "a1", label: "Bulat", tone: "accent" },
  { id: "a2", label: "Kotak", tone: "accent" },
  { id: "a3", label: "Segitiga", tone: "danger" },
  { id: "a4", label: "Bintang", tone: "danger" },
  { id: "a5", label: "Daun", tone: "ok" },
  { id: "a6", label: "Bunga", tone: "ok" },
  { id: "a7", label: "Petir", tone: "accent" },
  { id: "a8", label: "Inisial", tone: "muted" },
] as const;

export function getProfile(): Profile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const fresh: Profile = { ...DEFAULT_PROFILE, createdAt: new Date().toISOString() };
      window.localStorage.setItem(KEY, JSON.stringify(fresh));
      return fresh;
    }
    const parsed = JSON.parse(raw) as Partial<Profile>;
    return {
      name: typeof parsed.name === "string" ? parsed.name.slice(0, 24) : "",
      avatarId: typeof parsed.avatarId === "string" ? parsed.avatarId : "a1",
      mascotMood:
        parsed.mascotMood === "fokus" || parsed.mascotMood === "sedih" ? parsed.mascotMood : "senang",
      sound: parsed.sound !== false,
      createdAt: parsed.createdAt ?? new Date().toISOString(),
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: Profile): void {
  if (typeof window === "undefined") return;
  const clean: Profile = {
    ...profile,
    name: profile.name.trim().slice(0, 24),
  };
  window.localStorage.setItem(KEY, JSON.stringify(clean));
  // Nama tampilan dipakai backend untuk papan skor.
  setPlayerName(clean.name);
}
