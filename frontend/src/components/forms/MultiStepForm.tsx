'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { getApiUrl } from '@/lib/api';
import { BUDGET_OPTIONS } from '@/lib/currency';
import { Check } from 'lucide-react';

const step1Schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
});

const step2Schema = z.object({
  projectType: z.string().min(1, 'Pilih jenis proyek'),
  serviceType: z.string().min(1, 'Pilih layanan'),
  budgetRange: z.string().optional(),
});

const step3Schema = z.object({
  message: z.string().min(10, 'Ceritakan lebih detail (min. 10 karakter)'),
});

type FormData = z.infer<typeof step1Schema> & z.infer<typeof step2Schema> & z.infer<typeof step3Schema> & { honeypot?: string };

const STEPS = ['Info Kontak', 'Detail Proyek', 'Pesan Anda'];

interface MultiStepFormProps {
  source?: string;
  pageSource?: string;
  defaultService?: string;
  services?: { value: string; label: string }[];
}

export function MultiStepForm({ source = 'contact-form', pageSource, defaultService, services: servicesProp }: MultiStepFormProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [serviceOptions, setServiceOptions] = useState<{ value: string; label: string }[]>(servicesProp || []);
  const router = useRouter();

  useEffect(() => {
    if (servicesProp?.length) {
      setServiceOptions(servicesProp);
      return;
    }
    fetch(getApiUrl('/services'))
      .then((res) => res.json())
      .then((json) => {
        const services = (json.data || []) as { slug: string; name: string }[];
        setServiceOptions(services.map((s) => ({ value: s.slug, label: s.name })));
      })
      .catch(() => {});
  }, [servicesProp]);

  const { register, handleSubmit, trigger, formState: { errors }, getValues } = useForm<FormData>({
    defaultValues: { serviceType: defaultService || '', projectType: '' },
  });

  async function validateStep(s: number) {
    if (s === 0) return trigger(['name', 'email', 'phone', 'companyName']);
    if (s === 1) return trigger(['projectType', 'serviceType', 'budgetRange']);
    return trigger(['message']);
  }

  async function checkEmail(email: string) {
    try {
      const res = await fetch(getApiUrl('/leads/check-duplicate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (json.data?.isDuplicate) {
        setEmailError('Kami sudah menerima inquiry Anda — tim kami akan segera menghubungi.');
      } else {
        setEmailError('');
      }
    } catch { /* ignore */ }
  }

  async function nextStep() {
    const valid = await validateStep(step);
    if (!valid) return;
    if (step === 0) await checkEmail(getValues('email'));
    setStep((s) => Math.min(s + 1, 2));
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/leads'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, source, pageSource: pageSource || (typeof window !== 'undefined' ? window.location.pathname : '/contact') }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Gagal mengirim');
      router.push(`/thank-you?leadId=${json.data.leadId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium shrink-0',
              i < step ? 'bg-green-500 text-white' : i === step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
            )}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn('ml-2 text-xs font-medium hidden sm:block', i === step ? 'text-blue-600' : 'text-slate-500')}>{label}</span>
            {i < STEPS.length - 1 && <div className={cn('flex-1 h-0.5 mx-2', i < step ? 'bg-green-500' : 'bg-slate-200')} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="text" {...register('honeypot')} className="hidden" tabIndex={-1} autoComplete="off" />

        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nama Lengkap" {...register('name')} error={errors.name?.message} required />
              <Input label="Email Kerja" type="email" {...register('email')} error={errors.email?.message || emailError} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Telepon" type="tel" {...register('phone')} />
              <Input label="Nama Perusahaan" {...register('companyName')} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Select label="Jenis Proyek" options={[
              { value: '', label: 'Pilih jenis proyek...' },
              { value: 'new-build', label: 'Pembangunan Baru / MVP' },
              { value: 'modernization', label: 'Modernisasi Sistem' },
              { value: 'integration', label: 'Proyek Integrasi' },
              { value: 'consulting', label: 'Konsultasi & Strategi' },
            ]} {...register('projectType')} error={errors.projectType?.message} required />
            <Select label="Layanan yang Diminati" options={[
              { value: '', label: serviceOptions.length ? 'Pilih layanan...' : 'Belum ada layanan tersedia' },
              ...serviceOptions,
            ]} {...register('serviceType')} error={errors.serviceType?.message} required disabled={serviceOptions.length === 0} />
            <Select label="Kisaran Anggaran (opsional)" options={[
              { value: '', label: 'Lebih baik tidak disebutkan' },
              ...BUDGET_OPTIONS,
            ]} {...register('budgetRange')} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Textarea label="Ceritakan tentang proyek Anda" rows={5} {...register('message')} error={errors.message?.message} required
              placeholder="Jelaskan tujuan, timeline, dan kebutuhan spesifik proyek Anda..." />
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800">
              Setelah mengirim, Anda akan menerima email konfirmasi dan tim kami akan merespons dalam 1 hari kerja.
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          {step > 0 ? (
            <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)}>Kembali</Button>
          ) : <div />}
          {step < 2 ? (
            <Button type="button" onClick={nextStep}>Lanjut</Button>
          ) : (
            <Button type="submit" loading={loading}>Kirim Inquiry</Button>
          )}
        </div>
      </form>
    </div>
  );
}
