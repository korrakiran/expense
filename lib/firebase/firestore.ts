import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from './client';
import { Expense, ExpenseInput } from '@/types/expense';
import { DEFAULT_SETTINGS } from '@/constants/settings';
import { UserSettings } from '@/types/settings';
import { ExpenseDatabase } from '@/types/database';

const DEFAULT_DATABASE_ID = 'default';

function databasesCollectionRef(userId: string) {
  return collection(db, 'users', userId, 'databases');
}

function expenseCollectionRef(userId: string, databaseId: string) {
  return collection(db, 'users', userId, 'databases', databaseId, 'expenses');
}

async function ensureDefaultDatabase(userId: string) {
  const ref = doc(db, 'users', userId, 'databases', DEFAULT_DATABASE_ID);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const now = Date.now();
    await setDoc(ref, {
      name: 'Expenses',
      createdAt: now,
      updatedAt: now
    });
  }
}

export async function createDatabase(userId: string, name: string): Promise<string> {
  const now = Date.now();
  const cleanName = name.trim() || 'New Database';
  const ref = await addDoc(databasesCollectionRef(userId), {
    name: cleanName,
    createdAt: now,
    updatedAt: now,
    ts: serverTimestamp()
  });
  return ref.id;
}

export async function renameDatabase(userId: string, databaseId: string, name: string) {
  const cleanName = name.trim();
  if (!cleanName) return;
  const ref = doc(db, 'users', userId, 'databases', databaseId);
  await updateDoc(ref, {
    name: cleanName,
    updatedAt: Date.now()
  });
}

export function subscribeDatabases(userId: string, cb: (databases: ExpenseDatabase[]) => void) {
  const q = query(databasesCollectionRef(userId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ExpenseDatabase));
    cb(rows.length ? rows : [{ id: DEFAULT_DATABASE_ID, name: 'Expenses', createdAt: Date.now(), updatedAt: Date.now() }]);
  });
}

export async function createExpense(userId: string, databaseId: string, payload: ExpenseInput) {
  const now = Date.now();
  const ref = expenseCollectionRef(userId, databaseId);
  const { notes, ...rest } = payload;
  const cleanNotes = notes?.trim();
  await addDoc(ref, {
    ...rest,
    ...(cleanNotes ? { notes: cleanNotes } : {}),
    userId,
    databaseId,
    createdAt: now,
    updatedAt: now,
    indexedTitle: rest.title.toLowerCase(),
    ts: serverTimestamp()
  });
}

export async function updateExpense(userId: string, databaseId: string, expenseId: string, payload: Partial<ExpenseInput>) {
  const ref = doc(db, 'users', userId, 'databases', databaseId, 'expenses', expenseId);
  const { notes, ...rest } = payload;
  const cleanNotes = notes?.trim();
  await updateDoc(ref, {
    ...rest,
    ...(notes !== undefined ? { notes: cleanNotes ?? '' } : {}),
    ...(rest.title ? { indexedTitle: rest.title.toLowerCase() } : {}),
    updatedAt: Date.now()
  });
}

export async function removeExpense(userId: string, databaseId: string, expenseId: string) {
  const ref = doc(db, 'users', userId, 'databases', databaseId, 'expenses', expenseId);
  await deleteDoc(ref);
}

export function subscribeExpenses(userId: string, databaseId: string, cb: (expenses: Expense[]) => void) {
  const q = query(expenseCollectionRef(userId, databaseId), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Expense));
    cb(rows);
  });
}

export function subscribeExpenseSearch(userId: string, databaseId: string, term: string, cb: (expenses: Expense[]) => void) {
  const normalized = term.toLowerCase();
  const q = query(
    expenseCollectionRef(userId, databaseId),
    where('indexedTitle', '>=', normalized),
    where('indexedTitle', '<=', `${normalized}\uf8ff`),
    orderBy('indexedTitle')
  );
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Expense));
    cb(rows);
  });
}

export async function getOrCreateSettings(userId: string): Promise<UserSettings> {
  await ensureDefaultDatabase(userId);

  const ref = doc(db, 'users', userId, 'settings', 'preferences');
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const defaults = { ...DEFAULT_SETTINGS, activeDatabaseId: DEFAULT_DATABASE_ID };
    await setDoc(ref, defaults);
    return defaults;
  }

  const data = snap.data() as UserSettings & { activeDatabaseId?: string };
  if (!data.activeDatabaseId) {
    const patched = { ...data, activeDatabaseId: DEFAULT_DATABASE_ID };
    await setDoc(ref, patched, { merge: true });
    return patched;
  }

  return data;
}

export async function updateSettings(userId: string, settings: UserSettings) {
  const ref = doc(db, 'users', userId, 'settings', 'preferences');
  await setDoc(ref, settings, { merge: true });
}

export async function submitFeedback(userId: string, message: string) {
  const ref = collection(db, 'users', userId, 'feedback');
  await addDoc(ref, {
    message,
    createdAt: Date.now(),
    ts: serverTimestamp()
  });
}
