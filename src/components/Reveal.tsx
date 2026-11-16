"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

/**
 * Visibilitas dari Reveal terdekat: true = konten sudah boleh bergerak,
 * false = masih menunggu guliran, null = tidak ada Reveal di atasnya sehingga
 * animasi berjalan seperti biasa saat mount (halaman hasil, dsb).
 */
export const RevealContext = createContext<boolean | null>(null);

/** true bila elemen sudah boleh beranimasi; tanpa Reveal di atas, selalu true. */
export function useRevealVisible(): boolean {
  const ctx = useContext(RevealContext);
  return ctx === null ? true : ctx;
}

/**
 * Kemunculan lembut saat section masuk layar. Elemen yang sudah terlihat saat
 * mount dibiarkan tampil apa adanya — tanpa jeda, tanpa kedip — dan hanya
 * konten di bawah lipatan yang dianimasikan saat digulir ke bawah. Kalau JS
 * gagal, isi halaman tetap terlihat (kelas animasi baru dipasang dari efek).
 *
 * Selain itu komponen ini menyalurkan status visibilitas lewat RevealContext
 * supaya animasi berbasis JS (CountUp) ikut menunggu, bukan jalan saat load
 * tanpa terlihat.
 */
export default function Reveal({ children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    setReady(true);
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
            window.removeEventListener("scroll", onScroll);
            return;
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );

    // Jaring pengaman: lompatan instan (tombol End, anchor) bisa melewati
    // sinyal IntersectionObserver — cek posisi manual setiap scroll.
    let raf = 0;
    const check = () => {
      raf = 0;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.94) {
        setShown(true);
        io.disconnect();
        window.removeEventListener("scroll", onScroll);
      }
    };
    function onScroll() {
      if (!raf) raf = requestAnimationFrame(check);
    }

    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Sebelum efek pertama: false supaya CountUp diam (nilai statis, sama dengan
  // HTML server). Sesudahnya: konten di bawah lipatan baru beranimasi saat is-in.
  const visible = ready && (!armed || shown);

  return (
    <RevealContext.Provider value={visible}>
      <div ref={ref} className={armed ? `reveal${shown ? " is-in" : ""}` : undefined}>
        {children}
      </div>
    </RevealContext.Provider>
  );
}
