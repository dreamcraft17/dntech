'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function StickyCTA() {
  const t = useTranslations('layout');

  return (
    <div className="site-sticky-cta fixed bottom-0 left-0 right-0 z-40 px-4 py-3 md:hidden">
      <Link
        href="/contact"
        className="flex min-h-[48px] w-full items-center justify-center py-3 text-sm font-semibold transition-colors"
      >
        {t('stickyCta')}
      </Link>
    </div>
  );
}
