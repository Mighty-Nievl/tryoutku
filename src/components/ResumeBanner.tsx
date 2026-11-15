"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { paketIdFromDraftKey, subtestIdFromPracticeDraftKey } from "@/lib/keys";
import { PAKET_BY_ID } from "@/lib/pakets";
import { formatDuration } from "@/lib/scoring";
import { SUBTEST_BY_ID } from "@/lib/subtests";

interface ResumeItem {
  href: string;
  label: string;
  detail: string;
}

/** Menampilkan sesi yang belum selesai supaya pengunjung tidak mulai dari nol. */
export default function ResumeBanner() {
  const [item, setItem] = useState<ResumeItem | null>(null);

  useEffect(() => {
    const found: ResumeItem[] = [];
    const now = Date.now();

    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key) continue;

      const paketId = paketIdFromDraftKey(key);
      if (paketId) {
        const paket = PAKET_BY_ID[paketId];
        if (!paket) continue;
        try {
          const draft = JSON.parse(window.localStorage.getItem(key) ?? "{}") as {
            deadline?: number;
            answers?: Record<string, number>;
          };
          const remaining = Math.max(0, Math.floor(((draft.deadline ?? 0) - now) / 1000));
          if (remaining <= 0) continue;
          const answered = Object.keys(draft.answers ?? {}).length;
          found.push({
            href: `/tryout/${paketId}`,
            label: paket.name,
            detail: `sisa ${formatDuration(remaining)}, ${answered} soal terjawab`,
          });
        } catch {
          continue;
        }
      }

      const subtestId = subtestIdFromPracticeDraftKey(key);
      if (subtestId) {
        const subtest = SUBTEST_BY_ID[subtestId];
        if (!subtest) continue;
        try {
          const draft = JSON.parse(window.localStorage.getItem(key) ?? "{}") as {
            answers?: Record<string, number>;
            index?: number;
          };
          const answered = Object.keys(draft.answers ?? {}).length;
          if (answered === 0) continue;
          found.push({
            href: `/latihan/${subtestId}`,
            label: `Latihan ${subtest.name}`,
            detail: `${answered} jawaban tersimpan, lanjut di soal ${(draft.index ?? 0) + 1}`,
          });
        } catch {
          continue;
        }
      }
    }

    setItem(found[0] ?? null);
  }, []);

  if (!item) return null;

  return (
    <div className="card flex flex-wrap items-center justify-between gap-3 border-accent/40 px-3.5 py-2.5">
      <div>
        <p className="text-xs text-muted">Lanjutkan yang belum selesai</p>
        <p className="text-sm font-semibold">{item.label}</p>
        <p className="num text-xs text-muted">{item.detail}</p>
      </div>
      <Link href={item.href} className="btn-primary">
        Lanjutkan
      </Link>
    </div>
  );
}
