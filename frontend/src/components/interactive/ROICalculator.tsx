'use client';

import { useState } from 'react';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Calculator } from 'lucide-react';

const RATES: Record<string, number> = {
  junior: 50, mid: 80, senior: 120, lead: 150,
};

const COMPLEXITY: Record<string, number> = {
  simple: 1, moderate: 1.5, complex: 2.5, enterprise: 4,
};

export function ROICalculator() {
  const [teamSize, setTeamSize] = useState('3');
  const [seniority, setSeniority] = useState('mid');
  const [complexity, setComplexity] = useState('moderate');
  const [months, setMonths] = useState('6');
  const [result, setResult] = useState<{ min: number; max: number; savings: number } | null>(null);

  function calculate() {
    const size = parseInt(teamSize);
    const rate = RATES[seniority] || 80;
    const mult = COMPLEXITY[complexity] || 1.5;
    const duration = parseInt(months);
    const hoursPerMonth = 160;
    const base = size * rate * hoursPerMonth * duration * mult;
    const min = Math.round(base * 0.85);
    const max = Math.round(base * 1.15);
    const inHouseCost = size * 100 * hoursPerMonth * duration * 1.3;
    const savings = Math.round(inHouseCost - ((min + max) / 2));
    setResult({ min, max, savings: Math.max(savings, 0) });
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <Calculator className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Project Cost Estimator</h2>
          <p className="text-sm text-slate-500">Get a rough estimate for your project budget</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Team Size" type="number" min="1" max="20" value={teamSize} onChange={(e) => setTeamSize(e.target.value)} />
        <Select label="Seniority Level" value={seniority} onChange={(e) => setSeniority(e.target.value)}
          options={[
            { value: 'junior', label: 'Junior ($50/hr)' },
            { value: 'mid', label: 'Mid-level ($80/hr)' },
            { value: 'senior', label: 'Senior ($120/hr)' },
            { value: 'lead', label: 'Lead/Architect ($150/hr)' },
          ]} />
        <Select label="Project Complexity" value={complexity} onChange={(e) => setComplexity(e.target.value)}
          options={[
            { value: 'simple', label: 'Simple (landing page, CRUD)' },
            { value: 'moderate', label: 'Moderate (web app, integrations)' },
            { value: 'complex', label: 'Complex (enterprise system)' },
            { value: 'enterprise', label: 'Enterprise (multi-system)' },
          ]} />
        <Input label="Duration (months)" type="number" min="1" max="24" value={months} onChange={(e) => setMonths(e.target.value)} />
      </div>

      <Button onClick={calculate} className="mt-6 w-full">Calculate Estimate</Button>

      {result && (
        <div className="mt-6 p-6 rounded-xl bg-blue-50 border border-blue-100">
          <h3 className="font-semibold text-slate-900 mb-3">Estimated Project Cost</h3>
          <div className="text-3xl font-bold text-blue-600">
            ${result.min.toLocaleString()} – ${result.max.toLocaleString()}
          </div>
          {result.savings > 0 && (
            <p className="mt-2 text-sm text-green-700">
              Potential savings vs in-house team: ~${result.savings.toLocaleString()}
            </p>
          )}
          <p className="mt-3 text-xs text-slate-500">
            * This is a rough estimate. Contact us for a detailed proposal tailored to your needs.
          </p>
          <a
            href={`/contact?budget=${result.min}-${result.max}&team=${teamSize}&months=${months}`}
            className="mt-4 inline-block"
          >
            <Button size="sm">Get a detailed quote →</Button>
          </a>
        </div>
      )}
    </Card>
  );
}
