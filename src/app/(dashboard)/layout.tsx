'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { useAuthStore } from '@/store/authStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const router = useRouter();
  const { user, setUser, setLoading } = useAuthStore();

  // Hydrate auth store from API on initial load
  useEffect(() => {
    if (!user) {
      setLoading(true);
      fetch('/api/auth/me')
        .then((r) => r.json())
        .then((json) => {
          if (json.success) {
            setUser(json.data);
          } else {
            router.push('/sign-in');
          }
        })
        .catch(() => router.push('/sign-in'))
        .finally(() => setLoading(false));
    }
  }, [user, setUser, setLoading, router]);

  // ⌘K global shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-white select-none">
      {/* Sidebar with Desktop mode + Mobile drawer mode */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar with Burger toggle button for mobile */}
        <Topbar 
          onCommandPaletteOpen={() => setCmdOpen(true)} 
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} 
        />

        <main className="flex-1 overflow-y-auto bg-zinc-900">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
