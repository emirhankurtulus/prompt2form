'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const AuthInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold text-zinc-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            className={cn(
              'w-full rounded-xl px-3.5 py-2.5 text-sm transition-all duration-150',
              'border outline-none bg-zinc-900 text-white placeholder:text-zinc-500',
              error
                ? 'border-red-500/80 focus:ring-2 focus:ring-red-500/20'
                : 'border-zinc-800 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500',
              icon && 'pl-10',
              isPassword && 'pr-10',
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  },
);
AuthInput.displayName = 'AuthInput';

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'ghost';
}

export function AuthButton({
  children,
  isLoading,
  variant = 'primary',
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'w-full rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-150',
        'flex items-center justify-center gap-2 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' && [
          'bg-white text-zinc-950 hover:bg-zinc-200 shadow-sm active:scale-[0.99]',
        ],
        variant === 'ghost' && [
          'border border-zinc-800 text-white bg-zinc-900/60 hover:bg-zinc-800',
        ],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4 text-zinc-950" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function AuthDivider({ text = 'or' }: { text?: string }) {
  return (
    <div className="relative flex items-center gap-3">
      <div className="flex-1 h-px bg-zinc-800" />
      <span className="text-xs text-zinc-500 uppercase font-mono">{text}</span>
      <div className="flex-1 h-px bg-zinc-800" />
    </div>
  );
}
