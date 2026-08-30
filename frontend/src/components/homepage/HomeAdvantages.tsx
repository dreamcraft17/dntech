import { SectionHeading } from '@/components/homepage/SectionHeading';
import type { HomeAdvantage } from '@/lib/homepage-content';

interface HomeAdvantagesProps {
  advantages: HomeAdvantage[];
}

export function HomeAdvantages({ advantages }: HomeAdvantagesProps) {
  if (advantages.length === 0) return null;

  const [lead, ...rest] = advantages;

  return (
    <section className="bg-[var(--primary)] py-section text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading kicker="Keunggulan" title="Kenapa Pilih DN Tech?" onDark />
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.5fr)] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
              Alasan utama
            </p>
            <h3 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
              {lead.title}
            </h3>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-blue-100">
              {lead.description}
            </p>
          </div>
          {rest.length > 0 && (
            <ul className="divide-y divide-white/15">
              {rest.map((item, index) => (
                <li key={item.title} className="flex gap-6 py-8 first:pt-0">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/25 font-mono text-sm text-blue-200"
                    aria-hidden="true"
                  >
                    {String(index + 2).padStart(2, '0')}
                  </span>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{item.title}</h4>
                    <p className="mt-2 leading-relaxed text-blue-100">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
