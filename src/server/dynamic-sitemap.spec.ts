/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  createDynamicSitemap,
  parseSitemapPage,
  resolveSitemapApiBaseUrl,
  SITEMAP_CACHE_TTL_MS,
} from './dynamic-sitemap';

const SITE = 'https://regalalo.org';
const API = 'https://api.test/api';

function feedResponse(items: Array<{ slug: string; createdAt: string }>, totalPages: number): Response {
  return new Response(
    JSON.stringify({ items, pagination: { page: 1, limit: 50, total: items.length, totalPages } }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}

function setup(fetchImpl: (url: string) => Promise<Response>, startAt = Date.UTC(2026, 9, 29, 10)) {
  let clock = startAt;
  const fetchMock = vi.fn((input: RequestInfo | URL, _init?: RequestInit) => fetchImpl(String(input)));
  const sitemap = createDynamicSitemap({
    siteUrl: SITE,
    apiBaseUrl: API,
    fetch: fetchMock as unknown as typeof fetch,
    now: () => clock,
  });
  return { sitemap, fetchMock, advance: (ms: number) => (clock += ms) };
}

function itemLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

describe('dynamic sitemap', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('INDEX: enlaza el estático y un sitemap por página con una sola llamada al API', async () => {
    const { sitemap, fetchMock } = setup(async () => feedResponse([], 2));

    const xml = await sitemap.index();

    expect(xml).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(itemLocs(xml)).toEqual([
      `${SITE}/sitemap-static.xml`,
      `${SITE}/sitemap-items-1.xml`,
      `${SITE}/sitemap-items-2.xml`,
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${API}/items?page=1&limit=50`);
    const init = fetchMock.mock.calls[0][1];
    expect(new Headers(init?.headers).has('Authorization')).toBe(false);
  });

  it('STATIC: repite las 7 URLs estáticas sin llamar al API', () => {
    const { sitemap, fetchMock, advance } = setup(async () => feedResponse([], 0));

    const first = sitemap.staticChunk();
    advance(SITEMAP_CACHE_TTL_MS - 1);
    const second = sitemap.staticChunk();

    expect(second).toBe(first);
    expect(itemLocs(first)).toEqual([
      `${SITE}/`,
      `${SITE}/en`,
      `${SITE}/ca`,
      `${SITE}/como-funciona/reputacion`,
      `${SITE}/ca/com-funciona/reputacio`,
      `${SITE}/en/how-it-works/reputation`,
      `${SITE}/explorar`,
    ]);
    expect(first).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('ITEMS_CHUNK: solo incluye los ítems de esa página con priority 0.7', async () => {
    const { sitemap, fetchMock } = setup(async () =>
      feedResponse(
        [
          { slug: 'bicicleta-montana', createdAt: '2026-10-20T08:00:00.000Z' },
          { slug: 'silla-2', createdAt: '2026-10-21T08:00:00.000Z' },
        ],
        3,
      ),
    );

    const xml = (await sitemap.itemsChunk(2)) ?? '';

    expect(itemLocs(xml)).toEqual([`${SITE}/items/bicicleta-montana`, `${SITE}/items/silla-2`]);
    expect(xml.match(/<priority>0\.7<\/priority>/g)).toHaveLength(2);
    expect(xml.match(/<changefreq>daily<\/changefreq>/g)).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${API}/items?page=2&limit=50`);
  });

  it('CAP_100: el índice enlaza como mucho 100 sitemaps de ítems', async () => {
    const { sitemap, fetchMock } = setup(async () => feedResponse([], 250));

    const locs = itemLocs(await sitemap.index());

    expect(locs).toHaveLength(101);
    expect(locs.at(-1)).toBe(`${SITE}/sitemap-items-100.xml`);
    expect(locs).not.toContain(`${SITE}/sitemap-items-101.xml`);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('SKIP_EMPTY_SLUG: omite ítems con slug vacío y escapa la URL', async () => {
    const { sitemap } = setup(async () =>
      feedResponse(
        [
          { slug: '', createdAt: '2026-10-20T08:00:00.000Z' },
          { slug: 'a&b<c>', createdAt: '2026-10-20T08:00:00.000Z' },
        ],
        1,
      ),
    );

    const xml = (await sitemap.itemsChunk(1)) ?? '';

    expect(xml.match(/<url>/g)).toHaveLength(1);
    expect(xml).toContain(`<loc>${SITE}/items/a&amp;b&lt;c&gt;</loc>`);
    expect(xml).not.toContain(`${SITE}/items/</loc>`);
  });

  it('LASTMOD: usa el día de createdAt y omite lastmod si la fecha es ilegible', async () => {
    const { sitemap } = setup(async () =>
      feedResponse(
        [
          { slug: 'con-fecha', createdAt: '2026-10-20T23:30:00.000Z' },
          { slug: 'sin-fecha', createdAt: 'no-es-fecha' },
        ],
        1,
      ),
    );

    const xml = (await sitemap.itemsChunk(1)) ?? '';
    const [withDate, withoutDate] = xml.split('\n').filter((line) => line.includes('<url>'));

    expect(withDate).toContain('<lastmod>2026-10-20</lastmod>');
    expect(withoutDate).not.toContain('<lastmod>');
  });

  it('CACHE_HIT: el segundo GET del mismo trozo antes de 60 min no vuelve a llamar al API', async () => {
    const { sitemap, fetchMock, advance } = setup(async () =>
      feedResponse([{ slug: 'silla-2', createdAt: '2026-10-21T08:00:00.000Z' }], 1),
    );

    const first = await sitemap.itemsChunk(1);
    advance(SITEMAP_CACHE_TTL_MS - 1);
    const second = await sitemap.itemsChunk(1);

    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await sitemap.itemsChunk(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    advance(1);
    await sitemap.itemsChunk(1);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('BACKEND_DOWN: el índice solo enlaza el sitemap estático y cachea la degradación', async () => {
    const { sitemap, fetchMock } = setup(async () => {
      throw new Error('ECONNREFUSED');
    });

    const xml = await sitemap.index();
    await sitemap.index();

    expect(itemLocs(xml)).toEqual([`${SITE}/sitemap-static.xml`]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('CHUNK_DOWN: un trozo que falla devuelve un urlset vacío', async () => {
    const { sitemap, fetchMock } = setup(async () => new Response('fail', { status: 503 }));

    const xml = await sitemap.itemsChunk(3);
    await sitemap.itemsChunk(3);

    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).not.toContain('<url>');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('PAGE_RANGE: páginas 0 y 101 dan 404 (null) sin llamar al API', async () => {
    const { sitemap, fetchMock } = setup(async () => feedResponse([], 1));

    expect(parseSitemapPage('0')).toBeNull();
    expect(parseSitemapPage('101')).toBeNull();
    expect(parseSitemapPage('01')).toBeNull();
    expect(parseSitemapPage('abc')).toBeNull();
    expect(parseSitemapPage('1')).toBe(1);
    expect(parseSitemapPage('100')).toBe(100);
    expect(await sitemap.itemsChunk(0)).toBeNull();
    expect(await sitemap.itemsChunk(101)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('ROBOTS: public/robots.txt sigue apuntando al índice', () => {
    const robots = readFileSync(join(process.cwd(), 'public', 'robots.txt'), 'utf8');

    expect(robots).toContain('Sitemap: https://regalalo.org/sitemap.xml');
  });

  it('usa la misma base de API que resolveBackendApiUrl', () => {
    expect(resolveSitemapApiBaseUrl({})).toBe('https://api-production.regalalo.org/api');
    expect(resolveSitemapApiBaseUrl({ API_URL: ' http://localhost:3000/api/ ' })).toBe(
      'http://localhost:3000/api',
    );
  });
});
