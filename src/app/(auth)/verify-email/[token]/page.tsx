'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { AuthButton } from '@/components/auth/AuthComponents';

type State = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const params = useParams();
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [state, setState] = useState<State>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = params.token as string;
    if (!token) { setState('error'); setErrorMsg('Invalid verification link.'); return; }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setState('success');
          // Refresh session user
          fetch('/api/auth/me').then((r) => r.json()).then((me) => {
            if (me.success) setUser(me.data);
          });
        } else {
          setState('error');
          setErrorMsg(json.error.message);
        }
      })
      .catch(() => { setState('error'); setErrorMsg('Verification failed. Please try again.'); });
  }, [params.token, setUser]);

  return (
    <div className="space-y-6 animate-fade-in text-center">
      {state === 'loading' && (
        <>
          <div className="flex justify-center">
            <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Verifying your email...</h1>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Please wait a moment.</p>
          </div>
        </>
      )}

      {state === 'success' && (
        <>
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)' }}>
              <CheckCircle2 size={32} style={{ color: '#22c55e' }} />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Email verified!</h1>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Your account is now active. Welcome to Prompt2Form!</p>
          </div>
          <AuthButton onClick={() => router.push('/dashboard')}>Go to dashboard →</AuthButton>
        </>
      )}

      {state === 'error' && (
        <>
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.3)' }}>
              <XCircle size={32} style={{ color: '#ef4444' }} />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Verification failed</h1>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{errorMsg}</p>
          </div>
          <Link href="/sign-up" className="block text-sm font-medium hover:underline" style={{ color: 'var(--primary)' }}>
            Create a new account
          </Link>
        </>
      )}
    </div>
  );
}
