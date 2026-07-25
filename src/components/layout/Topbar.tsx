'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Moon, Sun, Bell, Settings, LogOut, User, Check, Sparkles, FileText, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Breadcrumb label map
const BREADCRUMB_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  forms: 'My Forms',
  new: 'New Form',
  builder: 'Builder',
  responses: 'Responses',
  analytics: 'Analytics',
  settings: 'Settings',
  templates: 'Templates',
  integrations: 'Integrations',
  notifications: 'Notifications',
  help: 'Help',
};

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center gap-1.5">
      {segments.map((seg, i) => {
        const label = BREADCRUMB_MAP[seg] ?? seg;
        const isLast = i === segments.length - 1;
        return (
          <span key={seg} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>/</span>}
            <span
              className={cn('text-sm', isLast ? 'font-semibold' : 'font-normal')}
              style={{ color: isLast ? 'var(--foreground)' : 'var(--foreground-muted)' }}
            >
              {label}
            </span>
          </span>
        );
      })}
    </nav>
  );
}

interface TopbarProps {
  onCommandPaletteOpen: () => void;
}

export function Topbar({ onCommandPaletteOpen }: TopbarProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [mounted, setMounted] = useState(false);

  // Popover menus state
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      logout();
      toast.success('Logged out successfully');
      router.push('/sign-in');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const sampleNotifications = [
    { id: '1', title: 'New response received', text: 'Customer Feedback form submitted.', time: '5m ago', icon: FileText },
    { id: '2', title: 'AI Form Generated', text: 'Dental appointment form is ready.', time: '1h ago', icon: Sparkles },
  ];

  return (
    <header
      className="h-14 flex items-center justify-between px-4 border-b flex-shrink-0 relative z-30"
      style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
    >
      {/* Left: breadcrumbs */}
      <Breadcrumbs />

      {/* Right: actions */}
      <div className="flex items-center gap-1.5">
        {/* Command palette trigger */}
        <button
          onClick={onCommandPaletteOpen}
          className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors hover:bg-[var(--card-hover)] border"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground-muted)' }}
        >
          <Search size={12} />
          <span>Search</span>
          <span className="flex items-center gap-0.5 opacity-60">
            <kbd className="px-1 py-0.5 rounded text-xs font-mono" style={{ background: 'var(--border)' }}>⌘</kbd>
            <kbd className="px-1 py-0.5 rounded text-xs font-mono" style={{ background: 'var(--border)' }}>K</kbd>
          </span>
        </button>

        {/* Notifications Popover Trigger */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--card-hover)]"
            style={{ color: 'var(--foreground-muted)' }}
            title="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--primary)' }} />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              className="absolute right-0 top-10 w-80 rounded-2xl border shadow-xl p-4 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-100"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <h4 className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>Notifications</h4>
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] font-semibold hover:underline"
                  style={{ color: 'var(--primary)' }}
                >
                  View All
                </Link>
              </div>

              <div className="space-y-2">
                {sampleNotifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} className="flex items-start gap-2.5 p-2 rounded-xl transition-colors hover:bg-[var(--background-secondary)]">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(124,58,237,0.1)' }}>
                        <Icon size={14} style={{ color: 'var(--primary)' }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>{n.title}</p>
                        <p className="text-[11px] truncate" style={{ color: 'var(--foreground-muted)' }}>{n.text}</p>
                        <span className="text-[10px]" style={{ color: 'var(--foreground-subtle)' }}>{n.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--card-hover)]"
            style={{ color: 'var(--foreground-muted)' }}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        )}

        {/* User Profile Avatar & Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ml-1 cursor-pointer transition-transform active:scale-95 shadow-sm"
            style={{ background: 'linear-gradient(135deg, var(--primary), hsl(300,60%,55%))' }}
          >
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </button>

          {/* User Menu Popover */}
          {showUserMenu && (
            <div
              className="absolute right-0 top-10 w-56 rounded-2xl border shadow-xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-100"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className="p-2.5 border-b mb-1" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-bold truncate" style={{ color: 'var(--foreground)' }}>{user?.name ?? 'User'}</p>
                <p className="text-[11px] truncate" style={{ color: 'var(--foreground-muted)' }}>{user?.email}</p>
              </div>

              <Link
                href="/dashboard/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors hover:bg-[var(--card-hover)]"
                style={{ color: 'var(--foreground)' }}
              >
                <Settings size={14} /> Settings
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors hover:bg-red-500/10 text-red-500 text-left"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
