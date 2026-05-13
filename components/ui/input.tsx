import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-2xl border border-app-border bg-white px-4 py-3 text-[15px] outline-none placeholder:text-app-muted focus:ring-2 focus:ring-black/10',
        className
      )}
      {...props}
    />
  );
}
