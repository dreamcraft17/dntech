'use client';

import { useTranslations } from 'next-intl';

interface CalendlyEmbedProps {
  url?: string;
}

export function CalendlyEmbed({ url }: CalendlyEmbedProps) {
  const t = useTranslations('interactive.calendly');

  if (!url) return null;

  return (
    <div className="mt-8 rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 text-sm">{t('heading')}</h3>
      </div>
      <iframe
        src={url}
        title={t('iframeTitle')}
        className="w-full h-[600px] border-0"
        loading="lazy"
      />
    </div>
  );
}
