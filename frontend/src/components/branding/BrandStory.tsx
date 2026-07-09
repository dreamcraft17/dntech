import { Card } from '@/components/ui/Card';
import type { BrandContent } from '@/lib/branding';

interface BrandStoryProps {
  content: BrandContent;
}

export function BrandStory({ content }: BrandStoryProps) {
  if (!content.story && !content.mission) return null;

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          <Card className="h-full bg-blue-900/10 border-blue-100 flex items-center justify-center min-h-[280px]">
            <p className="text-blue-900 text-sm font-medium tracking-wide uppercase">
              DN Tech Indonesia
            </p>
          </Card>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-900">
              {content.tagline || 'Tentang DN Tech'}
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 lg:text-4xl">Brand Story</h2>
            {content.story && <p className="mt-4 text-gray-600 leading-relaxed whitespace-pre-line">{content.story}</p>}
            {content.mission && (
              <div className="mt-6 border-l-4 border-blue-900 bg-blue-900/5 p-4">
                <p className="text-blue-900 font-semibold">{content.mission}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
