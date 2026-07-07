import AdminCrudPage from '@/components/admin/AdminCrudPage';

export default function AdminFaqsPage() {
  return (
    <AdminCrudPage
      title="FAQ"
      endpoint="faqs"
      defaultItem={{ question: '', answer: '', category: 'General', displayOrder: 0, isActive: true }}
      fields={[
        { key: 'question', label: 'Pertanyaan', required: true },
        { key: 'answer', label: 'Jawaban', type: 'textarea', required: true },
        { key: 'category', label: 'Kategori' },
        { key: 'displayOrder', label: 'Urutan', type: 'number' },
      ]}
    />
  );
}
