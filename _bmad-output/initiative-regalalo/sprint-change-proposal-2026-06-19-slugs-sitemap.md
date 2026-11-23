# Sprint Change Proposal — URLs con Slug Limpio, Indexación Completa y Calidad SEO

**Fecha:** 2026-06-19
**Estado:** Pendiente de aprobación
**Solicitado por:** Emanuel
**Tipo de cambio:** Técnico / SEO (URL Canonicalización + Sitemap dinámico + Calidad de meta tags y structured data)

---

## 1. Resumen del Issue

### Problema
Aunque la Épica 13-f implementó infraestructura SEO sólida (meta tags, SSR, structured data, noindex para items finales, acceso público), existen dos brechas críticas que impiden la indexación efectiva de los items individuales:

1. **URLs no canónicas (UUID):** Las rutas de detalle de item usan UUIDs (`/items/550e8400-e29b-41d4-a716-446655440000`). Google puede rastrearlas pero no obtiene señal de palabras clave de la URL. Cada item pierde una de las señales de ranking más directas.
2. **Items ausentes del sitemap.xml:** El sitemap actual solo incluye páginas estáticas (`/`, `/explorar`, `/como-funciona/reputacion`). Google no puede descubrir proactivamente los items disponibles; depende únicamente del crawling del feed, que requiere que el bot pase por `/explorar` y siga los links. Esto limita la velocidad y profundidad de indexación.

La infraestructura SEO de Épica 13-f (canonical, hreflang, noindex, SSR) está operativa, pero la auditoría técnica detallada de los servicios SEO (`item-seo`, `explorar-seo`, `reputation-seo`, `landing-seo`) revela **gaps de calidad** en meta tags Open Graph y structured data que reducen la efectividad en rich results de Google y previews sociales. El cambio propuesto cubre tres frentes: slug-based URLs + sitemap dinámico + correcciones de calidad SEO.

---

## 2. Análisis de Impacto

### Impacto en Épicas

| Épica | Impacto |
|---|---|
| **Épica 13-f (SEO/Descubrimiento)** | **Extensión**: Canonical URL e item links pasan de UUID a slug. Correcciones de calidad en todos los servicios SEO. |
| **Épica 2 (Objetos)** | **Retrofit**: Todos los links a items (`RouterLink`, `router.navigate`) pasan de `item.id` a `item.slug`. |
| **Nueva Épica 14** | **Añadida**: "URL Canonicalización, Indexación Completa y Calidad SEO". Agrupa slug-based routing, sitemap dinámico, coordinación backend y correcciones de meta tags/structured data. |

### Impacto en Artefactos

| Artefacto | Cambio requerido |
|---|---|
| `docs/architecture.md` | Añadir campo `slug` a contratos `Item` y `ItemSummary`. Actualizar tabla de rutas. Añadir sección "Slug Resolution". |
| `epics.md` | Añadir Épica 14 con FRs y stories nuevas. Añadir retrofit note en Épicas 2 y 13-f. |
| `src/app/features/items/items.routes.ts` | Ruta `/items/:slug` (reconoce tanto slug limpio como UUID para retrocompatibilidad) |
| `src/app/core/seo/item-seo.service.ts` | URL con slug; `og:image:width/height/alt`; `twitter:image:alt`; `Product @id`; `offers.seller`; todas las imágenes; truncado limpio |
| `src/app/core/seo/explorar-seo.service.ts` | Añadir `og:image` con imagen por defecto del sitio; `og:image:*` tags |
| `src/app/core/seo/reputation-seo.service.ts` | Añadir `og:image`; corregir `og:type` → `'website'`; añadir `robots` meta tag explícito |
| `src/app/core/seo/landing-seo.service.ts` | Logo Organization: SVG → PNG; añadir `@id` en WebSite y Organization; `twitter:site` |
| `src/app/core/api/generated/` | Regenerar tras update de OpenAPI (campo `slug` en `GetItemResponse`, `ItemSummary`) |
| `src/server.ts` | Sitemap dinámico: fetch de items activos + inclusión de URLs slug |
| `public/robots.txt` | Sin cambio (ya cubre `/items/` que incluye slugs) |

### Impacto Técnico: Dependencia de Backend

> **BLOQUEANTE:** El slug limpio sin UUID requiere que el backend genere y persista slugs únicos. Sin este campo en la API, el frontend no puede garantizar unicidad ni resolución.

El backend debe:
1. Añadir campo `slug` (string, único, indexado) al modelo `Item`
2. Generar slug al crear item: normalizar título (minúsculas, tildes → ASCII, hyphens, máx. 60 chars) + sufijo de desambiguación si colisión (ej. `bicicleta-montana`, `bicicleta-montana-2`)
3. Retornar `slug` en todos los endpoints de items: `GET /items`, `GET /items/:id`, `GET /users/me/items`
4. Soportar `GET /items/:slug` para lookup por slug directo (además del UUID existente)

---

## 3. Enfoque Recomendado: Direct Adjustment + Coordinación Backend

### Justificación
El slug limpio sin UUID es la opción óptima para SEO (máxima señal de palabras clave, URLs legibles y compartibles) y justifica la dependencia de backend. La alternativa de incluir UUID parcial (`bicicleta-montana-a1b2c3d4`) puede implementarse en frontend puro pero sacrifica la limpieza de URL y la señal semántica.

### Estrategia de implementación
1. **Backend primero:** Coordinación con equipo backend para añadir campo `slug` y soporte `GET /items/:slug`
2. **Frontend + Retrocompatibilidad:** El `DetalleComponent` detecta si el parámetro de ruta es UUID (regex) y redirige al slug canonical con 302. URLs antiguas no se rompen.
3. **Sitemap incremental:** El sitemap fetcha `GET /items` público (sin JWT, ya permitido por FR-F45) con caché de 60 minutos para evitar carga excesiva al backend.

### Esfuerzo estimado
- Backend (campo slug + endpoint): ~1-2 días de desarrollo backend
- Frontend stories 14-f1, 14-f2: ~2-3 días
- Riesgo: bajo — los cambios de routing son localrizados y la retrocompatibilidad está cubierta

---

## 4. Propuestas de Cambio Detalladas

### 4.1 Nuevos Functional Requirements

```
FR-F54: El backend genera y persiste un campo `slug` único para cada item, derivado
        del título normalizado (sin acentos, minúsculas, hyphens). Se retorna en
        todos los endpoints de items.

FR-F55: El frontend usa `item.slug` para construir todas las URLs de items en
        el router, meta tags (canonical, og:url) y structured data (Product.url,
        BreadcrumbList). UUID se usa únicamente para llamadas a la API interna.

FR-F56: La ruta `/items/:param` acepta tanto slug limpio como UUID. Si el param
        es UUID (formato regex), el componente hace GET /items/:id y redirige
        con replaceUrl a `/items/${item.slug}`. Si es slug, hace GET /items/:slug.

FR-F57: El sitemap.xml incluye URLs de todos los items con status `active`,
        usando el formato `/items/${item.slug}`. El sitemap se genera dinámicamente
        en el servidor SSR con caché de 60 minutos. Priority: 0.7, changefreq: daily.

FR-F58: Las páginas de detalle de item incluyen `og:image:width` (1200), `og:image:height`
        (630), `og:image:alt` y `twitter:image:alt` cuando hay imagen disponible.
        El Product schema incluye `@id` (URL canonical), `offers.seller` (Organization),
        y todas las imágenes del item (no solo la primera). La descripción se trunca
        al último espacio antes del límite de 160 caracteres, no a mitad de palabra.

FR-F59: Las páginas `/explorar` y `/como-funciona/reputacion` incluyen `og:image`
        con la imagen OG por defecto del sitio, junto con sus tags de dimensiones.
        La página de reputación usa `og:type: 'website'` (coherente con su JSON-LD
        WebPage) y establece `name="robots"` content="index, follow" explícitamente.

FR-F60: El schema Organization en la landing usa una imagen PNG/JPG como logo
        (no SVG, incompatible con Google Rich Results). WebSite y Organization
        tienen `@id` para participar en el Knowledge Graph. Todos los servicios
        SEO incluyen `twitter:site` con el handle oficial.
```

### 4.2 Nueva Épica 14 en `epics.md`

```
### Epic 14: URL Canonicalización, Indexación Completa y Calidad SEO

URLs de items pasan de UUID a slug limpio semánticamente rico; el sitemap dinámico
incluye todos los items activos para aceleración del crawl de Google; los servicios
SEO alcanzan calidad óptima en meta tags Open Graph y structured data para maximizar
rich results y previews sociales.

**FRs cubiertos:** FR-F54, FR-F55, FR-F56, FR-F57, FR-F58, FR-F59, FR-F60
**NFRs:** NFR-F17 (indexabilidad), NFR-F18 (SSR en rutas públicas)
**Dependencia:** Backend implementa campo `slug` y endpoint GET /items/:slug antes de 14-f1
```

---

### Story 14-f0: Backend — Campo `slug` y endpoint slug en items

**Responsable:** Backend team
**Propósito:** Habilita la base para URLs limpias. Story de coordinación; el frontend no puede avanzar en 14-f1 sin este contrato.

```
AC:
- Backend añade columna `slug` (varchar(100), unique, not null) al modelo Item
- Al crear item: slug = slugify(title) con desambiguación numérica si colisión
- GET /items: cada ItemSummary incluye campo `slug`
- GET /items/:id: GetItemResponse incluye campo `slug`
- GET /users/me/items: ItemSummary incluye campo `slug`
- GET /items/:slug: nuevo endpoint que resuelve por slug (devuelve mismo contrato que GET /items/:id)
- OpenAPI actualizado con campo `slug` obligatorio en respuestas
- Items existentes reciben slug generado en migración (backfill)
```

---

### Story 14-f1: Frontend — Routing por slug y retrocompatibilidad UUID

**Diseño de referencia:** No aplica (cambio de routing puro, sin nueva pantalla)
**Dependencia:** Story 14-f0 completada (backend retorna `slug` en respuestas)

```
Como visitante o usuario,
quiero que las URLs de items usen palabras clave descriptivas,
para poder compartirlas, recordarlas y para que Google las entienda mejor.
```

**Acceptance Criteria:**

**Given** `items.routes.ts`
**When** se define la ruta de detalle
**Then** la ruta es `/items/:slug` (sin cambio de nombre del parámetro en router — el componente interpreta)

**Given** un parámetro de ruta con formato UUID (`/^[0-9a-f]{8}-[0-9a-f]{4}-...$/i`)
**When** `DetalleComponent` lo detecta al inicializar
**Then** llama `GET /items/:uuid`, obtiene `item.slug` y hace `router.navigate(['/items', item.slug], { replaceUrl: true })` (302 en browser; sin loop)

**Given** un parámetro de ruta con formato slug limpio
**When** `DetalleComponent` lo detecta
**Then** llama `GET /items/:slug` directamente (nuevo endpoint backend)

**Given** cualquier componente que genera un link a item (`ItemCardComponent`, `ItemDonorRow`, feed, listados de perfil, entregas, candidatos)
**When** se construye el `routerLink` o `router.navigate`
**Then** usa `item.slug` en lugar de `item.id`

**Given** `ItemSeoService.apply(item)`
**When** construye canonical URL, og:url y `url` de structured data Product
**Then** usa `https://regalalo.org/items/${item.slug}` en lugar de `https://regalalo.org/items/${item.id}`

**Given** el BreadcrumbList structured data
**When** el tercer nivel (item) se genera
**Then** la URL de item usa slug

---

### Story 14-f2: Frontend — Sitemap dinámico con items activos

**Dependencia:** Story 14-f0 completada (backend retorna `slug` en ItemSummary del feed)

```
Como bot de Google,
quiero encontrar todos los objetos disponibles en el sitemap,
para indexarlos sin depender únicamente del crawling del feed.
```

**Acceptance Criteria:**

**Given** `GET /sitemap.xml`
**When** el servidor SSR lo procesa
**Then** la respuesta incluye las URLs estáticas ya existentes (/, /en, /ca, /explorar, /como-funciona/reputacion y variantes locale) PLUS una entrada por cada item activo

**Given** el servidor construye la sección de items
**When** fetcha `GET /items` (sin JWT — Feed Global, FR-F45) paginado
**Then** itera páginas hasta obtener todos los items (máx. 5.000 items; si supera, incluye los más recientes)
**And** incluye únicamente items con `status === 'active'`
**And** la URL de cada item es `https://regalalo.org/items/${item.slug}`
**And** priority = `0.7`, changefreq = `daily`, lastmod = `item.updatedAt` (si disponible en contrato)

**Given** la generación del sitemap es costosa (múltiples llamadas al backend)
**When** el sitemap se genera
**Then** el servidor cachea la respuesta con `Cache-Control: public, max-age=3600` (1 hora)
**And** en el objeto de caché en memoria de Express (o similar) el sitemap se regenera máx. cada 60 min

**Given** el backend no está disponible al generar el sitemap
**When** falla la fetch de items
**Then** el sitemap devuelve igualmente las URLs estáticas (sin items) — sin lanzar 500

**Given** `public/robots.txt`
**When** se revisa
**Then** la directiva `Sitemap: https://regalalo.org/sitemap.xml` ya apunta al sitemap correcto — sin cambio necesario

---

### Story 14-f3: Frontend — Correcciones de calidad en meta tags y structured data

**Sin dependencias de backend.** Implementable en paralelo con 14-f0.

```
Como plataforma,
quiero que los meta tags Open Graph y el structured data cumplan las mejores
prácticas de Google y plataformas sociales,
para maximizar rich results, previews correctas y visibilidad en Knowledge Graph.
```

**Acceptance Criteria — `ItemSeoService`:**

**Given** una página de detalle de item con imagen
**When** se generan las OG tags
**Then** se incluyen `og:image:width` (1200), `og:image:height` (630), `og:image:type` ('image/jpeg' o 'image/webp' según URL), `og:image:alt` (= `item.title`)
**And** se incluye `twitter:image:alt` (= `item.title`)

**Given** el Product schema de un item activo
**When** se serializa el JSON-LD
**Then** el objeto Product incluye `@id` = URL canonical del item
**And** `offers.seller` es `{ "@type": "Organization", "name": "Regálalo", "url": "${siteUrl}/" }`
**And** `image` es el array completo de `item.images` (no solo `images[0]`), omitido si vacío

**Given** la descripción del item tiene más de 160 caracteres
**When** se trunca para meta description y structured data description
**Then** el corte ocurre en el último espacio antes del carácter 160 (nunca a mitad de palabra)
**And** se añade '…' al final si fue truncado

**Acceptance Criteria — `ExplorarSeoService`:**

**Given** la página `/explorar`
**When** se generan las OG tags
**Then** se incluyen `og:image` (imagen OG por defecto del sitio), `og:image:width` (1200), `og:image:height` (630), `og:image:alt` (= page title), `og:image:type` ('image/png')
**And** `twitter:card` cambia a `'summary_large_image'`
**And** se incluye `twitter:image` con la imagen por defecto

**Acceptance Criteria — `ReputationSeoService`:**

**Given** la página `/como-funciona/reputacion` y variantes locale
**When** se generan las OG tags
**Then** `og:type` es `'website'` (no `'article'`, pues no hay metadatos de artículo)
**And** se incluye `og:image` con la imagen OG por defecto del sitio y sus tags de dimensiones
**And** se establece explícitamente `name="robots" content="index, follow"`

**Acceptance Criteria — `LandingSeoService`:**

**Given** el JSON-LD de Organization
**When** se serializa
**Then** `logo` usa una imagen PNG/JPG (no `.svg`): `{ "@type": "ImageObject", "url": "${siteUrl}/logo.png", "width": 200, "height": 60 }`
**And** el schema WebSite incluye `"@id": "${siteUrl}/#website"`
**And** el schema Organization incluye `"@id": "${siteUrl}/#organization"`

**Given** todos los servicios SEO que establecen twitter tags
**When** se generan
**Then** se incluye `twitter:site` con el handle oficial de Twitter/X de la plataforma

---

### 4.3 Cambios en Architecture doc (`docs/architecture.md`)

**Sección §4 - Contratos de API (añadir `slug` a ItemSummary y GetItemResponse):**

```
OLD (ItemSummary):
{
  id: string;          // UUID
  title: string;
  status: ItemStatus;
  ...
}

NEW:
{
  id: string;          // UUID — uso interno/API únicamente
  slug: string;        // URL-safe, ej. "bicicleta-montana-roja"
  title: string;
  status: ItemStatus;
  ...
}
```

**Sección §3 - Tabla de rutas (actualizar ruta de detalle):**

```
OLD:
/items/:id  →  DetalleComponent  (público)

NEW:
/items/:slug  →  DetalleComponent  (público)
               — :slug acepta slug limpio O UUID (retrocompatibilidad)
               — UUID redirige a slug con replaceUrl
               — slug resuelve vía GET /items/:slug
```

**Nueva sección §8 - URL Canonicalización (añadir):**

```
## §8 - URL Canonicalización e Items

### Slug de Item
- El backend genera un slug único por item al crear: slugify(title) + sufijo desambiguador
- El frontend nunca construye slugs: siempre consume item.slug del contrato API
- UUID se usa exclusivamente en llamadas HTTP internas; nunca en URLs de navegación

### Sitemap de Items
- El sitemap.xml se genera dinámicamente en server.ts
- Llama GET /items sin JWT (Feed Global) de forma paginada
- Caché en memoria: 60 minutos
- Límite: 5.000 items; se priorizan los más recientes si se supera
```

---

## 5. Handoff de Implementación

**Clasificación:** Moderate (coordinación backend + reorganización de links en frontend)

| Paso | Responsable | Acción | Dependencia |
|---|---|---|---|
| 1 | Backend team | Story 14-f0: campo slug, migración, endpoint GET /items/:slug | — |
| 2 | Developer Agent | Story 14-f3: correcciones de calidad meta tags y structured data | Sin dependencias — puede empezar ya |
| 3 | Developer Agent | Regenerar cliente OpenAPI tras 14-f0 (`npm run api:generate`) | Tras 14-f0 |
| 4 | Developer Agent | Story 14-f1: routing slug + retrocompatibilidad + links + URL en ItemSeoService | Tras 14-f0 |
| 5 | Developer Agent | Story 14-f2: sitemap dinámico en server.ts | Tras 14-f0 |
| 6 | Developer Agent | Actualizar `docs/architecture.md` con contratos y tabla de rutas | Tras 14-f0 |

### Criterios de aceptación del cambio completo

**URL y sitemap (14-f0, 14-f1, 14-f2):**
- [ ] `https://regalalo.org/items/bicicleta-de-montana-roja` devuelve la página con SSR y meta tags correctos
- [ ] `https://regalalo.org/items/{uuid}` redirige automáticamente a la URL con slug
- [ ] `https://regalalo.org/sitemap.xml` incluye al menos 1 item activo con URL `/items/{slug}`
- [ ] Canonical tag en item detail usa URL con slug
- [ ] Product structured data `url` y `@id` usan URL con slug

**Calidad SEO (14-f3 — validable sin backend):**
- [ ] Google Rich Results Test valida el Product schema sin errores (structured data válido)
- [ ] Facebook Sharing Debugger muestra imagen correcta al compartir un item (og:image:width/height presentes)
- [ ] Twitter Card Validator muestra preview tipo `summary_large_image` en páginas de item
- [ ] Al compartir `/explorar` en redes sociales aparece imagen preview (og:image presente)
- [ ] La página de reputación tiene `og:type: website` y robots `index, follow` explícito
- [ ] Lighthouse SEO score ≥ 90 en página de detalle de item

---

## 6. Nota sobre robots.txt

Sin cambio requerido. La directiva actual `Allow: /items/` cubre correctamente URLs con slug (`/items/bicicleta-roja`) y ya apunta al sitemap correcto. No se introduce ninguna ruta nueva que deba ser bloqueada.

---

## 7. Firma y Aprobación

- [ ] **Aprobar**: Proceder con actualización de epics.md, architecture.md y coordinación con backend para 14-f0.
- [ ] **Revisar**: Indicar ajustes necesarios.
