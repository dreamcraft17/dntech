'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { getApiUrl } from '@/lib/api';
import { Check } from 'lucide-react';

const step1Schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
});

const step2Schema = z.object({
  projectType: z.string().min(1, 'Please select a project type'),
  serviceType: z.string().min(1, 'Please select a service'),
  budgetRange: z.string().optional(),
});

const step3Schema = z.object({
  message: z.string().min(10, 'Please tell us more (min 10 characters)'),
});

type FormData = z.infer<typeof step1Schema> & z.infer<typeof step2Schema> & z.infer<typeof step3Schema> & { honeypot?: string };

const STEPS = ['Contact Info', 'Project Details', 'Your Message'];

interface MultiStepFormProps {
  source?: string;
  pageSource?: string;
  defaultService?: string;
}

export function MultiStepForm({ source = 'contact-form', pageSource, defaultService }: MultiStepFormProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const router = useRouter();

  const { register, handleSubmit, trigger, formState: { errors }, getValues, watch } = useForm<FormData>({
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
        setEmailError('We already have your inquiry — our team will follow up soon.');
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
      if (!json.success) throw new Error(json.error?.message || 'Submission failed');
      router.push(`/thank-you?leadId=${json.data.leadId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Step indicators */}
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
              <Input label="Full Name" {...register('name')} error={errors.name?.message} required />
              <Input label="Work Email" type="email" {...register('email')} error={errors.email?.message || emailError} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Phone" type="tel" {...register('phone')} />
              <Input label="Company Name" {...register('companyName')} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Select label="Project Type" options={[
              { value: '', label: 'Select project type...' },
              { value: 'new-build', label: 'New Build / MVP' },
              { value: 'modernization', label: 'System Modernization' },
              { value: 'integration', label: 'Integration Project' },
              { value: 'consulting', label: 'Consulting & Strategy' },
            ]} {...register('projectType')} error={errors.projectType?.message} required />
            <Select label="Service Interested" options={[
              { value: '', label: 'Select service...' },
              { value: 'enterprise-software', label: 'Enterprise Software' },
              { value: 'web-mobile-development', label: 'Web & Mobile Development' },
              { value: 'cloud-devops', label: 'Cloud & DevOps' },
              { value: 'it-consulting', label: 'IT Consulting' },
            ]} {...register('serviceType')} error={errors.serviceType?.message} required />
            <Select label="Budget Range (optional)" options={[
              { value: '', label: 'Prefer not to say' },
              { value: 'under-50k', label: 'Under $50K' },
              { value: '50k-100k', label: '$50K - $100K' },
              { value: '100k-500k', label: '$100K - $500K' },
              { value: '500k+', label: '$500K+' },
            ]} {...register('budgetRange')} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Textarea label="Tell us about your project" rows={5} {...register('message')} error={errors.message?.message} required
              placeholder="Describe your goals, timeline, and any specific requirements..." />
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800">
              After submitting, you will receive a confirmation email and our team will respond within 1 business day.
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          {step > 0 ? (
            <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)}>Back</Button>
          ) : <div />}
          {step < 2 ? (
            <Button type="button" onClick={nextStep}>Continue</Button>
          ) : (
            <Button type="submit" loading={loading}>Submit Inquiry</Button>
          )}
        </div>
      </form>
    </div>
  );
}
