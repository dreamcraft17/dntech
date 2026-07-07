import { SolutionQuiz } from '@/components/interactive/SolutionQuiz';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solution Finder Quiz',
  description: 'Answer 5 quick questions and discover the best DN Tech service for your business needs.',
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function QuizPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Solution Finder', url: `${SITE_URL}/quiz` },
      ])} />

      <div className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900">Find Your Solution</h1>
            <p className="mt-4 text-slate-600">
              Answer 5 quick questions and we will recommend the best service for your needs.
            </p>
          </div>
          <SolutionQuiz />
        </div>
      </div>
    </>
  );
}
