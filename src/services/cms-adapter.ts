import icons from '../assets/activity-icons.json';
import type { Actividad, AjusteData, Album, CmsEntry, CmsMedia, CmsSnapshot, Condicion, Contacto, ContentDates, ContentResponse, DivisionEdad, Fecha, Foto, Icono, IngresoSalida, MiembroEquipo, Noticia, PreguntaFrecuente, Turno } from '../types/content';

const string = (value: unknown): string => typeof value === 'string' ? value : '';
const records = (value: unknown): Record<string, unknown>[] => Array.isArray(value) ? value : [];
const dates = (entry: CmsEntry): ContentDates => ({ id: entry.id, documentId: entry.slug, createdAt: entry.created_at || entry.published_at, updatedAt: entry.published_at, publishedAt: entry.published_at });

function image(entry: CmsEntry, id: unknown): CmsMedia {
  const asset = entry.media[string(id)];
  if (! asset || ! /^https?:\/\//.test(asset.url)) throw new Error(`Falta un medio publicado en ${entry.type}/${entry.slug}.`);
  return asset;
}

function photo(entry: CmsEntry, id: unknown, caption = ''): Foto {
  const asset = image(entry, id);
  const original = { url: asset.url, width: asset.width || 500, height: asset.height || 363 };
  const small = asset.formats?.small || original;
  return { id: entry.id, documentId: asset.id, name: asset.alt || asset.name, alternativeText: asset.alt, caption,
    width: original.width, height: original.height, url: original.url,
    formats: { small, thumbnail: small, medium: original, large: original } };
}

function one(snapshot: CmsSnapshot, type: 'contact' | 'settings'): CmsEntry {
  const entry = snapshot.contents[type].find((entry) => entry.slug === 'default');
  if (! entry) throw new Error(`Publicá ${type}/default en el CMS antes de iniciar Astro.`);
  return entry;
}

export function paginate<T>(items: T[], page = 1, pageSize = 25): ContentResponse<T[]> {
  if (! Number.isInteger(page) || page < 1 || ! Number.isInteger(pageSize) || pageSize < 1) throw new Error('Paginación inválida.');
  return { data: items.slice((page - 1) * pageSize, page * pageSize), meta: { pagination: { page, pageSize, pageCount: Math.ceil(items.length / pageSize), total: items.length } } };
}

export function adaptSnapshot(snapshot: CmsSnapshot) {
  const sorted = (type: 'news' | 'galleries') => [...snapshot.contents[type]].sort((a, b) => a.sort_order - b.sort_order || Date.parse(b.created_at) - Date.parse(a.created_at));
  const noticias: Noticia[] = sorted('news').map((entry) => {
    const asset = photo(entry, entry.data.image);
    return { ...dates(entry), Titulo: entry.title, Subtitulo: string(entry.data.subtitle), Resumen: string(entry.data.excerpt), Texto: string(entry.data.body), TextoHTML: string(entry.data.body_html),
      Imagen: { id: entry.id, url: asset.url, formats: { small: asset.formats.small } } };
  });
  const albumes: Album[] = sorted('galleries').map((entry) => ({ ...dates(entry), Nombre: entry.title,
    Fotos: records(entry.data.items).filter((item) => entry.media[string(item.asset)]).map((item) => photo(entry, item.asset, string(item.caption))) }));
  const actividades: Actividad[] = snapshot.contents.activities.map((entry) => ({ ...dates(entry), Titulo: entry.title, Subtitulo: string(entry.data.subtitle),
    Descripcion: string(entry.data.body), DescripcionHTML: string(entry.data.body_html), Icono: (icons as Record<string, Icono>)[string(entry.data.icon)] }));
  const divisiones: DivisionEdad[] = snapshot.contents['age-groups'].map((entry) => ({ ...dates(entry), Titulo: entry.title,
    Columna: records(entry.data.columns).map((column, index) => ({ id: index + 1, Division: string(column.division), Edades: string(column.ages) })) }));
  const preguntas: PreguntaFrecuente[] = snapshot.contents.faqs.map((entry) => ({ ...dates(entry), Pregunta: entry.title, Respuesta: string(entry.data.body), RespuestaHTML: string(entry.data.body_html) }));
  const contact = one(snapshot, 'contact');
  const contacto: Contacto = { ...dates(contact), Telefono: string(contact.data.phone), Whatsapp: string(contact.data.whatsapp), Ubicacion: string(contact.data.location),
    Email: string(contact.data.email), Horarios: string(contact.data.hours), Facebook: string(contact.data.facebook), Instagram: string(contact.data.instagram),
    MapUrl: string(contact.data.map_url), MapEmbedUrl: string(contact.data.map_embed_url) };
  const settings = one(snapshot, 'settings');
  const form = settings.media[string(settings.data.registration_form)];
  const ajustes: AjusteData = { ...dates(settings), HabilitarEquipo: settings.data.enable_team === true, HabilitarInscripciones: settings.data.enable_registration === true,
    HabilitarPrecios: settings.data.enable_prices === true, ...(form ? { FormularioInscripcion: { id: settings.id, documentId: form.id, name: form.name, url: form.url, mime: form.mime_type } } : {}) };
  const schedule = (value: unknown): IngresoSalida[] => records(value).map((row, index) => ({ id: index + 1, Turno: string(row.shift), Ingreso: string(row.entry), Salida: string(row.exit) }));
  const season = [...snapshot.contents.seasons].sort((a, b) => string(b.data.ends_at).localeCompare(string(a.data.ends_at)))[0];
  const fecha: Fecha | null = season ? { ...dates(season), Temporada: season.title, Inicio: string(season.data.starts_at), Fin: string(season.data.ends_at),
    NoLaborables: string(season.data.non_working_days), IngresoSalida: schedule(season.data.schedule), HorariosGuardia: schedule(season.data.guard_schedule) } : null;
  const turnos: Turno[] = snapshot.contents.prices.map((entry) => ({ ...dates(entry), Turno: string(entry.data.shift),
    Condiciones: records(entry.data.conditions).map((condition, index): Condicion => ({ id: index + 1, Condicion: string(condition.name),
      precios: records(condition.prices).map((price, priceIndex) => ({ id: priceIndex + 1, MedioDePago: string(price.payment_method), Precio: Number(price.amount) })) })) }));
  const equipo: MiembroEquipo[] = snapshot.contents.team.filter((entry) => entry.media[string(entry.data.image)]).map((entry) => {
    const asset = photo(entry, entry.data.image);
    return { ...dates(entry), Activo: entry.data.active === true, Orden: String(entry.sort_order), Nombre: entry.title, Titulo: string(entry.data.job_title), Descripcion: string(entry.data.body),
      Facebook: string(entry.data.facebook), Instagram: string(entry.data.instagram), Linkedin: string(entry.data.linkedin), Imagen: { id: entry.id, url: asset.url, formats: { small: asset.formats.small } } };
  });
  return { noticias, albumes, actividades, divisiones, preguntas, contacto, ajustes, fecha, turnos, equipo };
}
