import AdminCrudPage from '@/components/admin/AdminCrudPage';

export default function AdminPortfolioPage() {
  return (
    <AdminCrudPage
      title="Portfolio"
      endpoint="portfolio"
      defaultItem={{ title: '', description: '', clientName: '', status: 'draft', displayOrder: 0 }}
      fields={[
        { key: 'title', label: 'Title', required: true },
        { key: 'clientName', label: 'Client Name' },
        { key: 'description', label: 'Description', type: 'textarea', required: true },
        { key: 'outcomes', label: 'Outcomes', type: 'textarea' },
        { key: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Draft' }, { value: 'active', label: 'Active' }, { value: 'archived', label: 'Archived' }] },
        { key: 'displayOrder', label: 'Order', type: 'number' },
      ]}
    />
  );
}
