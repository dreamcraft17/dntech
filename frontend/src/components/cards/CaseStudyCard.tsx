import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, FolderOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface CaseStudyCardProps {
  slug: string;
  title: string;
  description?: string;
  clientName?: string;
  metrics?: Record<string, string>;
  industries?: string[];
  heroImage?: string;
  heroImageAlt?: string;
}

export function CaseStudyCard({
  slug,
  title,
  description,
  clientName,
  metrics,
  industries,
  heroImage,
  heroImageAlt,
}: CaseStudyCardProps) {
  return (
    <Link href={`/case-studies/${slug}`}>
      <Card hover className="h-full">
        {heroImage ? (
          <div className="relative mb-4 h-36 overflow-hidden rounded-lg">
            <Image
              src={heroImage}
              alt={heroImageAlt || title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        ) : (
          <div className="mb-4 flex h-36 items-end rounded-lg bg-blue-900/10 p-4">
            {industries && industries.length > 0 && (
              <Badge variant="default">{industries[0]}</Badge>
            )}
            {!industries?.length && <FolderOpen className="h-8 w-8 text-blue-900" />}
          </div>
        )}
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {clientName && <p className="mt-1 text-sm text-gray-500">{clientName}</p>}
        {description && <p className="mt-2 line-clamp-2 text-sm text-gray-600">{description}</p>}
        {metrics && Object.keys(metrics).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(metrics).slice(0, 2).map(([key, val]) => (
              <Badge key={key} variant="success">
                {val}
              </Badge>
            ))}
          </div>
        )}
        <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-900">
          Baca studi kasus <ArrowRight className="ml-1 h-4 w-4" />
        </span>
      </Card>
    </Link>
  );
}
