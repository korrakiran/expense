'use client';

import { create } from 'zustand';
import { ExpenseDatabase } from '@/types/database';

interface DatabaseState {
  databases: ExpenseDatabase[];
  activeDatabaseId: string | null;
  setDatabases: (databases: ExpenseDatabase[]) => void;
  setActiveDatabaseId: (id: string) => void;
}

export const useDatabaseStore = create<DatabaseState>((set) => ({
  databases: [],
  activeDatabaseId: null,
  setDatabases: (databases) => set({ databases }),
  setActiveDatabaseId: (activeDatabaseId) => set({ activeDatabaseId })
}));
