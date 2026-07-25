'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, FileText, Plus, Settings,
  BarChart3, Layers, LogOut, Moon, Sun,
  Webhook, Search,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const COMMANDS = [
  { group: 'Navigate', items: [
    { label: 'Go to Dashboard', icon: LayoutDashboard, href: '/dashboard', shortcut: 'G D' },
    { label: 'My Forms', icon: FileText, href: '/dashboard/forms', shortcut: 'G F' },
    { label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics', shortcut: 'G A' },
    { label: 'Templates', icon: Layers, href: '/dashboard/templates', shortcut: '' },
    { label: 'Integrations', icon: Webhook, href: '/dashboard/integrations', shortcut: '' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings', shortcut: '' },
  ]},
  { group: 'Actions', items: [
    { label: 'Create New Form', icon: Plus, href: '/dashboard/forms/new', shortcut: 'C' },
  ]},
];

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const logoutStore = useAuthStore((s) => s.logout);
  const [query, setQuery] = useState('');

  // ⌘K toggle
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open ? onClose() : undefined; // parent handles opening
      }
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onClose]);

  const run = useCallback((href: string) => {
    router.push(href);
    onClose();
  }, [router, onClose]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logoutStore();
    router.push('/sign-in');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-1/2 top-[20vh] z-50 -translate-x-1/2 w-full max-w-[560px] px-4"
          >
            <div
              className="rounded-2xl overflow-hidden shadow-2xl border"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <Command shouldFilter label="Command palette">
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <Search size={16} style={{ color: 'var(--foreground-muted)' }} />
                  <Command.Input
                    value={query}
                    onValueChange={setQuery}
                    placeholder="Search commands..."
                    className="flex-1 py-4 text-sm bg-transparent outline-none"
                    style={{ color: 'var(--foreground)' }}
                  />
                  <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: 'var(--border)', color: 'var(--foreground-muted)' }}>
                    ESC
                  </kbd>
                </div>

                {/* List */}
                <Command.List className="max-h-[340px] overflow-y-auto p-2">
                  <Command.Empty>
                    <div className="py-8 text-center text-sm" style={{ color: 'var(--foreground-muted)' }}>
                      No results for &quot;{query}&quot;
                    </div>
                  </Command.Empty>

                  {COMMANDS.map(({ group, items }) => (
                    <Command.Group
                      key={group}
                      heading={group}
                      className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:mb-1"
                      style={{ '--cmdk-group-heading-color': 'var(--foreground-subtle)' } as React.CSSProperties}
                    >
                      {items.map(({ label, icon: Icon, href, shortcut }) => (
                        <Command.Item
                          key={href}
                          value={label}
                          onSelect={() => run(href)}
                          className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm cursor-pointer transition-colors aria-selected:bg-[var(--primary)] aria-selected:text-white"
                          style={{ color: 'var(--foreground)' }}
                        >
                          <Icon size={15} />
                          <span className="flex-1">{label}</span>
                          {shortcut && (
                            <span className="text-xs font-mono opacity-50">{shortcut}</span>
                          )}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  ))}

                  {/* System group */}
                  <Command.Group
                    heading="System"
                    className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:mb-1"
                    style={{ '--cmdk-group-heading-color': 'var(--foreground-subtle)' } as React.CSSProperties}
                  >
                    <Command.Item
                      value="Toggle theme"
                      onSelect={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); onClose(); }}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm cursor-pointer transition-colors aria-selected:bg-[var(--primary)] aria-selected:text-white"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                      <span>Toggle {theme === 'dark' ? 'light' : 'dark'} mode</span>
                    </Command.Item>
                    <Command.Item
                      value="Sign out logout"
                      onSelect={handleLogout}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm cursor-pointer transition-colors aria-selected:bg-red-500 aria-selected:text-white"
                      style={{ color: 'var(--destructive)' }}
                    >
                      <LogOut size={15} />
                      <span>Sign out</span>
                    </Command.Item>
                  </Command.Group>
                </Command.List>
              </Command>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
