const seasonDate = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatSeasonDate(date: string): string {
  return seasonDate.format(new Date(date));
}

export function formatScheduleTime(time: string, until?: string): string {
  return until ? `De ${time} a ${until}` : time;
}
