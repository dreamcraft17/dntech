'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Briefcase, FolderOpen, FileText, Users, MessageSquare,
  BarChart3, Settings, UserCog, Image, HelpCircle, Star, LogOut, Menu, X, Building2,
  Mail, ClipboardList,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/common/Logo';

const navItems = [
  { href: '/admin/dashboard', label: 'Dasbor', icon: LayoutDashboard },
  { href: '/admin/services', label: 'Layanan', icon: Briefcase },
  { href: '/admin/portfolio', label: 'Studi Kasus', icon: FolderOpen },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/leads', label: 'Lead', icon: MessageSquare },
  { href: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  { href: '/admin/quiz', label: 'Kuis', icon: ClipboardList },
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Logo href={null} size="sm" />
            <span className="font-semibold text-white">Admin</span>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {filteredNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="text-sm text-slate-400 mb-2 truncate">{user?.name}</div>
          <div className="text-xs text-slate-500 mb-3 truncate">{user?.role}</div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
