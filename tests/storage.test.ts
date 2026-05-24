import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getStats,
  incrementSessionCount,
  resetStats,
  updateBestScore,
  updateBestStreak,
} from '@/lib/storage';

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('getStats', () => {
  it('returns defaults when storage is empty', () => {
    const stats = getStats();
    expect(stats.bestScore.iniciante).toBe(0);
    expect(stats.bestScore.intermediario).toBe(0);
    expect(stats.bestScore.avancado).toBe(0);
    expect(stats.bestStreak).toBe(0);
    expect(stats.sessionCount).toBe(0);
    expect(stats.lastPlayedAt).toBeNull();
  });

  it('returns defaults when stored value is corrupted', () => {
    window.localStorage.setItem('quizz-claude-code:stats:v1', '{not-json');
    const stats = getStats();
    expect(stats.bestStreak).toBe(0);
  });

  it('returns defaults when stored value has wrong shape', () => {
    window.localStorage.setItem('quizz-claude-code:stats:v1', '{"foo":"bar"}');
    const stats = getStats();
    expect(stats.sessionCount).toBe(0);
  });
});

describe('updateBestScore', () => {
  it('persists a higher score for the level', () => {
    updateBestScore('iniciante', 80);
    expect(getStats().bestScore.iniciante).toBe(80);
  });

  it('does not overwrite a higher previous score', () => {
    updateBestScore('iniciante', 90);
    updateBestScore('iniciante', 50);
    expect(getStats().bestScore.iniciante).toBe(90);
  });

  it('is scoped per level', () => {
    updateBestScore('iniciante', 100);
    updateBestScore('avancado', 60);
    const stats = getStats();
    expect(stats.bestScore.iniciante).toBe(100);
    expect(stats.bestScore.avancado).toBe(60);
    expect(stats.bestScore.intermediario).toBe(0);
  });
});

describe('updateBestStreak', () => {
  it('updates only on higher value', () => {
    updateBestStreak(5);
    updateBestStreak(3);
    expect(getStats().bestStreak).toBe(5);
  });
});

describe('incrementSessionCount', () => {
  it('increments session count and updates lastPlayedAt', () => {
    incrementSessionCount(1000);
    incrementSessionCount(2000);
    const stats = getStats();
    expect(stats.sessionCount).toBe(2);
    expect(stats.lastPlayedAt).toBe(2000);
  });
});

describe('resetStats', () => {
  it('removes persisted entry', () => {
    updateBestScore('avancado', 100);
    resetStats();
    expect(getStats().bestScore.avancado).toBe(0);
  });
});

describe('fallback when localStorage throws', () => {
  it('writes to in-memory store when setItem throws', () => {
    const setSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    const getSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => updateBestScore('iniciante', 50)).not.toThrow();
    // Even with throwing storage, code should not crash
    expect(() => getStats()).not.toThrow();
    setSpy.mockRestore();
    getSpy.mockRestore();
  });
});
