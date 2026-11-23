---
ticket: spec-geo-seo-technical-fixes-1-3-5-6-7-9
status: done
type: feature
migrated_from: v6
---


<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** El GEO audit de 2026-06-06 (score 36/100) identifica 6 errores técnicos corregibles en código: claves i18n sin resolver en la página de reputación rompen el título, meta description y los 3 bloques JSON-LD; headers de seguridad ausentes en Vercel; hreflang incompleto en `/como-funciona/reputacion` (solo `es` + `x-default`, faltan `ca` y `en`); WebSite schema sin `potentialAction`/`SearchAction`; SoftwareApplication schema sin `featureList`, `screenshot` ni `softwareVersion`; y `robots.txt` con dollar-anchors que limitan el acceso a AI crawlers y bots legítimos.

**Approach:** Añadir las claves faltantes a los 3 archivos i18n, extender `ReputationSeoService.setHreflang()` para `ca` y `en`, enriquecer los schemas en `LandingSeoService`, añadir la sección `headers` en `vercel.json`, y corregir `robots.txt` eliminando `$` y añadiendo directivas explícitas para AI bots.

## Boundaries & Constraints

**Always:**
- Los textos i18n para `ca.json` y `en.json` deben ser traducciones fieles de los textos ES proporcionados en el GEO report. No inventar copy.
- El `vercel.json` solo añade la sección `headers`; no alterar `rewrites`, `functions`, `git` ni `ignoreCommand` existentes.
- No añadir `Content-Security-Policy` (requiere análisis exhaustivo de dominios externos; fuera de alcance).

**Ask First:**
- Si las rutas `/ca/como-funciona/reputacion` y `/en/como-funciona/reputacion` no están prerenderizadas o desplegadas, añadir sus hreflang puede generar señales contradictorias para Google. Verificar que las variantes existen antes de añadirlas; si no existen, omitir esos dos hreflang y reportarlo.

**Never:**
- No modificar la lógica de prerender ni el SSR.
- No cambiar el comportamiento de los `Disallow` existentes en `robots.txt`.
- No tocar archivos en `src/app/core/api/generated/`.

</frozen-after-approval>

## Code Map

- `public/i18n/es.json` — archivo de traducciones ES; clave `reputation_guide` existe en línea ~1361 pero le faltan los subárboles `meta` y `seo`
- `public/i18n/ca.json` — archivo de traducciones CA; mismas claves ausentes
- `public/i18n/en.json` — archivo de traducciones EN; mismas claves ausentes
- `src/app/core/seo/reputation-seo.service.ts` — método `setHreflang()` solo añade `es` + `x-default`; necesita `ca` y `en`
- `src/app/core/seo/landing-seo.service.ts` — WebSite schema (falta `potentialAction`) y SoftwareApplication schema (faltan 3 campos)
- `vercel.json` — sin sección `headers`; añadir 5 headers de seguridad
- `public/robots.txt` — `Allow` con dollar-anchor (`/$`, `/en$`, etc.); sin directivas para AI bots
- `src/app/app.routes.ts` — ruta `como-funciona/reputacion` sin variantes de locale; necesita `ca/como-funciona/reputacion` y `en/como-funciona/reputacion` con `data: { locale, publicMode: true }`
- `src/app/features/reputation/reputation-guide.component.ts` — `ngOnInit` no lee `data.locale`; necesita llamar `locale.setLocale()` si el dato existe (mismo patrón que `LandingComponent`)
- `src/app/app.routes.server.ts` — faltan entradas de prerender para las 2 variantes de locale
- `src/server.ts` — sitemap solo incluye `/como-funciona/reputacion`; añadir variantes CA y EN

## Tasks & Acceptance

**Execution:**

- [x] `public/i18n/es.json` — Bajo la clave `reputation_guide`, añadir los subárboles `meta` (`title`, `description`) y `seo` (`breadcrumb_home`, `breadcrumb_page`, `faq.q1`–`q3`, `faq.a1`–`a3`) con los textos exactos del GEO report (sección "Fix for the i18n Bug") — desbloquea el `<title>`, `<meta description>` y los 3 bloques JSON-LD de la página de reputación

- [x] `public/i18n/ca.json` — Añadir las mismas claves en catalán con traducción fiel: título "La teva reputació a Regálalo — Sistema de punts", descripción y FAQ equivalentes — paridad i18n CA

- [x] `public/i18n/en.json` — Añadir las mismas claves en inglés: título "Your reputation on Regálalo — Points system", descripción y FAQ equivalentes — paridad i18n EN

- [x] `src/app/core/seo/reputation-seo.service.ts` — En `setHreflang(url: string)`, añadir dos entradas al array: `{ lang: 'ca', href: url.replace('/como-funciona/reputacion', '/ca/como-funciona/reputacion') }` y `{ lang: 'en', href: url.replace('/como-funciona/reputacion', '/en/como-funciona/reputacion') }` — completa las señales hreflang de la página de reputación

- [x] `src/app/core/seo/landing-seo.service.ts` — (a) En el schema `WebSite`, añadir `potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: 'https://regalalo.org/explorar?q={search_term_string}' }, 'query-input': 'required name=search_term_string' }`. (b) En el schema `SoftwareApplication`, añadir `featureList: ['Donar objetos', 'Solicitar objetos', 'Sistema de reputación comunitaria', 'Entregas peer-to-peer']`, `softwareVersion: '1.0'`, `screenshot: 'https://regalalo.org/og-image.png'` — enriquece ambos schemas para Google AIO y AI engines

- [x] `vercel.json` — Añadir sección `headers` (al mismo nivel que `rewrites`) con regla `source: "/(.*)"` y los 5 headers: `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `Strict-Transport-Security: max-age=63072000; includeSubDomains` — cubre todas las rutas de la app

- [x] `src/app/app.routes.ts` — Añadir dos rutas nuevas antes de `'**'`: `{ path: 'ca/como-funciona/reputacion', loadComponent: () => import('./features/reputation/reputation-guide.component').then(m => m.ReputationGuideComponent), data: { locale: 'ca', publicMode: true } }` y la equivalente `en` — habilita las URLs de reputación en catalán e inglés

- [x] `src/app/features/reputation/reputation-guide.component.ts` — En `ngOnInit()`, antes de llamar a `this.reputationSeo.apply(...)`, añadir: `const routeLocale = this.route.snapshot.data['locale'] as AppLocale | undefined; if (routeLocale) { this.locale.setLocale(routeLocale); }` (inyectar `ActivatedRoute` como `route` y `LocaleService` como `locale` si no están ya inyectados) — garantiza que el SSR prerender renderiza con el locale correcto

- [x] `src/app/app.routes.server.ts` — Añadir `{ path: 'ca/como-funciona/reputacion', renderMode: RenderMode.Prerender }` y `{ path: 'en/como-funciona/reputacion', renderMode: RenderMode.Prerender }` junto a la entrada ES existente — registra las rutas para prerender en build

- [x] `src/server.ts` — En el array `sitemapEntries` (o equivalente), añadir entradas para `/ca/como-funciona/reputacion` y `/en/como-funciona/reputacion` con `lastmod` actualizado — incluye las variantes de locale en el sitemap

- [x] `public/robots.txt` — (a) Eliminar el `$` de todos los `Allow`: `Allow: /$` → `Allow: /`, `Allow: /en$` → `Allow: /en`, `Allow: /ca$` → `Allow: /ca`, `Allow: /como-funciona/reputacion$` → `Allow: /como-funciona/reputacion`. (b) Añadir antes del bloque `User-agent: *` tres bloques nuevos para AI crawlers: `User-agent: GPTBot`, `User-agent: PerplexityBot` y `User-agent: ClaudeBot`, cada uno con `Allow: /` seguido de `Allow: /en` y `Allow: /ca` y `Allow: /como-funciona/reputacion`, y `Disallow: /` al final (mismo patrón que `User-agent: *` pero con acceso a las páginas públicas) — corrige la señal rota y habilita AI crawlers en las URLs públicas

**Acceptance Criteria:**

- Given SSR render de `/como-funciona/reputacion`, when el crawler descarga el HTML, then el `<title>` es "Tu reputación en Regálalo — Sistema de puntos" (no la clave i18n cruda)
- Given SSR render de `/como-funciona/reputacion`, when Google valida el JSON-LD FAQPage, then las 3 preguntas y respuestas contienen texto real en español
- Given cualquier petición HTTP a regalalo.org, when el cliente recibe la respuesta, then los headers `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` y `Permissions-Policy` están presentes, y el header HSTS incluye `includeSubDomains`
- Given un AI bot descarga `GET /robots.txt`, when parsea las reglas, then los `Allow` no contienen `$` y existen bloques explícitos para `GPTBot`, `PerplexityBot` y `ClaudeBot`
- Given el crawler lee el JSON-LD WebSite en la landing, when inspecciona el schema, then incluye `potentialAction` de tipo `SearchAction`
- Given el crawler lee el JSON-LD SoftwareApplication, when inspecciona el schema, then incluye `featureList`, `softwareVersion` y `screenshot`
- Given el HTML de `/como-funciona/reputacion`, when se inspeccionan las meta tags, then existen `<link rel="alternate" hreflang="ca">` y `<link rel="alternate" hreflang="en">` con sus URLs correctas
- Given el build de Angular con prerender, when se genera `dist/regalalo/browser/`, then existen los archivos `ca/como-funciona/reputacion/index.html` y `en/como-funciona/reputacion/index.html`
- Given el prerender de `/ca/como-funciona/reputacion`, when se inspecciona el `<html lang>`, then el valor es `"ca"` (no `"es"`)

## Spec Change Log

- **2026-06-06 — Ampliación por instrucción humana:** El usuario aprobó el spec con la condición de que `/ca/como-funciona/reputacion` y `/en/como-funciona/reputacion` estén prerenderizadas. Investigación confirmó que estas rutas no existen en el router ni en `app.routes.server.ts`. Se añadieron 4 tareas nuevas (routes, componente, prerender, sitemap) y 2 ACs nuevos. La restricción original "Never: No modificar la lógica de prerender" del bloque frozen queda supersedida por esta instrucción explícita del humano.

## Design Notes

**hreflang en ReputationSeoService:** El método `setHreflang(url)` recibe la URL canónica ES (`https://regalalo.org/como-funciona/reputacion`). Las variantes CA/EN se construyen por sustitución de prefijo. Si en el futuro la URL canónica cambia, este replace frágil deberá ser reemplazado por un lookup de rutas.

**potentialAction / SearchAction:** El `urlTemplate` apunta a `/explorar?q=`. Si la búsqueda por query string no está implementada en backend, el schema sigue siendo válido para Google (señal de que el sitio tiene capacidad de búsqueda). No causa penalización.

**AI bots en robots.txt:** GPTBot (OpenAI), PerplexityBot y ClaudeBot tienen `User-agent` propio reconocido. Se les permite el mismo conjunto de URLs públicas que al `User-agent: *`. El bloque `Disallow: /` al final de cada grupo actúa como catch-all por si añadimos rutas nuevas.

## Verification

**Commands:**
- `npm run build` -- expected: 0 errores de compilación TypeScript/Angular
- Inspeccionar `dist/regalalo/browser/como-funciona/reputacion/index.html` — expected: `<title>` con texto real, JSON-LD con preguntas en texto, `hreflang="ca"` y `hreflang="en"` presentes

## Suggested Review Order

**Locale-aware SSR prerender — rutas CA/EN de reputación**

- Punto de entrada: locale se activa desde `route.data` antes de aplicar SEO
  [`reputation-guide.component.ts:79`](../../src/app/features/reputation/reputation-guide.component.ts#L79)

- `selectTranslation` garantiza que las traducciones estén cargadas antes del SEO en SSR
  [`reputation-guide.component.ts:84`](../../src/app/features/reputation/reputation-guide.component.ts#L84)

- Rutas CA y EN con `data.locale` habilitan la activación de locale
  [`app.routes.ts:62`](../../src/app/app.routes.ts#L62)

- Entradas de prerender registran las dos variantes para el build
  [`app.routes.server.ts:8`](../../src/app/app.routes.server.ts#L8)

- Hreflang extendido a CA y EN por sustitución de prefijo de URL
  [`reputation-seo.service.ts:53`](../../src/app/core/seo/reputation-seo.service.ts#L53)

- Variantes CA/EN añadidas al sitemap XML dinámico
  [`server.ts:95`](../../src/server.ts#L95)

**Enriquecimiento de schemas (landing)**

- `potentialAction` / `SearchAction` añadido al schema `WebSite`
  [`landing-seo.service.ts:157`](../../src/app/core/seo/landing-seo.service.ts#L157)

- `featureList`, `softwareVersion`, `screenshot` añadidos al schema `SoftwareApplication`
  [`landing-seo.service.ts:215`](../../src/app/core/seo/landing-seo.service.ts#L215)

**Security headers (Vercel)**

- 5 headers aplicados a todas las rutas vía sección `headers` de Vercel
  [`vercel.json:16`](../../vercel.json#L16)

**Acceso AI crawlers (robots.txt)**

- Bloques explícitos para GPTBot, PerplexityBot, ClaudeBot sin dollar-anchor
  [`robots.txt:4`](../../public/robots.txt#L4)

**Contenido i18n (títulos, descripciones, FAQ)**

- ES: título y descripción actualizados a texto exacto del GEO report
  [`es.json:1467`](../../public/i18n/es.json#L1467)

- CA: título y descripción actualizados; FAQ sin "Regalalo" sin tilde
  [`ca.json:1463`](../../public/i18n/ca.json#L1463)

- EN: título y descripción actualizados; FAQ sin "Regalalo" sin tilde
  [`en.json:1467`](../../public/i18n/en.json#L1467)
