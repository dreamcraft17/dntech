'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Viewer' });

  async function load() {
    const data = await apiFetch<AdminUser[]>('/admin/users');
    setUsers(data);
  }

  useEffect(() => { if (currentUser?.role === 'SuperAdmin') load().catch(console.error); }, [currentUser]);

  if (currentUser?.role !== 'SuperAdmin') {
    return <p className="text-slate-500">Access denied. SuperAdmin only.</p>;
  }

  async function create() {
    await apiFetch('/admin/users', { method: 'POST', body: JSON.stringify(form) });
    setCreating(false);
    setForm({ name: '', email: '', password: '', role: 'Viewer' });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Deactivate this user?')) return;
    await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Add User</Button>
      </div>

      {creating && (
        <Card className="mb-6">
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold">New User</h2>
            <button onClick={() => setCreating(false)}><X className="h-5 w-5 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              options={[
                { value: 'SuperAdmin', label: 'SuperAdmin' },
                { value: 'ContentManager', label: 'ContentManager' },
                { value: 'Editor', label: 'Editor' },
                { value: 'Viewer', label: 'Viewer' },
              ]} />
          </div>
          <Button className="mt-4" onClick={create}>Create User</Button>
        </Card>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Role</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{u.role}</span></td>
                <td className="px-4 py-3 text-right">
                  {u.id !== currentUser?.id && (
                    <button onClick={() => remove(u.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
