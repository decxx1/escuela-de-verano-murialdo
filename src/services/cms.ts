import { CMS_URL, CMS_SITE, CMS_TOKEN } from 'astro:env/server';
import { adaptSnapshot, paginate } from './cms-adapter';
import { CmsClient } from './cms-client';

const client = new CmsClient(CMS_URL, CMS_SITE, CMS_TOKEN, import.meta.env.DEV ? 3000 : Infinity);
export const cmsService = { getSnapshot: () => client.snapshot() };
const content = async () => adaptSnapshot(await client.snapshot());
const single = <T>(data: T) => ({ data, meta: { pagination: { page: 1, pageSize: 1, pageCount: 1, total: data ? 1 : 0 } } });

export const divisionesService = { getDivisiones: async () => paginate((await content()).divisiones, 1, 100) };
export const preguntasFrecuentesService = { getPreguntas: async () => paginate((await content()).preguntas, 1, 100) };
export const contactoService = { getContacto: async () => single((await content()).contacto) };
export const ajusteService = { getAjustes: async () => single((await content()).ajustes) };
export const actividadesService = { getActividades: async () => paginate((await content()).actividades, 1, 5000) };
export const fechaService = { getFecha: async () => single((await content()).fecha) };
export const precioService = { getPrecios: async () => paginate((await content()).turnos, 1, 5000) };
export const equipoService = { getEquipos: async () => paginate((await content()).equipo, 1, 5000) };
export const noticiasService = {
  getNoticias: async (page = 1, pageSize = 25) => paginate((await content()).noticias, page, pageSize),
  getAllNoticias: async () => (await content()).noticias,
  getNoticiaBySlug: async (slug: string) => {
    const entry = (await content()).noticias.find((entry) => entry.documentId === slug);
    if (! entry) throw new Error(`Noticia no publicada: ${slug}`);
    return { data: entry };
  },
};
export const galeriasService = {
  getGalerias: async (page = 1, pageSize = 25) => paginate((await content()).albumes, page, pageSize),
  getAllGalerias: async () => (await content()).albumes,
  getAlbumBySlug: async (slug: string) => {
    const entry = (await content()).albumes.find((entry) => entry.documentId === slug);
    if (! entry) throw new Error(`Álbum no publicado: ${slug}`);
    return { data: entry };
  },
};
