import type { AjusteData, Fecha, Turno } from '../types/content';

export const seasonSections = [
  { id: 'fechas-y-horarios', label: 'Fechas y horarios', href: '/temporada/fechas-y-horarios' },
  { id: 'precios', label: 'Precios', href: '/temporada/precios' },
  { id: 'inscripcion', label: 'Inscripción', href: '/temporada/inscripcion' },
] as const;

export type SeasonSection = typeof seasonSections[number]['id'];

export function availableSeasonSections(season: Fecha | null, settings: AjusteData | null, prices: Turno[]) {
  if (!season) return [];
  const available = {
    'fechas-y-horarios': Boolean(season.Inicio || season.Fin || season.NoLaborables.trim() || season.IngresoSalida.length || season.HorariosGuardia.length),
    precios: Boolean(settings?.HabilitarPrecios && prices.some(turn => turn.Condiciones.some(condition => condition.precios.length))),
    inscripcion: Boolean(settings?.HabilitarInscripciones && settings.FormularioInscripcion),
  };
  return seasonSections.filter(section => available[section.id]);
}
