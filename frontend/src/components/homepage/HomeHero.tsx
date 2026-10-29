import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { resolveHomeContent } from '@/lib/homepage-content';

type HomeContent = ReturnType<typeof resolveHomeContent>;

interface HomeHeroProps {
  content: HomeContent;
}

function HeroKicker({ subtitle }: { subtitle: string }) {
  if (subtitle.endsWith('.id')) {
    return (
      <>
        {subtitle.slice(0, -3)}
        <span className="text-[var(--primary)]">.id</span>
      </>
    );
  }
  return <>{subtitle}</>;
}

export function HomeHero({ content }: HomeHeroProps) {
  const t = useTranslations('home.hero');

  return (
    <header className="hp-v5-hero" aria-label={t('brandRole')}>
      <div className="hp-v5-hero__masthead">
        <div className="hp-v5-container hp-v5-hero__masthead-inner">
          <span className="hp-v5-mark">DN Tech</span>
          <span className="hp-v5-hero__masthead-rule" aria-hidden="true" />
          <span>{t('brandRole')}</span>
          <span className="ms-auto hidden sm:inline">{t('locationIndex')}</span>
        </div>
      </div>

      <div className="hp-v5-container hp-v5-hero__body">
        <div className="hp-v5-hero__copy">
          <p className="dn-kicker text-[var(--secondary)]">
            <HeroKicker subtitle={content.heroSubtitle} />
          </p>
          <h1 className="dn-display mt-4 max-w-[14ch] text-[clamp(2.25rem,5vw,3.75rem)] text-[var(--foreground)]">
            {content.heroTitle}
          </h1>
          <p className="hp-v5-hero__lede">{content.heroSupporting}</p>
          <div className="hp-v5-hero__actions">
            <Button href={content.heroPrimaryCta.href} size="lg" className="rounded-[var(--radius-card)]">
              {content.heroPrimaryCta.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button href={content.heroSecondaryCta.href} size="lg" variant="outline" className="rounded-[var(--radius-card)]">
              {content.heroSecondaryCta.label}
            </Button>
          </div>
          <p className="hp-v5-hero__promise">{t('promise')}</p>
        </div>

        {content.heroBadges.length > 0 && (
          <aside className="hp-v5-ledger" aria-label={t('asideLabel')}>
            <div className="hp-v5-ledger__head">
              <span>{t('briefLabel')}</span>
              <span className="hp-v5-ledger__ref">{t('briefRef')}</span>
            </div>
            <p className="hp-v5-ledger__intro">{t('briefIntro')}</p>
            <ul className="hp-v5-ledger__list">
              {content.heroBadges.map((badge, index) => (
                <li key={badge} className="hp-v5-ledger__row">
                  <span className="hp-v5-ledger__num">0{index + 1}</span>
                  <span>{badge}</span>
                </li>
              ))}
            </ul>
            <p className="hp-v5-ledger__foot">{t('briefFootnote')}</p>
          </aside>
        )}
      </div>
    </header>
  );
}
