import type { Level, PersistedStats } from '@/types/quiz';

const STORAGE_KEY = 'quizz-claude-code:stats:v1';

const DEFAULT_STATS: PersistedStats = {
  bestScore: { iniciante: 0, intermediario: 0, avancado: 0 },
  bestStreak: 0,
  sessionCount: 0,
  lastPlayedAt: null,
};

const memoryStore = new Map<string, string>();

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function safeGetItem(key: string): string | null {
  if (isBrowser()) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryStore.get(key) ?? null;
    }
  }
  return memoryStore.get(key) ?? null;
}

function safeSetItem(key: string, value: string): void {
  if (isBrowser()) {
    try {
      window.localStorage.setItem(key, value);
      return;
    } catch {
      memoryStore.set(key, value);
      return;
    }
  }
  memoryStore.set(key, value);
}

function isValidStats(value: unknown): value is PersistedStats {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<PersistedStats>;
  if (typeof v.bestStreak !== 'number') return false;
  if (typeof v.sessionCount !== 'number') return false;
  if (v.lastPlayedAt !== null && typeof v.lastPlayedAt !== 'number') return false;
  if (!v.bestScore || typeof v.bestScore !== 'object') return false;
  return (
    typeof v.bestScore.iniciante === 'number' &&
    typeof v.bestScore.intermediario === 'number' &&
    typeof v.bestScore.avancado === 'number'
  );
}

export function getStats(): PersistedStats {
  const raw = safeGetItem(STORAGE_KEY);
  if (!raw) return { ...DEFAULT_STATS, bestScore: { ...DEFAULT_STATS.bestScore } };
  try {
    const parsed = JSON.parse(raw);
    if (isValidStats(parsed)) return parsed;
  } catch {
    /* corrupted entry — fall through to default */
  }
  return { ...DEFAULT_STATS, bestScore: { ...DEFAULT_STATS.bestScore } };
}

function writeStats(stats: PersistedStats): void {
  safeSetItem(STORAGE_KEY, JSON.stringify(stats));
}

export function updateBestScore(level: Level, score: number): PersistedStats {
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
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    } catch {
      memoryStore.delete(STORAGE_KEY);
      return;
    }
  }
  memoryStore.delete(STORAGE_KEY);
}
