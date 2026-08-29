import AdminCrudPage from '@/components/admin/AdminCrudPage';

export default function AdminPortfolioPage() {
  return (
    <AdminCrudPage
      title="Studi Kasus"
      endpoint="portfolio"
      defaultItem={{
        title: '', description: '', clientName: '', challenge: '', solution: '',
        testimonial: '', clientLogoUrl: '', status: 'draft', displayOrder: 0,
        metrics: {}, seoTitle: '', seoDescription: '',
      }}
      fields={[
        { key: 'title', label: 'Judul', required: true },
        { key: 'clientName', label: 'Nama Klien' },
        { key: 'description', label: 'Ringkasan', type: 'textarea', required: true },
        { key: 'challenge', label: 'Tantangan', type: 'textarea' },
        { key: 'solution', label: 'Solusi', type: 'textarea' },
        { key: 'outcomes', label: 'Hasil / Dampak', type: 'textarea' },
        { key: 'testimonial', label: 'Kutipan Klien', type: 'textarea' },
        { key: 'clientLogoUrl', label: 'URL Logo Klien' },
        { key: 'metrics', label: 'Metrik (JSON)', type: 'json', placeholder: '{"efficiency":"+40%","uptime":"99.9%"}' },
        { key: 'seoTitle', label: 'Meta Title' },
        { key: 'seoDescription', label: 'Meta Description', type: 'textarea' },
        { key: 'status', label: 'Status', type: 'select', options: [
          { value: 'draft', label: 'Draf' },
          { value: 'active', label: 'Diterbitkan' },
          { value: 'archived', label: 'Arsip' },
        ]},
        { key: 'displayOrder', label: 'Urutan', type: 'number' },
      ]}
    />
  );
}
