# Quizz Claude Code

Quiz web de Verdadeiro ou Falso sobre **Claude Code**, do iniciante ao avançado. Cada erro vem com explicação curada e link direto para a documentação oficial da Anthropic.

## Stack

- Next.js 14 (App Router) com **export estático**
- TypeScript strict
- Tailwind CSS 3
- Vitest + Testing Library
- framer-motion (animações)
- html-to-image (compartilhamento como PNG, lazy-loaded)

## Desenvolvimento local

Requisitos: Node 18+ e npm (ou pnpm).

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (hot reload) |
| `npm run build` | Build estático em `out/` |
| `npm run lint` | ESLint |
| `npm test` | Executa Vitest uma vez |
| `npm run test:watch` | Vitest em modo watch |
| `npm run test:coverage` | Cobertura de testes (≥80% em `src/lib`) |
| `npm run format` | Prettier nos arquivos do projeto |

Para servir o build estático localmente (validando `basePath` de produção):

```bash
NODE_ENV=production npm run build
npx serve out -p 3001
```

## Estrutura

```
src/
├── app/                  # App Router (layout, home, /quiz/[level])
├── components/           # UI (QuestionCard, FeedbackPanel, ShareCard, ...)
├── data/questions.json   # Banco de 60 perguntas (fonte da verdade)
├── hooks/useQuiz.ts      # Reducer de sessão
├── lib/                  # Lógica pura (score, storage, share, questions)
└── types/quiz.ts         # Tipos compartilhados
```

## Contribuindo com perguntas

Edite `src/data/questions.json` seguindo o schema:

```json
{
  "id": "ini-fund-009",
  "level": "iniciante",
  "category": "fundamentos",
  "statement": "Frase ≤ 220 chars, sem dupla negativa.",
  "answer": true,
  "explanation": "Explicação ≤ 400 chars, 1-2 parágrafos, aparece só ao errar.",
  "docUrl": "https://docs.claude.com/en/docs/claude-code/...",
  "docTitle": "Título amigável do link"
}
```

Restrições validadas por `tests/questions.test.ts`:

- `id` único.
- `level` ∈ `iniciante | intermediario | avancado`.
- `statement` até 220 caracteres.
- `explanation` até 400 caracteres.
- `docUrl` começa com `docs.claude.com`, `anthropic.com`, `docs.anthropic.com` ou `modelcontextprotocol.io`.

Rode `npm test` antes de abrir PR.

## Deploy

Push para `main` dispara `.github/workflows/deploy.yml`, que:

1. Roda testes e lint.
2. Gera o build estático em `out/`.
3. Publica em GitHub Pages.

O `basePath` é controlado em `next.config.mjs` via `repoName`. Ajuste o valor se o nome do repositório for diferente de `quizz-claude-code`.

## Documentação do projeto

- Spec completa em [`prd.md`](./prd.md).
- Guia para agentes em [`CLAUDE.md`](./CLAUDE.md).
