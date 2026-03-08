import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return dateStr;
  return format(date, "d 'de' MMMM, yyyy", { locale: es });
}

export function formatShortDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return dateStr;
  return format(date, 'dd/MM', { locale: es });
}

export function formatDateTime(dateStr: string): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return dateStr;
  return format(date, "d MMM yyyy, HH:mm", { locale: es });
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString('es-CO', { maximumFractionDigits: decimals });
}
