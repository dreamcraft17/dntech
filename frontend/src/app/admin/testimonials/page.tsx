import AdminCrudPage from '@/components/admin/AdminCrudPage';

export default function AdminTestimonialsPage() {
  return (
    <AdminCrudPage
      title="Testimoni"
      endpoint="testimonials"
      defaultItem={{ clientName: '', company: '', position: '', title: '', quote: '', videoUrl: '', rating: 5, isApproved: true }}
      fields={[
        { key: 'clientName', label: 'Nama Klien', required: true },
        { key: 'company', label: 'Perusahaan' },
        { key: 'position', label: 'Jabatan' },
        { key: 'title', label: 'Judul' },
        { key: 'quote', label: 'Kutipan', type: 'textarea', required: true },
        { key: 'videoUrl', label: 'URL Video (YouTube/Vimeo)' },
        { key: 'rating', label: 'Rating (1-5)', type: 'number' },
        { key: 'isApproved', label: 'Diterbitkan', type: 'checkbox' },
      ]}
    />
  );
}
