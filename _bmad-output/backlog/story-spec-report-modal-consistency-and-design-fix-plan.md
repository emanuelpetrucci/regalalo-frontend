---
ticket: spec-report-modal-consistency-and-design-fix
status: done
type: feature
migrated_from: v6
---


<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** El `report-modal` no aplica las animaciones globales de `_animations.scss` (`rlg-fade-in`, `rlg-modal-in`, `rlg-step-fwd/back`), usa z-index y opacidad de backdrop inconsistentes con el resto de modales, y el nodo `report-modal__reason-summary` carece de un wrapper interno que agrupe label y value en columna — diferencia estructural respecto al diseño JSX.

**Approach:** Añadir las clases de animación globales al template, corregir los valores de z-index (200/201) y opacidad del backdrop (0.35), y envolver los elementos label+value del reason-summary en un `<div>` columna para replicar la jerarquía del diseño.

## Boundaries & Constraints

**Always:**
- Usar únicamente clases de animación de `src/styles/_animations.scss`; no crear keyframes locales nuevos (el spinner `report-spin` ya existente se mantiene).
- Respetar los tokens CSS del proyecto (`var(--...)`) — no hardcodear colores ni tamaños.
- La estructura de clases BEM existente se mantiene; solo se añade un elemento hijo nuevo (`__reason-group`) dentro de `__reason-summary`.
- Compatibilidad con `prefers-reduced-motion`: ya cubierto globalmente en `_animations.scss`, no añadir media queries propias.

**Ask First:**
- Si al ajustar el z-index a 200 el modal queda tapado por algún otro elemento en alguna pantalla concreta (ej. header sticky), preguntar antes de elegir un valor diferente.

**Never:**
- Tocar la lógica TypeScript del componente (signals, handlers, service calls).
- Modificar el spinner `report-spin` local.
- Cambiar el diseño visual del step 3 (confirmación) ni del header del modal.

</frozen-after-approval>

## Code Map

- `src/app/shared/components/report-modal/report-modal.component.html` -- template principal; backdrop, panel, steps, reason-summary
- `src/app/shared/components/report-modal/report-modal.component.scss` -- estilos BEM del modal; z-index, opacidad, reason-summary layout
- `src/styles/_animations.scss` -- animaciones globales a consumir (solo lectura)

## Tasks & Acceptance

**Execution:**

- [x] `src/app/shared/components/report-modal/report-modal.component.html` -- Añadir clase `rlg-fade-in` al elemento backdrop (`.report-modal__backdrop`); añadir clase `rlg-modal-in` al panel (`.report-modal__panel`); step 1 body usa `rlg-step-back`, step 2 y step 3 usan `rlg-step-fwd` (el `@if` de Angular recrea el DOM en cada cambio de paso, por lo que las animaciones se aplican correctamente sin necesidad de un signal `stepDir`) -- alinear con las animaciones globales que usan todos los demás modales/drawers

- [x] `src/app/shared/components/report-modal/report-modal.component.html` -- Dentro de `.report-modal__reason-summary`, envolver los elementos `__reason-summary-label` y `__reason-summary-value` en un nuevo `<div class="report-modal__reason-summary-group">` -- reproduce la jerarquía del diseño JSX: `[group(label+value)] [btn-cambiar]`

- [x] `src/app/shared/components/report-modal/report-modal.component.scss` -- Corregir z-index del backdrop a `700` (por encima de share-dialog/cancel-dialog/delivery-dialog que usan 500–700; valor confirmado por el usuario); corregir opacidad del backdrop a `rgba(20, 23, 26, 0.35)` (de `0.45`); añadir `.report-modal__reason-summary-group` con `display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1`; eliminar `flex-wrap: wrap` y `gap: 6px` del contenedor `__reason-summary`; eliminar `flex-shrink: 0` del label y `flex: 1` del value -- z-index 700 garantiza visibilidad sobre todos los overlays actuales

**Acceptance Criteria:**

- Dado que el modal se abre, cuando aparece en pantalla, entonces el backdrop hace fade-in con `rlg-fade-in` y el panel entra con `rlg-modal-in` (opacidad + scale + translateY).
- Dado que el usuario está en el step 1 y pulsa "Siguiente", cuando se carga el step 2, entonces el contenido entra con animación `rlg-step-fwd`.
- Dado que el usuario está en el step 2 y pulsa "Atrás", cuando vuelve al step 1, entonces el contenido entra con animación `rlg-step-back`.
- Dado que el step 2 está activo con un motivo seleccionado, cuando se renderiza `__reason-summary`, entonces el label "Motivo seleccionado" y el valor del motivo están apilados en columna (uno debajo del otro), con el botón "Cambiar" alineado a la derecha.
- Dado un `prefers-reduced-motion: reduce` activo, cuando el modal abre o cambia de paso, entonces no hay animaciones visibles (gestionado por `_animations.scss` global).

## Design Notes

Jerarquía correcta del `__reason-summary` según JSX (lines 347–374):

```
.report-modal__reason-summary          ← flex, row, space-between, align-center
  .report-modal__reason-summary__group ← flex, column, gap:2px  [NUEVO]
    .report-modal__reason-summary__label  ← "Motivo seleccionado", 11px, uppercase
    .report-modal__reason-summary__value  ← texto del motivo, 13px, weight:500
  button.report-modal__reason-summary__btn-change  ← "Cambiar", 12px, color:primary
```

El `flex-wrap` del contenedor original causaba que los 3 siblings (label, value, btn) se rompieran a líneas independientes en pantallas estrechas. El wrapper resuelve esto.

## Verification

**Commands:**
- `ng build --configuration=production` -- expected: 0 errors, 0 warnings
- `ng test --include='**/report-modal*'` -- expected: all existing tests pass

**Manual checks:**
- Abrir el modal en desktop: verificar que la entrada tiene fade + scale-up suave.
- Abrir en mobile: verificar que usa la animación de sheet (ya existente, no cambia).
- Step 1 → Step 2: debe haber deslizamiento sutil hacia la izquierda (`rlg-step-fwd`).
- Step 2 → Step 1: debe haber deslizamiento sutil hacia la derecha (`rlg-step-back`).
- Step 2 con motivo seleccionado: "Motivo seleccionado" arriba, nombre del motivo debajo, botón "Cambiar" a la derecha en la misma fila que el grupo.
- Inspector de elementos: backdrop `z-index = 700` (el panel hereda el stacking context del backdrop, no necesita z-index explícito).

## Spec Change Log

### Loop 1 — 2026-06-14

**Finding:** Edge Case Hunter detectó que `item-cancel-dialog`, `delivery-session-dialog` y `share-dialog` usan z-index 500–700. Con z-index 200, el report-modal quedaría oculto bajo esos overlays en co-existencia.

**Amended:** Task SCSS — z-index cambiado de 200 a 700 (valor confirmado por el usuario). Añadido `min-width: 0; flex: 1` en `.report-modal__reason-summary-group` para protección de overflow en texto largo.

**Known-bad state avoided:** z-index 200 ocultaría el modal detrás de delivery/cancel/share dialogs (500–700).

**KEEP:** Clases de animación (`rlg-fade-in`, `rlg-modal-in`, `rlg-step-back`, `rlg-step-fwd`) son correctas. Wrapper `__reason-summary-group` y eliminación de `flex-wrap` son correctos.

## Suggested Review Order

**Animaciones de entrada del modal**

- Backdrop recibe `rlg-fade-in`; panel recibe `rlg-modal-in` — consistente con `item-detail-modal`.
  [`report-modal.component.html:2`](../../src/app/shared/components/report-modal/report-modal.component.html#L2)

- z-index 700 y opacidad 0.35 — encima de todos los overlays actuales (cancel, delivery, share).
  [`report-modal.component.scss:4`](../../src/app/shared/components/report-modal/report-modal.component.scss#L4)

**Transiciones entre pasos (wizard)**

- Step 1 body con `rlg-step-back` — entra desde la izquierda al volver atrás.
  [`report-modal.component.html:63`](../../src/app/shared/components/report-modal/report-modal.component.html#L63)

- Step 2 y Step 3 bodies con `rlg-step-fwd` — entran desde la derecha al avanzar.
  [`report-modal.component.html:109`](../../src/app/shared/components/report-modal/report-modal.component.html#L109)

**Layout reason-summary (fix estructural vs. diseño JSX)**

- Nuevo `__reason-summary-group` agrupa label+value en columna; `btn-change` queda a la derecha via `space-between`.
  [`report-modal.component.html:112`](../../src/app/shared/components/report-modal/report-modal.component.html#L112)

- Container pierde `flex-wrap`; group tiene `flex: 1; min-width: 0` para protección de overflow.
  [`report-modal.component.scss:173`](../../src/app/shared/components/report-modal/report-modal.component.scss#L173)

- Estilos del grupo columna — `flex-direction: column; gap: 2px`.
  [`report-modal.component.scss:183`](../../src/app/shared/components/report-modal/report-modal.component.scss#L183)
