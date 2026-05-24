import { notFound } from 'next/navigation';
import { QuizSession } from '@/components/QuizSession';
import { LEVELS, isLevel } from '@/types/quiz';

export function generateStaticParams() {
  return LEVELS.map((level) => ({ level }));
}

export const dynamicParams = false;

export default function QuizLevelPage({ params }: { params: { level: string } }) {
  if (!isLevel(params.level)) {
    notFound();
  }
  return <QuizSession level={params.level} />;
}
