'use client';

import { useState } from 'react';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { getApiUrl } from '@/lib/api';
import { Mail } from 'lucide-react';

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [industry, setIndustry] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/newsletter/subscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, industry: industry || undefined }),
      });
      const json = await res.json();
      if (json.success) { setSuccess(true); setEmail(''); }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Alert variant="success">✓ Cek inbox Anda untuk email konfirmasi newsletter.</Alert>
    );
  }

  if (compact) {
    return (
      <form onSubmit={subscribe} className="flex gap-2">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          placeholder="email@perusahaan.com"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-900 focus:outline-none" />
        <Button type="submit" loading={loading} size="sm">Langganan</Button>
      </form>
    );
  }

  return (
    <form onSubmit={subscribe} className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="h-5 w-5 text-blue-900" />
        <h3 className="font-semibold text-gray-900">Langganan newsletter</h3>
      </div>
      <p className="text-sm text-gray-600">Dapatkan insight teknologi enterprise, studi kasus, dan tren industri.</p>
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Select label="Industri (opsional)" value={industry} onChange={(e) => setIndustry(e.target.value)}
        options={[
          { value: '', label: 'Pilih industri...' },
          { value: 'finance', label: 'Keuangan & Perbankan' },
          { value: 'retail', label: 'Ritel & E-Commerce' },
          { value: 'manufacturing', label: 'Manufaktur' },
          { value: 'healthcare', label: 'Kesehatan' },
          { value: 'technology', label: 'Teknologi' },
          { value: 'other', label: 'Lainnya' },
        ]} />
      <Button type="submit" loading={loading} className="w-full">Langganan</Button>
    </form>
  );
}
