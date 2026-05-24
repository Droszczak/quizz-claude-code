'use client';

import type { Question } from '@/types/quiz';
import { cn } from '@/lib/cn';

interface Props {
  question: Question;
  index: number;
  total: number;
  onAnswer: (userAnswer: boolean) => void;
  disabled?: boolean;
  selectedAnswer?: boolean | null;
}

export function QuestionCard({
  question,
  index,
  total,
  onAnswer,
  disabled = false,
  selectedAnswer = null,
}: Props) {
  const handleAnswer = (value: boolean) => {
    if (disabled) return;
    onAnswer(value);
  };

  return (
    <article
      className="bg-bg-elevated border border-border rounded-2xl p-6 md:p-8"
      aria-labelledby={`q-${question.id}`}
    >
      <p className="text-text-muted text-xs uppercase tracking-wider mb-3 font-mono">
        Pergunta {index + 1} de {total}
      </p>
      <h2
        id={`q-${question.id}`}
        className="text-lg md:text-2xl leading-relaxed mb-8 text-text"
      >
        {question.statement}
      </h2>
      <div
        role="radiogroup"
        aria-label="Verdadeiro ou Falso"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        <button
          type="button"
          onClick={() => handleAnswer(true)}
          disabled={disabled}
          aria-pressed={selectedAnswer === true}
          className={cn(
            'min-h-12 px-4 py-3 rounded-xl border-2 transition-colors text-base font-medium',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated',
            disabled
              ? selectedAnswer === true
                ? question.answer
                  ? 'border-success bg-success/10 text-success'
                  : 'border-error bg-error/10 text-error'
                : 'border-border text-text-muted opacity-50'
              : 'border-border text-text hover:border-accent hover:bg-accent/5',
          )}
        >
          Verdadeiro{' '}
          <kbd className="ml-1 text-xs opacity-60 font-mono">(V)</kbd>
        </button>
        <button
          type="button"
          onClick={() => handleAnswer(false)}
          disabled={disabled}
          aria-pressed={selectedAnswer === false}
          className={cn(
            'min-h-12 px-4 py-3 rounded-xl border-2 transition-colors text-base font-medium',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated',
            disabled
              ? selectedAnswer === false
                ? question.answer === false
                  ? 'border-success bg-success/10 text-success'
                  : 'border-error bg-error/10 text-error'
                : 'border-border text-text-muted opacity-50'
              : 'border-border text-text hover:border-accent hover:bg-accent/5',
          )}
        >
          Falso <kbd className="ml-1 text-xs opacity-60 font-mono">(F)</kbd>
        </button>
      </div>
    </article>
  );
}
