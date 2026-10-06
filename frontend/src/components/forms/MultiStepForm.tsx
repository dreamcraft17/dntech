'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, useWatch } from 'react-hook-form';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/lib/utils';
import { getApiUrl } from '@/lib/api';
import { Check } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';

const PROJECT_TYPE_KEYS = [
  { value: '', key: 'placeholder' },
  { value: 'custom-app', key: 'customApp' },
  { value: 'consulting', key: 'consulting' },
  { value: 'maintenance', key: 'maintenance' },
  { value: 'other', key: 'other' },
] as const;

const TIMELINE_KEYS = [
  { value: '', key: 'placeholder' },
  { value: 'asap', key: 'asap' },
  { value: '1-3mo', key: '1-3mo' },
  { value: '3-6mo', key: '3-6mo' },
  { value: 'flexible', key: 'flexible' },
] as const;

/** Values are stored as-is on the lead record. */
const BUDGET_RANGE_KEYS = [
  { value: 'under-500jt', key: 'under500jt' },
  { value: '500jt-1m', key: '500jtTo1m' },
  { value: '1m-5m', key: '1mTo5m' },
  { value: '5m-plus', key: '5mPlus' },
] as const;

const STEP_KEYS = ['contact', 'project', 'confirm'] as const;

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
  const t = useTranslations('pages');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [serviceOptions, setServiceOptions] = useState<{ value: string; label: string }[]>(servicesProp || []);
  const router = useRouter();

  const projectTypes = useMemo(
    () => PROJECT_TYPE_KEYS.map((o) => ({ value: o.value, label: t(`forms.multiStep.projectTypes.${o.key}`) })),
    [t],
  );
  const timelineOptions = useMemo(
    () => TIMELINE_KEYS.map((o) => ({ value: o.value, label: t(`forms.multiStep.timelines.${o.key}`) })),
    [t],
  );
  const budgetOptions = useMemo(
    () => BUDGET_RANGE_KEYS.map((o) => ({ value: o.value, label: t(`forms.multiStep.budgetRanges.${o.key}`) })),
    [t],
  );
  const steps = useMemo(() => STEP_KEYS.map((key) => t(`forms.multiStep.steps.${key}`)), [t]);

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
        setEmailError(t('forms.multiStep.errors.duplicate'));
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
      if (!json.success) throw new Error(json.error?.message || t('forms.multiStep.errors.sendFailed'));
      router.push(`/thank-you?leadId=${json.data.leadId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : t('forms.multiStep.errors.generic'));
    } finally {
      setLoading(false);
    }
  }

  const projectLabel = projectTypes.find((o) => o.value === values.projectType)?.label || values.projectType;
  const timelineLabel = timelineOptions.find((o) => o.value === values.timeline)?.label || values.timeline;
  const serviceLabel = serviceOptions.find((o) => o.value === values.serviceType)?.label || values.serviceType || '—';
  const budgetLabel = budgetOptions.find((o) => o.value === values.budgetRange)?.label || t('forms.multiStep.budgetUnset');

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium shrink-0',
              i < step ? 'bg-green-600 text-white' : i === step ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-500'
            )}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn('ml-2 text-xs font-medium hidden sm:block', i === step ? 'text-blue-900' : 'text-gray-500')}>{label}</span>
            {i < steps.length - 1 && <div className={cn('flex-1 h-0.5 mx-2', i < step ? 'bg-green-600' : 'bg-gray-200')} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="text" {...register('honeypot')} className="hidden" tabIndex={-1} autoComplete="off" />

        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('forms.multiStep.nameLabel')}
                {...register('name', { required: t('forms.multiStep.errors.nameRequired') })}
                error={errors.name?.message}
                required
              />
              <Input
                label={t('forms.multiStep.emailLabel')}
                type="email"
                {...register('email', { required: t('forms.multiStep.errors.emailRequired') })}
                error={errors.email?.message || emailError}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label={t('forms.multiStep.phoneLabel')} type="tel" {...register('phone')} />
              <Input label={t('forms.multiStep.companyLabel')} {...register('companyName')} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Select
              label={t('forms.multiStep.projectTypeLabel')}
              options={projectTypes}
              {...register('projectType', { required: t('forms.multiStep.errors.projectTypeRequired') })}
              error={errors.projectType?.message}
              required
            />
            {serviceOptions.length > 0 && (
              <Select
                label={t('forms.multiStep.serviceLabel')}
                options={[{ value: '', label: t('forms.multiStep.servicePlaceholder') }, ...serviceOptions]}
                {...register('serviceType')}
              />
            )}
            <Select
              label={t('forms.multiStep.budgetLabel')}
              options={[{ value: '', label: t('forms.multiStep.budgetPlaceholder') }, ...budgetOptions]}
              {...register('budgetRange')}
            />
            <Select
              label={t('forms.multiStep.timelineLabel')}
              options={timelineOptions}
              {...register('timeline', { required: t('forms.multiStep.errors.timelineRequired') })}
              error={errors.timeline?.message}
              required
            />
            <Textarea
              label={t('forms.multiStep.messageLabel')}
              rows={5}
              {...register('message', {
                required: t('forms.multiStep.errors.messageRequired'),
                minLength: { value: 50, message: t('forms.multiStep.errors.messageMin') },
                maxLength: { value: 500, message: t('forms.multiStep.errors.messageMax') },
              })}
              error={errors.message?.message}
              required
              placeholder={t('forms.multiStep.messagePlaceholder')}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4 space-y-2 text-sm">
              <p><span className="font-medium text-gray-900">{t('forms.multiStep.summary.name')}</span> {values.name}</p>
              <p><span className="font-medium text-gray-900">{t('forms.multiStep.summary.email')}</span> {values.email}</p>
              {values.phone && <p><span className="font-medium text-gray-900">{t('forms.multiStep.summary.phone')}</span> {values.phone}</p>}
              {values.companyName && <p><span className="font-medium text-gray-900">{t('forms.multiStep.summary.company')}</span> {values.companyName}</p>}
              <p><span className="font-medium text-gray-900">{t('forms.multiStep.summary.projectType')}</span> {projectLabel}</p>
              <p><span className="font-medium text-gray-900">{t('forms.multiStep.summary.service')}</span> {serviceLabel}</p>
              <p><span className="font-medium text-gray-900">{t('forms.multiStep.summary.budget')}</span> {budgetLabel}</p>
              <p><span className="font-medium text-gray-900">{t('forms.multiStep.summary.timeline')}</span> {timelineLabel}</p>
              <p><span className="font-medium text-gray-900">{t('forms.multiStep.summary.message')}</span> {values.message}</p>
            </div>
            <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
                aria-invalid={errors.consent ? true : undefined}
                aria-describedby={errors.consent ? 'consent-error' : undefined}
                {...register('consent', { required: t('forms.multiStep.errors.consentRequired') })}
              />
              <span>
                {t.rich('forms.multiStep.consent', {
                  link: (chunks) => (
                    <Link href="/privacy" className="text-blue-900 underline">
                      {chunks}
                    </Link>
                  ),
                })}
              </span>
            </label>
            {errors.consent && (
              <p id="consent-error" className="text-sm text-red-600" role="alert">
                {errors.consent.message}
              </p>
            )}
            <Alert variant="info">{t('forms.multiStep.responseNote')}</Alert>
          </div>
        )}

        <div className="flex justify-between mt-6">
          {step > 0 ? (
            <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
              {t('forms.multiStep.back')}
            </Button>
          ) : <div />}
          {step < 2 ? (
            <Button type="button" onClick={nextStep}>{t('forms.multiStep.next')}</Button>
          ) : (
            <Button type="submit" loading={loading}>{t('forms.multiStep.submit')}</Button>
          )}
        </div>
      </form>
    </div>
  );
}
