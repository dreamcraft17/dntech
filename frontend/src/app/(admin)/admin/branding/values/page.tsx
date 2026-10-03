import AdminCrudPage from '@/components/admin/AdminCrudPage';

export default function BrandingValuesAdminPage() {
  return (
    <AdminCrudPage
      title="Branding — Core Values"
      endpoint="branding/values"
      defaultItem={{ name: '', description: '', iconName: 'CheckCircle', order: 0 }}
      fields={[
        { key: 'name', label: 'Nama', required: true },
        { key: 'description', label: 'Deskripsi', type: 'textarea', required: true },
        { key: 'iconName', label: 'Nama Icon Lucide', required: true },
        { key: 'order', label: 'Urutan', type: 'number' },
      ]}
    />
  );
}
