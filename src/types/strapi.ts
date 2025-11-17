/**
 * Tipos base para las respuestas de Strapi
 */

export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiMeta {
  pagination: StrapiPagination;
}

export interface StrapiResponse<T> {
  data: T;
  meta: StrapiMeta;
}

export interface StrapiListResponse<T> {
  data: T[];
  meta: StrapiMeta;
}

/**
 * Tipos específicos para Divisiones y Edades
 */

export interface Columna {
  id: number;
  Division: string;
  Edades: string;
}

export interface DivisionEdad {
  id: number;
  documentId: string;
  Titulo: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  Columna: Columna[];
}

export type DivisionesEdadesResponse = StrapiResponse<DivisionEdad[]>;

/**
 * Tipos específicos para Preguntas Frecuentes
 */

export interface PreguntaFrecuente {
  id: number;
  documentId: string;
  Pregunta: string;
  Respuesta: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export type PreguntasFrecuentesResponse = StrapiResponse<PreguntaFrecuente[]>;

/**
 * Tipos específicos para Información de Contacto
 */

export interface Contacto {
  id: number;
  documentId: string;
  Telefono: string;
  Whatsapp: string;
  Ubicacion: string;
  Email: string;
  Horarios: string;
  Facebook: string;
  Instagram: string;
  MapUrl: string;
  MapIframe: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export type ContactoResponse = StrapiResponse<Contacto>;

/**
 * Tipos específicos para Estado de Inscripción
 */

export interface ArchivoFormulario {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  formats: any | null;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: any | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface AjusteData {
  id: number;
  documentId: string;
  HabilitarEquipo: boolean;
  HabilitarInscripciones: boolean;
  HabilitarPrecios: boolean;
  FormularioInscripcion?: ArchivoFormulario;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export type AjusteResponse = StrapiResponse<AjusteData>;

// Deprecated: usar AjusteData.HabilitarInscripciones
export interface InscripcionData {
  id: number;
  documentId: string;
  Estado: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export type InscripcionResponse = StrapiResponse<InscripcionData>;

/**
 * Tipos específicos para Actividades
 */

export interface Icono {
  width: number;
  height: number;
  iconData: string;
  iconName: string;
  isSvgEditable: boolean;
  isIconNameEditable: boolean;
}

export interface Actividad {
  id: number;
  documentId: string;
  Titulo: string;
  Subtitulo: string;
  Descripcion: string;
  Icono: Icono;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export type ActividadesResponse = StrapiResponse<Actividad[]>;

/**
 * Tipos específicos para Fechas de Temporada
 */

export interface IngresoSalida {
  id: number;
  Turno: string;
  Ingreso: string;
  Salida: string;
}

export interface HorarioGuardia {
  id: number;
  Turno: string;
  Ingreso: string;
  Salida: string;
}

export interface Fecha {
  id: number;
  documentId: string;
  Temporada: string;
  Inicio: string;
  Fin: string;
  NoLaborables: string;
  IngresoSalida: IngresoSalida[];
  HorariosGuardia: HorarioGuardia[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export type FechaResponse = StrapiResponse<Fecha>;

/**
 * Tipos específicos para Precios
 */

export interface PrecioDetalle {
  id: number;
  MedioDePago: string;
  Precio: number;
}

export interface Condicion {
  id: number;
  Condicion: string;
  precios: PrecioDetalle[];
}

export interface Turno {
  id: number;
  documentId: string;
  Turno: string;
  Condiciones: Condicion[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export type PreciosResponse = StrapiListResponse<Turno>;

/**
 * Tipos específicos para Equipo
 */

export interface ImagenFormato {
  url: string;
  width: number;
  height: number;
}

export interface ImagenEquipo {
  id: number;
  formats: {
    small: ImagenFormato;
  };
}

export interface MiembroEquipo {
  id: number;
  documentId: string;
  Activo: boolean;
  Orden: string;
  Nombre: string;
  Titulo: string;
  Descripcion?: string;
  Facebook?: string;
  Instagram?: string;
  Linkedin?: string;
  Imagen: ImagenEquipo;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export type EquiposResponse = StrapiListResponse<MiembroEquipo>;

/**
 * Tipos específicos para Noticias/Blog
 */

export interface ImagenNoticia {
  id: number;
  url: string;
  formats: {
    small: ImagenFormato;
  };
}

export interface Noticia {
  id: number;
  documentId: string;
  Titulo: string;
  Subtitulo?: string;
  Texto: string;
  Imagen: ImagenNoticia;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export type NoticiasResponse = StrapiListResponse<Noticia>;

/**
 * Tipos específicos para Galería
 */

export interface FotoFormatos {
  thumbnail: ImagenFormato;
  small: ImagenFormato;
  medium: ImagenFormato;
  large: ImagenFormato;
}

export interface Foto {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: FotoFormatos;
  url: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Album {
  id: number;
  documentId: string;
  Nombre: string;
  Fotos: Foto[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export type GaleriasResponse = StrapiListResponse<Album>;
