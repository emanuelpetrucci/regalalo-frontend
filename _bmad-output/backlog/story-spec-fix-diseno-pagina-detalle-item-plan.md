---
ticket: spec-fix-diseno-pagina-detalle-item
status: done
type: bugfix
migrated_from: v6
---


<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** La página `/items/:id` reutiliza directamente los estilos del modal overlay (`shadow-3`, `nlv-modal-in`, cuadrícula sin responsive). Esto hace que la card se vea como un modal flotante — sombra excesivamente pesada, animación de pop-in — en contraste con páginas equivalentes como `/entregas/:id` que usan `shadow-2`, header con borde divisorio y layout responsive. El título del ítem en modo página tampoco tiene separador visual respecto al contenido, a diferencia del header del modal.

**Approach:** Ajustar el shell de la página (`detalle.component.scss`) para usar `shadow-2` en lugar de `shadow-3`; en `item-detail-panel.component.scss` añadir `border-bottom` al título de página y un breakpoint que apile las columnas en móvil. Ningún cambio toca lógica de datos ni el comportamiento del modal.

## Boundaries & Constraints

**Always:**
- Cambios CSS limitados a presentación visual: tokens de sombra, borde de título, layout responsive.
- El modal (`presentation="modal"`) no debe cambiar en ningún aspecto — `shadow-3` y layout de dos columnas fijo son correctos para el overlay.
- Usar design tokens (`var(--shadow-2)`, `var(--border-default)`, `var(--radius-xl)`) sin hardcodear valores.
- Todos los tests existentes deben pasar sin cambios.

**Ask First:**
- Si tras ver `shadow-2` el usuario considera que sigue siendo demasiado prominente y prefiere `shadow-1`.

**Never:**
- No tocar lógica de carga de datos, señales ni ningún archivo `.ts` del panel o la página.
- No añadir rutas, endpoints ni modelos.
- No alterar comportamiento de scroll, overflow ni layout en modo modal.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Página desktop (>560px) | Viewport ≥561px | Card con `shadow-2`, título con `border-bottom`, cuadrícula 2 columnas | N/A |
| Página móvil (≤560px) | Viewport ≤560px | Cuadrícula apilada: galería arriba, info abajo; `border-right` de galería reemplazado por `border-bottom` | N/A |
| Modal desde Explorar | `presentation="modal"` | Sin cambios: `shadow-3`, 2 columnas fijas, sin border en título de modal | N/A |

</frozen-after-approval>

## Code Map

- `src/app/features/items/detalle/detalle.component.scss` -- shell de la página: contiene `box-shadow: var(--shadow-3)` y `border-radius: 16px` a sustituir por tokens correctos
- `src/app/shared/components/item-detail-panel/item-detail-panel.component.scss` -- estilos del panel compartido; `.item-detail-panel__page-title` (sin border-bottom), `.item-detail-panel__grid` (sin breakpoint responsive), `.item-detail-panel__gallery-col` (border-right a condicionar)
- `src/app/shared/components/item-detail-modal/item-detail-modal.component.scss` -- referencia: el modal usa `shadow-3` y `border-radius: 16px` — NO tocar
- `src/styles/_tokens.scss` -- valores de referencia: `--shadow-2`, `--radius-xl: 16px`, `--border-default`

## Tasks & Acceptance

**Execution:**

- [x] `src/app/features/items/detalle/detalle.component.scss` -- En `.detalle-page__shell`: cambiar `box-shadow: var(--shadow-3)` por `var(--shadow-2)` y `border-radius: 16px` por `var(--radius-xl)` — alinear con `entrega-detalle__panel` que ya usa `shadow-2`
- [x] `src/app/shared/components/item-detail-panel/item-detail-panel.component.scss` -- En `.item-detail-panel__page-title`: cambiar `padding: 16px 20px 0` por `padding: 16px 20px` y añadir `border-bottom: 1px solid var(--border-default)` — igual que el `__modal-header` que ya tiene este borde
- [x] `src/app/shared/components/item-detail-panel/item-detail-panel.component.scss` -- Añadir al final: `@media (max-width: 560px) { .item-detail-panel__grid { grid-template-columns: 1fr } .item-detail-panel__gallery-col { border-right: none; border-bottom: 1px solid var(--border-default) } }`

**Acceptance Criteria:**

- Given la página `/items/:id` en desktop (viewport >560px), when se inspecciona en DevTools, then `.detalle-page__shell` tiene `box-shadow` equivalente a `shadow-2` y el título del ítem tiene `border-bottom: 1px solid #D5D9DE`
- Given la página `/items/:id` en viewport ≤560px, when se renderiza, then galería e info se apilan en una columna (no hay scroll horizontal ni columnas aplastadas)
- Given el modal de detalle abierto desde `/explorar`, when se inspecciona, then `item-detail-modal__inner` mantiene `shadow-3`, `border-radius: 16px` y cuadrícula de dos columnas sin cambios

## Spec Change Log

## Design Notes

**Patrón de referencia:** `entrega-detalle__panel` (`.entrega-detalle.component.scss` L77–83) usa `box-shadow: var(--shadow-2)` y `border-radius: 14px`. El item-detail page debe seguir este mismo patrón en lugar del `shadow-3` del overlay modal.

**Breakpoint 560px:** El modal tiene `max-width: 740px`; en móvil ocupa todo el ancho. A 560px, dos columnas `1fr 1fr` resultan en ~250px de galería — insuficiente para fotos. El apilado vertical también aplica al modal en viewports pequeños, lo cual es correcto.

**Por qué no se toca la lógica de overflow:** `item-detail-panel__body { overflow: hidden }` y `__grid { height: 100% }` son noops en el contexto de página (sin altura fija en el contenedor), por tanto no causan clipping visible — se dejan como están.

## Verification

**Manual checks:**
- Navegar a `/items/{uuid}` en escritorio: la card tiene sombra notablemente más sutil que antes (ya no "flota")
- El título del ítem muestra una línea divisoria fina antes de la cuadrícula
- Reducir viewport a ≤560px: galería arriba, información abajo, sin desbordamiento horizontal
- Abrir modal desde `/explorar` → click en ítem: sin cambio visual respecto al estado previo

## Suggested Review Order

**Elevación visual del shell de página**

- Shadow reducida de `shadow-3` (modal) a `shadow-2` (página); token de radius limpiado
  [`detalle.component.scss:26`](../../src/app/features/items/detalle/detalle.component.scss#L26)

**Separador visual del título en modo página**

- `border-bottom` igual al `__modal-header`; padding corregido de `0` a `16px` en la base
  [`item-detail-panel.component.scss:48`](../../src/app/shared/components/item-detail-panel/item-detail-panel.component.scss#L48)

**Layout responsive — apilado en móvil**

- Breakpoint 560px: grid colapsa a 1fr, `border-right` de galería pasa a `border-bottom`
  [`item-detail-panel.component.scss:179`](../../src/app/shared/components/item-detail-panel/item-detail-panel.component.scss#L179)

### Review Findings

- [x] [Review][Patch] `@media (max-width: 560px)` colapsa la cuadrícula del modal en viewports ≤560px (AC3 FAIL) — envolver el bloque con `:host-context(.detalle-page__shell)` para que solo aplique en contexto de página [`item-detail-panel.component.scss:179`](../../src/app/shared/components/item-detail-panel/item-detail-panel.component.scss#L179)
- [x] [Review][Defer] Posible doble borde en galería col vs borde interno del componente galería en layout apilado [`item-detail-panel.component.scss:184`](../../src/app/shared/components/item-detail-panel/item-detail-panel.component.scss#L184) — deferred, pre-existing
- [x] [Review][Defer] Modal `item-detail-modal__inner` sigue con `border-radius: 16px` hardcodeado (asimetría con token `--radius-xl` del shell de página) — deferred, pre-existing
- [x] [Review][Defer] `@media` viewport-based en componente compartido; candidato a `@container` query cuando haya soporte suficiente — deferred, pre-existing
