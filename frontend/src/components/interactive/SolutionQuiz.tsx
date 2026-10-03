'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { getApiUrl } from '@/lib/api';
import { QUIZ_BUDGET_OPTIONS } from '@/lib/currency';
import { ArrowRight, CheckCircle, Mail } from 'lucide-react';

/**
 * Only the answer *values* live here — they are persisted in the leads DB and
 * must stay stable. The visible question/answer copy comes from the
 * `interactive.quiz.questions` catalog.
 */
const QUESTIONS = [
  { id: 'q1', values: ['enterprise', 'mid', 'startup'] },
  { id: 'q2', values: ['modernization', 'mvp', 'scale', 'strategy'] },
  { id: 'q3', values: ['urgent', 'medium', 'long'] },
  { id: 'q4', values: QUIZ_BUDGET_OPTIONS.map((option) => option.value) },
  { id: 'q5', values: ['erp', 'app', 'cloud', 'consulting'] },
] as const;

export function SolutionQuiz() {
  const t = useTranslations('interactive.quiz');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ result: string; recommendation: { service: string; description: string }; id?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const q = QUESTIONS[step];

  function select(value: string) {
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      submitQuiz(newAnswers);
    }
  }

  async function submitQuiz(finalAnswers: Record<string, string>, withEmail?: { email: string; name?: string }) {
    setLoading(true);
    try {
      const sessionId = sessionStorage.getItem('sessionId') || crypto.randomUUID();
      sessionStorage.setItem('sessionId', sessionId);
      const res = await fetch(getApiUrl('/quiz/submit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answers: finalAnswers, ...withEmail }),
      });
      const json = await res.json();
      if (json.success) setResult(json.data);
    } finally {
      setLoading(false);
    }
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !result) return;
    setEmailLoading(true);
    try {
      await submitQuiz(answers, { email, name: name || undefined });
      setEmailSent(true);
    } finally {
      setEmailLoading(false);
    }
  }

  if (result) {
    return (
      <Card className="max-w-2xl mx-auto p-8">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">{t('result.title')}</h2>
          <p className="mt-2 text-lg text-blue-900 font-semibold">{result.recommendation.service}</p>
          <p className="mt-2 text-gray-600">{result.recommendation.description}</p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Button
              href={`/contact?service=${encodeURIComponent(result.recommendation.service)}`}
              size="lg"
            >
              {t('result.consultation')} <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/case-studies" size="lg" variant="outline">
              {t('result.caseStudies')}
            </Button>
          </div>
        </div>

        {!emailSent ? (
          <form onSubmit={submitEmail} className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-blue-900" />
              <h3 className="font-semibold text-gray-900">{t('result.emailTitle')}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">{t('result.emailDescription')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label={t('result.nameLabel')} value={name} onChange={(e) => setName(e.target.value)} />
              <Input label={t('result.emailLabel')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" loading={emailLoading} className="mt-4 w-full">{t('result.submit')}</Button>
          </form>
        ) : (
          <Alert variant="success" className="mt-8 text-center">
            {t('result.sent')}
          </Alert>
        )}
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>{t('progress', { current: step + 1, total: QUESTIONS.length })}</span>
          <span>{t('percentDone', { percent: Math.round((step / QUESTIONS.length) * 100) })}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-900 rounded-full transition-all" style={{ width: `${(step / QUESTIONS.length) * 100}%` }} />
        </div>
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t(`questions.${q.id}.question`)}</h2>
        <div className="space-y-3">
          {q.values.map((value) => (
            <button key={value} onClick={() => select(value)} disabled={loading}
              className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm font-medium text-gray-700">
              {t(`questions.${q.id}.options.${value}`)}
            </button>
          ))}
        </div>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="mt-4 text-sm text-gray-500 hover:text-gray-700">
            {t('back')}
          </button>
        )}
      </Card>
    </div>
  );
}
