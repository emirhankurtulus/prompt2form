'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthInput, AuthButton } from '@/components/auth/AuthComponents';

const Schema = z.object({ email: z.string().email('Enter a valid email') });
type FormData = z.infer<typeof Schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({
    resolver: zodResolver(Schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) setSubmitted(true);
      else toast.error(json.error.message);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6 animate-fade-in text-center">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-800 text-white">
            <Mail size={24} />
          </div>
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Check your email
          </h1>
          <p className="text-xs text-zinc-400">
            If <strong className="text-white">{getValues('email')}</strong> is registered, you&apos;ll receive a password reset link shortly.
          </p>
        </div>
        <div className="rounded-xl p-3.5 text-left bg-zinc-900/60 border border-zinc-800">
          <p className="text-xs text-zinc-400">
            The reset link expires in <strong className="text-white">1 hour</strong>. Check your spam folder if you don&apos;t see the email.
          </p>
        </div>
        <Link href="/sign-in" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:underline">
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Forgot your password?
        </h1>
        <p className="text-xs text-zinc-400">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthInput
          label="Email address"
          type="email"
          placeholder="you@example.com"
          icon={<Mail size={15} />}
          error={errors.email?.message}
          autoFocus
          {...register('email')}
        />
        <AuthButton type="submit" isLoading={isLoading}>
          Send reset link
        </AuthButton>
      </form>

      <Link href="/sign-in" className="flex items-center justify-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft size={14} />
        Back to sign in
      </Link>
    </div>
  );
}
