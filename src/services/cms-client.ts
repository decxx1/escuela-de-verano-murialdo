import type { CmsSnapshot, CmsType } from '../types/content';

export const cmsTypes: CmsType[] = ['news', 'activities', 'team', 'galleries', 'prices', 'faqs', 'age-groups', 'seasons', 'contact', 'settings', 'pages'];
export type CmsRequest = (url: string, options: RequestInit) => Promise<Response>;

export class CmsClient {
  private cached?: CmsSnapshot;
  private pending?: Promise<CmsSnapshot>;
  private expiresAt = 0;

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

  async snapshot(): Promise<CmsSnapshot> {
    if (this.cached && this.clock() < this.expiresAt) return this.cached;
    if (this.pending) return this.pending;
    this.pending = this.load();
    try {
      this.cached = await this.pending;
      this.expiresAt = this.clock() + this.ttl;
      return this.cached;
    } finally {
      this.pending = undefined;
    }
  }

  private async load(): Promise<CmsSnapshot> {
    const url = `${this.url.replace(/\/$/, '')}/api/v1/sites/${this.site}/snapshot`;
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    let response: Response;
    try {
      response = await this.request(url, { headers, signal: AbortSignal.timeout(30000) });
    } catch {
      throw new Error(`No se pudo conectar al CMS en ${this.url}. Iniciá Laravel y PostgreSQL de Laragon.`);
    }
    if (! response.ok) throw new Error(`El CMS respondió ${response.status}. Revisá CMS_SITE, CMS_TOKEN o la lectura pública del sitio.`);
    const snapshot = await response.json() as CmsSnapshot;
    if (snapshot.site?.slug !== this.site || snapshot.preview !== false || cmsTypes.some((type) => ! Array.isArray(snapshot.contents?.[type]))) {
      throw new Error('El CMS devolvió un snapshot incompleto o de otro sitio.');
    }
    return snapshot;
  }
}
