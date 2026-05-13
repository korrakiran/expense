'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { AppShell } from '@/components/layout/app-shell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { signUpWithEmail } from '@/lib/firebase/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleRegister() {
    try {
      await signUpWithEmail(email, password);
      toast.success('Account created');
      router.replace('/dashboard');
    } catch {
      toast.error('Unable to create account');
    }
  }

  return (
    <AppShell>
      <div className="pt-10">
        <h1 className="text-3xl font-bold">Create account</h1>
        <div className="mt-8 space-y-3">
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button className="w-full" onClick={handleRegister}>
            Continue
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
