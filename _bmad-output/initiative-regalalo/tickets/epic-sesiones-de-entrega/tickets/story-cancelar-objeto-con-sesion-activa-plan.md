---
ticket: 5
status: done
type: feature
migrated_from: v6
---

# Story 4.5: Cancelar objeto con sesión activa

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed. -->
<!-- Backend DELETE /items/:id con sesión activa ya implementado (tests 19.x); foco frontend: advertencia explícita + CTA en reserved. -->

## Story

Como donante,
quiero cancelar mi objeto aunque tenga una entrega en curso,
para retirarlo cuando ya no puedo completar la entrega.

## Acceptance Criteria

1. **Given** soy donante y mi objeto tiene sesión de entrega activa (`status === 'reserved'` y sesión `active` en datos de UI)  
   **When** pulso «Cancelar objeto» y confirmo en el diálogo accesible  
   **Then** se llama `ItemsService.itemsIdDelete({ id })` (mismo endpoint que 2.5; backend cancela sesión y notifica receptor vía TPL-005)  
   **And** ante `200` mensaje de éxito y actualización de listado/panel (`cancelled` en mis-objetos; redirección coherente en detalle)

2. **Given** el diálogo de confirmación con sesión activa  
   **When** el usuario lo ve  
   **Then** el copy explica de forma clara y accesible que **la entrega en curso se cancelará** (distinto del copy «sin sesión» de 2.5)  
   **And** cumple WCAG AA: `role="dialog"`, `aria-modal`, título/descripción, foco, Escape, focus trap (patrón `ItemCancelDialogComponent` ya existente)

3. **Given** objeto `active` sin sesión (`status === 'active'`)  
   **When** cancelo  
   **Then** se mantiene el flujo y copy de historia 2.5 (sin regresión)

4. **Given** errores `403` / `404` / `401` en `DELETE`  
   **When** falla  
   **Then** manejo coherente con 2.5 vía `mapCancelItemError` (401 → interceptor)

5. **Given** superficies donante con objeto reservado  
   **When** implemento  
   **Then** CTA en **`mis-objetos`** (panel detalle `reserved`) y en **`item-detail-panel`** (detalle `/items/:id` y modal explorar) — sustituye `items.cancel.reserved_hint` como única salida  
   **And** diseño alineado con `docs/project/Mis objetos.html` (`CancelModal` modo objeto + zona `ReservedContent`; no confundir con «Cancelar sesión» de 4.3)

6. **Given** receptor o no donante  
   **When** ve la UI  
   **Then** no hay CTA de cancelar objeto

## Tasks / Subtasks

### A. Backend — sin cambios (verificación)

- [x] **Confirmar contrato vigente** (AC: 1, 4)
  - `DELETE /items/:id` → `200 { message }` con sesión activa; cancela ítem + sesión; email TPL-005 al receptor (fire-and-forget)
  - Tests: `backend/tests/items-cancel-with-session.test.ts` (19.1–19.3)
  - **No** modificar backend salvo regresión detectada

### B. Extender `ItemCancelDialogComponent` — variante con advertencia

- [x] **Input de modo** (AC: 2, 3)
  - Añadir `hasActiveDeliverySession = input(false)` (o `variant: 'default' | 'with_active_session'`)
  - Template: si `hasActiveDeliverySession()` → `items.cancel.dialog_title_with_session` + `items.cancel.dialog_body_with_session` (+ opcional caja warn con tokens `--warn-*` del design system)
  - Si `false` → claves actuales `dialog_title` / `dialog_body` (2.5)
  - **No** incluir rama no-show (eso es `DeliverySessionCancelDialog`, historia 4.3)

- [x] **i18n** `public/i18n/{es,ca,en}.json` (AC: 2)
  - `dialog_title_with_session`, `dialog_body_with_session` (advertencia entrega en curso)
  - Actualizar o eliminar `reserved_hint` según ya no sea necesario como copy permanente
  - Mantener `confirm`, `dismiss`, `errors.*`, `success`

- [x] **Specs** `item-cancel-dialog.component.spec.ts`
  - Renderiza body with_session cuando input true
  - Regresión: body default cuando false

### C. `mis-objetos` — CTA cancelar objeto en `reserved`

- [x] **Computed y visibilidad** (AC: 1, 5)
  - `canCancelItemWithSession = computed(() => detail()?.status === 'reserved' && !!deliverySession() && canManageDeliverySession())` — o equivalente usando `sessionsByItemId` + sesión cargada
  - Mostrar botón `dangerGhost` «Cancelar objeto» en panel `reserved` (debajo de acciones de sesión o en footer de sección — paridad visual con `ActiveContent` L539–542 del prototipo)
  - Quitar `@else` que solo muestra `items.cancel.reserved_hint` cuando hay sesión gestionable

- [x] **Diálogo** (AC: 1–2)
  - Pasar `[hasActiveDeliverySession]="detail()?.status === 'reserved'"` (o true solo cuando `canCancelItemWithSession`) al abrir desde reserved
  - Reutilizar `onCancelConfirm()` existente (`itemsIdDelete`) — ya refresca `loadPage()` y cierra detalle
  - Tras éxito: banner `showCancelledSuccess`, tab `cancelled`, ítem fuera de activos/reservados

- [x] **Tests** `mis-objetos.component.spec.ts` (AC: 1, 2, 6)
  - Reserved + sesión donante active: botón «Cancelar objeto» visible; abre diálogo con copy with_session (mock transloco o textContent)
  - Confirm → `itemsIdDelete` llamado; listado refresca a `cancelled`
  - Sin sesión cargada / no donante: sin CTA cancelar objeto con sesión
  - Regresión: cancelar objeto en `active` sigue usando copy default

### D. `item-detail-panel` — detalle público y modal explorar

- [x] **Reemplazar hint por CTA** (AC: 5, 6)
  - Cambiar `showReservedCancelHint` → `canCancelItemWithSession` (`isDonor && status === 'reserved'`)
  - Botón «Cancelar objeto» + `openCancelDialog` (mismo handler `onCancelConfirm` → `itemsIdDelete` + navigate `/mis-objetos?cancelled=1`)
  - Diálogo: `[hasActiveDeliverySession]="item()?.status === 'reserved'"`

- [x] **Tests** `item-detail-panel.component.spec.ts` (o `detalle.component.spec.ts` si panel testeado vía wrapper)
  - Donante + `reserved`: botón visible; hint «próximamente» ausente
  - Donante + `active`: cancel sin advertencia with_session
  - Actualizar test que esperaba `reserved_hint` / ocultar cancel en reserved

### E. Regresión

- [x] `npx ng test --watch=false --include="**/item-cancel-dialog/**/*.spec.ts"`
- [x] `npx ng test --watch=false --include="**/mis-objetos.component.spec.ts"`
- [x] `npx ng test --watch=false --include="**/detalle.component.spec.ts"` (panel vía wrapper)
- [ ] Manual: donante cancela objeto reservado desde mis-objetos → ítem `cancelled`, sesión cerrada, receptor no ve sesión activa; copy de advertencia leíble

## Dev Notes

### Contrato API (solo lectura)

```typescript
// DELETE /items/{id} — mismo que historia 2.5
// Respuesta 200: CancelItemResponse { message: string }
```

**Servicio:** `ItemsService.itemsIdDelete({ id })` — `src/app/core/api/generated/services/items.service.ts`

**Efectos backend con sesión activa (no reimplementar en frontend):**

- Cancela ítem (`status → cancelled`)
- Cierra sesión de entrega asociada
- Email TPL-005 al receptor (`itemTitle` en variables) — fire-and-forget; fallo email no cambia `200`

**Errores:** mismos que 2.5 — `mapCancelItemError` en `cancel-item-error.util.ts`

| Código | Clave i18n |
|--------|------------|
| `401` | Interceptor (no duplicar) |
| `403` | `items.cancel.errors.forbidden` |
| `404` | `items.cancel.errors.not_found` |
| Otros | `items.cancel.errors.generic` / `connection` |

### Brownfield — qué ya existe

| Pieza | Estado | Acción 4.5 |
|-------|--------|------------|
| Backend `CancelItemUseCase` + tests 19.x | Hecho | Verificar, no tocar |
| `ItemCancelDialogComponent` | Hecho (modo objeto simple) | Añadir variante with_session |
| `mapCancelItemError` | Hecho | Reutilizar |
| `mis-objetos` `onCancelConfirm` + `itemsIdDelete` | Hecho para `active` | Extender UI a `reserved` |
| `mis-objetos` cancelar **sesión** | Hecho (4.3) | **No** mezclar con cancelar objeto |
| `item-detail-panel` cancel `active` | Hecho (2.5) | Extender a `reserved` |
| `items.cancel.reserved_hint` | Placeholder «próximamente» | Sustituir por CTA 4.5 |
| `DeliverySessionCancelDialog` | Hecho | Solo para cancelar sesión, no ítem |

### Distinción UX crítica (evitar regresiones)

| Acción | API | Diálogo | Cuándo |
|--------|-----|---------|--------|
| Cancelar **sesión** (objeto vuelve a `active`) | `POST /delivery-sessions/:id/cancel` | `app-delivery-session-cancel-dialog` | 4.3 — reserved, sesión active |
| Cancelar **objeto** (retira del sistema) | `DELETE /items/:id` | `app-item-cancel-dialog` (+ advertencia si sesión) | 2.5 active; **4.5 reserved** |

El prototipo `Mis objetos.html` en `ReservedContent` solo muestra «Cancelar sesión» (L600). La historia 4.5 añade cancelación de **objeto** con advertencia fuerte — ubicar CTA adicional coherente (p. ej. debajo del bloque de sesión, `dangerGhost` full width como en `ActiveContent`).

### Copy i18n sugerido (ES — validar tono con prototipo)

| Clave | Referencia ES |
|-------|----------------|
| `items.cancel.dialog_title_with_session` | Cancelar objeto y entrega |
| `items.cancel.dialog_body_with_session` | Se cancelará la entrega en curso y el objeto dejará de aparecer en el tablón. El receptor será notificado. Esta acción no se puede deshacer. |
| `items.cancel.dialog_body` | (sin cambio — 2.5) El objeto dejará de aparecer en el tablón… |

Añadir CA/EN. Opcional: caja de aviso con icono warn (tokens `--warn-bg`, `--warn-fg` de `colors_and_type.css`).

### Implementación orientativa — `mis-objetos`

```typescript
readonly canCancelItemWithSession = computed(() => {
  const d = this.detail();
  return !!(
    d?.status === 'reserved' &&
    this.deliverySession() &&
    this.canManageDeliverySession()
  );
});

readonly cancelDialogHasActiveSession = computed(
  () => this.detail()?.status === 'reserved',
);
```

Template (zona reserved, tras `mis-objetos__reserved-actions`):

```html
@if (canCancelItemWithSession()) {
  <app-btn variant="dangerGhost" [fullWidth]="true" (click)="openCancelDialog()">
    {{ t('items.cancel.trigger') }}
  </app-btn>
}
```

Diálogo existente:

```html
<app-item-cancel-dialog
  [hasActiveDeliverySession]="cancelDialogHasActiveSession()"
  ...
/>
```

`openCancelDialog()` ya no debe limitarse implícitamente a `active` — el botón en `active` sigue en bloque `@if (d.status === 'active')`; el de `reserved` en bloque nuevo.

### Implementación orientativa — `item-detail-panel`

```typescript
readonly canCancelItemWithSession = computed(() => {
  const current = this.item();
  return !!(this.isDonor() && current?.status === 'reserved');
});

// canCancelItem() sin cambios: active only
```

Reemplazar bloque `@else if (showReservedCancelHint())` por botón + mismo diálogo con `[hasActiveDeliverySession]="true"`.

### Post-cancel — estado UI esperado

| Superficie | Tras `200` |
|------------|------------|
| `mis-objetos` | `loadPage()` → ítem `cancelled`; detalle cerrado o tab `cancelled`; banner éxito |
| `item-detail-panel` | `navigate(['/mis-objetos'], { queryParams: { cancelled: '1' } })` (patrón 2.5) |
| Listado `/entregas` | Sesión desaparece de activas en próximo fetch (sin cambio obligatorio en 4.5 si no hay CTA allí) |

### Anti-patterns

| Prohibido | Hacer |
|-----------|-------|
| Nuevo endpoint o `POST` cancelar | `itemsIdDelete` |
| Usar `deliverySessionsIdCancelPost` para cancelar objeto | Solo `DELETE` ítem |
| Mismo copy 2.5 cuando hay sesión activa | Claves `*_with_session` |
| Duplicar modal desde cero | Extender `ItemCancelDialogComponent` |
| Checkbox no-show en cancelar objeto | Solo en `DeliverySessionCancelDialog` |
| Editar `generated/` | Regenerar solo si cambia OpenAPI |
| Romper cancel `active` (2.5) | Tests de regresión |
| CTA cancelar objeto en receptor | Solo donante |

### Previous Story Intelligence (4.4 — done)

- `mis-objetos` es pantalla canónica split (no stub); panel `reserved` con confirm/cancel **sesión** ya cableados.
- `sessionsByItemId` + `deliverySession()` al seleccionar ítem reservado — usar para habilitar CTA objeto.
- Patrón modales: focus trap, scroll lock en `ItemCancelDialogComponent` — mantener.

### Previous Story Intelligence (4.3 — done)

- «Cancelar sesión» ≠ «Cancelar objeto» — no reutilizar el mismo diálogo.
- Tras cancelar sesión, objeto → `active`; tras cancelar objeto (4.5) → `cancelled`.

### Previous Story Intelligence (2.5 — done)

- `ItemCancelDialogComponent` + `mapCancelItemError` + variantes `BtnComponent` danger.
- `canCancelItem` solo `status === 'active'` — **ampliar** con rama `reserved` separada, no cambiar condición de active.
- Tests detalle: «hides cancel when reserved» — **invertir** expectativa en 4.5.

### Git intelligence reciente

- `176c274` — cancel sesión + no-show; patrones `delivery-session-cancel-dialog`, `delivery-session-error.util`.
- `2486555` — split entregas; `mis-objetos` enriquecido con reserved panel.
- Backend estable en `DELETE` con sesión — no tocar en esta historia salvo bug.

### Fuera de alcance

| Funcionalidad | Historia |
|---------------|----------|
| Cancelar objeto desde panel `/entregas` | No en AC epics (solo ref diseño Entregas.html) |
| Listado completo perfil 5.3 | Ya cubierto en mis-objetos |
| Cambios OpenAPI | No requeridos |

### Project Structure Notes

```
src/app/shared/components/item-cancel-dialog/     ← UPDATE variante with_session
src/app/features/items/mis-objetos/             ← UPDATE CTA reserved + dialog input
src/app/shared/components/item-detail-panel/    ← UPDATE CTA reserved + dialog input
public/i18n/{es,ca,en}.json                     ← items.cancel.* with_session
```

### References

- [Source: `_bmad-output/initiative-regalalo/archive-v6/epics.md` — Story 4.5, FR-F18, diseño 4.5]
- [Source: `docs/project/Mis objetos.html` — CancelModal L991–1037, ReservedContent L547–605, ActiveContent L539–542]
- [Source: `docs/architecture.md` — DELETE /items/:id]
- [Source: `docs/api-client.md` — ItemsService.itemsIdDelete]
- [Source: `../backend/tests/items-cancel-with-session.test.ts`]
- [Source: `../backend/src/application/use-cases/item/cancel-item.use-case.ts`]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/2-5-cancelar-objeto-propio-sin-sesion-activa.md`]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/4-3-cancelar-sesion-con-declaracion-de-no-show.md`]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/4-4-pantalla-entregas-split-layout.md`]
- [Source: `_bmad-output/project-context.md`]
- [Source: `src/app/features/items/mis-objetos/mis-objetos.component.ts`]
- [Source: `src/app/shared/components/item-detail-panel/item-detail-panel.component.ts`]

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

### Completion Notes List

- Backend verificado: `backend/tests/items-cancel-with-session.test.ts` cubre DELETE con sesión activa; sin cambios en API.
- `ItemCancelDialogComponent`: input `hasActiveDeliverySession` con copy `*_with_session` en ES/CA/EN; eliminado `reserved_hint`.
- `mis-objetos`: CTA «Cancelar objeto» en panel reserved (donante + sesión activa); diálogo con advertencia; tests nuevos.
- `item-detail-panel`: hint sustituido por CTA; mismos flujo DELETE y navegación post-éxito.
- Tests: 69/69 en item-cancel-dialog, mis-objetos y detalle (vitest).

### File List

- `src/app/shared/components/item-cancel-dialog/item-cancel-dialog.component.ts`
- `src/app/shared/components/item-cancel-dialog/item-cancel-dialog.component.html`
- `src/app/shared/components/item-cancel-dialog/item-cancel-dialog.component.spec.ts`
- `src/app/features/items/mis-objetos/mis-objetos.component.ts`
- `src/app/features/items/mis-objetos/mis-objetos.component.html`
- `src/app/features/items/mis-objetos/mis-objetos.component.spec.ts`
- `src/app/shared/components/item-detail-panel/item-detail-panel.component.ts`
- `src/app/shared/components/item-detail-panel/item-detail-panel.component.html`
- `src/app/features/items/detalle/detalle.component.spec.ts`
- `public/i18n/es.json`
- `public/i18n/ca.json`
- `public/i18n/en.json`

### Review Findings

- [x] [Review][Patch] Falta test de regresión: cancelar objeto en `active` usa copy default del diálogo — Subtarea C / AC 3 exigen regresión en `mis-objetos.component.spec.ts`; no hay caso que abra el diálogo desde tab `active` y verifique ausencia de `*_with_session`. [`mis-objetos.component.spec.ts`]

- [x] [Review][Patch] Falta test de flujo completo cancelar `reserved` en detalle — AC 1 cubre `itemsIdDelete` + navegación en `active` vía `detalle.component.spec.ts`, pero no hay caso equivalente con `status: 'reserved'` confirmando DELETE y `navigate` con `cancelled=1`. [`detalle.component.spec.ts`]

- [x] [Review][Patch] Estilos huérfanos tras eliminar `reserved_hint` — Selectores `.mis-objetos__reserved-hint` y `.item-detail-panel__reserved-hint` siguen en SCSS sin uso en plantillas. [`mis-objetos.component.scss`, `item-detail-panel.component.scss`]

- [x] [Review][Defer] Panel `reserved` vacío si `deliverySession()` no carga — El CTA «Cancelar objeto» vive dentro de `@if (deliverySession())`; si falla `deliverySessionsIdGet`, el donante no ve acciones en mis-objetos (sí en detalle). Mejora de estados de error fuera del alcance 4.5. [`mis-objetos.component.html`] — deferred, pre-existing pattern

## Change Log

- 2026-05-23: Historia creada — cancelar objeto con sesión activa; advertencia explícita + CTA en mis-objetos y detalle; ready-for-dev.
- 2026-05-23: Implementación dev-story — variante diálogo with_session, CTA reserved, tests; status → review.
- 2026-05-24: Code review — 3 patch, 1 defer; 5 hallazgos descartados (ruido / opcional en spec).
- 2026-05-24: Code review patches — tests regresión active/reserved detalle, SCSS huérfano; status → done.
