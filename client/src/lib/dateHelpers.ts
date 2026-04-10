export function currentCutoffBounds(
  today: Date,
  startDay: number = 1,
  endDay: number = 6
): { start: Date; end: Date } {
  const d = new Date(today);
  d.setHours(0, 0, 0, 0);
  const currentDay = d.getDay();

  let diffToStart = currentDay - startDay;
  if (diffToStart < 0) diffToStart += 7;
  const start = new Date(d);
  start.setDate(d.getDate() - diffToStart);
  start.setHours(0, 0, 0, 0);

  let diffToEnd = endDay - currentDay;
  if (diffToEnd < 0) diffToEnd += 7;
  const end = new Date(d);
  end.setDate(d.getDate() + diffToEnd);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function lastCutoffBounds(
  today: Date,
  startDay: number = 1,
  endDay: number = 6
): { start: Date; end: Date } {
  const current = currentCutoffBounds(today, startDay, endDay);
  const start = new Date(current.start);
  start.setDate(start.getDate() - 7);
  const end = new Date(current.end);
  end.setDate(end.getDate() - 7);
  return { start, end };
}

export function monthStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function monthEnd(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function prevMonthStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function prevMonthEnd(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function yearStart(date: Date): Date {
  const d = new Date(date.getFullYear(), 0, 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function shiftDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function todayEnd(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function toInputDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export type RangePreset = 'ALL' | 'CC' | 'LC' | 'TM' | 'LM' | 'MTD' | 'YTD' | '7' | '14' | '30' | 'CUSTOM';

export function getDateRangeForPreset(
  preset: RangePreset,
  cutoffStart: number = 1,
  cutoffEnd: number = 6,
  customStart?: string,
  customEnd?: string
): { start: string; end: string; label: string } {
  const now = new Date();

  switch (preset) {
    case 'ALL':
      return { start: '', end: '', label: 'All Time' };
    case 'CC': {
      const b = currentCutoffBounds(now, cutoffStart, cutoffEnd);
      return { start: toInputDate(b.start), end: toInputDate(b.end), label: 'Current Cutoff' };
    }
    case 'LC': {
      const b = lastCutoffBounds(now, cutoffStart, cutoffEnd);
      return { start: toInputDate(b.start), end: toInputDate(b.end), label: 'Last Cutoff' };
    }
    case 'TM': {
      return { start: toInputDate(monthStart(now)), end: toInputDate(monthEnd(now)), label: 'This Month' };
    }
    case 'LM': {
      return { start: toInputDate(prevMonthStart(now)), end: toInputDate(prevMonthEnd(now)), label: 'Last Month' };
    }
    case 'MTD': {
      return { start: toInputDate(monthStart(now)), end: toInputDate(todayEnd(now)), label: 'Month to Date' };
    }
    case 'YTD': {
      return { start: toInputDate(yearStart(now)), end: toInputDate(todayEnd(now)), label: 'Year to Date' };
    }
    case '7': {
      return { start: toInputDate(shiftDays(now, -6)), end: toInputDate(todayEnd(now)), label: 'Last 7 Days' };
    }
    case '14': {
      return { start: toInputDate(shiftDays(now, -13)), end: toInputDate(todayEnd(now)), label: 'Last 14 Days' };
    }
    case '30': {
      return { start: toInputDate(shiftDays(now, -29)), end: toInputDate(todayEnd(now)), label: 'Last 30 Days' };
    }
    case 'CUSTOM':
      return { start: customStart || '', end: customEnd || '', label: 'Custom' };
    default:
      return { start: '', end: '', label: 'All Time' };
  }
}
