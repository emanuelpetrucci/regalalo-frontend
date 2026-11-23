---
ticket: 3
status: done
type: feature
migrated_from: v6
---

# Story 5.3: Ver mis objetos publicados

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed. -->

## Story

Como donante,
quiero listar los objetos que publiqué filtrados por estado,
para gestionar mi actividad como donante.

## Acceptance Criteria

1. **Given** el tab «Donaciones» dentro de `/perfil` (5.1 creó placeholder; 5.2 ya implementó tab Reputación como referencia)
   **When** el usuario activa dicho tab por primera vez
   **Then** se llama `UsersService.usersMeItemsGet()` **una sola vez** (lazy, no en `ngOnInit` del perfil)
   **And** mientras carga se muestra skeleton/spinner coherente con el design system
   **And** los datos se renderizan según `DonationCard` de `Perfil.html`

2. **Given** la respuesta incluye ítems
   **When** se renderiza la lista
   **Then** cada fila muestra: miniatura (primera imagen o placeholder 56×56), título, badge de estado, condición, fecha relativa/localizada y chevron
   **And** si `degradedAt !== null` se muestra indicador «degradado» (prioridad sobre badge de `status`, paridad prototipo L469)
   **And** si `requestsPaused === true` y `status === 'active'` se muestra sufijo «· pausadas» (coherente con historia 2.6 / `mis-objetos`)
   **And** **no** inventar `requestCount` — `MyItem` no expone ese campo

3. **Given** barra de filtros por estado (`all` | `active` | `reserved` | `completed` | `cancelled`)
   **When** el usuario cambia filtro
   **Then** se vuelve a llamar `usersMeItemsGet` con `status` omitido (`all`) o con el valor correspondiente
   **And** se resetea paginación a `page: 1`
   **And** los contadores de cada filtro reflejan el total devuelto en la última carga sin filtro **o** se calculan en cliente si se opta por cargar `limit: 50` una vez (ver Dev Notes — preferir refetch por filtro para alinear con AC de epics)

4. **Given** `pagination.totalPages > 1` o `items.length < pagination.total`
   **When** el usuario pulsa «Cargar más»
   **Then** se solicita la página siguiente (`page + 1`, mismo `limit` y `status`) y se **añaden** ítems sin duplicar

5. **Given** `items.length === 0` (sin filtro o con filtro activo)
   **When** la API responde vacío
   **Then** estado vacío de `Perfil.html` L813–815: título + subtítulo + CTA «Publicar objeto» → `/mis-objetos/publicar`
   **And** si el filtro no es `all`, mensaje específico de filtro vacío (i18n)

6. **Given** clic en una fila de ítem
   **When** navego
   **Then** `Router.navigate(['/mis-objetos'], { queryParams: { itemId: item.id } })` para abrir gestión donante (candidatos, pausa, entrega) — **no** solo `/items/:id` salvo que el ítem ya no exista en mis-objetos

7. **Given** error de red u otro (no 401)
   **When** `usersMeItemsGet` rechaza
   **Then** mensaje accesible `profile.donations.error_load` + botón «Reintentar»
   **And** reintentar fuerza recarga ignorando cache del tab

8. **Given** el usuario cambia a otro tab y vuelve a «Donaciones» sin haber cambiado filtro ni forzado retry
   **When** la carga previa fue exitosa
   **Then** **no** se relanza la petición (cache en signal + flag `donLoaded`)

9. **Given** el usuario pulsa «Reintentar» tras error
   **When** la petición anterior falló
   **Then** sí se relanza la petición (`loadDonations(true)`)

## Tasks / Subtasks

### A. Lógica en `PerfilComponent` (AC: 1, 3–5, 7–9)

- [x] **Tipos y signals** (AC: 1, 3, 8)
  - `export type DonationsFilter = 'all' | 'active' | 'reserved' | 'completed' | 'cancelled'`
  - `donItems = signal<MyItem[]>([])`
  - `donLoading = signal(false)`
  - `donErrorKey = signal<string | null>(null)`
  - `donFilter = signal<DonationsFilter>('all')`
  - `donPage = signal(1)`
  - `donPagination = signal<Pagination | null>(null)`
  - `private donLoaded = false` (reset en retry y al cambiar filtro)

- [x] **`loadDonations(force = false, append = false)`** (AC: 1, 3–5, 7–9)
  - Params: `{ page: donPage(), limit: 20, status?: ... }` — omitir `status` si `donFilter() === 'all'`
  - Si `!force && !append && donLoaded` → return
  - En éxito: `donItems.set(append ? [...prev, ...res.items] : res.items)`; `donPagination.set(res.pagination)`; `donLoaded = true`
  - En error: `donErrorKey.set('profile.donations.error_load')`

- [x] **Activación lazy** (AC: 1, 8)
  - En `setTab(tab)`: si `tab === 'donaciones'` → `loadDonations()`
  - No llamar en `ngOnInit`

- [x] **`changeDonationsFilter(filter)`** (AC: 3)
  - `donFilter.set(filter)`; `donPage.set(1)`; `donLoaded = false`; `loadDonations(true)`

- [x] **`loadMoreDonations()`** (AC: 4)
  - Incrementar `donPage`; `loadDonations(true, append: true)`

- [x] **`openDonationItem(item)`** (AC: 6)
  - `router.navigate(['/mis-objetos'], { queryParams: { itemId: item.id } })`

- [x] **Helpers** (AC: 2)
  - `isDegraded(item)`: `item.degradedAt != null`
  - `showPausedSuffix(item)`: `item.requestsPaused && item.status === 'active'` (misma regla que `mis-objetos`)
  - `formatItemDate(createdAt)`: reutilizar patrón `daysAgoLabel` de `mis-objetos` o `Intl` — **no** hardcodear español

### B. Template tab `donaciones` (AC: 2–6)

- [x] Sustituir bloque `perfil__coming-soon` del `@case ('donaciones')`
- [x] Fila de filtros (pills/buttons) con `role="tablist"` o grupo de botones con `aria-pressed` — reutilizar claves `items.my_objects.tabs.*` para labels de filtro
- [x] Estados: loading skeleton, error+retry, empty (global vs filtro), lista
- [x] Cada `DonationCard` como `<button type="button">` accesible (Enter/Space), hover border/shadow según prototipo L450–456
- [x] Miniatura: `NgOptimizedImage` si `images[0]`, else placeholder SVG (mismo icono caja que prototipo)
- [x] Badges: `app-item-status-badge` si no degradado; si degradado, badge muted con `items.explore.degraded_badge` (o clave `profile.donations.degraded_badge` si se prefiere namespace perfil)
- [x] `app-item-condition-chip` para condición
- [x] CTA vacío: `routerLink="/mis-objetos/publicar"` + `app-btn`
- [x] Botón «Cargar más» visible solo si hay más páginas

### C. Estilos `perfil.component.scss` (AC: 2)

- [x] Clases nuevas (prefijo `perfil__don-`):
  - `perfil__don-filters`, `perfil__don-filter`, `perfil__don-filter--active`
  - `perfil__don-list`, `perfil__don-card`, `perfil__don-thumb`, `perfil__don-body`, `perfil__don-meta`, `perfil__don-date`, `perfil__don-chevron`
  - `perfil__don-degraded-badge`, `perfil__don-paused-suffix`
  - `perfil__don-empty`, `perfil__don-load-more`
  - Paridad visual: card `border-radius: 12px`, `padding: 14px 16px`, gap 14, sombra `var(--sh1)` / hover `var(--sh2)`

### D. Imports del componente (AC: 2)

- [x] Añadir a `imports` de `PerfilComponent`: `NgOptimizedImage`, `RouterLink`, `ItemStatusBadgeComponent`, `ItemConditionChipComponent`, `BtnComponent` (si se usa en empty/retry)

### E. i18n (AC: 5, 7)

- [x] Añadir en `public/i18n/{es,ca,en}.json` bajo `profile.donations`:
  ```json
  "donations": {
    "empty_title": "Todavía no has donado ningún objeto",
    "empty_sub": "Cuando publiques algo, aparecerá aquí con su estado e historial de solicitudes.",
    "empty_cta": "Publicar objeto",
    "empty_filter": "No hay objetos en este estado.",
    "error_load": "No se pudo cargar tus donaciones.",
    "retry": "Reintentar",
    "load_more": "Cargar más",
    "degraded_badge": "degradado"
  }
  ```
  - Reutilizar `items.my_objects.tabs.*` para filtros (no duplicar)
  - `ca` y `en`: traducción real

### F. Tests `perfil.component.spec.ts` (AC: 1–9)

- [x] Mock `usersMeItemsGet` → `Promise.resolve({ items: [...], pagination: { total, page, limit, totalPages } })`
- [x] Activar tab donaciones → **1** llamada API
- [x] Volver al tab → sigue en **1** llamada (cache)
- [x] Cambio filtro `active` → 2.ª llamada con `{ status: 'active', page: 1, limit: 20 }`
- [x] `requestsPaused: true`, `status: 'active'` → texto «pausadas» / suffix visible
- [x] `degradedAt` set → badge degradado visible; **no** badge status primario encima
- [x] Lista vacía → empty + CTA publicar
- [x] Error → retry → 2.ª llamada
- [x] Clic fila → `Router` navigate a `/mis-objetos` con `itemId`
- [x] `load more` → append sin perder ítems previos
- [x] Ampliar `esPartial` con `profile.donations.*` y mock `MyItem`

### G. Verificación manual

- [x] Login → `/perfil` → tab Donaciones → listado real
- [x] Filtros por estado coherentes con BD
- [x] Ítem pausado muestra sufijo
- [x] Clic ítem → `/mis-objetos?itemId=...` abre panel correcto
- [x] Comparar con `Perfil.html` (`tab: 'donaciones'`, `userState: 'activo'`)
- [x] Regresión: tabs Reputación y Configuración siguen funcionando

### Review Findings

- [x] [Review][Patch] Lista obsoleta al cambiar filtro [`perfil.component.ts:272-314`, `perfil.component.html:266`]
- [x] [Review][Patch] Fallo en «Cargar más» deja `donPage` desincronizado sin feedback [`perfil.component.ts:207-216`, `308-311`]
- [x] [Review][Patch] Respuestas API fuera de orden al cambiar filtro rápido [`perfil.component.ts:272-314`]
- [x] [Review][Patch] Filtros usan `role="tablist"` sin `tabpanel` asociado [`perfil.component.html:247-263`]
- [x] [Review][Defer] Contadores numéricos en pills de filtro — opcional v1 según story [`perfil.component.html:247-263`] — deferred, AC3 explícitamente opcional

## Dev Notes

### Contrato API (solo lectura)

```typescript
// GET /users/me/items → MyItemsResponse
interface MyItemsResponse {
  items: Array<MyItem>;
  pagination: Pagination;
}

interface MyItem {
  id: string;
  title: string;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  status: 'active' | 'reserved' | 'completed' | 'cancelled';
  degradedAt: string | null;
  images: Array<string>;
  createdAt: string;
  completedAt: string | null;
  requestsPaused: boolean;
}

interface UsersMeItemsGet$Params {
  status?: 'active' | 'reserved' | 'completed' | 'cancelled';
  page?: number;   // default 1, ≥ 1
  limit?: number;  // default 20, 1–50
}
```

**Método:** `UsersService.usersMeItemsGet(params?)` — `Promise<MyItemsResponse>`  
**Path:** `/users/me/items`  
**No editar** `src/app/core/api/generated/`

**Backend listo:** `backend/tests/users-items.test.ts` (24.1–24.5). Sin cambios backend salvo regresión.

**FR34 imágenes:** objetos `completed`/`cancelled` antiguos pueden llegar con `images: []` — mostrar placeholder (ya soportado en `mis-objetos`).

### Decisión de diseño: tab inline vs ruta `/profile/items`

Epics mencionan ruta `/profile/items`; el proyecto usa `/perfil` con tabs (igual que 5.2 para reputación).  
**Implementar como contenido del tab `donaciones` en `PerfilComponent`, sin ruta hija.**

`/mis-objetos` sigue siendo la pantalla **completa** de gestión (split layout, candidatos, diálogos). El tab Donaciones en perfil es un **resumen navegable** hacia esa pantalla — no duplicar split layout ni lógica de selección de receptor aquí.

### Diseño — referencias obligatorias (UX-DR8)

| Zona | Fichero | Líneas | Implementación 5.3 |
|------|---------|--------|---------------------|
| `DonationCard` | `Perfil.html` | 450–486 | Fila lista en tab donaciones |
| Empty donaciones | `Perfil.html` | 813–815 | Estado vacío + CTA |
| Tabs perfil | `Perfil.html` | 400–418 | Ya en 5.1 |
| Listado donante (gestión) | `Mis objetos.html` | — | **Solo** destino de navegación; no copiar layout split |

**Tokens:** `--bg-surface`, `--border`, `--border-strong`, `--fg-muted`, `--primary`, sombras `sh1`/`sh2`.

### Filtros y paginación — estrategia recomendada

| Enfoque | Cuándo |
|---------|--------|
| Refetch al cambiar filtro con `status` query | Cumple AC epics; paginación server-side |
| `limit: 20`, `page` incremental en «Cargar más» | Evita cargar 50+ ítems de golpe en móvil |
| Cache por tab hasta cambio de filtro o retry | Paridad 5.2 (`repLoaded`) |

**Contadores de filtros (opcional v1):** si complica, mostrar solo pills sin número; si hay tiempo, cargar una vez `limit: 50` sin status para `tabCounts` en cliente (patrón `mis-objetos`) — documentar en PR si se omite.

### Brownfield — reutilizar (no reinventar)

| Pieza | Ubicación | Uso 5.3 |
|-------|-----------|---------|
| `usersMeItemsGet` | `generated/services/users.service.ts` | API |
| `MyItem` / `MyItemsResponse` | `generated/models/` | tipos |
| List row + pausa | `mis-objetos.component.ts` | `showPausedSuffix`, `daysAgoLabel`, thumb 56px |
| Lazy tab load | `perfil.component.ts` `loadReputation` | patrón `donLoaded` + `setTab` |
| Badges | `item-status-badge`, `item-condition-chip` | estado y condición |
| Degradado | `item-feed-card` / `isDegraded()` | `degradedAt != null` |
| Deep link gestión | `mis-objetos` `openDeepLinkedItem` | query `itemId` ya soportado |
| Publicar | `items.routes` | `/mis-objetos/publicar` |
| i18n tabs filtros | `items.my_objects.tabs.*` | labels all/active/… |

### Fuera de alcance

| Historia | Contenido |
|----------|-----------|
| 5.4 | Tab Solicitudes — `usersMeRequestsGet` |
| 5.5 | Perfil público |
| — | Duplicar panel split de `mis-objetos` dentro de `/perfil` |
| — | Pausar/reanudar, cancelar, seleccionar receptor desde perfil (quedan en `/mis-objetos`) |
| — | `usersMeDeliverySessionsGet` en este tab (solo necesario en mis-objetos para deadline reservado) |

### Errores

| Código | Comportamiento |
|--------|----------------|
| 401 | Interceptor JWT; componente no duplicar |
| 400 | Params inválidos — resetear a defaults |
| Red / 5xx | `profile.donations.error_load` + retry |

### Project Structure Notes

```
src/app/features/profile/perfil/
  perfil.component.ts      # UPDATE — signals don*, loadDonations, setTab, navigate
  perfil.component.html    # UPDATE — tab donaciones completo
  perfil.component.scss    # UPDATE — estilos DonationCard
  perfil.component.spec.ts # UPDATE — casos donaciones
public/i18n/
  es.json, ca.json, en.json  # UPDATE — profile.donations.*
```

**No** crear `DonationCardComponent` separado salvo extracción futura compartida con 5.5; mantener inline como 5.2 (`RepRow`).

### Referencias

- [Source: `_bmad-output/initiative-regalalo/archive-v6/epics.md` — Epic 5, Story 5.3, diseño L143, FR-F22 L172]
- [Source: `docs/project/Perfil.html` — DonationCard L450–486, empty L811–818]
- [Source: `docs/project/Mis objetos.html` — listado donante (destino navegación)]
- [Source: `docs/architecture.md` — GET /users/me/items L578–618]
- [Source: `docs/api-client.md` — UsersService.usersMeItemsGet]
- [Source: `src/app/features/items/mis-objetos/mis-objetos.component.ts` — loadPage, showPausedSuffix, daysAgoLabel]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/5-1-ver-perfil-privado.md` — tab shell, placeholder donaciones]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/5-2-ver-historial-de-reputacion.md` — patrón lazy tab + cache]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/2-6-pausar-y-reanudar-solicitudes-de-un-objeto.md` — requestsPaused]
- [Source: `backend/tests/users-items.test.ts` — contrato 24.x]
- [Source: `_bmad-output/project-context.md` — diseño, i18n, API generada]

## Previous story intelligence

### 5.2 (reputación — patrón directo)

- Extender `setTab`: añadir rama `donaciones` → `loadDonations()` igual que `reputacion` → `loadReputation()`.
- Signals dedicados por tab (`rep*` → `don*`); flag `donLoaded` análogo a `repLoaded`.
- Sustituir placeholder `coming_soon_donations` — eliminar uso de `profile.tabs.coming_soon_donations` en UI (puede quedar en JSON sin uso).

### 5.1 (perfil shell)

- `PerfilComponent` ya tiene tabs, `UsersService` inyectado, estilos base.
- 5.1 prohibió `usersMeItemsGet` — 5.3 es la primera llamada en perfil.

### Epic 2.6 / mis-objetos (listado donante)

- `requestsPaused` en `MyItem` — sufijo «· pausadas» solo con `status === 'active'`.
- Gestión completa (candidatos, pausa, cancelar) vive en `/mis-objetos` — el tab perfil solo enlaza.

### Code review / calidad

- i18n obligatorio; `TranslocoTestingModule` en specs.
- CTA reales en empty (no hint silencioso).
- `NgOptimizedImage` para thumbs con URL; placeholder si `images` vacío.

## Git intelligence summary

Último commit relevante: `feat: enhance user profile with new features and UI updates` — reputación en perfil, patrones signals + SCSS `perfil__rep-*`. Mantener convención: mismo archivo `perfil.component.*`, tests ampliados, i18n triplicada.

## Latest tech information

- **Angular 21:** standalone, signals, `OnPush`, `inject()` — sin cambios.
- **`usersMeItemsGet`:** Promise con query params tipados; no requiere `api:generate` salvo cambio OpenAPI.
- **`NgOptimizedImage`:** obligatorio para imágenes estáticas/URLs de ítem; no aplica a placeholder SVG inline.
- **Navegación:** `Router.navigate` con `queryParamsHandling` por defecto; `mis-objetos` lee `itemId` en `ngOnInit`.

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

### Completion Notes List

- Tab Donaciones en `/perfil`: carga lazy vía `usersMeItemsGet` con cache `donLoaded`, filtros por estado (refetch server-side), paginación «Cargar más» y navegación a `/mis-objetos?itemId=`.
- UI alineada con `Perfil.html` DonationCard (fila 56×56, badges, degradado, sufijo pausadas).
- 35 tests en `perfil.component.spec.ts` (10 nuevos para donaciones); todos pasan.
- Revisión diseño 2026-05-24: badges con punto (STATUS_CFG), condición como texto muted (no chip), fecha `Intl` corta, empty sin card, CTA primario Perfil.html, filtros estilo tabs subrayados.

### File List

- `src/app/features/profile/perfil/perfil.component.ts`
- `src/app/features/profile/perfil/perfil.component.html`
- `src/app/features/profile/perfil/perfil.component.scss`
- `src/app/features/profile/perfil/perfil.component.spec.ts`
- `public/i18n/es.json`
- `public/i18n/ca.json`
- `public/i18n/en.json`

### Change Log

- 2026-05-24: Historia 5.3 — tab Donaciones con listado, filtros, paginación y tests.
- 2026-05-24: Ajuste pixel-parity `Perfil.html` DonationCard + Empty (badges, condición, fecha, empty, filtros).
