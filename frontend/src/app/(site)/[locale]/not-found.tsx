import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('layout.notFound');

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background,#f0ebe3)] px-4">
      <div className="text-center">
        <p className="dn-kicker justify-center text-[var(--secondary)]">DN Tech</p>
        <h1 className="dn-display mt-3 text-6xl">404</h1>
        <p className="mt-4 text-lg text-[var(--muted)]">{t('title')}</p>
        <Link href="/" className="dn-btn-primary mt-6 inline-flex border-[var(--primary)] bg-[var(--primary)] text-white hover:bg-[#172554]">
          {t('backHome')}
        </Link>
      </div>
    </div>
  );
}
