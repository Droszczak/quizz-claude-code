'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FeedbackPanel } from '@/components/FeedbackPanel';
import { ProgressBar } from '@/components/ProgressBar';
import { QuestionCard } from '@/components/QuestionCard';
import { ResultScreen } from '@/components/ResultScreen';
import { ReviewMode } from '@/components/ReviewMode';
import { ShareCard } from '@/components/ShareCard';
import { StreakBadge } from '@/components/StreakBadge';
import { useQuiz } from '@/hooks/useQuiz';
import { pickRandomQuestions } from '@/lib/questions';
import { LEVEL_LABEL } from '@/lib/labels';
import { computeCorrectCount } from '@/lib/score';
import { shareResult } from '@/lib/share';
import {
  incrementSessionCount,
  updateBestScore,
  updateBestStreak,
} from '@/lib/storage';
import type { Level } from '@/types/quiz';

interface Props {
  level: Level;
}

type View = 'quiz' | 'result' | 'review';

const SESSION_SIZE = 10;

export function QuizSession({ level }: Props) {
  const { state, currentQuestion, isAnsweredCurrent, isLastQuestion, start, answer, next, finish } =
    useQuiz();
  const [view, setView] = useState<View>('quiz');
  const [statsPersisted, setStatsPersisted] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const handleShare = useCallback(async () => {
    if (!shareCardRef.current || sharing) return;
    setSharing(true);
    setShareError(null);
    try {
      const result = await shareResult(shareCardRef.current);
      if (!result.ok && result.method !== 'share') {
        setShareError('Não foi possível gerar a imagem. Tente novamente.');
      }
    } finally {
      setSharing(false);
    }
  }, [sharing]);

  // Bootstrap the session on mount
  useEffect(() => {
    const questions = pickRandomQuestions(level, SESSION_SIZE);
    start(level, questions);
    setView('quiz');
    setStatsPersisted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const restart = useCallback(() => {
    const questions = pickRandomQuestions(level, SESSION_SIZE);
    start(level, questions);
    setView('quiz');
    setStatsPersisted(false);
  }, [level, start]);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      finish();
      setView('result');
    } else {
      next();
    }
  }, [isLastQuestion, finish, next]);

  // Persist stats once when finished
  useEffect(() => {
    if (state.finishedAt && !statsPersisted) {
      updateBestScore(state.level, state.score);
      updateBestStreak(state.maxStreak);
      incrementSessionCount();
      setStatsPersisted(true);
    }
  }, [state.finishedAt, state.level, state.score, state.maxStreak, statsPersisted]);

  // Keyboard shortcuts
  useEffect(() => {
    if (view !== 'quiz') return;
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

      const key = e.key.toLowerCase();
      if (!isAnsweredCurrent) {
        if (key === 'v' || e.key === 'ArrowLeft') {
          e.preventDefault();
          answer(true);
        } else if (key === 'f' || e.key === 'ArrowRight') {
          e.preventDefault();
          answer(false);
        }
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNext();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [view, isAnsweredCurrent, answer, handleNext]);

  const currentAnswered = useMemo(
    () =>
      state.answered.length > state.currentIndex ? state.answered[state.currentIndex] : null,
    [state.answered, state.currentIndex],
  );

  if (view === 'result') {
    return (
      <main className="min-h-screen px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <ResultScreen
            level={state.level}
            answered={state.answered}
            score={state.score}
            maxStreak={state.maxStreak}
            onPlayAgain={restart}
            onReview={() => setView('review')}
            onShare={handleShare}
            sharing={sharing}
            shareError={shareError}
          />
          <ShareCard
            ref={shareCardRef}
            level={state.level}
            correct={computeCorrectCount(state.answered)}
            total={state.answered.length}
            maxStreak={state.maxStreak}
          />
        </div>
      </main>
    );
  }

  if (view === 'review') {
    return (
      <main className="min-h-screen px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <ReviewMode answered={state.answered} onBack={() => setView('result')} />
        </div>
      </main>
    );
  }

  if (!currentQuestion) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted">Carregando…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent transition-colors"
          >
            <ArrowLeft size={14} /> Início
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
              {LEVEL_LABEL[state.level]}
            </span>
            <StreakBadge streak={state.streak} />
          </div>
        </header>

        <div className="mb-6">
          <ProgressBar
            current={isLastQuestion && isAnsweredCurrent ? state.questions.length - 1 : state.currentIndex + (isAnsweredCurrent ? 1 : 0)}
            total={state.questions.length}
          />
        </div>

        <QuestionCard
          question={currentQuestion}
          index={state.currentIndex}
          total={state.questions.length}
          onAnswer={answer}
          disabled={isAnsweredCurrent}
          selectedAnswer={currentAnswered?.userAnswer ?? null}
        />

        {isAnsweredCurrent && currentAnswered && (
          <FeedbackPanel
            question={currentQuestion}
            correct={currentAnswered.correct}
            isLast={isLastQuestion}
            onNext={handleNext}
          />
        )}
      </div>
    </main>
  );
}
