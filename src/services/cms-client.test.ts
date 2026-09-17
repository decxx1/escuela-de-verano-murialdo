import { expect, test } from 'bun:test';
import { CmsClient, cmsTypes } from './cms-client';
import type { CmsRequest } from './cms-client';
import type { CmsSnapshot } from '../types/content';

const snapshot = (): CmsSnapshot => ({ site: { name: 'Murialdo', slug: 'escuela-de-verano', domain: null }, generated_at: '2026-09-16', preview: false,
  contents: cmsTypes.reduce((contents, type) => { contents[type] = []; return contents; }, {} as CmsSnapshot['contents']) });

test('shares a snapshot between concurrent requests without exposing tokens in URLs', async () => {
  let calls = 0;
  const request = (async (url: string, options: RequestInit) => {
    calls++;
    expect(url).toBe('http://127.0.0.1:8000/api/v1/sites/escuela-de-verano/snapshot');
    expect(options.headers).toEqual({ Accept: 'application/json', Authorization: 'Bearer cms_secret' });
    return Response.json(snapshot());
  }) as CmsRequest;
  const client = new CmsClient('http://127.0.0.1:8000/', 'escuela-de-verano', 'cms_secret', 3000, request);
  await Promise.all([client.snapshot(), client.snapshot(), client.snapshot()]);
  expect(calls).toBe(1);
});

test('refreshes development data after the cache expires', async () => {
  let now = 0;
  let calls = 0;
  const request = (async () => { calls++; return Response.json(snapshot()); }) as CmsRequest;
  const client = new CmsClient('http://localhost:8000', 'escuela-de-verano', '', 3000, request, () => now);
  await client.snapshot();
  now = 2999;
  await client.snapshot();
  expect(calls).toBe(1);
  now = 3001;
  await client.snapshot();
  expect(calls).toBe(2);
});

test('fails clearly on CMS errors and retries instead of caching an empty website', async () => {
  let calls = 0;
  const request = (async () => { calls++; return calls === 1 ? new Response('', { status: 503 }) : Response.json(snapshot()); }) as CmsRequest;
  const client = new CmsClient('http://localhost:8000', 'escuela-de-verano', '', Infinity, request);
  await expect(client.snapshot()).rejects.toThrow('503');
  await expect(client.snapshot()).resolves.toHaveProperty('site.slug', 'escuela-de-verano');
  expect(calls).toBe(2);
});

test('rejects incomplete snapshots, previews and other tenants', async () => {
  for (const data of [{ ...snapshot(), preview: true }, { ...snapshot(), contents: {} }, { ...snapshot(), site: { slug: 'other-site' } }]) {
    const client = new CmsClient('http://localhost:8000', 'escuela-de-verano', '', 3000, (async () => Response.json(data)) as CmsRequest);
    await expect(client.snapshot()).rejects.toThrow('snapshot incompleto');
  }
});

test('rejects credential-bearing URLs and invalid slugs', () => {
  expect(() => new CmsClient('https://user:password@example.com', 'escuela-de-verano')).toThrow();
  expect(() => new CmsClient('http://localhost:8000', '../admin')).toThrow();
});
