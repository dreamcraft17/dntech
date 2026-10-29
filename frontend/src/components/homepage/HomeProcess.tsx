import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/homepage/SectionHeading';
import type { HomeStep } from '@/lib/homepage-content';

interface HomeProcessProps {
  steps: HomeStep[];
}

export function HomeProcess({ steps }: HomeProcessProps) {
  const t = useTranslations('home.process');
  return (
    <section id="cara-kerja" className="hp-v5-section scroll-mt-24">
      <div className="hp-v5-container">
        <SectionHeading kicker={t('kicker')} title={t('title')} subtitle={t('subtitle')} className="mb-8" />
        <ol className="hp-v5-process list-none p-0">
          {steps.map((step) => (
            <li key={step.step} className="hp-v5-process__step">
              <div className="flex items-start justify-between gap-3">
                <span className="hp-v5-process__num">0{step.step}</span>
                <span className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                  {t('stepLabel', { step: step.step })}
                </span>
              </div>
              <h3 className="mt-6 text-base font-semibold text-[var(--foreground)]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
