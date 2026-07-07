'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getApiUrl } from '@/lib/api';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
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
    defaultValues: { subject: defaultSubject || 'General Inquiry' },
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
      if (!json.success) throw new Error(json.error?.message || 'Submission failed');
      setSuccess(true);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  if (success) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center">
        <h3 className="text-lg font-semibold text-green-800">Thank you!</h3>
        <p className="mt-2 text-green-700">We received your message and will get back to you soon.</p>
        <Button className="mt-4" variant="outline" onClick={() => setSuccess(false)}>Send another message</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
      <input type="text" {...register('honeypot')} className="hidden" tabIndex={-1} autoComplete="off" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Name" {...register('name')} error={errors.name?.message} required />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Phone" type="tel" {...register('phone')} />
        <Select
          label="Subject"
          options={[
            { value: 'General Inquiry', label: 'General Inquiry' },
            { value: 'Service Inquiry', label: 'Service Inquiry' },
            { value: 'Partnership', label: 'Partnership' },
            { value: 'Other', label: 'Other' },
          ]}
          {...register('subject')}
        />
      </div>
      <Textarea label="Message" rows={5} {...register('message')} error={errors.message?.message} required />
      <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto">Send Message</Button>
    </form>
  );
}
