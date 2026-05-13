'use client';

import { Calendar, Pencil, Trash2 } from 'lucide-react';
import { Expense } from '@/types/expense';
import { formatCurrency } from '@/lib/utils/currency';
import { CurrencyCode } from '@/types/settings';

interface Props {
  expense: Expense;
  currency: CurrencyCode;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseItem({ expense, currency, onEdit, onDelete }: Props) {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1f1f3]">
        <Calendar size={18} />
      </div>
      <div className="flex-1">
        <div className="text-[16px] font-semibold">{expense.title}</div>
        <div className="text-xs text-app-muted">{new Date(expense.date).toDateString()}</div>
      </div>
      <div className="text-right">
        <div className="text-[16px] font-semibold">{formatCurrency(expense.amount, currency)}</div>
        <div className="mt-1 flex items-center gap-2">
          <button onClick={() => onEdit(expense)} aria-label="edit" className="text-app-muted">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(expense)} aria-label="delete" className="text-app-muted">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
