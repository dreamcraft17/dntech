import AdminCrudPage from '@/components/admin/AdminCrudPage';

export default function AdminTeamPage() {
  return (
    <AdminCrudPage
      title="Team Members"
      endpoint="team"
      defaultItem={{ name: '', role: '', department: '', bio: '', displayOrder: 0, isActive: true }}
      fields={[
        { key: 'name', label: 'Name', required: true },
        { key: 'role', label: 'Role', required: true },
        { key: 'department', label: 'Department' },
        { key: 'email', label: 'Email' },
        { key: 'bio', label: 'Bio', type: 'textarea' },
        { key: 'displayOrder', label: 'Order', type: 'number' },
      ]}
    />
  );
}
