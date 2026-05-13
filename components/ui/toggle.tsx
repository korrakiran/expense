'use client';

import { cn } from '@/lib/utils/cn';

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-8 w-14 rounded-full transition',
        checked ? 'bg-black' : 'bg-[#dbdbdf]'
      )}
    >
      <span
        className={cn(
          'absolute top-1 h-6 w-6 rounded-full bg-white transition',
          checked ? 'left-7' : 'left-1'
        )}
      />
    </button>
  );
}
