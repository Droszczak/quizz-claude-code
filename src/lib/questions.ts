import questionsData from '@/data/questions.json';
import type { Level, Question } from '@/types/quiz';

export function loadAllQuestions(): Question[] {
  return questionsData as Question[];
}

export function getQuestionsByLevel(level: Level): Question[] {
  return loadAllQuestions().filter((q) => q.level === level);
}

export function pickRandomQuestions(
  level: Level,
  n = 10,
  rng: () => number = Math.random,
): Question[] {
  const pool = getQuestionsByLevel(level);
  const shuffled = [...pool];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(n, shuffled.length));
}
