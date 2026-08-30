import { SectionHeading } from '@/components/homepage/SectionHeading';
import type { HomeAdvantage } from '@/lib/homepage-content';

interface HomeAdvantagesProps {
  advantages: HomeAdvantage[];
}

export function HomeAdvantages({ advantages }: HomeAdvantagesProps) {
  if (advantages.length === 0) return null;

  const [lead, ...rest] = advantages;

  return (
    <section className="bg-surface py-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Kenapa Pilih DN Tech?" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
          <div className="rounded-2xl bg-blue-900 p-8 text-white lg:sticky lg:top-24 lg:self-start">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-200">
              Alasan utama
            </p>
            <h3 className="mt-3 text-2xl font-bold leading-snug">{lead.title}</h3>
            <p className="mt-4 leading-relaxed text-blue-100">{lead.description}</p>
          </div>
          {rest.length > 0 && (
            <ul className="divide-y divide-gray-200">
              {rest.map((item, index) => (
                <li key={item.title} className="flex gap-4 py-5 first:pt-0">
                  <span
                    className="pt-1 font-mono text-sm text-gray-400"
                    aria-hidden="true"
                  >
                    {String(index + 2).padStart(2, '0')}
                  </span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
                      {item.description}
                    </p>
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
