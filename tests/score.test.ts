import { describe, expect, it } from 'vitest';
import {
  POINTS_PER_CORRECT,
  computeCorrectCount,
  computeMaxStreak,
  computeScore,
} from '@/lib/score';
import type { AnsweredQuestion, Question } from '@/types/quiz';

function makeAnswered(correctSeq: boolean[]): AnsweredQuestion[] {
  return correctSeq.map((correct, i) => {
    const q: Question = {
      id: `test-${i}`,
      level: 'iniciante',
      category: 'fundamentos',
      statement: 'placeholder',
      answer: true,
      explanation: 'placeholder',
      docUrl: 'https://docs.claude.com/x',
      docTitle: 'placeholder',
    };
    return {
      ...q,
      userAnswer: correct,
      correct,
      answeredAt: i,
    };
  });
}

describe('computeScore', () => {
  it('returns 0 for empty array', () => {
    expect(computeScore([])).toBe(0);
  });

  it('counts points per correct answer', () => {
    const a = makeAnswered([true, true, false, true]);
    expect(computeScore(a)).toBe(3 * POINTS_PER_CORRECT);
  });

  it('returns 0 when all wrong', () => {
    expect(computeScore(makeAnswered([false, false, false]))).toBe(0);
  });
});

describe('computeCorrectCount', () => {
  it('counts correct answers', () => {
    expect(computeCorrectCount(makeAnswered([true, false, true, true]))).toBe(3);
  });
});

describe('computeMaxStreak', () => {
  it('returns 0 for empty array', () => {
    expect(computeMaxStreak([])).toBe(0);
  });

  it('resets streak on a wrong answer', () => {
    const a = makeAnswered([true, true, true, false, true, true]);
    expect(computeMaxStreak(a)).toBe(3);
  });

  it('returns full length when all correct', () => {
    expect(computeMaxStreak(makeAnswered([true, true, true, true]))).toBe(4);
  });

  it('returns 0 when all wrong', () => {
    expect(computeMaxStreak(makeAnswered([false, false, false]))).toBe(0);
  });

  it('handles trailing streak as the max', () => {
    const a = makeAnswered([true, false, true, true, true, true]);
    expect(computeMaxStreak(a)).toBe(4);
  });
});
