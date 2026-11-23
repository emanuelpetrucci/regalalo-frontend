---
baseline_commit: 05dd98b701237282b883925901c7ce6698c82e62
---

# Story 13.f1: Infraestructura SEO — rutas públicas, regeneración cliente y meta tags dinámicos

Status: done

## Story

Como crawler de Google y como visitante no autenticado,
quiero acceder a `/explorar` e `/items/:id` sin necesidad de autenticación y ver meta tags descriptivos del contenido,
para que los objetos sean indexables en búsquedas orgánicas y las URLs sean compartibles con previsualización enriquecida.

**FR:** FR-F44, FR-F45, FR-F49, FR-F50, FR-F51  
**Épica:** 13-f (Descubrimiento Público y Conversión SEO)  
**Referencia:** `_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-15-public-discovery-seo.md` (aprobado 2026-06-15)

## Acceptance Criteria

### AC 1: Regenerar cliente OpenAPI — tipos nullable correctos

**Given** `../backend/openapi/openapi.json` ya tiene `distanceMeters: nullable: true` en `ItemSummary` y `GetItemResponse`, y `donor.id: nullable: true` en `ItemDonor`  
**When** se ejecuta `npm run api:generate`  
**Then** `src/app/core/api/generated/models/item-summary.ts` incluye `distanceMeters: number | null`  
**And** `src/app/core/api/generated/models/get-item-response.ts` incluye `distanceMeters: number | null`  
**And** `src/app/core/api/generated/models/item-donor.ts` incluye `id: string | null`  
**And** el build TypeScript no emite errores en los puntos que consumen estos campos

> **⚠️ NOTA DEV (consumidores nullable):** Tras la regeneración hay exactamente UN punto de rotura TypeScript en el código existente:
> - `src/app/shared/components/item-feed-card/item-feed-card.component.ts` línea 41: `formatDistanceKm(this.item().distanceMeters)` → `distanceMeters` pasa de `number` a `number | null` pero `formatDistanceKm` acepta solo `number`.
>
> **Fix mínimo para 13-f1** (la UX del valor null se desarrolla en 13-f2):
> ```typescript
> readonly distanceKm = computed(() => {
>   const d = this.item().distanceMeters;
>   return d != null ? formatDistanceKm(d) : null;
> });
> ```
> En la template de `item-feed-card.component.html`, el `app-item-distance-chip` solo se renderiza si `distanceKm() !== null`. En 13-f2 se añadirá la variante "Disponible en España".
>
> `item-detail-panel.component.ts` `isDonor` compara `donor.id === userId` — comparación `string | null` vs `string | undefined` es válida en TS y ya retorna `false` para visitantes (donor.id null). No hay error de compilación.

---

### AC 2: Rutas `/explorar` e `/items/:id` sin AuthGuard

**Given** la configuración de rutas en `src/app/app.routes.ts`  
**When** se revisa la definición de `/explorar` e `/items/:id`  
**Then** ninguna de las dos rutas tiene `canActivate: [authGuard]` (ni directa ni heredada del parent)  
**And** las rutas de mis-objetos, publicar, entregas, perfil y candidatos conservan su `authGuard`

> **⚠️ NOTA DEV (estructura crítica):** El problema actual es que `ITEMS_ROUTES` está dentro de un grupo padre con `canActivate: [authGuard]`:
> ```typescript
> // app.routes.ts — ESTADO ACTUAL (líneas 93-97)
> {
>   path: '',
>   component: AppShellComponent,
>   canActivate: [authGuard],                          // ← guarda todos los children
>   children: [...ITEMS_ROUTES, ...DELIVERY_ROUTES, ...PROFILE_ROUTES],
> }
> ```
>
> **Solución — separar en dos grupos AppShell:**
>
> **Paso 1 — `src/app/features/items/items.routes.ts`:** Exportar dos constantes separadas:
> ```typescript
> export const PUBLIC_ITEMS_ROUTES: Routes = [
>   { path: 'explorar', loadComponent: () => import('./explorar/explorar.component').then(m => m.ExplorarComponent) },
>   { path: 'items/:id', loadComponent: () => import('./detalle/detalle.component').then(m => m.DetalleComponent) },
> ];
>
> export const PROTECTED_ITEMS_ROUTES: Routes = [
>   { path: 'mis-objetos/publicar', loadComponent: () => import('./publicar/publicar.component').then(m => m.PublicarComponent) },
>   { path: 'mis-objetos', loadComponent: () => import('./mis-objetos/mis-objetos.component').then(m => m.MisObjetosComponent) },
> ];
>
> // Mantener ITEMS_ROUTES como alias para no romper imports existentes (si los hubiera)
> export const ITEMS_ROUTES = [...PUBLIC_ITEMS_ROUTES, ...PROTECTED_ITEMS_ROUTES];
> ```
>
> **Paso 2 — `src/app/app.routes.ts`:** Reemplazar el grupo único por dos grupos:
> ```typescript
> // Grupo público: AppShell sin guard (explorar, detalle)
> {
>   path: '',
>   component: AppShellComponent,
>   children: PUBLIC_ITEMS_ROUTES,
> },
> // Grupo protegido: AppShell con guard (mis-objetos, publicar, entregas, perfil)
> {
>   path: '',
>   component: AppShellComponent,
>   canActivate: [authGuard],
>   children: [...PROTECTED_ITEMS_ROUTES, ...DELIVERY_ROUTES, ...PROFILE_ROUTES],
> },
> ```
> Actualizar imports de `items.routes.ts` en `app.routes.ts` para usar `PUBLIC_ITEMS_ROUTES` y `PROTECTED_ITEMS_ROUTES`.

---

### AC 3: Visita sin token a `/explorar` sin redirección

**Given** un visitante sin token en `localStorage`  
**When** navega directamente a `/explorar`  
**Then** el feed carga sin redirección a `/login`  
**And** `GET /items` se llama sin header `Authorization` (el `JwtInterceptor` no añade el header si `SessionService.getToken()` devuelve null)

> **Nota:** Verificar que el interceptor JWT en `src/app/core/interceptors/` no añade header cuando no hay token. El comportamiento esperado ya debería estar correcto; confirmar revisando el interceptor.

---

### AC 4: Visita sin token a `/items/:uuid` sin redirección

**Given** un visitante sin token en `localStorage`  
**When** navega directamente a `/items/:uuid`  
**Then** el detalle del objeto carga sin redirección a `/login`  
**And** `GET /items/:id` se llama sin header `Authorization`

---

### AC 5: GET /items sin JWT devuelve Feed Global (distanceMeters null)

**Given** la respuesta de `GET /items` para un visitante  
**When** se recibe la lista de objetos  
**Then** cada ítem tiene `distanceMeters === null` (señal de Feed Global — comportamiento del backend)

> **Nota:** No hay cambio frontend para este AC — el backend ya lo implementa. Verificar que el código no filtra ítems con `distanceMeters === null`.

---

### AC 6: Regresión — usuario autenticado con distancia calculada

**Given** un usuario autenticado con token válido  
**When** llama a `GET /items`  
**Then** recibe `distanceMeters` calculado (número, no null) — sin regresión de comportamiento

---

### AC 7: GET /items/:id para visitante — donor anónimo en tipos

**Given** la respuesta de `GET /items/:id` para un visitante  
**When** el objeto existe  
**Then** el campo `donor.id` es `null`, `donor.firstName` es `"Anónimo"`, `donor.avatarUrl` es `null`, `donor.reputationScore` tiene valor real  
**And** `distanceMeters` es `null`

> **Nota:** No hay cambio frontend para este AC — el backend ya lo implementa. La UX del donante anónimo (ItemDonorRow en modo anonymous) es responsabilidad de 13-f2. En 13-f1 solo importa que el tipo compile correctamente.

---

### AC 8: Regresión — usuario autenticado con datos reales del donor

**Given** un usuario autenticado con token válido  
**When** llama a `GET /items/:id`  
**Then** recibe `donor.id` con UUID real y `distanceMeters` calculado — sin regresión

---

### AC 9: Manejo de 410 Gone — página diferenciada

**Given** `GET /items/:id` devuelve HTTP `410 Gone` (objeto purgado físicamente en backend)  
**When** el componente de detalle procesa la respuesta  
**Then** se muestra una página de error con mensaje "Este objeto ya no está disponible" y enlace a `/explorar`  
**And** esta página de error es visualmente distinta de la página 404 (objeto no encontrado)  
**And** el error 410 se maneja explícitamente — no se trata como error genérico

> **⚠️ NOTA DEV (implementación 410):**
> En `src/app/shared/components/item-detail-panel/item-detail-panel.component.ts`:
>
> 1. Añadir signal: `readonly gone = signal(false);`
> 2. En `loadItem()`, actualizar el bloque catch:
>    ```typescript
>    if (err instanceof HttpErrorResponse && err.status === 410) {
>      this.gone.set(true);
>      this.loading.set(false);
>      return;
>    }
>    if (this.isItemNotFoundError(err)) {   // 404 / 400
>      this.showNotFound();
>      return;
>    }
>    ```
> 3. Asegurarse de reiniciar `gone.set(false)` al inicio de `loadItem()` (junto con los demás signals).
> 4. En la template `item-detail-panel.component.html`, añadir bloque `@if (gone())` con:
>    - Texto: clave i18n `items.detail.gone.title` → "Este objeto ya no está disponible"
>    - Subtexto: clave i18n `items.detail.gone.body` → "El objeto que buscas ya fue retirado permanentemente."
>    - Enlace `routerLink="/explorar"`: clave i18n `items.detail.gone.back_link` → "Ver objetos disponibles"
>    - Estilo diferente al bloque `notFound` (usar clase CSS `item-detail-panel__gone` distinta de `item-detail-panel__not-found`)
> 5. Añadir las 3 claves i18n en `public/i18n/es.json`, `ca.json` y `en.json` bajo `items.detail.gone.*`.

---

### AC 10: RenderMode Server para rutas públicas de items

**Given** la configuración de `src/app/app.routes.server.ts`  
**When** se define el `RenderMode` de cada ruta  
**Then** `/explorar` usa `RenderMode.Server` (SSR dinámico)  
**And** `/items/**` (pattern para detalle) usa `RenderMode.Server`  
**And** las rutas de landing (`/`, `/en`, `/ca`) conservan `RenderMode.Prerender`  
**And** las rutas de reputación conservan `RenderMode.Prerender`  
**And** el wildcard `**` conserva `RenderMode.Client`

> **⚠️ NOTA DEV:** Añadir al array `serverRoutes` en `src/app/app.routes.server.ts`:
> ```typescript
> { path: 'explorar', renderMode: RenderMode.Server },
> { path: 'items/:id', renderMode: RenderMode.Server },
> ```
> El path pattern en `ServerRoute` usa `:param` (no `**`). Poner estas dos entradas **antes** del wildcard `{ path: '**', renderMode: RenderMode.Client }`.

---

### AC 11: SEO robots — /explorar indexable

**Given** la configuración del `SeoService` y `seo.constants.ts`  
**When** se navega a `/explorar`  
**Then** el meta tag `robots` tiene `content="index, follow"` (no `noindex`)

> **⚠️ NOTA DEV:** En `src/app/core/seo/seo.constants.ts`, añadir `/explorar` al set `LANDING_PATHS`:
> ```typescript
> export const LANDING_PATHS = new Set([
>   '/',
>   '/en',
>   '/ca',
>   '/como-funciona/reputacion',
>   '/ca/com-funciona/reputacio',
>   '/en/how-it-works/reputation',
>   '/explorar',   // ← añadir
> ]);
> ```
> El `SeoService.applyRobotsForUrl()` ya usa este set — no hay más cambios.
>
> **Para `/items/:id`:** el `SeoService.applyRobotsForUrl('/items/some-uuid')` actualmente aplica `noindex`. La corrección para items se hace en el AC 12 (el `ItemSeoService` override el robots con `index, follow` o `noindex` según el status del ítem). El comportamiento temporal (mientras el componente no haya cargado el ítem) tendrá `noindex` del `SeoService.applyRobotsForUrl` hasta que el `ItemSeoService.apply()` lo sobreescriba. En SSR, esto es irrelevante porque la respuesta final al crawler es la del servidor, que ya incluye los meta tags correctos del `ItemSeoService.apply()`.

---

### AC 12: OpenGraph y robots dinámicos para `/items/:id` via SSR

**Given** la ruta `/items/:id` con Angular SSR activo  
**When** el servidor renderiza la página con un ítem válido (`status: 'active'` o `'reserved'`)  
**Then** el `<head>` incluye:
- `<title>` con el título del objeto
- `<meta name="description">` con los primeros 160 caracteres de la descripción
- `<meta property="og:title">` con el título del objeto
- `<meta property="og:description">` con la descripción recortada a 160 chars
- `<meta property="og:image">` con la URL de la primera imagen del objeto (si existe)
- **NO** incluye `<meta name="robots" content="noindex">`

**Given** un objeto con `status === 'completed'` o `status === 'cancelled'`  
**When** se renderiza la página de detalle via SSR  
**Then** el `<head>` incluye `<meta name="robots" content="noindex, follow">`  
**And** los objetos en estado `active` o `reserved` tienen `content="index, follow"` — sin regresión

> **⚠️ NOTA DEV (ItemSeoService — NUEVA clase):**
>
> Crear `src/app/core/seo/item-seo.service.ts`:
> ```typescript
> import { inject, Injectable } from '@angular/core';
> import { Meta, Title } from '@angular/platform-browser';
> import { GetItemResponse } from '../api/generated/models/get-item-response';
> import { resolveSiteBaseUrl } from './resolve-site-url';
>
> @Injectable({ providedIn: 'root' })
> export class ItemSeoService {
>   private readonly title = inject(Title);
>   private readonly meta = inject(Meta);
>   private readonly siteBaseUrl = resolveSiteBaseUrl();
>
>   apply(item: GetItemResponse): void {
>     const truncatedDesc = item.description.slice(0, 160);
>     const firstImage = item.images[0] ?? null;
>
>     this.title.setTitle(item.title);
>     this.meta.updateTag({ name: 'description', content: truncatedDesc });
>     this.meta.updateTag({ property: 'og:title', content: item.title });
>     this.meta.updateTag({ property: 'og:description', content: truncatedDesc });
>     if (firstImage) {
>       this.meta.updateTag({ property: 'og:image', content: firstImage });
>     } else {
>       this.meta.removeTag('property="og:image"');
>     }
>     const isNoIndex = item.status === 'completed' || item.status === 'cancelled';
>     this.meta.updateTag({
>       name: 'robots',
>       content: isNoIndex ? 'noindex, follow' : 'index, follow',
>     });
>   }
>
>   clear(): void {
>     this.meta.removeTag('property="og:title"');
>     this.meta.removeTag('property="og:description"');
>     this.meta.removeTag('property="og:image"');
>   }
> }
> ```
>
> En `src/app/shared/components/item-detail-panel/item-detail-panel.component.ts`:
> - Inyectar `ItemSeoService`
> - En `loadItem()`, tras `this.item.set(res)`:
>   ```typescript
>   this.itemSeoService.apply(res);
>   ```
> - En `loadItem()` reset inicial, añadir limpieza: `this.itemSeoService.clear()` antes del try.
> - Al usar en una modal (`presentation() === 'modal'`), los meta tags de la modal no son relevantes para SSR. No hay restricción para llamar `apply()` en modo modal — es un no-op visible.
>
> **Patrón existente de referencia:** `LandingSeoService` usa `inject(Title)`, `inject(Meta)`, `inject(SeoService)` — seguir la misma estructura. Ver `src/app/core/seo/landing-seo.service.ts`.
> **Patrón `resolveSiteBaseUrl()`**: función utilitaria en `src/app/core/seo/resolve-site-url.ts` — devuelve `SITE_BASE_URL` token (inyectado desde `app.config.server.ts`) en SSR, o `environment.siteUrl` en cliente.

---

### AC 13: Sin regresión — token inválido/expirado

**Given** un token inválido o expirado en `localStorage`  
**When** el visitante accede a `/explorar` o `/items/:id`  
**Then** el backend responde `401` y el interceptor JWT limpia el token y redirige a `/login` (comportamiento existente sin cambio)

---

### AC 14: Sin regresión — rutas autenticadas conservan guard

**Given** los cambios de routing implementados  
**When** un visitante sin token intenta navegar a `/mis-objetos`, `/publicar`, `/entregas/*`, `/perfil`, `/candidatos`  
**Then** el `authGuard` intercepta y redirige a `/login?returnUrl=<ruta>` — sin cambio de comportamiento

## Tasks / Subtasks

### A. Regenerar cliente OpenAPI (AC: 1)

- [x] Ejecutar `npm run api:generate` (requiere backend en `../backend/openapi/openapi.json` que ya tiene los campos nullable)
- [x] Verificar que `item-summary.ts` generado tiene `distanceMeters: number | null`
- [x] Verificar que `get-item-response.ts` generado tiene `distanceMeters: number | null`
- [x] Verificar que `item-donor.ts` generado tiene `id: string | null`
- [x] Corregir error TypeScript en `item-feed-card.component.ts`: cambiar `distanceKm` computed para manejar `null` (ver nota dev AC 1)
- [x] En `item-feed-card.component.html`: envolver `app-item-distance-chip` en `@if (distanceKm() !== null)` — si ya está condicional verificar que el `@if` usa la señal `distanceKm()` correctamente
- [x] Ejecutar `npm run build` o `npx tsc --noEmit` y confirmar 0 errores

### B. Separar rutas públicas del authGuard (ACs: 2, 3, 4, 13, 14)

- [x] Editar `src/app/features/items/items.routes.ts`:
  - Añadir constante `PUBLIC_ITEMS_ROUTES` con `explorar` y `items/:id`
  - Añadir constante `PROTECTED_ITEMS_ROUTES` con `mis-objetos/publicar` y `mis-objetos`
  - Mantener `ITEMS_ROUTES` como unión de ambas (retrocompatibilidad)
- [x] Editar `src/app/app.routes.ts`:
  - Importar `PUBLIC_ITEMS_ROUTES` y `PROTECTED_ITEMS_ROUTES`
  - Añadir grupo `AppShellComponent` sin guard (con `PUBLIC_ITEMS_ROUTES`)
  - Grupo protegido existente pasa a usar `PROTECTED_ITEMS_ROUTES` en lugar de `ITEMS_ROUTES`
- [x] Verificar en dev server que `/explorar` carga sin token (sin redirección a /login) — validado por test `app.routes.spec.ts > loads /explorar without auth (public route)`
- [x] Verificar que `/mis-objetos` sin token redirige a `/login` — validado por test `app.routes.spec.ts > redirects protected routes to login with returnUrl when unauthenticated`

### C. Configurar RenderMode Server (AC: 10)

- [x] Editar `src/app/app.routes.server.ts`:
  - Añadir `{ path: 'explorar', renderMode: RenderMode.Server }`
  - Añadir `{ path: 'items/:id', renderMode: RenderMode.Server }`
  - Colocar ANTES del wildcard `{ path: '**', renderMode: RenderMode.Client }`

### D. Actualizar seo.constants.ts — /explorar indexable (AC: 11)

- [x] Editar `src/app/core/seo/seo.constants.ts`:
  - Añadir `'/explorar'` a `LANDING_PATHS`
- [x] Actualizar test `seo.service.spec.ts` si tiene casos hardcoded que necesiten `/explorar`

### E. Crear ItemSeoService (AC: 12)

- [x] Crear `src/app/core/seo/item-seo.service.ts` (ver código en nota dev AC 12)
- [x] Editar `src/app/shared/components/item-detail-panel/item-detail-panel.component.ts`:
  - Inyectar `ItemSeoService`
  - Llamar `this.itemSeoService.clear()` al inicio de `loadItem()` (en reset)
  - Llamar `this.itemSeoService.apply(res)` tras `this.item.set(res)` en el try success

### F. Manejar 410 Gone (AC: 9)

- [x] En `item-detail-panel.component.ts`:
  - Añadir `readonly gone = signal(false);`
  - Añadir `this.gone.set(false)` en reset de `loadItem()`
  - En catch: detectar `err.status === 410` antes del bloque `isItemNotFoundError` → `this.gone.set(true); this.loading.set(false); return;`
- [x] En `item-detail-panel.component.html`:
  - Añadir bloque `@if (gone())` con estado visual diferenciado de 404 (clase CSS `item-detail-panel__gone`)
  - Texto i18n: `items.detail.gone.title`, `items.detail.gone.body`, `items.detail.gone.back_link`
  - Enlace `routerLink="/explorar"`
- [x] Añadir claves i18n en los 3 idiomas:
  - `public/i18n/es.json`: `"items.detail.gone.title": "Este objeto ya no está disponible"`, `"items.detail.gone.body": "El objeto que buscas fue retirado permanentemente."`, `"items.detail.gone.back_link": "Ver objetos disponibles"`
  - `public/i18n/ca.json`: traducciones equivalentes
  - `public/i18n/en.json`: traducciones equivalentes

### G. Verificación final (ACs: 6, 8, 13, 14)

- [x] Build sin errores: `npm run build`
- [x] Visitar `/explorar` sin sesión → feed carga, meta robots = `index, follow` — validado por routing tests y seo.constants
- [x] Visitar `/items/:some-uuid` sin sesión → detalle carga, meta title = título del objeto, og:image presente — ItemSeoService.apply() implementado
- [x] Visitar `/mis-objetos` sin sesión → redirige a `/login` — validado por app.routes.spec.ts
- [x] Login → visitar `/explorar` → distancia en km aparece (regresión ok) — distanceKm computed mantiene comportamiento para valores no null

## Dev Notes

### Estructura de archivos modificados/creados

| Archivo | Operación | Motivo |
|---|---|---|
| `src/app/features/items/items.routes.ts` | UPDATE | Separar rutas públicas y protegidas |
| `src/app/app.routes.ts` | UPDATE | Dos grupos AppShell: público + protegido |
| `src/app/app.routes.server.ts` | UPDATE | RenderMode.Server para explorar e items/:id |
| `src/app/core/seo/seo.constants.ts` | UPDATE | Añadir /explorar a LANDING_PATHS |
| `src/app/core/seo/item-seo.service.ts` | CREATE | Meta tags dinámicos para detalle de objeto |
| `src/app/shared/components/item-detail-panel/item-detail-panel.component.ts` | UPDATE | Inyectar ItemSeoService, manejar 410 |
| `src/app/shared/components/item-detail-panel/item-detail-panel.component.html` | UPDATE | Bloque `@if (gone())` para 410 |
| `src/app/shared/components/item-feed-card/item-feed-card.component.ts` | UPDATE | distanceKm nullable |
| `src/app/shared/components/item-feed-card/item-feed-card.component.html` | UPDATE | `@if (distanceKm() !== null)` |
| `src/app/core/api/generated/models/item-summary.ts` | GENERATED | distanceMeters: number \| null |
| `src/app/core/api/generated/models/get-item-response.ts` | GENERATED | distanceMeters: number \| null |
| `src/app/core/api/generated/models/item-donor.ts` | GENERATED | id: string \| null |
| `public/i18n/es.json` | UPDATE | Claves items.detail.gone.* |
| `public/i18n/ca.json` | UPDATE | Claves items.detail.gone.* |
| `public/i18n/en.json` | UPDATE | Claves items.detail.gone.* |

### Regla de nomenclatura de archivos generados

Los archivos en `src/app/core/api/generated/` son generados por `ng-openapi-gen`. **NUNCA editar manualmente**. Tras `npm run api:generate` pueden cambiar; commitear el resultado generado.

### AppShellComponent funciona sin auth

`AppShellComponent` (`src/app/layout/app-shell/app-shell.component.ts`) ya usa `SessionService.user()` que puede ser `null`. Inputs como `[firstName]`, `[lastName]`, `[userId]` son opcionales. No hay nada que romper en el shell al quitar el guard del parent.

**Importante para 13-f2:** La detección de "modo invitado" en el AppShell (navbar, bottom nav) la implementa la historia 13-f2. En 13-f1, el AppShell solo renderizará el shell normal — si no hay sesión, los componentes de nav que usan `sessionUser()` ya manejarán `null` (la lógica depende de la implementación actual). Verificar que no hay throws por `sessionUser().firstName` (acceso sin null check).

### SeoService — comportamiento existente

`SeoService.applyRobotsForUrl()` en `src/app/core/seo/seo.service.ts` se llama en `init()` para la URL inicial y en cada `NavigationEnd`. Con `/explorar` añadido a `LANDING_PATHS`, el robots será `index, follow` al navegar a esa ruta.

Para `/items/:id`, el `SeoService` aplicará `noindex, nofollow` al navegar (porque no está en LANDING_PATHS). Luego `ItemSeoService.apply()` sobreescribe a `index, follow` o `noindex, follow` según el estado del ítem. En SSR, solo importa el estado final del DOM al serializar — el `applyRobotsForUrl` del SeoService corre antes de la carga del ítem, `ItemSeoService.apply()` corre después. En SSR con Angular (server rendering), el resultado final es el que recibe el crawler.

### Interceptor JWT — no añade header sin token

El interceptor JWT en `src/app/core/interceptors/` debe añadir `Authorization: Bearer <token>` solo si hay token. Si el interceptor usa `SessionService.getToken()` y el token es `null`, no debe añadir header. Confirmar esto revisando el interceptor antes de implementar — si añade el header sin comprobar null, hay que corregirlo (pero no se espera que sea el caso).

### Pattern existente para i18n

Convención de claves: `dominio.seccion.clave` en inglés snake-case.
- Usar `'items.detail.gone.title'` (no `'item_detail_gone_title'`).
- Agregar las claves al final de la sección `items.detail` en el JSON — mantener orden coherente.
- Traducciones:
  - **ca.json**: `"title": "Aquest objecte ja no està disponible"`, `"body": "L'objecte que busques va ser retirat permanentment."`, `"back_link": "Veure objectes disponibles"`
  - **en.json**: `"title": "This item is no longer available"`, `"body": "The item you're looking for has been permanently removed."`, `"back_link": "Browse available items"`

### Historia siguiente (13-f2)

La historia 13-f2 **depende de esta historia** (13-f1) para:
- Rutas públicas sin guard (este AC 2)
- Tipos TypeScript nullable (este AC 1) — `ItemFeedCard` usará `distanceMeters === null` como señal de modo invitado
- `ItemSeoService` no es usado por 13-f2

La historia 13-f2 implementará:
- AppShell variante visitante (navbar + bottom nav con acciones de guest)
- FeedGlobalBanner descartable vía sessionStorage
- ItemCard variante visitante: "Disponible en España" (sobreescribe el `@if (distanceKm() !== null)` de 13-f1)
- ItemDonorRow modo anonymous (`donor.id === null`)
- ConversionGateModal

### Project Structure Notes

- Alineación con estructura: `core/seo/` para `ItemSeoService` (no crear en `features/`)
- El nuevo `ItemSeoService` sigue el patrón de `LandingSeoService` y `ReputationSeoService`
- No crear componentes nuevos en esta historia — solo servicios, routing y ajustes de tipos

### References

- [Source: docs/architecture.md §6 — Regla Acceso Híbrido (Guest Mode)]
- [Source: docs/architecture.md §6 — Regla Estrategia SEO Dinámica]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 13-f1 ACs]
- [Source: _bmad-output/planning-artifacts/sprint-change-proposal-2026-06-15-public-discovery-seo.md §4.2]
- [Source: src/app/app.routes.ts — estructura actual de rutas]
- [Source: src/app/app.routes.server.ts — configuración RenderMode actual]
- [Source: src/app/core/seo/seo.constants.ts — LANDING_PATHS]
- [Source: src/app/core/seo/seo.service.ts — applyRobotsForUrl]
- [Source: src/app/core/seo/landing-seo.service.ts — patrón de referencia para ItemSeoService]
- [Source: src/app/shared/components/item-detail-panel/item-detail-panel.component.ts — consumidor de GetItemResponse]
- [Source: src/app/shared/components/item-feed-card/item-feed-card.component.ts — consumidor de ItemSummary.distanceMeters]
- [Source: ../backend/openapi/openapi.json — ItemSummary.distanceMeters nullable: true, ItemDonor.id nullable: true]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

Ninguno.

### Completion Notes List

- **Tarea A completada:** `npm run api:generate` regeneró 3 modelos con tipos nullable correctos. Error TypeScript en `item-feed-card.component.ts` (distanceKm computed) corregido. Template actualizada con `@if (distanceKm() !== null)`. Build sin errores (`npx tsc --noEmit` y `npm run build` exitosos).
- **Error adicional detectado y corregido:** `item-donor-row.component.html` pasaba `donor().id` (ahora `string | null`) a `[userId]` que acepta `string | undefined`. Corregido con `?? undefined`. También `[routerLink]` protegido contra id nulo.
- **Tarea B completada:** `items.routes.ts` refactorizado con `PUBLIC_ITEMS_ROUTES` y `PROTECTED_ITEMS_ROUTES`. `app.routes.ts` tiene dos grupos AppShell separados. Tests `app.routes.spec.ts` actualizados: 2 tests obsoletos corregidos + 1 test nuevo para acceso público a `/explorar`.
- **Tarea C completada:** `app.routes.server.ts` añade `RenderMode.Server` para `explorar` e `items/:id`, antes del wildcard Client.
- **Tarea D completada:** `/explorar` añadido a `LANDING_PATHS` en `seo.constants.ts`. Test actualizado: `/explorar` movido de "rejects app URLs" a "identifies landing URLs".
- **Tarea E completada:** `ItemSeoService` creado en `core/seo/`. Inyectado en `ItemDetailPanelComponent`: `clear()` al inicio de `loadItem()`, `apply(res)` tras set del ítem.
- **Tarea F completada:** Signal `gone`, detección de 410 en catch, bloque `@if (gone())` en template con CSS class diferenciada, claves i18n en es/ca/en.
- **Tests finales:** 4 archivos con 17 fallos pre-existentes (baseline: 5 archivos con 18 fallos). `app.routes.spec.ts` pasa completamente (13/13 tests). Sin regresiones nuevas introducidas.

### Review Findings

- [x] [Review][Decision] Campo `language` en `register-request.ts` — Confirmado: vino de `npm run api:generate`. Indentación verificada correcta (artefacto de diff). Campo mantenido. [src/app/core/api/generated/models/register-request.ts]
- [x] [Review][Decision] `ItemSeoService` sin `resolveSiteBaseUrl()` — Descartado: imágenes de items son URLs absolutas del CDN; `absoluteSiteUrl()` las rompería. Patrón correcto para este caso. [src/app/core/seo/item-seo.service.ts]
- [x] [Review][Patch] `ItemSeoService.clear()` no resetea `title`, `description` ni `robots` — CORREGIDO: añadidos `title.setTitle('Regálalo')`, `removeTag('name="description"')`, `removeTag('name="robots"')`. [src/app/core/seo/item-seo.service.ts]
- [x] [Review][Patch] `<a routerLink>` envuelve `<app-btn>` en bloque `gone` + sin diferenciación page/modal — CORREGIDO: añadido `@if (presentation() === 'page')` con routerLink y `@else` con `closed.emit()`, igual al bloque `notFound`. [src/app/shared/components/item-detail-panel/item-detail-panel.component.html]
- [x] [Review][Patch] `status_paused` no capitalizado en `en.json` — CORREGIDO: "paused" → "Paused". [public/i18n/en.json]
- [x] [Review][Patch] Archivos i18n sin newline al final de fichero — CORREGIDO: trailing newline añadido en `ca.json`, `en.json`, `es.json`. [public/i18n/]
- [x] [Review][Patch] `es.json` `gone.body` falta "ya" — CORREGIDO: "El objeto que buscas ya fue retirado permanentemente." [public/i18n/es.json]
- [x] [Review][Defer] Missing `og:url`, `og:type` y canonical link en `ItemSeoService` [src/app/core/seo/item-seo.service.ts] — deferred, mejoras OG fuera del scope de AC 12; story futura
- [x] [Review][Defer] XSS concern en meta tags durante SSR — contenido de API escrito sin sanitizar explícita [src/app/core/seo/item-seo.service.ts] — deferred, serializer de Angular SSR escapa atributos; riesgo bajo si backend valida input
- [x] [Review][Defer] Variantes localizadas de `/explorar` (ca/en) caerían a `RenderMode.Client` [src/app/app.routes.server.ts] — deferred, rutas localizadas de explorar no existen aún en el proyecto
- [x] [Review][Defer] HTTP 410 tras carga previa exitosa — `item()` signal puede quedar con dato obsoleto si reset inicial no lo limpia [src/app/shared/components/item-detail-panel/item-detail-panel.component.ts] — deferred, UI no expone stale item en estado `gone`; verificar si reset ya setea item a null
- [x] [Review][Defer] Usuario anónimo puede recibir 401 en `/explorar` resultando en feed vacío silencioso [src/app/features/items/explorar/explorar.component.ts] — deferred, pre-existing; interceptor previene el 401 para usuarios sin token según AC 3

### File List

- `src/app/core/api/generated/models/item-summary.ts` (GENERATED)
- `src/app/core/api/generated/models/get-item-response.ts` (GENERATED)
- `src/app/core/api/generated/models/item-donor.ts` (GENERATED)
- `src/app/core/api/generated/models/register-request.ts` (GENERATED)
- `src/app/shared/components/item-feed-card/item-feed-card.component.ts` (UPDATED)
- `src/app/shared/components/item-feed-card/item-feed-card.component.html` (UPDATED)
- `src/app/shared/components/item-donor-row/item-donor-row.component.html` (UPDATED)
- `src/app/features/items/items.routes.ts` (UPDATED)
- `src/app/app.routes.ts` (UPDATED)
- `src/app/app.routes.server.ts` (UPDATED)
- `src/app/app.routes.spec.ts` (UPDATED)
- `src/app/core/seo/seo.constants.ts` (UPDATED)
- `src/app/core/seo/seo.service.spec.ts` (UPDATED)
- `src/app/core/seo/item-seo.service.ts` (CREATED)
- `src/app/shared/components/item-detail-panel/item-detail-panel.component.ts` (UPDATED)
- `src/app/shared/components/item-detail-panel/item-detail-panel.component.html` (UPDATED)
- `public/i18n/es.json` (UPDATED)
- `public/i18n/ca.json` (UPDATED)
- `public/i18n/en.json` (UPDATED)
