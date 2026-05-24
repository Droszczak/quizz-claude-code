import { LevelPicker } from '@/components/LevelPicker';
import { HomeFooter } from '@/components/HomeFooter';

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 md:mb-14 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-text mb-3">
            Quizz <span className="text-accent">Claude Code</span>
          </h1>
          <p className="text-text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Verdadeiro ou Falso sobre o CLI da Anthropic, do básico ao avançado. Cada erro
            vem com explicação e link direto para a documentação oficial.
          </p>
        </header>

        <section aria-label="Escolha um nível">
          <LevelPicker />
        </section>

        <HomeFooter />
      </div>
    </main>
  );
}
