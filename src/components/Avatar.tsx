interface Props {
  id: string;
  name?: string;
  size?: number;
  className?: string;
}

const TONE: Record<string, string> = {
  accent: "rgb(var(--accent))",
  danger: "rgb(var(--danger))",
  ok: "rgb(var(--ok))",
  muted: "rgb(var(--muted))",
};

const SHAPE: Record<string, { tone: string; path: string }> = {
  a1: { tone: "accent", path: "M60 8a52 52 0 1 0 0 104 52 52 0 0 0 0-104z" },
  a2: { tone: "accent", path: "M20 20h80v80H20z" },
  a3: { tone: "danger", path: "M60 12 L112 104 H8 Z" },
  a4: { tone: "danger", path: "M60 6l16 34 38 5-27 27 6 38-33-18-33 18 6-38-27-27 38-5z" },
  a5: { tone: "ok", path: "M60 6c26 18 34 44 24 66-8 18-30 30-44 42C30 100 20 74 28 52 36 30 44 18 60 6z" },
  a6: { tone: "ok", path: "M60 18c10 12 26 14 26 28s-16 16-26 28c-10-12-26-14-26-28s16-16 26-28zM60 74c12 6 18 16 14 26-8 6-20 6-28 0-4-10 2-20 14-26z" },
  a7: { tone: "accent", path: "M66 6L22 68h28l-6 46 46-66H60z" },
  a8: { tone: "muted", path: "M60 8a52 52 0 1 0 0 104 52 52 0 0 0 0-104z" },
};

export default function Avatar({ id, name, size = 40, className }: Props) {
  const shape = SHAPE[id] ?? SHAPE.a1;
  const fill = TONE[shape.tone] ?? TONE.accent;
  const initial = (name?.trim()?.[0] ?? "T").toUpperCase();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label={id === "a8" ? `Avatar inisial ${initial}` : `Avatar ${id.toUpperCase()}`}
    >
      <path d={shape.path} fill={fill} />
      <text
        x="60"
        y="76"
        textAnchor="middle"
        fontSize="46"
        fontWeight="600"
        fill="rgb(var(--paper))"
        fontFamily="var(--font-serif), Georgia, serif"
      >
        {initial}
      </text>
    </svg>
  );
}
