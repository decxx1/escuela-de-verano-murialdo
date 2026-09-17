import type { CmsEntry, CmsType, ContentResponse } from '../types/content';
import { adaptActivity, adaptAgeGroup, adaptContact, adaptFaq, adaptGallery, adaptNews, adaptPrice, adaptSeason, adaptSettings, adaptTeamMember, paginate } from './cms-adapter';
import { CmsClient } from './cms-client';

export function createCmsServices(client: CmsClient) {
  const adapted = new WeakMap<CmsEntry[], unknown[]>();
  const single = <T>(data: T) => ({ data, meta: { pagination: { page: 1, pageSize: 1, pageCount: data ? 1 : 0, total: data ? 1 : 0 } } });
  const all = async <T>(type: CmsType, adapt: (entry: CmsEntry) => T): Promise<T[]> => {
    const entries = await client.all(type);
    const cached = adapted.get(entries);
    if (cached) return cached as T[];
    const items = entries.map(adapt);
    adapted.set(entries, items);
    return items;
  };
  const list = async <T>(type: CmsType, adapt: (entry: CmsEntry) => T): Promise<ContentResponse<T[]>> => {
    const items = await all(type, adapt);
    return paginate(items, 1, Math.max(1, items.length));
  };
  const page = async <T>(type: CmsType, adapt: (entry: CmsEntry) => T, page: number, perPage: number): Promise<ContentResponse<T[]>> => {
    const result = await client.collection(type, page, perPage);
    return { data: result.data.map(adapt), meta: { pagination: { page: result.meta.current_page, pageSize: result.meta.per_page,
      pageCount: result.meta.total ? result.meta.last_page : 0, total: result.meta.total } } };
  };

  return {
    cmsService: { getSnapshot: () => client.snapshot() },
    divisionesService: { getDivisiones: () => list('age-groups', adaptAgeGroup) },
    preguntasFrecuentesService: { getPreguntas: () => list('faqs', adaptFaq) },
    contactoService: { getContacto: async () => single(adaptContact(await client.entry('contact', 'default'))) },
    ajusteService: { getAjustes: async () => single(adaptSettings(await client.entry('settings', 'default'))) },
    actividadesService: { getActividades: () => list('activities', adaptActivity) },
    fechaService: { getFecha: async () => single(adaptSeason(await client.all('seasons'))) },
    precioService: { getPrecios: () => list('prices', adaptPrice) },
    equipoService: { getEquipos: async () => {
      const members = (await all('team', adaptTeamMember)).filter((member) => member !== null);
      return paginate(members, 1, Math.max(1, members.length));
    } },
    noticiasService: {
      getNoticias: (pageNumber = 1, pageSize = 25) => page('news', adaptNews, pageNumber, pageSize),
      getAllNoticias: () => all('news', adaptNews),
      getNoticiaBySlug: async (slug: string) => ({ data: adaptNews(await client.entry('news', slug)) }),
    },
    galeriasService: {
      getGalerias: (pageNumber = 1, pageSize = 25) => page('galleries', adaptGallery, pageNumber, pageSize),
      getAllGalerias: () => all('galleries', adaptGallery),
      getAlbumBySlug: async (slug: string) => ({ data: adaptGallery(await client.entry('galleries', slug)) }),
    },
  };
}
