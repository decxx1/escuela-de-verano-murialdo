import type { CmsCollection, CmsEntry, CmsSnapshot, CmsType } from '../types/content';

export const cmsTypes: CmsType[] = ['news', 'activities', 'team', 'galleries', 'prices', 'faqs', 'age-groups', 'seasons', 'contact', 'settings', 'pages'];
export type CmsRequest = (url: string, options: RequestInit) => Promise<Response>;

export class CmsClient {
  private readonly cached = new Map<string, { value: unknown; expiresAt: number }>();
  private readonly pending = new Map<string, Promise<unknown>>();

  constructor(
    private readonly url: string,
    private readonly site: string,
    private readonly token = '',
    private readonly ttl = 3000,
    private readonly request: CmsRequest = fetch,
    private readonly clock = Date.now,
  ) {
    const parsed = new URL(url);
    if (! ['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash) {
      throw new Error('CMS_URL debe ser una URL HTTP/HTTPS sin credenciales ni parámetros.');
    }
    if (! /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(site)) throw new Error('CMS_SITE no es un slug válido.');
  }

  private async remember<T>(key: string, load: () => Promise<T>): Promise<T> {
    const cached = this.cached.get(key);
    if (cached && this.clock() < cached.expiresAt) return cached.value as T;
    const pending = this.pending.get(key);
    if (pending) return pending as Promise<T>;
    const promise = load();
    this.pending.set(key, promise);
    try {
      const value = await promise;
      this.cached.set(key, { value, expiresAt: this.clock() + this.ttl });
      return value;
    } finally {
      this.pending.delete(key);
    }
  }

  snapshot(): Promise<CmsSnapshot> {
    return this.remember('snapshot', async () => {
      const snapshot = await this.load('snapshot') as CmsSnapshot;
      if (snapshot?.site?.slug !== this.site || snapshot.preview !== false || cmsTypes.some((type) => ! Array.isArray(snapshot.contents?.[type]))) {
        throw new Error('El CMS devolvió un snapshot incompleto o de otro sitio.');
      }
      return snapshot;
    });
  }

  collection(type: CmsType, page = 1, perPage = 25): Promise<CmsCollection> {
    this.validateType(type);
    if (! Number.isInteger(page) || page < 1 || ! Number.isInteger(perPage) || perPage < 1 || perPage > 100) {
      throw new Error('Paginación inválida: per_page debe estar entre 1 y 100.');
    }
    const query = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (type === 'news' || type === 'galleries') query.set('sort', 'recent');
    const path = `contents/${type}?${query}`;
    return this.remember(path, async () => {
      const result = await this.load(path) as CmsCollection;
      const meta = result?.meta;
      if (! Array.isArray(result?.data) || result.data.some((entry) => ! this.validEntry(entry, type)) ||
          meta?.current_page !== page || meta.per_page !== perPage ||
          ! Number.isInteger(meta.last_page) || meta.last_page < 1 || ! Number.isInteger(meta.total) || meta.total < 0 ||
          meta.last_page !== Math.max(1, Math.ceil(meta.total / perPage)) ||
          result.data.length !== Math.max(0, Math.min(perPage, meta.total - (page - 1) * perPage))) {
        throw new Error(`El CMS devolvió una colección inválida: ${type}.`);
      }
      return result;
    });
  }

  all(type: CmsType): Promise<CmsEntry[]> {
    this.validateType(type);
    return this.remember(`all/${type}`, async () => {
      const first = await this.collection(type, 1, 100);
      const entries = [...first.data];
      for (let page = 2; page <= first.meta.last_page; page++) {
        const next = await this.collection(type, page, 100);
        if (next.meta.total !== first.meta.total) throw new Error(`La colección ${type} cambió durante la lectura. Volvé a compilar.`);
        entries.push(...next.data);
      }
      if (new Set(entries.map((entry) => entry.slug)).size !== entries.length) {
        throw new Error(`La colección ${type} contiene slugs duplicados. Volvé a compilar.`);
      }
      return entries;
    });
  }

  entry(type: CmsType, slug: string): Promise<CmsEntry> {
    this.validateType(type);
    if (! slug || slug === '.' || slug === '..' || /[\/\\\u0000-\u001f]/.test(slug)) throw new Error('Slug de contenido inválido.');
    const path = `contents/${type}/${encodeURIComponent(slug)}`;
    return this.remember(path, async () => {
      const result = await this.load(path) as { data: CmsEntry };
      if (! this.validEntry(result?.data, type) || result.data.slug !== slug) {
        throw new Error(`El CMS devolvió un contenido inválido: ${type}/${slug}.`);
      }
      return result.data;
    });
  }

  private validateType(type: CmsType): void {
    if (! cmsTypes.includes(type)) throw new Error('Tipo de contenido inválido.');
  }

  private validEntry(entry: CmsEntry, type: CmsType): boolean {
    return !! entry && entry.type === type && typeof entry.slug === 'string' && entry.slug.length > 0 &&
      typeof entry.title === 'string' && typeof entry.published_at === 'string' &&
      !! entry.data && typeof entry.data === 'object' && ! Array.isArray(entry.data) &&
      !! entry.media && typeof entry.media === 'object' && ! Array.isArray(entry.media) && ! ('status' in entry);
  }

  private async load(path: string): Promise<unknown> {
    const url = `${this.url.replace(/\/+$/, '')}/api/v1/sites/${this.site}/${path}`;
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    let response: Response;
    try {
      response = await this.request(url, { headers, signal: AbortSignal.timeout(30000) });
    } catch {
      throw new Error(`No se pudo conectar al CMS en ${this.url}. Revisá su disponibilidad y la conexión a la base de datos.`);
    }
    if (! response.ok) throw new Error(`El CMS respondió ${response.status} en ${path}. Revisá CMS_SITE, CMS_TOKEN y las publicaciones del sitio.`);
    return response.json();
  }
}
