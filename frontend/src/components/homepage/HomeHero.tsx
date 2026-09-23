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
  return (
    <section className="bg-[var(--primary)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)] lg:items-end">
          <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold tracking-wide text-blue-100">
            <HeroKicker subtitle={content.heroSubtitle} />
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            {content.heroTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-blue-100">
            {content.heroSupporting}
          </p>
          <div className="mt-8 flex max-w-3xl flex-wrap gap-4">
            <Button href={content.heroPrimaryCta.href} size="lg" variant="inverse">
              {content.heroPrimaryCta.label} <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href={content.heroSecondaryCta.href} size="lg" variant="outline-on-dark">
              {content.heroSecondaryCta.label}
            </Button>
          </div>
          </div>

          {content.heroBadges.length > 0 && (
            <aside className="border-l border-white/30 pl-6 lg:pl-8" aria-label="Fokus layanan">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Fokus kerja</p>
              <ul className="mt-5 divide-y divide-white/15 border-y border-white/15">
                {content.heroBadges.map((badge) => (
                  <li key={badge} className="py-4 text-base font-semibold text-white">{badge}</li>
                ))}
              </ul>
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
