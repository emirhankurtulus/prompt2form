'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatRelativeTime, percent } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import {
  FileText, MessageSquare, TrendingUp, Zap,
  Plus, ArrowRight, BarChart3, Eye, Clock,
  CheckCircle2, AlertCircle, Sparkles,
} from 'lucide-react';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
  icon: React.ReactNode;
  color: string;
  index: number;
}

function StatCard({ title, value, delta, deltaPositive, icon, color, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="rounded-2xl p-5 border transition-all duration-150 hover:shadow-lg group"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>{title}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: color + '1a' }}>
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>{value}</p>
        {delta && (
          <p className="text-xs font-medium" style={{ color: deltaPositive ? 'var(--success)' : 'var(--destructive)' }}>
            {deltaPositive ? '↑' : '↓'} {delta} this month
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Form limit bar ───────────────────────────────────────────────────────────
function FormLimitBar({ count, limit }: { count: number; limit: number }) {
  const pct = percent(count, limit);
  const color = pct >= 75 ? 'var(--warning)' : 'var(--primary)';
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: 'var(--foreground-muted)' }}>Forms this month</span>
        <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{count} / {limit}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      {pct >= 75 && (
        <p className="text-xs" style={{ color: 'var(--warning)' }}>
          ⚠ {limit - count} form{limit - count !== 1 ? 's' : ''} remaining this month
        </p>
      )}
    </div>
  );
}

// ─── Recent Form Card ─────────────────────────────────────────────────────────
function RecentFormCard({ form, index }: { form: Record<string, unknown>; index: number }) {
  const statusColors: Record<string, string> = {
    PUBLISHED: '#22c55e',
    DRAFT: 'var(--foreground-subtle)',
    ARCHIVED: 'var(--warning)',
    PAUSED: 'var(--destructive)',
  };
  const status = form.status as string;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.05 }}
    >
      <Link
        href={`/dashboard/forms/${form._id}`}
        className="flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 hover:shadow-md group"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--primary)1a' }}>
          <FileText size={16} style={{ color: 'var(--primary)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
            {form.title as string}
          </p>
          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
            {formatRelativeTime(form.updatedAt as string)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: statusColors[status] + '1a', color: statusColors[status] }}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </span>
          <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--foreground-muted)' }} />
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Activity item ────────────────────────────────────────────────────────────
const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  'form.created': <Plus size={13} />,
  'form.published': <CheckCircle2 size={13} />,
  'response.received': <MessageSquare size={13} />,
  'form.updated': <FileText size={13} />,
};

function ActivityItem({ log }: { log: Record<string, unknown> }) {
  const action = log.action as string;
  return (
    <div className="flex items-start gap-2.5 py-2.5">
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'var(--primary)1a', color: 'var(--primary)' }}>
        {ACTIVITY_ICONS[action] ?? <Zap size={13} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: 'var(--foreground)' }}>
          <span style={{ color: 'var(--foreground-muted)' }}>{(log.metadata as Record<string, string>)?.description ?? action.replace('.', ' ')}</span>
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--foreground-subtle)' }}>
          {formatRelativeTime(log.createdAt as string)}
        </p>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => fetch('/api/dashboard/stats').then((r) => r.json()),
  });

  const stats = statsData?.data;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const STAT_CARDS = [
    { title: 'Total Forms', value: statsLoading ? '—' : (stats?.totalForms ?? 0), icon: <FileText size={18} />, color: '#7c3aed', delta: stats?.newFormsThisMonth ? `${stats.newFormsThisMonth} new` : undefined, deltaPositive: true },
    { title: 'Total Responses', value: statsLoading ? '—' : (stats?.totalResponses ?? 0), icon: <MessageSquare size={18} />, color: '#3b82f6', delta: stats?.responsesThisMonth ? `${stats.responsesThisMonth} new` : undefined, deltaPositive: true },
    { title: 'Avg. Conversion', value: statsLoading ? '—' : `${stats?.avgConversion ?? 0}%`, icon: <TrendingUp size={18} />, color: '#22c55e' },
    { title: 'Total Views', value: statsLoading ? '—' : (stats?.totalViews ?? 0), icon: <Eye size={18} />, color: '#f59e0b' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            {greeting()}, {user?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Here&apos;s what&apos;s happening with your forms today.
          </p>
        </div>
        <Link
          href="/dashboard/forms/new"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97]"
          style={{ background: 'var(--primary)' }}
        >
          <Sparkles size={15} />
          Create with AI
        </Link>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-5 border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-7 w-16" />
              </div>
            ))
          : STAT_CARDS.map((c, i) => <StatCard key={c.title} {...c} index={i} />)
        }
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent forms */}
        <div className="lg:col-span-2 rounded-2xl border p-5 space-y-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>Recent Forms</h2>
            <Link href="/dashboard/forms" className="text-xs font-medium hover:underline flex items-center gap-1" style={{ color: 'var(--primary)' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {statsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
                  <Skeleton className="w-9 h-9 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2.5 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.recentForms?.length ? (
            <div className="space-y-2">
              {stats.recentForms.map((form: Record<string, unknown>, i: number) => (
                <RecentFormCard key={form._id as string} form={form} index={i} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center" style={{ background: 'var(--border)' }}>
                <FileText size={20} style={{ color: 'var(--foreground-muted)' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>No forms yet</p>
                <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>Create your first form using AI</p>
              </div>
              <Link
                href="/dashboard/forms/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                style={{ background: 'var(--primary)' }}
              >
                <Plus size={13} /> Create form
              </Link>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Form limit card */}
          <div className="rounded-2xl border p-5 space-y-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>Usage this month</h2>
            {statsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ) : (
              <FormLimitBar count={stats?.formsThisMonth ?? 0} limit={4} />
            )}
          </div>

          {/* Activity feed */}
          <div className="rounded-2xl border p-5 space-y-1" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Activity</h2>
            {statsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-2.5">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-2.5 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats?.recentActivity?.length ? (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {stats.recentActivity.slice(0, 5).map((log: Record<string, unknown>) => (
                  <ActivityItem key={log._id as string} log={log} />
                ))}
              </div>
            ) : (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--foreground-muted)' }}>No recent activity</p>
            )}
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border p-5 space-y-3" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>Quick actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Create with AI', icon: <Sparkles size={14} />, href: '/dashboard/forms/new', primary: true },
                { label: 'Browse templates', icon: <BarChart3 size={14} />, href: '/dashboard/templates', primary: false },
                { label: 'View analytics', icon: <TrendingUp size={14} />, href: '/dashboard/analytics', primary: false },
              ].map(({ label, icon, href, primary }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:brightness-95"
                  style={primary
                    ? { background: 'var(--primary)', color: 'white' }
                    : { background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }
                  }
                >
                  {icon} {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
