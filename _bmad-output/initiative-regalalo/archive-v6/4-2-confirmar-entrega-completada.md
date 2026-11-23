# Story 4.2: Confirmar entrega completada

Status: done

<!-- Validation: checklist BMad create-story aplicado. Backend POST confirm ya implementado; foco frontend: cablear flujo en entrega-detalle + endurecer mis-objetos + tests. -->
<!-- Correct Course 2026-05-23: Cierre UX en /entregas bloqueado hasta 4.4 (split Entregas.html). POST/diálogo reutilizables en panel. Ver sprint-change-proposal-2026-05-23.md -->

## Story

Como donante,
quiero confirmar que la entrega se completó,
para cerrar la sesión y actualizar reputación.

## Acceptance Criteria

1. **Given** sesión `active`, `role === 'donor'` y soy el donante autenticado  
   **When** pulso «Confirmar entrega realizada» y confirmo en el diálogo accesible  
   **Then** `DeliveryService.deliverySessionsIdConfirmPost({ id })` sin body  
   **And** ante `200` la UI refleja `status: 'completed'`, `donorConfirmed: true` y `completedAt` del cuerpo o de un `GET` posterior

2. **Given** confirmación exitosa en `/entregas/:id`  
   **When** vuelve la vista  
   **Then** desaparecen acciones de donante activo (confirmar/cancelar)  
   **And** se muestra banner/paso «Entrega confirmada» coherente con `Entregas.html` (DonorDetail completado)

3. **Given** confirmación exitosa en `mis-objetos` (panel objeto `reserved`)  
   **When** termina la mutación  
   **Then** se refresca ítem/sesión (`afterDeliverySessionMutation`) y el panel pasa a estado completado (`closed_completed_*`) sin regresión del flujo ya cableado

4. **Given** sesión no `active` (`409`) — p. ej. ya `completed`, `cancelled`, `expired`  
   **When** intento confirmar  
   **Then** mensaje claro en el diálogo (no genérico silencioso) y el diálogo permanece abierto hasta dismiss

5. **Given** no soy donante (`403`) o sesión no encontrada (`404`)  
   **When** falla el POST  
   **Then** mensaje de error apropiado en el diálogo

6. **Given** `401` en POST  
   **When** falla  
   **Then** el interceptor JWT redirige a login (sin toast duplicado)

7. **Given** receptor o sesión no activa  
   **When** veo la pantalla  
   **Then** no hay botón confirmar habilitado (solo donante + `active`)

8. **Given** prototipo `Entregas.html` (`ConfirmModal` L789–811, botón donante L575–576)  
   **When** implemento diálogo y CTA  
   **Then** reutilizo `app-delivery-session-confirm-dialog` y tokens existentes — sin rediseñar modal

## Tasks / Subtasks

### A. Backend — sin cambios (verificación)

- [x] **Confirmar contrato vigente** (AC: 1, 4–6)
  - `POST /delivery-sessions/:id/confirm` → `200 { status: 'completed', completedAt }`
  - Errores: `401`, `403`, `409` — ver `docs/architecture.md` §POST confirm y `backend/tests/delivery-sessions-confirm.test.ts` (17.1–17.8)
  - **No** modificar backend salvo regresión detectada en tests

### B. Utilidad errores mutación (recomendado)

- [x] **Extender** `delivery-session-error.util.ts` (AC: 4–5)
  - Añadir `mapDeliverySessionMutationError(err): { errorKey: string }` para POST confirm/cancel:
    - `409` → `delivery.detail.errors.confirm_conflict` (o reutilizar clave bajo `items.my_objects.delivery_errors.*` si se prefiere un solo namespace)
    - `403` → `delivery.detail.errors.forbidden`
    - `404` → `delivery.detail.errors.not_found`
    - default → `delivery.detail.errors.action_failed`
  - Spec unitario del mapper
  - Sustituir en `mis-objetos` el `delivery_errors.generic` único en `onConfirmDelivery` / `onCancelSessionConfirm` cuando se toque ese archivo

### C. `entrega-detalle` — implementar confirm (principal gap 4.2)

- [x] **Estado y diálogo** (AC: 1–2, 7–8)
  - Importar `DeliverySessionConfirmDialogComponent`
  - Signals: `confirmOpen`, `confirmSubmitting`, `confirmErrorKey` (patrón `mis-objetos`)
  - Botón confirmar: quitar `[disabled]="true"`; `(click)="openConfirmDialog()"`
  - Botón cancelar: **mantener disabled** (historia 4.3)

- [x] **Handler POST** (AC: 1–2)
  - `onConfirmDelivery()`: `deliverySessionsIdConfirmPost({ id: session.id })`
  - Éxito: cerrar diálogo + **refetch** `deliverySessionsIdGet` (reutilizar `loadSession`) para actualizar badge, step trail, banner `completed`, ocultar acciones
  - Alternativa aceptable: merge optimista de respuesta `ConfirmDeliveryResponse` en `session` signal si el GET no devuelve campos extra necesarios

- [x] **Template** `entrega-detalle.component.html`
  - `@if (confirmOpen()) { <app-delivery-session-confirm-dialog … /> }`
  - i18n del diálogo: **reutilizar** claves `items.my_objects.confirm_delivery.*` (ya en es/ca/en) — no duplicar strings

- [x] **i18n nuevas claves** solo si hace falta para errores POST:
  - `delivery.detail.errors.confirm_conflict`, `action_failed` en `public/i18n/{es,ca,en}.json`

- [x] **Tests** `entrega-detalle.component.spec.ts` (AC: 1–2, 7)
  - Donante+active: botón confirmar **habilitado** (actualizar test que espera `disabled: true`)
  - Click confirmar → abre diálogo
  - Confirm en diálogo → mock `deliverySessionsIdConfirmPost` + segundo `deliverySessionsIdGet` con `status: 'completed'`
  - POST `409` → `confirmErrorKey` mapeado + diálogo sigue abierto
  - Receptor: sin botones de acción donante

### D. `mis-objetos` — endurecer flujo existente

- [x] **Ya cableado** — verificar sin reescribir (AC: 3)
  - `openConfirmDeliveryDialog`, `onConfirmDelivery`, `app-delivery-session-confirm-dialog` en template
  - Tras éxito: `afterDeliverySessionMutation()` + tab `completed`

- [x] **Tests faltantes** `mis-objetos.component.spec.ts` (AC: 3–5)
  - Mock sesión `reserved` + `deliverySessionsIdConfirmPost` éxito → cierra modal, refresca, muestra copy `closed_completed_*`
  - POST `409` → error en diálogo (no solo generic si se implementó mapper)
  - No llamar confirm si `!canManageDeliverySession()`

### E. Regresión y verificación manual

- [x] `npx ng test --watch=false --include="**/delivery/**/*.spec.ts"`
- [x] `npx ng test --watch=false --include="**/mis-objetos.component.spec.ts"`
- [x] Manual: donante confirma desde `/entregas/:id` y desde `mis-objetos` → reputación/step trail coherente (vía panel split 4.4)

## Dev Notes

### Contrato API (solo lectura)

```typescript
// POST /delivery-sessions/{id}/confirm — sin body
interface ConfirmDeliveryResponse {
  status: 'completed';
  completedAt: string; // ISO8601
}
```

Cliente generado: `DeliveryService.deliverySessionsIdConfirmPost({ id })`.

### Brownfield — qué ya existe

| Pieza | Estado | Acción 4.2 |
|---|---|---|
| Backend `confirmDelivery` + tests 17.x | Hecho | Verificar, no tocar |
| `DeliverySessionConfirmDialogComponent` | Hecho (`shared/components/`) | Reutilizar en entrega-detalle |
| `mis-objetos` POST confirm | Hecho | Tests + errores 409 |
| `entrega-detalle` botón confirmar | **Stub disabled** | **Implementar** |
| `entrega-detalle` botón cancelar | Stub disabled | Dejar para **4.3** |
| i18n `items.my_objects.confirm_delivery.*` | Hecho es/ca/en | Reutilizar en diálogo |
| `delivery-session-error.util` | Solo GET | Extender para POST |

### Flujo UX (Entregas.html)

```
DonorDetail (active) → CTA «Confirmar entrega realizada»
  → ConfirmModal (reputación +10 copy)
  → POST confirm
  → UI completed (banner + step «Entrega confirmada»)
```

Prototipo: `docs/project/Entregas.html` — `ConfirmModal` L789–811, `DonorDetail` CTA L575–576. Paridad modal: `delivery-session-confirm-dialog` + `_delivery-session-dialog.scss`.

### Implementación entrega-detalle (orientación)

```typescript
// Patrón espejo de mis-objetos.component.ts L361-397
openConfirmDialog(): void {
  if (!this.showDonorActions()) return;
  this.confirmErrorKey.set(null);
  this.confirmOpen.set(true);
}

async onConfirmDelivery(): Promise<void> {
  const s = this.session();
  if (!s || this.confirmSubmitting()) return;
  this.confirmSubmitting.set(true);
  this.confirmErrorKey.set(null);
  try {
    await this.deliveryApi.deliverySessionsIdConfirmPost({ id: s.id });
    this.confirmOpen.set(false);
    await this.loadSession(s.id); // refresca status, completedAt, steps
  } catch (err) {
    if (err instanceof HttpErrorResponse && err.status === 401) return;
    this.confirmErrorKey.set(
      mapDeliverySessionMutationError(err).errorKey,
    );
  } finally {
    this.confirmSubmitting.set(false);
  }
}
```

### Post-confirm — estado UI esperado

| Campo sesión | Valor |
|---|---|
| `status` | `completed` |
| `donorConfirmed` | `true` |
| `completedAt` | ISO del API |
| `contactChannel` / `sharedContactChannel` | `null` (SEC-002: sesión no active) |
| `showDonorActions()` | `false` |
| Step trail donante | paso «Entrega confirmada» `done: true` |

### Anti-patterns

| Prohibido | Hacer |
|---|---|
| Nuevo modal desde cero | `app-delivery-session-confirm-dialog` |
| `HttpClient` manual a `/confirm` | `DeliveryService.deliverySessionsIdConfirmPost` |
| Implementar cancelar en 4.2 | Solo confirm; cancel → 4.3 |
| Editar `core/api/generated/` | Regenerar si cambia OpenAPI (no esperado) |
| Segundo GET `itemsIdGet` tras confirm | Solo `deliverySessionsIdGet` |
| Strings hardcodeados en template | Transloco |

### Previous Story Intelligence (4.1)

- Pantalla `/entregas/:id` con un solo `deliverySessionsIdGet`; acciones donante visibles pero **deshabilitadas** a propósito.
- `mapDeliverySessionError` para GET; extender familia para POST.
- `DeliverySessionStepTrailComponent` ya actualiza con `status === 'completed'`.
- Review 4.1: no mezclar cancel (4.3) en este PR.

### Git intelligence (reciente)

- `633cd7f` — entrega-detalle, step trail, diálogos delivery (confirm/cancel **componentes** creados; confirm solo wired en mis-objetos).
- Reutilizar estilos `_delivery-session-dialog.scss` y patrones de `mis-objetos` para consistencia.

### Testing

```bash
cd regalalo
npx ng test --watch=false --include="src/app/features/delivery/**/*.spec.ts"
npx ng test --watch=false --include="src/app/features/items/mis-objetos/mis-objetos.component.spec.ts"
npx ng test --watch=false --include="src/app/features/delivery/delivery-session-error.util.spec.ts"
```

Backend (sanity, no debería romperse):

```bash
cd ../backend && npx vitest run tests/delivery-sessions-confirm.test.ts
```

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 4.2, FR-F16, diseño `Entregas.html`]
- [Source: `docs/architecture.md` — POST `/delivery-sessions/:id/confirm`]
- [Source: `docs/project/Entregas.html` — ConfirmModal, DonorDetail CTA]
- [Source: `_bmad-output/implementation-artifacts/4-1-ver-detalle-de-sesion-de-entrega.md`]
- [Source: `backend/tests/delivery-sessions-confirm.test.ts`]
- [Source: `src/app/features/items/mis-objetos/mis-objetos.component.ts` — `onConfirmDelivery`]
- [Source: `src/app/shared/components/delivery-session-confirm-dialog/`]

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

- Backend sanity: `npx vitest run tests/delivery-sessions-confirm.test.ts` (8/8 OK)
- Frontend: `ng test` delivery (18/18), mis-objetos (21/21)

### Completion Notes List

- Implementado flujo POST confirm en `entrega-detalle` con diálogo reutilizado, refetch tras éxito y errores mapeados (409/403/404).
- `mapDeliverySessionMutationError` compartido; `mis-objetos` deja de usar error genérico en confirm/cancel POST.
- i18n `confirm_conflict` y `action_failed` en es/ca/en.
- Tests unitarios ampliados en entrega-detalle y mis-objetos.
- Flujo Entregas unificado en historia 4.4 (panel split); confirmar operativo en panel y en mis-objetos.

### File List

- `src/app/features/delivery/delivery-session-error.util.ts`
- `src/app/features/delivery/delivery-session-error.util.spec.ts`
- `src/app/features/delivery/entrega-detalle/entrega-detalle.component.ts`
- `src/app/features/delivery/entrega-detalle/entrega-detalle.component.html`
- `src/app/features/delivery/entrega-detalle/entrega-detalle.component.spec.ts`
- `src/app/features/items/mis-objetos/mis-objetos.component.ts`
- `src/app/features/items/mis-objetos/mis-objetos.component.spec.ts`
- `public/i18n/es.json`
- `public/i18n/ca.json`
- `public/i18n/en.json`

## Change Log

- 2026-05-23: Historia 4.2 creada — confirmar entrega: backend listo; frontend principal en `entrega-detalle`; endurecer `mis-objetos` + tests.
- 2026-05-23: Implementación completada — confirm en entrega-detalle, mapper POST, tests; estado → review.
- 2026-05-23: Code review (grupos A–C) — 6 patches aplicados (refetch sin flicker, cierre diálogo tras éxito, guards/tests); estado → done.

### Review Findings

<!-- Code review 2026-05-23 — por grupos; Grupo A completado -->

- [x] [Review][Patch] Refetch tras confirmar vacía la sesión y muestra loading global [`entrega-detalle.component.ts:287-292`] — corregido: `loadSession(..., { refresh: true })` preserva sesión y no activa loading global.
- [x] [Review][Patch] Diálogo se cierra antes de confirmar refetch [`entrega-detalle.component.ts:272-274`] — corregido: cierre solo tras refetch exitoso; error en GET mantiene diálogo con `action_failed`.
- [x] [Review][Patch] Faltan tests de componente para POST confirm 403/404 [`entrega-detalle.component.spec.ts`] — añadidos tests 403, 404, refetch fallido y sin loading en refresh.
- [x] [Review][Defer] Mapper 409 siempre usa `confirm_conflict` [`delivery-session-error.util.ts:55-56`] — aceptable en 4.2; cancel en 4.3 puede requerir clave distinta.

<!-- Grupo B — mis-objetos (2026-05-23) -->

- [x] [Review][Patch] Diálogo confirm se cierra antes de `afterDeliverySessionMutation` [`mis-objetos.component.ts:388-390`] — cierre solo si `detail.status === 'completed'` tras refresh.
- [x] [Review][Patch] `onConfirmDelivery` sin guard `canManageDeliverySession()` [`mis-objetos.component.ts:378`] — añadido guard explícito.
- [x] [Review][Patch] Faltan tests POST confirm 403/404 en mis-objetos [`mis-objetos.component.spec.ts`] — añadidos + test refresh incompleto.
