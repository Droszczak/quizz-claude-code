# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado atual do repositório

**Pré-implementação.** O único arquivo de conteúdo é `prd.md` — não há código, `package.json`, ou estrutura de projeto ainda. O PRD é a **fonte única de verdade** para a construção da v1 e deve ser lido antes de qualquer ação de implementação.

Antes de começar a codar, leia `prd.md` integralmente. Ele especifica stack, arquitetura, modelo de dados, roadmap em 7 fases, critérios de aceitação e snippets de referência.

## O que está sendo construído

**Quizz Claude Code (Web):** Quiz de Verdadeiro ou Falso sobre o produto Claude Code (CLI, SDK, API), com 60 perguntas em 3 níveis (Iniciante / Intermediário / Avançado). Cada resposta errada exibe explicação curada + link para a documentação oficial em `docs.claude.com` ou `anthropic.com`.

Audiência: desenvolvedores brasileiros — interface e perguntas em **PT-BR apenas** na v1.

## Stack e arquitetura planejada

- **Framework:** Next.js 14+ com App Router em modo `output: 'export'` (site estático).
- **Linguagem:** TypeScript strict.
- **Estilização:** Tailwind CSS, tema dark inspirado em terminal, paleta laranja Anthropic (`--accent: #D97757`).
- **Persistência:** **LocalStorage apenas** — sem backend, sem banco de dados, sem auth. Nunca usar Server Actions, rotas de API, `cookies()`, `headers()` ou qualquer feature server-side; o build precisa funcionar como export estático para GitHub Pages.
- **Deploy:** GitHub Pages via GitHub Actions (`output: 'export'` + `basePath` dinâmico em `next.config.mjs`).
- **Testes:** Vitest + Testing Library, foco em lógica de `lib/` (score, sorteio, storage).
- **Package manager preferido:** pnpm.

### Pontos arquiteturais que exigem cuidado

1. **Banco de perguntas (`src/data/questions.json`) é a fonte da verdade do conteúdo.** 60 perguntas distribuídas conforme a matriz da seção 2.2 do PRD (20 por nível × 4 categorias por nível). Toda pergunta precisa de `explanation` ≤ 400 chars e `docUrl` apontando para domínio oficial. Não inventar URLs — se a página exata for desconhecida, usar o índice da seção.
2. **Hook central `useQuiz`** gerencia estado da sessão (perguntas sorteadas, índice, respondidas, score, streak). Mantenha-o como reducer puro ou Zustand leve — ele é testável isoladamente.
3. **`lib/storage.ts`** deve ter fallback in-memory para quando LocalStorage não estiver disponível (modo privado de alguns navegadores, SSR durante build estático).
4. **Compartilhamento via PNG** (`html-to-image` ou `satori`) precisa ser **lazy-loaded** — só baixa quando o usuário clica em "Compartilhar".
5. **`basePath` no `next.config.mjs`** muda entre dev (`''`) e prod (`/<repo-name>/`). Sempre usar `next/link` corretamente; testar com `pnpm build && npx serve out` antes de fazer deploy.

## Comandos esperados após bootstrap

Estes comandos **ainda não funcionam** — só passam a existir após a Fase 1 (Bootstrap) do roadmap do PRD. Após `pnpm create next-app`:

```bash
pnpm install            # instalar dependências
pnpm dev                # rodar em localhost:3000
pnpm build              # gerar export estático em out/
pnpm test               # rodar Vitest
pnpm test --run         # rodar uma vez (sem watch)
pnpm test path/to/file  # rodar um arquivo específico
pnpm lint               # ESLint
npx serve out           # servir build estático localmente para validar
```

## Convenções de conteúdo (banco de perguntas)

- Enunciado em **1 frase**, ≤ 220 caracteres, sem dupla negativa.
- `explanation` ≤ 400 caracteres, 1-2 parágrafos curtos, só aparece em caso de erro.
- IDs no padrão `<nivel>-<categoria>-<seq>` (ex.: `int-conf-001`, `adv-hook-001`).
- Categorias e níveis usam os enums definidos em `src/types/quiz.ts` (seção 3.5 do PRD).
- Ao gerar/editar perguntas, verifique que URLs apontam para `docs.claude.com` ou `anthropic.com` — nunca para blogs de terceiros.

## Critérios de Definition of Done

A v1 só é considerada pronta quando todos os itens da seção 6 do PRD passarem. Os mais facilmente esquecidos:
- Banco com exatamente 60 perguntas validado contra schema.
- Lighthouse ≥ 95 em todas as categorias.
- Navegação por teclado funcional (atalhos `V`/`F` ou setas).
- Responsivo em viewports 375 / 768 / 1280.
- Build estático servido por `npx serve out` funciona idêntico ao `dev`.

## Roadmap

Implementação dividida em 7 fases sequenciais (Bootstrap → Modelo de dados → Lógica → UI → Compartilhamento → Polimento → Deploy), com commit ao final de cada fase. Detalhes na seção 5 do PRD. Estimativa total: ~7-8h.
