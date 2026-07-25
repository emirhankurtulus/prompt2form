'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Mail, Lock, AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';
import { AuthInput, AuthButton } from '@/components/auth/AuthComponents';
import { useAuthStore } from '@/store/authStore';

const LoginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof LoginSchema>;

export default function SignInPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [isLoading, setIsLoading] = useState(false);

  // Unverified email state
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
  } = useForm<LoginForm>({ resolver: zodResolver(LoginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setEmailNotVerified(false);
    setResendSent(false);
    setGeneralError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!json.success) {
        if (json.error.code === 'EMAIL_NOT_VERIFIED') {
          setEmailNotVerified(true);
          setUnverifiedEmail(data.email);
          setGeneralError(json.error.message || 'Please verify your email address before logging in.');
          toast.error('Email address not verified.');
        } else {
          setGeneralError(json.error.message);
          setError('password', { message: json.error.message });
        }
        return;
      }

      setUser(json.data.user);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch {
      toast.error('Something went wrong. Please try again.');
      setGeneralError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = unverifiedEmail || getValues('email');
    if (!targetEmail) return;

    setResendLoading(true);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });
      const json = await res.json();

      if (json.success) {
        setResendSent(true);
        toast.success('Verification email resent! Please check your inbox.');
      } else {
        toast.error(json.error.message || 'Failed to resend verification email.');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Welcome back
        </h1>
        <p className="text-xs text-zinc-400">
          Sign in to your Prompt2Form account
        </p>
      </div>

      {/* Unverified Email Alert Banner */}
      {emailNotVerified && (
        <div className="rounded-xl p-4 space-y-3 bg-red-500/10 border border-red-500/20 text-red-400">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs space-y-1">
              <p className="font-semibold text-white">
                Email address not verified
              </p>
              <p className="text-zinc-300">
                Please verify your email address (<strong>{unverifiedEmail}</strong>) before signing in.
              </p>
            </div>
          </div>
          <div className="pt-1 flex justify-end">
            <button
              type="button"
              disabled={resendLoading || resendSent}
              onClick={handleResendVerification}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer bg-white text-zinc-950 hover:bg-zinc-200"
            >
              {resendLoading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Sending...</span>
                </>
              ) : resendSent ? (
                <>
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <span>Email Resent! Check Inbox</span>
                </>
              ) : (
                <>
                  <Send size={12} />
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* General Error Banner */}
      {generalError && !emailNotVerified && (
        <div className="rounded-xl p-3 flex items-center gap-2.5 text-xs bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle size={15} className="flex-shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            placeholder="Enter your password"
            icon={<Lock size={15} />}
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <AuthButton type="submit" isLoading={isLoading} className="mt-2">
          Sign in
        </AuthButton>
      </form>

      {/* Sign up link */}
      <p className="text-center text-xs text-zinc-400">
        Don&apos;t have an account?{' '}
        <Link
          href="/sign-up"
          className="font-semibold text-white hover:underline"
        >
          Sign up for free
        </Link>
      </p>

      {/* Free plan info */}
      <div className="rounded-xl p-3 text-center bg-zinc-900/60 border border-zinc-800">
        <p className="text-xs text-zinc-400">
          🎁 Free plan includes <span className="font-semibold text-white">4 forms per month</span> — no credit card required
        </p>
      </div>
    </div>
  );
}
