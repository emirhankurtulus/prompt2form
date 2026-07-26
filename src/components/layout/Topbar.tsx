'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Moon, Sun, Bell, Settings, LogOut, FileText, Sparkles, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
    <nav className="hidden sm:flex items-center gap-1.5">
      {segments.map((seg, i) => {
        const label = BREADCRUMB_MAP[seg] ?? seg;
        const isLast = i === segments.length - 1;
        return (
          <span key={seg} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-[10px] text-zinc-600">/</span>}
            <span
              className={cn('text-xs font-medium', isLast ? 'text-zinc-200' : 'text-zinc-500')}
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
  onMenuToggle: () => void;
}

export function Topbar({ onCommandPaletteOpen, onMenuToggle }: TopbarProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [mounted, setMounted] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

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
    <header className="h-14 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-950 flex-shrink-0 relative z-30">
      {/* Left: Hamburger menu (mobile) & Breadcrumbs (desktop) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-1 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 active:scale-95 transition-all"
        >
          <Menu size={18} />
        </button>
        
        {/* Logo fallback for extremely small screens */}
        <Link href="/dashboard" className="sm:hidden font-black text-xs text-white bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-800">
          P2F
        </Link>
        
        <Breadcrumbs />
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5">
        {/* Command palette trigger */}
        <button
          onClick={onCommandPaletteOpen}
          className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition-all"
        >
          <Search size={12} />
          <span>Search</span>
          <span className="flex items-center gap-0.5 opacity-60">
            <kbd className="px-1 py-0.5 rounded text-[10px] font-mono bg-zinc-800">⌘</kbd>
            <kbd className="px-1 py-0.5 rounded text-[10px] font-mono bg-zinc-800">K</kbd>
          </span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            className="relative w-8 h-8 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
            title="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-11 w-72 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl p-3.5 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <h4 className="text-xs font-bold text-white">Notifications</h4>
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-[10px] font-bold text-zinc-400 hover:text-white"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-1.5">
                {sampleNotifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} className="flex items-start gap-2.5 p-2 rounded-xl transition-all hover:bg-zinc-900">
                      <div className="w-6.5 h-6.5 rounded-lg flex items-center justify-center bg-zinc-900 border border-zinc-800 text-white flex-shrink-0 mt-0.5">
                        <Icon size={12} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{n.title}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{n.text}</p>
                        <span className="text-[9px] text-zinc-500">{n.time}</span>
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
            className="w-8 h-8 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        )}

        {/* User Profile Avatar & Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black bg-white text-zinc-950 ml-1 cursor-pointer transition-transform active:scale-95 shadow-sm"
          >
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-11 w-52 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-2 border-b border-zinc-800 mb-1">
                <p className="text-xs font-bold text-white truncate">{user?.name ?? 'User'}</p>
                <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
              </div>

              <Link
                href="/dashboard/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
              >
                <Settings size={13} /> Settings
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all text-left"
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
