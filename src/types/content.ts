export interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface ContentResponse<T> {
  data: T;
  meta: { pagination: Pagination };
}

export interface ContentDates {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Columna { id: number; Division: string; Edades: string }
export interface DivisionEdad extends ContentDates { Titulo: string; Columna: Columna[] }
export interface PreguntaFrecuente extends ContentDates { Pregunta: string; Respuesta: string; RespuestaHTML: string }
export interface Contacto extends ContentDates {
  Telefono: string;
  Whatsapp: string;
  Ubicacion: string;
  Email: string;
  Horarios: string;
  Facebook: string;
  Instagram: string;
  MapUrl: string;
  MapEmbedUrl: string;
}

export interface ImagenFormato { url: string; width: number; height: number }
export interface Foto {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  url: string;
  formats: { small: ImagenFormato; thumbnail: ImagenFormato; medium: ImagenFormato; large: ImagenFormato };
}
export interface ArchivoFormulario { id: number; documentId: string; name: string; url: string; mime: string }
export interface AjusteData extends ContentDates {
  HabilitarEquipo: boolean;
  HabilitarInscripciones: boolean;
  HabilitarPrecios: boolean;
  FormularioInscripcion?: ArchivoFormulario;
}
export interface Icono {
  width: number;
  height: number;
  paths: { d: string; fillRule: string; clipRule: string }[];
}
export interface Actividad extends ContentDates {
  Titulo: string;
  Subtitulo: string;
  Descripcion: string;
  DescripcionHTML: string;
  Icono?: Icono;
}
export interface IngresoSalida { id: number; Turno: string; Ingreso: string; Salida: string }
export interface Fecha extends ContentDates {
  Temporada: string;
  Inicio: string;
  Fin: string;
  NoLaborables: string;
  IngresoSalida: IngresoSalida[];
  HorariosGuardia: IngresoSalida[];
}
export interface PrecioDetalle { id: number; MedioDePago: string; Precio: number }
export interface Condicion { id: number; Condicion: string; precios: PrecioDetalle[] }
export interface Turno extends ContentDates { Turno: string; Condiciones: Condicion[] }
export interface ImagenNoticia { id: number; url: string; formats: { small: ImagenFormato } }
export interface MiembroEquipo extends ContentDates {
  Activo: boolean;
  Orden: string;
  Nombre: string;
  Titulo: string;
  Descripcion?: string;
  Facebook?: string;
  Instagram?: string;
  Linkedin?: string;
  Imagen: ImagenNoticia;
}
export interface Noticia extends ContentDates {
  Titulo: string;
  Subtitulo?: string;
  Resumen?: string;
  Texto: string;
  TextoHTML: string;
  Imagen: ImagenNoticia;
}
export interface Album extends ContentDates { Nombre: string; Fotos: Foto[] }

export type DivisionesEdadesResponse = ContentResponse<DivisionEdad[]>;
export type PreguntasFrecuentesResponse = ContentResponse<PreguntaFrecuente[]>;
export type ContactoResponse = ContentResponse<Contacto>;
export type AjusteResponse = ContentResponse<AjusteData>;
export type ActividadesResponse = ContentResponse<Actividad[]>;
export type FechaResponse = ContentResponse<Fecha | null>;
export type PreciosResponse = ContentResponse<Turno[]>;
export type EquiposResponse = ContentResponse<MiembroEquipo[]>;
export type NoticiasResponse = ContentResponse<Noticia[]>;
export type GaleriasResponse = ContentResponse<Album[]>;

export type CmsType = 'news' | 'activities' | 'team' | 'galleries' | 'prices' | 'faqs' | 'age-groups' | 'seasons' | 'contact' | 'settings' | 'pages';
export interface CmsMedia {
  id: string;
  name: string;
  alt: string | null;
  mime_type: string;
  width: number | null;
  height: number | null;
  url: string;
  formats?: { small: ImagenFormato };
}
export interface CmsEntry {
  id: number;
  type: CmsType;
  title: string;
  slug: string;
  sort_order: number;
  data: Record<string, unknown>;
  media: Record<string, CmsMedia>;
  created_at: string;
  published_at: string;
}
export interface CmsSnapshot {
  site: { name: string; slug: string; domain: string | null };
  generated_at: string;
  preview: boolean;
  contents: Record<CmsType, CmsEntry[]>;
}

export interface CmsCollection {
  data: CmsEntry[];
  meta: { current_page: number; per_page: number; last_page: number; total: number };
}
