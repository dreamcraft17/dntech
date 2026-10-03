import AdminCrudPage from '@/components/admin/AdminCrudPage';

export default function AdminCareersPage() {
  return (
    <AdminCrudPage
      title="Karier"
      endpoint="careers"
      defaultItem={{ title: '', department: '', location: '', type: 'Full-time', description: '', status: 'active' }}
      fields={[
        { key: 'title', label: 'Judul Pekerjaan', required: true },
        { key: 'department', label: 'Departemen' },
        { key: 'location', label: 'Lokasi' },
        { key: 'type', label: 'Tipe' },
        { key: 'description', label: 'Deskripsi', type: 'textarea', required: true },
        { key: 'requirements', label: 'Persyaratan', type: 'textarea' },
        { key: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Draf' }, { value: 'active', label: 'Aktif' }, { value: 'archived', label: 'Arsip' }] },
      ]}
    />
  );
}
