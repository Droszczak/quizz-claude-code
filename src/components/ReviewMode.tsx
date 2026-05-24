'use client';

import { ArrowLeft, ExternalLink, X } from 'lucide-react';
import type { AnsweredQuestion } from '@/types/quiz';

interface Props {
  answered: AnsweredQuestion[];
  onBack: () => void;
}

export function ReviewMode({ answered, onBack }: Props) {
  const wrong = answered.filter((a) => !a.correct);

  return (
    <section>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Voltar para o resultado
      </button>

      <h2 className="text-2xl md:text-3xl font-bold text-text mb-2">
        Revisão das perguntas erradas
      </h2>
      <p className="text-text-muted mb-8">
        {wrong.length} {wrong.length === 1 ? 'pergunta' : 'perguntas'} para revisar.
      </p>

      <ol className="space-y-6">
        {wrong.map((q, i) => (
          <li
            key={q.id}
            className="bg-bg-elevated border border-error/30 rounded-2xl p-5 md:p-6"
          >
            <p className="text-text-muted text-xs uppercase tracking-wider mb-2 font-mono">
              Pergunta {i + 1}
            </p>
            <p className="text-lg leading-relaxed text-text mb-3">{q.statement}</p>
            <div className="flex items-center gap-2 text-sm mb-4">
              <X className="text-error" size={16} />
              <span className="text-text-muted">
                Você respondeu{' '}
                <strong className="text-error">{q.userAnswer ? 'Verdadeiro' : 'Falso'}</strong>
                . Resposta certa:{' '}
                <strong className="text-success">{q.answer ? 'Verdadeiro' : 'Falso'}</strong>.
              </span>
            </div>
            <p className="text-text leading-relaxed mb-4">{q.explanation}</p>
            <a
              href={q.docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover underline-offset-4 hover:underline"
            >
              {q.docTitle}
              <ExternalLink size={14} />
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
