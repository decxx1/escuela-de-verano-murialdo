import type { Noticia } from '../types/content';

export interface NewsSeason {
  startYear: number;
  label: string;
  noticias: Noticia[];
}

const argentinaMonth = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Argentina/Buenos_Aires',
  year: 'numeric',
  month: 'numeric',
});

// La temporada cambia en septiembre según la fecha local de Mendoza.
export function seasonStartYear(date: string): number {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.valueOf())) throw new Error(`Fecha de noticia inválida: ${date}`);
  const parts = argentinaMonth.formatToParts(parsed);
  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  return month >= 9 ? year : year - 1;
}

export function groupNewsBySeason(noticias: Noticia[]): NewsSeason[] {
  const groups = new Map<number, Noticia[]>();
  for (const noticia of noticias) {
    const year = seasonStartYear(noticia.createdAt);
    const group = groups.get(year) ?? [];
    group.push(noticia);
    groups.set(year, group);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => b - a)
    .map(([startYear, items]) => ({
      startYear,
      label: `${startYear}/${startYear + 1}`,
      noticias: items.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    }));
}
