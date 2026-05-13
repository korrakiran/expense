import { CurrencyCode } from '@/types/settings';

export function formatCurrency(amount: number, currency: CurrencyCode = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}
