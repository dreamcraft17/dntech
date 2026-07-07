import AdminCrudPage from '@/components/admin/AdminCrudPage';

export default function AdminFaqsPage() {
  return (
    <AdminCrudPage
      title="FAQs"
      endpoint="faqs"
      defaultItem={{ question: '', answer: '', category: 'General', displayOrder: 0, isActive: true }}
      fields={[
        { key: 'question', label: 'Question', required: true },
        { key: 'answer', label: 'Answer', type: 'textarea', required: true },
        { key: 'category', label: 'Category' },
        { key: 'displayOrder', label: 'Order', type: 'number' },
      ]}
    />
  );
}
