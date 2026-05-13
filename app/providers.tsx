'use client';

import { useAuthBootstrap } from '@/hooks/use-auth-bootstrap';

export function AppProviders({ children }: { children: React.ReactNode }) {
  useAuthBootstrap();
  return <>{children}</>;
}
