---
ticket: 4
status: done
type: feature
migrated_from: v6
---

# Story 5.4: Ver mis solicitudes realizadas

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed. Fidelidad obligatoria a docs/project/Perfil.html (tab Solicitudes). -->

## Story

Como receptor,
quiero ver las solicitudes que hice y su estado,
para seguir objetos que me interesan.

## Acceptance Criteria

1. **Given** el tab «Solicitudes» dentro de `/perfil` (5.1 dejó placeholder; 5.2–5.3 implementaron Reputación y Donaciones como referencia de patrón lazy)
   **When** el usuario activa dicho tab por primera vez
   **Then** se llama `UsersService.usersMeRequestsGet()` **una sola vez** para el listado (lazy, no en `ngOnInit` del perfil)
   **And** en paralelo o en la misma activación se resuelve la **cuota del período** con la misma lógica que `request-slots.util.ts` (dos llamadas `status=pending` y `status=selected`, `limit: 50`, luego `countActiveRequestsInWindow` — patrón `item-detail-panel`)
   **And** mientras carga el listado se muestra skeleton/spinner coherente con el design system
   **And** la UI reproduce el tab `solicitudes` de `docs/project/Perfil.html`

2. **Given** la respuesta incluye solicitudes
   **When** se renderiza la lista
   **Then** aparece primero la **tarjeta de cuota** (`Perfil.html` L828–861) y debajo las filas `RequestCard` (L490–515)
   **And** cada fila muestra: miniatura placeholder 56×56, título (`itemTitle`), badge de estado de la **solicitud**, fecha localizada (`createdAt`) alineada a la derecha
   **And** **no** mostrar `itemStatus` como badge principal (solo `status` de solicitud); `itemStatus` puede usarse en navegación o tooltip futuro, no duplicar badge de objeto

3. **Given** tarjeta de cuota (obligatoria cuando hay al menos una solicitud en listado **o** `activeCount > 0`)
   **When** se renderiza
   **Then** label uppercase «Solicitudes este período» (i18n `profile.requests.quota_label`)
   **And** tres cajas 22×22 con borde/radio del prototipo; las primeras `min(activeCount, 3)` rellenas en `--primary` con check blanco SVG (L842–846)
   **And** texto «{{activeCount}} de 3 usadas» (i18n con interpolación)
   **And** si `activeCount >= 3`, chip «Cuota agotada» (`warnBg` / `warnBorder` / `warnFg`, pill `border-radius: 999`, L854–859)

4. **Given** badges de estado — mapeo API → copy visual (`Perfil.html` `STATUS_CFG` L275–283)
   **When** se renderiza el badge
   **Then** usar **solo** valores del contrato `MyRequest.status`:

   | API `status` | Label i18n (paridad prototipo) | Colores (STATUS_CFG) |
   |--------------|--------------------------------|----------------------|
   | `pending` | `profile.requests.status.pending` (ej. «pendiente») | fondo `#FEF6E7`, texto `#8F5907`, borde `#EDD090` (reservado/warn) |
   | `selected` | `profile.requests.status.selected` (ej. «seleccionado») | fondo `#F0F5F2`, texto `#224633`, borde `#B5D0C2`, dot `#3A7358` |
   | `rejected` | `profile.requests.status.rejected` → **«no seleccionado»** (L281) | fondo `#E8EAEC`, texto `#606A76`, borde `#D5D9DE` |
   | `cancelled` | `profile.requests.status.cancelled` → **«cancelado»** (L278) | fondo `#FDECEA`, texto `#7D2419`, borde `#E8A89E` |

   **And** el prototipo muestra `noshow` en mocks (L114) — **no existe** en OpenAPI; no inventar status; un no-show de entrega se refleja en reputación/historial, no como `MyRequest.status`

5. **Given** barra de filtros por estado (`all` | `pending` | `selected` | `rejected` | `cancelled`)
   **When** el usuario cambia filtro
   **Then** se vuelve a llamar `usersMeRequestsGet` con `status` omitido (`all`) o el valor correspondiente
   **And** se resetea paginación a `page: 1`
   **And** la tarjeta de cuota **no** depende del filtro del listado (siempre refleja ventana 30 días / 3 slots activos)

6. **Given** `pagination.totalPages > 1` o `requests.length < pagination.total`
   **When** el usuario pulsa «Cargar más»
   **Then** página siguiente con append sin duplicar filas (mismo patrón 5.3)

7. **Given** `requests.length === 0` (sin filtro o con filtro)
   **When** la API responde vacío
   **Then** estado vacío `Perfil.html` L823–825: icono envío (`ISend`), título «Sin solicitudes recientes», subtítulo sobre límite 3 / 30 días, CTA «Explorar objetos» → `/explorar`
   **And** **no** mostrar tarjeta de cuota en empty global (solo si `activeCount > 0` con listado vacío por filtro → cuota sí, mensaje de filtro vacío aparte)

8. **Given** clic en una fila
   **When** navego
   **Then** por defecto `Router.navigate(['/items', req.itemId])` (detalle receptor)
   **And** si `req.status === 'selected'` **y** existe sesión de entrega del usuario como `receiver` para ese `itemId` (`usersMeDeliverySessionsGet`, buscar `itemId` + `role === 'receiver'`, preferir `status === 'active'`), navegar a `/entregas/:sessionId` (AC epics)
   **And** si no hay sesión resoluble, mantener `/items/:itemId` (sin error bloqueante)

9. **Given** error de red u otro (no 401)
   **When** `usersMeRequestsGet` rechaza
   **Then** `profile.requests.error_load` + botón «Reintentar»
   **And** reintentar resetea cache del tab (`reqLoaded = false`)

10. **Given** el usuario cambia a otro tab y vuelve a «Solicitudes» sin retry ni cambio de filtro
    **When** la carga previa fue exitosa
    **Then** **no** relanzar listado ni cuota (flags `reqLoaded` / `reqQuotaLoaded`)

11. **Given** regresión tabs 5.1–5.3
    **When** implemento 5.4
    **Then** Donaciones, Reputación y Configuración siguen funcionando sin cambios de comportamiento

## Tasks / Subtasks

### A. Lógica en `PerfilComponent` (AC: 1, 5–10)

- [x] **Tipos y signals**
  - `export type RequestsFilter = 'all' | 'pending' | 'selected' | 'rejected' | 'cancelled'`
  - `reqItems = signal<MyRequest[]>([])`
  - `reqLoading`, `reqErrorKey`, `reqFilter`, `reqPage`, `reqPagination`
  - `reqActiveCount = signal(0)` — slots usados en ventana 30 días
  - `reqQuotaLoading = signal(false)` (opcional, si cuota async)
  - `private reqLoaded = false`, `private reqQuotaLoaded = false`

- [x] **`loadRequestQuota(force = false)`** (AC: 3, 5, 10)
  - Si `reqQuotaLoaded && !force` → return
  - `Promise.all([usersMeRequestsGet({ status: 'pending', limit: 50 }), usersMeRequestsGet({ status: 'selected', limit: 50 })])`
  - `reqActiveCount.set(countActiveRequestsInWindow([...pending, ...selected]))`
  - Importar desde `features/items/request-slots.util.ts` (`MONTHLY_REQUEST_LIMIT = 3` para tests/copy)

- [x] **`loadRequests(force = false, append = false)`** (AC: 1, 5–7, 9)
  - Params: `{ page, limit: 20, status? }` — omitir `status` si `all`
  - Cache: `if (!force && !append && reqLoaded) return`
  - Validar shape `{ requests, pagination }`

- [x] **`setTab`** (AC: 1, 10)
  - Si `tab === 'solicitudes'` → `loadRequestQuota()` + `loadRequests()` en paralelo

- [x] **`changeRequestsFilter` / `loadMoreRequests` / `retryRequests`** (AC: 5–6, 9)
  - Mismo patrón que `changeDonationsFilter` / `loadMoreDonations` / `retryDonations`

- [x] **`openRequest(req: MyRequest)`** (AC: 8)
  - Si `status !== 'selected'` → `/items/:itemId`
  - Si `selected` → cache opcional `Map<itemId, sessionId>` poblado en `loadRequestQuota` o mini-fetch `usersMeDeliverySessionsGet({ limit: 50 })` una vez por tab
  - Buscar sesión `receiver` + `itemId`; navigate `/entregas/:id` o fallback detalle

- [x] **`formatRequestDate(createdAt)`** — reutilizar `formatItemDate` o `Intl` (no español hardcodeado)

- [x] **`requestBadgeVariant(status)`** — retorna clase BEM `perfil__req-badge--pending|selected|rejected|cancelled` con tokens SCSS alineados a STATUS_CFG

### B. Template tab `solicitudes` (AC: 2–8)

- [x] Sustituir `perfil__coming-soon` del `@case ('solicitudes')`
- [x] Orden visual (con datos):
  1. Tarjeta cuota (`perfil__req-quota`) — flex space-between, wrap, gap 10; padding `14px 18px`; `border-radius: 12px`; `box-shadow: var(--sh1)`
  2. Filtros pills (`perfil__req-filters`) — reutilizar patrón `perfil__don-filters`; claves i18n nuevas bajo `profile.requests.filters.*` o namespace compartido
  3. Lista `perfil__req-list` gap 10
- [x] Cada fila: `<button type="button" class="perfil__req-card">` — hover border `var(--border-strong)`, shadow `sh1`→`sh2`, transition 180ms (L493–498)
- [x] Thumb placeholder 56×56 `perfil__req-thumb` + icono caja/envío SVG (prototipo usa `IBox` L500–503)
- [x] Badge pill con dot 5px (L291–292)
- [x] Fecha columna derecha `perfil__req-date` (L512)
- [x] Empty: círculo 52px `--primary-light`, icono, título, sub, CTA `routerLink="/explorar"`
- [x] Estados: loading skeleton, error+retry, empty global, empty filtro, lista, load more

### C. Estilos `perfil.component.scss` (AC: 2–4)

- [x] Prefijo `perfil__req-*`:
  - `perfil__req-quota`, `perfil__req-quota-label`, `perfil__req-quota-slots`, `perfil__req-quota-slot`, `perfil__req-quota-slot--filled`, `perfil__req-quota-text`, `perfil__req-quota-exhausted`
  - `perfil__req-card`, `perfil__req-thumb`, `perfil__req-body`, `perfil__req-title`, `perfil__req-badge`, variantes `--pending|--selected|--rejected|--cancelled`
  - `perfil__req-date`, `perfil__req-empty`, `perfil__req-filters`, `perfil__req-load-more`
- [x] Animación tab: el contenedor padre ya usa `tab-in` / `tabKey` en 5.1 — mantener

### D. Imports (AC: 2)

- [x] `MyRequest` desde generated models
- [x] `countActiveRequestsInWindow`, `MONTHLY_REQUEST_LIMIT` desde `request-slots.util.ts`
- [x] Reutilizar `BtnComponent`, `RouterLink` si aplica en empty/retry

### E. i18n (AC: 3–7)

- [x] Añadir en `public/i18n/{es,ca,en}.json` bajo `profile.requests`:
  ```json
  "requests": {
    "quota_label": "Solicitudes este período",
    "quota_used": "{{count}} de 3 usadas",
    "quota_exhausted": "Cuota agotada",
    "empty_title": "Sin solicitudes recientes",
    "empty_sub": "Tus solicitudes de objetos aparecerán aquí. Tienes hasta 3 por cada período de 30 días.",
    "empty_cta": "Explorar objetos",
    "empty_filter": "No hay solicitudes en este estado.",
    "error_load": "No se pudieron cargar tus solicitudes.",
    "retry": "Reintentar",
    "load_more": "Cargar más",
    "filters": {
      "all": "Todas",
      "pending": "Pendientes",
      "selected": "Seleccionadas",
      "rejected": "No seleccionadas",
      "cancelled": "Canceladas"
    },
    "status": {
      "pending": "pendiente",
      "selected": "seleccionado",
      "rejected": "no seleccionado",
      "cancelled": "cancelado"
    },
    "delivery_link_aria": "Ver entrega de {{title}}"
  }
  ```
- [x] `ca` y `en`: traducción real
- [x] Eliminar uso UI de `profile.tabs.coming_soon_requests` (puede quedar en JSON sin uso)

### F. Tests `perfil.component.spec.ts` (AC: 1–11)

- [x] Mock `usersMeRequestsGet` → lista paginada
- [x] Activar tab solicitudes → al menos 1 llamada listado + llamadas cuota (pending/selected) o contador correcto
- [x] Volver al tab → sin llamadas extra (cache)
- [x] Filtro `rejected` → 2.ª llamada con `{ status: 'rejected' }`
- [x] Cuota: mocks pending+selected en ventana → 3 cajas rellenas + chip agotado cuando `activeCount >= 3`
- [x] Badge `rejected` → texto «no seleccionado» (es)
- [x] Empty → CTA explorar
- [x] Error → retry
- [x] Clic fila `selected` con sesión mock → navigate `/entregas/:id`
- [x] Clic fila `pending` → navigate `/items/:itemId`
- [x] `load more` append
- [x] Regresión: tab donaciones sigue cargando con 1 llamada items

### Review Findings

- [x] [Review][Patch] Filtros por estado no implementados (AC 5) [`perfil.component.ts`, `perfil.component.html`] — Añadidos `RequestsFilter`, `reqFilter`, `changeRequestsFilter`, barra `perfil__req-filters` y `status` en `usersMeRequestsGet`.
- [x] [Review][Patch] Empty state por filtro ausente (AC 7) [`perfil.component.html`] — Rama `empty_filter` con `reqFilter() === 'all' && reqActiveCount() === 0` para empty global.
- [x] [Review][Patch] Cuota oculta con listado filtrado vacío y `activeCount > 0` (AC 3, 7) [`perfil.component.html`] — `showRequestQuota()` desacoplado del listado.
- [x] [Review][Patch] Fallo silencioso de cuota muestra «0 de 3» (AC 3) [`perfil.component.ts`] — En fallo de cuota no se resetea `reqActiveCount`; `reqQuotaReady` oculta tarjeta si la cuota no cargó.
- [x] [Review][Patch] `aria-label` de entrega no usado (AC 8, i18n) [`perfil.component.html`] — `requestRowAriaLabel()` en filas con sesión receiver.
- [x] [Review][Defer] Subconteo de cuota con >50 solicitudes activas en ventana [`request-slots.util.ts`] — Mismo límite `limit: 50` que `item-detail-panel`; preexistente, no introducido por 5.4.

### G. Verificación manual

- [ ] Login → `/perfil` → tab Solicitudes → listado real
- [ ] Comparar con `Perfil.html` (tweaks: `tab: 'solicitudes'`, `userState: 'activo'`)
- [ ] Cuota coherente con detalle de objeto (mismo conteo que modal solicitar)
- [ ] Fila `selected` con sesión activa → abre entrega
- [ ] Filtros y paginación
- [ ] Regresión tabs Donaciones / Reputación / Configuración

## Dev Notes

### Contrato API (solo lectura)

```typescript
// GET /users/me/requests → MyRequestsResponse
interface MyRequestsResponse {
  requests: Array<MyRequest>;
  pagination: Pagination;
}

interface MyRequest {
  id: string;
  itemId: string;
  itemTitle: string;
  itemStatus: 'active' | 'reserved' | 'completed' | 'cancelled';
  status: 'pending' | 'selected' | 'rejected' | 'cancelled';
  createdAt: string; // ISO8601
}

interface UsersMeRequestsGet$Params {
  status?: 'pending' | 'selected' | 'rejected' | 'cancelled';
  page?: number;   // default 1
  limit?: number;  // default 20, 1–50
}
```

**Método:** `UsersService.usersMeRequestsGet(params?)` — `Promise<MyRequestsResponse>`  
**Path:** `/users/me/requests`  
**No editar** `src/app/core/api/generated/`

**Cuota (ventana 30 días, máx. 3 activas):**

```typescript
// src/app/features/items/request-slots.util.ts
countActiveRequestsInWindow(requests: MyRequest[]): number;
MONTHLY_REQUEST_LIMIT = 3;
REQUEST_WINDOW_MS = 720 * 60 * 60 * 1000;
```

Solo cuentan `pending` y `selected` creadas dentro de la ventana — **igual que backend** y `item-detail-panel`.

**Sesión de entrega (AC 8):**

```typescript
// GET /users/me/delivery-sessions
interface MyDeliverySession {
  id: string;
  itemId: string;
  role: 'donor' | 'receiver';
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  // ...
}
```

Resolver `sessionId` por `itemId` + `role === 'receiver'`. Preferir `status === 'active'`; si solo hay `completed`, enlace opcional a detalle de entrega completada.

**Backend listo:** `backend/tests/users-requests.test.ts` (25.1–25.5). Sin cambios backend salvo regresión.

### Decisión: tab inline vs ruta `/profile/requests`

Epics mencionan `/profile/requests`; el proyecto usa `/perfil` con tabs (5.2, 5.3).  
**Implementar como contenido del tab `solicitudes` en `PerfilComponent`, sin ruta hija.**

### Diseño — fidelidad obligatoria a `Perfil.html`

**Fuente única de verdad visual:** `docs/project/Perfil.html` + `docs/project/colors_and_type.css`. Prohibido inventar layout, copy visible ni paleta fuera del prototipo (salvo i18n triplicada).

| Zona prototipo | Líneas | Implementación 5.4 | Detalle pixel |
|----------------|--------|---------------------|---------------|
| Tab bar | 400–418 | Ya en 5.1 | Icono `ISend` en tab Solicitudes |
| Empty solicitudes | 823–825 | AC 7 | Padding 52px 24px, icono 52px circle `--primary-light` |
| Tarjeta cuota | 828–861 | AC 3 | Card surface, label 12px uppercase letter-spacing 0.07em |
| Slots cuota | 837–848 | AC 3 | 3 cuadros 22×22, radius 6, check SVG 10×10 |
| Chip agotado | 854–859 | AC 3 | warn tokens |
| `RequestCard` | 490–515 | AC 2 | gap 14, padding 14×16, radius 12, thumb 56×8 |
| Hover card | 493–498 | AC 2 | border stronger, shadow sh2, 180ms |
| Badge dot | 291–292 | AC 4 | 5px circle + pill 11px font |
| Animación tab | 810, 20–21 | Heredado | clase `tab-in` 220ms |

**Mock `REQUESTS` del prototipo (L107–118):** estados `completed`, `rejected`, `noshow` son **demos**; el API no expone `completed` ni `noshow` en solicitudes. La implementación sigue OpenAPI; el copy «no seleccionado» cubre `rejected`.

**Miniatura:** el prototipo usa placeholder gris con icono — **no** hay imagen de ítem en `MyRequest`; no llamar a `items/:id` solo por la thumb. Placeholder obligatorio.

### Filtros y paginación

| Enfoque | Detalle |
|---------|---------|
| Refetch al cambiar `reqFilter` | Paridad 5.3 y AC epics |
| `limit: 20`, «Cargar más» | Paginación server-side |
| Cuota desacoplada del filtro del listado | AC 5 — no recalcular slots al filtrar `rejected` |

### Navegación por fila

| `status` | Destino |
|----------|---------|
| `pending`, `rejected`, `cancelled` | `/items/:itemId` |
| `selected` + sesión encontrada | `/entregas/:sessionId` |
| `selected` sin sesión | `/items/:itemId` |

No navegar a `/mis-objetos` (vista donante).

### Brownfield — reutilizar

| Pieza | Ubicación | Uso 5.4 |
|-------|-----------|---------|
| `usersMeRequestsGet` | `generated/services/users.service.ts` | Listado + filtros |
| `usersMeDeliverySessionsGet` | idem | Resolver enlace selected |
| `countActiveRequestsInWindow` | `request-slots.util.ts` | Cuota |
| Lazy tab + cache | `perfil.component.ts` `loadDonations` / `donLoaded` | `reqLoaded`, `reqQuotaLoaded` |
| Filtros pills | `perfil__don-filters` | Copiar estructura a `perfil__req-filters` |
| Carga error/retry | `perfil__rep-error`, `retryDonations` | Mismo patrón |
| Detalle ítem | `items.routes` `/items/:id` | Destino por defecto |

### Fuera de alcance

| Historia / tema | Motivo |
|-----------------|--------|
| 5.5 | Perfil público |
| Badge `noshow` en solicitudes | No existe en API |
| Editar/cancelar solicitud desde perfil | Flujos en detalle de objeto |
| Duplicar layout split de `entregas` | Solo enlace |
| `usersMeGet` adicional | Perfil ya cargado en 5.1 |

### Errores

| Código | Comportamiento |
|--------|----------------|
| 401 | Interceptor JWT |
| 400 | Reset params a defaults |
| Red / 5xx | `profile.requests.error_load` + retry |

### Project Structure Notes

```
src/app/features/profile/perfil/
  perfil.component.ts      # UPDATE — signals req*, loadRequests, loadRequestQuota, openRequest
  perfil.component.html    # UPDATE — tab solicitudes completo
  perfil.component.scss    # UPDATE — estilos RequestCard + cuota
  perfil.component.spec.ts # UPDATE — casos solicitudes
public/i18n/
  es.json, ca.json, en.json  # UPDATE — profile.requests.*
```

**No** crear `RequestCardComponent` separado en 5.4 (inline como DonationCard en 5.3).

### Referencias

- [Source: `_bmad-output/initiative-regalalo/archive-v6/epics.md` — Epic 5, Story 5.4, diseño L144, FR32]
- [Source: `docs/project/Perfil.html` — RequestCard L490–515, cuota L828–861, empty L823–825, STATUS_CFG L275–283]
- [Source: `docs/project/colors_and_type.css` — tokens]
- [Source: `docs/architecture.md` — GET /users/me/requests L622–660]
- [Source: `docs/api-client.md` — UsersService.usersMeRequestsGet]
- [Source: `src/app/features/items/request-slots.util.ts` — cuota 30 días]
- [Source: `src/app/shared/components/item-detail-panel/item-detail-panel.component.ts` — loadRequestSlots]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/5-3-ver-mis-objetos-publicados.md` — patrón lazy tab, filtros, paginación]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/5-2-ver-historial-de-reputacion.md` — cache tab]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/5-1-ver-perfil-privado.md` — shell tabs]
- [Source: `backend/tests/users-requests.test.ts` — contrato 25.x]
- [Source: `_bmad-output/project-context.md` — diseño pixel-perfect, i18n, API generada]

## Previous story intelligence

### 5.3 (donaciones — patrón directo)

- Extender `setTab`: rama `solicitudes` → `loadRequestQuota()` + `loadRequests()`.
- Signals `req*` análogos a `don*`; flags `reqLoaded` / `reqQuotaLoaded`.
- Sustituir `profile.tabs.coming_soon_requests`.
- Filtros pills y «Cargar más» ya probados en donaciones — copiar estructura HTML/SCSS.

### 5.2 / 5.1

- Tab shell y animaciones ya en `perfil.component.html`.
- No romper `loadReputation` / `loadDonations` al añadir rama solicitudes.

### 3.1 (solicitar objeto)

- Cuota debe coincidir con `item-detail-panel` (mismas dos llamadas pending/selected).
- Code review 3.1: no subcontar slots — mantener `limit: 50` en ambas.

### Epic — enlace entrega selected

- Si resolver sesión resulta frágil en v1, documentar en PR: fallback `/items/:id` siempre disponible; mejora opcional cache `deliverySessions` en memoria del tab.

## Git intelligence summary

Último trabajo perfil: tab Donaciones (5.3) en `perfil.component.*`, tests ampliados (~35), i18n `profile.donations.*`. Mantener un solo componente perfil; prefijo SCSS `perfil__req-*` paralelo a `perfil__don-*` y `perfil__rep-*`.

## Latest tech information

- **Angular 21:** signals, `OnPush`, `inject()` — sin cambios.
- **`usersMeRequestsGet`:** Promise tipada; no requiere `api:generate` salvo cambio OpenAPI.
- **Cuota:** lógica pura en `request-slots.util.ts` — importar, no duplicar constantes.

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

- Tests fallidos por `mockRejectedValueOnce` / `mockResolvedValueOnce` con llamadas paralelas de cuota (pending/selected); corregido con `mockImplementation` discriminando `params.status`.

### Completion Notes List

- Tab **Solicitudes** en `/perfil`: carga lazy con `usersMeRequestsGet` + cuota vía `countActiveRequestsInWindow` (mismo patrón que `item-detail-panel`).
- UI: tarjeta de cuota, filtros por estado, filas RequestCard, empty/error/load-more según `Perfil.html`.
- Navegación: `pending`/`rejected`/`cancelled` → `/items/:id`; `selected` con sesión `receiver` activa → `/entregas/:sessionId`.
- i18n `profile.requests.*` en es/ca/en.
- 49 tests en `perfil.component.spec.ts` (solicitudes + regresión donaciones).
- Code review 2026-05-24: filtros, empty por filtro, cuota desacoplada, fix fallo cuota, aria entrega.

### File List

- `src/app/features/profile/perfil/perfil.component.ts`
- `src/app/features/profile/perfil/perfil.component.html`
- `src/app/features/profile/perfil/perfil.component.scss`
- `src/app/features/profile/perfil/perfil.component.spec.ts`
- `public/i18n/es.json`
- `public/i18n/ca.json`
- `public/i18n/en.json`

### Change Log

- 2026-05-24: Historia 5.4 — tab Solicitudes con listado, cuota 30d, filtros, paginación y enlaces a ítem/entrega.
- 2026-05-24: Parches code review — filtros AC5, empty filtro, cuota con filtro vacío, reqQuotaReady, aria entrega.
