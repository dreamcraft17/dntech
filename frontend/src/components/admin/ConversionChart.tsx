'use client';

import { TrendBars } from './TrendBars';

interface FunnelStep {
  label: string;
  value: number;
}

interface ConversionChartProps {
  funnel: FunnelStep[];
  monthTrend?: [string, number][];
}

export function ConversionChart({ funnel, monthTrend }: ConversionChartProps) {
  const maxFunnel = Math.max(...funnel.map((f) => f.value), 1);

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Corong Konversi</h4>
        <div className="space-y-3">
          {funnel.map(({ label, value }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{label}</span>
                <span className="font-medium text-gray-900">{value.toLocaleString()}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-900 rounded-full transition-all"
                  style={{ width: `${Math.max((value / maxFunnel) * 100, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {monthTrend && monthTrend.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Tren Lead (30 hari)</h4>
          <TrendBars data={monthTrend} barColor="bg-green-500" />
        </div>
      )}
    </div>
  );
}
