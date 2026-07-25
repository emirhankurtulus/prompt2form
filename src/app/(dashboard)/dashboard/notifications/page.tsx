'use client';

import { useState } from 'react';
import { Bell, Check, Trash2, Mail, FileText, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'response' | 'system' | 'limit';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'New response received',
    message: 'Someone submitted your "Customer Feedback" form.',
    time: '10m ago',
    read: false,
    type: 'response',
  },
  {
    id: '2',
    title: 'Monthly Form Limit Update',
    message: 'You have used 1 out of 4 free forms this month.',
    time: '2h ago',
    read: false,
    type: 'limit',
  },
  {
    id: '3',
    title: 'AI Form Generated',
    message: 'Dental Appointment form was successfully generated.',
    time: '1d ago',
    read: true,
    type: 'system',
  },
];

export default function NotificationsPage() {
  const [items, setItems] = useState(INITIAL_NOTIFICATIONS);

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All marked as read');
  };

  const clearAll = () => {
    setItems([]);
    toast.success('Notifications cleared');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Notifications</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>Stay updated with responses and form activities.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={markAllRead} className="px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            Mark all as read
          </button>
          <button onClick={clearAll} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-500/10">
            Clear all
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-16 space-y-2 border rounded-2xl" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
            <Bell size={28} className="mx-auto" style={{ color: 'var(--foreground-subtle)' }} />
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>No notifications</p>
          </div>
        ) : (
          items.map((n) => (
            <div
              key={n.id}
              className="p-4 rounded-xl border flex items-start justify-between gap-3 transition-all"
              style={{
                background: n.read ? 'var(--card)' : 'rgba(124,58,237,0.04)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mt-0.5" style={{ background: 'rgba(124,58,237,0.1)' }}>
                  {n.type === 'response' ? <FileText size={15} style={{ color: 'var(--primary)' }} /> : <Sparkles size={15} style={{ color: 'var(--primary)' }} />}
                </div>
                <div>
                  <h4 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{n.title}</h4>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--foreground-muted)' }}>{n.message}</p>
                  <span className="text-[10px] mt-1 block" style={{ color: 'var(--foreground-subtle)' }}>{n.time}</span>
                </div>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full" style={{ background: 'var(--primary)' }} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
