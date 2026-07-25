'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Lock, CheckCircle2 } from 'lucide-react';
import { AuthInput, AuthButton } from '@/components/auth/AuthComponents';

const Schema = z
  .object({
    password: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Must contain uppercase').regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof Schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(Schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      });
      const json = await res.json();
      if (!json.success) { toast.error(json.error.message); return; }
      setDone(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-6 animate-fade-in text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)' }}>
            <CheckCircle2 size={32} style={{ color: '#22c55e' }} />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Password updated!</h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Your password has been reset successfully.</p>
        </div>
        <AuthButton onClick={() => router.push('/sign-in')}>Continue to sign in</AuthButton>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Reset your password</h1>
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Choose a new strong password for your account.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthInput label="New password" type="password" placeholder="At least 8 characters" icon={<Lock size={15} />} error={errors.password?.message} {...register('password')} />
        <AuthInput label="Confirm new password" type="password" placeholder="Repeat your password" icon={<Lock size={15} />} error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <AuthButton type="submit" isLoading={isLoading}>Reset password</AuthButton>
      </form>
      <p className="text-center text-sm" style={{ color: 'var(--foreground-muted)' }}>
        Remembered it?{' '}
        <Link href="/sign-in" className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>Sign in</Link>
      </p>
    </div>
  );
}
