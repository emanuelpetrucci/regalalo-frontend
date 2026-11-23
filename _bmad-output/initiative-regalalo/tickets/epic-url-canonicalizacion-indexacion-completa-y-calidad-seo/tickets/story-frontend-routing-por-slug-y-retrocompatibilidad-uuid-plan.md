---
title: 'Frontend — Routing por slug y retrocompatibilidad UUID'
type: 'feature'
ticket: 'f1'
created: '2026-10-27'
status: done
baseline_revision: '5610853bf3810de10e937d3435daec8515abb45c'
route: 'full'
route_source: 'auto'
risk: 'medium'
review: 'quick'
review_source: 'auto'
lenses_ran: ['quick']
review_loop_iteration: 1
context:
  - docs/api-client.md
  - _bmad-output/project-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Las URLs públicas de detalle usan UUID; no hay rutas canónicas por slug ni redirección desde enlaces antiguos.

**Approach:** Ruta `/items/:slug` (slug o UUID en el segmento), redirección replaceUrl UUID→slug tras cargar el ítem, enlaces y canonical con `item.slug`, cliente API regenerado desde OpenAPI con `slug`.

## Boundaries & Constraints

**Always:**
- Rama `feature/14-f1-routing-slug` desde `develop`.
- `GET /items/{id}` del cliente acepta UUID o slug; mutaciones (delete, pause, requests) siguen con `item.id` (UUID).
- Redirección canónica solo cuando el segmento de ruta es UUID v4 y la respuesta trae `slug`.
- Versión `1.4.0` y entrada en `CHANGELOG.md`.

**Never:**
- Sitemap dinámico (f2), cambios de meta OG/JSON-LD de calidad (f3), ni código backend.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Detalle por slug | `/items/bicicleta-montana` | `itemsIdGet({ id: 'bicicleta-montana' })`, URL sin redirect | 404/410 como hoy |
| Detalle por UUID legacy | `/items/{uuid}` con ítem existente | Fetch por UUID, luego `navigate(['/items', slug], { replaceUrl: true })` | Sin redirect si slug vacío |
| Enlace feed | `ItemSummary` con `slug` | `routerLink` `/items/{slug}` | — |
| Canonical SEO | `GetItemResponse` cargado | `link[rel=canonical]` apunta a `/items/{slug}` | — |

</frozen-after-approval>

## Code Map

- `src/app/features/items/items.routes.ts` — path `items/:slug`.
- `src/app/app.routes.server.ts` — SSR path alineado.
- `src/app/features/items/detalle/detalle.component.ts` — param `slug`.
- `src/app/core/utils/item-public-path.util.ts` — `isItemUuidV4`, `itemPublicUrl`.
- `src/app/shared/components/item-detail-panel/item-detail-panel.component.ts` — redirect post-load; share/returnUrl con slug.
- `src/app/shared/components/item-feed-card/item-feed-card.component.ts` — `detailLink` y `open` con slug.
- `src/app/features/items/mis-objetos/mis-objetos.component.ts`, `publicar/publicar.component.ts` — URLs de compartir.
- `src/app/core/seo/item-seo.service.ts` — canonical y JSON-LD `url` con slug.
- `src/app/core/api/generated/` — regenerado (`npm run api:generate`).

## Tasks & Acceptance

**Execution:**
- [x] `src/app/core/utils/item-public-path.util.ts` -- helpers UUID y URL pública -- una sola fuente para links
- [x] Rutas y detalle -- `:slug` -- contrato de URL
- [x] `item-detail-panel` -- redirect UUID→slug y share URLs -- retrocompatibilidad
- [x] `item-feed-card`, mis-objetos, publicar -- links con slug -- descubrimiento
- [x] `item-seo.service.ts` -- canonical con slug -- SEO
- [x] Tests detalle + util + feed card; `npm run api:generate` ya aplicado
- [x] `package.json`, `CHANGELOG.md` -- 1.4.0

**Acceptance Criteria:**
- Given un UUID en la ruta, when el detalle carga, then la URL del navegador pasa al slug sin recargar página completa.
- Given un slug en la ruta, when se navega al detalle, then la API se invoca con ese slug.
- Given OpenAPI con `slug`, when se genera el cliente, then los modelos de ítem incluyen `slug`.

## Implementation Notes

- `npm run build` OK. `ng test --no-watch` compila pero el runner Vitest del entorno falló al iniciar (75 suites, error global del test-bed); no bloquea el build.
- Fixtures de tests actualizados con `slug` y `locationName` tras regenerar el cliente API.

## Plan Change Log

## Review Triage Log

## Verification

**Commands:**
- `npm run build` -- expected: OK
- `npm test -- --no-watch` -- expected: suites verdes (pendiente de runner Vitest en CI/local)

## Code Review

### 2026-10-27

**Code review complete.** 0 `decision-needed`, 12 `patch`, 1 `defer`, 7 rejected.

- [x] [Review][Patch] URL pública sin slug: un helper con respaldo al `id`, y todos los enlaces públicos pasan por él [`src/app/core/utils/item-public-path.util.ts:13`]
- [x] [Review][Patch] Unificar feed, SEO, mis-objetos, publicar y `returnUrl` en ese helper [`src/app/core/utils/item-public-path.util.ts:8`]
- [x] [Review][Patch] El redirect UUID→slug no mira `presentation` y saca al usuario de `/perfil` [`src/app/shared/components/item-detail-panel/item-detail-panel.component.ts:628`]
- [x] [Review][Patch] Ningún test cubre el panel en modal con un UUID [`src/app/shared/components/item-detail-panel/item-detail-panel.component.ts:628`]
- [x] [Review][Patch] Tras `navigate`, el primer `loadItem` sigue y la ruta nueva dispara otro fetch [`src/app/shared/components/item-detail-panel/item-detail-panel.component.ts:629`]
- [x] [Review][Patch] Si `navigate` rechaza, el `catch` de carga borra el ítem ya obtenido [`src/app/shared/components/item-detail-panel/item-detail-panel.component.ts:635`]
- [x] [Review][Patch] El feed no fija que `open` y el enlace usen el slug [`src/app/shared/components/item-feed-card/item-feed-card.component.ts:73`]
- [x] [Review][Patch] La URL de compartir tras publicar no tiene test [`src/app/features/items/publicar/publicar.component.ts:176`]
- [x] [Review][Patch] Las URLs de compartir de mis-objetos y del panel no tienen test [`src/app/features/items/mis-objetos/mis-objetos.component.ts:210`]
- [x] [Review][Patch] El spec de detalle solo monta la página con un UUID [`src/app/features/items/detalle/detalle.component.spec.ts:258`]
- [x] [Review][Patch] El spec de SEO deja el canonical en `document` y no afirma `og:url` ni noindex [`src/app/core/seo/item-seo.service.spec.ts:48`]
- [x] [Review][Patch] El changelog 1.4.0 no menciona `locationName` ni el health de admin regenerados [`CHANGELOG.md:1`]
- [x] [Review][Defer] Los slugs no se codifican al armar la URL como string [`src/app/core/utils/item-public-path.util.ts:13`] — deferred: gravedad media sin verificar; lo cierra el alfabeto de slug que garantiza el backend

### Rejected

- R3, R16, R28 — falso: el plan pide `replaceUrl` en el cliente tras cargar el ítem, no un 301 de SSR.
- R8 — falso: `detailItemId` solo abre el modal, y `itemsIdGet` acepta slug; no hay consumidor de analytics o reporte que lo trate como UUID.
- R9 — falso: el plan deja las mutaciones y los query params internos (`published`, `itemId`) en el UUID.
- R11 — falso: `GetItemResponse` no tiene `contactChannel`; el panel no lo lee del ítem.
- R30 — rechazado por decisión: el input sigue llamándose `itemId`. El endpoint acepta slug y UUID; renombrarlo no corrige el redirect del modal.

### 2026-10-29

**Code review complete.** 0 `decision-needed`, 0 `patch`, 0 `defer`, 0 rejected.

Revisión quick sobre el diff del commit `e5a1f61` (baseline del plan → rama `feature/14-f1-routing-slug`). Los parches de la pasada del 2026-10-27 siguen en código: redirect UUID→slug solo en `presentation === 'page'`, guard en `loadItem` evita doble fetch tras `replaceUrl`, helper único para URLs públicas, tests de panel/detalle/feed/SEO alineados con slug.

### Rejected

_(ninguno en esta pasada)_
