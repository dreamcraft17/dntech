import AdminCrudPage from '@/components/admin/AdminCrudPage';

export default function AdminBlogPage() {
  return (
    <AdminCrudPage
      title="Blog Posts"
      endpoint="blog"
      defaultItem={{ title: '', content: '', excerpt: '', category: '', status: 'draft' }}
      fields={[
        { key: 'title', label: 'Title', required: true },
        { key: 'category', label: 'Category' },
        { key: 'excerpt', label: 'Excerpt', type: 'textarea' },
        { key: 'content', label: 'Content (HTML)', type: 'textarea', required: true },
        { key: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }, { value: 'scheduled', label: 'Scheduled' }] },
      ]}
    />
  );
}
