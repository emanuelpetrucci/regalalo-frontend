/**
 * Genera environment.vercel.generated.ts según VERCEL_ENV.
 *
 * Preview y Development → mismos valores que environment.development.ts
 * Production            → mismos valores que environment.production.ts
 *
 * Las variables en Vercel Dashboard pueden sobreescribir cualquier campo.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Espejo de src/environments/environment.development.ts */
const DEVELOPMENT = {
  production: false,
  apiUrl: '/bffd',
  recaptchaSiteKey: '6LehTP8sAAAAAKFX8lwnxrwg8A71ua8egLPN3NEU',
  siteUrl: 'https://regalalo.org',
  googleAnalyticsId: 'G-58JC8N8SBE',
  ogImagePath: '/og-image.png',
};

/** Espejo de src/environments/environment.production.ts */
const PRODUCTION = {
  production: true,
  apiUrl: '/bff',
  recaptchaSiteKey: '6LckRP8sAAAAAGiUFUHVTb93myR6kXsLIlGstpiJ',
  siteUrl: 'https://regalalo.org',
  googleAnalyticsId: 'G-58JC8N8SBE',
  ogImagePath: '/og-image.png',
};

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = join(root, 'src/environments/environment.vercel.generated.ts');

const vercelEnv = (process.env.VERCEL_ENV ?? 'local').trim();
const defaults = vercelEnv === 'production' ? PRODUCTION : DEVELOPMENT;

function envValue(name) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return undefined;
  return raw.trim();
}

function pickString(name, fallback) {
  const value = envValue(name);
  return value !== undefined ? value : fallback;
}

const apiUrl = defaults.apiUrl;
const recaptchaSiteKey = pickString('RECAPTCHA_SITE_KEY', defaults.recaptchaSiteKey);
const siteUrl = pickString('SITE_URL', defaults.siteUrl).replace(/\/$/, '');
const googleAnalyticsId = pickString('GOOGLE_ANALYTICS_ID', defaults.googleAnalyticsId);

function escapeString(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

const content = `/** Generado por scripts/generate-vercel-environment.mjs — no editar a mano */
export const environment = {
  production: ${defaults.production},
  apiUrl: '${escapeString(apiUrl)}',
  recaptchaSiteKey: '${escapeString(recaptchaSiteKey)}',
  siteUrl: '${escapeString(siteUrl)}',
  googleAnalyticsId: '${escapeString(googleAnalyticsId)}',
  ogImagePath: '${escapeString(defaults.ogImagePath)}',
};
`;

writeFileSync(outFile, content, 'utf8');
console.log(
  `[vercel-env] VERCEL_ENV=${vercelEnv} production=${defaults.production} apiUrl=${apiUrl} siteUrl=${siteUrl}`,
);
