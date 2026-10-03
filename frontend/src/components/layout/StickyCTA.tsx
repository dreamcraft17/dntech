'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function StickyCTA() {
  const t = useTranslations('layout');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-blue-800 bg-[var(--primary)] px-4 py-3 md:hidden">
      <Link
        href="/contact"
        className="flex min-h-[48px] w-full items-center justify-center rounded-[var(--radius-card)] bg-white py-3 text-sm font-semibold text-[var(--primary)] transition-colors hover:bg-blue-50"
      >
        {t('stickyCta')}
      </Link>
    </div>
  );
}
