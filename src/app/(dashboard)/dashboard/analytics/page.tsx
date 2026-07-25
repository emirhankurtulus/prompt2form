'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import {
  Eye, FileText, TrendingUp, Clock, Globe, Laptop, Smartphone,
  Tablet, CheckCircle2, AlertCircle, ArrowUpRight, BarChart3,
  Calendar, Filter, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Dummy analytics data ───────────────────────────────────────────────────

const OVERVIEW_METRICS = [
  { label: 'Total Views', value: '2,845', change: '+14.2%', positive: true, icon: Eye },
  { label: 'Total Responses', value: '412', change: '+8.7%', positive: true, icon: FileText },
  { label: 'Avg Completion Rate', value: '64.8%', change: '+3.1%', positive: true, icon: TrendingUp },
  { label: 'Avg Completion Time', value: '2m 14s', change: '-12s', positive: true, icon: Clock },
];

const TIME_SERIES = [
  { date: 'Jul 19', views: 240, responses: 35 },
  { date: 'Jul 20', views: 320, responses: 48 },
  { date: 'Jul 21', views: 280, responses: 42 },
  { date: 'Jul 22', views: 450, responses: 78 },
  { date: 'Jul 23', views: 510, responses: 89 },
  { date: 'Jul 24', views: 480, responses: 72 },
  { date: 'Jul 25', views: 565, responses: 98 },
];

const DEVICE_BREAKDOWN = [
  { name: 'Desktop', value: 58, color: '#7c3aed', icon: Laptop },
  { name: 'Mobile', value: 34, color: '#3b82f6', icon: Smartphone },
  { name: 'Tablet', value: 8, color: '#10b981', icon: Tablet },
];

const FIELD_DROPOFF = [
  { field: '1. Full Name', views: 565, completions: 550, dropoff: '2.7%' },
  { field: '2. Email Address', views: 550, completions: 520, dropoff: '5.5%' },
  { field: '3. Phone Number', views: 520, completions: 430, dropoff: '17.3%' },
  { field: '4. Service Selection', views: 430, completions: 415, dropoff: '3.5%' },
  { field: '5. Additional Notes', views: 415, completions: 398, dropoff: '4.1%' },
];

const AI_INSIGHTS = [
  {
    type: 'warning',
    title: 'High Drop-off at Phone Number Field',
    description: 'Users drop off by 17.3% on Field #3. Consider making it optional or moving it to later in the form.',
    impact: 'High Impact',
  },
  {
    type: 'success',
    title: 'Strong Mobile Conversion',
    description: 'Mobile conversion rate increased by 14% after recent design optimizations.',
    impact: 'Positive Trend',
  },
  {
    type: 'tip',
    title: 'Peak Submission Time',
    description: 'Most responses are submitted between 14:00 - 17:00 UTC. Schedule your email campaigns accordingly.',
    impact: 'Optimization Tip',
  },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Analytics & Insights</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
            Track performance, completion rates, and AI-driven conversion insights.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl p-1" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', timeRange === range ? 'text-white' : 'hover:bg-[var(--card-hover)]')}
              style={timeRange === range ? { background: 'var(--primary)', color: 'white' } : { color: 'var(--foreground-muted)' }}
            >
              Last {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {OVERVIEW_METRICS.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="rounded-2xl border p-5 space-y-2"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>{m.label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)' }}>
                  <Icon size={16} style={{ color: 'var(--primary)' }} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{m.value}</span>
                <span className="text-xs font-medium text-emerald-500">{m.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area Chart */}
        <div
          className="lg:col-span-2 rounded-2xl border p-5 space-y-4"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Views & Submissions Over Time</h3>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Daily traffic vs response rate</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TIME_SERIES}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="date" stroke="var(--foreground-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--foreground-muted)" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="views" stroke="#7c3aed" fillOpacity={1} fill="url(#colorViews)" name="Views" />
                <Area type="monotone" dataKey="responses" stroke="#10b981" fillOpacity={1} fill="url(#colorResp)" name="Responses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Breakdown */}
        <div
          className="rounded-2xl border p-5 space-y-4 flex flex-col justify-between"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Device Breakdown</h3>
            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Submissions by device type</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={DEVICE_BREAKDOWN} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                  {DEVICE_BREAKDOWN.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {DEVICE_BREAKDOWN.map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <Icon size={13} style={{ color: 'var(--foreground-muted)' }} />
                    <span style={{ color: 'var(--foreground)' }}>{d.name}</span>
                  </div>
                  <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{d.value}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Insights & Dropoff Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dropoff table */}
        <div
          className="rounded-2xl border p-5 space-y-4"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Field Drop-off Analysis</h3>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Identify where users leave your forms</p>
            </div>
          </div>

          <div className="space-y-3">
            {FIELD_DROPOFF.map((f) => (
              <div key={f.field} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium truncate" style={{ color: 'var(--foreground)' }}>{f.field}</span>
                  <span className={cn('font-semibold', parseFloat(f.dropoff) > 10 ? 'text-red-500' : 'text-emerald-500')}>
                    Drop-off: {f.dropoff}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--background-secondary)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(f.completions / f.views) * 100}%`,
                      background: parseFloat(f.dropoff) > 10 ? '#ef4444' : 'var(--primary)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div
          className="rounded-2xl border p-5 space-y-4"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)' }}>
              <Sparkles size={14} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>AI Optimization Insights</h3>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Smart suggestions to boost response rates</p>
            </div>
          </div>

          <div className="space-y-3">
            {AI_INSIGHTS.map((item, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border space-y-1.5"
                style={{
                  background: item.type === 'warning' ? 'rgba(239,68,68,0.04)' : 'rgba(124,58,237,0.04)',
                  borderColor: item.type === 'warning' ? 'rgba(239,68,68,0.15)' : 'rgba(124,58,237,0.15)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{item.title}</span>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: item.type === 'warning' ? 'rgba(239,68,68,0.1)' : 'rgba(124,58,237,0.1)',
                      color: item.type === 'warning' ? '#ef4444' : 'var(--primary)',
                    }}
                  >
                    {item.impact}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
