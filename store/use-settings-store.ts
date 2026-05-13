'use client';

import { create } from 'zustand';
import { DEFAULT_SETTINGS } from '@/constants/settings';
import { UserSettings } from '@/types/settings';

interface SettingsState {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  setSettings: (settings) => set({ settings })
}));
