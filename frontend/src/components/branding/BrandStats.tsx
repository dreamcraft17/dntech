'use client';

import { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Briefcase } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface Stat {
  id: string;
  label: string;
  value: number;
  iconName: string;
}

export function BrandStats() {
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    fetch(getApiUrl('/branding/stats'))
      .then((res) => res.json())
      .then((json) => setStats(Array.isArray(json.data) ? json.data : []))
      .catch(() => setStats([]));
  }, []);

  if (!stats.length) return null;

  return (
    <section className="bg-blue-900/5 py-12 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = ((LucideIcons as Record<string, unknown>)[stat.iconName] as typeof Briefcase) || Briefcase;
            return (
              <div key={stat.id} className="text-center">
                <Icon className="h-8 w-8 text-blue-900 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-900">{stat.value}+</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
