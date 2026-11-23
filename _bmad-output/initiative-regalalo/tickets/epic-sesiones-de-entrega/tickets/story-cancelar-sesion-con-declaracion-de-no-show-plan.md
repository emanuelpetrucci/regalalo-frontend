---
ticket: 3
status: done
type: feature
migrated_from: v6
---

# Story 4.3: Cancelar sesión con declaración de no-show

Status: done

<!-- Validation: checklist BMad create-story aplicado. Backend POST cancel ya implementado (tests 18.x); foco frontend: cablear cancel en entrega-detalle + tests mis-objetos. -->
<!-- Correct Course 2026-05-23: Acción en panel `/entregas` (4.4 done). Reutilizar `app-delivery-session-cancel-dialog` y patrón mis-objetos/4.2. -->

## Story

Como donante,
quiero cancelar la sesión y opcionalmente declarar que el receptor no se presentó,
para cerrar el proceso y aplicar consecuencias si corresponde.

## Acceptance Criteria

1. **Given** sesión `active`, `role === 'donor'` y soy el donante autenticado  
   **When** pulso «Cancelar sesión» y confirmo en el diálogo accesible (con o sin no-show)  
   **Then** `DeliveryService.deliverySessionsIdCancelPost({ id, body: { noShow } })`  
   **And** ante `200` la UI refleja `status: 'cancelled'`, `noShowDeclared` del cuerpo y `completedAt` (vía refetch `GET` o merge de `CancelDeliveryResponse`)

2. **Given** cancelación exitosa en panel `/entregas` (split 4.4)  
   **When** termina la mutación  
   **Then** desaparecen acciones de donante activo (confirmar/cancelar)  
   **And** el listado izquierdo se refresca (`sessionUpdated` → `onSessionUpdated`)  
   **And** el badge de sesión muestra estado cancelado

3. **Given** cancelación exitosa en `mis-objetos` (panel objeto `reserved`)  
   **When** termina la mutación  
   **Then** `afterDeliverySessionMutation()` refresca ítem/sesión y el objeto vuelve a `active` en el panel (tab `active`) sin regresión del flujo ya cableado

4. **Given** `noShow: true` en el POST  
   **When** la cancelación es exitosa  
   **Then** `noShowDeclared: true` visible en detalle tras refetch (badge/copy; no inventar penalización numérica en UI)

5. **Given** sesión no `active` (`409`)  
   **When** intento cancelar  
   **Then** mensaje claro en el diálogo (no genérico silencioso) y el diálogo permanece abierto hasta dismiss

6. **Given** no soy donante (`403`) o sesión no encontrada (`404`)  
   **When** falla el POST  
   **Then** mensaje de error apropiado en el diálogo

7. **Given** `401` en POST  
   **When** falla  
   **Then** el interceptor JWT redirige a login (sin toast duplicado)

8. **Given** receptor o sesión no activa  
   **When** veo la pantalla  
   **Then** no hay botón cancelar habilitado (solo donante + `active`)

9. **Given** prototipo `Entregas.html` (`CancelModal` L737–786, CTA donante L579)  
   **When** implemento diálogo y CTA  
   **Then** reutilizo `app-delivery-session-cancel-dialog` e i18n `items.my_objects.cancel_session.*` — sin rediseñar modal ni duplicar strings

## Tasks / Subtasks

### A. Backend — sin cambios (verificación)

- [x] **Confirmar contrato vigente** (AC: 1, 5–7)
  - `POST /delivery-sessions/:id/cancel` body `{ noShow: boolean }` → `200 { status: 'cancelled', noShowDeclared, completedAt }`
  - Errores: `401`, `403`, `409`, `400` (body inválido) — ver `docs/architecture.md` §POST cancel y `backend/tests/delivery-sessions-cancel.test.ts` (18.1–18.9)
  - **No** modificar backend salvo regresión detectada en tests

### B. Mapper errores mutación (recomendado)

- [x] **Extender** `mapDeliverySessionMutationError` (AC: 5–6)
  - Opción A (mínima): mantener `confirm_conflict` para 409 en confirm **y** cancel (mensaje genérico «sesión ya no activa»)
  - Opción B (preferida, deferred 4.2): añadir `delivery.detail.errors.cancel_conflict` y parámetro opcional `action: 'confirm' | 'cancel'` o función hermana `mapDeliverySessionCancelError`
  - Spec unitario actualizado en `delivery-session-error.util.spec.ts`
  - i18n `cancel_conflict` en `public/i18n/{es,ca,en}.json` si se elige B

### C. `entrega-detalle` — implementar cancel (principal gap 4.3)

- [x] **Estado y diálogo** (AC: 1–2, 8–9)
  - Importar `DeliverySessionCancelDialogComponent`
  - Signals: `cancelOpen`, `cancelSubmitting`, `cancelErrorKey` (patrón espejo de `confirmOpen` / 4.2)
  - Botón cancelar: quitar `[disabled]="true"`; `(click)="openCancelDialog()"`
  - `@if (cancelOpen()) { <app-delivery-session-cancel-dialog … /> }` al final del template (junto a confirm dialog)

- [x] **Handler POST** (AC: 1–2, 4)
  - `openCancelDialog()` / `closeCancelDialog()` — guards `showDonorActions()` y `cancelSubmitting`
  - `onCancelSessionConfirm(noShow: boolean)`:
    - `deliverySessionsIdCancelPost({ id: session.id, body: { noShow } })`
    - Éxito: cerrar diálogo solo tras `loadSession(id, { refresh: true })` exitoso + `sessionUpdated.emit()` (igual que confirm 4.2)
    - Si refetch falla: mantener diálogo cerrado o mostrar `action_failed` según patrón 4.2 post-review

- [x] **UI post-cancel** (AC: 2, 4)
  - `showDonorActions()` ya es `false` cuando `status !== 'active'` — verificar tras refetch
  - Opcional si falta paridad: banner `cancelled` donante (copy breve, tokens error/warn) — **no** bloqueante si badge + step trail suficientes

- [x] **Tests** `entrega-detalle.component.spec.ts` (AC: 1–2, 5, 8)
  - Donante+active: botón cancelar **habilitado** (actualizar test que espera `disabled: true` en segundo botón)
  - Click cancelar → abre `app-delivery-session-cancel-dialog`
  - Confirm sin no-show → mock `deliverySessionsIdCancelPost` con `{ noShow: false }` + refetch con `status: 'cancelled'`
  - Confirm con no-show → `{ noShow: true }` + `noShowDeclared: true` en sesión mock
  - POST `409` → `cancelErrorKey` mapeado + diálogo abierto
  - Receptor: sin botones de acción donante
  - Mock `deliverySessionsIdCancelPost` en `DeliveryService` del TestBed

### D. `mis-objetos` — verificar flujo existente + tests

- [x] **Ya cableado** — verificar sin reescribir (AC: 3)
  - `openCancelSessionDialog`, `onCancelSessionConfirm`, `app-delivery-session-cancel-dialog` en template
  - Tras éxito: `afterDeliverySessionMutation()` → ítem `active`, tab correcto

- [x] **Tests faltantes** `mis-objetos.component.spec.ts` (AC: 3, 5–6)
  - Mock sesión `reserved` + `deliverySessionsIdCancelPost` éxito → cierra modal, refresca, ítem `active`
  - POST `409` / `403` → error en diálogo
  - No llamar cancel si `!canManageDeliverySession()`
  - `noShow: true` envía body correcto

### E. Regresión y verificación manual

- [x] `npx ng test --watch=false --include="**/delivery/**/*.spec.ts"`
- [x] `npx ng test --watch=false --include="**/mis-objetos.component.spec.ts"`
- [x] `npx ng test --watch=false --include="**/delivery-session-error.util.spec.ts"`
- [x] Manual: donante cancela desde `/entregas` (sin y con no-show) y desde `mis-objetos` → listado/contadores actualizados; objeto `active` en mis-objetos

### Review Findings

- [x] [Review][Patch] `noShowDeclared` no es visible en el detalle tras cancelar con no-show — viola AC4; el test solo comprueba la señal del componente, no el DOM [`entrega-detalle.component.html`]
- [x] [Review][Patch] Tras POST cancel exitoso, si `loadSession(..., { refresh: true })` falla la sesión en memoria puede seguir `active` y no se emite `sessionUpdated` — viola AC1/AC2; la spec permite merge de `CancelDeliveryResponse` [`entrega-detalle.component.ts:313-341`]
- [x] [Review][Patch] El test de no-show debería afirmar copy/badge visible en plantilla, no solo `session()?.noShowDeclared` [`entrega-detalle.component.spec.ts:419-447`]
- [x] [Review][Patch] `mapDeliverySessionCancelError` no mapea HTTP 400 (body inválido documentado en arquitectura) a clave específica [`delivery-session-error.util.ts:71-91`]
- [x] [Review][Defer] Sin focus trap / foco inicial en modales delivery — patrón previo a 4.3, compartido con confirm dialog — deferred, pre-existing

## Dev Notes

### Contrato API (solo lectura)

```typescript
// POST /delivery-sessions/{id}/cancel
interface CancelDeliveryRequest {
  noShow: boolean; // obligatorio — JSON boolean, no string
}

interface CancelDeliveryResponse {
  status: 'cancelled';
  noShowDeclared: boolean;
  completedAt: string; // ISO8601
}
```

Cliente generado: `DeliveryService.deliverySessionsIdCancelPost({ id, body: { noShow } })`.

**Efectos backend (no reimplementar en frontend):** ítem asociado → `active`, `reserved_at = null`; si `noShow === true`, penalización reputación receptor (FR-F17).

### Brownfield — qué ya existe

| Pieza | Estado | Acción 4.3 |
|---|---|---|
| Backend `cancelDelivery` + tests 18.x | Hecho | Verificar, no tocar |
| `DeliverySessionCancelDialogComponent` | Hecho (`shared/components/`) | Reutilizar en entrega-detalle |
| `mis-objetos` POST cancel | Hecho | Tests + errores 409 |
| `entrega-detalle` botón cancelar | **Stub disabled** (4.2) | **Implementar** |
| `entrega-detalle` confirm | Hecho (4.2) | No regresionar |
| `entregas` split + `sessionUpdated` | Hecho (4.4) | Cancel debe emitir `sessionUpdated` |
| i18n `items.my_objects.cancel_session.*` | Hecho es/ca/en | Reutilizar en diálogo |
| `mapDeliverySessionMutationError` | 409 → `confirm_conflict` | Opcional clave `cancel_conflict` |

### Flujo UX (Entregas.html)

```
DonorDetail (active) → CTA «Cancelar sesión»
  → CancelModal (checkbox no-show en prototipo)
  → POST cancel { noShow }
  → UI cancelled (badge; acciones ocultas)
```

**Nota implementación:** El diálogo Angular actual usa dos CTAs («Cancelar sesión» = `noShow: false`, «Declarar no-show y cancelar» = `noShow: true`) en lugar del checkbox único del prototipo. **No refactorizar a checkbox en 4.3** salvo que code review exija paridad; el contrato API y AC se cumplen.

Prototipo: `docs/project/Entregas.html` — `CancelModal` L737–786, CTA L579. Estilos: `_delivery-session-dialog.scss`.

### Implementación entrega-detalle (orientación)

```typescript
// Patrón espejo de mis-objetos.component.ts L411-453 y confirm 4.2 L245-288
openCancelDialog(): void {
  if (!this.showDonorActions()) return;
  this.cancelErrorKey.set(null);
  this.cancelOpen.set(true);
}

async onCancelSessionConfirm(noShow: boolean): Promise<void> {
  const s = this.session();
  if (!s || this.cancelSubmitting()) return;
  this.cancelSubmitting.set(true);
  this.cancelErrorKey.set(null);
  try {
    await this.deliveryApi.deliverySessionsIdCancelPost({
      id: s.id,
      body: { noShow },
    });
    const refreshed = await this.loadSession(s.id, { refresh: true });
    if (refreshed) {
      this.cancelOpen.set(false);
      this.sessionUpdated.emit();
    } else {
      this.cancelErrorKey.set('delivery.detail.errors.action_failed');
    }
  } catch (err) {
    if (err instanceof HttpErrorResponse && err.status === 401) return;
    this.cancelErrorKey.set(mapDeliverySessionMutationError(err).errorKey);
  } finally {
    this.cancelSubmitting.set(false);
  }
}
```

Bindings diálogo (igual que mis-objetos):

```html
@if (cancelOpen()) {
  <app-delivery-session-cancel-dialog
    [submitting]="cancelSubmitting()"
    [errorKey]="cancelErrorKey()"
    (confirmed)="onCancelSessionConfirm($event)"
    (dismissed)="closeCancelDialog()"
  />
}
```

### Post-cancel — estado UI esperado

| Campo sesión | Valor |
|---|---|
| `status` | `cancelled` |
| `noShowDeclared` | `true` o `false` según POST |
| `completedAt` | ISO del API |
| `contactChannel` / `sharedContactChannel` | `null` (sesión no active) |
| `showDonorActions()` | `false` |

### Anti-patterns

| Prohibido | Hacer |
|---|---|
| Nuevo modal desde cero | `app-delivery-session-cancel-dialog` |
| `HttpClient` manual a `/cancel` | `DeliveryService.deliverySessionsIdCancelPost` |
| Duplicar i18n cancel en `delivery.detail.*` | Reutilizar `items.my_objects.cancel_session.*` |
| Editar `core/api/generated/` | Regenerar solo si cambia OpenAPI |
| Olvidar `sessionUpdated.emit()` en panel | Refrescar listado `/entregas` |
| Implementar cancel objeto (4.5) | Solo sesión de entrega |

### Previous Story Intelligence (4.2)

- Confirm en `entrega-detalle` con refetch `{ refresh: true }` sin flicker loading global.
- Diálogo solo se cierra tras refetch exitoso (review patch).
- Mapper 409 compartido; deferred sugiere clave distinta para cancel — valorar en B.
- Tests actualizan expectativa segundo botón `disabled: true` → habilitar en 4.3.

### Previous Story Intelligence (4.4)

- Panel embebido: `[panelMode]="true"`, `(sessionUpdated)="onSessionUpdated()"`.
- Deep link `/entregas/:id` usa misma shell; cancel opera en panel, no navega.

### Git intelligence (reciente)

- `dc8b087` — confirm flow + `mapDeliverySessionMutationError`
- `2486555` — panel entregas split
- `633cd7f` — diálogos delivery (confirm/cancel componentes; cancel solo wired en mis-objetos)

### Testing

```bash
cd regalalo
npx ng test --watch=false --include="src/app/features/delivery/**/*.spec.ts"
npx ng test --watch=false --include="src/app/features/items/mis-objetos/mis-objetos.component.spec.ts"
npx ng test --watch=false --include="src/app/features/delivery/delivery-session-error.util.spec.ts"
```

Backend (sanity, no debería romperse):

```bash
cd ../backend && npx vitest run tests/delivery-sessions-cancel.test.ts
```

### References

- [Source: `_bmad-output/initiative-regalalo/archive-v6/epics.md` — Story 4.3, FR-F17, diseño `Entregas.html`]
- [Source: `docs/architecture.md` — POST `/delivery-sessions/:id/cancel`]
- [Source: `docs/project/Entregas.html` — CancelModal, DonorDetail CTA cancel]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/4-2-confirmar-entrega-completada.md`]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/4-4-pantalla-entregas-split-layout.md`]
- [Source: `backend/tests/delivery-sessions-cancel.test.ts`]
- [Source: `src/app/features/items/mis-objetos/mis-objetos.component.ts` — `onCancelSessionConfirm`]
- [Source: `src/app/shared/components/delivery-session-cancel-dialog/`]
- [Source: `_bmad-output/initiative-regalalo/deferred-work.md` — mapper 409 cancel]

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Debug Log References

- Backend sanity: `npx vitest run tests/delivery-sessions-cancel.test.ts` — 9/9 OK
- Frontend: `npx ng test --watch=false` delivery + mis-objetos + error util — 65/65 OK

### Completion Notes List

- Implementado flujo cancel en `entrega-detalle`: botón habilitado, diálogo reutilizado, POST + refetch sin flicker, `sessionUpdated.emit()` para panel `/entregas`.
- Opción B mapper: `mapDeliverySessionCancelError` + clave i18n `delivery.detail.errors.cancel_conflict` (es/ca/en).
- `mis-objetos`: alineado cierre de diálogo tras refresh exitoso (`detail.status === 'active'`) y mapper cancel en errores.
- Tests nuevos/actualizados en entrega-detalle, mis-objetos y delivery-session-error.util.

### File List

- `src/app/features/delivery/entrega-detalle/entrega-detalle.component.ts`
- `src/app/features/delivery/entrega-detalle/entrega-detalle.component.html`
- `src/app/features/delivery/entrega-detalle/entrega-detalle.component.spec.ts`
- `src/app/features/delivery/delivery-session-error.util.ts`
- `src/app/features/delivery/delivery-session-error.util.spec.ts`
- `src/app/features/items/mis-objetos/mis-objetos.component.ts`
- `src/app/features/items/mis-objetos/mis-objetos.component.spec.ts`
- `public/i18n/es.json`
- `public/i18n/ca.json`
- `public/i18n/en.json`

## Change Log

- 2026-05-23: Historia 4.3 creada — cancelar sesión/no-show: backend listo; frontend principal en `entrega-detalle`; tests mis-objetos + mapper opcional.
- 2026-05-23: Implementación dev-story — cancel en entrega-detalle, mapper cancel_conflict, tests frontend/backend verdes; estado → review.
