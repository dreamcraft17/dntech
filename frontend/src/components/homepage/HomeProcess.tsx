import { SectionHeading } from '@/components/homepage/SectionHeading';
import type { HomeStep } from '@/lib/homepage-content';

interface HomeProcessProps {
  steps: HomeStep[];
}

export function HomeProcess({ steps }: HomeProcessProps) {
  return (
    <section id="cara-kerja" className="home-section py-section scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Proses Kerja"
          title="Gimana Cara Kerjanya?"
          subtitle="Proses kerja yang jelas — dari konsultasi awal hingga launch & support"
        />
        <ol className="mx-auto grid max-w-5xl border-y border-slate-300 sm:grid-cols-2 sm:divide-x sm:divide-slate-300">
          {steps.map((step) => {
            return (
              <li key={step.step} className="border-b border-slate-300 p-6 last:border-b-0 sm:p-7 sm:odd:border-b sm:even:border-b lg:p-8">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-3xl font-bold leading-none text-[var(--secondary)]">0{step.step}</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Langkah {step.step}</span>
                </div>
                <h3 className="mt-8 text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-gray-600">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
