import qs from 'qs';
import type { DivisionesEdadesResponse, PreguntasFrecuentesResponse, ContactoResponse, InscripcionResponse, ActividadesResponse, FechaResponse, PreciosResponse, EquiposResponse, NoticiasResponse, Noticia, GaleriasResponse, Album, AjusteResponse } from '../types/strapi';
import { STRAPI_URL } from 'astro:env/server';
/**
 * Configuración base de Strapi
 */

/**
 * Cliente HTTP genérico para Strapi
 */
class StrapiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Realiza una petición GET a la API de Strapi
   * @param endpoint - Endpoint de la API (ej: '/api/divisiones-edades')
   * @param query - Objeto de query parameters que será convertido con qs
   * @returns Promise con la respuesta parseada
   */
  async get<T>(endpoint: string, query?: Record<string, any>): Promise<T> {
    try {
      const queryString = query ? `?${qs.stringify(query)}` : '';
      const url = `${this.baseUrl}${endpoint}${queryString}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error al obtener datos de ${endpoint}:`, error);
      throw error;
    }
  }
}

/**
 * Instancia del cliente de Strapi
 */
const strapiClient = new StrapiClient(STRAPI_URL);

/**
 * Servicio para obtener divisiones y edades
 */
export const divisionesService = {
  /**
   * Obtiene todas las divisiones con sus edades
   * @returns Promise con las divisiones y edades
   */
  async getDivisiones(): Promise<DivisionesEdadesResponse> {
    return strapiClient.get<DivisionesEdadesResponse>('/api/divisiones-edades', {
      sort: 'createdAt:asc',
      populate: '*',
    });
  },
};

/**
 * Servicio para obtener preguntas frecuentes
 */
export const preguntasFrecuentesService = {
  /**
   * Obtiene todas las preguntas frecuentes
   * @returns Promise con las preguntas frecuentes
   */
  async getPreguntas(): Promise<PreguntasFrecuentesResponse> {
    return strapiClient.get<PreguntasFrecuentesResponse>('/api/preguntas-frecuentes', {
      sort: 'createdAt:asc',
    });
  },
};

/**
 * Servicio para obtener información de contacto
 */
export const contactoService = {
  /**
   * Obtiene la información de contacto
   * @returns Promise con la información de contacto
   */
  async getContacto(): Promise<ContactoResponse> {
    return strapiClient.get<ContactoResponse>('/api/contacto');
  },
};

/**
 * Servicio para obtener ajustes generales
 */
export const ajusteService = {
  /**
   * Obtiene los ajustes generales (habilitar equipo, inscripciones, formulario, etc.)
   * @returns Promise con los ajustes
   */
  async getAjustes(): Promise<AjusteResponse> {
    return strapiClient.get<AjusteResponse>('/api/ajuste', {
      populate: '*'
    });
  },
};

/**
 * Servicio para obtener estado de inscripciones
 * @deprecated Usar ajusteService.getAjustes() y acceder a HabilitarInscripciones
 */
export const inscripcionService = {
  /**
   * Obtiene el estado de las inscripciones
   * @returns Promise con el estado
   * @deprecated Usar ajusteService.getAjustes()
   */
  async getEstado(): Promise<InscripcionResponse> {
    return strapiClient.get<InscripcionResponse>('/api/inscripcion');
  },
};

/**
 * Servicio para obtener actividades
 */
export const actividadesService = {
  /**
   * Obtiene todas las actividades
   * @returns Promise con las actividades
   */
  async getActividades(): Promise<ActividadesResponse> {
    return strapiClient.get<ActividadesResponse>('/api/actividades', {
      sort: 'createdAt:asc',
    });
  },
};

/**
 * Servicio para obtener fechas de temporada
 */
export const fechaService = {
  /**
   * Obtiene las fechas de la temporada
   * @returns Promise con las fechas de temporada
   */
  async getFecha(): Promise<FechaResponse> {
    return strapiClient.get<FechaResponse>('/api/fecha', {
      populate: '*',
    });
  },
};

/**
 * Servicio para obtener precios
 */
export const precioService = {
  /**
   * Obtiene los precios de la temporada (turnos con condiciones)
   * @returns Promise con los turnos y precios
   */
  async getPrecios(): Promise<PreciosResponse> {
    return strapiClient.get<PreciosResponse>('/api/precios', {
      populate: {
        Condiciones: {
          populate: '*'
        }
      },
      sort: ['createdAt:asc'],
    });
  },
};

/**
 * Servicio para obtener equipo
 */
export const equipoService = {
  /**
   * Obtiene el equipo (profesores y personal)
   * @returns Promise con el equipo
   */
  async getEquipos(): Promise<EquiposResponse> {
    return strapiClient.get<EquiposResponse>('/api/equipos', {
      populate: {
        Imagen: {
          fields: ['id', 'formats']
        }
      },
      sort: ['Orden:asc']
    });
  },
};

/**
 * Servicio para obtener noticias/blog
 */
export const noticiasService = {
  /**
   * Obtiene todas las noticias con paginación
   * @param page Número de página (default: 1)
   * @param pageSize Tamaño de página (default: 25)
   * @returns Promise con las noticias
   */
  async getNoticias(page: number = 1, pageSize: number = 25): Promise<NoticiasResponse> {
    return strapiClient.get<NoticiasResponse>('/api/noticias', {
      populate: {
        Imagen: {
          fields: ['id', 'url', 'formats']
        }
      },
      sort: ['createdAt:desc'],
      pagination: {
        page,
        pageSize
      }
    });
  },

  /**
   * Obtiene una noticia por su documentId
   * @param documentId ID del documento
   * @returns Promise con la noticia
   */
  async getNoticiaByDocumentId(documentId: string): Promise<{ data: Noticia }> {
    return strapiClient.get<{ data: Noticia }>(`/api/noticias/${documentId}`, {
      populate: {
        Imagen: {
          fields: ['id', 'url', 'formats']
        }
      }
    });
  },
};

/**
 * Servicio para obtener galerías/álbumes
 */
export const galeriasService = {
  /**
   * Obtiene todos los álbumes con paginación
   * @param page Número de página (default: 1)
   * @param pageSize Tamaño de página (default: 25)
   * @returns Promise con los álbumes
   */
  async getGalerias(page: number = 1, pageSize: number = 25): Promise<GaleriasResponse> {
    return strapiClient.get<GaleriasResponse>('/api/galerias', {
      populate: {
        Fotos: {
          fields: ['id', 'documentId', 'name', 'width', 'height', 'url', 'formats']
        }
      },
      sort: ['createdAt:desc'],
      pagination: {
        page,
        pageSize
      }
    });
  },

  /**
   * Obtiene un álbum por su documentId
   * @param documentId ID del documento
   * @returns Promise con el álbum
   */
  async getAlbumByDocumentId(documentId: string): Promise<{ data: Album }> {
    return strapiClient.get<{ data: Album }>(`/api/galerias/${documentId}`, {
      populate: {
        Fotos: {
          fields: ['id', 'documentId', 'name', 'width', 'height', 'url', 'formats']
        }
      }
    });
  },
};

/**
 * Exportar el cliente para uso en otros servicios
 */
export { strapiClient };
