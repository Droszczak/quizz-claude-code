import { forwardRef } from 'react';
import type { Level } from '@/types/quiz';
import { LEVEL_LABEL } from '@/lib/labels';

interface Props {
  level: Level;
  correct: number;
  total: number;
  maxStreak: number;
}

// Use system font stacks here: html-to-image does not download web fonts by
// default, so referencing Inter/JetBrains Mono would silently fall back at
// PNG generation time. System fonts render identically in dev and in the
// exported image.
const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
const MONO = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';

export const ShareCard = forwardRef<HTMLDivElement, Props>(function ShareCard(
  { level, correct, total, maxStreak },
  ref,
) {
  return (
    <div
      ref={ref}
      style={{
        width: 1200,
        height: 630,
        position: 'absolute',
        left: -99999,
        top: -99999,
        background: '#0f0f0f',
        color: '#ededed',
        fontFamily: SANS,
        padding: 80,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      aria-hidden="true"
    >
      <div>
        <p
          style={{
            color: '#9ca3af',
            fontFamily: MONO,
            fontSize: 24,
            letterSpacing: 4,
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          Quizz Claude Code
        </p>
        <h1 style={{ fontSize: 96, fontWeight: 700, lineHeight: 1, margin: 0 }}>
          {correct}
          <span style={{ color: '#9ca3af' }}> / {total}</span>
        </h1>
        <p style={{ color: '#d97757', fontSize: 36, marginTop: 16, fontWeight: 500 }}>
          Nível {LEVEL_LABEL[level]}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 40, alignItems: 'flex-end' }}>
        <Stat label="Acertos" value={correct} color="#4ade80" />
        <Stat label="Maior sequência" value={maxStreak} color="#d97757" />
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <p
            style={{
              color: '#9ca3af',
              fontFamily: MONO,
              fontSize: 20,
            }}
          >
            quizz-claude-code
          </p>
        </div>
      </div>
    </div>
  );
});

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <p
        style={{
          color: '#9ca3af',
          fontSize: 18,
          textTransform: 'uppercase',
          letterSpacing: 2,
          marginBottom: 8,
        }}
      >
        {label}
      </p>
      <p style={{ color, fontSize: 56, fontWeight: 700, margin: 0 }}>{value}</p>
    </div>
  );
}
