'use client';

import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full text-sm font-semibold transition active:scale-[0.98] disabled:opacity-60',
        variant === 'primary' && 'bg-black text-white px-5 py-3',
        variant === 'secondary' && 'bg-white text-black px-5 py-3 border border-app-border',
        variant === 'ghost' && 'bg-[#ececee] text-black p-3',
        className
      )}
      {...props}
    />
  );
}
