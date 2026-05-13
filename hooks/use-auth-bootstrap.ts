'use client';

import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { auth } from '@/lib/firebase/client';
import { useAuthStore } from '@/store/use-auth-store';
import { getOrCreateSettings, subscribeDatabases, subscribeExpenses } from '@/lib/firebase/firestore';
import { useExpenseStore } from '@/store/use-expense-store';
import { useSettingsStore } from '@/store/use-settings-store';
import { useDatabaseStore } from '@/store/use-database-store';
import toast from 'react-hot-toast';

export function useAuthBootstrap() {
  const { setUser, setLoading } = useAuthStore();
  const { setExpenses } = useExpenseStore();
  const { setSettings } = useSettingsStore();
  const { setDatabases, setActiveDatabaseId } = useDatabaseStore();

  useEffect(() => {
    let unsubscribeExpenses: (() => void) | undefined;
    let unsubscribeDatabases: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      unsubscribeExpenses?.();
      unsubscribeDatabases?.();
      unsubscribeExpenses = undefined;
      unsubscribeDatabases = undefined;

      try {
        if (user) {
          const settings = await getOrCreateSettings(user.uid);
          setSettings(settings);
          setActiveDatabaseId(settings.activeDatabaseId);

          unsubscribeDatabases = subscribeDatabases(user.uid, setDatabases);
          unsubscribeExpenses = subscribeExpenses(user.uid, settings.activeDatabaseId, setExpenses);
        } else {
          setExpenses([]);
          setDatabases([]);
        }
      } catch (error) {
        console.error('Auth bootstrap error:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeExpenses?.();
      unsubscribeDatabases?.();
    };
  }, [setExpenses, setLoading, setSettings, setUser, setDatabases, setActiveDatabaseId]);
}
