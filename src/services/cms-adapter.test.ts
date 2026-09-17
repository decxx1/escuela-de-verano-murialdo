import { expect, test } from 'bun:test';
import { adaptSnapshot, paginate } from './cms-adapter';
import { cmsTypes } from './cms-client';
import type { CmsEntry, CmsSnapshot, CmsType } from '../types/content';

function entry(type: CmsType, id: number, data: Record<string, unknown> = {}): CmsEntry {
  return { id, type, slug: `${type}-${id}`, title: `Título ${id}`, sort_order: id, data, media: {}, created_at: '2025-11-18T16:27:52Z', published_at: '2025-11-18T16:27:52Z' };
}
function snapshot(): CmsSnapshot {
  const contents = cmsTypes.reduce((contents, type) => { contents[type] = []; return contents; }, {} as CmsSnapshot['contents']);
  contents.contact = [{ ...entry('contact', 1, { phone: '395-0626', whatsapp: '(261) 663-9266', hours: 'Lunes\nSábado', map_embed_url: 'https://www.google.com/maps/embed?pb=test' }), slug: 'default' }];
  contents.settings = [{ ...entry('settings', 2, { enable_team: false, enable_registration: false, enable_prices: false }), slug: 'default' }];
  return { site: { name: 'Murialdo', slug: 'escuela-de-verano', domain: null }, generated_at: '2026-09-16', preview: false, contents };
}
function withPhoto(record: CmsEntry, id: string) {
  record.media[id] = { id, name: 'original.jpg', alt: 'Foto original', mime_type: 'image/jpeg', url: `http://127.0.0.1:8000/media/${id}`, width: 1500, height: 1000,
    formats: { small: { url: `http://127.0.0.1:8000/media/${id}?variant=small`, width: 500, height: 333 } } };
  return record;
}

test('retains all 450 photos across the four albums, original URLs and source dates', () => {
  const data = snapshot();
  data.contents.galleries = [127, 151, 27, 145].map((count, albumIndex) => {
    const record = entry('galleries', albumIndex, { items: Array.from({ length: count }, (_, photoIndex) => ({ asset: `${albumIndex}-${photoIndex}`, caption: '' })) });
    for (let photoIndex = 0; photoIndex < count; photoIndex++) withPhoto(record, `${albumIndex}-${photoIndex}`);
    return record;
  });
  const { albumes } = adaptSnapshot(data);
  expect(albumes.map((album) => album.Fotos.length)).toEqual([127, 151, 27, 145]);
  expect(albumes[0].Fotos[0].url).toBe('http://127.0.0.1:8000/media/0-0');
  expect(albumes[0].Fotos[0].formats.small.url).toEndWith('?variant=small');
  expect(albumes[0].createdAt).toBe('2025-11-18T16:27:52Z');
});

test('supports more than 100 news items and keeps old document IDs as route slugs', () => {
  const data = snapshot();
  data.contents.news = Array.from({ length: 140 }, (_, id) => withPhoto({ ...entry('news', id, { image: `photo-${id}`, body: 'Texto completo.', body_html: '<p>Texto completo.</p>' }), slug: `old-document-${id}` }, `photo-${id}`));
  const { noticias } = adaptSnapshot(data);
  expect(noticias.length).toBe(140);
  expect(noticias[139].documentId).toBe('old-document-139');
  expect(noticias[0].TextoHTML).toBe('<p>Texto completo.</p>');
  expect(paginate(noticias, 2, 100).data.length).toBe(40);
});

test('reproduces disabled registrations, hidden team and unavailable season without inventing dates', () => {
  const { ajustes, fecha, turnos, contacto } = adaptSnapshot(snapshot());
  expect(ajustes.HabilitarEquipo).toBe(false);
  expect(ajustes.HabilitarInscripciones).toBe(false);
  expect(ajustes.HabilitarPrecios).toBe(false);
  expect(fecha).toBeNull();
  expect(turnos).toEqual([]);
  expect(contacto.Horarios).toBe('Lunes\nSábado');
  expect(contacto.MapEmbedUrl).toStartWith('https://www.google.com/maps/embed?');
});

test('omits gallery files explicitly hidden from the public media response', () => {
  const data = snapshot();
  data.contents.galleries = [withPhoto(entry('galleries', 1, { items: [{ asset: 'visible' }, { asset: 'hidden' }] }), 'visible')];
  expect(adaptSnapshot(data).albumes[0].Fotos.length).toBe(1);
});

test('requires published contact and settings and validates pagination', () => {
  const data = snapshot();
  data.contents.settings = [];
  expect(() => adaptSnapshot(data)).toThrow('settings/default');
  expect(() => paginate([], 0)).toThrow();
});
