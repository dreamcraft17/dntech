import AdminCrudPage from '@/components/admin/AdminCrudPage';

export default function AdminCareersPage() {
  return (
    <AdminCrudPage
      title="Careers"
      endpoint="careers"
      defaultItem={{ title: '', department: '', location: '', type: 'Full-time', description: '', status: 'active' }}
      fields={[
        { key: 'title', label: 'Job Title', required: true },
        { key: 'department', label: 'Department' },
        { key: 'location', label: 'Location' },
        { key: 'type', label: 'Type' },
        { key: 'description', label: 'Description', type: 'textarea', required: true },
        { key: 'requirements', label: 'Requirements', type: 'textarea' },
        { key: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Draft' }, { value: 'active', label: 'Active' }, { value: 'archived', label: 'Archived' }] },
      ]}
    />
  );
}
