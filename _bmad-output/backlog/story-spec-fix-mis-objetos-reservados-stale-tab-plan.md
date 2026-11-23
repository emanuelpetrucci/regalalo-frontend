---
ticket: spec-fix-mis-objetos-reservados-stale-tab
status: done
type: bugfix
migrated_from: v6
---


<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Tras confirmar o cancelar una sesión de entrega desde `mis-objetos`, el objeto seguía apareciendo en la tab Reservados. El root cause es que `afterDeliverySessionMutation()` llama a `loadPage()`, que captura internamente sus errores sin relanzarlos. Si la llamada a la API falla (red caída, timeout), la señal `items` retiene el valor stale (`status: 'reserved'`) → `activeTab` se calcula con ese dato corrupto → el objeto permanece visible en la tab Reservados.

**Approach:** Aplicar una actualización optimista de la señal `items` inmediatamente después del POST exitoso y antes de llamar a `afterDeliverySessionMutation()`. Así, si `loadPage()` falla, `items` ya tiene el estado correcto. Si `loadPage()` tiene éxito, el servidor devuelve el mismo estado (transacción atómica en backend), sin conflicto.

## Boundaries & Constraints

**Always:**
- Aplicar el optimistic update sólo después de que el POST haya resuelto con éxito.
- Usar `items.update((list) => list.map(...))` — nunca `mutate`.
- El estado optimista debe coincidir con el que produce la transacción atómica del backend: `'completed'` para confirm, `'active'` para cancel.

**Never:**
- Modificar `afterDeliverySessionMutation()` ni `loadPage()` — el optimistic update es el punto de corrección mínimo.
- Tocar la lógica del backend ni los repositorios de sesiones.

## I/O & Edge-Case Matrix

| Scenario | Estado inicial | loadPage() tras POST | Resultado esperado |
|----------|---------------|---------------------|--------------------|
| Confirm exitoso, loadPage OK | `item.status='reserved'` | Devuelve `status='completed'` | Tab → `completed`, diálogo cierra |
| Confirm exitoso, loadPage falla | `item.status='reserved'` | Network error | Optimistic → `status='completed'`; tab → `completed`, diálogo cierra |
| Cancel exitoso, loadPage OK | `item.status='reserved'` | Devuelve `status='active'` | Tab → `active`, diálogo cierra |
| Cancel exitoso, loadPage falla | `item.status='reserved'` | Network error | Optimistic → `status='active'`; tab → `active`, diálogo cierra |
| Confirm falla (4xx/5xx) | `item.status='reserved'` | No se llama | Objeto sigue en Reservados, error en diálogo |

</frozen-after-approval>

## Code Map

- `src/app/features/items/mis-objetos/mis-objetos.component.ts:407-411` -- actualización optimista en `onConfirmDelivery()`: tras POST exitoso, `items.update` marca el ítem como `'completed'` antes de llamar a `afterDeliverySessionMutation()`
- `src/app/features/items/mis-objetos/mis-objetos.component.ts:461-465` -- actualización optimista en `onCancelSessionConfirm()`: tras POST exitoso, `items.update` marca el ítem como `'active'` antes de llamar a `afterDeliverySessionMutation()`
- `src/app/features/items/mis-objetos/mis-objetos.component.ts:530-549` -- `afterDeliverySessionMutation()`: llama a `loadPage()` (que no relanza errores) y después lee `items()` para calcular `activeTab`; el optimistic update garantiza que `items()` tenga el estado correcto aunque `loadPage()` falle
- `src/app/features/items/mis-objetos/mis-objetos.component.spec.ts:1557` -- test de regresión: confirm exitoso con loadPage que falla → tab no queda en `reserved`
- `src/app/features/items/mis-objetos/mis-objetos.component.spec.ts:1593` -- test de regresión: cancel exitoso con loadPage que falla → tab no queda en `reserved`

## Tasks & Acceptance

**Execution:**
- [x] `src/app/features/items/mis-objetos/mis-objetos.component.ts` -- En `onConfirmDelivery()`, tras `deliverySessionsIdConfirmPost` exitoso y antes de `afterDeliverySessionMutation()`, añadir `items.update` que marca el ítem como `status: 'completed'` -- corrige el bug para confirm
- [x] `src/app/features/items/mis-objetos/mis-objetos.component.ts` -- En `onCancelSessionConfirm()`, tras `deliverySessionsIdCancelPost` exitoso y antes de `afterDeliverySessionMutation()`, añadir `items.update` que marca el ítem como `status: 'active'` -- corrige el bug para cancel
- [x] `src/app/features/items/mis-objetos/mis-objetos.component.spec.ts` -- Añadir test de regresión "moves item out of reserved tab when loadPage fails after confirm" -- cubre el escenario del bug con mock de loadPage fallida post-confirm
- [x] `src/app/features/items/mis-objetos/mis-objetos.component.spec.ts` -- Añadir test de regresión "moves item to active tab when loadPage fails after cancel" -- cubre el escenario del bug con mock de loadPage fallida post-cancel

**Acceptance Criteria:**
- Given un donante que confirma una entrega y `loadPage()` falla, when la UI se actualiza, then `activeTab()` es `'completed'` (no `'reserved'`) y el ítem tiene `status: 'completed'` en la señal `items`
- Given un donante que cancela una sesión y `loadPage()` falla, when la UI se actualiza, then `activeTab()` es `'active'` (no `'reserved'`) y el ítem tiene `status: 'active'` en la señal `items`
- Given un donante que confirma una entrega y `loadPage()` tiene éxito, when la UI se actualiza, then el comportamiento existente no cambia (36 tests previos siguen en verde)
- Given todos los escenarios, when se ejecutan los tests, then 38/38 pasan

## Suggested Review Order

**Lógica principal**

- Optimistic update en confirm: `items.update` antes de `afterDeliverySessionMutation`
  [`mis-objetos.component.ts:407`](../../src/app/features/items/mis-objetos/mis-objetos.component.ts#L407)

- Optimistic update en cancel: `items.update` antes de `afterDeliverySessionMutation`
  [`mis-objetos.component.ts:461`](../../src/app/features/items/mis-objetos/mis-objetos.component.ts#L461)

**Tests**

- Regresión confirm con loadPage fallida
  [`mis-objetos.component.spec.ts:1557`](../../src/app/features/items/mis-objetos/mis-objetos.component.spec.ts#L1557)

- Regresión cancel con loadPage fallida
  [`mis-objetos.component.spec.ts:1593`](../../src/app/features/items/mis-objetos/mis-objetos.component.spec.ts#L1593)

## Verification

**Commands:**
- `npx ng test --watch=false --include="src/app/features/items/mis-objetos/mis-objetos.component.spec.ts"` -- expected: 38/38 tests en verde

### Review Findings

- [x] [Review][Defer] Race condition: `selectedId()` leído post-await podría haber cambiado si el usuario navega durante la llamada API — pre-existing, requiere cambio arquitectural [`mis-objetos.component.ts:407,461`] — deferred, pre-existing
- [x] [Review][Defer] Cierre del diálogo sigue dependiendo de `detail()?.status` (no del update optimista) — si `loadDetail` también falla, el diálogo no cierra — fuera del scope del fix per spec boundaries — deferred, pre-existing
- [x] [Review][Defer] No hay rollback del optimistic update si `afterDeliverySessionMutation()` lanza inesperadamente — spec prohíbe modificar esa función — deferred, pre-existing

**Resultado:** 0 decision-needed, 0 patches, 3 deferred, 10 descartados. Revisión limpia — implementación correcta.
