'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ExpenseCategory } from '@/types/expense';

const categories: ExpenseCategory[] = ['food', 'shopping', 'transport', 'entertainment', 'bills', 'health', 'travel', 'other'];

export interface ExpenseFilters {
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
  categories: ExpenseCategory[];
}

interface FilterSheetProps {
  open: boolean;
  value: ExpenseFilters;
  onChange: (next: ExpenseFilters) => void;
  onClose: () => void;
  onReset: () => void;
}

export function FilterSheet({ open, value, onChange, onClose, onReset }: FilterSheetProps) {
  function toggleCategory(category: ExpenseCategory) {
    const exists = value.categories.includes(category);
    const next = exists
      ? value.categories.filter((c) => c !== category)
      : [...value.categories, category];
    onChange({ ...value, categories: next });
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
              <h3 className="text-xl font-semibold">Filters</h3>
              <button type="button" onClick={onClose} className="rounded-full bg-[#efeff1] p-2">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-app-muted">Date Range</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={value.dateFrom}
                    onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
                    className="rounded-2xl border border-app-border px-3 py-3 text-sm"
                  />
                  <input
                    type="date"
                    value={value.dateTo}
                    onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
                    className="rounded-2xl border border-app-border px-3 py-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-app-muted">Amount</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={value.minAmount}
                    onChange={(e) => onChange({ ...value, minAmount: e.target.value })}
                    className="rounded-2xl border border-app-border px-3 py-3 text-sm"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={value.maxAmount}
                    onChange={(e) => onChange({ ...value, maxAmount: e.target.value })}
                    className="rounded-2xl border border-app-border px-3 py-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-app-muted">Category</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const active = value.categories.includes(category);
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={`rounded-full px-3 py-2 text-xs font-semibold capitalize transition ${
                          active ? 'bg-black text-white' : 'bg-[#f1f1f3] text-black'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={onReset}
                className="flex-1 rounded-full border border-app-border bg-white px-4 py-3 text-sm font-semibold"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full bg-black px-4 py-3 text-sm font-semibold text-white"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
