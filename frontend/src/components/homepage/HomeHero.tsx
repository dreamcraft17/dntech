import Image from 'next/image';
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
    <section className="relative overflow-hidden bg-[var(--primary)] text-white">
      <Image
        src="/hero_bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        aria-hidden="true"
      />
      <div className="absolute inset-0 z-[1] bg-[var(--primary)]/55" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold tracking-wide text-blue-100">
            <HeroKicker subtitle={content.heroSubtitle} />
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            {content.heroTitle}
          </h1>
          <p className="mt-4 text-base font-medium text-blue-100 sm:text-lg">
            {content.heroBadges.join(' · ')}
          </p>
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

        {content.advantages.length > 0 && (
          <div className="mt-14 flex max-w-4xl flex-col gap-6 border-t border-white/15 pt-8 sm:flex-row sm:flex-wrap sm:items-start sm:gap-0 sm:divide-x sm:divide-white/15">
            {content.advantages.slice(0, 3).map((advantage) => (
              <div key={advantage.title} className="sm:px-8 sm:first:pl-0">
                <p className="text-base font-semibold text-white">{advantage.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
