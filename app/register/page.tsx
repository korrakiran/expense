'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/lib/firebase/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    try {
      setLoading(true);
      await signInWithGoogle();
      router.replace('/dashboard');
      toast.success('Signed in with Google');
    } catch {
      toast.error('Google sign in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="pt-10">
        <h1 className="text-3xl font-bold">Create account</h1>
        <p className="mt-2 text-app-muted">Sign up with Google to continue</p>
        <div className="mt-8">
          <Button className="w-full" variant="secondary" disabled={loading} onClick={handleGoogleLogin}>
            Continue with Google
          </Button>
          <button className="w-full pt-4 text-sm text-app-muted" onClick={() => router.push('/login')}>
            Back to login
          </button>
        </div>
      </div>
    </AppShell>
  );
}
