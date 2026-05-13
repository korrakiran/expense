'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { signInWithEmail, signInWithGoogle } from '@/lib/firebase/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/layout/app-shell';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin() {
    try {
      setLoading(true);
      await signInWithEmail(email, password);
      router.replace('/dashboard');
      toast.success('Welcome back');
    } catch {
      toast.error('Unable to sign in');
    } finally {
      setLoading(false);
    }
  }

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
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pt-10">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <p className="mt-2 text-app-muted">Sign in to continue</p>
        <div className="mt-8 space-y-3">
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button className="w-full" disabled={loading} onClick={handleEmailLogin}>
            Sign In
          </Button>
          <Button className="w-full" variant="secondary" disabled={loading} onClick={handleGoogleLogin}>
            Continue with Google
          </Button>
          <button className="w-full pt-2 text-sm text-app-muted" onClick={() => router.push('/register')}>
            Create account
          </button>
        </div>
      </motion.div>
    </AppShell>
  );
}
