import CountUp from "./CountUp";

interface Props {
  percent: number;
  size?: number;
  label?: string;
}

/** Cincin skor: angka persen jadi bentuk, bukan hanya teks besar. */
export default function ScoreRing({ percent, size = 112, label = "skor" }: Props) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const keliling = 2 * Math.PI * radius;
  const tone =
    percent >= 75 ? "rgb(var(--ok))" : percent >= 50 ? "rgb(var(--accent))" : "rgb(var(--danger))";

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true" focusable="false">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgb(var(--line))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={keliling}
          strokeDashoffset={keliling * (1 - Math.min(100, Math.max(0, percent)) / 100)}
          className="motion-bar"
        />
      </svg>
      <div className="absolute text-center">
        <div className="num font-serif text-3xl font-semibold leading-none" style={{ color: tone }}>
          <CountUp value={percent} suffix="%" duration={900} />
        </div>
        <p className="label mt-1.5">{label}</p>
      </div>
    </div>
  );
}
