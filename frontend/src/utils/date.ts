import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';

export const TODAY = new Date(2026, 10, 6);

export type DueTone = 'danger' | 'warning' | 'neutral';

export function formatShortDate(iso: string): string {
  return format(parseISO(iso), 'dd/MM');
}

export function daysUntil(iso: string): number {
  return differenceInCalendarDays(parseISO(iso), TODAY);
}

export function isoFromToday(days: number): string {
  return format(addDays(TODAY, days), 'yyyy-MM-dd');
}

export function dueLabel(iso: string): {label: string;tone: DueTone;} {
  const d = daysUntil(iso);
  if (d < 0) return { label: `Trễ ${-d} ngày`, tone: 'danger' };
  if (d === 0) return { label: 'Hôm nay', tone: 'warning' };
  if (d === 1) return { label: 'Ngày mai', tone: 'warning' };
  if (d <= 3) return { label: `Còn ${d} ngày`, tone: 'warning' };
  return { label: formatShortDate(iso), tone: 'neutral' };
}

export const dueToneText: Record<DueTone, string> = {
  danger: 'text-danger',
  warning: 'text-warning',
  neutral: 'text-ink-muted'
};