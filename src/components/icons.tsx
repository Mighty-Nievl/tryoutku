interface IconProps {
  size?: number;
  className?: string;
}

/**
 * Ikon garis, bukan emoji. Semua dekoratif kecuali disebut lain oleh induknya,
 * jadi selalu aria-hidden dan maknanya dibawa oleh teks atau aria-label di sekitarnya.
 */
function svgProps(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
    className,
  };
}

export function IconClock({ size = 16, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v4.7l3.1 1.9" />
    </svg>
  );
}

export function IconCheck({ size = 16, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path d="M5 12.5l4.2 4.2L19 7" />
    </svg>
  );
}

export function IconSquareEmpty({ size = 16, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <rect x="4.5" y="4.5" width="15" height="15" rx="2.5" />
    </svg>
  );
}

export function IconExit({ size = 16, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path d="M14 5.5H7.5A2 2 0 0 0 5.5 7.5v9a2 2 0 0 0 2 2H14" />
      <path d="M17 12H9.5" />
      <path d="M14.5 9l3 3-3 3" />
    </svg>
  );
}

export function IconPencil({ size = 16, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path d="M15.5 5.5l3 3L9 18l-4 1 1-4z" />
      <path d="M13.5 7.5l3 3" />
    </svg>
  );
}

export function IconList({ size = 16, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path d="M9 7h10M9 12h10M9 17h10" />
      <path d="M4.5 7h.01M4.5 12h.01M4.5 17h.01" />
    </svg>
  );
}

export function IconArrowLeft({ size = 16, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path d="M14.5 6.5L9 12l5.5 5.5" />
    </svg>
  );
}

export function IconArrowRight({ size = 16, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path d="M9.5 6.5L15 12l-5.5 5.5" />
    </svg>
  );
}
