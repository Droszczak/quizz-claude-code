'use client';

import { Check, ExternalLink, X } from 'lucide-react';
import type { Question } from '@/types/quiz';
import { cn } from '@/lib/cn';

interface Props {
  question: Question;
  correct: boolean;
  isLast: boolean;
  onNext: () => void;
}

export function FeedbackPanel({ question, correct, isLast, onNext }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'mt-4 rounded-2xl border p-5 md:p-6 bg-bg-elevated',
        correct ? 'border-success/40' : 'border-error/40',
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        {correct ? (
          <>
            <Check className="text-success" size={20} />
            <span className="font-semibold text-success">Correto!</span>
          </>
        ) : (
          <>
            <X className="text-error" size={20} />
            <span className="font-semibold text-error">Resposta incorreta</span>
          </>
        )}
        <span className="text-text-muted text-sm ml-1">
          (resposta certa: {question.answer ? 'Verdadeiro' : 'Falso'})
        </span>
      </div>
      <p className="text-text leading-relaxed mb-4">{question.explanation}</p>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <a
          href={question.docUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover underline-offset-4 hover:underline"
        >
          {question.docTitle}
          <ExternalLink size={14} />
        </a>
        <button
          type="button"
          onClick={onNext}
          className="self-end sm:self-auto inline-flex items-center gap-1 bg-accent hover:bg-accent-hover text-bg font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {isLast ? 'Ver resultado' : 'Próxima'}
        </button>
      </div>
    </div>
  );
}
