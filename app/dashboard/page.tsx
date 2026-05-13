'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Filter, Plus, Search, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { AppProviders } from '@/app/providers';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { SpendingChart } from '@/components/charts/spending-chart';
import { useProtectedRoute } from '@/hooks/use-protected-route';
import { useExpenseStore } from '@/store/use-expense-store';
import { useSettingsStore } from '@/store/use-settings-store';
import { formatCurrency } from '@/lib/utils/currency';
import { ExpenseFormModal } from '@/components/expense/expense-form-modal';
import { createDatabase, createExpense, removeExpense, renameDatabase, subscribeExpenses, updateExpense, updateSettings } from '@/lib/firebase/firestore';
import { Expense } from '@/types/expense';
import { ExpenseItem } from '@/components/expense/expense-item';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ExpenseFilters, FilterSheet } from '@/components/expense/filter-sheet';
import { useDatabaseStore } from '@/store/use-database-store';
import { DatabaseSwitcher } from '@/components/expense/database-switcher';

const DEFAULT_FILTERS: ExpenseFilters = {
  dateFrom: '',
  dateTo: '',
  minAmount: '',
  maxAmount: '',
  categories: []
};

function DashboardView() {
  const router = useRouter();
  const { user, loading } = useProtectedRoute();
  const { expenses, setExpenses } = useExpenseStore();
  const { settings, setSettings } = useSettingsStore();
  const { databases, activeDatabaseId, setActiveDatabaseId } = useDatabaseStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<ExpenseFilters>(DEFAULT_FILTERS);
  const [databaseOpen, setDatabaseOpen] = useState(false);

  useEffect(() => {
    if (!user || !activeDatabaseId) return;
    const unsub = subscribeExpenses(user.uid, activeDatabaseId, setExpenses);
    return () => unsub();
  }, [user, activeDatabaseId, setExpenses]);

  const filteredExpenses = useMemo(() => {
    const min = filters.minAmount ? Number(filters.minAmount) : null;
    const max = filters.maxAmount ? Number(filters.maxAmount) : null;
    const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const to = filters.dateTo ? new Date(filters.dateTo) : null;

    if (to) to.setHours(23, 59, 59, 999);

    return expenses.filter((expense) => {
      const amountOk = (min === null || expense.amount >= min) && (max === null || expense.amount <= max);
      const categoryOk = !filters.categories.length || filters.categories.includes(expense.category);
      const expenseDate = new Date(expense.date);
      const dateOk = (!from || expenseDate >= from) && (!to || expenseDate <= to);
      return amountOk && categoryOk && dateOk;
    });
  }, [expenses, filters.categories, filters.dateFrom, filters.dateTo, filters.maxAmount, filters.minAmount]);

  const totalSpent = useMemo(() => filteredExpenses.reduce((sum, e) => sum + e.amount, 0), [filteredExpenses]);

  const chartData = useMemo(() => {
    const grouped = new Map<string, number>();
    filteredExpenses.forEach((e) => {
      const year = new Date(e.date).getFullYear().toString();
      grouped.set(year, (grouped.get(year) ?? 0) + e.amount);
    });
    return Array.from(grouped.entries()).map(([year, value]) => ({ year, value }));
  }, [filteredExpenses]);

  const hasActiveFilters =
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo) ||
    Boolean(filters.minAmount) ||
    Boolean(filters.maxAmount) ||
    filters.categories.length > 0;

  const activeDbName = databases.find((d) => d.id === activeDatabaseId)?.name ?? 'Expenses';

  if (loading || !user || !activeDatabaseId) {
    return (
      <AppShell>
        <div className="pt-20 text-center text-app-muted">Loading...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between">
          <button onClick={() => setDatabaseOpen(true)} className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[16px] font-semibold shadow-sm">
            {activeDbName} <ChevronDown size={16} />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/search')} className="rounded-full bg-white p-3 shadow-sm"><Search size={18} /></button>
            <button
              onClick={() => setFiltersOpen(true)}
              className={`rounded-full p-3 shadow-sm ${hasActiveFilters ? 'bg-black text-white' : 'bg-white'}`}
            >
              <Filter size={18} />
            </button>
            <button onClick={() => router.push('/settings')} className="rounded-full bg-white p-3 shadow-sm"><Settings size={18} /></button>
          </div>
        </div>

        <Card className="mt-5 p-5">
          <p className="text-sm text-app-muted">Spent all time</p>
          <h2 className="mt-2 text-[34px] font-bold tracking-tight">{formatCurrency(totalSpent, settings.currency)}</h2>
          <SpendingChart data={chartData.length ? chartData : [{ year: '2026', value: 0 }]} />
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <h3 className="text-[26px] font-bold tracking-tight">Latest</h3>
        </div>

        <Card className="mt-3 px-4">
          {filteredExpenses.slice(0, 8).map((expense, idx) => (
            <div key={expense.id} className={idx !== filteredExpenses.slice(0, 8).length - 1 ? 'border-b border-app-border' : ''}>
              <ExpenseItem
                expense={expense}
                currency={settings.currency}
                onEdit={(e) => {
                  setEditing(e);
                  setOpen(true);
                }}
                onDelete={async (e) => {
                  setDeleting(e);
                }}
              />
            </div>
          ))}
          {!filteredExpenses.length && (
            <p className="py-10 text-center text-sm text-app-muted">
              {expenses.length ? 'No expenses match your filters' : 'No expenses yet'}
            </p>
          )}
        </Card>
      </motion.div>

      <button
        onClick={() => {
          setEditing(null);
          setOpen(true);
        }}
        className="fixed bottom-8 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-soft"
      >
        <Plus size={24} />
      </button>

      <ExpenseFormModal
        open={open}
        initial={editing}
        onClose={() => setOpen(false)}
        onSubmit={async (payload) => {
          if (editing) {
            await updateExpense(user.uid, activeDatabaseId, editing.id, payload);
            toast.success('Expense updated');
            return;
          }
          await createExpense(user.uid, activeDatabaseId, payload);
          toast.success('Expense added');
        }}
      />
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
      <FilterSheet
        open={filtersOpen}
        value={filters}
        onChange={setFilters}
        onClose={() => setFiltersOpen(false)}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />
      <DatabaseSwitcher
        open={databaseOpen}
        databases={databases}
        activeDatabaseId={activeDatabaseId}
        onClose={() => setDatabaseOpen(false)}
        onRename={async (id, name) => {
          await renameDatabase(user.uid, id, name);
          toast.success('Database renamed');
        }}
        onCreate={async (name) => {
          const id = await createDatabase(user.uid, name);
          setActiveDatabaseId(id);
          const nextSettings = { ...settings, activeDatabaseId: id };
          setSettings(nextSettings);
          await updateSettings(user.uid, nextSettings);
          toast.success('Database created');
          setDatabaseOpen(false);
        }}
        onSelect={async (id) => {
          setActiveDatabaseId(id);
          const nextSettings = { ...settings, activeDatabaseId: id };
          setSettings(nextSettings);
          await updateSettings(user.uid, nextSettings);
          toast.success('Database switched');
          setDatabaseOpen(false);
        }}
      />
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <AppProviders>
      <DashboardView />
    </AppProviders>
  );
}
