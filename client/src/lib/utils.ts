import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function peso(n: number | undefined | null): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(n || 0));
}

export function formatDateText(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function toInputDate(date: Date | string): string {
  const d = new Date(date);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

export function truncateText(text: string, maxLen: number = 35): string {
  const s = (text || '').trim();
  return s.length <= maxLen ? s : s.slice(0, maxLen - 1) + '…';
}

export function dayNameShort(n: number): string {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][n] || '';
}

export function dayNameLong(n: number): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][n] || '';
}

export function pesoCompact(n: number | undefined | null): string {
  const num = Number(n || 0);
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (abs >= 1_000_000_000) return sign + '₱' + (abs / 1_000_000_000).toFixed(1) + 'B';
  if (abs >= 1_000_000) return sign + '₱' + (abs / 1_000_000).toFixed(1) + 'M';
  if (abs >= 10_000) return sign + '₱' + (abs / 1_000).toFixed(1) + 'K';
  return peso(num);
}
