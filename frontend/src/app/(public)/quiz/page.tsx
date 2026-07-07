import type { Metadata } from 'next';
import { SolutionQuiz } from '@/components/interactive/SolutionQuiz';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { buildMetadata, PAGE_SEO, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO.quiz.title,
  description: PAGE_SEO.quiz.description,
  path: '/quiz',
  keywords: PAGE_SEO.quiz.keywords,
});

export default function QuizPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Beranda', url: SITE_URL },
        { name: 'Pencari Solusi', url: `${SITE_URL}/quiz` },
      ])} />

      <div className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900">Temukan Solusi Anda</h1>
            <p className="mt-4 text-slate-600">
              Jawab 5 pertanyaan singkat dan kami akan merekomendasikan layanan terbaik untuk kebutuhan Anda.
            </p>
          </div>
          <SolutionQuiz />
        </div>
      </div>
    </>
  );
}
