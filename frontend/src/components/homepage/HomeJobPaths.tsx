import { useTranslations } from 'next-intl';
import { ArrowUpRight, Layers3, Workflow, PackageCheck } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const paths = [
  { key: 'build', href: '/services', icon: Layers3 },
  { key: 'workflow', href: '/contact?intent=workflow-integration', icon: Workflow },
  { key: 'evaluate', href: '/products', icon: PackageCheck },
] as const;

export function HomeJobPaths() {
  const t = useTranslations('home.jobPaths');

  return (
    <section className="home-section-alt py-14 sm:py-16" aria-labelledby="job-paths-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
          <header>
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--secondary)]">
              <span className="h-px w-8 bg-[var(--accent)]" aria-hidden="true" />
              {t('kicker')}
            </p>
            <h2 id="job-paths-heading" className="mt-4 max-w-md text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl">
              {t('title')}
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
              {t('subtitle')}
            </p>
          </header>

          <ul className="grid divide-y divide-slate-300 border-y border-slate-300 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {paths.map(({ key, href, icon: Icon }) => (
              <li key={key}>
                <Link
                  href={href}
                  className="group flex h-full min-h-56 flex-col p-5 transition-colors hover:bg-white focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary)] sm:p-6"
                >
                  <Icon className="h-5 w-5 text-[var(--secondary)]" aria-hidden="true" />
                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    {t(`${key}.label`)}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold leading-snug text-slate-950">
                    {t(`${key}.title`)}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{t(`${key}.description`)}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-semibold text-[var(--primary)]">
                    {t('cta')}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
