---
ticket: cc-2026-06-01-reputacion-publica
status: done
type: feature
migrated_from: v6
---

# Correct Course — Ruta pública `/como-funciona/reputacion`



**ID:** `cc-2026-06-01-reputacion-publica`  

**Estado:** in-progress  

**Scope:** Minor  

**Origen:** [sprint-change-proposal-2026-06-01-reputacion-publica.md](../initiative-regalalo/sprint-change-proposal-2026-06-01-reputacion-publica.md) (aprobado 2026-06-01)



## Objetivo



Exponer la guía de reputación en una URL pública indexable (`/como-funciona/reputacion`) con navegación de landing, sin romper `/reputacion` para usuarios autenticados.



## Tasks/Subtasks



- [x] `public/i18n/*.json` — `landing.footer.link_reputation`

- [x] `reputation-guide.component.ts` / `.html` — `publicMode` + nav bifurcada

- [x] `app.routes.ts` — ruta `como-funciona/reputacion` con `data: { publicMode: true }`

- [x] `app.routes.server.ts` — `RenderMode.Prerender`

- [x] `seo.constants.ts` — `LANDING_PATHS`

- [x] `public/robots.txt` — `Allow`

- [x] `src/server.ts` — sitemap con `lastmod` y prioridad 0.7

- [x] `landing.component.html` — enlace footer a URL canónica pública



## Criterios de aceptación



- [x] `GET /como-funciona/reputacion` renderiza el contenido de reputación con nav de landing (logo → `/`, selector idioma, login/register)

- [x] `GET /reputacion` no sufre regresión — sigue mostrando nav app con links autenticados

- [x] La nueva ruta renderiza HTML prerenderizado (build: 4 rutas prerenderizadas incl. `como-funciona/reputacion`)

- [x] `server.ts` sitemap incluye `<loc>…/como-funciona/reputacion</loc>` con `<lastmod>`

- [x] `robots.txt` permite crawl de `/como-funciona/reputacion`

- [x] Footer de la landing incluye link a `/como-funciona/reputacion` en los 3 idiomas

- [x] `withComponentInputBinding()` no está activo — `publicMode` vía `ActivatedRoute.snapshot.data` + `input()` para tests

- [ ] Verificación AXE manual en producción/preview (no automatizada en esta story)

### Review Findings

- [x] [Review][Decision] Política de indexación para `/reputacion` — Resuelto: añadir `Disallow: /reputacion` en `robots.txt` (refuerza URL canónica `/como-funciona/reputacion`).

- [x] [Review][Patch] `Disallow: /reputacion` en `robots.txt` — [`public/robots.txt`](public/robots.txt)

- [x] [Review][Patch] `publicMode` no reacciona al cambiar de ruta — [`reputation-guide.component.ts`](src/app/features/reputation/reputation-guide.component.ts): `toSignal(route.data)`.

- [x] [Review][Patch] Falta test de regresión navegación entre rutas de reputación — [`app.routes.spec.ts`](src/app/app.routes.spec.ts).

- [x] [Review][Patch] `aria-label` hardcodeado en nav pública — `landing.nav.aria_label` en i18n + [`landing-nav.component.html`](src/app/shared/components/landing-nav/landing-nav.component.html).

- [x] [Review][Patch] Menú móvil de `LandingNavComponent` sin cierre por Escape/clic fuera — listeners en host + spec Escape.

- [x] [Review][Defer] Meta title/description/canonical específicos de reputación — [`reputation-guide.component.ts`](src/app/features/reputation/reputation-guide.component.ts) no aplica SEO de página; el prerender puede servir título genérico «Regálalo». Fuera del alcance explícito de esta CC; encaja en épica 11-f1.

- [x] [Review][Defer] AC «Verificación AXE manual» pendiente — Queda como checklist manual en preview/producción según el spec.



## Dev Agent Record



### Implementation Plan



- `publicMode` como `computed` desde `route.data['publicMode']` (sin `withComponentInputBinding` en `app.config.ts`).

- Nav pública reutiliza `app-landing-nav` (mismo header que la landing); util `scroll-to-how-it-works`.

- Sitemap refactorizado a array `sitemapEntries` con `lastmod` para coordinar con épica 11-f.



### Completion Notes



- Ruta pública indexable añadida sin duplicar contenido del componente.

- Tests: `reputation-guide.component.spec`, `app.routes.spec`, `seo.service.spec`.

- `ng build` OK; prerender de 4 rutas estáticas.



## File List



- `public/i18n/es.json`

- `public/i18n/ca.json`

- `public/i18n/en.json`

- `public/robots.txt`

- `src/app/features/reputation/reputation-guide.component.ts`

- `src/app/features/reputation/reputation-guide.component.html`

- `src/app/shared/components/landing-nav/landing-nav.component.ts`
- `src/app/shared/components/landing-nav/landing-nav.component.html`
- `src/app/shared/components/landing-nav/landing-nav.component.scss`
- `src/app/shared/components/landing-nav/landing-nav.component.spec.ts`
- `src/app/shared/landing/scroll-to-how-it-works.ts`
- `src/app/shared/landing/scroll-to-how-it-works.spec.ts`
- `src/app/features/landing/landing.component.ts`
- `src/app/features/landing/landing.component.html`
- `src/app/features/landing/landing.component.scss`
- `src/app/features/reputation/reputation-guide.component.scss`

- `src/app/features/reputation/reputation-guide.component.spec.ts`

- `src/app/app.routes.ts`

- `src/app/app.routes.server.ts`

- `src/app/app.routes.spec.ts`

- `src/app/core/seo/seo.constants.ts`

- `src/app/core/seo/seo.service.spec.ts`

- `src/app/features/landing/landing.component.html`

- `src/server.ts`



## Change Log



- 2026-06-01: Ruta pública `/como-funciona/reputacion` con nav landing, SEO (robots, sitemap, LANDING_PATHS) y enlace en footer de landing.
- 2026-06-01: Refactor — header extraído a `LandingNavComponent` compartido (landing + reputación pública).



## Notas



- Verificar `withComponentInputBinding()` en `app.config.ts` antes de enlazar `publicMode`.

- Diseño nav pública: `docs/project/Landing Page.html`.

- No tocar API ni guards.

