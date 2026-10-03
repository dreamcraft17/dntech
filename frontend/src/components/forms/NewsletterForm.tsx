'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { getApiUrl } from '@/lib/api';
import { Mail } from 'lucide-react';

const INDUSTRY_KEYS = ['finance', 'retail', 'manufacturing', 'healthcare', 'technology', 'other'] as const;

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('pages');
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
    return <Alert variant="success">{t('forms.newsletter.success')}</Alert>;
  }

  if (compact) {
    return (
      <form onSubmit={subscribe} className="flex gap-2">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          placeholder={t('forms.newsletter.emailPlaceholder')}
          aria-label={t('forms.newsletter.emailLabel')}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-900 focus:outline-none" />
        <Button type="submit" loading={loading} size="sm" className="shrink-0 whitespace-nowrap">
          {t('forms.newsletter.submit')}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={subscribe} className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="h-5 w-5 text-blue-900" aria-hidden="true" />
        <h3 className="font-semibold text-gray-900">{t('forms.newsletter.heading')}</h3>
      </div>
      <p className="text-sm text-gray-600">{t('forms.newsletter.description')}</p>
      <Input
        label={t('forms.newsletter.emailLabel')}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Select
        label={t('forms.newsletter.industryLabel')}
        value={industry}
        onChange={(e) => setIndustry(e.target.value)}
        options={[
          { value: '', label: t('forms.newsletter.industries.placeholder') },
          ...INDUSTRY_KEYS.map((key) => ({ value: key, label: t(`forms.newsletter.industries.${key}`) })),
        ]}
      />
      <Button type="submit" loading={loading} className="w-full">{t('forms.newsletter.submit')}</Button>
    </form>
  );
}
