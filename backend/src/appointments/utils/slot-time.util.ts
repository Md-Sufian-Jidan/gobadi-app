/**
 * Parses a mobile-supplied {date, time} pair into a Date.
 * Mobile sends date as 'YYYY-MM-DD' and time with a dot separator, e.g. '09.00 AM'.
 */
export function parseSlotDateTime(date: string, time: string): Date {
  const normalizedTime = time.replace('.', ':');
  const parsed = new Date(`${date} ${normalizedTime}`);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Unable to parse date/time: ${date} ${time}`);
  }
  return parsed;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

export function subMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() - minutes * 60000);
}
