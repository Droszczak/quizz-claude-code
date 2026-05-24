interface Props {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: Props) {
  const pct = total === 0 ? 0 : Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-text-muted mb-1 font-mono">
        <span>
          {current} / {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div
        className="h-1.5 w-full rounded-full bg-bg-elevated overflow-hidden"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Progresso do quiz"
      >
        <div
          className="h-full bg-accent transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
