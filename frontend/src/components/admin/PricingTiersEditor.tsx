'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Input, Select, Textarea } from '@/components/ui/Input';
import type { PricingTier } from '@/types';

interface PricingTiersEditorProps {
  tiers: PricingTier[];
  onChange: (tiers: PricingTier[]) => void;
}

function emptyTier(): PricingTier {
  return {
    id: `tier-${Date.now()}`,
    name: '',
    tagline: '',
    popular: false,
    featured: false,
    pricing: { amount: 0, currency: 'IDR', billingPeriod: 'per bulan', description: '' },
    features: [],
    cta: { label: 'Mulai Sekarang', url: '', type: 'trial' },
  };
}

export function PricingTiersEditor({ tiers, onChange }: PricingTiersEditorProps) {
  function updateTier(index: number, patch: Partial<PricingTier>) {
    const updated = [...tiers];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  }

  function updateTierFeatureText(index: number, text: string) {
    updateTier(index, { features: text.split('\n').map((f) => f.trim()).filter(Boolean) });
  }

  function addTier() {
    onChange([...tiers, emptyTier()]);
  }

  function removeTier(index: number) {
    onChange(tiers.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      {tiers.map((tier, i) => (
        <fieldset key={tier.id || i} className="rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Tier {i + 1}</span>
            <button type="button" onClick={() => removeTier(i)} className="text-gray-400 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="ID (slug tier)"
              value={tier.id}
              onChange={(e) => updateTier(i, { id: e.target.value })}
              placeholder="starter"
            />
            <Input
              label="Nama Tier"
              value={tier.name}
              onChange={(e) => updateTier(i, { name: e.target.value })}
              placeholder="Starter"
            />
            <Input
              label="Tagline"
              value={tier.tagline || ''}
              onChange={(e) => updateTier(i, { tagline: e.target.value })}
              placeholder="Untuk 1-50 karyawan"
            />
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2 text-sm text-gray-800">
                <input type="checkbox" checked={!!tier.popular} onChange={(e) => updateTier(i, { popular: e.target.checked })} />
                Populer
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-800">
                <input type="checkbox" checked={!!tier.featured} onChange={(e) => updateTier(i, { featured: e.target.checked })} />
                Featured
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Harga (angka, 0 = gratis, kosongkan = custom)"
              type="number"
              value={tier.pricing.amount ?? ''}
              onChange={(e) => updateTier(i, {
                pricing: { ...tier.pricing, amount: e.target.value === '' ? null : Number(e.target.value) },
              })}
            />
            <Select
              label="Mata Uang"
              value={tier.pricing.currency}
              onChange={(e) => updateTier(i, { pricing: { ...tier.pricing, currency: e.target.value } })}
              options={[{ value: 'IDR', label: 'IDR' }, { value: 'USD', label: 'USD' }]}
            />
            <Input
              label="Periode Billing"
              value={tier.pricing.billingPeriod || ''}
              onChange={(e) => updateTier(i, { pricing: { ...tier.pricing, billingPeriod: e.target.value } })}
              placeholder="per karyawan per bulan"
            />
          </div>
          <Input
            label="Deskripsi Harga (opsional)"
            value={tier.pricing.description || ''}
            onChange={(e) => updateTier(i, { pricing: { ...tier.pricing, description: e.target.value } })}
            placeholder="30 karyawan = IDR 600K/bulan"
          />

          <Textarea
            label="Fitur (satu per baris)"
            rows={5}
            value={tier.features.join('\n')}
            onChange={(e) => updateTierFeatureText(i, e.target.value)}
            placeholder={'Payroll otomatis\nAttendance & leave\nEmail support'}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Label CTA"
              value={tier.cta.label}
              onChange={(e) => updateTier(i, { cta: { ...tier.cta, label: e.target.value } })}
              placeholder="Coba Sekarang"
            />
            <Input
              label="URL CTA"
              value={tier.cta.url}
              onChange={(e) => updateTier(i, { cta: { ...tier.cta, url: e.target.value } })}
              placeholder="https://..."
            />
            <Select
              label="Tipe CTA"
              value={tier.cta.type || 'trial'}
              onChange={(e) => updateTier(i, { cta: { ...tier.cta, type: e.target.value } })}
              options={[
                { value: 'trial', label: 'Trial' },
                { value: 'demo', label: 'Demo' },
                { value: 'contact', label: 'Kontak' },
              ]}
            />
          </div>
        </fieldset>
      ))}

      <button
        type="button"
        onClick={addTier}
        className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-blue-900 hover:text-blue-900"
      >
        <Plus className="h-4 w-4" /> Tambah Tier
      </button>
    </div>
  );
}
