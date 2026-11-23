---
ticket: 2
status: done
type: feature
migrated_from: v6
---

# Story 3.2: Ver candidatos rankeados (vista donante)

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed. -->
<!-- Decisión UX 2026-05-23: prevalece flujo Mis objetos.html (split + panel inline) sobre ruta /items/:id/candidates de epics.md -->

## Story

Como donante,
quiero ver los candidatos ordenados por el sistema para mi objeto,
para elegir al receptor adecuado.

## Acceptance Criteria

1. **Given** estoy en `/mis-objetos` y selecciono un objeto mío con `status === 'active'`  
   **When** se abre el panel de detalle (split layout, prototipo L1206–1231)  
   **Then** `ItemsService.itemsIdRequestsGet({ id })` carga candidatos con `requestId`, `userId`, `reputationScore`, `distanceMeters`, `requestDate`  
   **And** la lista se muestra **en el mismo orden** que devuelve el API (sin reordenar en cliente)  
   **And** el bloque candidatos vive dentro de `ActiveContent` (L483–537), no en otra pantalla

2. **Given** no soy donante del objeto (`403` en GET requests)  
   **When** el panel intenta cargar candidatos  
   **Then** mensaje de error explícito en el panel (no confundir con lista vacía)

3. **Given** `candidates.length === 0`  
   **When** el objeto está activo  
   **Then** estado vacío del prototipo (L530–535): copy centrado en card con borde  
   **And** si `requestsPaused === true`, banner de pausa visible encima (L503–511)

4. **Given** un candidato en la lista  
   **When** pulso «Seleccionar» en su fila (`CandidateRow` L476–478)  
   **Then** se dispara el flujo de selección **en la misma página** (`handleSelect` → modal, L1129) — stub/placeholder aceptable en 3.2; el modal completo es historia 3.3

5. **Given** ningún objeto seleccionado en desktop y hay ítems en la lista  
   **When** veo la zona principal  
   **Then** hint del prototipo (L1241–1247): «Selecciona un objeto para ver los candidatos y gestionar la entrega»

6. **Given** viewport ≤ 780px (breakpoint prototipo L30–53)  
   **When** selecciono un objeto  
   **Then** el panel de detalle ocupa slide-over a pantalla completa (`detail-wrap` fixed) con botón cerrar

7. **Given** cada fila de candidato  
   **When** se renderiza  
   **Then** cumple `CandidateRow` (L428–480): rank badge, avatar iniciales, score coloreado (≥60 primary, ≥20 warn, else error), distancia km, «hace Xd» desde `requestDate`, badge «Mejor candidato» solo rank 1, botón «Seleccionar» (primary rank 1, ghost resto)

8. **Given** `reputationScore` negativo  
   **When** se muestra  
   **Then** valor numérico real (NFR-F7), p. ej. `-5`

9. **Given** donante en `/items/:id` (detalle público de su objeto)  
   **When** `status === 'active'`  
   **Then** CTA secundario navega a `/mis-objetos` con `?itemId=<id>` para abrir directamente el panel de ese objeto (mismo flujo que el prototipo, sin ruta `/candidates`)

## Tasks / Subtasks

- [x] **Completar flujo `MisObjetosComponent` (pantalla canónica)** (AC: 1–8)
  - [x] Mantener split `360px | 1fr` cuando hay detalle (`mis-objetos__split--with-detail`) — alinear con `.split-layout` L1206–1207
  - [x] En `loadDetail`: ramas HTTP para candidatos — `403` → `candidatesForbidden`; otros → `candidatesErrorKey`; **no** usar `candidates_empty` en errores
  - [x] Deep link: leer `itemId` de `queryParamMap` en `ngOnInit` → `selectItem` automático si el id existe en la lista cargada
  - [x] Lista izquierda: meta de solicitudes en fila activa (`requestCount` / «Sin solicitudes aún») — opcional si API `MyItem` no expone count; si no hay campo, omitir sin inventar dato

- [x] **`CandidateRowComponent`** (AC: 4, 7–8)
  - [x] Extraer de `mis-objetos` → `shared/components/candidate-row/`
  - [x] Inputs: `candidate`, `rank`, `last`
  - [x] Output: `select` → emite `RankedCandidate` al padre
  - [x] Iniciales desde `userId` (mismo algoritmo que `ItemDonorRowComponent`)
  - [x] Meta: `formatDistanceKm` + `requestAgoLabel(requestDate)` (reutilizar patrón `daysAgoLabel` del listado)
  - [x] Hover en fila (prototipo L430–437): fondo `#F9FAFB` / rank 1 `#F6FBF8`
  - [x] Contenedor lista: `border` + `border-radius: 10` + `overflow: hidden` (L523)

- [x] **Acción «Seleccionar» → puente a 3.3** (AC: 4)
  - [x] En `MisObjetosComponent`: `selectModalCandidate = signal<RankedCandidate | null>(null)`
  - [x] `(select)` de fila → `selectModalCandidate.set(c)`
  - [x] `@if (selectModalCandidate())` renderizar placeholder modal (título + cerrar) **o** comentario `// 3.3 SelectReceiverModal` — **sin** navegar a otra ruta
  - [x] Prohibido en 3.2: `router.navigate` a `/items/:id/select/...`

- [x] **Panel detalle — paridad `DetailPanel` + `ActiveContent`** (AC: 1, 3, 7)
  - [x] Orden del cuerpo activo: pausa → banner pausado → candidatos → cancelar (L488–541)
  - [x] Galería, descripción, chips estado/condición en header del panel (L641–680+) — ya parcialmente hecho; verificar sticky `top` y `max-height` en desktop
  - [x] Animación entrada panel: clase `slide-in` global o equivalente en SCSS (`_animations.scss` si existe)

- [x] **Enlace desde detalle donante** (AC: 9)
  - [x] `item-detail-panel`: reemplazar/enriquecer botón «Mis objetos» → `routerLink="/mis-objetos"` con `[queryParams]="{ itemId: detail.id }"` cuando `isDonor() && status === 'active'`
  - [x] No crear ruta `items/:id/candidates`

- [x] **i18n** — ampliar `items.my_objects.*` (ya existen claves base); añadir solo lo que falte:
  - [x] `select` → «Seleccionar»
  - [x] `request_ago` / `request_today` / `request_yesterday` (o reutilizar `days_*`)
  - [x] `errors.candidates_forbidden`
  - [x] `select_modal_placeholder` (solo si hay stub visual en 3.2)

- [x] **Specs**
  - [x] `candidate-row.component.spec.ts`: rank 1, score negativo, output select
  - [x] `mis-objetos.component.spec.ts`: GET candidatos al abrir detalle activo; 403 ≠ empty; click Seleccionar emite modal signal; `?itemId=` abre detalle; sin rutas `/items/:id/candidates`

### Review Findings

- [x] [Review][Decision] Deshabilitar «Seleccionar» con solicitudes pausadas — Resuelto: sí, deshabilitar mientras `requestsPaused === true`.

- [x] [Review][Patch] Deshabilitar «Seleccionar» cuando `requestsPaused === true` [candidate-row.component.ts, mis-objetos.component.html]
- [x] [Review][Patch] Modal de selección persiste al cambiar de objeto en la lista [mis-objetos.component.ts:195]
- [x] [Review][Patch] Sin botón reintentar cuando falla solo la carga de candidatos [mis-objetos.component.html:279]
- [x] [Review][Patch] Deep link `?itemId=` no ajusta pestaña activa (fila puede quedar fuera del filtro) [mis-objetos.component.ts:295]
- [x] [Review][Patch] `itemId` en URL no se sincroniza al seleccionar/cerrar detalle [mis-objetos.component.ts:195]
- [x] [Review][Patch] Modal stub usa i18n `close_detail` («Cerrar detalle») en lugar de cerrar diálogo [mis-objetos.component.html:390]
- [x] [Review][Patch] Lista de candidatos sin semántica de lista (`role="list"` / `listitem`) [mis-objetos.component.html:288]
- [x] [Review][Patch] Botón «Seleccionar» sin `aria-label` que distinga candidato/rank [candidate-row.component.html:24]
- [x] [Review][Patch] Animación `nlv-slide-in` sin `prefers-reduced-motion` [_animations.scss]
- [x] [Review][Patch] Hover de fila con colores hex fijos en lugar de tokens [candidate-row.component.scss]
- [x] [Review][Patch] Defensiva: `candidates ?? []` y fecha `requestDate` inválida [mis-objetos.component.ts:327, candidate-row.component.ts:45]

- [x] [Review][Defer] Modal stub sin focus trap / Escape / lockBodyScroll (paridad `ItemCancelDialog`) — deferred, historia 3.3 reemplaza el modal
- [x] [Review][Defer] `ItemDonorRow` no reutiliza `user-initials.util.ts` — deferred, fuera de alcance 3.2
- [x] [Review][Defer] Etiquetas «hace Xd» no se actualizan con el tiempo (`Date.now()` en `computed`) — deferred, mismo patrón que `daysAgoLabel`
- [x] [Review][Defer] Tests extra: deep link inválido, banner pausa, error candidatos ≠403 — deferred, cobertura AC principal ya presente

## Dev Notes

### ⛔ Diseño obligatorio — flujo canónico `Mis objetos.html`

**Fichero único de referencia:** `docs/project/Mis objetos.html`  
**Tokens:** `docs/project/colors_and_type.css`

#### Mapa de componentes prototipo → Angular

| Prototipo | Líneas | Angular (historia 3.2) |
|---|---|---|
| `App` split layout | L1206–1231 | `mis-objetos.component.html` `.mis-objetos__split` |
| `ItemList` / `ItemRow` | L342–426 | Lista izquierda existente |
| `DetailPanel` | L634–680+ | `.mis-objetos__detail` |
| `ActiveContent` | L483–541 | Sección `status === 'active'` |
| `CandidateRow` | L428–480 | `CandidateRowComponent` |
| Hint sin selección | L1241–1247 | `.mis-objetos__select-hint` (ya existe) |
| `SelectModal` | L901–979 | **Historia 3.3** — solo wire `selectModalCandidate` en 3.2 |
| Mobile slide-over | L30–53 | Media query en `mis-objetos.component.scss` L676+ |

#### Flujo de interacción (reproducir exactamente)

```
/mis-objetos
  → FilterTabs (Todos | Activos | …)
  → Click fila ItemRow
      → split 360px + panel (slide-in)
      → si active: GET /items/:id/requests
          → lista CandidateRow[] | empty | error
          → click «Seleccionar»
              → selectModal = candidate   ← 3.3 implementa SelectModal
  → Cerrar panel → selectedId = null, hint visible
```

**No hay navegación a sub-ruta de candidatos en el prototipo.**

### Reconciliación con epics.md

| Epics (texto) | Esta historia (prevalece) |
|---|---|
| Ruta `/items/:id/candidates` | **No implementar** — candidatos inline en `/mis-objetos` |
| «navega al flujo de selección (3.3)» | Abrir modal en misma página (`SelectModal`), no `router.navigate` |
| Tabla diseño 3.2 → `Mis objetos.html` | Confirma enfoque split view |

### Estado brownfield — partir de lo existente

**Ya en `mis-objetos` (~75% del prototipo activo):**
- Split list + detail, tabs, pause control, cancel dialog
- `itemsIdRequestsGet` en `loadDetail` para `status === 'active'`
- Lista candidatos sin botón Seleccionar, sin avatar, sin `requestDate`, score siempre primary
- Hint «Selecciona un objeto…» presente
- Responsive detail-wrap en SCSS

**Gaps obligatorios 3.2:**

| Gap | Acción |
|---|---|
| Sin `CandidateRow` completo | Componente compartido + avatar + tonos score + hover |
| Sin «Seleccionar» | Output → signal modal (puente 3.3) |
| Sin `requestDate` en meta | `requestAgoLabel()` |
| 403 → empty/error genérico | `candidates_forbidden` |
| Detalle donante sin deep link | `?itemId=` + queryParams en enlace |
| Ruta `/candidates` innecesaria | **No crear** |

### API — contrato exacto

**Servicio:** `ItemsService.itemsIdRequestsGet({ id })`  
**Path:** `GET /items/{id}/requests`

```typescript
interface RankedCandidate {
  requestId: string;
  userId: string;
  reputationScore: number;
  distanceMeters: number;
  requestDate: string; // ISO8601 → «hace Xd»
}
```

**Orden:** Backend `ORDER BY effective_score DESC, distance_meters ASC, request_date ASC`. UI: iterar sin `.sort()`.

| Código | UI en panel detalle |
|---|---|
| 401 | Interceptor global |
| 403 | `items.my_objects.errors.candidates_forbidden` |
| Otros | `items.my_objects.errors.candidates_load_failed` + reintentar en `retryDetail` |

### Puente a historia 3.3 (`SelectModal`)

En el prototipo, `handleSelect` (L1129) abre `SelectModal` (L1181) con el candidato elegido. En Angular 3.2:

```typescript
// mis-objetos.component.ts
readonly selectModalCandidate = signal<RankedCandidate | null>(null);

onCandidateSelect(candidate: RankedCandidate): void {
  this.selectModalCandidate.set(candidate);
}

closeSelectModal(): void {
  this.selectModalCandidate.set(null);
}
```

```html
<!-- mis-objetos.component.html — final del template -->
@if (selectModalCandidate(); as c) {
  <!-- 3.3: ItemSelectReceiverDialogComponent — stub OK en 3.2 -->
  <div role="dialog" aria-modal="true">…placeholder…</div>
}
```

### Detalle público `/items/:id` (solo enlace, no duplicar UI)

El donante **no** ve candidatos en `Explorar v3.html` / `item-detail-panel`. Desde ahí solo redirige al flujo Mis objetos:

```html
<a [routerLink]="['/mis-objetos']" [queryParams]="{ itemId: detail.id }">
  <app-btn variant="secondary" [fullWidth]="true">
    {{ t('nav.my_items') }}
  </app-btn>
</a>
```

Opcional copy: `items.detail.manage_in_my_items` si se quiere distinguir de receptor.

### Estructura de archivos (sin `candidatos/` route)

```
src/app/shared/components/candidate-row/     ← NUEVO
src/app/features/items/mis-objetos/          ← UPDATE (flujo principal)
src/app/shared/components/item-detail-panel/ ← UPDATE (queryParams itemId)
public/i18n/{es,ca,en}.json                  ← UPDATE items.my_objects.*
```

**No crear:** `features/items/candidatos/`, ruta `items/:id/candidates`, `items/:id/select/:requestId`.

### Anti-patterns (prohibido)

| Prohibido | Hacer en su lugar |
|---|---|
| Pantalla/ruta dedicada `/items/:id/candidates` | Candidatos inline en panel `mis-objetos` |
| `router.navigate` al pulsar Seleccionar | Signal + modal (3.3) |
| Reordenar candidatos en cliente | Orden del API |
| `candidates_empty` en 403/500 | Errores diferenciados |
| Duplicar CSS fila en dos features | `CandidateRowComponent` |
| Implementar `SelectModal` completo en 3.2 | Solo wire + stub; AC de canal en 3.3 |
| Editar `generated/` | `itemsIdRequestsGet` ya existe |

### Fuera de alcance

| Funcionalidad | Historia |
|---|---|
| `SelectModal` + POST select + sesión reservada | 3.3 |
| `ReservedContent`, confirmar entrega, cancelar sesión | Épica 4 / mis-objetos posterior |
| Perfil público desde fila candidato | 5.5 |
| Contador `requestCount` en listado | Solo si `MyItem` lo expone en API |

### Previous Story Intelligence

- **3.1:** Las solicitudes `POST` alimentan el GET de esta historia; no tocar flujo receptor.
- **2.6:** `ItemPauseControl` ya en panel; banner pausa L503–511 debe mostrarse cuando `requestsPaused`.
- **2.4:** Placeholder «candidatos en épica 3» en detalle → ahora deep link a `mis-objetos?itemId=`.

### Testing

```bash
npx ng test --watch=false --include="src/app/shared/components/candidate-row/**/*.spec.ts"
npx ng test --watch=false --include="src/app/features/items/mis-objetos/**/*.spec.ts"
```

**Casos mínimos:**
- Abrir detalle activo → `itemsIdRequestsGet` llamado; orden de filas = orden mock API
- 403 → texto forbidden, lista vacía **no** mostrada como «sin solicitudes»
- Click Seleccionar → `selectModalCandidate()` no null
- `?itemId=uuid` → panel abierto tras `loadPage`
- No existe navegación a `/items/x/candidates` en ningún test

### References

- [Source: `docs/project/Mis objetos.html` — flujo App, ActiveContent, CandidateRow, SelectModal wire]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/epics.md` — Story 3.2, FR-F13, UX-DR6]
- [Source: `docs/architecture.md` — GET /items/:id/requests]
- [Source: `src/app/features/items/mis-objetos/` — implementación parcial a completar]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/3-1-solicitar-un-objeto-desde-el-detalle.md]

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

### Completion Notes List

- Vista donante de candidatos completada en `/mis-objetos` (split 360px + panel inline), sin ruta `/candidates`.
- `CandidateRowComponent` con rank, avatar/iniciales, score tonificado, distancia, antigüedad de solicitud y botón Seleccionar.
- Errores HTTP diferenciados (403 forbidden vs empty); deep link `?itemId=`; banner de pausa; modal stub para historia 3.3.
- Enlace desde detalle donante activo → `/mis-objetos?itemId=`.
- Tests: 13/13 en candidate-row + mis-objetos (suite global: 2 fallos preexistentes en landing).

### File List

- src/app/shared/components/candidate-row/candidate-row.component.ts
- src/app/shared/components/candidate-row/candidate-row.component.html
- src/app/shared/components/candidate-row/candidate-row.component.scss
- src/app/shared/components/candidate-row/candidate-row.component.spec.ts
- src/app/core/utils/user-initials.util.ts
- src/app/features/items/mis-objetos/mis-objetos.component.ts
- src/app/features/items/mis-objetos/mis-objetos.component.html
- src/app/features/items/mis-objetos/mis-objetos.component.scss
- src/app/features/items/mis-objetos/mis-objetos.component.spec.ts
- src/app/shared/components/item-detail-panel/item-detail-panel.component.html
- src/styles/_animations.scss
- public/i18n/es.json
- public/i18n/ca.json
- public/i18n/en.json

## Change Log

- 2026-05-23: Contexto historia 3.2 creado — candidatos rankeados vista donante (ruta dedicada + completar mis-objetos).
- 2026-05-23: Alineado al flujo `Mis objetos.html` — split view inline, modal para 3.3, sin ruta `/candidates`; deep link `?itemId=`.
- 2026-05-23: Implementación dev-story — CandidateRow, mis-objetos candidatos/403/modal stub, deep link, i18n, tests.
- 2026-05-23: Code review — 11 patches aplicados (pausa deshabilita selección, modal/query sync, retry candidatos, a11y, tokens, reduced-motion).
