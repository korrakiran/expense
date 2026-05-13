export type ExpenseCategory =
  | 'food'
  | 'shopping'
  | 'transport'
  | 'entertainment'
  | 'bills'
  | 'health'
  | 'travel'
  | 'other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  createdAt: number;
  updatedAt: number;
  notes?: string;
  userId: string;
}

export interface ExpenseInput {
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
}
