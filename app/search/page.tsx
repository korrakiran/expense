'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { AppProviders } from '@/app/providers';
import { AppShell } from '@/components/layout/app-shell';
import { useProtectedRoute } from '@/hooks/use-protected-route';
import { subscribeExpenseSearch } from '@/lib/firebase/firestore';
import { useExpenseStore } from '@/store/use-expense-store';
import { useSettingsStore } from '@/store/use-settings-store';
import { ExpenseItem } from '@/components/expense/expense-item';
import { removeExpense } from '@/lib/firebase/firestore';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDatabaseStore } from '@/store/use-database-store';

function SearchView() {
  const router = useRouter();
  const { user, loading } = useProtectedRoute();
  const { searchResults, setSearchResults } = useExpenseStore();
  const { settings } = useSettingsStore();
  const { activeDatabaseId } = useDatabaseStore();
  const [term, setTerm] = useState('');
  const [deleting, setDeleting] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (!user || !term.trim() || !activeDatabaseId) {
      setSearchResults([]);
      return;
    }
    const unsub = subscribeExpenseSearch(user.uid, activeDatabaseId, term.trim(), setSearchResults);
    return () => unsub();
  }, [term, setSearchResults, user, activeDatabaseId]);

  if (loading || !user || !activeDatabaseId) return <AppShell><div className="pt-20 text-center text-app-muted">Loading...</div></AppShell>;

  return (
    <AppShell>
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-3">
          <Search size={18} className="text-app-muted" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search expenses"
            className="w-full bg-transparent text-[15px] outline-none"
          />
        </div>
        <button onClick={() => router.back()} className="rounded-full bg-white p-3">
          <X size={18} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!term ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-28 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white"><Search size={28} /></div>
            <h2 className="mt-5 text-2xl font-semibold">Search Expenses</h2>
            <p className="mt-2 text-sm text-app-muted">Enter a search term to find expenses</p>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 rounded-[28px] bg-white px-4">
            {searchResults.map((expense, idx) => (
              <div key={expense.id} className={idx !== searchResults.length - 1 ? 'border-b border-app-border' : ''}>
                <ExpenseItem
                  expense={expense}
                  currency={settings.currency}
                  onEdit={() => router.push('/dashboard')}
                  onDelete={async (e) => {
                    setDeleting({ id: e.id, title: e.title });
                  }}
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete Expense"
        message={deleting ? `Are you sure you want to delete "${deleting.title}"?` : ''}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await removeExpense(user.uid, activeDatabaseId, deleting.id);
          toast.success('Expense deleted');
          setDeleting(null);
        }}
      />
    </AppShell>
  );
}

export default function SearchPage() {
  return (
    <AppProviders>
      <SearchView />
    </AppProviders>
  );
}
