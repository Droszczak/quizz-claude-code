import { Flame } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  streak: number;
  className?: string;
}

export function StreakBadge({ streak, className }: Props) {
  if (streak <= 0) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-mono bg-bg-elevated border border-border text-accent',
        className,
      )}
      aria-label={`Sequência atual de ${streak} acertos`}
    >
      <Flame size={14} className="text-accent" />
      {streak}
    </span>
  );
}
