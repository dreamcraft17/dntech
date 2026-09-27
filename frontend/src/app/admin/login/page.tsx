'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Logo } from '@/components/common/Logo';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-gray-900"
      >
        Skip to main content
      </a>
      <main id="main" className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Logo href={null} size="xl" priority />
          </div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-teal-300">DN Tech workspace</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Dasbor Admin</h1>
          <p className="mt-2 text-gray-400">Masuk untuk mengelola situs, produk, dan leads.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 border border-slate-700 bg-white p-6"
        >
          {error && <Alert variant="error">{error}</Alert>}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Kata Sandi"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <fieldset>
            <legend className="sr-only">Preferensi masuk</legend>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" className="rounded" /> Ingat saya
            </label>
          </fieldset>
          <Button type="submit" loading={loading} className="w-full">
            Masuk
          </Button>
        </form>
      </main>
    </div>
  );
}
