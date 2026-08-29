import { Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/homepage/SectionHeading';
import type { HomeAdvantage } from '@/lib/homepage-content';

interface HomeAdvantagesProps {
  advantages: HomeAdvantage[];
}

export function HomeAdvantages({ advantages }: HomeAdvantagesProps) {
  return (
    <section className="bg-surface py-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Kenapa Pilih DN Tech?" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {advantages.map((item) => (
            <Card key={item.title} className="h-full">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-teal-50">
                <Check className="h-5 w-5 text-teal-600" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
