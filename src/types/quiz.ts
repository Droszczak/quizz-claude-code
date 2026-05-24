export type Level = 'iniciante' | 'intermediario' | 'avancado';

export type Category =
  | 'fundamentos'
  | 'uso_basico'
  | 'slash_basico'
  | 'interface'
  | 'configuracao'
  | 'skills'
  | 'slash_custom'
  | 'subagents'
  | 'hooks'
  | 'mcp'
  | 'sdk'
  | 'api_caching';

export interface Question {
  id: string;
  level: Level;
  category: Category;
  statement: string;
  answer: boolean;
  explanation: string;
  docUrl: string;
  docTitle: string;
}

export interface AnsweredQuestion extends Question {
  userAnswer: boolean;
  correct: boolean;
  answeredAt: number;
}

export interface SessionState {
  level: Level;
  questions: Question[];
  currentIndex: number;
  answered: AnsweredQuestion[];
  score: number;
  streak: number;
  maxStreak: number;
  startedAt: number;
  finishedAt: number | null;
}

export interface PersistedStats {
  bestScore: Record<Level, number>;
  bestStreak: number;
  sessionCount: number;
  lastPlayedAt: number | null;
}

export const LEVELS: readonly Level[] = ['iniciante', 'intermediario', 'avancado'] as const;

export const CATEGORIES: readonly Category[] = [
  'fundamentos',
  'uso_basico',
  'slash_basico',
  'interface',
  'configuracao',
  'skills',
  'slash_custom',
  'subagents',
  'hooks',
  'mcp',
  'sdk',
  'api_caching',
] as const;

export function isLevel(value: string): value is Level {
  return (LEVELS as readonly string[]).includes(value);
}
