'use client';

import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { Globe } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { persistLocaleChoice } from '@/i18n/locale-cookie';
import { locales, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations('localeSwitcher');
  const activeLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function switchTo(locale: Locale) {
    if (locale === activeLocale) return;
    persistLocaleChoice(locale);
    const query = searchParams.toString();
    startTransition(() => {
      router.replace(`${pathname}${query ? `?${query}` : ''}`, { locale });
    });
  }

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-[var(--radius-card)] border border-[var(--border)] p-0.5',
        isPending && 'opacity-60',
        className
      )}
      role="group"
      aria-label={t('label')}
    >
      <Globe className="ml-1 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => switchTo(locale)}
          disabled={isPending}
          aria-current={locale === activeLocale ? 'true' : undefined}
          lang={locale}
          title={t(locale)}
          className={cn(
            'rounded-[calc(var(--radius-card)-2px)] px-2 py-1.5 text-xs font-semibold uppercase transition-colors',
            locale === activeLocale
              ? 'bg-blue-900 text-white'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          )}
        >
          {locale}
          <span className="sr-only"> — {t(locale)}</span>
        </button>
      ))}
    </div>
  );
}
