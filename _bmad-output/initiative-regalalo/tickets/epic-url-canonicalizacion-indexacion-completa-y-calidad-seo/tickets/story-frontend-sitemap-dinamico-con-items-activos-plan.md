---
title: 'Frontend — Sitemap dinámico con items activos'
type: 'feature'
ticket: 'f2'
created: '2026-10-29'
status: done
baseline_revision: 'eb97f66ea77a65a943295244cd7cd6b4ce8c1069'
route: 'full'
route_source: 'auto'
risk: 'medium'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 1
context:
  - src/server.ts
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `GET /sitemap.xml` solo lista páginas estáticas. Google no descubre los objetos activos salvo crawleando `/explorar` (FR-F57). Un solo sitemap que pagine todo el feed agota el límite global del API (60 peticiones/minuto por IP) y deja al resto del SSR en 429.

**Approach:** Partir el sitemap en trozos. `/sitemap.xml` es un índice. Las URLs estáticas van en un trozo sin API. Cada página del feed (50 ítems) va en su propio sitemap, y cada petición HTTP hace como mucho un `GET /items`.

**Decision (2026-10-29):** el cupo compartido se respeta dividiendo el sitemap, no bajando el tope de 5.000 ni aceptando el 429 del resto del SSR.

## Boundaries & Constraints

**Always:**
- Rama `feature/14-f2-sitemap-dinamico` desde `origin/develop`. Sin commit ni push.
- Misma base de sitio que `siteUrl` en `src/server.ts`. Misma base de API que `resolveBackendApiUrl` en `src/app/app.config.server.ts`. Sin `Authorization`.
- `GET /sitemap.xml` es un `sitemapindex`. Enlaza `/sitemap-static.xml` y, como mucho, `/sitemap-items-1.xml` … `/sitemap-items-100.xml` (5.000 ítems / 50). Para saber cuántos trozos hay, un solo `GET /items?page=1&limit=50` y `pagination.totalPages` (tope 100).
- `/sitemap-static.xml` repite las 7 URLs estáticas actuales y no llama al API.
- `/sitemap-items-:page.xml` pide solo esa página (`limit=50`). URL `/items/${slug}`, `priority` `0.7`, `changefreq` `daily`, `lastmod` = fecha de `createdAt`. El JSON usa la clave `items`.
- Cada respuesta HTTP hace como mucho una llamada al API. Caché en memoria por trozo, 60 minutos, también si degradó. `Cache-Control: public, max-age=3600`.
- Si el índice no puede leer el feed, 200 con el índice que solo enlaza el sitemap estático. Si un trozo de ítems falla, 200 con `urlset` vacío. Nunca 500. Página fuera de 1..100: 404 sin llamar al API.
- Omitir ítems sin `slug`. Escapar `&`, `<` y `>` en `<loc>`.
- Versión `1.5.0` en `package.json`. La nota del changelog va bajo `[Unreleased]`.

**Never:**
- Regenerar el cliente OpenAPI, rutas de ficha, meta tags ni el modal (14-f1, 14-f3, 14-f4).
- Tocar `public/robots.txt`.
- Cambiar la expresión de CSP de `apiBaseUrl` en `src/server.ts`.
- Código en `../backend`.
- Pedir varias páginas del feed dentro de una misma petición HTTP.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| INDEX | `totalPages` = 2 | El índice enlaza el sitemap estático y `sitemap-items-1` y `2`. Una sola llamada al API | N/A |
| STATIC | `GET /sitemap-static.xml` | Las 7 URLs estáticas actuales | Sin fetch |
| ITEMS_CHUNK | Página 1 con `bicicleta-montana` y `silla-2` | Solo esas dos URLs de ítem, `priority` 0.7 | N/A |
| CAP_100 | `totalPages` > 100 | El índice enlaza como mucho 100 sitemaps de ítems | No pide la página 101 |
| SKIP_EMPTY_SLUG | Un ítem con `slug` vacío en la página | Ese ítem no aparece | N/A |
| LASTMOD | `createdAt` ISO | `<lastmod>` de ese día | Fecha ilegible: omitir `<lastmod>` |
| CACHE_HIT | Segundo GET del mismo trozo antes de 60 min | Mismo cuerpo, sin nuevo fetch | N/A |
| BACKEND_DOWN | Falla el `GET /items` del índice | 200, índice que solo enlaza el sitemap estático | No 500 |
| CHUNK_DOWN | Falla el `GET /items` de un trozo | 200, `urlset` vacío | No 500 |
| PAGE_RANGE | `sitemap-items-0.xml` o `101` | 404 | Sin fetch |
| ROBOTS | `public/robots.txt` | Sigue `Sitemap: https://regalalo.org/sitemap.xml` | Sin editar el fichero |

</frozen-after-approval>

## Code Map

- `src/server.ts` — hoy `GET /sitemap.xml` arma las 7 rutas en un `urlset`. Añadir las tres rutas antes del estático de Angular. Reutilizar `siteUrl`. No reescribir la CSP.
- `src/app/app.config.server.ts` — copiar la regla de `resolveBackendApiUrl` en el módulo nuevo. No importar el config de Angular desde Express.
- `src/server/dynamic-sitemap.ts` — a crear. Índice, trozo estático y trozo de una página. `fetch` y reloj inyectables. Caché separada por clave de trozo.
- `src/app/core/api/generated/models/list-items-response.ts` — el listado es `{ items, pagination }`. No editar `generated/`.
- `backend/src/app.ts` — `globalRateLimit` 60/min por IP en toda la API. Por eso un trozo no puede encadenar páginas.
- `public/robots.txt` — ya apunta a `/sitemap.xml`, que pasa a ser el índice. No tocar.

## Tasks & Acceptance

**Execution:**
- [x] `src/server/dynamic-sitemap.ts` — índice, sitemap estático y un sitemap por página del feed, con caché de 60 min.
- [x] `src/server/dynamic-sitemap.spec.ts` — una prueba por fila de la matriz. La de robots lee `public/robots.txt` desde el directorio del proyecto, no con `import.meta.url`.
- [x] `src/server.ts` — las tres rutas delegan en ese módulo y responden `application/xml`, salvo el 404 de página fuera de rango.
- [x] `package.json` y `CHANGELOG.md` — `1.5.0` y la nota bajo `[Unreleased]`.

**Acceptance Criteria:**
- Given el feed responde con ítems, when se pide `/sitemap.xml`, then el índice enlaza el sitemap estático y un sitemap por página, y esa petición hace un solo `GET /items`.
- Given una página del feed, when se pide su sitemap, then solo incluye los `/items/{slug}` de esa página.
- Given el backend no responde, when se pide el índice, then 200 enlazando solo el sitemap estático.

## Implementation Notes

## Plan Change Log

- 2026-10-29 — El review quick marcó `intent_gap`: un solo sitemap que paginaba hasta 5.000 ítems podía gastar las 60 peticiones/minuto del API y provocar 429 en el resto del SSR. El código de esa pasada se revirtió. Decisión humana: dividir el sitemap en trozos más pequeños. Cada petición HTTP hace como mucho un `GET /items`. Se conserva el tope de 5.000, la caché de 60 minutos y la degradación sin 500.

## Review Triage Log

### 2026-10-29 quick (trozos)

- **low** — `itemsChunk` filtra con `slug.trim()` pero escribe `item.slug` sin recortar, así que un slug con espacios entra en `<loc>`. Ruta: `patch`.
- **false** — La ruta Express 5 `/sitemap-items-:page.xml` captura `page` como `1`, no como `1.xml`. `parseSitemapPage('0')` es null y `src/server.ts` responde 404. `sendSitemap` pone `application/xml` y `Cache-Control`. Lo comprobé con un servidor mínimo.
- **false** — El changelog bajo `[Unreleased]` con `package.json` en `1.5.0` es lo que pide el bloque congelado. Añadir `## [1.5.0]` lo contradiría.

### 2026-10-29 quick

- **medium** — `intent_gap` resuelto por la decisión de trozos. El código de la pasada anterior se revirtió.
- **false** — El peor caso de 100 × 5 s no aplicaba: un fallo cortaba el bucle. Ya no hay bucle de páginas dentro de una petición.
- **low** — El changelog de la pasada anterior no usaba `[Unreleased]`. Esta pasada lo pide en el bloque congelado.
- **false** — El plan de 14.f0 sigue sin trackear a propósito. No es parte de este sitemap.
- **maybe-false** — `import.meta.url` en el test de robots. Esta pasada pide leer el fichero desde el directorio del proyecto.

## Design Notes

El listado público no trae `status` ni `updatedAt`: el SQL ya filtra `active` y `lastmod` usa `createdAt`. Un trozo es una página del feed (50 ítems, una llamada). Si muchos trozos caducan a la vez y un crawler los pide en paralelo, las llamadas sí pueden sumar 60; una sola petición ya no puede.

## Verification

**Commands:**
- `npx vitest run src/server/dynamic-sitemap.spec.ts --globals` — expected: todas las filas de la matriz en verde

**Manual checks (if no CLI):**
- `public/robots.txt` sin diff.

## Code Review

### 2026-10-29 quick (post-build)

**Code review complete.** 0 `decision-needed`, 1 `patch`, 0 `defer`, 0 rejected.

- [x] [Review][Patch] staticChunk sin caché de 60 minutos [src/server/dynamic-sitemap.ts:138] — el trozo estático ahora guarda el XML en memoria con el mismo TTL que el resto de trozos.

**Rejected:** ninguno.
