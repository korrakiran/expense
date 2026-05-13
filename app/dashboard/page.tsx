'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, Filter, Plus, Search, Settings } from 'lucide-react';
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const expensesForWeek = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate() - currentDate.getDay()); // Sunday
    
    return filteredExpenses.filter((e) => {
      const d = new Date(e.date);
      const diffTime = d.getTime() - start.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays < 7;
    });
  }, [filteredExpenses, currentDate]);

  const weekTotal = useMemo(() => {
    return expensesForWeek.reduce((sum, e) => sum + e.amount, 0);
  }, [expensesForWeek]);

  const expensesForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    return filteredExpenses.filter((e) => {
      const d = new Date(e.date);
      return (
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getDate() === selectedDate.getDate()
      );
    });
  }, [filteredExpenses, selectedDate]);

  const dayTotal = useMemo(() => {
    return expensesForSelectedDay.reduce((sum, e) => sum + e.amount, 0);
  }, [expensesForSelectedDay]);

  const displayExpenses = selectedDate ? expensesForSelectedDay : expensesForWeek;

  const isCurrentWeek = useMemo(() => {
    const today = new Date();
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() - today.getDay());
    
    const startOfViewWeek = new Date(currentDate);
    startOfViewWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    return startOfCurrentWeek.toDateString() === startOfViewWeek.toDateString();
  }, [currentDate]);

  const chartData = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate() - currentDate.getDay()); // Sunday
    
    const labels: string[] = [];
    const values = [0, 0, 0, 0, 0, 0, 0];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      labels.push(d.getDate().toString());
    }
    
    filteredExpenses.forEach((e) => {
      const d = new Date(e.date);
      // Check if expense date is in the selected week
      const diffTime = d.getTime() - start.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      if (diffDays >= 0 && diffDays < 7) {
        const dayIdx = d.getDay(); // 0 is Sunday
        values[dayIdx] += e.amount;
      }
    });
    
    return labels.map((label, idx) => ({ label, value: values[idx] }));
  }, [filteredExpenses, currentDate]);

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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-app-muted">{selectedDate ? 'Spent on this day' : 'Spent this week'}</p>
              <h2 className="mt-2 text-[34px] font-bold tracking-tight">
                {formatCurrency(selectedDate ? dayTotal : weekTotal, settings.currency)}
              </h2>
            </div>
            <div className="flex items-center gap-2 bg-[#f5f5f6] p-1 rounded-full text-xs font-medium">
              <button 
                onClick={() => {
                  const prev = new Date(currentDate);
                  prev.setDate(currentDate.getDate() - 7);
                  setCurrentDate(prev);
                  setSelectedDate(null); // Clear selection to show week
                }} 
                className="p-1.5 hover:bg-white rounded-full transition"
              >
                <ChevronLeft size={14} />
              </button>
              <input 
                type="date" 
                value={(selectedDate || (isCurrentWeek ? new Date() : currentDate)).toISOString().split('T')[0]} 
                onChange={(e) => {
                  const d = new Date(e.target.value);
                  setSelectedDate(d);
                  setCurrentDate(d);
                }}
                className="bg-transparent border-none focus:outline-none text-xs font-medium cursor-pointer"
              />
              <button 
                onClick={() => {
                  const next = new Date(currentDate);
                  next.setDate(currentDate.getDate() + 7);
                  setCurrentDate(next);
                  setSelectedDate(null); // Clear selection to show week
                }} 
                className="p-1.5 hover:bg-white rounded-full transition"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <SpendingChart data={chartData} />
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <h3 className="text-[26px] font-bold tracking-tight">Expenses</h3>
        </div>

        <Card className="mt-3 px-4">
          {displayExpenses.map((expense, idx) => (
            <div key={expense.id} className={idx !== displayExpenses.length - 1 ? 'border-b border-app-border' : ''}>
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
