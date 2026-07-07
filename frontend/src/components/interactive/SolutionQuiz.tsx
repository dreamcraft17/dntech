'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getApiUrl } from '@/lib/api';
import { ArrowRight, CheckCircle } from 'lucide-react';

const QUESTIONS = [
  {
    id: 'q1',
    question: 'What best describes your organization?',
    options: [
      { value: 'enterprise', label: 'Large Enterprise (500+ employees)' },
      { value: 'mid', label: 'Mid-size Company (50-500 employees)' },
      { value: 'startup', label: 'Startup / SMB (<50 employees)' },
    ],
  },
  {
    id: 'q2',
    question: 'What is your primary goal?',
    options: [
      { value: 'modernization', label: 'Modernize legacy systems' },
      { value: 'mvp', label: 'Build a new product / MVP' },
      { value: 'scale', label: 'Scale existing infrastructure' },
      { value: 'strategy', label: 'Get strategic IT guidance' },
    ],
  },
  {
    id: 'q3',
    question: 'What is your timeline?',
    options: [
      { value: 'urgent', label: 'ASAP (< 3 months)' },
      { value: 'medium', label: '3-6 months' },
      { value: 'long', label: '6+ months / planning phase' },
    ],
  },
  {
    id: 'q4',
    question: 'What is your estimated budget?',
    options: [
      { value: 'small', label: 'Under $50K' },
      { value: 'medium', label: '$50K - $200K' },
      { value: 'large', label: '$200K - $500K' },
      { value: 'enterprise-budget', label: '$500K+' },
    ],
  },
  {
    id: 'q5',
    question: 'Which technology area interests you most?',
    options: [
      { value: 'erp', label: 'Enterprise Software / ERP' },
      { value: 'app', label: 'Web & Mobile Apps' },
      { value: 'cloud', label: 'Cloud & DevOps' },
      { value: 'consulting', label: 'IT Consulting' },
    ],
  },
];

export function SolutionQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ result: string; recommendation: { service: string; description: string } } | null>(null);
  const [loading, setLoading] = useState(false);

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

  async function submitQuiz(finalAnswers: Record<string, string>) {
    setLoading(true);
    try {
      const sessionId = sessionStorage.getItem('sessionId') || crypto.randomUUID();
      sessionStorage.setItem('sessionId', sessionId);
      const res = await fetch(getApiUrl('/quiz/submit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answers: finalAnswers }),
      });
      const json = await res.json();
      if (json.success) setResult(json.data);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <Card className="max-w-2xl mx-auto text-center p-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">We found your perfect match!</h2>
        <p className="mt-2 text-lg text-blue-600 font-semibold">{result.recommendation.service}</p>
        <p className="mt-2 text-slate-600">{result.recommendation.description}</p>
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link href={`/contact?service=${encodeURIComponent(result.recommendation.service)}`}>
            <Button size="lg">Schedule a Free Consultation <ArrowRight className="h-4 w-4" /></Button>
          </Link>
          <Link href="/case-studies">
            <Button size="lg" variant="outline">View Case Studies</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-500 mb-2">
          <span>Question {step + 1} of {QUESTIONS.length}</span>
          <span>{Math.round(((step) / QUESTIONS.length) * 100)}% complete</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${(step / QUESTIONS.length) * 100}%` }} />
        </div>
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-slate-900 mb-6">{q.question}</h2>
        <div className="space-y-3">
          {q.options.map((opt) => (
            <button key={opt.value} onClick={() => select(opt.value)} disabled={loading}
              className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm font-medium text-slate-700">
              {opt.label}
            </button>
          ))}
        </div>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="mt-4 text-sm text-slate-500 hover:text-slate-700">
            ← Back
          </button>
        )}
      </Card>
    </div>
  );
}
