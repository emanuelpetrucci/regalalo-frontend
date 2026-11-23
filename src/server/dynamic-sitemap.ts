export const SITEMAP_PAGE_SIZE = 50;
export const SITEMAP_MAX_ITEM_PAGES = 100;
export const SITEMAP_CACHE_TTL_MS = 60 * 60 * 1000;
export const SITEMAP_CACHE_CONTROL = 'public, max-age=3600';
const FETCH_TIMEOUT_MS = 5000;

const STATIC_ENTRIES: ReadonlyArray<{ path: string; priority: string; changefreq: string }> = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/en', priority: '0.9', changefreq: 'weekly' },
  { path: '/ca', priority: '0.9', changefreq: 'weekly' },
  { path: '/como-funciona/reputacion', priority: '0.7', changefreq: 'monthly' },
  { path: '/ca/com-funciona/reputacio', priority: '0.7', changefreq: 'monthly' },
  { path: '/en/how-it-works/reputation', priority: '0.7', changefreq: 'monthly' },
  { path: '/explorar', priority: '0.8', changefreq: 'daily' },
];

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';

interface FeedItem {
  slug?: string | null;
  createdAt?: string | null;
}

interface FeedPage {
  items: FeedItem[];
  totalPages: number;
}

export interface DynamicSitemapOptions {
  siteUrl: string;
  apiBaseUrl: string;
  fetch?: typeof fetch;
  now?: () => number;
}

export interface DynamicSitemap {
  index(): Promise<string>;
  staticChunk(): string;
  /** `null` cuando la página está fuera de 1..100 (sin llamar al API). */
  itemsChunk(page: number): Promise<string | null>;
}

/** Misma regla que `resolveBackendApiUrl` en `app.config.server.ts`. */
export function resolveSitemapApiBaseUrl(env: Record<string, string | undefined>): string {
  const fromEnv = env['API_URL']?.trim();
  return (fromEnv || 'https://api-production.regalalo.org/api').replace(/\/$/, '');
}

export function parseSitemapPage(raw: string): number | null {
  if (!/^[1-9]\d{0,2}$/.test(raw)) {
    return null;
  }
  const page = Number(raw);
  return page <= SITEMAP_MAX_ITEM_PAGES ? page : null;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function toLastmod(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : new Date(time).toISOString().slice(0, 10);
}

function urlEntry(loc: string, lastmod: string | null, changefreq: string, priority: string): string {
  const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : '';
  return `  <url><loc>${escapeXml(loc)}</loc>${lastmodTag}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

function urlset(entries: string[]): string {
  const body = entries.length ? `${entries.join('\n')}\n` : '';
  return `${XML_HEADER}\n<urlset xmlns="${SITEMAP_NS}">\n${body}</urlset>`;
}

function sitemapIndex(locs: string[]): string {
  const body = locs.map((loc) => `  <sitemap><loc>${escapeXml(loc)}</loc></sitemap>`).join('\n');
  return `${XML_HEADER}\n<sitemapindex xmlns="${SITEMAP_NS}">\n${body}\n</sitemapindex>`;
}

export function createDynamicSitemap(options: DynamicSitemapOptions): DynamicSitemap {
  const siteUrl = options.siteUrl.replace(/\/$/, '');
  const apiBaseUrl = options.apiBaseUrl.replace(/\/$/, '');
  const fetchFn = options.fetch ?? fetch;
  const now = options.now ?? Date.now;
  const cache = new Map<string, { body: Promise<string>; expiresAt: number }>();
  let staticCache: { body: string; expiresAt: number } | undefined;

  // `build` nunca rechaza: degrada a un XML válido, que también se cachea.
  function cached(key: string, build: () => Promise<string>): Promise<string> {
    const hit = cache.get(key);
    if (hit && hit.expiresAt > now()) {
      return hit.body;
    }
    const body = build();
    cache.set(key, { body, expiresAt: now() + SITEMAP_CACHE_TTL_MS });
    return body;
  }

  async function fetchFeedPage(page: number): Promise<FeedPage> {
    const url = `${apiBaseUrl}/items?page=${page}&limit=${SITEMAP_PAGE_SIZE}`;
    const response = await fetchFn(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`GET /items?page=${page} respondió ${response.status}`);
    }
    const json = (await response.json()) as {
      items?: unknown;
      pagination?: { totalPages?: unknown };
    };
    const items = Array.isArray(json.items) ? (json.items as FeedItem[]) : [];
    const totalPages = Number(json.pagination?.totalPages);
    return { items, totalPages: Number.isFinite(totalPages) ? totalPages : 0 };
  }

  return {
    index() {
      return cached('index', async () => {
        const locs = [`${siteUrl}/sitemap-static.xml`];
        try {
          const { totalPages } = await fetchFeedPage(1);
          const chunks = Math.min(Math.max(Math.floor(totalPages), 0), SITEMAP_MAX_ITEM_PAGES);
          for (let page = 1; page <= chunks; page++) {
            locs.push(`${siteUrl}/sitemap-items-${page}.xml`);
          }
        } catch (error) {
          console.error('[sitemap] índice degradado: no se pudo leer el feed', error);
        }
        return sitemapIndex(locs);
      });
    },

    staticChunk() {
      if (staticCache && staticCache.expiresAt > now()) {
        return staticCache.body;
      }
      const lastmod = new Date(now()).toISOString().slice(0, 10);
      const body = urlset(
        STATIC_ENTRIES.map(({ path, priority, changefreq }) =>
          urlEntry(path === '/' ? `${siteUrl}/` : `${siteUrl}${path}`, lastmod, changefreq, priority),
        ),
      );
      staticCache = { body, expiresAt: now() + SITEMAP_CACHE_TTL_MS };
      return body;
    },

    async itemsChunk(page) {
      if (!Number.isInteger(page) || page < 1 || page > SITEMAP_MAX_ITEM_PAGES) {
        return null;
      }
      return cached(`items-${page}`, async () => {
        try {
          const { items } = await fetchFeedPage(page);
          const entries = items
            .filter((item): item is FeedItem & { slug: string } => typeof item.slug === 'string' && item.slug.trim() !== '')
            .map((item) =>
              urlEntry(`${siteUrl}/items/${item.slug.trim()}`, toLastmod(item.createdAt), 'daily', '0.7'),
            );
          return urlset(entries);
        } catch (error) {
          console.error(`[sitemap] trozo de ítems ${page} degradado`, error);
          return urlset([]);
        }
      });
    },
  };
}
