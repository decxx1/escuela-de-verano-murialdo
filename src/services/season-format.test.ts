import { expect, test } from 'bun:test';
import { formatSeasonDate, formatScheduleTime } from './season-format';

test('writes full season dates without shifting the calendar day in Argentina', () => {
  const previousTimezone = process.env.TZ;
  process.env.TZ = 'America/Argentina/Buenos_Aires';
  try {
    expect(formatSeasonDate('2026-12-09')).toBe('9 de diciembre de 2026');
    expect(formatSeasonDate('2027-02-19')).toBe('19 de febrero de 2027');
  } finally {
    if (previousTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = previousTimezone;
  }
});

test('displays a range only when its optional end is present', () => {
  expect(formatScheduleTime('13:00', '13:30')).toBe('De 13:00 a 13:30');
  expect(formatScheduleTime('18:00', '18:30')).toBe('De 18:00 a 18:30');
  expect(formatScheduleTime('09:00')).toBe('09:00');
  expect(formatScheduleTime('09:00', '')).toBe('09:00');
});
