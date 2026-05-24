'use client';

import { ArrowLeft, RotateCcw, Share2 } from 'lucide-react';
import Link from 'next/link';
import type { AnsweredQuestion, Level } from '@/types/quiz';
import { LEVEL_LABEL } from '@/lib/labels';
import { computeCorrectCount } from '@/lib/score';

interface Props {
  level: Level;
  answered: AnsweredQuestion[];
  score: number;
  maxStreak: number;
  onPlayAgain: () => void;
  onReview: () => void;
  onShare: () => void;
  sharing?: boolean;
}

export function ResultScreen({
  level,
  answered,
  score,
  maxStreak,
  onPlayAgain,
  onReview,
  onShare,
  sharing = false,
}: Props) {
  const correct = computeCorrectCount(answered);
  const total = answered.length;
  const errors = total - correct;
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);

  return (
    <section className="bg-bg-elevated border border-border rounded-2xl p-6 md:p-10 text-center">
      <p className="text-text-muted text-xs uppercase tracking-wider mb-2 font-mono">
        Nível {LEVEL_LABEL[level]}
      </p>
      <h2 className="text-3xl md:text-5xl font-bold text-text mb-2">
        {correct} / {total}
      </h2>
      <p className="text-accent text-lg font-mono mb-6">{score} pts</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-8">
        <Stat label="Acertos" value={correct} accent="success" />
        <Stat label="Erros" value={errors} accent={errors > 0 ? 'error' : 'muted'} />
        <Stat label="Maior sequência" value={maxStreak} accent="accent" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={onPlayAgain}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-bg font-medium transition-colors"
        >
          <RotateCcw size={16} />
          Jogar novamente
        </button>
        {errors > 0 && (
          <button
            type="button"
            onClick={onReview}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-border hover:border-accent text-text transition-colors"
          >
            Revisar erros ({errors})
          </button>
        )}
        <button
          type="button"
          onClick={onShare}
          disabled={sharing}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-border hover:border-accent text-text transition-colors disabled:opacity-50"
        >
          <Share2 size={16} />
          {sharing ? 'Gerando…' : 'Compartilhar'}
        </button>
      </div>

      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent transition-colors"
        >
          <ArrowLeft size={14} /> Voltar para o início
        </Link>
      </div>

      <p className="sr-only" aria-live="polite">
        Quiz finalizado. {correct} de {total} respostas corretas ({pct}%).
      </p>
    </section>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: 'success' | 'error' | 'accent' | 'muted';
}) {
  const colorClass =
    accent === 'success'
      ? 'text-success'
      : accent === 'error'
        ? 'text-error'
        : accent === 'accent'
          ? 'text-accent'
          : 'text-text-muted';
  return (
    <div className="bg-bg border border-border rounded-lg p-3">
      <p className="text-text-muted text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );
}
