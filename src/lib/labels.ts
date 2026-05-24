import type { Level } from '@/types/quiz';

export const LEVEL_LABEL: Record<Level, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

export const LEVEL_DESCRIPTION: Record<Level, string> = {
  iniciante: 'Fundamentos, instalação, comandos básicos.',
  intermediario: 'Settings, skills, slash commands, subagents.',
  avancado: 'Hooks, MCP, Claude Agent SDK e API.',
};
