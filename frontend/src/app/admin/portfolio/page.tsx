import AdminCrudPage from '@/components/admin/AdminCrudPage';

export default function AdminPortfolioPage() {
  return (
    <AdminCrudPage
      title="Case Studies"
      endpoint="portfolio"
      defaultItem={{
        title: '', description: '', clientName: '', challenge: '', solution: '',
        testimonial: '', clientLogoUrl: '', status: 'draft', displayOrder: 0,
        metrics: {},
      }}
      fields={[
        { key: 'title', label: 'Title', required: true },
        { key: 'clientName', label: 'Client Name' },
        { key: 'description', label: 'Summary', type: 'textarea', required: true },
        { key: 'challenge', label: 'Challenge', type: 'textarea' },
        { key: 'solution', label: 'Solution', type: 'textarea' },
        { key: 'outcomes', label: 'Results / Outcomes', type: 'textarea' },
        { key: 'testimonial', label: 'Client Quote', type: 'textarea' },
        { key: 'clientLogoUrl', label: 'Client Logo URL' },
        { key: 'metrics', label: 'Metrics (JSON)', type: 'json', placeholder: '{"efficiency":"+40%","uptime":"99.9%"}' },
        { key: 'status', label: 'Status', type: 'select', options: [
          { value: 'draft', label: 'Draft' },
          { value: 'active', label: 'Published' },
          { value: 'archived', label: 'Archived' },
        ]},
        { key: 'displayOrder', label: 'Order', type: 'number' },
      ]}
    />
  );
}
