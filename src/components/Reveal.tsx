"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

/**
 * Kemunculan lembut saat section masuk layar. Elemen yang sudah terlihat saat
 * mount dibiarkan tampil apa adanya — tanpa jeda, tanpa kedip — dan hanya
 * konten di bawah lipatan yang dianimasikan saat digulir ke bawah. Kalau JS
 * gagal, isi halaman tetap terlihat (kelas animasi baru dipasang dari efek).
 */
export default function Reveal({ children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Konten yang sudah di dalam layar saat mount: tampil langsung, tanpa animasi.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    setArmed(true);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={armed ? `reveal${shown ? " is-in" : ""}` : undefined}>
      {children}
    </div>
  );
}
