import { LEVELS, type Level, type PersistedStats } from '@/types/quiz';

const STORAGE_KEY = 'quizz-claude-code:stats:v1';

function makeDefaultStats(): PersistedStats {
  const bestScore = {} as Record<Level, number>;
  for (const level of LEVELS) bestScore[level] = 0;
  return {
    bestScore,
    bestStreak: 0,
    sessionCount: 0,
    lastPlayedAt: null,
  };
}

const memoryStore = new Map<string, string>();

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function safeGetItem(key: string): string | null {
  if (isBrowser()) {
    try {
      const v = window.localStorage.getItem(key);
      if (v !== null) return v;
    } catch {
      /* fall through to memoryStore */
    }
  }
  return memoryStore.get(key) ?? null;
}

function safeSetItem(key: string, value: string): void {
  // Write-through: keep memoryStore consistent so that a later read that
  // falls back to memoryStore still finds the latest value if localStorage
  // becomes intermittently unavailable.
  memoryStore.set(key, value);
  if (isBrowser()) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* memoryStore already has the value */
    }
  }
}

function safeRemoveItem(key: string): void {
  // Clear both layers so a fallback read does not surface stale data.
  memoryStore.delete(key);
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* nothing more to do */
    }
  }
}

function isValidStats(value: unknown): value is PersistedStats {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<PersistedStats>;
  if (typeof v.bestStreak !== 'number') return false;
  if (typeof v.sessionCount !== 'number') return false;
  if (v.lastPlayedAt !== null && typeof v.lastPlayedAt !== 'number') return false;
  if (!v.bestScore || typeof v.bestScore !== 'object') return false;
  for (const level of LEVELS) {
    if (typeof (v.bestScore as Record<string, unknown>)[level] !== 'number') return false;
  }
  return true;
}

function cloneStats(stats: PersistedStats): PersistedStats {
  return {
    bestScore: { ...stats.bestScore },
    bestStreak: stats.bestStreak,
    sessionCount: stats.sessionCount,
    lastPlayedAt: stats.lastPlayedAt,
  };
}

export function getStats(): PersistedStats {
  const raw = safeGetItem(STORAGE_KEY);
  if (!raw) return makeDefaultStats();
  try {
    const parsed = JSON.parse(raw);
    if (isValidStats(parsed)) return cloneStats(parsed);
  } catch {
    /* corrupted entry — fall through to default */
  }
  return makeDefaultStats();
}

function writeStats(stats: PersistedStats): void {
  safeSetItem(STORAGE_KEY, JSON.stringify(stats));
}

export function updateBestScore(level: Level, score: number): PersistedStats {
  // Note: read-modify-write is racy across tabs. We re-read every time so
  // that within a single tab repeated updates compose correctly; a cross-tab
  // concurrent write may still clobber. UI components should subscribe to
  // the `storage` event to stay in sync.
  const stats = getStats();
  if (score > stats.bestScore[level]) {
    stats.bestScore[level] = score;
    writeStats(stats);
  }
  return stats;
}

export function updateBestStreak(streak: number): PersistedStats {
  const stats = getStats();
  if (streak > stats.bestStreak) {
    stats.bestStreak = streak;
    writeStats(stats);
  }
  return stats;
}

export function incrementSessionCount(now: number = Date.now()): PersistedStats {
  const stats = getStats();
  stats.sessionCount += 1;
  stats.lastPlayedAt = now;
  writeStats(stats);
  return stats;
}

export function resetStats(): void {
  safeRemoveItem(STORAGE_KEY);
}

export const STATS_STORAGE_KEY = STORAGE_KEY;
