'use client';

import AdminCrudPage from '@/components/admin/AdminCrudPage';
import { BlogGenerator } from '@/components/admin/BlogGenerator';

export default function AdminBlogPage() {
  return (
    <AdminCrudPage
      title="Artikel Blog"
      endpoint="blog"
      defaultItem={{ title: '', content: '', excerpt: '', category: '', status: 'draft', seoTitle: '', seoDescription: '' }}
      fields={[
        { key: 'title', label: 'Judul', required: true },
        { key: 'category', label: 'Kategori' },
        { key: 'excerpt', label: 'Cuplikan', type: 'textarea' },
        { key: 'content', label: 'Konten (HTML)', type: 'textarea', required: true },
        { key: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Draf' }, { value: 'published', label: 'Diterbitkan' }, { value: 'scheduled', label: 'Terjadwal' }] },
        { key: 'seoTitle', label: 'Meta Title' },
        { key: 'seoDescription', label: 'Meta Description', type: 'textarea' },
      ]}
      renderExtraActions={({ setEditing, defaultItem }) => (
        <BlogGenerator onGenerated={(draft) => setEditing({ ...defaultItem, ...draft })} />
      )}
      publishable
    />
  );
}
