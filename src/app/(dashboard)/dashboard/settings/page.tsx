'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { User, Mail, Shield, Bell, Loader2, Save } from 'lucide-react';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [name, setName] = useState(user?.name ?? '');
  const [email] = useState(user?.email ?? '');
  const [emailAlerts, setEmailAlerts] = useState(true);

  // Fetch integration preferences (Form Submission Notifications)
  const { data, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const res = await fetch('/api/integrations');
      return res.json();
    },
  });

  useEffect(() => {
    if (data?.data) {
      setEmailAlerts(data.data.emailEnabled ?? true);
    }
  }, [data]);

  // Save Settings mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailEnabled: emailAlerts,
          notificationEmails: [email],
          webhookEnabled: data?.data?.webhookEnabled ?? false,
          webhookUrl: data?.data?.webhookUrl ?? '',
          googleSheetsEnabled: data?.data?.googleSheetsEnabled ?? false,
          googleSheetsWebhookUrl: data?.data?.googleSheetsWebhookUrl ?? '',
        }),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Ayarlar ve e-posta bildirimi tercihleri kaydedildi!');
    },
    onError: () => toast.error('Ayarlar kaydedilirken hata oluştu'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Account Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>Manage your profile, notification preferences, and usage limits.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="rounded-2xl border p-5 space-y-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Profile Information</h3>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none font-medium"
                style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none opacity-60 cursor-not-allowed font-medium"
                style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
            </div>
          </div>
        </div>

        {/* Form Limits Card */}
        <div className="rounded-2xl border p-5 space-y-3" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Current Plan & Usage Limits</h3>
          <div className="p-4 rounded-xl space-y-2.5" style={{ background: 'var(--background-secondary)' }}>
            <div className="flex justify-between text-xs font-semibold">
              <span style={{ color: 'var(--foreground)' }}>Free Plan</span>
              <span style={{ color: 'var(--foreground-muted)' }}>4 forms / month</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full" style={{ width: '25%', background: 'var(--primary)' }} />
            </div>
            <p className="text-[11px]" style={{ color: 'var(--foreground-subtle)' }}>1 of 4 forms used this month. Resets on the 1st of next month.</p>
          </div>
        </div>

        {/* Form Submission Notifications Preference */}
        <div className="rounded-2xl border p-5 space-y-3" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Notification Preferences</h3>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Form Submission Notifications</p>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Receive email alerts at <strong>{email}</strong> whenever someone submits your form.</p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-5 h-5 accent-[var(--primary)]"
            />
          </label>
        </div>

        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 flex items-center gap-2 shadow-sm disabled:opacity-50"
          style={{ background: 'var(--primary)' }}
        >
          {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Settings
        </button>
      </div>
    </div>
  );
}
