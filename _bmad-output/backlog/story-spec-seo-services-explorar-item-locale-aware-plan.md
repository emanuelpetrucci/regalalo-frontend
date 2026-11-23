---
ticket: spec-seo-services-explorar-item-locale-aware
status: done
type: feature
migrated_from: v6
---


<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `explorar.component.ts` tiene SEO inline con strings hardcodeadas en español, sin datos estructurados, canonical incompleto ni inicialización de analytics. `item-seo.service.ts` carece de canonical URL, JSON-LD, traducciones y analytics. Ambos no siguen el patrón establecido por `landing-seo.service.ts`. Además, quien aterrice directamente en `/explorar` o `/items/:id` sin pasar por la landing nunca inicializaría Google Analytics.

**Approach:** Crear `ExplorarSeoService` y reescribir `ItemSeoService` siguiendo el patrón de `ReputationSeoService` + `LandingSeoService`: `TranslocoService` para textos, `SeoService.setJsonLd()` para datos estructurados, canonical y Open Graph completos, e inicialización de GA vía `LandingSeoService.initAnalyticsIfNeeded()` (singleton con guards de carga única y consentimiento). Las rutas ya están en `RenderMode.Server`; la tarea SSR es verificar que no haya llamadas browser-only sin guard y que los meta tags se escriban durante el render del servidor.

## Boundaries & Constraints

**Always:**
- Seguir el patrón de `reputation-seo.service.ts`: inyectar `DOCUMENT`, `Title`, `Meta`, `TranslocoService`, `SeoService`, `resolveSiteBaseUrl()`
- `SeoService.setJsonLd(id, data)` para insertar scripts JSON-LD (nunca DOM manual)
- `SeoService.removeJsonLd(id)` en el método `clear()`
- Los ids de JSON-LD deben ser únicos y con prefijo descriptivo (`explorar-*`, `item-*`)
- Las claves i18n deben existir en los tres archivos (`es.json`, `en.json`, `ca.json`)
- `ExplorarSeoService.apply()` fija `document.documentElement.lang = 'es'` (la ruta `/explorar` no tiene variantes de idioma)
- `ItemSeoService.apply(item)` construye la canonical como `{siteBaseUrl}/items/{item.id}`
- Mantener la firma pública de `ItemSeoService`: `apply(item: GetItemResponse)` y `clear()`
- Analytics: ambos servicios inyectan `LandingSeoService` y llaman `initAnalyticsIfNeeded()` al final de `apply()`. Este método ya tiene guards de singleton (`analyticsLoaded`), consentimiento de cookies (`CookieConsentService`) y browser-only (`document.defaultView`), así que es seguro llamarlo desde SSR
- SSR: toda llamada a APIs browser-only (`window`, `navigator`, `requestAnimationFrame`) debe estar detrás de un guard `document.defaultView`; los meta tags y JSON-LD se deben escribir en `ngOnInit` o tras la carga de datos (no en `afterNextRender`)

**Ask First:**
- Si se decide añadir rutas `/en/explore` o `/ca/explorar` en el futuro, la extensión de hreflang queda fuera del scope actual

**Never:**
- No crear hreflang para `/explorar` ni para `/items/:id` (no existen variantes de idioma para estas rutas)
- No modificar `detalle.component.ts` ni `item-detail-panel.component.ts` (ya consumen `ItemSeoService` correctamente)
- No tocar archivos generados en `src/app/core/api/generated/`
- No duplicar la lógica de carga del script gtag.js — reutilizar `LandingSeoService.initAnalyticsIfNeeded()`
- No cambiar `app.routes.server.ts` (explorar e items/:id ya son `RenderMode.Server`)

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Item activo con imagen | `item.status = 'active'`, `item.images[0]` existe | `robots: index, follow`, `og:image` seteado, JSON-LD Product con `image` | N/A |
| Item completado/cancelado | `item.status = 'completed'` | `robots: noindex, follow`, JSON-LD con misma estructura | N/A |
| Item sin imagen | `item.images = []` | `og:image` eliminado, JSON-LD Product sin `image` | N/A |
| `clear()` llamado | Cualquier estado previo | Title y meta restaurados a defaults, todos los JSON-LD del item eliminados | N/A |

</frozen-after-approval>

## Code Map

- `src/app/core/seo/explorar-seo.service.ts` -- NUEVO: servicio SEO dedicado para /explorar
- `src/app/features/items/explorar/explorar.component.ts` -- MODIFICAR: eliminar SEO inline, inyectar ExplorarSeoService
- `src/app/core/seo/item-seo.service.ts` -- REESCRIBIR: añadir canonical, JSON-LD (Product + BreadcrumbList), OG completo, analytics
- `public/i18n/es.json` -- MODIFICAR: añadir claves items.explore.meta.* e items.explore.seo.*, items.detail.meta.* e items.detail.seo.*
- `public/i18n/en.json` -- MODIFICAR: mismas claves en inglés
- `public/i18n/ca.json` -- MODIFICAR: mismas claves en catalán
- `src/app/core/seo/landing-seo.service.ts` -- REFERENCIA: patrón analytics (`initAnalyticsIfNeeded`) + patrón completo de apply()
- `src/app/core/seo/reputation-seo.service.ts` -- REFERENCIA: patrón apply() con locale
- `src/app/core/seo/seo.service.ts` -- REFERENCIA: `setJsonLd` / `removeJsonLd`
- `src/app/core/seo/resolve-site-url.ts` -- REFERENCIA: `resolveSiteBaseUrl()`, `absoluteSiteUrl()`
- `src/app/app.routes.server.ts` -- REFERENCIA: confirmar RenderMode.Server para explorar e items/:id (ya configurado, no tocar)
- `src/app/core/api/generated/models/get-item-response.ts` -- REFERENCIA: shape del item

## Tasks & Acceptance

**Execution:**
- [x] `public/i18n/es.json` -- Añadir bajo `items.explore`: `meta.title`, `meta.description`, `seo.breadcrumb_home`, `seo.breadcrumb_page`; bajo `items.detail`: `meta.title_suffix`, `meta.description_prefix`, `seo.breadcrumb_home`, `seo.breadcrumb_explore` -- Strings en español
- [x] `public/i18n/en.json` -- Añadir las mismas claves con strings en inglés
- [x] `public/i18n/ca.json` -- Añadir las mismas claves con strings en catalán
- [x] `src/app/core/seo/explorar-seo.service.ts` -- Crear servicio `@Injectable({ providedIn: 'root' })` con `apply()` y `clear()` siguiendo el patrón de `reputation-seo.service.ts`; JSON-LD: `explorar-webpage` (CollectionPage) + `explorar-breadcrumb` (BreadcrumbList); llamar `landingSeo.initAnalyticsIfNeeded()` al final de `apply()`
- [x] `src/app/core/seo/item-seo.service.ts` -- Reescribir: añadir canonical, OG completo (`og:url`, `og:type=product`, `og:image`, `og:locale`), JSON-LD `item-product` (Product + Offer gratuita + itemCondition) + `item-breadcrumb` (BreadcrumbList); `clear()` elimina ambos JSON-LD y limpia canonical; llamar `landingSeo.initAnalyticsIfNeeded()` al final de `apply()`
- [x] `src/app/features/items/explorar/explorar.component.ts` -- Eliminar inyecciones de `Title`, `Meta`, `DOCUMENT` y todo el bloque SEO de `ngOnInit()`; inyectar `ExplorarSeoService` y llamar `explorarSeo.apply()` en su lugar

**Acceptance Criteria:**
- Given página /explorar cargada, when se inspecciona el `<head>`, then existen `<title>`, `<meta name="description">`, `<link rel="canonical" href="…/explorar">`, `<meta property="og:url">`, y dos scripts `<script type="application/ld+json">`
- Given ítem activo con imagen cargado en /items/:id, when `ItemSeoService.apply()` es invocado, then `og:image` está presente, robots es `index, follow`, y existe JSON-LD con `@type: Product` y `@type: BreadcrumbList`
- Given `ItemSeoService.clear()` invocado, when se inspecciona el `<head>`, then no existen scripts JSON-LD de tipo `item-*` y el título vuelve al default
- Given usuario que llega directo a `/explorar` sin pasar por la landing, when la cookie de analytics está aceptada, then el script de Google Analytics es cargado e inicializado
- Given render en servidor (SSR), when `/explorar` o `/items/:id` son solicitadas, then los meta tags, canonical y JSON-LD están presentes en el HTML devuelto por el servidor (verificable con `curl`)

## Spec Change Log

## Design Notes

**Condition mapping para schema.org (ItemSeoService):**
```
new       → https://schema.org/NewCondition
like_new  → https://schema.org/LikeNewCondition
good      → https://schema.org/UsedCondition
fair      → https://schema.org/DamagedCondition
```

**JSON-LD para ExplorarSeoService (CollectionPage):**
```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "<title traducido>",
  "description": "<description traducida>",
  "url": "<siteUrl>/explorar",
  "inLanguage": "es",
  "isPartOf": { "@type": "WebSite", "name": "Regálalo", "url": "<siteUrl>/" }
}
```

**JSON-LD para ItemSeoService (Product):**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "<item.title>",
  "description": "<item.description truncado a 160 chars>",
  "image": ["<url imagen>"],
  "itemCondition": "https://schema.org/...",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock"
  }
}
```

## Verification

**Commands:**
- `npx tsc --noEmit` -- expected: 0 errores de compilación

**Manual checks (si no hay CLI):**
- SSR: arrancar con `npm run build && npm run serve:ssr` y ejecutar `curl -s http://localhost:4000/explorar | grep -E "<title>|canonical|application/ld\+json"` — deben aparecer los tres
- SSR: `curl -s http://localhost:4000/items/<id-real> | grep -E "<title>|canonical|application/ld\+json"` — deben aparecer los tres con datos del ítem
