import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, FolderOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { PortfolioItem } from '@/types';

export function PortfolioCard({ item }: { item: PortfolioItem }) {
  const industries = (item.industries as string[]) || [];

  return (
    <Link href={`/portfolio/${item.slug}`}>
      <Card hover className="h-full">
        {item.featuredImage?.url ? (
          <div className="relative mb-4 h-40 overflow-hidden rounded-lg">
            <Image
              src={item.featuredImage.url}
              alt={item.featuredImage.altText || item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        ) : (
          <div className="mb-4 flex h-40 items-center justify-center rounded-lg bg-blue-900/10">
            <FolderOpen className="h-10 w-10 text-blue-900" />
          </div>
        )}
        {industries.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {industries.map((ind) => (
              <Badge key={ind} variant="secondary" className="text-xs px-2 py-0.5">
                {ind}
              </Badge>
            ))}
          </div>
        )}
        <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
        {item.clientName && <p className="mt-1 text-sm text-gray-500">{item.clientName}</p>}
        {item.description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">{item.description}</p>
        )}
        <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-900">
          Lihat studi kasus <ArrowRight className="ml-1 h-4 w-4" />
        </span>
      </Card>
    </Link>
  );
}
