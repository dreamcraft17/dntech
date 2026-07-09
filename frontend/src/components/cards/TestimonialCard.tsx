import { Star, Play } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { Testimonial } from '@/types';

interface TestimonialCardProps {
  testimonial: Testimonial;
  featured?: boolean;
}

export function TestimonialCard({ testimonial: t, featured = false }: TestimonialCardProps) {
  return (
    <Card className={featured ? 'border-blue-200 bg-blue-50/30' : undefined}>
      {t.title && (
        <div className="text-xs font-medium text-blue-900 mb-2 uppercase tracking-wide">{t.title}</div>
      )}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: t.rating || 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <blockquote className={`text-gray-600 italic leading-relaxed ${featured ? 'text-lg' : 'text-sm'}`}>
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-semibold shrink-0">
          {t.clientName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900">{t.clientName}</div>
          <div className="text-sm text-gray-500 truncate">
            {[t.position, t.company].filter(Boolean).join(', ')}
          </div>
        </div>
        {t.videoUrl && (
          <a href={t.videoUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-900 hover:underline shrink-0">
            <Play className="h-3.5 w-3.5" /> Video
          </a>
        )}
      </div>
    </Card>
  );
}
