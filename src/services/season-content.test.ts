import { expect, test } from 'bun:test';
import { adaptPrice, adaptSeason, adaptSettings } from './cms-adapter';
import { availableSeasonSections } from './season-content';
import type { CmsEntry, CmsType } from '../types/content';

function entry(type: CmsType, data: Record<string, unknown> = {}): CmsEntry {
  return { id: 1, type, title: '2026–2027', slug: '2026-2027', sort_order: 0, data, media: {},
    created_at: '2026-10-15T12:00:00Z', published_at: '2026-10-15T12:00:00Z' };
}

function settings(enablePrices = true, enableRegistration = true) {
  const record = entry('settings', { enable_prices: enablePrices, enable_registration: enableRegistration, registration_form: 'form' });
  record.media.form = { id: 'form', name: 'Inscripción.pdf', alt: null, mime_type: 'application/pdf', width: null, height: null, url: 'https://cms.example.com/form.pdf' };
  return adaptSettings(record);
}

const prices = [adaptPrice(entry('prices', { shift: 'Mañana', conditions: [{ name: 'Socios', prices: [{ payment_method: 'Efectivo', amount: '1000.00' }] }] }))];
const ids = (sections: ReturnType<typeof availableSeasonSections>) => sections.map(section => section.id);

test('no season hides every section even when prices and the registration form exist', () => {
  expect(availableSeasonSections(null, settings(), prices)).toEqual([]);
});

test('a season can have no details, prices or form without showing empty tabs', () => {
  const season = adaptSeason([entry('seasons')]);
  expect(availableSeasonSections(season, null, [])).toEqual([]);
  expect(availableSeasonSections(season, adaptSettings(entry('settings')), [])).toEqual([]);
});

test('each date, nonworking day and schedule independently enables dates even with registrations closed', () => {
  for (const data of [{ starts_at: '2026-12-09' }, { ends_at: '2027-02-19' }, { non_working_days: '1 de enero' },
    { schedule: [{ shift: 'Mañana', entry: '09:00', exit: '13:00' }] },
    { guard_schedule: [{ shift: 'Tarde', entry: '13:00', exit: '18:30' }] }]) {
    expect(ids(availableSeasonSections(adaptSeason([entry('seasons', data)]), settings(false, false), []))).toEqual(['fechas-y-horarios']);
  }
});

test('prices and registration can appear separately without any dates or schedules', () => {
  const season = adaptSeason([entry('seasons')]);
  expect(ids(availableSeasonSections(season, settings(true, false), prices))).toEqual(['precios']);
  expect(ids(availableSeasonSections(season, settings(false, true), []))).toEqual(['inscripcion']);
  expect(ids(availableSeasonSections(season, settings(false, false), prices))).toEqual([]);
});

test('an enabled section still needs its own content and all available sections have separate URLs', () => {
  const season = adaptSeason([entry('seasons', { starts_at: '2026-12-09' })]);
  const noForm = adaptSettings(entry('settings', { enable_registration: true, enable_prices: true }));
  expect(ids(availableSeasonSections(season, noForm, []))).toEqual(['fechas-y-horarios']);
  expect(ids(availableSeasonSections(season, noForm, [adaptPrice(entry('prices'))]))).toEqual(['fechas-y-horarios']);
  expect(availableSeasonSections(season, settings(), prices).map(section => section.href)).toEqual([
    '/temporada/fechas-y-horarios', '/temporada/precios', '/temporada/inscripcion',
  ]);
});
