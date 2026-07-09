import AdminCrudPage from '@/components/admin/AdminCrudPage';

export default function BrandingAdvantagesAdminPage() {
  return (
    <AdminCrudPage
      title="Branding — Competitive Advantages"
      endpoint="branding/advantages"
      defaultItem={{ title: '', description: '', iconName: 'Shield', order: 0 }}
      fields={[
        { key: 'title', label: 'Judul', required: true },
        { key: 'description', label: 'Deskripsi', type: 'textarea', required: true },
        { key: 'iconName', label: 'Nama Icon Lucide', required: true },
        { key: 'order', label: 'Urutan', type: 'number' },
      ]}
    />
  );
}
