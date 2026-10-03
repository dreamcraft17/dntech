import { getTranslations } from 'next-intl/server';
import { CalendlyEmbed } from '@/components/interactive/CalendlyEmbed';
import { Button } from '@/components/ui/Button';
import { Calendar, ArrowRight } from 'lucide-react';

interface BookDemoSectionProps {
  calendlyUrl?: string;
}

export async function BookDemoSection({ calendlyUrl }: BookDemoSectionProps) {
  const t = await getTranslations('interactive.bookDemo');

  return (
    <section className="py-20 bg-gray-50 border-t border-gray-200">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 mb-4">
            <Calendar className="h-6 w-6 text-blue-900" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{t('title')}</h2>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">{t('description')}</p>
        </div>

        {calendlyUrl ? (
          <CalendlyEmbed url={calendlyUrl} />
        ) : (
          <div className="text-center p-8 rounded-xl bg-white border border-gray-200">
            <p className="text-gray-600 mb-6">{t('fallback')}</p>
            <Button href="/contact" size="lg">
              {t('cta')} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
