import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/components/common/Logo';

/** Footer wordmark — small logo + text, no large circular asset */
export function FooterBrand() {
  const t = useTranslations('layout');

  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 hover:opacity-90 transition-opacity"
      aria-label={t('homeAria')}
    >
      <Logo href={null} size="sm" />
      <span className="font-bold text-gray-900 text-base leading-tight tracking-tight">
        DN Tech<span className="text-blue-900">.id</span>
      </span>
    </Link>
  );
}
