'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LEVELS, type Level, type PersistedStats } from '@/types/quiz';
import { LEVEL_DESCRIPTION, LEVEL_LABEL } from '@/lib/labels';
import { getStats } from '@/lib/storage';

export function LevelPicker() {
  const [stats, setStats] = useState<PersistedStats | null>(null);

  useEffect(() => {
    setStats(getStats());
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {LEVELS.map((level: Level) => {
        const best = stats?.bestScore[level] ?? 0;
        return (
          <Link
            key={level}
            href={`/quiz/${level}`}
            className="group block bg-bg-elevated border border-border rounded-2xl p-5 hover:border-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-text">{LEVEL_LABEL[level]}</h2>
              <ArrowRight
                size={18}
                className="text-text-muted group-hover:text-accent transition-colors"
              />
            </div>
            <p className="text-sm text-text-muted mb-4 leading-relaxed">
              {LEVEL_DESCRIPTION[level]}
            </p>
            <p className="text-xs font-mono text-text-muted">
              Recorde: <span className="text-accent">{best} pts</span>
            </p>
          </Link>
        );
      })}
    </div>
  );
}
