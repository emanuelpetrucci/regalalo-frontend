---
ticket: 3
status: done
type: feature
migrated_from: v6
---

# Story 2.3: Listar objetos disponibles (feed geográfico)

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed. -->

## Story

Como usuario autenticado,
quiero ver objetos disponibles cerca de mí con paginación,
para descubrir qué puedo solicitar.

## Acceptance Criteria

1. **Given** la ruta protegida de exploración (`/explorar`, bajo `AppShellComponent` + `authGuard`)  
   **When** cargo la página  
   **Then** se llama `ItemsService.itemsGet({ page: 1, limit: 20 })` y se renderiza un grid de tarjetas con título, condición, distancia, imagen principal (URL directa del backend) e indicador visual si el objeto está degradado

2. **Given** `pagination.totalPages > 1` y el usuario está en una página con más resultados  
   **When** solicita la página siguiente (botón «Cargar más» o equivalente accesible)  
   **Then** se llama `itemsGet` con `page` incrementado y los nuevos ítems se **añaden** al listado (sin perder los ya cargados), respetando el orden devuelto por el backend (no degradados primero, degradados al final)

3. **Given** la lista vacía (`items.length === 0`)  
   **When** la carga termina sin error  
   **Then** se muestra estado vacío accesible (mensaje + CTA opcional a `/mis-objetos/publicar`)

4. **Given** error `401` en `itemsGet`  
   **When** el token expiró  
   **Then** `authErrorInterceptor` limpia sesión y redirige a `/login?returnUrl=...` (no manejar en el feature)

5. **Given** cada tarjeta con imagen  
   **When** se renderiza  
   **Then** usa `<img>` con `alt` descriptivo (p. ej. título del objeto); **no** usar `NgOptimizedImage` para URLs dinámicas de Storage (NFR-F6 / patrón 2.1)

6. **Given** error de red u otro HTTP distinto de `401`  
   **When** falla la carga inicial o «Cargar más»  
   **Then** se muestra banner de error reintentable sin vaciar ítems ya cargados

## Tasks / Subtasks

- [x] **Prerrequisito API (si falta `degradedAt` en listado)** — ver sección «Brecha contrato API» (AC: 1)
  - [x] Backend: añadir `degradedAt` a `itemSummarySchema`, `ListItemsResponseDto` y mapeo en `list-items.use-case.ts`
  - [x] `npm run openapi:generate` (backend) → `npm run api:generate` (frontend)
  - [x] Verificar `ItemSummary.degradedAt` en `generated/models/item-summary.ts`

- [x] Implementar feed en `ExplorarComponent` (AC: 1–6)
  - [x] Reemplazar stub actual por template + SCSS portados de `Explorar v3.html` (header «Tablón», subtítulo radio 50 km, grid, empty state)
  - [x] Estado: `items`, `page`, `loading`, `loadingMore`, `error`, `hasMore` (signals)
  - [x] `ngOnInit` / `effect` inicial: `loadPage(1, append: false)`
  - [x] Botón «Cargar más» visible si `page < pagination.totalPages`

- [x] Crear `ItemFeedCardComponent` (recomendado en `shared/components/item-feed-card/`) (AC: 1, 5)
  - [x] Inputs: `item` (`ItemSummary` + `degradedAt` cuando exista)
  - [x] Imagen: `images[0]` con fallback placeholder (icono, sin imagen rota)
  - [x] Chip condición + chip distancia (`distanceMeters` → km)
  - [x] Badge/overlay degradado: opacidad 0.7 + pill «lleva tiempo aquí» si `degradedAt != null`
  - [x] `routerLink` a `/items/{{id}}` (ruta detalle en historia 2.4; enlace preparatorio OK)

- [x] Utilidad `format-distance.util.ts` (AC: 1)
  - [x] `formatDistanceKm(meters: number): string` — redondeo coherente con prototipo (`DistChip`)

- [x] i18n `items.explore.*` en `public/i18n/{es,ca,en}.json` (AC: 1, 3, 6)
  - [x] Título, subtítulo contador, condiciones, empty, errores, cargar más, alt imagen, degradado

- [x] Specs
  - [x] `explorar.component.spec.ts`: carga inicial, append página 2, vacío, error, 401 delegado al interceptor (mock)
  - [x] `item-feed-card.component.spec.ts`: alt text, degradado visible, distancia formateada

### Review Findings

- [x] [Review][Patch] Subtítulo del header oculto cuando `total === 0` [explorar.component.html:4] — Corregido: subtítulo visible con `count: 0` cuando no hay carga.
- [x] [Review][Patch] Jerarquía de encabezados en tarjetas del feed [item-feed-card.component.html:52] — `<h3>` en tarjetas.
- [x] [Review][Patch] Respuestas HTTP obsoletas en `loadPage` [explorar.component.ts:79] — `loadGeneration` invalida respuestas tardías.
- [x] [Review][Patch] `formatDistanceKm` sin acotar entradas no finitas [format-distance.util.ts:2] — Devuelve «—» si no es finito o es negativo.
- [x] [Review][Patch] Botón «Cargar más» sin estado de carga accesible [explorar.component.html:62] — `[attr.aria-busy]="loadingMore()"`.
- [x] [Review][Patch] `errorMessage()` como método en plantilla OnPush [explorar.component.ts:114] — `errorMessage` como `computed()`.
- [x] [Review][Patch] Condición redundante en `loadPage` [explorar.component.ts:84] — Eliminado `if (!append)` anidado.
- [x] [Review][Patch] Cobertura de tests incompleta [explorar.component.spec.ts] — Tests de retry, error inicial y degradado en grid.
- [x] [Review][Patch] Backend sin aserción de `degradedAt` serializado [tests/items-list.test.ts] — Test `9.1b` con `degradedAt` ISO.

## Dev Notes

### ⛔ Diseño obligatorio

**Fichero:** `docs/project/Explorar v3.html` — página principal `Tablón`: header (L711–720), toolbar (L722–757), grid `GridCard` (L307–375, L759–782), empty state (L760–771).  
**Tokens:** `docs/project/colors_and_type.css` → `src/styles.scss` / `_tokens.scss`.

| Elemento prototipo | Implementación Angular (historia 2.3) |
|---|---|
| Título «Tablón» + «N objetos · radio 50 km» | Header con Transloco + contador desde `pagination.total` |
| Barra búsqueda + chips condición | **Fuera de alcance** (no están en AC de epics; API no filtra por query) |
| Grid `repeat(auto-fill, minmax(240px, 1fr))` | Misma grid en `explorar.component.scss` |
| `GridCard`: imagen 4/3, título 2 líneas, chips, overlay degradado | `ItemFeedCardComponent` |
| Donante / `requestCount` en card | **Fuera de alcance** — no vienen en `ItemSummary` |
| Modal detalle al click | **Historia 2.4** — aquí solo `routerLink` a `/items/:id` |
| Footer del HTML | Ya cubierto por `AppShellComponent` / layout global |

### Ruta brownfield (no reinventar)

| Epics.md dice | Proyecto real | Acción dev |
|---|---|---|
| `/items` (feed principal) | `/explorar` | **Usar ruta existente** en `items.routes.ts` |
| — | `authGuard` en hijos de `AppShellComponent` | Ya protegida |

No crear ruta duplicada `/items` para el feed.

### API — contrato exacto

**Servicio:** `ItemsService.itemsGet` — `src/app/core/api/generated/services/items.service.ts`  
**Params:** `{ page?: number; limit?: number }` — default backend: page=1, limit=20  
**Respuesta:** `ListItemsResponse` → `{ items: ItemSummary[]; pagination: Pagination }`

```typescript
// Carga inicial
const res = await this.itemsApi.itemsGet({ page: 1, limit: 20 });
this.items.set(res.items);

// Cargar más
const next = await this.itemsApi.itemsGet({ page: this.page() + 1, limit: 20 });
this.items.update((prev) => [...prev, ...next.items]);
this.page.set(next.pagination.page);
```

**Campos `ItemSummary` actuales (OpenAPI):**

| Campo | Uso en UI |
|---|---|
| `id` | `routerLink`, key `@for` |
| `title` | Título card + alt imagen |
| `condition` | Chip condición (enum 4 valores) |
| `distanceMeters` | Chip distancia → km |
| `images` | Primera URL; array puede estar vacío |
| `createdAt` | Opcional: «hace X días» (prototipo); no exigido en AC |

### ⚠️ Brecha contrato API — `degradedAt` en listado

Los AC de epics exigen indicador si `degradedAt !== null`. **Hoy el listado NO expone ese campo:**

| Capa | Estado actual |
|---|---|
| `docs/architecture.md` § GET /items | Documenta `degradedAt` en cada ítem |
| `backend` `list-items.use-case.ts` | **No mapea** `degradedAt` |
| `backend` `itemSummarySchema` | **Sin** `degradedAt` |
| `ItemSummary` generado en frontend | Solo: id, title, condition, createdAt, distanceMeters, images |

**Ordenación:** el repositorio/backend ya ordena degradados al final; la UI puede confiar en el orden sin badge, pero **no puede cumplir AC#1 del epics sin el campo**.

**Acción recomendada (incluir en la misma PR o inmediatamente antes):**

1. `backend/src/openapi/schemas/item.schemas.ts` — añadir `degradedAt: z.string().datetime().nullable()` a `itemSummarySchema`
2. `backend/src/application/use-cases/item/list-items.use-case.ts` — mapear `degradedAt: item.degradedAt`
3. Regenerar OpenAPI + cliente Angular
4. En card: `opacity: 0.7` + overlay pill si `degradedAt != null` (copy prototipo: «lleva tiempo aquí»)

Si el equipo decide **solo frontend** en 2.3: implementar feed sin badge degradado y abrir deuda técnica — documentar en PR que AC de epics queda parcial hasta extensión API.

### Imágenes (NFR-F6)

- URLs absolutas de Supabase en `images[]` — consumir directamente en `<img [src]="url">`
- **Prohibido** `NgOptimizedImage` para estas URLs (dinámicas, no assets estáticos)
- `alt="{{ 'items.explore.image_alt' | transloco: { title: item.title } }}"`
- `loading="lazy"` recomendado
- Fallback si `images.length === 0`: bloque placeholder como prototipo (icono, sin `src` vacío)

### Paginación UX

- Primera carga: skeleton o spinner centrado (no flash de empty state antes de terminar)
- «Cargar más»: deshabilitar botón mientras `loadingMore`; ocultar si `page >= totalPages`
- No implementar scroll infinito salvo acuerdo — AC epics dice «siguiente página» explícita

### Estado vacío

Replicar tono de `Explorar v3.html` L760–771:

- Título: «Nada por aquí todavía» (i18n)
- Cuerpo: sin objetos en radio 50 km
- CTA: `routerLink="/mis-objetos/publicar"` con `BtnComponent` o enlace estilizado

### Errores HTTP

| Código | Manejo en feature |
|---|---|
| `401` | Interceptor global — no duplicar |
| `400` | Paginación inválida — banner + reset a página 1 |
| Red / 5xx | `items.explore.errors.load_failed` + botón reintentar |

No crear `explore-error.util.ts` salvo que el mapeo supere 2–3 claves; patrón opcional como `publish-error.util.ts`.

### Componentes compartidos existentes

| Componente | Uso |
|---|---|
| `BtnComponent` | Cargar más, CTA publicar en empty |
| `AlertBoxComponent` | Banner error global |
| `BadgeComponent` | **No reutilizar tal cual** — labels hardcodeados en español; preferir chips custom con Transloco como en publicar |

### Estructura de archivos

```
src/app/features/items/explorar/
├── explorar.component.ts       ← REEMPLAZAR stub
├── explorar.component.html
├── explorar.component.scss
└── explorar.component.spec.ts  ← NUEVO

src/app/shared/components/item-feed-card/
├── item-feed-card.component.ts   ← NUEVO
├── item-feed-card.component.html
├── item-feed-card.component.scss
└── item-feed-card.component.spec.ts

src/app/core/utils/
└── format-distance.util.ts       ← NUEVO (opcional en core/utils o features/items/)
```

**NO modificar** `src/app/core/api/generated/` manualmente.

### i18n — claves nuevas (`items.explore.*`)

Añadir en `es`, `ca`, `en`:

| Clave | ES (referencia prototipo) |
|---|---|
| `title` | Tablón |
| `subtitle` | `{{count}} objetos cerca de ti · radio 50 km` |
| `condition_all` | (no usar en 2.3 si no hay filtros) |
| `condition_new` | A estrenar |
| `condition_like_new` | Como nuevo |
| `condition_good` | Buen estado |
| `condition_fair` | Aceptable |
| `distance_km` | `{{km}} km` |
| `degraded_badge` | lleva tiempo aquí |
| `empty_title` | Nada por aquí todavía |
| `empty_body` | No hay objetos disponibles cerca de ti en este momento. |
| `empty_cta` | Publicar un objeto |
| `load_more` | Cargar más |
| `loading` | Cargando objetos… |
| `image_alt` | Foto de {{title}} |
| `errors.load_failed` | No se pudieron cargar los objetos. |
| `errors.retry` | Reintentar |

Reutilizar `items.publish.condition_*` si ya existen (evitar duplicar traducciones de condición).

### Testing

```bash
npx ng test --watch=false --include="src/app/features/items/explorar/**/*.spec.ts"
npx ng test --watch=false --include="src/app/shared/components/item-feed-card/**/*.spec.ts"
```

- `TranslocoTestingModule.forRoot` con fragmento `items.explore`
- Mock `ItemsService.itemsGet` con paginación multi-página
- Verificar que segunda carga **concatena** ítems
- Empty: mock `items: []`, `total: 0`

### Previous Story Intelligence (2.2 — ready-for-dev)

- Publicar en `/mis-objetos/publicar` con `itemsPost` — al publicar, el objeto puede aparecer en feed si está en radio del usuario.
- Claves `items.publish.condition_*` y patrón formulario/errors reutilizables.
- **No asumir** que 2.2 está merged: el feed debe funcionar con datos del backend aunque publicar siga en desarrollo.

### Previous Story Intelligence (2.1 — done)

- Imágenes del listado son URLs del servidor (distinto del picker WebP local).
- Patrones: OnPush, signals, `inject()`, specs con TranslocoTestingModule.
- Review 2.1: robustez async, `aria-live` en errores — aplicar en banner de error del feed.

### Git intelligence reciente

- `5353a1e` — convención i18n trilingüe (`items.image_picker.*`); seguir mismo patrón para `items.explore.*`
- `f2a6134` / `8e5ee10` — Transloco + rutas post-auth hacia `/explorar`
- Auth/features usan interceptores existentes; no duplicar lógica JWT

### Anti-patterns (prohibido)

| Prohibido | Hacer en su lugar |
|---|---|
| `HttpClient.get('/items')` manual | `ItemsService.itemsGet` |
| Duplicar `ItemSummary` interface | Importar de `generated/models` |
| Filtros búsqueda/condición sin AC | Deferir a historia futura |
| Modal detalle en 2.3 | Solo listado; detalle en 2.4 |
| `NgOptimizedImage` en URLs API | `<img>` + `alt` |
| Strings en template | Transloco |
| Editar `generated/` | Regenerar API |
| Mostrar `requestCount` / donor en card | No existen en API listado |

### Project Structure Notes

- Feature boundary: `features/items/explorar/` coherente con `publicar/`, `mis-objetos/`.
- Card compartida en `shared/components/item-feed-card/` para reutilizar en 2.4 si hace falta miniatura.
- Navbar y shell ya enlazan `/explorar` — no tocar rutas globales salvo añadir `/items/:id` en 2.4.

### References

- [Source: `_bmad-output/initiative-regalalo/archive-v6/epics.md` — Story 2.3, FR-F7, UX-DR5, tabla diseño 2.3]
- [Source: `docs/architecture.md` — GET /items, ordenación degradados]
- [Source: `docs/api-client.md` — ItemsService.itemsGet]
- [Source: `docs/project/Explorar v3.html` — Tablón, GridCard, empty state]
- [Source: `../backend/openapi/openapi.json` — ItemSummary (verificar degradedAt tras fix)]
- [Source: `../backend/src/application/use-cases/item/list-items.use-case.ts`]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/2-2-publicar-objeto-con-formulario-e-imagenes.md`]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/2-1-pipeline-de-compresion-de-imagenes-en-cliente.md`]
- [Source: `_bmad-output/project-context.md`]
- [Source: `src/app/features/items/explorar/explorar.component.ts` — stub actual]

## Dev Agent Record

### Agent Model Used

Composer (dev-story)

### Debug Log References

### Completion Notes List

- Feed geográfico en `/explorar` con `ItemsService.itemsGet`, paginación «Cargar más» (append) y estados loading/empty/error.
- `ItemFeedCardComponent` portado de `Explorar v3.html` (grid, chips, overlay degradado, `<img>` lazy sin NgOptimizedImage).
- Backend: `degradedAt` expuesto en `ItemSummary` del listado; OpenAPI y cliente regenerados.
- Tests: 10 nuevos (explorar, item-feed-card, format-distance); backend `items-list` actualizado.

### File List

**Backend**
- backend/src/openapi/schemas/item.schemas.ts
- backend/src/application/dtos/list-items.dto.ts
- backend/src/application/use-cases/item/list-items.use-case.ts
- backend/openapi/openapi.json
- backend/tests/items-list.test.ts

**Frontend**
- regalalo/src/app/features/items/explorar/explorar.component.ts
- regalalo/src/app/features/items/explorar/explorar.component.html
- regalalo/src/app/features/items/explorar/explorar.component.scss
- regalalo/src/app/features/items/explorar/explorar.component.spec.ts
- regalalo/src/app/shared/components/item-feed-card/item-feed-card.component.ts
- regalalo/src/app/shared/components/item-feed-card/item-feed-card.component.html
- regalalo/src/app/shared/components/item-feed-card/item-feed-card.component.scss
- regalalo/src/app/shared/components/item-feed-card/item-feed-card.component.spec.ts
- regalalo/src/app/core/utils/format-distance.util.ts
- regalalo/src/app/core/utils/format-distance.util.spec.ts
- regalalo/src/app/core/api/generated/models/item-summary.ts
- regalalo/public/i18n/es.json
- regalalo/public/i18n/en.json
- regalalo/public/i18n/ca.json

### Change Log

- 2026-05-22: Historia 2.3 — feed Tablón en `/explorar`, tarjetas, i18n trilingüe, `degradedAt` en API de listado.
