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
          title="Gimana Cara Kerjanya?"
          subtitle="Proses kerja yang jelas — dari konsultasi awal hingga launch & support"
        />
        <ol className="mx-auto max-w-3xl">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            return (
              <li key={step.step} className="relative flex gap-x-6 pb-10 last:pb-0">
                {!isLast && (
                  <span
                    className="absolute left-5 top-11 h-[calc(100%-1.75rem)] w-px bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                    isLast ? 'bg-teal-600' : 'bg-blue-900'
                  }`}
                >
                  {step.step}
                </span>
                <div className="pt-1.5">
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600">
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
