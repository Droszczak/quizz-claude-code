'use client';

import { useEffect, useState } from 'react';
import type { PersistedStats } from '@/types/quiz';
import { STATS_STORAGE_KEY, getStats } from '@/lib/storage';

export function HomeFooter() {
  const [stats, setStats] = useState<PersistedStats | null>(null);

  useEffect(() => {
    setStats(getStats());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STATS_STORAGE_KEY || e.key === null) {
        setStats(getStats());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!stats || (stats.sessionCount === 0 && stats.bestStreak === 0)) {
    return null;
  }

  return (
    <p className="text-xs text-text-muted text-center font-mono mt-8">
      Sessões jogadas: <span className="text-accent">{stats.sessionCount}</span>
      {' · '}
      Maior sequência: <span className="text-accent">{stats.bestStreak}</span>
    </p>
  );
}
