import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/homepage/SectionHeading';
import type { HomePricingPlan } from '@/lib/homepage-content';

interface HomePricingProps {
  plans: HomePricingPlan[];
}

export function HomePricing({ plans }: HomePricingProps) {
  const t = useTranslations('home.pricing');
  return (
    <section className="hp-v5-section hp-v5-section--alt" aria-labelledby="pricing-heading">
      <div className="hp-v5-container">
        <SectionHeading
          kicker={t('kicker')}
          titleId="pricing-heading"
          title={t('title')}
          subtitle={t('subtitle')}
          className="mb-8"
        />
        <div className="hp-v5-pricing">
          {plans.map((plan, index) => (
            <article key={plan.name} className="hp-v5-pricing__col">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold text-[var(--foreground)]">{plan.name}</h3>
                <span className="font-mono text-xs text-[var(--muted)]">0{index + 1}</span>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-[var(--primary)]">{plan.price}</p>
              {plan.timeline && (
                <p className="mt-1 text-sm text-[var(--muted)]">{t('timeline', { value: plan.timeline })}</p>
              )}
              <ul className="mt-6 space-y-2 border-t border-[var(--border-strong)] pt-5 text-sm text-[var(--muted)]">
                {plan.included.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="text-[var(--secondary)]" aria-hidden="true">
                      —
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">{t('scopeNote')}</p>
        <div className="mt-8">
          <Button href="/contact">{t('cta')}</Button>
        </div>
      </div>
    </section>
  );
}
