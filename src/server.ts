import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import {
  createDynamicSitemap,
  parseSitemapPage,
  resolveSitemapApiBaseUrl,
  SITEMAP_CACHE_CONTROL,
} from './server/dynamic-sitemap';

const browserDistFolder = join(import.meta.dirname, '../browser');
const siteUrl = (
  process.env['SITE_URL'] ??
  (process.env['VERCEL_URL'] ? `https://${process.env['VERCEL_URL']}` : 'https://regalalo.org')
).replace(/\/$/, '');

const app = express();

// Whitelist de hosts autorizados para mitigar SSRF y ataques de inyección de Host header.
const allowedHosts = [
  'localhost',
  'localhost:4000',
  'localhost:4201',
  '127.0.0.1',
  '127.0.0.1:4000',
  '127.0.0.1:4201',
  'regalalo.org',
  'www.regalalo.org',
  '*.vercel.app', // Permite subdominios de despliegue en Vercel
  ...(process.env['NODE_ENV'] !== 'production' ? ['*.github.dev', '*.gitpod.io'] : []),
];

const angularApp = new AngularNodeAppEngine({
  allowedHosts,
  // Vercel's CDN adds x-forwarded-for, x-forwarded-host, x-forwarded-proto and
  // other x-forwarded-* headers. Angular SSR's default trustedProxyHeaders set only
  // includes x-forwarded-host and x-forwarded-proto, causing it to deopt to CSR
  // whenever Vercel sends x-forwarded-for. Setting trustProxyHeaders: true tells
  // Angular to treat all x-forwarded-* headers as coming from a trusted proxy.
  trustProxyHeaders: true,
});

// Pre-computar la CSP al arrancar: API_URL no cambia en runtime.
// Nota: 'unsafe-inline' es requerido por Angular (estilos de componente) y reCAPTCHA
// (scripts inyectados). Limita la protección XSS pero no puede evitarse sin nonces.
const apiBaseUrl = process.env['API_URL'] || process.env['APP_ENV'] === 'production' ? 'https://api-production.regalalo.org' : 'http://localhost:3000';
let apiOrigin: string;
try {
  apiOrigin = new URL(apiBaseUrl).origin;
} catch {
  apiOrigin = apiBaseUrl;
}

let supabaseOrigin = 'https://*.supabase.co';
const supabaseBaseUrl = process.env['SUPABASE_URL'];
if (supabaseBaseUrl) {
  try {
    supabaseOrigin = new URL(supabaseBaseUrl).origin;
  } catch {
    // Mantener wildcard si la variable está mal formada.
  }
}

const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://www.googletagmanager.com/",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com/",
  "font-src 'self' https://fonts.gstatic.com/",
  `img-src 'self' data: blob: ${apiOrigin} ${supabaseOrigin} https://www.google-analytics.com/ https://www.googletagmanager.com/ https://www.gstatic.com/`,
  `connect-src 'self' ${apiOrigin} https://www.google-analytics.com/ https://analytics.google.com/ https://region1.google-analytics.com/ https://www.googletagmanager.com/ https://www.google.com/recaptcha/ https://recaptcha.google.com/`,
  "frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ');

// Configuración de seguridad para SSR
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', cspHeader);

  // HSTS solo en producción sobre HTTPS (no en localhost)
  const isLocalhost =
    req.hostname === 'localhost' ||
    req.hostname === '127.0.0.1' ||
    req.hostname.endsWith('.local');
  if (!isLocalhost && (req.secure || req.headers['x-forwarded-proto'] === 'https')) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
});

const dynamicSitemap = createDynamicSitemap({
  siteUrl,
  apiBaseUrl: resolveSitemapApiBaseUrl(process.env),
});

function sendSitemap(res: express.Response, xml: string): void {
  res.type('application/xml');
  res.setHeader('Cache-Control', SITEMAP_CACHE_CONTROL);
  res.send(xml);
}

app.get('/sitemap.xml', async (_req, res) => {
  sendSitemap(res, await dynamicSitemap.index());
});

app.get('/sitemap-static.xml', (_req, res) => {
  sendSitemap(res, dynamicSitemap.staticChunk());
});

app.get('/sitemap-items-:page.xml', async (req, res) => {
  const page = parseSitemapPage(req.params['page'] ?? '');
  const xml = page === null ? null : await dynamicSitemap.itemsChunk(page);
  if (xml === null) {
    res.sendStatus(404);
    return;
  }
  sendSitemap(res, xml);
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
