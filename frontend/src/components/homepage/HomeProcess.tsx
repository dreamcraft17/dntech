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
        <ol className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.step}
              className="rounded-lg border border-gray-200 bg-surface p-6"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white">
                {step.step}
              </span>
              <h3 className="mt-4 font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
