'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Mail, Webhook, FileSpreadsheet, Save, Loader2, Info } from 'lucide-react';

export default function IntegrationsPage() {
  const queryClient = useQueryClient();

  const [emailEnabled, setEmailEnabled] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [googleSheetsEnabled, setGoogleSheetsEnabled] = useState(false);
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('');

  // Fetch integration settings
  const { data, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const res = await fetch('/api/integrations');
      return res.json();
    },
  });

  useEffect(() => {
    if (data?.data) {
      const config = data.data;
      setEmailEnabled(config.emailEnabled ?? true);
      setNotificationEmail(config.notificationEmails?.[0] ?? '');
      setWebhookEnabled(config.webhookEnabled ?? false);
      setWebhookUrl(config.webhookUrl ?? '');
      setGoogleSheetsEnabled(config.googleSheetsEnabled ?? false);
      setGoogleSheetsUrl(config.googleSheetsWebhookUrl ?? '');
    }
  }, [data]);

  // Save integration settings
  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailEnabled,
          notificationEmails: [notificationEmail],
          webhookEnabled,
          webhookUrl,
          googleSheetsEnabled,
          googleSheetsWebhookUrl: googleSheetsUrl,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration settings saved!');
    },
    onError: () => toast.error('Failed to save integration settings'),
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Integrations</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
            Connect your forms with Email notifications, Custom Webhooks, and Google Sheets real-time sync.
          </p>
        </div>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-50 shadow-sm"
          style={{ background: 'var(--primary)' }}
        >
          {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Settings
        </button>
      </div>

      <div className="space-y-4">
        {/* 1. Email Notifications */}
        <div
          className="rounded-2xl border p-5 space-y-4 transition-all"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>Email Notifications</h3>
                <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                  Receive styled HTML summary emails instantly whenever a new form response is submitted.
                </p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={emailEnabled}
                onChange={(e) => setEmailEnabled(e.target.checked)}
                className="w-5 h-5 accent-[var(--primary)]"
              />
            </label>
          </div>

          {emailEnabled && (
            <div className="pt-2 space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>Notification Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
            </div>
          )}
        </div>

        {/* 2. Custom Webhook */}
        <div
          className="rounded-2xl border p-5 space-y-4 transition-all"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
                <Webhook size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>Custom Webhook (HTTP POST)</h3>
                <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                  Dispatches JSON POST payloads to your API or Zapier/Make on every submission.
                </p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={webhookEnabled}
                onChange={(e) => setWebhookEnabled(e.target.checked)}
                className="w-5 h-5 accent-[var(--primary)]"
              />
            </label>
          </div>

          {webhookEnabled && (
            <div className="pt-2 space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>Webhook Endpoint URL</label>
              <input
                type="url"
                placeholder="https://api.domain.com/webhooks/form-responses"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none font-mono"
                style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
            </div>
          )}
        </div>

        {/* 3. Google Sheets Integration */}
        <div
          className="rounded-2xl border p-5 space-y-4 transition-all"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>Google Sheets Sync</h3>
                <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                  Appends incoming form responses as new rows in your Google Spreadsheet in real time.
                </p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={googleSheetsEnabled}
                onChange={(e) => setGoogleSheetsEnabled(e.target.checked)}
                className="w-5 h-5 accent-[var(--primary)]"
              />
            </label>
          </div>

          {googleSheetsEnabled && (
            <div className="pt-2 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>Google Apps Script Web App URL</label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={googleSheetsUrl}
                  onChange={(e) => setGoogleSheetsUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none font-mono"
                  style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                />
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Info size={14} /> Google Sheets Setup Guide:
                </p>
                <p className="leading-relaxed">
                  Open your Google Sheet, click <code>Extensions &gt; Apps Script</code>, paste the code below and deploy as a Web App, then paste the URL above:
                </p>
                <pre className="p-2 rounded bg-emerald-950 text-emerald-200 text-[11px] overflow-x-auto mt-1 font-mono">
                  {`function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([new Date(), data.formTitle, JSON.stringify(data.answers)]);
  return ContentService.createTextOutput("OK");
}`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
