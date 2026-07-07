import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface CaseStudyCardProps {
  slug: string;
  title: string;
  description?: string;
  clientName?: string;
  metrics?: Record<string, string>;
  industries?: string[];
}

export function CaseStudyCard({ slug, title, description, clientName, metrics, industries }: CaseStudyCardProps) {
  return (
    <Link href={`/case-studies/${slug}`}>
      <Card hover className="h-full">
        <div className="h-36 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 flex items-end p-4">
          {industries && industries.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded bg-white/20 text-white">{industries[0]}</span>
          )}
        </div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
        {clientName && <p className="text-sm text-slate-500 mt-1">{clientName}</p>}
        {description && <p className="mt-2 text-sm text-slate-600 line-clamp-2">{description}</p>}
        {metrics && Object.keys(metrics).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(metrics).slice(0, 2).map(([key, val]) => (
              <span key={key} className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">{val}</span>
            ))}
          </div>
        )}
        <span className="mt-4 inline-flex items-center text-sm text-blue-600 font-medium">
          Read case study <ArrowRight className="h-4 w-4 ml-1" />
        </span>
      </Card>
    </Link>
  );
}
