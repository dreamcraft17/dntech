'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getApiUrl } from '@/lib/api';

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Pesan minimal 10 karakter'),
  honeypot: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ContactFormProps {
  defaultSubject?: string;
}

export function ContactForm({ defaultSubject }: ContactFormProps) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { subject: defaultSubject || 'Pertanyaan Umum' },
  });

  async function onSubmit(data: FormData) {
    setError('');
    try {
      const res = await fetch(getApiUrl('/forms/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Gagal mengirim pesan');
      setSuccess(true);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  }

  if (success) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center">
        <h3 className="text-lg font-semibold text-green-800">Terima kasih!</h3>
        <p className="mt-2 text-green-700">Pesan Anda telah kami terima. Tim kami akan segera menghubungi Anda.</p>
        <Button className="mt-4" variant="outline" onClick={() => setSuccess(false)}>Kirim pesan lagi</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
      <input type="text" {...register('honeypot')} className="hidden" tabIndex={-1} autoComplete="off" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Nama" {...register('name')} error={errors.name?.message} required />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Telepon" type="tel" {...register('phone')} />
        <Select
          label="Subjek"
          options={[
            { value: 'Pertanyaan Umum', label: 'Pertanyaan Umum' },
            { value: 'Inquiry Layanan', label: 'Inquiry Layanan' },
            { value: 'Kemitraan', label: 'Kemitraan' },
            { value: 'Lainnya', label: 'Lainnya' },
          ]}
          {...register('subject')}
        />
      </div>
      <Textarea label="Pesan" rows={5} {...register('message')} error={errors.message?.message} required />
      <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto">Kirim Pesan</Button>
    </form>
  );
}
