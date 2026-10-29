import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/homepage/SectionHeading';
import type { HomeAdvantage } from '@/lib/homepage-content';

interface HomeAdvantagesProps {
  advantages: HomeAdvantage[];
}

export function HomeAdvantages({ advantages }: HomeAdvantagesProps) {
  const t = useTranslations('home.advantages');
  if (advantages.length === 0) return null;

  const [lead, ...rest] = advantages;

  return (
    <section className="hp-v5-section hp-v5-section--alt" aria-labelledby="advantages-heading">
      <div className="hp-v5-container">
        <SectionHeading kicker={t('kicker')} titleId="advantages-heading" title={t('title')} className="mb-8" />
        <div className="hp-v5-advantages">
          <div className="hp-v5-advantages__lead">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">{t('leadLabel')}</p>
            <h3 className="dn-display mt-4 text-3xl text-white sm:text-4xl">{lead.title}</h3>
            <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--on-primary-muted)]">
              {lead.description}
            </p>
          </div>
          {rest.length > 0 && (
            <ul className="hp-v5-advantages__list">
              {rest.map((item) => (
                <li key={item.title} className="hp-v5-advantages__item">
                  <h4 className="text-base font-semibold text-[var(--foreground)]">{item.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
