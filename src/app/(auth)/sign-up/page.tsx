'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { toast } from 'sonner';
import { Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { AuthInput, AuthButton } from '@/components/auth/AuthComponents';

const SignUpSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignUpForm = z.infer<typeof SignUpSchema>;

export default function SignUpPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpForm>({ resolver: zodResolver(SignUpSchema) });

  const password = watch('password', '');

  const passwordStrength = (() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'][passwordStrength];

  const onSubmit = async (data: SignUpForm) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.error.message);
        return;
      }

      setSubmittedEmail(data.email);
      setSubmitted(true);
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
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30">
            <CheckCircle2 size={28} className="text-emerald-500" />
          </div>
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Check your inbox
          </h1>
          <p className="text-xs text-zinc-400">
            We sent a verification link to
          </p>
          <p className="text-xs font-semibold text-white">
            {submittedEmail}
          </p>
        </div>
        <div className="rounded-xl p-4 text-left space-y-2 bg-zinc-900/60 border border-zinc-800">
          {['Click the link in the email to verify your account', 'Check your spam folder if you don\'t see it', 'The link expires in 24 hours'].map((t, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="font-bold text-white mt-0.5">{i + 1}.</span>
              <p className="text-zinc-400">{t}</p>
            </div>
          ))}
        </div>
        <Link href="/sign-in" className="block text-xs font-semibold text-white hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Create your account
        </h1>
        <p className="text-xs text-zinc-400">
          Free forever. 4 forms per month included.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthInput
          label="Full name"
          type="text"
          placeholder="Jane Smith"
          icon={<User size={15} />}
          error={errors.name?.message}
          {...register('name')}
        />
        <AuthInput
          label="Email address"
          type="email"
          placeholder="you@example.com"
          icon={<Mail size={15} />}
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="space-y-1.5">
          <AuthInput
            label="Password"
            type="password"
            placeholder="Create a strong password"
            icon={<Lock size={15} />}
            error={errors.password?.message}
            {...register('password')}
          />
          {password.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{
                      background: i <= passwordStrength ? strengthColor : '#27272a',
                    }}
                  />
                ))}
              </div>
              {strengthLabel && (
                <p className="text-xs font-medium" style={{ color: strengthColor }}>
                  {strengthLabel} password
                </p>
              )}
            </div>
          )}
        </div>
        <AuthInput
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          icon={<Lock size={15} />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <AuthButton type="submit" isLoading={isLoading} className="mt-2">
          Create account
        </AuthButton>
      </form>

      <p className="text-xs text-center text-zinc-500">
        By signing up, you agree to our{' '}
        <Link href="/terms" className="underline hover:text-zinc-300">Terms</Link>
        {' '}and{' '}
        <Link href="/privacy" className="underline hover:text-zinc-300">Privacy Policy</Link>.
      </p>

      <p className="text-center text-xs text-zinc-400">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-semibold text-white hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
