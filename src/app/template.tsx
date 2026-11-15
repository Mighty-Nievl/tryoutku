import type { ReactNode } from "react";

/**
 * Transisi antar halaman: hanya fade naik singkat, supaya isi tidak
 * berkedip saat berpindah. Animasi dimatikan oleh prefers-reduced-motion
 * lewat kelas .motion-fade-up.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="motion-fade-up">{children}</div>;
}
