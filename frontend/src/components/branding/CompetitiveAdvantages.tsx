import * as LucideIcons from 'lucide-react';
import { Shield } from 'lucide-react';
import type { CompetitiveAdvantage } from '@/lib/branding';

interface CompetitiveAdvantagesProps {
  items: CompetitiveAdvantage[];
}

export function CompetitiveAdvantages({ items }: CompetitiveAdvantagesProps) {
  if (!items.length) return null;

  return (
    <section className="py-16 bg-white border-y border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Kenapa Pilih DN Tech</h2>
          <p className="mt-2 text-gray-600">Pendekatan kerja yang kami pegang di setiap proyek.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => {
            const iconName = item.iconName || 'Shield';
            const Icon = ((LucideIcons as Record<string, unknown>)[iconName] as typeof Shield) || Shield;
            return (
              <div key={item.id} className="rounded-lg border border-gray-200 border-l-4 border-l-blue-900 p-4 bg-white">
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-blue-900/10 p-2">
                    <Icon className="h-5 w-5 text-blue-900" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    {item.description && <p className="mt-1 text-sm text-gray-600">{item.description}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
