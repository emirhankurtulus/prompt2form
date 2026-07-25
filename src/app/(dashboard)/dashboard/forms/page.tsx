'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus, Search, FileText, MoreVertical, Eye, Pencil,
  Trash2, Copy, BarChart3, Globe, Lock, Clock,
  Sparkles, ArrowUpRight, ChevronDown, Filter,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormItem {
  _id: string;
  title: string;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'PAUSED';
  slug: string;
  monthCreated: string;
  viewCount: number;
  responseCount: number;
  viewsCount?: number;
  responsesCount?: number;
  updatedAt: string;
  createdAt: string;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PUBLISHED: { label: 'Published', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  DRAFT: { label: 'Draft', color: 'var(--foreground-subtle)', bg: 'var(--border)' },
  ARCHIVED: { label: 'Archived', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  PAUSED: { label: 'Paused', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

function StatusBadge({ status }: { status: FormItem['status'] }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
}

// ─── Form card actions menu ────────────────────────────────────────────────────

function FormCard({ form, onDelete }: { form: FormItem; onDelete: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/f/${form.slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Form link copied!');
    setMenuOpen(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="group relative flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-150 hover:shadow-md"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(124,58,237,0.1)' }}
          >
            <FileText size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
              {form.title}
            </h3>
            {form.description && (
              <p className="text-xs truncate mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
                {form.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 hover:bg-[var(--card-hover)]"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <MoreVertical size={14} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 top-8 w-44 rounded-xl border shadow-xl z-20 overflow-hidden"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  {[
                    { label: 'Open Builder', icon: Pencil, href: `/dashboard/forms/${form._id}/builder` },
                    { label: 'View Responses', icon: BarChart3, href: `/dashboard/forms/${form._id}/responses` },
                    { label: 'Preview Form', icon: Eye, href: `/f/${form.slug}`, external: true },
                  ].map(({ label, icon: Icon, href, external }) => (
                    <Link
                      key={label}
                      href={href}
                      target={external ? '_blank' : undefined}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-[var(--card-hover)]"
                      style={{ color: 'var(--foreground)' }}
                    >
                      <Icon size={13} />
                      {label}
                      {external && <ArrowUpRight size={11} className="ml-auto opacity-50" />}
                    </Link>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border)' }} />
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-[var(--card-hover)]"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <Copy size={13} /> Copy link
                  </button>
                  <button
                    onClick={() => { onDelete(form._id); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-red-500 hover:text-white"
                    style={{ color: 'var(--destructive)' }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Status + stats */}
      <div className="flex items-center justify-between">
        <StatusBadge status={form.status} />
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--foreground-muted)' }} title="Views">
            <Eye size={11} /> {form.viewsCount ?? form.viewCount ?? 0}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--primary)' }} title="Responses">
            <FileText size={11} /> {form.responsesCount ?? form.responseCount ?? 0}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid var(--border)' }}>
        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--foreground-subtle)' }}>
          <Clock size={11} /> {formatRelativeTime(form.updatedAt)}
        </span>
        <Link
          href={`/dashboard/forms/${form._id}/builder`}
          className="text-xs font-medium flex items-center gap-0.5 hover:underline"
          style={{ color: 'var(--primary)' }}
        >
          Edit <ArrowUpRight size={10} />
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center justify-center py-20 space-y-5"
    >
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--border)' }}>
        {hasFilters ? <Search size={24} style={{ color: 'var(--foreground-muted)' }} /> : <FileText size={24} style={{ color: 'var(--foreground-muted)' }} />}
      </div>
      <div className="text-center space-y-2">
        <p className="font-semibold" style={{ color: 'var(--foreground)' }}>
          {hasFilters ? 'No forms match your search' : 'No forms yet'}
        </p>
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
          {hasFilters ? 'Try a different keyword or clear filters' : 'Create your first form with AI in seconds'}
        </p>
      </div>
      {!hasFilters && (
        <Link
          href="/dashboard/forms/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'var(--primary)' }}
        >
          <Sparkles size={14} /> Create with AI
        </Link>
      )}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const FILTERS = ['All', 'Published', 'Draft', 'Archived', 'Paused'] as const;

export default function FormsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<typeof FILTERS[number]>('All');

  const { data, isLoading } = useQuery({
    queryKey: ['forms', search, activeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (activeFilter !== 'All') params.set('status', activeFilter.toUpperCase());
      const res = await fetch(`/api/forms?${params.toString()}`);
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (formId: string) => {
      const res = await fetch(`/api/forms/${formId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Form deleted');
    },
    onError: () => toast.error('Failed to delete form'),
  });

  const forms: FormItem[] = data?.data ?? [];
  const hasFilters = !!search || activeFilter !== 'All';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>My Forms</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
            {data?.meta?.total ?? 0} form{data?.meta?.total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          href="/dashboard/forms/new"
          className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-semibold text-white hover:brightness-110 active:scale-[0.97] transition-all"
          style={{ background: 'var(--primary)' }}
        >
          <Sparkles size={14} /> New with AI
        </Link>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />
          <input
            type="text"
            placeholder="Search forms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-xl p-1" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                activeFilter === f ? 'text-white' : 'hover:bg-[var(--card-hover)]',
              )}
              style={activeFilter === f ? { background: 'var(--primary)', color: 'white' } : { color: 'var(--foreground-muted)' }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Forms grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border p-5 space-y-3 animate-pulse" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex gap-2.5">
                  <div className="w-9 h-9 rounded-lg skeleton flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 skeleton rounded w-3/4" />
                    <div className="h-2.5 skeleton rounded w-1/2" />
                  </div>
                </div>
                <div className="h-2.5 skeleton rounded w-1/3" />
                <div className="h-px" style={{ background: 'var(--border)' }} />
                <div className="h-2.5 skeleton rounded w-1/4" />
              </div>
            ))
          : forms.length > 0
          ? forms.map((form) => (
              <FormCard
                key={form._id}
                form={form}
                onDelete={(id) => {
                  if (confirm('Delete this form? This cannot be undone.')) {
                    deleteMutation.mutate(id);
                  }
                }}
              />
            ))
          : <EmptyState hasFilters={hasFilters} />
        }
      </div>
    </div>
  );
}
