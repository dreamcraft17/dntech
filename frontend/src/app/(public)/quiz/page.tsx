import type { Metadata } from 'next';
import { SolutionQuiz } from '@/components/interactive/SolutionQuiz';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { buildMetadata, PAGE_SEO, SITE_URL } from '@/lib/seo';
import { PageIntro } from '@/components/layout/PageIntro';

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
          <PageIntro
            kicker="Solution finder"
            title="Mulai dari masalahnya, bukan dari daftar fitur."
            description="Jawab 5 pertanyaan singkat dan kami akan mengarahkan Anda ke jalur layanan atau produk yang paling relevan."
          />
          <SolutionQuiz />
        </div>
      </div>
    </>
  );
}
