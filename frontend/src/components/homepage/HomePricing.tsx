import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/homepage/SectionHeading';
import type { HomePricingPlan } from '@/lib/homepage-content';

interface HomePricingProps {
  plans: HomePricingPlan[];
}

export function HomePricing({ plans }: HomePricingProps) {
  return (
    <section className="bg-white py-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Harga & Paket"
          title="Paket Layanan Kami"
          subtitle="Harga transparan — detail akurat setelah diskusi scope di konsultasi gratis"
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className="h-full flex flex-col">
              <h3 className="font-semibold text-gray-900">{plan.name}</h3>
              <p className="mt-2 text-2xl font-bold text-blue-900">{plan.price}</p>
              {plan.timeline && (
                <p className="mt-1 text-sm text-gray-600">Timeline: {plan.timeline}</p>
              )}
              <ul className="mt-4 flex-1 space-y-2 text-sm text-gray-600">
                {plan.included.map((line) => (
                  <li key={line}>· {line}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <div className="mt-10">
          <Button href="/contact">Konsultasi untuk Quote Akurat</Button>
        </div>
      </div>
    </section>
  );
}
