import { describe, expect, it } from 'vitest';
import {
  getQuestionsByLevel,
  loadAllQuestions,
  pickRandomQuestions,
} from '@/lib/questions';
import { CATEGORIES, LEVELS } from '@/types/quiz';

const OFFICIAL_HOSTS = [
  'https://docs.claude.com',
  'https://www.anthropic.com',
  'https://docs.anthropic.com',
  'https://modelcontextprotocol.io',
];

describe('questions schema', () => {
  const all = loadAllQuestions();

  it('has at least 15 seed questions', () => {
    expect(all.length).toBeGreaterThanOrEqual(15);
  });

  it('every question has a unique id', () => {
    const ids = all.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every question has a valid level', () => {
    for (const q of all) {
      expect(LEVELS).toContain(q.level);
    }
  });

  it('every question has a valid category', () => {
    for (const q of all) {
      expect(CATEGORIES).toContain(q.category);
    }
  });

  it('every statement is at most 220 characters', () => {
    for (const q of all) {
      expect(q.statement.length, `statement too long: ${q.id}`).toBeLessThanOrEqual(220);
    }
  });

  it('every explanation is at most 400 characters', () => {
    for (const q of all) {
      expect(q.explanation.length, `explanation too long: ${q.id}`).toBeLessThanOrEqual(400);
    }
  });

  it('every docUrl points to an official Anthropic domain', () => {
    for (const q of all) {
      const ok = OFFICIAL_HOSTS.some((host) => q.docUrl.startsWith(host));
      expect(ok, `unofficial docUrl in ${q.id}: ${q.docUrl}`).toBe(true);
    }
  });

  it('every answer is boolean', () => {
    for (const q of all) {
      expect(typeof q.answer).toBe('boolean');
    }
  });
});

describe('getQuestionsByLevel', () => {
  it('returns only questions of the requested level', () => {
    for (const level of LEVELS) {
      const subset = getQuestionsByLevel(level);
      expect(subset.length).toBeGreaterThan(0);
      for (const q of subset) {
        expect(q.level).toBe(level);
      }
    }
  });
});

describe('pickRandomQuestions', () => {
  it('returns up to N unique questions of the given level', () => {
    const picked = pickRandomQuestions('iniciante', 5);
    expect(picked.length).toBe(5);
    const ids = picked.map((q) => q.id);
    expect(new Set(ids).size).toBe(5);
    for (const q of picked) {
      expect(q.level).toBe('iniciante');
    }
  });

  it('clamps N to the pool size when N exceeds available questions', () => {
    const pool = getQuestionsByLevel('iniciante');
    const picked = pickRandomQuestions('iniciante', pool.length + 50);
    expect(picked.length).toBe(pool.length);
  });

  it('uses the supplied RNG (deterministic)', () => {
    let i = 0;
    const seq = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
    const rng = () => seq[i++ % seq.length];
    const a = pickRandomQuestions('iniciante', 3, rng);
    i = 0;
    const b = pickRandomQuestions('iniciante', 3, rng);
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
  });
});
