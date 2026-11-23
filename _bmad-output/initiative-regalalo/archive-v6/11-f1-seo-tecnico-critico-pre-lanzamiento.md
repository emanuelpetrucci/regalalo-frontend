# Story 11-f.1: SEO técnico crítico pre-lanzamiento

Status: review

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed. Épica 11-f SEO/GEO Optimization — consolida ex 11-f1 (og:image PNG), ex 11-f2 (html lang SSR dinámico) y ex 11-f3 (sitemap lastmod). IMPORTANTE: el sitemap ya está implementado (server.ts actualizado por cc-reputacion-publica). -->

## Story

Como equipo de producto,
quiero corregir los tres bugs SEO críticos que bloquean la indexación y las previsualizaciones sociales,
para que regalalo.org sea indexado correctamente y los links compartidos muestren imagen de previsualización antes del lanzamiento.

**FR:** NFR-F13 (Cumplimiento de diseño y SEO) · **Épica:** 11-f (SEO/GEO Optimization)
**Referencia:** `_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-01-seo-geo.md` (§4.1, 4.2, 4.3) + enmienda `sprint-change-proposal-2026-06-01-seo-geo-amendment-reduccion-stories.md` (§4.2)

## Acceptance Criteria

### AC 1: `<html lang>` dinámico en páginas prerenderizadas

**Given** la ruta prerenderizada `/en`
**When** el navegador/crawler descarga el HTML
**Then** el atributo `lang` del elemento `<html>` es `"en"`

**Given** la ruta prerenderizada `/ca`
**When** el navegador/crawler descarga el HTML
**Then** el atributo `lang` del elemento `<html>` es `"ca"`

**Given** la ruta prerenderizada `/`
**When** el navegador/crawler descarga el HTML
**Then** el atributo `lang` del elemento `<html>` es `"es"`

### AC 2: og:image referencia PNG con dimensiones OG

**Given** cualquier ruta con metadatos OG (landing `/`, `/en`, `/ca`)
**When** el crawler lee las meta tags `<head>`
**Then** `og:image` referencia `/og-image.png` (no `.svg`)
**And** `og:image:width` = `1200`
**And** `og:image:height` = `630`
**And** `og:image:type` = `image/png`

### AC 3: Sitemap con `<lastmod>` y array extensible

**Given** `GET /sitemap.xml`
**When** el crawler descarga el sitemap
**Then** cada `<url>` contiene `<lastmod>` con fecha ISO (YYYY-MM-DD)
**And** el código usa un array `sitemapEntries` tipado para facilitar añadir entradas futuras

> **⚠️ NOTA DEV:** El AC 3 ya está completamente implementado en `src/server.ts` desde el commit de cc-reputacion-publica (2026-06-01). El dev agent **NO debe modificar** `src/server.ts`. Verificar únicamente que el comportamiento es correcto.

### AC 4: Prerequisito externo — asset og-image.png

**Given** el asset `public/og-image.png` con dimensiones 1200×630 px
**When** se despliega la aplicación
**Then** la URL `/og-image.png` devuelve la imagen correcta

> **⚠️ NOTA DEV:** El asset PNG es un prerequisito externo (diseño). El dev agent debe implementar todos los cambios de código apuntando a `/og-image.png`. Si el asset aún no existe, crear un placeholder temporal (`public/og-image.png`) usando el SVG existente convertido o un PNG de color sólido de marca (#3A7358), documentado como TODO. **No bloquear la story por el asset.**

### AC 5: Sin regresión

**Given** los cambios implementados
**When** se carga la landing en cualquier locale
**Then** `meta title`, `canonical`, `hreflang`, Organization JSON-LD y FAQPage JSON-LD existen sin cambio
**And** no hay errores AXE en la landing

## Tasks / Subtasks

### A. `<html lang>` dinámico en SSR (AC: 1) — `landing-seo.service.ts`

- [x] En `apply(locale: AppLocale)`, añadir al inicio del método (antes de `this.title.setTitle`):
  ```ts
  this.document.documentElement.lang = locale === 'ca' ? 'ca' : locale === 'en' ? 'en' : 'es';
  ```
  - `this.document` ya está inyectado (línea 22 del archivo actual)
  - El atributo `lang` se escribe en el DOM antes del render SSR → Angular lo serializa en el HTML prerenderizado

### B. og:image: cambiar ruta a PNG y añadir dimensiones (AC: 2)

- [x] **`src/environments/environment.ts`** (línea 10):
  ```diff
  - ogImagePath: '/og-image.svg',
  + ogImagePath: '/og-image.png',
  ```

- [x] **`src/environments/environment.production.ts`** (línea 12):
  ```diff
  - ogImagePath: '/og-image.svg',
  + ogImagePath: '/og-image.png',
  ```

- [x] **`src/environments/environment.development.ts`** (línea 12):
  ```diff
  - ogImagePath: '/og-image.svg',
  + ogImagePath: '/og-image.png',
  ```

- [x] **`scripts/generate-vercel-environment.mjs`** — actualizar los objetos `DEVELOPMENT` y `PRODUCTION` (líneas 20 y 30):
  ```diff
  - ogImagePath: '/og-image.svg',
  + ogImagePath: '/og-image.png',
  ```
  (Cambiar en ambos objetos del script)

- [x] **`src/app/core/seo/landing-seo.service.ts`** — en `setOpenGraph()`, añadir tras `{ property: 'og:image', content: imageUrl }`:
  ```ts
  { property: 'og:image:width',  content: '1200' },
  { property: 'og:image:height', content: '630'  },
  { property: 'og:image:type',   content: 'image/png' },
  ```

### C. Asset og-image.png (AC: 4)

- [x] Verificar si `public/og-image.png` existe. Si NO existe:
  - Crear placeholder temporal de 1200×630 px (color sólido `#3A7358` o conversión del SVG existente)
  - Anotar en Dev Agent Record que el asset final debe ser proporcionado por diseño
  - El código de los environments ya apunta al PNG; el placeholder evita 404 en preview

### D. Verificar sitemap (AC: 3) — **SOLO LECTURA, sin cambios**

- [x] Leer `src/server.ts` y confirmar que:
  - Existe array `sitemapEntries` tipado con `path`, `priority`, `changefreq`
  - Incluye `{ path: '/como-funciona/reputacion', priority: '0.7', changefreq: 'monthly' }`
  - Cada URL del sitemap incluye `<lastmod>`
  - **No modificar** el archivo — el AC ya está cumplido

### E. Verificar sin regresión (AC: 5)

- [x] Confirmar que `setOpenGraph()` sigue incluyendo `og:type`, `og:title`, `og:description`, `og:url`, `og:locale`, `og:site_name`, `og:image:alt`, `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- [x] Confirmar que `setStructuredData()` sigue generando `WebSite`, `Organization`, `FAQPage` y `WebPage` JSON-LD
- [x] Confirmar que `setHreflang()` no ha sido modificado

## Dev Notes

### Estado actual del código (análisis pre-implementación)

| Archivo | Estado actual | Acción |
|---|---|---|
| `src/server.ts` | ✅ DONE — sitemap extensible + lastmod + `/como-funciona/reputacion` ya implementado | Solo verificar |
| `src/environments/environment.ts` | ❌ `ogImagePath: '/og-image.svg'` | Cambiar a `.png` |
| `src/environments/environment.production.ts` | ❌ `ogImagePath: '/og-image.svg'` | Cambiar a `.png` |
| `src/environments/environment.development.ts` | ❌ `ogImagePath: '/og-image.svg'` | Cambiar a `.png` |
| `scripts/generate-vercel-environment.mjs` | ❌ Dos objetos DEVELOPMENT+PRODUCTION con `.svg` | Cambiar a `.png` en ambos |
| `src/app/core/seo/landing-seo.service.ts` | ❌ Falta `lang` dinámico en `apply()` y dimensiones OG en `setOpenGraph()` | Añadir 4 líneas |
| `public/og-image.svg` | Existe | Mantener |
| `public/og-image.png` | ❌ No existe | Crear placeholder o esperar asset de diseño |

### `landing-seo.service.ts` — estructura actual (no modificar sin leer primero)

- `apply(locale: AppLocale)`: punto de entrada principal — añadir `lang` aquí
- `ogImageUrl()`: usa `environment.ogImagePath` + `absoluteSiteUrl()` — correcto, sin cambio
- `setOpenGraph(pageTitle, description, url, locale)`: añadir 3 tags de dimensiones tras `og:image`
- `setStructuredData()`: genera 4 JSON-LD (WebSite, Organization, FAQPage, WebPage) — **no tocar**
- `buildFaq()`: 3 preguntas — **no tocar** (las preguntas q4-q8 son story 11-f2)
- `DOCUMENT` inyectado como `this.document` (línea 22) — `this.document.documentElement.lang` ya disponible

### `generate-vercel-environment.mjs` — patrón crítico

El script tiene dos objetos hardcodeados que replican `environment.development.ts` y `environment.production.ts`. Los cambios en los `.ts` no se propagan automáticamente al script. **Ambos objetos en el script deben actualizarse** cuando se cambia `ogImagePath` en los environments.

El archivo generado (`environment.vercel.generated.ts`) dice "no editar a mano" — no modificarlo directamente.

### SSR + Angular prerenderizado

Angular SSR prerenderiza las rutas configuradas en `app.config.server.ts` con `RenderMode.Prerender`. El atributo `lang` se serializa en el HTML si se asigna a `document.documentElement.lang` antes del render. `LandingSeoService.apply()` se llama desde el componente landing en `ngOnInit` o similar — el orden es correcto para SSR.

### Prerequisito externo: asset PNG

- `public/og-image.svg` existe — es el actual (inválido para OG social)
- `public/og-image.png` no existe — prerequisito de diseño
- Si el asset de diseño no está disponible, crear PNG temporal:
  - Opción A: canvas de 1200×630 px, color #3A7358, texto "Regálalo" centrado
  - Opción B: herramienta CLI (`sharp`, `imagemagick`, `ffmpeg`) si disponible
  - El código funciona con cualquier PNG válido de 1200×630 px en esa ruta

### Qué NO implementar en esta story

- FAQ ampliada (q4–q8) → story 11-f2
- Organization schema `areaServed`/`foundingLocation` → story 11-f2
- SoftwareApplication schema → story 11-f2
- `theme-color` y preconnect en `index.html` → story 11-f2
- `/sitemap.xml` handler → ya implementado, no tocar

### Project Structure Notes

- Los 4 environments están en `src/environments/`; el script en `scripts/`
- `LandingSeoService` vive en `src/app/core/seo/`; es singleton (`providedIn: 'root'`)
- No se crean nuevos archivos Angular en esta story (solo ediciones a files existentes)

### References

- Proposal original: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-01-seo-geo.md` §4.1–4.3
- Enmienda: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-01-seo-geo-amendment-reduccion-stories.md` §4.2
- `src/app/core/seo/landing-seo.service.ts` — archivo principal a modificar
- `src/environments/environment*.ts` — 3 files con `ogImagePath`
- `scripts/generate-vercel-environment.mjs` — script con DEVELOPMENT y PRODUCTION hardcoded
- `src/server.ts` — sitemap ya implementado (solo verificar)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

(sin incidencias)

### Completion Notes List

- **AC1**: Añadido `this.document.documentElement.lang = locale === 'ca' ? 'ca' : locale === 'en' ? 'en' : 'es';` al inicio de `apply()` en `LandingSeoService`. El atributo `lang` se asigna antes de cualquier otro setter, lo que garantiza que Angular SSR lo serializa en el HTML prerenderizado.
- **AC2**: Cambiado `ogImagePath` de `/og-image.svg` a `/og-image.png` en los 3 environments TypeScript y en los dos objetos DEVELOPMENT/PRODUCTION de `scripts/generate-vercel-environment.mjs`. Añadidos los tres tags `og:image:width` (1200), `og:image:height` (630), `og:image:type` (image/png) tras `og:image` en `setOpenGraph()`.
- **AC3**: Verificado `src/server.ts` — `sitemapEntries` tipado con `path`/`priority`/`changefreq`, incluye `/como-funciona/reputacion`, cada `<url>` contiene `<lastmod>`. Sin cambios al archivo.
- **AC4**: `public/og-image.png` no existía. Creado placeholder temporal de 1200×630 px (color sólido #3A7358) con Node.js zlib puro. TODO: reemplazar con asset final de diseño antes del lanzamiento.
- **AC5**: `setOpenGraph()` mantiene todos los tags previos (og:type, og:title, og:description, og:url, og:locale, og:site_name, og:image:alt, twitter:*). `setStructuredData()` y `setHreflang()` no modificados. Tests: 12/12 pass (5 existentes + 7 nuevos). Los 8 fallos del suite general son pre-existentes en features no relacionadas.

### File List

- `src/app/core/seo/landing-seo.service.ts` (modificado)
- `src/app/core/seo/landing-seo.service.spec.ts` (modificado — tests AC1 y AC2 añadidos)
- `src/environments/environment.ts` (modificado)
- `src/environments/environment.production.ts` (modificado)
- `src/environments/environment.development.ts` (modificado)
- `scripts/generate-vercel-environment.mjs` (modificado)
- `public/og-image.png` (nuevo — placeholder temporal 1200×630 #3A7358)

## Change Log

- **2026-06-01** (claude-sonnet-4-6): Implementación completa — html lang dinámico SSR (AC1), og:image a PNG con dimensiones 1200×630 (AC2), verificación sitemap (AC3), placeholder og-image.png (AC4), sin regresión en SEO tags (AC5). 7 tests nuevos añadidos (12/12 pass).
