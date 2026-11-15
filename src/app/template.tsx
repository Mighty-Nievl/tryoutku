import type { ReactNode } from "react";

/**
 * Transisi antar halaman: hanya fade, tanpa transform. Transform pada wadah
 * akan membuat position: fixed di dalamnya mengacu ke wadah itu, bukan layar.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="motion-fade-up">{children}</div>;
}
