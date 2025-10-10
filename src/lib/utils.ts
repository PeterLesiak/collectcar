import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalizeWords(input: string): string {
  return input
    .split(' ')
    .map(v => `${v[0].toUpperCase()}${v.substring(1)}`)
    .join(' ');
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}
