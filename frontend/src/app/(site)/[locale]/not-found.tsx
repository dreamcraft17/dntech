import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('layout.notFound');

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-4">
      <div className="text-center">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-teal-700">DN Tech</p>
        <h1 className="mt-3 text-6xl font-bold tracking-tight text-slate-950">404</h1>
        <p className="mt-4 text-lg text-gray-600">{t('title')}</p>
        <Link href="/" className="mt-6 inline-block border border-blue-900 bg-blue-900 px-6 py-3 text-white transition-colors hover:bg-blue-800">
          {t('backHome')}
        </Link>
      </div>
    </div>
  );
}
