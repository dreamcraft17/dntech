'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { getApiUrl } from '@/lib/api';

type Translate = ReturnType<typeof useTranslations>;

function buildSchema(t: Translate) {
  return z.object({
    name: z.string().min(1, t('forms.contact.errors.nameRequired')),
    email: z.string().email(t('forms.contact.errors.emailInvalid')),
    phone: z.string().optional(),
    subject: z.string().optional(),
    message: z.string().min(10, t('forms.contact.errors.messageMin')),
    honeypot: z.string().optional(),
  });
}

type FormData = z.infer<ReturnType<typeof buildSchema>>;

interface ContactFormProps {
  defaultSubject?: string;
}

export function ContactForm({ defaultSubject }: ContactFormProps) {
  const t = useTranslations('pages');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const schema = useMemo(() => buildSchema(t), [t]);
  const subjectOptions = useMemo(
    () =>
      (['general', 'service', 'partnership', 'other'] as const).map((key) => ({
        value: t(`forms.contact.subjects.${key}`),
        label: t(`forms.contact.subjects.${key}`),
      })),
    [t],
  );
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { subject: defaultSubject || t('forms.contact.subjects.general') },
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
      if (!json.success) throw new Error(json.error?.message || t('forms.contact.errors.sendFailed'));
      setSuccess(true);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('forms.contact.errors.generic'));
    }
  }

  if (success) {
    return (
      <Alert variant="success" title={t('forms.contact.successTitle')} className="text-center">
        <p>{t('forms.contact.successBody')}</p>
        <Button className="mt-4" variant="outline" onClick={() => setSuccess(false)}>
          {t('forms.contact.sendAnother')}
        </Button>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}
      <input type="text" {...register('honeypot')} className="hidden" tabIndex={-1} autoComplete="off" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label={t('forms.contact.nameLabel')} {...register('name')} error={errors.name?.message} required />
        <Input label={t('forms.contact.emailLabel')} type="email" {...register('email')} error={errors.email?.message} required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label={t('forms.contact.phoneLabel')} type="tel" {...register('phone')} />
        <Select label={t('forms.contact.subjectLabel')} options={subjectOptions} {...register('subject')} />
      </div>
      <Textarea
        label={t('forms.contact.messageLabel')}
        rows={5}
        {...register('message')}
        error={errors.message?.message}
        required
      />
      <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto">
        {t('forms.contact.submit')}
      </Button>
    </form>
  );
}
