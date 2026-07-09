'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/lib/utils';
import { getApiUrl } from '@/lib/api';
import { BUDGET_OPTIONS } from '@/lib/currency';
import { Check } from 'lucide-react';
import Link from 'next/link';

const PROJECT_TYPES = [
  { value: '', label: 'Pilih jenis proyek...' },
  { value: 'custom-app', label: 'Aplikasi Kustom' },
  { value: 'consulting', label: 'Konsultasi IT' },
  { value: 'maintenance', label: 'Pemeliharaan & Support' },
  { value: 'other', label: 'Lainnya' },
];

const TIMELINE_OPTIONS = [
  { value: '', label: 'Pilih timeline...' },
  { value: 'asap', label: 'Segera (ASAP)' },
  { value: '1-3mo', label: '1–3 bulan' },
  { value: '3-6mo', label: '3–6 bulan' },
  { value: 'flexible', label: 'Fleksibel' },
];

const STEPS = ['Info Kontak', 'Detail Proyek', 'Konfirmasi'];

interface FormData {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  projectType: string;
  serviceType?: string;
  budgetRange?: string;
  timeline: string;
  message: string;
  consent: boolean;
  honeypot?: string;
}

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

  const { register, handleSubmit, trigger, formState: { errors }, getValues, control } = useForm<FormData>({
    defaultValues: {
      serviceType: defaultService || '',
      projectType: '',
      timeline: '',
      consent: false,
    },
  });

  const values = useWatch({ control });

  useEffect(() => {
    if (servicesProp?.length) {
      const timeoutId = setTimeout(() => {
        setServiceOptions(servicesProp);
      }, 0);

      return () => clearTimeout(timeoutId);
    }

    let ignore = false;
    fetch(getApiUrl('/services'))
      .then((res) => res.json())
      .then((json) => {
        if (ignore) return;
        const services = (json.data || []) as { slug: string; name: string }[];
        setServiceOptions(services.map((s) => ({ value: s.slug, label: s.name })));
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, [servicesProp]);

  async function validateStep(s: number) {
    if (s === 0) return trigger(['name', 'email']);
    if (s === 1) return trigger(['projectType', 'timeline', 'message']);
    return trigger(['consent']);
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
    if (!data.consent) return;
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/leads'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          source,
          pageSource: pageSource || (typeof window !== 'undefined' ? window.location.pathname : '/contact'),
        }),
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

  const projectLabel = PROJECT_TYPES.find((o) => o.value === values.projectType)?.label || values.projectType;
  const timelineLabel = TIMELINE_OPTIONS.find((o) => o.value === values.timeline)?.label || values.timeline;
  const serviceLabel = serviceOptions.find((o) => o.value === values.serviceType)?.label || values.serviceType || '—';
  const budgetLabel = BUDGET_OPTIONS.find((o) => o.value === values.budgetRange)?.label || 'Tidak disebutkan';

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium shrink-0',
              i < step ? 'bg-green-600 text-white' : i === step ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-500'
            )}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn('ml-2 text-xs font-medium hidden sm:block', i === step ? 'text-blue-900' : 'text-gray-500')}>{label}</span>
            {i < STEPS.length - 1 && <div className={cn('flex-1 h-0.5 mx-2', i < step ? 'bg-green-600' : 'bg-gray-200')} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="text" {...register('honeypot')} className="hidden" tabIndex={-1} autoComplete="off" />

        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nama Lengkap" {...register('name', { required: 'Nama wajib diisi' })} error={errors.name?.message} required />
              <Input label="Email Kerja" type="email" {...register('email', { required: 'Email wajib diisi' })} error={errors.email?.message || emailError} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Telepon" type="tel" {...register('phone')} />
              <Input label="Nama Perusahaan" {...register('companyName')} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Select
              label="Jenis Proyek"
              options={PROJECT_TYPES}
              {...register('projectType', { required: 'Pilih jenis proyek' })}
              error={errors.projectType?.message}
              required
            />
            {serviceOptions.length > 0 && (
              <Select
                label="Layanan yang Diminati (opsional)"
                options={[{ value: '', label: 'Pilih layanan...' }, ...serviceOptions]}
                {...register('serviceType')}
              />
            )}
            <Select
              label="Kisaran Anggaran (opsional)"
              options={[{ value: '', label: 'Lebih baik tidak disebutkan' }, ...BUDGET_OPTIONS]}
              {...register('budgetRange')}
            />
            <Select
              label="Timeline Proyek"
              options={TIMELINE_OPTIONS}
              {...register('timeline', { required: 'Pilih timeline' })}
              error={errors.timeline?.message}
              required
            />
            <Textarea
              label="Deskripsi Proyek"
              rows={5}
              {...register('message', {
                required: 'Ceritakan proyek Anda (min. 50 karakter)',
                minLength: { value: 50, message: 'Minimal 50 karakter' },
                maxLength: { value: 500, message: 'Maksimal 500 karakter' },
              })}
              error={errors.message?.message}
              required
              placeholder="Jelaskan tujuan, kebutuhan, dan ekspektasi proyek Anda..."
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4 space-y-2 text-sm">
              <p><span className="font-medium text-gray-900">Nama:</span> {values.name}</p>
              <p><span className="font-medium text-gray-900">Email:</span> {values.email}</p>
              {values.phone && <p><span className="font-medium text-gray-900">Telepon:</span> {values.phone}</p>}
              {values.companyName && <p><span className="font-medium text-gray-900">Perusahaan:</span> {values.companyName}</p>}
              <p><span className="font-medium text-gray-900">Jenis proyek:</span> {projectLabel}</p>
              <p><span className="font-medium text-gray-900">Layanan:</span> {serviceLabel}</p>
              <p><span className="font-medium text-gray-900">Anggaran:</span> {budgetLabel}</p>
              <p><span className="font-medium text-gray-900">Timeline:</span> {timelineLabel}</p>
              <p><span className="font-medium text-gray-900">Deskripsi:</span> {values.message}</p>
            </div>
            <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
                aria-invalid={errors.consent ? true : undefined}
                aria-describedby={errors.consent ? 'consent-error' : undefined}
                {...register('consent', { required: 'Anda harus setuju untuk melanjutkan' })}
              />
              <span>
                Saya setuju untuk dihubungi tim sales DN Tech. Baca{' '}
                <Link href="/privacy" className="text-blue-900 underline">Kebijakan Privasi</Link>.
              </span>
            </label>
            {errors.consent && (
              <p id="consent-error" className="text-sm text-red-600" role="alert">
                {errors.consent.message}
              </p>
            )}
            <Alert variant="info">Tim kami akan merespons dalam 24 jam kerja.</Alert>
          </div>
        )}

        <div className="flex justify-between mt-6">
          {step > 0 ? (
            <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>Kembali</Button>
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
