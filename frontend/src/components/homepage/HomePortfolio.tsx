import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/homepage/SectionHeading';

interface CaseStudyPreview {
  id: string;
  slug: string;
  title: string;
  description?: string;
  clientName?: string;
  challenge?: string;
  solution?: string;
  results?: string;
  heroImage?: string;
  heroImageAlt?: string;
}

interface HomePortfolioProps {
  projects: CaseStudyPreview[];
}

export function HomePortfolio({ projects }: HomePortfolioProps) {
  const t = useTranslations('home.portfolio');
  if (!projects.length) return null;

  return (
    <section className="home-section-alt py-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t('title')} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 3).map((project) => (
            <Link key={project.id} href={`/case-studies/${project.slug}`}>
              <Card hover className="h-full overflow-hidden p-0">
                {project.heroImage ? (
                  <div className="relative h-40 w-full bg-blue-50">
                    <Image
                      src={project.heroImage}
                      alt={project.heroImageAlt || project.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-blue-50" />
                )}
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900">{project.title}</h3>
                  {project.clientName && (
                    <p className="mt-1 text-xs font-medium text-teal-600">
                      {t('client', { name: project.clientName })}
                    </p>
                  )}
                  <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                    {project.challenge || project.description}
                  </p>
                  {project.results && (
                    <p className="mt-2 text-sm font-medium text-blue-900">
                      {t('result', { value: project.results })}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-900">
                    {t('readCaseStudy')} <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button href="/case-studies" variant="outline">
            {t('viewAll')}
          </Button>
        </div>
      </div>
    </section>
  );
}
