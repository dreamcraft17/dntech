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
    <section className="home-section py-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading kicker={t('kicker')} title={t('title')} subtitle={t('subtitle')} />
        <div className="grid grid-cols-1 border-y border-slate-300 md:grid-cols-3 md:divide-x md:divide-slate-300">
          {plans.map((plan, index) => (
            <article key={plan.name} className="flex h-full flex-col border-b border-slate-300 p-6 last:border-b-0 sm:p-8 md:border-b-0">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                <span className="font-mono text-xs text-slate-400">0{index + 1}</span>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-blue-900">{plan.price}</p>
              {plan.timeline && <p className="mt-1 text-sm text-gray-600">{t('timeline', { value: plan.timeline })}</p>}
              <ul className="mt-6 flex-1 space-y-2 border-t border-slate-200 pt-5 text-sm text-gray-600">
                {plan.included.map((line) => <li key={line} className="flex gap-2"><span className="text-teal-700" aria-hidden="true">—</span><span>{line}</span></li>)}
              </ul>
            </article>
          ))}
        </div>
        <div className="mt-10">
          <Button href="/contact">{t('cta')}</Button>
        </div>
      </div>
    </section>
  );
}
