'use client';

import { useState } from 'react';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
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
      <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700 text-center">
        ✓ You are subscribed! Check your inbox for a welcome email.
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={subscribe} className="flex gap-2">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          placeholder="your@email.com"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        <Button type="submit" loading={loading} size="sm">Subscribe</Button>
      </form>
    );
  }

  return (
    <form onSubmit={subscribe} className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-slate-900">Subscribe to our newsletter</h3>
      </div>
      <p className="text-sm text-slate-600">Get insights on enterprise technology, case studies, and industry trends.</p>
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Select label="Industry (optional)" value={industry} onChange={(e) => setIndustry(e.target.value)}
        options={[
          { value: '', label: 'Select industry...' },
          { value: 'finance', label: 'Finance & Banking' },
          { value: 'retail', label: 'Retail & E-Commerce' },
          { value: 'manufacturing', label: 'Manufacturing' },
          { value: 'healthcare', label: 'Healthcare' },
          { value: 'technology', label: 'Technology' },
          { value: 'other', label: 'Other' },
        ]} />
      <Button type="submit" loading={loading} className="w-full">Subscribe</Button>
    </form>
  );
}
