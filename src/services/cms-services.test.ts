import { expect, test } from 'bun:test';
import { CmsClient } from './cms-client';
import { createCmsServices } from './cms-services';
import type { CmsEntry, CmsType } from '../types/content';

function entry(type: CmsType, id: number, data: Record<string, unknown> = {}): CmsEntry {
  return { id, type, slug: `${type}-${id}`, title: `Título ${id}`, sort_order: id, data, media: {},
    created_at: '2026-09-17T10:00:00Z', published_at: '2026-09-17T10:00:00Z' };
}

function withImage(record: CmsEntry): CmsEntry {
  record.data.image = 'photo';
  record.media.photo = { id: 'photo', name: 'foto.jpg', alt: null, mime_type: 'image/jpeg', width: 500, height: 333,
    url: 'https://cms.example.com/photo.jpg' };
  return record;
}

function collection(data: CmsEntry[], page: number, perPage: number, total = data.length): Response {
  return Response.json({ data, meta: { current_page: page, per_page: perPage, last_page: Math.max(1, Math.ceil(total / perPage)), total } });
}

test('contact and settings use individual endpoints and share concurrent calls without loading unrelated contents', async () => {
  const urls: string[] = [];
  const client = new CmsClient('https://cms.example.com', 'escuela-de-verano', 'private-token', Infinity, async (url, options) => {
    urls.push(url);
    expect(options.headers).toEqual({ Accept: 'application/json', Authorization: 'Bearer private-token' });
    const type = url.includes('/contact/') ? 'contact' : 'settings';
    expect(url).toEndWith(`/contents/${type}/default`);
    return Response.json({ data: { ...entry(type, 1, { phone: '123', enable_team: false }), slug: 'default' } });
  });
  const { contactoService, ajusteService } = createCmsServices(client);
  const [contact] = await Promise.all([contactoService.getContacto(), contactoService.getContacto(), ajusteService.getAjustes()]);
  expect(contact.data.Telefono).toBe('123');
  await ajusteService.getAjustes();
  expect(urls.length).toBe(2);
});

test('news pagination is performed by the API and maps Laravel metadata', async () => {
  const services = createCmsServices(new CmsClient('https://cms.example.com', 'escuela-de-verano', '', 3000, async (url) => {
    expect(url).toEndWith('/contents/news?page=2&per_page=2&sort=recent');
    return collection([withImage(entry('news', 3))], 2, 2, 3);
  }));
  const result = await services.noticiasService.getNoticias(2, 2);
  expect(result.data.map((item) => item.documentId)).toEqual(['news-3']);
  expect(result.meta.pagination).toEqual({ page: 2, pageSize: 2, pageCount: 2, total: 3 });
});

test('static listings reuse adapted entries and development refreshes them with new publications', async () => {
  let now = 0;
  let calls = 0;
  const client = new CmsClient('https://cms.example.com', 'escuela-de-verano', '', 3000, async () => {
    const record = withImage(entry('news', 1));
    record.title = `Versión ${++calls}`;
    return collection([record], 1, 100);
  }, () => now);
  const { noticiasService } = createCmsServices(client);
  const first = await noticiasService.getAllNoticias();
  expect(await noticiasService.getAllNoticias()).toBe(first);
  now = 3001;
  const updated = await noticiasService.getAllNoticias();
  expect(updated).not.toBe(first);
  expect(updated[0].Titulo).toBe('Versión 2');
});

test('all collections traverse batches beyond the snapshot limit and are shared by static pages', async () => {
  const entries = Array.from({ length: 5101 }, (_, id) => entry('faqs', id, { body: 'Respuesta' }));
  let calls = 0;
  const client = new CmsClient('https://cms.example.com', 'escuela-de-verano', '', Infinity, async (url) => {
    calls++;
    const parsed = new URL(url);
    expect(parsed.pathname).toEndWith('/contents/faqs');
    expect(parsed.searchParams.get('per_page')).toBe('100');
    const page = Number(parsed.searchParams.get('page'));
    return collection(entries.slice((page - 1) * 100, page * 100), page, 100, entries.length);
  });
  const { preguntasFrecuentesService } = createCmsServices(client);
  const [first, second] = await Promise.all([preguntasFrecuentesService.getPreguntas(), preguntasFrecuentesService.getPreguntas()]);
  expect(first.data.length).toBe(5101);
  expect(second.data.at(-1)?.documentId).toBe('faqs-5100');
  expect(calls).toBe(52);
  await preguntasFrecuentesService.getPreguntas();
  expect(calls).toBe(52);
});

test('news and galleries load only their requested slug and preserve complete gallery photos', async () => {
  const urls: string[] = [];
  const services = createCmsServices(new CmsClient('https://cms.example.com', 'escuela-de-verano', '', Infinity, async (url) => {
    urls.push(url);
    const record = withImage(entry(url.includes('/news/') ? 'news' : 'galleries', 1));
    record.slug = 'un álbum';
    record.data.items = Array.from({ length: 151 }, () => ({ asset: 'photo' }));
    return Response.json({ data: record });
  }));
  const album = await services.galeriasService.getAlbumBySlug('un álbum');
  const news = await services.noticiasService.getNoticiaBySlug('un álbum');
  expect(album.data.Fotos.length).toBe(151);
  expect(news.data.documentId).toBe('un álbum');
  expect(urls).toEqual(['https://cms.example.com/api/v1/sites/escuela-de-verano/contents/galleries/un%20%C3%A1lbum',
    'https://cms.example.com/api/v1/sites/escuela-de-verano/contents/news/un%20%C3%A1lbum']);
});

test('development refreshes collection and individual caches independently', async () => {
  let now = 0;
  const urls: string[] = [];
  const client = new CmsClient('https://cms.example.com', 'escuela-de-verano', '', 3000, async (url) => {
    urls.push(url);
    return url.includes('/contact/') ? Response.json({ data: { ...entry('contact', 1), slug: 'default' } }) : collection([], 1, 100);
  }, () => now);
  await client.all('activities');
  now = 2000;
  await client.entry('contact', 'default');
  now = 3001;
  await Promise.all([client.all('activities'), client.all('activities'), client.entry('contact', 'default')]);
  expect(urls.length).toBe(3);
  now = 5001;
  await client.entry('contact', 'default');
  expect(urls.length).toBe(4);
});

test('malformed pagination, preview data, wrong types and wrong slugs are rejected', async () => {
  for (const data of [null, {}, { data: [], meta: { current_page: 2, per_page: 25, last_page: 1, total: 0 } },
    { data: [entry('galleries', 1)], meta: { current_page: 1, per_page: 25, last_page: 1, total: 1 } },
    { data: [{ ...entry('news', 1), status: 'draft' }], meta: { current_page: 1, per_page: 25, last_page: 1, total: 1 } }]) {
    const client = new CmsClient('https://cms.example.com', 'escuela-de-verano', '', 3000, async () => Response.json(data));
    await expect(client.collection('news')).rejects.toThrow('colección inválida');
  }
  const client = new CmsClient('https://cms.example.com', 'escuela-de-verano', '', 3000, async () => Response.json({ data: entry('news', 1) }));
  await expect(client.entry('news', 'other')).rejects.toThrow('contenido inválido');
  expect(() => client.collection('news', 0)).toThrow();
  expect(() => client.collection('news', 1, 101)).toThrow();
  expect(() => client.entry('news', '../snapshot')).toThrow();
});

test('a failed page is retried and does not become a cached partial collection', async () => {
  const entries = Array.from({ length: 101 }, (_, id) => entry('activities', id));
  let lastPageCalls = 0;
  const client = new CmsClient('https://cms.example.com', 'escuela-de-verano', '', Infinity, async (url) => {
    const page = Number(new URL(url).searchParams.get('page'));
    if (page === 2 && ++lastPageCalls === 1) return new Response('', { status: 503 });
    return collection(entries.slice((page - 1) * 100, page * 100), page, 100, entries.length);
  });
  await expect(client.all('activities')).rejects.toThrow('503');
  expect((await client.all('activities')).length).toBe(101);
  expect(lastPageCalls).toBe(2);
});

test('changing collection totals and duplicate slugs cannot silently omit build routes', async () => {
  const entries = Array.from({ length: 101 }, (_, id) => entry('activities', id));
  for (const duplicate of [false, true]) {
    const client = new CmsClient('https://cms.example.com', 'escuela-de-verano', '', Infinity, async (url) => {
      const page = Number(new URL(url).searchParams.get('page'));
      if (page === 1) return collection(entries.slice(0, 100), page, 100, 101);
      return collection(duplicate ? [entries[0]] : [], page, 100, duplicate ? 101 : 100);
    });
    await expect(client.all('activities')).rejects.toThrow(duplicate ? 'slugs duplicados' : 'cambió durante la lectura');
  }
});
