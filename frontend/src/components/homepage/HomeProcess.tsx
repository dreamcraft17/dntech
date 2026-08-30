import { SectionHeading } from '@/components/homepage/SectionHeading';
import type { HomeStep } from '@/lib/homepage-content';

interface HomeProcessProps {
  steps: HomeStep[];
}

export function HomeProcess({ steps }: HomeProcessProps) {
  return (
    <section className="bg-white py-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Proses Kerja"
          title="Gimana Cara Kerjanya?"
          subtitle="Proses kerja yang jelas — dari konsultasi awal hingga launch & support"
        />
        <ol className="mx-auto max-w-3xl">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            return (
              <li key={step.step} className="relative flex gap-x-8 pb-12 last:pb-0">
                {!isLast && (
                  <span
                    className="absolute left-6 top-14 h-[calc(100%-2.25rem)] w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white ${
                    isLast ? 'bg-[var(--secondary)]' : 'bg-[var(--primary)]'
                  }`}
                >
                  {step.step}
                </span>
                <div className="pt-2">
                  <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-2 max-w-xl leading-relaxed text-gray-600">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
