import { expect, test } from 'bun:test';
import type { Noticia } from '../types/content';
import { groupNewsBySeason, seasonStartYear } from './news-seasons';

const news = (date: string, id: string) => ({ createdAt: date, documentId: id }) as Noticia;

test('la temporada cambia en septiembre y cruza el año calendario', () => {
  expect(seasonStartYear('2025-09-01T00:00:00-03:00')).toBe(2025);
  expect(seasonStartYear('2026-03-31T23:59:00-03:00')).toBe(2025);
  expect(seasonStartYear('2026-08-31T23:59:00-03:00')).toBe(2025);
  expect(seasonStartYear('2026-09-01T00:00:00-03:00')).toBe(2026);
  expect(seasonStartYear('2026-09-01T00:30:00Z')).toBe(2025);
});

test('separa las noticias y ordena primero la temporada y publicación más reciente', () => {
  const seasons = groupNewsBySeason([
    news('2025-12-10T10:00:00Z', 'old'),
    news('2026-10-01T10:00:00Z', 'newer'),
    news('2026-09-15T10:00:00Z', 'new'),
    news('2026-02-02T10:00:00Z', 'older'),
  ]);
  expect(seasons.map((season) => season.label)).toEqual(['2026/2027', '2025/2026']);
  expect(seasons.map((season) => season.noticias.map((item) => item.documentId)))
    .toEqual([['newer', 'new'], ['older', 'old']]);
});
