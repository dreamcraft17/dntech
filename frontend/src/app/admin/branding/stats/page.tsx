import AdminCrudPage from '@/components/admin/AdminCrudPage';

export default function BrandingStatsAdminPage() {
  return (
    <AdminCrudPage
      title="Branding — Stats"
      endpoint="branding/stats"
      defaultItem={{ label: '', value: 0, iconName: 'Briefcase', order: 0 }}
      fields={[
        { key: 'label', label: 'Label', required: true },
        { key: 'value', label: 'Nilai', type: 'number', required: true },
        { key: 'iconName', label: 'Nama Icon Lucide', required: true },
        { key: 'order', label: 'Urutan', type: 'number' },
      ]}
    />
  );
}
