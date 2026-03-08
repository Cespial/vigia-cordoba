'use client';

import type { AlertLevel } from '@/types';

const badgeStyles: Record<string, string> = {
  rojo: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
  naranja: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
  amarillo: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
  verde: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
};

const dotColors: Record<string, string> = {
  rojo: 'bg-red-500',
  naranja: 'bg-orange-500',
  amarillo: 'bg-yellow-500',
  verde: 'bg-green-500',
};

export function AlertBadge({ alert, size = 'sm' }: { alert: AlertLevel; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${badgeStyles[alert.level]} ${sizeClasses[size]}`}>
      <span className={`inline-block h-2 w-2 rounded-full ${dotColors[alert.level]} animate-pulse`} />
      {alert.label}
    </span>
  );
}

export function AlertDot({ level, size = 12 }: { level: AlertLevel['level']; size?: number }) {
  return (
    <span
      className={`inline-block rounded-full ${dotColors[level]} animate-pulse`}
      style={{ width: size, height: size }}
    />
  );
}
