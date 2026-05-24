# PRD — Quizz Claude Code (Web)

> **Status:** Draft 1.0 · **Data:** 2026-05-23 · **Owner:** julio.droszczak@allos.com.br
> **Consumidor deste PRD:** Claude Code (este documento será lido por um agente para implementar o projeto).

---

## 1. Visão Geral

### 1.1 O que é
Aplicação web interativa de **quiz de Verdadeiro ou Falso** focada em **Claude Code** (CLI da Anthropic, Claude Agent SDK e API correlata). Cada pergunta errada exibe uma **explicação curada** e um **link direto para a documentação oficial**, transformando o quiz em uma ferramenta de aprendizado guiado.

### 1.2 Por que existe
- **Educar** desenvolvedores e times sobre Claude Code, dos fundamentos de negócio até tópicos avançados (Hooks, MCP, Skills, SDK).
- **Reduzir curva de adoção** corporativa: ao errar, o usuário é direcionado para a fonte oficial, ganhando autonomia.
- **Engajar** via mecânicas leves de gamificação (streaks, modo revisão, compartilhamento).

### 1.3 Público-alvo
- **Primário:** Desenvolvedores brasileiros (jr/pleno/sênior) avaliando ou já usando Claude Code.
- **Secundário:** Times de tecnologia em onboarding/capacitação interna sobre IA generativa para código.
- **Terciário:** Curiosos / não-técnicos buscando entender o produto em alto nível (perguntas iniciantes).

### 1.4 Métricas de sucesso
- **Engajamento:** ≥ 60% dos usuários que iniciam o quiz completam as 10 perguntas.
- **Aprendizado:** ≥ 40% dos usuários que erram clicam no link da documentação.
- **Retenção leve:** ≥ 25% dos usuários jogam mais de uma sessão (medido via LocalStorage `sessionCount`).
- **Compartilhamento:** ≥ 10% dos usuários que finalizam usam o botão "Compartilhar resultado".

### 1.5 Fora do escopo (v1)
- Autenticação / contas de usuário.
- Ranking global / leaderboard online.
- Backend / banco de dados.
- Internacionalização (i18n) — v1 é apenas PT-BR.
- Editor administrativo de perguntas (perguntas vivem como JSON versionado no repositório).
- Perguntas de múltipla escolha — v1 é estritamente Verdadeiro/Falso.

---

## 2. Requisitos de Negócio

### 2.1 Fluxos principais (user stories)

**US-01 — Entrar e começar**
> Como visitante, quero abrir a página inicial e iniciar um quiz em ≤ 2 cliques, escolhendo o nível de dificuldade.

**US-02 — Responder perguntas**
> Como jogador, quero ver uma pergunta clara, marcar Verdadeiro ou Falso e receber feedback imediato (acerto/erro) antes de avançar.

**US-03 — Aprender com o erro**
> Como jogador que errou, quero ler uma explicação curta (1-2 parágrafos) e acessar o link da documentação oficial daquele tópico.

**US-04 — Ver resultado**
> Como jogador que terminou, quero ver pontuação final, streak máximo e a opção de revisar apenas as perguntas que errei.

**US-05 — Compartilhar**
> Como jogador orgulhoso (ou frustrado), quero gerar um card visual com minha pontuação para compartilhar.

**US-06 — Voltar e melhorar**
> Como jogador recorrente, quero que meu melhor score por nível fique salvo localmente para acompanhar evolução.

### 2.2 Categorias e cobertura de conteúdo

O banco terá **60 perguntas** distribuídas em **3 níveis × 4 categorias**, sorteando 10 por sessão.

| Nível | Categoria | Qtde mínima | Exemplos de tópicos |
|-------|-----------|-------------|---------------------|
| **Iniciante** (20) | Fundamentos & Negócio | 8 | O que é, modelos disponíveis (Opus/Sonnet/Haiku), onde roda (CLI/IDE/web), preços (free vs paid). |
| Iniciante | Uso básico no terminal | 6 | Instalação via `npm`, comando `claude`, autenticação, primeiro prompt. |
| Iniciante | Slash commands básicos | 4 | `/help`, `/clear`, `/config`, `/model`. |
| Iniciante | Interface & UX | 2 | Atalhos básicos, modo plan, modo auto-accept. |
| **Intermediário** (20) | Configuração | 6 | `settings.json` (user vs project), permissions allowlist, env vars (`ANTHROPIC_API_KEY`, `CLAUDE_CODE_*`). |
| Intermediário | Skills customizadas | 5 | Criar `.claude/skills/<nome>/SKILL.md`, frontmatter, quando dispara. |
| Intermediário | Slash commands customizados | 4 | `.claude/commands/`, argumentos, namespacing. |
| Intermediário | Subagents básicos | 5 | `general-purpose`, `Explore`, quando delegar, custo de contexto. |
| **Avançado** (20) | Hooks | 5 | Eventos (PreToolUse, PostToolUse, Stop, etc.), bloqueio via exit code, payloads JSON. |
| Avançado | MCP Servers | 5 | Protocolo MCP, transports (stdio/http), configuração em `.mcp.json`, tools/resources/prompts. |
| Avançado | Claude Agent SDK | 5 | Diferença SDK vs CLI, construção de agents programáticos, tool use, streaming. |
| Avançado | API & Caching | 5 | Prompt caching, batch API, extended thinking, files API, citations. |

### 2.3 Estrutura de uma pergunta (modelo de dados)

```json
{
  "id": "int-conf-001",
  "level": "intermediario",
  "category": "configuracao",
  "statement": "O arquivo settings.json do Claude Code aceita apenas configurações no escopo de usuário, não havendo suporte para configurações por projeto.",
  "answer": false,
  "explanation": "Claude Code suporta múltiplos escopos de settings: usuário (~/.claude/settings.json), projeto (.claude/settings.json versionado) e local de projeto (.claude/settings.local.json, ignorado pelo git). Configurações mais específicas sobrescrevem as mais gerais.",
  "docUrl": "https://docs.claude.com/en/docs/claude-code/settings",
  "docTitle": "Claude Code Settings"
}
```

**Regras editoriais para perguntas:**
- Enunciado em **1 frase**, no máximo 220 caracteres.
- Evitar duplas negativas.
- A `explanation` aparece **somente em caso de erro**, com 1-2 parágrafos curtos (até 400 caracteres).
- O `docUrl` aponta para **docs.claude.com** ou **anthropic.com/engineering** — nunca para blogs de terceiros.
- Não inventar URLs: se a página exata não for conhecida, apontar para a seção raiz do tópico.

### 2.4 Mecânicas do quiz

- **Sessão:** 10 perguntas sorteadas aleatoriamente do nível escolhido (sem repetição dentro da sessão).
- **Pontuação:** +10 por acerto, 0 por erro. Sem subtração.
- **Streak:** Contador de acertos consecutivos. Reseta ao errar. Exibido no header durante a sessão.
- **Feedback imediato:** Após responder, mostrar acerto/erro antes de avançar (botão "Próxima").
- **Modo revisão:** Ao final, se houve ≥ 1 erro, oferecer "Revisar erros" que apresenta apenas as perguntas erradas com a explicação completa visível desde o início.
- **Persistência local (LocalStorage):**
  - `bestScore.iniciante`, `bestScore.intermediario`, `bestScore.avancado`
  - `bestStreak`
  - `sessionCount`
  - `lastPlayedAt`

### 2.5 Compartilhamento de resultado

Botão "Compartilhar" gera uma **imagem PNG** (via `html2canvas` ou `satori`) com:
- Nome do quiz / logo.
- Pontuação final (ex: "8/10 acertos").
- Nível jogado.
- Streak máximo.
- URL curta do quiz para quem vir o card.

Opcionalmente, expor `navigator.share()` em mobile (Web Share API) com fallback para download da imagem em desktop.

---

## 3. Requisitos Técnicos

### 3.1 Stack

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Framework | **Next.js 14+ (App Router)** | SSG/export estático para GitHub Pages, ótima DX, ecossistema maduro. |
| Linguagem | **TypeScript 5.x** (strict) | Type safety no modelo de perguntas e estado do quiz. |
| Estilização | **Tailwind CSS 3.x** | Produtividade, dark-mode nativo via classe, fácil tematização. |
| UI primitives | **Radix UI** (opcional, Dialog/Toast) | Acessibilidade out-of-the-box. |
| Ícones | **lucide-react** | Consistente com estética terminal/dev. |
| Animações | **framer-motion** | Transições suaves entre perguntas (sem exagero). |
| Captura de imagem | **html-to-image** ou **satori** | Geração do card de compartilhamento. |
| Testes | **Vitest** + **@testing-library/react** | Rápido, ESM-friendly, suficiente para lógica do quiz. |
| Lint/Format | **ESLint** (config Next.js) + **Prettier** | Padrão da indústria. |
| Package manager | **pnpm** (preferido) ou npm | pnpm é mais rápido e econômico em disco. |

### 3.2 Arquitetura de pastas

```
quizz-claude-code/
├── .github/
│   └── workflows/
│       └── deploy.yml              # Deploy automático para GitHub Pages
├── .claude/
│   └── settings.json               # Allowlist mínima (opcional, dev experience)
├── public/
│   ├── favicon.svg
│   └── og-image.png                # Open Graph para compartilhamento
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Layout raiz, fontes, metadados
│   │   ├── page.tsx                # Home: escolha de nível
│   │   ├── quiz/
│   │   │   └── [level]/
│   │   │       └── page.tsx        # Sessão de quiz (client component)
│   │   ├── globals.css             # Tailwind base + variáveis de tema
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── QuestionCard.tsx        # Card de pergunta + botões V/F
│   │   ├── FeedbackPanel.tsx       # Painel pós-resposta (explicação + link)
│   │   ├── ProgressBar.tsx
│   │   ├── StreakBadge.tsx
│   │   ├── ResultScreen.tsx
│   │   ├── ShareCard.tsx           # Card visual exportável como PNG
│   │   ├── LevelPicker.tsx
│   │   └── ReviewMode.tsx
│   ├── lib/
│   │   ├── questions.ts            # Loader + sorteio das perguntas
│   │   ├── storage.ts              # Wrapper tipado de LocalStorage
│   │   ├── score.ts                # Cálculo de pontuação e streak
│   │   └── share.ts                # Geração de imagem + Web Share API
│   ├── data/
│   │   └── questions.json          # Banco de 60 perguntas (fonte da verdade)
│   ├── types/
│   │   └── quiz.ts                 # Tipos TypeScript (Question, Level, etc.)
│   └── hooks/
│       └── useQuiz.ts              # Hook central de estado da sessão
├── tests/
│   ├── score.test.ts
│   ├── questions.test.ts
│   └── storage.test.ts
├── next.config.mjs                 # output: 'export', basePath, images.unoptimized
├── tailwind.config.ts
├── tsconfig.json                   # strict: true
├── package.json
├── README.md                       # Como rodar local e contribuir
└── prd.md                          # Este documento
```

### 3.3 Configuração Next.js para GitHub Pages

```js
// next.config.mjs
const isProd = process.env.NODE_ENV === 'production';
const repoName = 'quizz-claude-code'; // ajustar conforme o repo final

export default {
  output: 'export',
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',
  images: { unoptimized: true },
  trailingSlash: true,
};
```

> **Atenção:** Como é export estático, **não usar** rotas de API, `headers()`, `cookies()` ou Server Actions. Toda lógica é client-side.

### 3.4 Workflow de deploy (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm test --run
      - run: pnpm build
      - uses: actions/upload-pages-artifact@v3
        with: { path: ./out }
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 3.5 Tipos TypeScript (núcleo)

```ts
// src/types/quiz.ts
export type Level = 'iniciante' | 'intermediario' | 'avancado';

export type Category =
  | 'fundamentos' | 'uso_basico' | 'slash_basico' | 'interface'
  | 'configuracao' | 'skills' | 'slash_custom' | 'subagents'
  | 'hooks' | 'mcp' | 'sdk' | 'api_caching';

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
```

### 3.6 Tema visual (paleta e tipografia)

Inspirado na estética do Claude Code (terminal + Anthropic):

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg` | `#0F0F0F` | Fundo principal |
| `--bg-elevated` | `#1A1A1A` | Cards, modais |
| `--border` | `#2A2A2A` | Divisores |
| `--text` | `#EDEDED` | Texto principal |
| `--text-muted` | `#9CA3AF` | Texto secundário |
| `--accent` | `#D97757` | Botões primários, destaques (laranja Anthropic) |
| `--accent-hover` | `#C2613D` | Hover do accent |
| `--success` | `#4ADE80` | Acerto |
| `--error` | `#F87171` | Erro |
| `--code-bg` | `#161616` | Blocos de código nas explicações |

**Tipografia:**
- **UI:** Inter (via `next/font/google`).
- **Code/monospace:** JetBrains Mono ou Geist Mono — usar em `statement` quando há trechos técnicos e em `<code>` dentro de `explanation`.

### 3.7 Acessibilidade (WCAG AA)

- **Contraste:** Todas as combinações de cor atendem ≥ 4.5:1 para texto.
- **Teclado:** Botões V/F navegáveis com `Tab`, ativáveis com `Enter`/`Space`. Atalhos: tecla `V` ou seta esquerda para Verdadeiro, `F` ou seta direita para Falso.
- **ARIA:** `role="radiogroup"` no par de botões V/F, `aria-live="polite"` no painel de feedback.
- **Foco visível:** Ring laranja (`--accent`) em todos elementos focáveis.
- **Reduced motion:** Respeitar `prefers-reduced-motion` (sem animações de transição).
- **Imagens:** Todas com `alt` significativo.

### 3.8 Responsividade

- **Mobile-first:** Layout em coluna única até `md` (768px).
- **Breakpoints Tailwind:** padrão (`sm`, `md`, `lg`).
- **Targets de toque:** Botões V/F com altura mínima de 48px em mobile.
- **Card de compartilhamento:** Renderizado em canvas 1200×630 (proporção OG) independente do viewport.

### 3.9 Performance (alvos)

- **Lighthouse Performance:** ≥ 95.
- **LCP:** < 1.5s em 4G simulada.
- **Bundle JS inicial:** < 150 KB gzipped.
- **Lazy-load** do gerador de imagem (`html-to-image`) — só baixa quando o usuário clica em "Compartilhar".

### 3.10 Testes

**Cobertura mínima de lógica:**
- `lib/score.ts`: cálculo de pontuação, streak, maxStreak (≥ 90% coverage).
- `lib/questions.ts`: sorteio sem repetição, filtro por nível.
- `lib/storage.ts`: leitura/escrita com fallback quando LocalStorage indisponível.
- `hooks/useQuiz.ts`: transições de estado (responder, próxima, finalizar).

**Validação de dados:**
- Teste que percorre `questions.json` validando schema (id único, level válido, URL bem-formada, statement ≤ 220 chars, explanation ≤ 400 chars).

---

## 4. Conteúdo do Banco de Perguntas (sementes)

Abaixo, exemplos representativos para cada nível. O agente deve gerar as **60 perguntas completas** respeitando a distribuição da seção 2.2, com `explanation` precisa e `docUrl` apontando para `docs.claude.com` ou `anthropic.com`.

### 4.1 Exemplos — Iniciante

```json
{
  "id": "ini-fund-001",
  "level": "iniciante",
  "category": "fundamentos",
  "statement": "Claude Code é uma ferramenta exclusivamente web, sem versão para terminal.",
  "answer": false,
  "explanation": "Claude Code é primariamente uma CLI para terminal, mas também está disponível como app desktop (Mac/Windows), web app (claude.ai/code) e extensões para IDEs como VS Code e JetBrains.",
  "docUrl": "https://docs.claude.com/en/docs/claude-code/overview",
  "docTitle": "Claude Code — Overview"
}
```

### 4.2 Exemplos — Intermediário

```json
{
  "id": "int-conf-002",
  "level": "intermediario",
  "category": "configuracao",
  "statement": "Configurações em .claude/settings.local.json são versionadas no Git por padrão.",
  "answer": false,
  "explanation": "O arquivo settings.local.json é ignorado pelo Git por padrão — ele serve para preferências locais do desenvolvedor (permissões específicas, env vars sensíveis). Para configurações compartilhadas com o time, use .claude/settings.json (versionado).",
  "docUrl": "https://docs.claude.com/en/docs/claude-code/settings",
  "docTitle": "Claude Code Settings"
}
```

### 4.3 Exemplos — Avançado

```json
{
  "id": "adv-hook-001",
  "level": "avancado",
  "category": "hooks",
  "statement": "Um hook PreToolUse pode bloquear a execução de uma tool retornando exit code 2.",
  "answer": true,
  "explanation": "Hooks PreToolUse com exit code 2 bloqueiam a execução da tool e enviam o stderr de volta ao Claude como feedback. Exit code 0 permite seguir, e exit code 1 sinaliza erro não-bloqueante.",
  "docUrl": "https://docs.claude.com/en/docs/claude-code/hooks",
  "docTitle": "Claude Code Hooks"
}
```

---

## 5. Roadmap de Implementação

O agente deve executar nesta ordem, commitando ao final de cada fase:

### Fase 1 — Bootstrap (estimativa: 30min)
1. `pnpm create next-app@latest quizz-claude-code` com TS + Tailwind + ESLint + App Router.
2. Configurar `next.config.mjs` para export estático.
3. Configurar Prettier, ESLint extras, Tailwind theme (paleta seção 3.6).
4. Adicionar Vitest e setup de testes.
5. Commit: `chore: bootstrap projeto Next.js com TS + Tailwind`.

### Fase 2 — Modelo de dados e banco (estimativa: 1.5h)
1. Criar `src/types/quiz.ts` (tipos da seção 3.5).
2. Criar `src/data/questions.json` com as **60 perguntas** completas (distribuição da seção 2.2).
3. Criar `src/lib/questions.ts` (loader + sorteio sem repetição).
4. Teste de validação de schema (`tests/questions.test.ts`).
5. Commit: `feat: banco de 60 perguntas e loader`.

### Fase 3 — Lógica de quiz (estimativa: 1h)
1. `src/lib/score.ts` — pontuação e streak.
2. `src/lib/storage.ts` — wrapper de LocalStorage (com try/catch e fallback in-memory).
3. `src/hooks/useQuiz.ts` — estado da sessão (reducer ou Zustand leve).
4. Testes unitários.
5. Commit: `feat: lógica de sessão de quiz e persistência local`.

### Fase 4 — UI principal (estimativa: 2.5h)
1. Layout raiz, fontes, metadados (Open Graph).
2. Página home com `LevelPicker` e estatísticas locais (best scores).
3. Página `/quiz/[level]` com `QuestionCard`, `ProgressBar`, `StreakBadge`, `FeedbackPanel`.
4. Atalhos de teclado.
5. Tela de resultado (`ResultScreen`) com botões "Revisar erros" e "Compartilhar".
6. `ReviewMode`.
7. Commit: `feat: UI completa do quiz`.

### Fase 5 — Compartilhamento (estimativa: 45min)
1. `ShareCard` (componente visual 1200×630).
2. `src/lib/share.ts` — gera PNG via `html-to-image`, lazy-loaded.
3. Web Share API com fallback de download.
4. Commit: `feat: compartilhamento de resultado como imagem`.

### Fase 6 — Polimento e a11y (estimativa: 1h)
1. Auditoria de contraste e ARIA.
2. Suporte a `prefers-reduced-motion`.
3. Animações com framer-motion (transição entre perguntas).
4. Otimização de bundle (lazy-load).
5. Verificação Lighthouse local.
6. Commit: `chore: polimento, acessibilidade e performance`.

### Fase 7 — Deploy (estimativa: 30min)
1. Criar `.github/workflows/deploy.yml` (seção 3.4).
2. README com instruções de dev local e deploy.
3. Configurar GitHub Pages no repositório (Settings → Pages → Source: GitHub Actions).
4. Validar build estático localmente: `pnpm build && npx serve out`.
5. Commit: `ci: deploy automático para GitHub Pages`.

**Estimativa total:** ~7-8 horas de trabalho focado.

---

## 6. Critérios de Aceitação (Definition of Done)

- [ ] `pnpm install && pnpm dev` sobe o app sem erros em `localhost:3000`.
- [ ] `pnpm build` gera diretório `out/` funcional como site estático.
- [ ] `pnpm test` passa todos os testes (≥ 80% coverage em `lib/`).
- [ ] `pnpm lint` não retorna erros.
- [ ] Banco com **exatamente 60 perguntas** (20 por nível) validado contra schema.
- [ ] Toda pergunta tem `explanation` ≤ 400 chars e `docUrl` apontando para domínio oficial (`docs.claude.com` ou `anthropic.com`).
- [ ] Sessão de 10 perguntas funciona end-to-end (escolha → responder → resultado → revisar/compartilhar).
- [ ] LocalStorage persiste `bestScore` por nível e `bestStreak` entre sessões.
- [ ] Compartilhamento gera PNG válido (testado manualmente).
- [ ] Lighthouse ≥ 95 em Performance, Accessibility, Best Practices, SEO.
- [ ] App responsivo: testado em viewports 375px, 768px, 1280px.
- [ ] Navegação por teclado funcional em todo o fluxo.
- [ ] Deploy em GitHub Pages acessível e funcional.

---

## 7. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| URLs da documentação mudarem (link rot) | Média | Médio | Apontar para seções raiz quando possível; manter `docUrl` em arquivo único facilita atualização em massa. |
| Banco de 60 perguntas com erros factuais | Média | Alto | Revisão manual antes do merge final; preferir fatos estáveis (não preços/UI volátil). |
| GitHub Pages com basePath quebrando links | Baixa | Médio | Testar `pnpm build && npx serve out` antes do deploy; usar `next/link` corretamente. |
| `html-to-image` falhar em alguns navegadores | Baixa | Baixo | Fallback: oferecer botão "Copiar texto do resultado" se a geração de imagem falhar. |
| Perguntas ficarem desatualizadas (Claude evolui rápido) | Alta | Médio | Versionar perguntas com data; revisar trimestralmente. |

---

## 8. Decisões de Design (registro de trade-offs)

- **Por que LocalStorage e não backend?** Reduz custo a zero, simplifica deploy (GitHub Pages estático), e o caso de uso (quiz educativo individual) não exige ranking global na v1.
- **Por que apenas PT-BR na v1?** Foco em audiência inicial brasileira reduz esforço editorial pela metade. Estrutura permite i18n futura (chaves de tradução em JSON).
- **Por que V/F e não múltipla escolha?** V/F é o pedido explícito; também é mais fácil de criar conteúdo de qualidade e mais ágil para o usuário (cognitivamente mais leve).
- **Por que Next.js se não há backend?** App Router + export estático ainda traz benefícios: code-splitting automático, otimização de imagens (opcional), DX superior, e abre porta para v2 com server features.
- **Por que sortear 10 do banco de 20?** Evita memorização entre sessões; mantém variedade; sessões curtas (5-7min) favorecem repetição.

---

## 9. Referências (para o agente consultar durante a criação do banco)

- Documentação oficial: https://docs.claude.com/en/docs/claude-code/overview
- Engineering blog: https://www.anthropic.com/engineering
- Claude Agent SDK: https://docs.claude.com/en/api/agent-sdk
- MCP: https://modelcontextprotocol.io
- Settings: https://docs.claude.com/en/docs/claude-code/settings
- Hooks: https://docs.claude.com/en/docs/claude-code/hooks
- Skills: https://docs.claude.com/en/docs/claude-code/skills
- Slash commands: https://docs.claude.com/en/docs/claude-code/slash-commands
- Subagents: https://docs.claude.com/en/docs/claude-code/sub-agents

> Ao criar as perguntas, o agente deve **verificar** que as URLs existem ou apontar para o índice da seção. Não inventar paths.

---

## 10. Anexo — Snippet de exemplo (UI da pergunta)

```tsx
// src/components/QuestionCard.tsx (esboço)
'use client';
import { useState } from 'react';
import type { Question } from '@/types/quiz';

interface Props {
  question: Question;
  onAnswer: (userAnswer: boolean) => void;
  index: number;
  total: number;
}

export function QuestionCard({ question, onAnswer, index, total }: Props) {
  const [answered, setAnswered] = useState<boolean | null>(null);

  function handleAnswer(value: boolean) {
    if (answered !== null) return;
    setAnswered(value);
    onAnswer(value);
  }

  return (
    <article
      className="bg-bg-elevated border border-border rounded-2xl p-6 md:p-8"
      aria-labelledby={`q-${question.id}`}
    >
      <p className="text-text-muted text-sm mb-2">
        Pergunta {index + 1} de {total} · {question.level}
      </p>
      <h2 id={`q-${question.id}`} className="text-xl md:text-2xl leading-relaxed mb-8">
        {question.statement}
      </h2>
      <div role="radiogroup" aria-label="Verdadeiro ou Falso" className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleAnswer(true)}
          disabled={answered !== null}
          className="min-h-12 rounded-xl border-2 border-border hover:border-accent focus:ring-2 focus:ring-accent disabled:opacity-50"
          aria-pressed={answered === true}
        >
          Verdadeiro <kbd className="text-xs opacity-60">(V)</kbd>
        </button>
        <button
          onClick={() => handleAnswer(false)}
          disabled={answered !== null}
          className="min-h-12 rounded-xl border-2 border-border hover:border-accent focus:ring-2 focus:ring-accent disabled:opacity-50"
          aria-pressed={answered === false}
        >
          Falso <kbd className="text-xs opacity-60">(F)</kbd>
        </button>
      </div>
    </article>
  );
}
```

---

**Fim do PRD.** Este documento é a fonte única de verdade para a implementação da v1.
