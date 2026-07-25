'use client';

import { useState } from 'react';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Calculator } from 'lucide-react';
import {
  DEV_RATES_IDR,
  IN_HOUSE_RATE_IDR,
  formatIDR,
  formatIDRPerHour,
  formatIDRRange,
} from '@/lib/currency';

const DEFAULT_DEV_RATES_IDR = {
  junior: 150_000,
  mid: 250_000,
  senior: 400_000,
  lead: 550_000,
} as const;

const COMPLEXITY: Record<string, number> = {
  simple: 1, moderate: 1.5, complex: 2.5, enterprise: 4,
};

const SENIORITY_OPTIONS = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Menengah' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead/Arsitek' },
] as const;

export function ROICalculator() {
  const rates = DEV_RATES_IDR ?? DEFAULT_DEV_RATES_IDR;
  const seniorityOptions = SENIORITY_OPTIONS.map((option) => ({
    value: option.value,
    label: `${option.label} (${formatIDRPerHour(rates[option.value])})`,
  }));
  const [teamSize, setTeamSize] = useState('3');
  const [seniority, setSeniority] = useState('mid');
  const [complexity, setComplexity] = useState('moderate');
  const [months, setMonths] = useState('6');
  const [result, setResult] = useState<{ min: number; max: number; savings: number } | null>(null);

  function calculate() {
    const size = parseInt(teamSize);
    const rate = rates[seniority as keyof typeof rates] || rates.mid;
    const mult = COMPLEXITY[complexity] || 1.5;
    const duration = parseInt(months);
    const hoursPerMonth = 160;
    const base = size * rate * hoursPerMonth * duration * mult;
    const min = Math.round(base * 0.85);
    const max = Math.round(base * 1.15);
    const inHouseCost = size * IN_HOUSE_RATE_IDR * hoursPerMonth * duration * 1.3;
    const savings = Math.round(inHouseCost - ((min + max) / 2));
    setResult({ min, max, savings: Math.max(savings, 0) });
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <Calculator className="h-5 w-5 text-blue-900" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Estimasi Biaya Proyek</h2>
          <p className="text-sm text-gray-500">Dapatkan perkiraan anggaran proyek Anda dalam Rupiah</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Ukuran Tim" type="number" min="1" max="20" value={teamSize} onChange={(e) => setTeamSize(e.target.value)} />
        <Select label="Level Senioritas" value={seniority} onChange={(e) => setSeniority(e.target.value)}
          options={seniorityOptions} />
        <Select label="Kompleksitas Proyek" value={complexity} onChange={(e) => setComplexity(e.target.value)}
          options={[
            { value: 'simple', label: 'Sederhana (landing page, CRUD)' },
            { value: 'moderate', label: 'Sedang (web app, integrasi)' },
            { value: 'complex', label: 'Kompleks (sistem enterprise)' },
            { value: 'enterprise', label: 'Enterprise (multi-sistem)' },
          ]} />
        <Input label="Durasi (bulan)" type="number" min="1" max="24" value={months} onChange={(e) => setMonths(e.target.value)} />
      </div>

      <Button onClick={calculate} className="mt-6 w-full">Hitung Estimasi</Button>

      {result && (
        <Alert variant="info" title="Perkiraan Biaya Proyek" className="mt-6">
          <div className="text-3xl font-bold text-blue-900">
            {formatIDRRange(result.min, result.max)}
          </div>
          {result.savings > 0 && (
            <p className="mt-2 text-sm text-green-700">
              Potensi penghematan vs tim in-house: ~{formatIDR(result.savings)}
            </p>
          )}
          <p className="mt-3 text-xs text-gray-500">
            * Ini perkiraan kasar. Hubungi kami untuk proposal detail sesuai kebutuhan Anda.
          </p>
          <Button
            href={`/contact?budget=${result.min}-${result.max}&team=${teamSize}&months=${months}`}
            size="sm"
            className="mt-4"
          >
            Minta penawaran detail →
          </Button>
        </Alert>
      )}
    </Card>
  );
}
