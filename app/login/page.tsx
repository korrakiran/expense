'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { signInWithGoogle } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/layout/app-shell';

export default function LoginPage() {
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
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pt-10">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <p className="mt-2 text-app-muted">Sign in to continue</p>
        <div className="mt-8">
          <Button className="w-full" variant="secondary" disabled={loading} onClick={handleGoogleLogin}>
            Continue with Google
          </Button>
        </div>
      </motion.div>
    </AppShell>
  );
}
