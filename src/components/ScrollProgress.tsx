"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Garis progres tipis di puncak layar: seberapa jauh halaman sudah digulir,
 * digambar seperti sapuan pensil. Dipasang lewat portal ke body supaya tidak
 * terjebak position: fixed di dalam template yang ber-animasi transform.
 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let raf = 0;
    const update = () => {
      raf = 0;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-accent"
      style={{ transform: `scaleX(${progress})` }}
    />,
    document.body,
  );
}
