import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names safely (handles conflicting utility classes).
 * Standard shadcn/ui helper — required by every shadcn component.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
