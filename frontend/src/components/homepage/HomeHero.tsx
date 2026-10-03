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
        <span className="text-white">.id</span>
      </>
    );
  }
  return <>{subtitle}</>;
}

export function HomeHero({ content }: HomeHeroProps) {
  const t = useTranslations('home.hero');
  return (
    <section
      className="relative overflow-hidden bg-[var(--primary)] bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/hero_bg.png')" }}
    >
      <div className="absolute inset-0 bg-[#071a3e]/70" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-12 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/20 pb-4 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
          <span className="text-[var(--accent)]">DN Tech</span>
          <span className="h-px w-8 bg-white/40" aria-hidden="true" />
          <span>{t('brandRole')}</span>
          <span className="ml-auto hidden text-white/60 sm:inline">{t('locationIndex')}</span>
        </div>

        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)] lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold tracking-wide text-blue-100">
              <HeroKicker subtitle={content.heroSubtitle} />
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-[1.04] tracking-[-0.035em] text-white sm:text-5xl lg:text-7xl">
              {content.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100 sm:text-xl">
              {content.heroSupporting}
            </p>
            <div className="mt-9 flex max-w-3xl flex-wrap gap-3">
              <Button href={content.heroPrimaryCta.href} size="lg" variant="inverse" className="rounded-sm">
                {content.heroPrimaryCta.label} <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href={content.heroSecondaryCta.href} size="lg" variant="outline-on-dark" className="rounded-sm">
                {content.heroSecondaryCta.label}
              </Button>
            </div>
            <p className="mt-5 text-xs font-medium uppercase tracking-[0.12em] text-blue-200">
              {t('promise')}
            </p>
          </div>

          {content.heroBadges.length > 0 && (
            <aside className="border border-white/25 bg-[#061633]/45 p-5 sm:p-6" aria-label={t('asideLabel')}>
              <div className="flex items-center justify-between border-b border-white/20 pb-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">{t('briefLabel')}</p>
                <span className="font-mono text-xs text-white/60">{t('briefRef')}</span>
              </div>
              <p className="mt-5 text-sm leading-6 text-blue-100">{t('briefIntro')}</p>
              <ul className="mt-4 divide-y divide-white/15 border-y border-white/15">
                {content.heroBadges.map((badge, index) => (
                  <li key={badge} className="flex gap-3 py-4 text-base font-semibold text-white">
                    <span className="font-mono text-xs text-[var(--accent)]">0{index + 1}</span>
                    <span>{badge}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs leading-5 text-white/60">{t('briefFootnote')}</p>
            </aside>
          )}
        </div>

        {content.advantages.length > 0 && (
          <div className="mt-14 grid max-w-4xl border-t border-white/20 sm:grid-cols-3 sm:divide-x sm:divide-white/15">
            {content.advantages.slice(0, 3).map((advantage) => (
              <div key={advantage.title} className="border-b border-white/15 py-5 sm:border-b-0 sm:px-8 sm:first:pl-0">
                <p className="text-base font-semibold text-white">{advantage.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
