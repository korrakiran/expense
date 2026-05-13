import { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-[430px] bg-app-bg px-4 safe-pt safe-pb">
      {children}
    </main>
  );
}
