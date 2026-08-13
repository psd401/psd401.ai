/**
 * Formatting helpers shared across pages.
 *
 * Dates are always rendered in UTC. Content dates are calendar dates
 * (YYYY-MM-DD) with no time component; parsing them in the server's local
 * zone shifts them a day for anyone west of UTC, which is everyone here.
 */

export function formatDate(date: string | undefined): string {
  if (!date) return '';
  const d = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatMonthYear(date: string | undefined): string {
  if (!date) return '';
  const d = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/** Rough reading time. Stated as an estimate because it is one. */
export function readingTime(body: string): string {
  const words = body.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 225))} min read`;
}
