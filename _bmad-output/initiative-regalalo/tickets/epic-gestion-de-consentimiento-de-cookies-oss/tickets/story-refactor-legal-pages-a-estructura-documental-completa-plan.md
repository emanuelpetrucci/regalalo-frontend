---
ticket: 6
status: done
type: feature
migrated_from: v6
---

# Story 9.6: Refactor legal pages a estructura documental completa

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed - comprehensive developer guide created. -->

## Story

Como usuario,
quiero consultar políticas de privacidad y cookies completas y estructuradas,
para entender de forma transparente el tratamiento de datos y preferencias.

**FR:** FR-F41 · **NFR:** NFR-F16 · **Épica:** 9 (remediación Correct Course 2026-05-28)

## Acceptance Criteria

1. **Estructura documental completa en ambas rutas**
   - **Given** las rutas `/politica-privacidad` y `/politica-cookies`
   - **When** cargo cualquiera de las dos páginas
   - **Then** la UI reproduce la estructura documental completa del HTML de referencia correspondiente:
     - header legal (`doc-eyebrow`, `doc-title`, `doc-meta` con fechas de vigencia/actualización)
     - `info-box` introductorio
     - índice de contenidos (`nav.toc` con lista numerada y anchors)
     - secciones numeradas (`section-num` + `section-title`) con todos los bloques del handoff
     - tablas (`data-table`), cajas de contacto (`contact-box`), grids de derechos (`rights-grid`), tarjetas de cookies (`cookie-card`), vista previa de banner (`banner-preview`) y tabla de toggles (`toggle-table`) donde aplique por página

2. **Fidelidad visual pixel-perfect respecto al handoff**
   - **Given** `legal-pages.component.html` y `legal-pages.component.scss`
   - **When** se compara con `docs/project/Política de privacidad.html` y `docs/project/Política de cookies.html`
   - **Then** la maquetación coincide en layout de una sola columna (`page-wrap` ~760px), tipografía (Playfair + DM Sans + JetBrains Mono en numeración), espaciado, jerarquía, bordes, sombras y responsive
   - **And** no se usa el layout actual de dos columnas con TOC lateral sticky (es una desviación conocida a corregir)

3. **Footer legal y acceso persistente a cookies sin regresión**
   - **Given** el footer compartido `app-site-footer`
   - **When** navego por las páginas legales
   - **Then** se mantiene un único footer existente, enlaces legales operativos y la acción persistente de reabrir preferencias de cookies (`CookieConsentService.openPreferences()`)

4. **Contenido visible vía i18n (español completo en esta historia)**
   - **Given** las claves `legal.*` en Transloco
   - **When** renderizo las páginas en `es`
   - **Then** cada bloque estructural muestra texto procedente de i18n (sin hardcode en plantilla)
   - **And** `public/i18n/es.json` incluye el árbol de claves necesario para todas las secciones/tablas/bloques del handoff en español
   - **Note:** la paridad completa `ca`/`en` y la alineación copy↔`CookieConsentService` son alcance de la historia **9-7** (no bloquear 9-6 por ello, pero sí dejar claves simétricas listas para traducción)

5. **Pruebas de paridad estructural mínima**
   - **Given** `legal-pages.component.spec.ts`
   - **When** ejecuto los tests de la historia
   - **Then** verifican presencia de anchors/secciones obligatorias por página, ausencia del grid lateral de TOC, footer único y control persistente de cookies
   - **And** no introducen dependencia de copy literal largo (contrato estructural, no texto jurídico completo en expect)

## Tasks / Subtasks

- [x] Replantear layout y shell del documento (AC: 1, 2)
  - [x] Sustituir `.doc-shell` + `.doc-grid` (2 columnas) por `.page-wrap` de una columna según handoff
  - [x] Añadir `doc-meta` (última actualización + vigente desde) con iconos SVG inline o componente mínimo reutilizable
  - [x] Añadir `info-box` bajo el header en ambas páginas

- [x] Implementar TOC numerado con anchors completos (AC: 1)
  - [x] Privacidad: `#responsable`, `#datos`, `#finalidad`, `#conservacion`, `#destinatarios`, `#derechos`, `#menores`, `#cambios`, `#contacto`
  - [x] Cookies: `#que-son`, `#tipos`, `#tabla`, `#consentimiento`, `#gestion`, `#terceros`, `#cambios`, `#contacto`
  - [x] Usar `<nav class="toc" aria-label="...">` + `<ol>` con contador CSS como en el prototipo

- [x] Portar todas las secciones de privacidad (AC: 1, 2)
  - [x] `contact-box` en responsable y contacto
  - [x] `data-table` en datos, finalidad, conservación, destinatarios
  - [x] `rights-grid` + `right-card` en derechos
  - [x] Párrafos y `h3` intermedios según handoff

- [x] Portar todas las secciones de cookies (AC: 1, 2)
  - [x] `cookie-types` / `cookie-card` en tipos (3 tarjetas: técnica, analítica, preferencias)
  - [x] `data-table` en tabla de cookies y navegadores
  - [x] `banner-preview` estático (solo ilustración documental, sin wiring al CMP real)
  - [x] `toggle-table` estático en gestión (ilustración; toggles reales siguen en el panel OSS)

- [x] Reescribir estilos SCSS desde el handoff (AC: 2)
  - [x] Mapear tokens del HTML (`--primary`, `--fg-mid`, etc.) a variables existentes en `docs/project/colors_and_type.css` / `src/styles/tokens` (`--color-primary-500`, `--color-neutral-*`, `--color-accent-*`, etc.)
  - [x] Incluir: `section-header`, `section-num`, `data-table`, `contact-box`, `rights-grid`, `cookie-card`, `banner-preview`, `toggle-table`, `scroll-margin-top` en secciones
  - [x] Fondo de página `--color-neutral-50`; superficies blancas en TOC/tablas

- [x] Extender i18n ES con árbol estructural completo (AC: 4)
  - [x] Reorganizar `legal.privacy` y `legal.cookies` bajo claves por sección (`meta`, `info`, `toc.*`, `sections.<id>.*`, tablas como arrays de filas)
  - [x] Volcar texto español del handoff (fuente: HTML de `docs/project/`)
  - [x] Mantener `legal.common.eyebrow` y renombrar `contents` → etiqueta «Contenidos» si el prototipo lo exige

- [x] Ampliar tests estructurales (AC: 3, 5)
  - [x] Assert de sección IDs y clases clave por `pageType`
  - [x] Assert de que no existe `.doc-grid` / TOC lateral
  - [x] Conservar tests de footer único + `openPreferences`

- [x] Verificación manual rápida (AC: 2)
  - [x] Comparar side-by-side con `docs/project/Política de privacidad.html` y `Política de cookies.html` en viewport desktop y móvil

## Dev Notes

### Contexto y motivo del cambio

- La implementación actual (`legal-pages.component.*`) es un **resumen de 3 secciones** con layout **incorrecto** (TOC en sidebar). El Correct Course 2026-05-28 documenta la brecha frente a `docs/project/*` y FR-F41 reforzado.
- **9-6 = estructura + maquetación + claves i18n ES.** **9-7 = contenido legal completo ca/en + trazabilidad con `CookieConsentService`.** **9-5** (reabierta) validará QA integral al cerrar 9-6/9-7.
- No tocar lógica de consentimiento (`CookieConsentService`, gating SEO, banner OSS) salvo mantener el botón del footer.

### Estado actual del código (UPDATE — leer antes de editar)

| Archivo | Estado hoy | Qué cambia en 9-6 |
|---------|------------|-------------------|
| `legal-pages.component.html` | 3 secciones, grid 2 cols, sin `doc-meta`/`info-box`/tablas | Reescritura completa de plantilla según handoff |
| `legal-pages.component.scss` | Estilos genéricos de cards/grid | Portar estilos del handoff con tokens del proyecto |
| `legal-pages.component.ts` | Solo `pageType` computed | Opcional: arrays de secciones/TOC para reducir duplicación en plantilla |
| `legal-pages.component.spec.ts` | 2 tests (eyebrow i18n + footer) | Ampliar contrato estructural |
| `public/i18n/es.json` | `legal.*` resumido (3 secciones) | Árbol completo en español |
| `site-footer.component.*` | Footer compartido OK | **No modificar** salvo bug bloqueante |
| `app.routes.ts` | Rutas ya definidas | Sin cambios esperados |

### Mapa de secciones (fuente de verdad)

**Privacidad** (`docs/project/Política de privacidad.html`):

| # | Anchor | Bloques especiales |
|---|--------|-------------------|
| 01 | `#responsable` | `contact-box` (3 filas) |
| 02 | `#datos` | `data-table` 6 filas + `h3` «Datos que no recogemos» |
| 03 | `#finalidad` | `data-table` 6 filas |
| 04 | `#conservacion` | `data-table` 5 filas |
| 05 | `#destinatarios` | `data-table` 2 filas |
| 06 | `#derechos` | `rights-grid` 6 tarjetas + enlace AEPD |
| 07 | `#menores` | párrafos |
| 08 | `#cambios` | párrafos |
| 09 | `#contacto` | `contact-box` |

**Cookies** (`docs/project/Política de cookies.html`):

| # | Anchor | Bloques especiales |
|---|--------|-------------------|
| 01 | `#que-son` | párrafos (localStorage) |
| 02 | `#tipos` | 3× `cookie-card` |
| 03 | `#tabla` | `data-table` 5 cookies |
| 04 | `#consentimiento` | `banner-preview` estático |
| 05 | `#gestion` | `toggle-table` + `data-table` navegadores |
| 06 | `#terceros` | párrafos |
| 07 | `#cambios` | párrafos |
| 08 | `#contacto` | `contact-box` + enlace a privacidad |

### Requisitos técnicos obligatorios

- `docs/architecture.md` — regla `[Cookies][Legal Pages]`: estructura documental mínima obligatoria en rutas legales, fidelidad pixel-perfect.
- `_bmad-output/project-context.md` — prohibido rediseñar footer; fuente UI exclusiva `docs/project/*` + `colors_and_type.css`.
- `AGENTS.md` — standalone, OnPush, control flow nativo (`@if`/`@for`), sin `ngClass`/`ngStyle`, accesibilidad WCAG AA.
- Nav global de las páginas legales en el handoff HTML **no** forma parte del alcance (la app usa su shell de rutas); centrar el refactor en el cuerpo documental + `app-site-footer`.

### Propuesta de estructura i18n (orientativa)

```json
"legal": {
  "common": { "eyebrow", "contents", "meta": { "updated_label", "effective_label", "updated_date", "effective_date" } },
  "privacy": {
    "title", "info_html",
    "toc": { "controller", "data", "purpose", ... },
    "sections": {
      "controller": { "title", "rows": [{ "label", "value" }] },
      "data": { "title", "intro", "table": { "headers": [], "rows": [] }, "not_collected_title", "not_collected_body" },
      ...
    }
  },
  "cookies": { ... }
}
```

- Para párrafos con `<strong>` o enlaces, preferir claves `*_html` + `Transloco` con `[innerHTML]` **solo** si el contenido es estático de i18n (sin input de usuario). Alternativa: trocear en spans con `t()` múltiple.
- Tablas: modelar filas como arrays en JSON para iterar con `@for` en plantilla.

### Guardrails anti-patrones

- **No** inventar layout de dos columnas ni sticky TOC lateral.
- **No** duplicar `app-site-footer` ni crear footer alternativo en `legal-pages`.
- **No** editar `src/app/core/api/generated/`.
- **No** cablear el `banner-preview` al CMP real (es documentación visual).
- **No** expandir `ca`/`en` con copy legal completo en 9-6 (historia 9-7); opcional: copiar estructura de claves con fallback al español vía Transloco si hace falta para no romper cambio de idioma.
- **No** hardcodear fechas en HTML; usar claves `legal.common.meta.*` (fechas del handoff: 18 mayo 2026 hasta que legal actualice).
- Mantener `scroll-margin-top` en `.doc-section` para que anchors no queden bajo nav sticky de la app.

### Inteligencia de historias previas (9-4, 9-5)

- 9-4 estableció `SiteFooterComponent` + rutas legales + `openPreferences()` — **preservar**.
- 9-5 añadió tests de no duplicación de footer y reapertura accesible — **no romper**.
- 9-5 marcó AC de paridad estructural legal como pendiente de 9-6/9-7; los tests actuales son deliberadamente ligeros en copy.

### Git reciente (patrones)

- `a7c74d2` — footer legal + páginas legales iniciales (base a refactorizar, no revertir rutas).
- `a7f8bcd` — QA cookies; ampliar specs legales en la misma línea (Vitest, TranslocoTestingModule).
- Convención: commits acotados por feature (`feat(legal): ...`).

### Testing Requirements

- Actualizar `legal-pages.component.spec.ts`:
  - Privacidad: `querySelectorAll('.doc-section')` length ≥ 9; presencia `#responsable`, `#derechos`, `.data-table`, `.rights-grid`.
  - Cookies: length ≥ 8; presencia `#tabla`, `.cookie-card`, `.banner-preview`.
  - Ambas: `expect(root.querySelector('.doc-grid')).toBeNull()`.
  - Footer: un solo `app-site-footer`, botón `openPreferences` sigue funcionando.
- Comando sugerido: `npm run test -- --watch=false --include="src/app/features/legal/legal-pages.component.spec.ts"`
- Build: `npm run build` (verificar budgets si SCSS crece).

### Fuera de alcance (historias siguientes)

- Traducciones legales completas `ca`/`en` y checklist claim↔código → **9-7**.
- Tests e2e/axe de flujo completo banner+legal → **9-5** (reapertura).
- Cambios en categorías reales de `CookieConsentService` (p. ej. `marketing` vs handoff) → **9-7**.

### References

- [Source: `_bmad-output/initiative-regalalo/archive-v6/epics.md` — Story 9-f6]
- [Source: `_bmad-output/initiative-regalalo/sprint-change-proposal-2026-05-28-legal-alignment.md`]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/9-5-qa-funcional-accesibilidad-y-evidencia-de-cumplimiento.md`]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/9-4-acceso-persistente-en-footer-legal-existente.md`]
- [Source: `docs/architecture.md` — `[Cookies][Legal Pages]`]
- [Source: `docs/project/Política de privacidad.html`]
- [Source: `docs/project/Política de cookies.html`]
- [Source: `docs/project/colors_and_type.css`]
- [Source: `_bmad-output/project-context.md`]

## Dev Agent Record

### Agent Model Used

Composer (dev-story 2026-05-28)

### Debug Log References

- create-story: primera historia en backlog detectada (`9-6-refactor-legal-pages-a-estructura-documental-completa`).
- Análisis: epics 9-f6, sprint-change-proposal legal alignment, stories 9-4/9-5, código actual `legal-pages.*`, handoff HTML completo, i18n ES resumido, architecture rule Legal Pages.

### Completion Notes List

- Historia 9.6 creada con mapa de secciones, diff explícito layout actual vs handoff, alcance acotado respecto a 9-7/9-5 y guardrails de footer/consentimiento.
- Ultimate context engine analysis completed - comprehensive developer guide created.
- Refactor completo: layout `.page-wrap` una columna, 9 secciones privacidad + 8 cookies, TOC numerado, bloques handoff (tablas, contact-box, rights-grid, cookie-card, banner-preview, toggle-table).
- i18n ES completo en `public/i18n/es.json` (texto handoff); `ca`/`en` pendientes en 9-7.
- Tests: 4/4 en `legal-pages.component.spec.ts` (contrato estructural + footer/openPreferences).
- Build: compila; chunk legal ~37 kB lazy. Fallo budget preexistente en `perfil.component.scss` (no introducido por 9-6).

### File List

- `src/app/features/legal/legal-pages.component.html`
- `src/app/features/legal/legal-pages.component.scss`
- `src/app/features/legal/legal-pages.component.ts`
- `src/app/features/legal/legal-pages.component.spec.ts`
- `src/app/features/legal/legal-pages.config.ts`
- `public/i18n/es.json`
- `scripts/patch-legal-i18n.mjs`
- `_bmad-output/initiative-regalalo/archive-v6/9-6-refactor-legal-pages-a-estructura-documental-completa.md`
- `_bmad-output/initiative-regalalo/archive-v6/sprint-status.yaml`

### Review Findings

- [x] [Review][Patch] Sección contacto cookies no usa `COOKIES_CONTACT_ROWS` — duplicación y `cookiesContactRows` muerto en TS [`legal-pages.component.html:408-437`]
- [x] [Review][Patch] `COOKIES_CONTACT_ROWS` referencia clave inexistente `related_value` (i18n solo define `related_link`) [`legal-pages.config.ts:105`]
- [x] [Review][Patch] Tests estructurales usan `>=` en lugar de conteo exacto 9/8 secciones (AC5) [`legal-pages.component.spec.ts:60,77`]
- [x] [Review][Defer] Árbol `legal.*` en `ca.json`/`en.json` sigue siendo el resumen de 3 secciones — alcance 9-7; mitigado por `fallbackLang: 'es'` — deferred, pre-existing scope split
- [x] [Review][Defer] `scripts/patch-legal-i18n.mjs` puede desincronizarse de `es.json` si se edita a mano — deferred, tooling de volcado one-shot

### Change Log

- 2026-05-28: create-story — contexto listo para dev-story.
- 2026-05-28: dev-story — implementación estructura documental legal completa (ES) + tests; estado → review.
- 2026-05-29: code-review — 3 patch, 2 defer, 3 dismissed (ruido/a11y decorativa).
- 2026-05-29: code-review patches aplicados (contacto cookies @for, routerLink en config, tests 9/8 exactos); estado → done.
