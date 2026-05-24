import type { AnsweredQuestion } from '@/types/quiz';

export const POINTS_PER_CORRECT = 10;

export function computeScore(answered: AnsweredQuestion[]): number {
  return answered.reduce((acc, a) => acc + (a.correct ? POINTS_PER_CORRECT : 0), 0);
}

export function computeCorrectCount(answered: AnsweredQuestion[]): number {
  return answered.filter((a) => a.correct).length;
}

export function computeMaxStreak(answered: AnsweredQuestion[]): number {
  let max = 0;
  let current = 0;
  for (const a of answered) {
    if (a.correct) {
      current += 1;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }
  return max;
}
