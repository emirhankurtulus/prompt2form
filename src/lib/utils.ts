import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';
import type { ApiError, ApiSuccess } from '@/types/form';

// ─── Tailwind class merger ────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── ID generation ────────────────────────────────────────────────────────────

export function generateId(): string {
  return nanoid(12);
}

// ─── Slug generation ──────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateFormSlug(title: string): string {
  const slug = slugify(title);
  const suffix = nanoid(6).toLowerCase();
  return `${slug}-${suffix}`;
}

// ─── API Response helpers ─────────────────────────────────────────────────────

export function apiSuccess<T>(
  data: T,
  meta?: ApiSuccess<T>['meta'],
  status = 200,
): NextResponse {
  return NextResponse.json({ success: true, data, meta }, { status });
}

export function apiError(
  message: string,
  code = 'INTERNAL_ERROR',
  status = 500,
  details?: unknown,
): NextResponse {
  const body: ApiError = { success: false, error: { code, message, details } };
  return NextResponse.json(body, { status });
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}

// ─── Percentage ───────────────────────────────────────────────────────────────

export function percent(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// ─── Truncate ─────────────────────────────────────────────────────────────────

export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + '...';
}
