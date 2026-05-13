'use client';

import { create } from 'zustand';
import { Expense } from '@/types/expense';

interface ExpenseState {
  expenses: Expense[];
  searchResults: Expense[];
  setExpenses: (expenses: Expense[]) => void;
  setSearchResults: (expenses: Expense[]) => void;
}

export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: [],
  searchResults: [],
  setExpenses: (expenses) => set({ expenses }),
  setSearchResults: (searchResults) => set({ searchResults })
}));
