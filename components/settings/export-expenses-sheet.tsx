'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Expense, ExpenseCategory } from '@/types/expense';
import { CurrencyCode } from '@/types/settings';
import { useMemo, useState } from 'react';

const categories: ExpenseCategory[] = ['food', 'shopping', 'transport', 'entertainment', 'bills', 'health', 'travel', 'other'];

interface Props {
  open: boolean;
  onClose: () => void;
  expenses: Expense[];
  currency: CurrencyCode;
  fileLabel?: string;
}

interface ExportFilters {
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
  categories: ExpenseCategory[];
}

const DEFAULT_FILTERS: ExportFilters = {
  dateFrom: '',
  dateTo: '',
  minAmount: '',
  maxAmount: '',
  categories: []
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthLabel(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function isoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateLabel(value: string) {
  if (!value) return 'Select date';
  return new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getCalendarGrid(viewMonth: Date) {
  const start = startOfMonth(viewMonth);
  const firstWeekday = start.getDay();
  const gridStart = new Date(start);
  gridStart.setDate(start.getDate() - firstWeekday);
  return Array.from({ length: 42 }, (_, i) => {
    const cell = new Date(gridStart);
    cell.setDate(gridStart.getDate() + i);
    return cell;
  });
}

export function ExportExpensesSheet({ open, onClose, expenses, currency, fileLabel = 'expenses' }: Props) {
  const [filters, setFilters] = useState<ExportFilters>(DEFAULT_FILTERS);
  const [downloading, setDownloading] = useState(false);
  const [calendarField, setCalendarField] = useState<'from' | 'to' | null>(null);
  const [viewMonth, setViewMonth] = useState(new Date());

  const calendarGrid = useMemo(() => getCalendarGrid(viewMonth), [viewMonth]);

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

  function toggleCategory(category: ExpenseCategory) {
    const exists = filters.categories.includes(category);
    setFilters((prev) => ({
      ...prev,
      categories: exists ? prev.categories.filter((c) => c !== category) : [...prev.categories, category]
    }));
  }

  function openCalendar(field: 'from' | 'to') {
    const current = field === 'from' ? filters.dateFrom : filters.dateTo;
    setViewMonth(current ? new Date(current) : new Date());
    setCalendarField(field);
  }

  function selectDate(date: Date) {
    const value = isoDate(date);
    if (calendarField === 'from') {
      setFilters((prev) => ({ ...prev, dateFrom: value }));
    }
    if (calendarField === 'to') {
      setFilters((prev) => ({ ...prev, dateTo: value }));
    }
    setCalendarField(null);
  }

  async function downloadXlsx() {
    try {
      setDownloading(true);
      const XLSX = await import('xlsx');

      const rows = filteredExpenses.map((expense) => ({
        Title: expense.title,
        Amount: expense.amount,
        Category: expense.category,
        Date: expense.date,
        Notes: expense.notes ?? '',
        Currency: currency,
        CreatedAt: new Date(expense.createdAt).toISOString(),
        UpdatedAt: new Date(expense.updatedAt).toISOString()
      }));

      if (!rows.length) {
        toast.error('No expenses to export');
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');

      const out = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([out], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const date = isoDate(new Date());
      const safeLabel = fileLabel.replace(/\s+/g, '-').toLowerCase();
      const fileName = `${safeLabel}-${date}.xlsx`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('Downloaded .xlsx');
      onClose();
    } catch {
      toast.error('Unable to export right now');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] bg-black/35" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 mx-auto w-full max-w-[430px] rounded-t-[30px] bg-white p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Download Expenses</h3>
              <button type="button" onClick={onClose} className="rounded-full bg-[#efeff1] p-2">
                <X size={16} />
              </button>
            </div>

            <p className="mb-3 text-sm text-app-muted">{filteredExpenses.length} expenses selected</p>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-app-muted">Date Range</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openCalendar('from')}
                    className="flex items-center justify-between rounded-2xl border border-app-border px-3 py-3 text-left text-sm"
                  >
                    <span>{formatDateLabel(filters.dateFrom)}</span>
                    <CalendarDays size={15} className="text-app-muted" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openCalendar('to')}
                    className="flex items-center justify-between rounded-2xl border border-app-border px-3 py-3 text-left text-sm"
                  >
                    <span>{formatDateLabel(filters.dateTo)}</span>
                    <CalendarDays size={15} className="text-app-muted" />
                  </button>
                </div>
                {calendarField && (
                  <div className="mt-3 rounded-2xl border border-app-border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                        className="rounded-full bg-[#f0f0f2] p-2"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <p className="text-sm font-semibold">{monthLabel(viewMonth)}</p>
                      <button
                        type="button"
                        onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                        className="rounded-full bg-[#f0f0f2] p-2"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                    <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-app-muted">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                        <div key={`${d}-${idx}`} className="py-1">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {calendarGrid.map((cell) => {
                        const inMonth = cell.getMonth() === viewMonth.getMonth();
                        const selectedValue = calendarField === 'from' ? filters.dateFrom : filters.dateTo;
                        const isSelected = selectedValue ? isoDate(cell) === selectedValue : false;
                        return (
                          <button
                            key={cell.toISOString()}
                            type="button"
                            onClick={() => selectDate(cell)}
                            className={`h-8 rounded-lg text-xs font-medium ${
                              isSelected
                                ? 'bg-black text-white'
                                : inMonth
                                  ? 'text-black hover:bg-[#f4f4f5]'
                                  : 'text-[#b2b2b8]'
                            }`}
                          >
                            {cell.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-app-muted">Amount</p>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min="0" placeholder="Min" value={filters.minAmount} onChange={(e) => setFilters((p) => ({ ...p, minAmount: e.target.value }))} className="rounded-2xl border border-app-border px-3 py-3 text-sm" />
                  <input type="number" min="0" placeholder="Max" value={filters.maxAmount} onChange={(e) => setFilters((p) => ({ ...p, maxAmount: e.target.value }))} className="rounded-2xl border border-app-border px-3 py-3 text-sm" />
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-app-muted">Category</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const active = filters.categories.includes(category);
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={`rounded-full px-3 py-2 text-xs font-semibold capitalize ${active ? 'bg-black text-white' : 'bg-[#f1f1f3] text-black'}`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button type="button" onClick={() => setFilters(DEFAULT_FILTERS)} className="flex-1 rounded-full border border-app-border bg-white px-4 py-3 text-sm font-semibold">Reset</button>
              <button type="button" disabled={downloading} onClick={downloadXlsx} className="flex-1 rounded-full bg-black px-4 py-3 text-sm font-semibold text-white">
                <span className="inline-flex items-center gap-2"><Download size={14} /> {downloading ? 'Preparing...' : 'Download .xlsx'}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
