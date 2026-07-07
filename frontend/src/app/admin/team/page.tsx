import AdminCrudPage from '@/components/admin/AdminCrudPage';

export default function AdminTeamPage() {
  return (
    <AdminCrudPage
      title="Anggota Tim"
      endpoint="team"
      defaultItem={{ name: '', role: '', department: '', bio: '', displayOrder: 0, isActive: true }}
      fields={[
        { key: 'name', label: 'Nama', required: true },
        { key: 'role', label: 'Peran', required: true },
        { key: 'department', label: 'Departemen' },
        { key: 'email', label: 'Email' },
        { key: 'bio', label: 'Bio', type: 'textarea' },
        { key: 'displayOrder', label: 'Urutan', type: 'number' },
      ]}
    />
  );
}
