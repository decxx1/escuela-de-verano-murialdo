import { CMS_URL, CMS_SITE, CMS_TOKEN } from 'astro:env/server';
import { CmsClient } from './cms-client';
import { createCmsServices } from './cms-services';

// El build estático comparte las consultas; desarrollo vuelve a leer las publicaciones.
const client = new CmsClient(CMS_URL, CMS_SITE, CMS_TOKEN, import.meta.env.DEV ? 3000 : Infinity);
export const { cmsService, divisionesService, preguntasFrecuentesService, contactoService, ajusteService,
  actividadesService, fechaService, precioService, equipoService, noticiasService, galeriasService } = createCmsServices(client);
