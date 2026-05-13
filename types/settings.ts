export type WeekStart = 'sunday' | 'monday';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface UserSettings {
  currency: CurrencyCode;
  weekStart: WeekStart;
  smartSuggestions: boolean;
  theme: 'light' | 'dark' | 'system';
  activeDatabaseId: string;
}
