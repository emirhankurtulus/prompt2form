'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  LayoutDashboard, FileText, BarChart3, Settings,
  Plus, LogOut, Layers, Webhook, Bell, HelpCircle, X
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
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
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

  const sidebarContent = (
    <div className="flex flex-col h-full w-[260px] max-w-[260px] bg-zinc-950 border-r border-zinc-800 text-zinc-200">
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-zinc-800 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0" onClick={onClose}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white text-zinc-950 font-bold text-xs flex-shrink-0">
            P2F
          </div>
          <span className="font-bold text-sm tracking-tight text-white whitespace-nowrap">
            Prompt2Form
          </span>
        </Link>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Create New Form Button */}
      <div className="px-3 py-3 flex-shrink-0">
        <Link
          href="/dashboard/forms/new"
          onClick={onClose}
          className="flex items-center justify-center gap-2 rounded-xl bg-white text-zinc-950 font-bold text-xs py-2.5 transition-all hover:bg-zinc-200 active:scale-[0.98] w-full"
        >
          <Plus size={14} className="flex-shrink-0" />
          <span>New Form</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-150',
              isActive(href)
                ? 'bg-zinc-900 text-white border-l-2 border-white'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white',
            )}
          >
            <Icon size={14} className="flex-shrink-0" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="px-2 pb-3 space-y-0.5 flex-shrink-0 border-t border-zinc-800 pt-2">
        {BOTTOM_ITEMS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-150',
              isActive(href)
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white',
            )}
          >
            <Icon size={14} className="flex-shrink-0" />
            <span>{label}</span>
          </Link>
        ))}

        {/* User Info & Logout */}
        <div className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 mt-2 bg-zinc-900/40 border border-zinc-800/60">
          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold bg-white text-zinc-950">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Sign out"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:flex flex-col h-screen flex-shrink-0 bg-zinc-950 border-r border-zinc-800">
        {sidebarContent}
      </aside>

      {/* ─── Mobile Sidebar Overlay Drawer ─── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
