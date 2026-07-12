'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Briefcase, Package, FolderOpen, FileText, Users, MessageSquare,
  BarChart3, Settings, UserCog, Image, HelpCircle, Star, LogOut, Menu, X, Building2,
  Mail, ClipboardList,
  Send,
  Palette,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/common/Logo';

const navItems = [
  { href: '/admin/dashboard', label: 'Dasbor', icon: LayoutDashboard },
  { href: '/admin/services', label: 'Layanan', icon: Briefcase },
  { href: '/admin/products', label: 'Produk', icon: Package },
  { href: '/admin/portfolio', label: 'Studi Kasus', icon: FolderOpen },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/leads', label: 'Lead', icon: MessageSquare },
  { href: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  { href: '/admin/email-logs', label: 'Email Log', icon: Send },
  { href: '/admin/quiz', label: 'Kuis', icon: ClipboardList },
  { href: '/admin/branding', label: 'Branding', icon: Palette },
  { href: '/admin/team', label: 'Tim', icon: Users },
  { href: '/admin/testimonials', label: 'Testimoni', icon: Star },
  { href: '/admin/faqs', label: 'FAQ', icon: HelpCircle },
  { href: '/admin/careers', label: 'Karier', icon: Building2 },
  { href: '/admin/media', label: 'Media', icon: Image },
  { href: '/admin/analytics', label: 'Analitik', icon: BarChart3 },
  { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
  { href: '/admin/users', label: 'Pengguna', icon: UserCog, superAdminOnly: true },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredNav = navItems.filter(
    (item) => !item.superAdminOnly || user?.role === 'SuperAdmin'
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-blue-800 p-2 text-white lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-blue-900 text-blue-100 transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-blue-800 px-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Logo href={null} size="sm" />
            <span className="font-semibold text-white">Admin</span>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="p-1 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {filteredNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-800/60 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-blue-800 p-4">
          <div className="mb-2 truncate text-sm text-blue-200">{user?.name}</div>
          <div className="mb-3 truncate text-xs text-blue-300">{user?.role}</div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-300 transition-colors hover:bg-blue-800"
          >
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
