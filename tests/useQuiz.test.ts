import { describe, expect, it } from 'vitest';
import { quizReducer } from '@/hooks/useQuiz';
import type { Question, SessionState } from '@/types/quiz';

const EMPTY: SessionState = {
  level: 'iniciante',
  questions: [],
  currentIndex: 0,
  answered: [],
  score: 0,
  streak: 0,
  maxStreak: 0,
  startedAt: 0,
  finishedAt: null,
};

function makeQuestion(i: number, answer: boolean): Question {
  return {
    id: `q-${i}`,
    level: 'iniciante',
    category: 'fundamentos',
    statement: 'placeholder',
    answer,
    explanation: 'x',
    docUrl: 'https://docs.claude.com/x',
    docTitle: 'x',
  };
}

describe('quizReducer', () => {
  it('START initializes session with questions', () => {
    const qs = [makeQuestion(1, true), makeQuestion(2, false)];
    const next = quizReducer(EMPTY, {
      type: 'START',
      level: 'intermediario',
      questions: qs,
      now: 100,
    });
    expect(next.level).toBe('intermediario');
    expect(next.questions).toEqual(qs);
    expect(next.currentIndex).toBe(0);
    expect(next.startedAt).toBe(100);
    expect(next.finishedAt).toBeNull();
  });

  it('ANSWER records correctness and updates score/streak', () => {
    const started = quizReducer(EMPTY, {
      type: 'START',
      level: 'iniciante',
      questions: [makeQuestion(1, true), makeQuestion(2, false)],
      now: 0,
    });
    const after = quizReducer(started, { type: 'ANSWER', userAnswer: true, now: 1 });
    expect(after.answered).toHaveLength(1);
    expect(after.answered[0].correct).toBe(true);
    expect(after.score).toBe(10);
    expect(after.streak).toBe(1);
    expect(after.maxStreak).toBe(1);
  });

  it('ANSWER resets streak on wrong answer but keeps maxStreak', () => {
    let s = quizReducer(EMPTY, {
      type: 'START',
      level: 'iniciante',
      questions: [makeQuestion(1, true), makeQuestion(2, true), makeQuestion(3, true)],
      now: 0,
    });
    s = quizReducer(s, { type: 'ANSWER', userAnswer: true, now: 1 });
    s = quizReducer(s, { type: 'NEXT' });
    s = quizReducer(s, { type: 'ANSWER', userAnswer: true, now: 2 });
    s = quizReducer(s, { type: 'NEXT' });
    s = quizReducer(s, { type: 'ANSWER', userAnswer: false, now: 3 });
    expect(s.streak).toBe(0);
    expect(s.maxStreak).toBe(2);
    expect(s.score).toBe(20);
  });

  it('ANSWER twice on the same question is a no-op', () => {
    const started = quizReducer(EMPTY, {
      type: 'START',
      level: 'iniciante',
      questions: [makeQuestion(1, true)],
      now: 0,
    });
    const once = quizReducer(started, { type: 'ANSWER', userAnswer: true, now: 1 });
    const twice = quizReducer(once, { type: 'ANSWER', userAnswer: false, now: 2 });
    expect(twice).toBe(once);
  });

  it('NEXT advances index but stops at the last question', () => {
    const s = quizReducer(EMPTY, {
      type: 'START',
      level: 'iniciante',
      questions: [makeQuestion(1, true), makeQuestion(2, true)],
      now: 0,
    });
    const s1 = quizReducer(s, { type: 'NEXT' });
    expect(s1.currentIndex).toBe(1);
    const s2 = quizReducer(s1, { type: 'NEXT' });
    expect(s2.currentIndex).toBe(1);
  });

  it('FINISH sets finishedAt only once', () => {
    const started = quizReducer(EMPTY, {
      type: 'START',
      level: 'iniciante',
      questions: [makeQuestion(1, true)],
      now: 0,
    });
    const finished = quizReducer(started, { type: 'FINISH', now: 999 });
    expect(finished.finishedAt).toBe(999);
    const again = quizReducer(finished, { type: 'FINISH', now: 1000 });
    expect(again.finishedAt).toBe(999);
  });

  it('RESET returns to empty state', () => {
    const started = quizReducer(EMPTY, {
      type: 'START',
      level: 'iniciante',
      questions: [makeQuestion(1, true)],
      now: 0,
    });
    const reset = quizReducer(started, { type: 'RESET' });
    expect(reset.questions).toHaveLength(0);
    expect(reset.score).toBe(0);
    expect(reset.startedAt).toBe(0);
  });
});
