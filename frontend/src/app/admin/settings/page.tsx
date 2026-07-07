'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch<Record<string, unknown>>('/admin/settings').then((data) => {
      setSettings({
        companyName: String(data.companyName || ''),
        tagline: String(data.tagline || ''),
        companyEmail: String(data.companyEmail || ''),
        companyPhone: String(data.companyPhone || ''),
        companyAddress: String(data.companyAddress || ''),
        primaryColor: String(data.primaryColor || '#2563eb'),
        googleAnalyticsId: String(data.googleAnalyticsId || ''),
        calendlyUrl: String(data.calendlyUrl || ''),
        leadMagnetUrl: String(data.leadMagnetUrl || ''),
        crispWebsiteId: String(data.crispWebsiteId || ''),
        trustBadges: JSON.stringify(data.trustBadges || [], null, 2),
        clientLogos: JSON.stringify(data.clientLogos || [], null, 2),
        termsContent: String(data.termsContent || ''),
        privacyContent: String(data.privacyContent || ''),
      });
    }).catch(console.error);
  }, []);

  async function save() {
    setLoading(true);
    setSaved(false);
    try {
      let trustBadges = [];
      let clientLogos = [];
      try { trustBadges = JSON.parse(settings.trustBadges || '[]'); } catch { /* ignore */ }
      try { clientLogos = JSON.parse(settings.clientLogos || '[]'); } catch { /* ignore */ }

      await apiFetch('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          companyName: settings.companyName,
          tagline: settings.tagline,
          companyEmail: settings.companyEmail,
          companyPhone: settings.companyPhone,
          companyAddress: settings.companyAddress,
          primaryColor: settings.primaryColor,
          googleAnalyticsId: settings.googleAnalyticsId,
          calendlyUrl: settings.calendlyUrl,
          leadMagnetUrl: settings.leadMagnetUrl,
          crispWebsiteId: settings.crispWebsiteId,
          trustBadges,
          clientLogos,
          termsContent: settings.termsContent,
          privacyContent: settings.privacyContent,
        }),
      });
      setSaved(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Pengaturan Situs</h1>
      {saved && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">Pengaturan berhasil disimpan!</div>}

      <div className="space-y-6 max-w-2xl">
        <Card title="Umum">
          <div className="space-y-4">
            <Input label="Nama Perusahaan" value={settings.companyName} onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} />
            <Input label="Slogan" value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} />
            <Input label="Email" value={settings.companyEmail} onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })} />
            <Input label="Telepon" value={settings.companyPhone} onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })} />
            <Input label="Alamat" value={settings.companyAddress} onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })} />
            <Input label="Warna Utama" type="color" value={settings.primaryColor} onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })} />
          </div>
        </Card>

        <Card title="Kepercayaan & Konversi">
          <div className="space-y-4">
            <Input label="URL Calendly" value={settings.calendlyUrl} onChange={(e) => setSettings({ ...settings, calendlyUrl: e.target.value })} placeholder="https://calendly.com/..." />
            <Input label="URL Lead Magnet" value={settings.leadMagnetUrl} onChange={(e) => setSettings({ ...settings, leadMagnetUrl: e.target.value })} />
            <Input label="ID Situs Web Crisp Chat" value={settings.crispWebsiteId} onChange={(e) => setSettings({ ...settings, crispWebsiteId: e.target.value })} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
            <Textarea label="Lencana Kepercayaan (JSON)" rows={5} value={settings.trustBadges} onChange={(e) => setSettings({ ...settings, trustBadges: e.target.value })} className="font-mono text-xs" />
            <Textarea label="Logo Klien (JSON)" rows={5} value={settings.clientLogos} onChange={(e) => setSettings({ ...settings, clientLogos: e.target.value })} className="font-mono text-xs" />
          </div>
        </Card>

        <Card title="SEO">
          <Input label="ID Google Analytics" value={settings.googleAnalyticsId} onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })} />
        </Card>

        <Card title="Hukum">
          <Textarea label="Syarat Layanan (HTML)" rows={6} value={settings.termsContent} onChange={(e) => setSettings({ ...settings, termsContent: e.target.value })} />
          <Textarea label="Kebijakan Privasi (HTML)" rows={6} value={settings.privacyContent} onChange={(e) => setSettings({ ...settings, privacyContent: e.target.value })} className="mt-4" />
        </Card>

        <Button onClick={save} loading={loading}>Simpan Pengaturan</Button>
      </div>
    </div>
  );
}
