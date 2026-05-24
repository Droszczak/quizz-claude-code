'use client';

import { useReducer } from 'react';
import type { AnsweredQuestion, Level, Question, SessionState } from '@/types/quiz';

type Action =
  | { type: 'START'; level: Level; questions: Question[]; now: number }
  | { type: 'ANSWER'; userAnswer: boolean; now: number }
  | { type: 'NEXT' }
  | { type: 'FINISH'; now: number }
  | { type: 'RESET' };

const EMPTY_STATE: SessionState = {
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

export function quizReducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'START':
      return {
        level: action.level,
        questions: action.questions,
        currentIndex: 0,
        answered: [],
        score: 0,
        streak: 0,
        maxStreak: 0,
        startedAt: action.now,
        finishedAt: null,
      };

    case 'ANSWER': {
      const q = state.questions[state.currentIndex];
      if (!q) return state;
      if (state.answered.length > state.currentIndex) return state; // already answered
      const correct = action.userAnswer === q.answer;
      const ans: AnsweredQuestion = {
        ...q,
        userAnswer: action.userAnswer,
        correct,
        answeredAt: action.now,
      };
      const nextStreak = correct ? state.streak + 1 : 0;
      return {
        ...state,
        answered: [...state.answered, ans],
        score: state.score + (correct ? 10 : 0),
        streak: nextStreak,
        maxStreak: Math.max(state.maxStreak, nextStreak),
      };
    }

    case 'NEXT': {
      if (state.currentIndex >= state.questions.length - 1) return state;
      return { ...state, currentIndex: state.currentIndex + 1 };
    }

    case 'FINISH':
      if (state.finishedAt !== null) return state;
      return { ...state, finishedAt: action.now };

    case 'RESET':
      return EMPTY_STATE;

    default:
      return state;
  }
}

export function useQuiz() {
  const [state, dispatch] = useReducer(quizReducer, EMPTY_STATE);

  const start = (level: Level, questions: Question[]) =>
    dispatch({ type: 'START', level, questions, now: Date.now() });

  const answer = (userAnswer: boolean) =>
    dispatch({ type: 'ANSWER', userAnswer, now: Date.now() });

  const next = () => dispatch({ type: 'NEXT' });

  const finish = () => dispatch({ type: 'FINISH', now: Date.now() });

  const reset = () => dispatch({ type: 'RESET' });

  const currentQuestion = state.questions[state.currentIndex];
  const isAnsweredCurrent = state.answered.length > state.currentIndex;
  const isLastQuestion = state.currentIndex === state.questions.length - 1;

  return {
    state,
    currentQuestion,
    isAnsweredCurrent,
    isLastQuestion,
    start,
    answer,
    next,
    finish,
    reset,
  };
}
