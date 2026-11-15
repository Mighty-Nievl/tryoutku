interface Props {
  mood?: "senang" | "fokus" | "sedih" | "bingung";
  size?: number;
  className?: string;
}

const MOODS = {
  senang: { mouth: "M 44 74 q 8 8 16 0", brow: "M 40 52 q 6 -3 12 0", brow2: "M 62 52 q 6 -3 12 0" },
  fokus: { mouth: "M 46 76 h 12", brow: "M 40 50 h 12", brow2: "M 62 50 h 12" },
  sedih: { mouth: "M 44 78 q 8 -8 16 0", brow: "M 40 48 q 6 4 12 2", brow2: "M 62 50 q 6 -2 12 -2" },
  bingung: { mouth: "M 44 76 q 8 4 16 -2", brow: "M 40 48 q 6 2 12 0", brow2: "M 62 54 q 6 -4 12 0" },
};

/**
 * Pinto, maskot pensil. Digambar sebagai SVG supaya ikut warna tema dan tajam
 * di semua ukuran tanpa berkas gambar.
 */
export default function Mascot({ mood = "senang", size = 96, className }: Props) {
  const face = MOODS[mood] ?? MOODS.senang;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={`Pinto si pensil, ekspresi ${mood}`}
      className={className}
    >
      {/* badan pensil */}
      <g>
        <rect x="34" y="18" width="52" height="66" rx="10" fill="rgb(var(--accent))" />
        <rect x="34" y="18" width="52" height="10" rx="5" fill="rgb(var(--danger))" opacity="0.75" />
        <path d="M34 78 h52 l-26 26 z" fill="rgb(var(--ink))" opacity="0.85" />
        <path d="M50 92 h20 l-10 12 z" fill="rgb(var(--paper))" />
        {/* muka */}
        <circle cx="49" cy="58" r="5" fill="rgb(var(--paper))" />
        <circle cx="71" cy="58" r="5" fill="rgb(var(--paper))" />
        <circle cx="50" cy="59" r="2.4" fill="rgb(var(--ink))" />
        <circle cx="72" cy="59" r="2.4" fill="rgb(var(--ink))" />
        <path
          d={face.mouth}
          stroke="rgb(var(--paper))"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />
        <path d={face.brow} stroke="rgb(var(--ink))" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
        <path d={face.brow2} stroke="rgb(var(--ink))" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
        {/* tangan */}
        <path
          d="M34 62 q -12 -4 -14 6"
          stroke="rgb(var(--accent))"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M86 62 q 12 -6 14 4"
          stroke="rgb(var(--accent))"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
