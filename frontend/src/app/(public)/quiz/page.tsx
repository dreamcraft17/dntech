import type { Metadata } from 'next';
import { SolutionQuiz } from '@/components/interactive/SolutionQuiz';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { PageIntro } from '@/components/layout/PageIntro';
import { PublicPageShell, SaasPanel } from '@/components/layout/PublicPageShell';
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

      <PublicPageShell width="3xl">
        <PageIntro
          kicker="Solution finder"
          title="Mulai dari masalahnya, bukan dari daftar fitur."
          description="Jawab 5 pertanyaan singkat dan kami akan mengarahkan Anda ke jalur layanan atau produk yang paling relevan."
        />
        <SaasPanel>
          <SolutionQuiz />
        </SaasPanel>
      </PublicPageShell>
    </>
  );
}
