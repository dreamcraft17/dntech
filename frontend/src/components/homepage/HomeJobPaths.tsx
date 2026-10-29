import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const paths = [
  { key: 'build', href: '/services' },
  { key: 'workflow', href: '/contact?intent=workflow-integration' },
  { key: 'evaluate', href: '/products' },
] as const;

export function HomeJobPaths() {
  const t = useTranslations('home.jobPaths');

  return (
    <section className="hp-v5-section hp-v5-section--alt" aria-labelledby="job-paths-heading">
      <div className="hp-v5-container">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-12 lg:items-end">
          <header>
            <p className="dn-kicker">{t('kicker')}</p>
            <h2 id="job-paths-heading" className="dn-display mt-3 text-3xl sm:text-4xl">
              {t('title')}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--muted)]">{t('subtitle')}</p>
          </header>

          <div className="hp-v5-paths__grid">
            {paths.map(({ key, href }) => (
              <Link key={key} href={href} className="hp-v5-paths__cell group">
                <span className="hp-v5-paths__label">{t(`${key}.label`)}</span>
                <span className="hp-v5-paths__title">{t(`${key}.title`)}</span>
                <span className="hp-v5-paths__desc">{t(`${key}.description`)}</span>
                <span className="hp-v5-paths__go">
                  {t('cta')} <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
