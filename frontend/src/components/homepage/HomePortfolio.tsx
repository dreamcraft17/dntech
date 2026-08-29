import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
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
  comingSoonMessage: string;
}

export function HomePortfolio({ projects, comingSoonMessage }: HomePortfolioProps) {
  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={projects.length > 0 ? 'Portfolio' : 'Portfolio publik'}
          subtitle={projects.length > 0 ? undefined : 'Belum ada studi kasus yang kami publikasikan'}
        />

        {projects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 3).map((project) => (
                <Link key={project.id} href={`/case-studies/${project.slug}`}>
                  <Card hover className="h-full overflow-hidden p-0">
                    {project.heroImage ? (
                      <div className="relative h-40 w-full bg-blue-900/10">
                        <Image
                          src={project.heroImage}
                          alt={project.heroImageAlt || project.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="h-40 bg-blue-900/10" />
                    )}
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      {project.clientName && (
                        <p className="mt-1 text-xs font-medium text-teal-600">
                          Klien: {project.clientName}
                        </p>
                      )}
                      <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                        {project.challenge || project.description}
                      </p>
                      {project.results && (
                        <p className="mt-2 text-sm font-medium text-blue-900">
                          Hasil: {project.results}
                        </p>
                      )}
                      <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-900">
                        Baca studi kasus <ArrowRight className="ml-1 h-4 w-4" />
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Button href="/case-studies" variant="outline">
                Lihat Semua Portfolio
              </Button>
            </div>
          </>
        ) : (
          <Card className="mx-auto max-w-2xl text-center">
            <p className="text-gray-700 leading-relaxed">{comingSoonMessage}</p>
            <p className="mt-3 text-sm text-gray-600">
              Tertarik menjadi founding client kami?
            </p>
            <div className="mt-6">
              <Button href="/contact">Hubungi Kami untuk Konsultasi</Button>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}
