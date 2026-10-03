'use client';

import { useCallback, useEffect, useState } from 'react';
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

  const load = useCallback(async () => {
    const data = await apiFetch<AdminUser[]>('/admin/users');
    setUsers(data);
  }, []);

  useEffect(() => {
    if (currentUser?.role !== 'SuperAdmin') return;

    const timeoutId = setTimeout(() => {
      load().catch(console.error);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [currentUser?.role, load]);

  if (currentUser?.role !== 'SuperAdmin') {
    return <p className="text-gray-500">Akses ditolak. Hanya SuperAdmin.</p>;
  }

  async function create() {
    await apiFetch('/admin/users', { method: 'POST', body: JSON.stringify(form) });
    setCreating(false);
    setForm({ name: '', email: '', password: '', role: 'Viewer' });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Nonaktifkan pengguna ini?')) return;
    await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
        <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Tambah Pengguna</Button>
      </div>

      {creating && (
        <Card className="mb-6">
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold">Pengguna Baru</h2>
            <button onClick={() => setCreating(false)}><X className="h-5 w-5 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label="Kata Sandi" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Select label="Peran" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              options={[
                { value: 'SuperAdmin', label: 'Super Admin' },
                { value: 'ContentManager', label: 'Manajer Konten' },
                { value: 'Editor', label: 'Editor' },
                { value: 'Viewer', label: 'Pengamat' },
              ]} />
          </div>
          <Button className="mt-4" onClick={create}>Buat Pengguna</Button>
        </Card>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nama</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Peran</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{u.role}</span></td>
                <td className="px-4 py-3 text-right">
                  {u.id !== currentUser?.id && (
                    <button onClick={() => remove(u.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
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
