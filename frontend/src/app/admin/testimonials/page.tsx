import AdminCrudPage from '@/components/admin/AdminCrudPage';

export default function AdminTestimonialsPage() {
  return (
    <AdminCrudPage
      title="Testimonials"
      endpoint="testimonials"
      defaultItem={{ clientName: '', company: '', position: '', title: '', quote: '', videoUrl: '', rating: 5, isApproved: true }}
      fields={[
        { key: 'clientName', label: 'Client Name', required: true },
        { key: 'company', label: 'Company' },
        { key: 'position', label: 'Position' },
        { key: 'title', label: 'Headline' },
        { key: 'quote', label: 'Quote', type: 'textarea', required: true },
        { key: 'videoUrl', label: 'Video URL (YouTube/Vimeo)' },
        { key: 'rating', label: 'Rating (1-5)', type: 'number' },
        { key: 'isApproved', label: 'Published', type: 'checkbox' },
      ]}
    />
  );
}
