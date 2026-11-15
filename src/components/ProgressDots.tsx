interface Props {
  total: number;
  /** indeks soal yang sedang dibuka */
  current: number;
  /** status terjawab per indeks */
  answered: boolean[];
  className?: string;
}

/**
 * Progres berbentuk titik, bukan kalimat "soal 3 dari 12". Di atas 24 soal
 * titik terlalu rapat, jadi dipakai bilah proporsional.
 */
export default function ProgressDots({ total, current, answered, className = "" }: Props) {
  if (total <= 0) return null;
  const terjawab = answered.filter(Boolean).length;

  return (
    <div className={className}>
      <p className="sr-only">
        Soal {current + 1} dari {total}, {terjawab} sudah dijawab.
      </p>
      <div aria-hidden="true" className="flex items-center gap-1">
        {total <= 24 ? (
          Array.from({ length: total }).map((_, index) => (
            <span
              key={index}
              className={`h-1.5 flex-1 rounded-full ${
                index === current
                  ? "bg-accent"
                  : answered[index]
                    ? "bg-accent/45"
                    : "bg-line"
              }`}
            />
          ))
        ) : (
          <>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
              <span
                className="block h-full rounded-full bg-accent"
                style={{ width: `${((current + 1) / total) * 100}%` }}
              />
            </span>
          </>
        )}
      </div>
    </div>
  );
}
