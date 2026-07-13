'use client';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { usePathname } from 'next/navigation';
import { PageLoading } from '@/components/ui/PageLoading';

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) return <>{children}</>;

  if (loading) {
    return <PageLoading fullScreen label="Memeriksa sesi admin..." />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="lg:pl-64">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AuthProvider>
  );
}
