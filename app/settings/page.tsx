'use client';

import { ChevronLeft, Coins, CalendarDays, LogOut, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { AppProviders } from '@/app/providers';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { SettingsItem } from '@/components/settings/settings-item';
import { useProtectedRoute } from '@/hooks/use-protected-route';
import { useSettingsStore } from '@/store/use-settings-store';
import { updateSettings } from '@/lib/firebase/firestore';
import { signOutUser } from '@/lib/firebase/auth';
import { useExpenseStore } from '@/store/use-expense-store';
import { useDatabaseStore } from '@/store/use-database-store';
import { useState } from 'react';
import { ExportExpensesSheet } from '@/components/settings/export-expenses-sheet';

function SettingsView() {
  const router = useRouter();
  const { user, loading } = useProtectedRoute();
  const { settings, setSettings } = useSettingsStore();
  const { expenses } = useExpenseStore();
  const { databases, activeDatabaseId } = useDatabaseStore();
  const [exportOpen, setExportOpen] = useState(false);

  const activeDbName = databases.find((d) => d.id === activeDatabaseId)?.name ?? 'expenses';

  if (loading || !user) return <AppShell><div className="pt-20 text-center text-app-muted">Loading...</div></AppShell>;

  async function patchSettings(next: typeof settings) {
    if (!user) return;
    setSettings(next);
    await updateSettings(user.uid, next);
    toast.success('Saved');
  }

  return (
    <AppShell>
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="rounded-full bg-[#efeff1] p-2"><ChevronLeft size={18} /></button>
          <h1 className="text-xl font-semibold">Settings</h1>
          <div className="w-8" />
        </div>

        <h2 className="mb-2 text-sm font-semibold text-app-muted">Preferences</h2>
        <SettingsItem icon={Coins} label="Currency" value={settings.currency} onClick={() => patchSettings({ ...settings, currency: settings.currency === 'INR' ? 'USD' : 'INR' })} />
        <div className="border-b border-app-border" />
        <SettingsItem icon={CalendarDays} label="Start Week On" value={settings.weekStart === 'monday' ? 'Monday' : 'Sunday'} onClick={() => patchSettings({ ...settings, weekStart: settings.weekStart === 'monday' ? 'sunday' : 'monday' })} />

        <h2 className="mb-2 mt-5 text-sm font-semibold text-app-muted">Data</h2>
        <SettingsItem
          icon={Download}
          label="Download Expenses"
          value={`${expenses.length} records`}
          onClick={() => setExportOpen(true)}
        />

        <button
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-semibold text-white"
          onClick={async () => {
            await signOutUser();
            router.replace('/login');
          }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </Card>
      <ExportExpensesSheet
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        expenses={expenses}
        currency={settings.currency}
        fileLabel={activeDbName}
      />
    </AppShell>
  );
}

export default function SettingsPage() {
  return (
    <AppProviders>
      <SettingsView />
    </AppProviders>
  );
}
