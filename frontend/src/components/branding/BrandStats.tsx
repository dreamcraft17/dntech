import { Award, Briefcase, LucideIcon, Star, Users } from 'lucide-react';
import type { BrandStat } from '@/lib/branding';

const ICONS: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  users: Users,
  award: Award,
  star: Star,
};

interface BrandStatsProps {
  stats: BrandStat[];
}

export function BrandStats({ stats }: BrandStatsProps) {
  if (!stats.length) return null;

  return (
    <section className="bg-blue-900/5 py-12 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = ICONS[stat.icon || 'briefcase'] || Briefcase;
            return (
              <div key={`${stat.label}-${index}`} className="text-center">
                <Icon className="h-8 w-8 text-blue-900 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-900">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
