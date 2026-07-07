import AdminCrudPage from '@/components/admin/AdminCrudPage';

export default function AdminTestimonialsPage() {
  return (
    <AdminCrudPage
      title="Testimonials"
      endpoint="testimonials"
      defaultItem={{ clientName: '', company: '', position: '', quote: '', rating: 5, isApproved: false }}
      fields={[
        { key: 'clientName', label: 'Client Name', required: true },
        { key: 'company', label: 'Company' },
        { key: 'position', label: 'Position' },
        { key: 'quote', label: 'Quote', type: 'textarea', required: true },
        { key: 'rating', label: 'Rating (1-5)', type: 'number' },
      ]}
    />
  );
}
