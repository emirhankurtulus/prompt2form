'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  LayoutDashboard, FileText, BarChart3, Settings,
  Plus, ChevronLeft, ChevronRight, LogOut,
  Layers, Webhook, Bell, HelpCircle, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Forms', href: '/dashboard/forms', icon: FileText },
  { label: 'Templates', href: '/dashboard/templates', icon: Layers },
  { label: 'Integrations', href: '/dashboard/integrations', icon: Webhook },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
];

const BOTTOM_ITEMS = [
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Help', href: '/dashboard/help', icon: HelpCircle },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logoutStore = useAuthStore((s) => s.logout);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      logoutStore();
      router.push('/sign-in');
    } catch {
      toast.error('Failed to log out');
    }
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen flex-shrink-0 border-r"
      style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--primary)' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 3h12v2H2V3zM2 7h8v2H2V7zM2 11h10v2H2v-2z" fill="white" />
            </svg>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="font-semibold text-sm tracking-tight whitespace-nowrap overflow-hidden"
                style={{ color: 'var(--foreground)' }}
              >
                Prompt2Form
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Create new form CTA */}
      <div className="px-3 py-3 flex-shrink-0">
        <Link
          href="/dashboard/forms/new"
          className={cn(
            'flex items-center gap-2 rounded-[10px] transition-all duration-150 font-medium text-sm',
            'hover:brightness-110 active:scale-[0.97]',
            collapsed ? 'w-10 h-10 justify-center' : 'px-3 py-2',
          )}
          style={{ background: 'var(--primary)', color: 'white' }}
        >
          <Plus size={16} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                New Form
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            className={cn(
              'flex items-center gap-3 rounded-[10px] transition-all duration-150 text-sm font-medium',
              collapsed ? 'w-10 h-10 justify-center' : 'px-3 py-2',
              isActive(href)
                ? 'text-white'
                : 'hover:bg-[var(--card-hover)]',
            )}
            style={
              isActive(href)
                ? { background: 'var(--primary)', color: 'white' }
                : { color: 'var(--foreground-muted)' }
            }
          >
            <Icon size={16} className="flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 pb-2 space-y-0.5 flex-shrink-0 border-t pt-2" style={{ borderColor: 'var(--border)' }}>
        {BOTTOM_ITEMS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            className={cn(
              'flex items-center gap-3 rounded-[10px] transition-all duration-150 text-sm font-medium',
              collapsed ? 'w-10 h-10 justify-center' : 'px-3 py-2',
              isActive(href) ? 'text-white' : 'hover:bg-[var(--card-hover)]',
            )}
            style={
              isActive(href)
                ? { background: 'var(--primary)', color: 'white' }
                : { color: 'var(--foreground-muted)' }
            }
          >
            <Icon size={16} className="flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        ))}

        {/* User + logout */}
        <div className={cn('flex items-center gap-2.5 rounded-[10px] px-2 py-2 mt-1', collapsed && 'justify-center px-0')}>
          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--primary), hsl(300,60%,55%))' }}>
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--foreground)' }}>{user?.name}</p>
                <p className="text-xs truncate" style={{ color: 'var(--foreground-subtle)' }}>{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!collapsed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleLogout}
                className="p-1.5 rounded-lg transition-colors hover:bg-[var(--card-hover)]"
                style={{ color: 'var(--foreground-subtle)' }}
                title="Sign out"
              >
                <LogOut size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full border flex items-center justify-center transition-colors hover:brightness-95 z-10"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground-muted)' }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
}
