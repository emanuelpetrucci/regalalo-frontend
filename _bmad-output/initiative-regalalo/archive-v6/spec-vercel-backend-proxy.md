---
title: 'Proxy Vercel: ocultar URL del backend del bundle Angular'
type: 'feature'
created: '2026-06-08'
status: 'done'
baseline_commit: 'b6aa54eb08b3bb86b82035c558bc8e61928e1517'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** El bundle compilado de Angular embebe las URLs absolutas del backend (`api-production.regalalo.org`) en los chunks JS y las expone en el Network tab del navegador, lo que permite a cualquier usuario identificar el host real y hacer llamadas directas sin pasar por Vercel.

**Approach:** Configurar Vercel Rewrites para que el frontend use rutas relativas (`/bff/*` para producción, `/bffd/*` para staging/preview) y Vercel actúe como proxy transparente hacia los backends. Un interceptor HTTP Angular gestiona el caso SSR, donde las URLs relativas necesitan ser reescritas a absolutas antes de ejecutar la petición.

## Boundaries & Constraints

**Always:**
- Los rewrites proxy (`/bff/*`, `/bffd/*`) deben aparecer ANTES del catch-all `/(.*) → /api` en `vercel.json` (Vercel evalúa en orden de declaración).
- El interceptor SSR solo actúa cuando `environment.apiUrl` empieza por `/` (proxy relativo activo); en local dev la condición es falsa y no interfiere.
- `process.env['API_URL']` ya lo usa `server.ts` para CSP — no renombrarlo; el interceptor usa el mismo valor con fallback explícito.
- No tocar ficheros en `src/app/core/api/generated/` (código auto-generado).

**Ask First:**
- Si se decide usar un único prefijo `/bff/` tanto para producción como para preview (implica que el deploy preview apunte al backend de producción).

**Never:**
- Modificar `environment.development.ts` ni `environment.e2e.ts` (desarrollo local sigue con URL absoluta directa al backend local).
- Implementar el proxy mediante un nuevo serverless function — solo rewrites estáticos de Vercel.
- Añadir el sufijo `/api` en la `destination` del rewrite de `vercel.json` si la ruta backend ya lo incluye (verificar contra las rutas reales del cliente generado).

## I/O & Edge-Case Matrix

| Escenario | Input / Estado | Resultado esperado | Manejo de error |
|---|---|---|---|
| Llamada API producción (browser) | `GET /bff/items` desde `regalalo.org` | Vercel proxy → `api-production.regalalo.org/api/items`, respuesta devuelta al browser | HTTP 502 si backend caído; el browser lo recibe igual |
| Llamada API en SSR (producción) | `GET /bff/items` en función serverless de Vercel | Interceptor SSR reescribe a `$API_URL/items` y la petición va directa al backend (server-to-server) | Falla la petición SSR si `API_URL` no está configurada; Angular renderiza sin datos (hidratación desde TransferState vacío) |
| Llamada API preview/staging (browser) | `GET /bffd/items` desde deploy de rama `develop` | Vercel proxy → `api-development.regalalo.org/api/items` | Igual que producción |
| Llamada API en SSR (preview) | `GET /bffd/items` en serverless preview | Interceptor SSR reescribe a `$API_URL/items`; `API_URL` debe apuntar al backend dev en ese entorno | Error si `API_URL` apunta a producción en preview |
| Desarrollo local | `GET http://localhost:3000/api/items` | Directa al backend local; interceptor no actúa (URL no relativa) | Sin cambio respecto al estado actual |
| Recurso no-API en SSR | `GET /i18n/es.json` | Interceptor ignora (no empieza por `environment.apiUrl`) | — |

</frozen-after-approval>

## Code Map

- `vercel.json` — configuración de hosting Vercel; contiene `headers`, `rewrites` y `functions`
- `src/environments/environment.production.ts` — variables de entorno para el build de producción (contiene `apiUrl` hardcodeado)
- `src/environments/environment.vercel.generated.ts` — generado en build Vercel; refleja prod o dev según `VERCEL_ENV`
- `scripts/generate-vercel-environment.mjs` — script que genera `environment.vercel.generated.ts`; define constantes `PRODUCTION` y `DEVELOPMENT`
- `src/app/core/api/api.providers.ts` — registra los interceptores HTTP y la `ApiConfiguration` con `rootUrl`
- `src/app/core/interceptors/ssr-api-url.interceptor.ts` — NUEVO: interceptor que reescribe rutas proxy relativas a URL absoluta en contexto servidor

## Tasks & Acceptance

**Execution:**
- [x] `vercel.json` -- insertar dos rewrites proxy ANTES del catch-all existente: `/bff/:path*` → `https://api-production.regalalo.org/api/:path*` y `/bffd/:path*` → `https://api-development.regalalo.org/api/:path*` -- Vercel evalúa en orden; deben preceder al `/(.*) → /api`
- [x] `src/environments/environment.production.ts` -- cambiar `apiUrl` de `'https://api-production.regalalo.org/api'` a `'/bff'` -- el bundle compilado deja de contener la URL absoluta del backend
- [x] `scripts/generate-vercel-environment.mjs` -- cambiar `PRODUCTION.apiUrl` a `'/bff'` y `DEVELOPMENT.apiUrl` a `'/bffd'` -- los deploys Vercel de ambas ramas usarán los prefijos proxy correctos
- [x] `src/app/core/interceptors/ssr-api-url.interceptor.ts` -- crear `ssrApiUrlInterceptor: HttpInterceptorFn` que inyecta `BACKEND_API_URL` (token SSR-only) y reescribe rutas relativas `/bff*` a URL absoluta -- `BACKEND_API_URL` se provee solo en `app.config.server.ts` para que el fallback no aparezca en el browser bundle
- [x] `src/app/core/api/api.providers.ts` -- añadir `ssrApiUrlInterceptor` ENTRE `jwtInterceptor` y `authErrorInterceptor`: orden final `[jwtInterceptor, ssrApiUrlInterceptor, authErrorInterceptor]` -- `jwtInterceptor` debe ver la URL relativa `/bff/...` (condición `startsWith(config.rootUrl)`) para adjuntar el JWT; solo después el SSR interceptor la reescribe a absoluta

**Acceptance Criteria:**
- Dado el bundle de producción compilado (`npm run build`), cuando se inspecciona cualquier chunk JS en `dist/`, entonces la cadena `api-production.regalalo.org` no aparece en ningún fichero
- Dado el navegador con la app en producción, cuando se hace cualquier llamada a la API, entonces el Network tab muestra `regalalo.org/bff/...` y nunca `api-production.regalalo.org`
- Dado Angular SSR ejecutándose en la función serverless de Vercel (producción), cuando una ruta hace una petición a `/bff/items`, entonces el interceptor reescribe la URL a la URL absoluta del backend antes de ejecutarla
- Dado desarrollo local (`ng serve`), cuando se hace cualquier llamada a la API, entonces las peticiones van a `http://localhost:3000/api/...` sin cambio

## Spec Change Log

**Iteración 1 — bad_spec: orden incorrecto de interceptores**
- Trigger: `jwtInterceptor` comprueba `req.url.startsWith(config.rootUrl)` (rootUrl='/bff'). Con ssrApiUrlInterceptor PRIMERO, la URL ya está reescrita a absoluta cuando jwtInterceptor la ve → JWT no se adjunta en SSR → 401 en todas las peticiones autenticadas SSR.
- Corregido: tarea de `api.providers.ts` actualizada; orden ahora `[jwtInterceptor, ssrApiUrlInterceptor, authErrorInterceptor]`.
- Estado malo evitado: `[ssrApiUrlInterceptor, jwtInterceptor, authErrorInterceptor]`.
- KEEP: lógica del interceptor SSR, token BACKEND_API_URL, provider en app.config.server.ts, rewrites vercel.json, environment files — todo correcto excepto el orden.

## Design Notes

**Interceptor SSR — patrón:**
```typescript
export const ssrApiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const proxyPrefix = environment.apiUrl; // e.g. '/bff' o '/bffd'
  if (isPlatformServer(platformId) && proxyPrefix.startsWith('/') && req.url.startsWith(proxyPrefix)) {
    const backendBase = (process.env['API_URL'] ?? 'https://api-production.regalalo.org/api').replace(/\/$/, '');
    const relPath = req.url.slice(proxyPrefix.length); // e.g. '/items?page=1'
    return next(req.clone({ url: `${backendBase}${relPath}` }));
  }
  return next(req);
};
```

**Orden final de `rewrites` en `vercel.json`:**
```json
[
  { "source": "/bff/:path*",  "destination": "https://api-production.regalalo.org/api/:path*"  },
  { "source": "/bffd/:path*", "destination": "https://api-development.regalalo.org/api/:path*" },
  { "source": "/(.*)",        "destination": "/api" }
]
```

**Variable de entorno Vercel recomendada:** `API_URL` ya está en uso en `server.ts`. Configurar en el dashboard de Vercel:
- Environment "Production": `API_URL=https://api-production.regalalo.org/api`
- Environment "Preview": `API_URL=https://api-development.regalalo.org/api`

Esto garantiza que el interceptor SSR use el backend correcto en cada deploy.

## Verification

**Commands:**
- `npm run build` -- expected: compilación sin errores de TypeScript
- `node -e "const fs=require('fs'),path=require('path');const dir='dist/regalalo/browser';const found=fs.readdirSync(dir).filter(f=>f.endsWith('.js')).some(f=>fs.readFileSync(path.join(dir,f),'utf8').includes('api-production.regalalo.org'));console.log(found?'FAIL: URL found in bundle':'OK: URL not in bundle')"` -- expected: `OK: URL not in bundle`

**Manual checks (si no hay CLI):**
- Verificar que `vercel.json` tiene los tres rewrites en el orden correcto (proxy antes del catch-all)
- Verificar que `environment.production.ts` y las constantes del generate script usan `/bff` y `/bffd` respectivamente

## Suggested Review Order

**Proxy routing — núcleo del cambio**

- Dos nuevos rewrites antes del catch-all SSR; orden es crítico para Vercel
  [`vercel.json:29`](../../vercel.json#L29)

**Configuración del cliente Angular**

- `apiUrl` pasa de URL absoluta a prefijo relativo `/bff`
  [`environment.production.ts:8`](../../src/environments/environment.production.ts#L8)

- Orden final de interceptores: JWT primero, luego SSR, luego auth-error
  [`api.providers.ts:17`](../../src/app/core/api/api.providers.ts#L17)

- Constantes PRODUCTION/DEVELOPMENT actualizadas; `API_URL` ya no sobreescribe `apiUrl`
  [`generate-vercel-environment.mjs:14`](../../scripts/generate-vercel-environment.mjs#L14)

**Reescritura de URLs en SSR**

- Token SSR-only: la URL absoluta del backend nunca entra en el browser bundle
  [`backend-api-url.token.ts:3`](../../src/app/core/api/backend-api-url.token.ts#L3)

- Provider del token en contexto servidor, lee `process.env['API_URL']`
  [`app.config.server.ts:15`](../../src/app/app.config.server.ts#L15)

- Lógica del interceptor: reescribe `/bff/...` → URL absoluta solo en plataforma servidor
  [`ssr-api-url.interceptor.ts:8`](../../src/app/core/interceptors/ssr-api-url.interceptor.ts#L8)
