'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Expense, ExpenseCategory } from '@/types/expense';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const categories: ExpenseCategory[] = ['food', 'shopping', 'transport', 'entertainment', 'bills', 'health', 'travel', 'other'];

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    notes?: string;
  }) => Promise<void>;
  initial?: Expense | null;
}

function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

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

export function ExpenseFormModal({ open, onClose, onSubmit, initial }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '');
  const [category, setCategory] = useState<ExpenseCategory>(initial?.category ?? 'other');
  const [date, setDate] = useState(initial?.date ?? isoDate(new Date()));
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [viewMonth, setViewMonth] = useState(() => new Date(initial?.date ?? isoDate(new Date())));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<{
    title: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    notes?: string;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    const nextDate = initial?.date ?? isoDate(new Date());
    setTitle(initial?.title ?? '');
    setAmount(initial?.amount?.toString() ?? '');
    setCategory(initial?.category ?? 'other');
    setDate(nextDate);
    setNotes(initial?.notes ?? '');
    setViewMonth(new Date(nextDate));
    setIsCalendarOpen(false);
    setConfirmEditOpen(false);
    setPendingPayload(null);
  }, [initial, open]);

  const calendarGrid = useMemo(() => getCalendarGrid(viewMonth), [viewMonth]);
  const selectedDate = useMemo(() => new Date(date), [date]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      title,
      amount: Number(amount),
      category,
      date,
      notes: notes || undefined
    };

    if (initial) {
      setPendingPayload(payload);
      setConfirmEditOpen(true);
      return;
    }

    await onSubmit(payload);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 bg-black/30 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.form
            onSubmit={handleSubmit}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            className="mx-auto mt-20 max-w-[430px] rounded-[30px] bg-white p-5"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{initial ? 'Edit Expense' : 'Add Expense'}</h2>
              <button type="button" onClick={onClose} className="rounded-full bg-[#ececee] p-2">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <Input placeholder="Expense title" required value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input placeholder="Amount" type="number" min="0" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} />
              <select
                className="w-full rounded-2xl border border-app-border bg-white px-4 py-3 text-[15px]"
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <div className="rounded-2xl border border-app-border p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-app-muted">Date</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{formatDateLabel(date)}</p>
                    <button
                      type="button"
                      onClick={() => setIsCalendarOpen((prev) => !prev)}
                      className="rounded-full bg-[#f0f0f2] p-2"
                      aria-label="Toggle calendar"
                    >
                      <CalendarDays size={14} />
                    </button>
                  </div>
                </div>
                {isCalendarOpen && (
                  <>
                    <div className="mb-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                        className="rounded-full bg-[#f0f0f2] p-2"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <p className="text-[15px] font-semibold">{monthLabel(viewMonth)}</p>
                      <button
                        type="button"
                        onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                        className="rounded-full bg-[#f0f0f2] p-2"
                      >
                        <ChevronRight size={16} />
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
                        const isSelected = isoDate(cell) === isoDate(selectedDate);
                        return (
                          <button
                            key={cell.toISOString()}
                            type="button"
                            onClick={() => {
                              setDate(isoDate(cell));
                              setIsCalendarOpen(false);
                            }}
                            className={`h-9 rounded-xl text-sm font-medium transition ${
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
                  </>
                )}
              </div>
              <Input placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <Button className="mt-5 w-full" type="submit">
              Save
            </Button>
          </motion.form>
          <ConfirmDialog
            open={confirmEditOpen}
            title="Update Expense"
            message="Are you sure you want to save these changes?"
            confirmLabel="Update"
            cancelLabel="Cancel"
            onCancel={() => {
              setConfirmEditOpen(false);
              setPendingPayload(null);
            }}
            onConfirm={async () => {
              if (!pendingPayload) return;
              await onSubmit(pendingPayload);
              setConfirmEditOpen(false);
              setPendingPayload(null);
              onClose();
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
