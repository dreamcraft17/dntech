'use client';

import { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { getApiUrl } from '@/lib/api';

interface CoreValue {
  id: string;
  name: string;
  description: string;
  iconName: string;
  order: number;
}

export function CoreValues() {
  const [values, setValues] = useState<CoreValue[]>([]);

  useEffect(() => {
    fetch(getApiUrl('/branding/values'))
      .then((res) => res.json())
      .then((json) => setValues(Array.isArray(json.data) ? json.data : []))
      .catch(() => setValues([]));
  }, []);

  if (!values.length) return null;

  return (
    <section className="py-16 bg-blue-900/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Mission & Core Values</h2>
          <p className="mt-2 text-gray-600">Nilai yang membentuk cara tim DN Tech bekerja.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {values.map((value) => {
            const iconName = value.iconName || 'CheckCircle';
            const Icon = ((LucideIcons as Record<string, unknown>)[iconName] as typeof CheckCircle) || CheckCircle;
            return (
              <Card key={value.id} className="h-full border-gray-200 hover:border-blue-300 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-blue-900/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-blue-900" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{value.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{value.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
