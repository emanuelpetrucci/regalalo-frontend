---
title: 'Frontend — El modal de ficha no pisa el SEO de la página anfitriona'
type: 'feature'
ticket: 'f4'
created: '2026-10-28'
status: done
baseline_revision: 'e5a1f6104b1e0a38f3af418ca099d2b6ed26b58e'
route: 'oneshot'
route_source: 'auto'
risk: 'medium'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['inline-quick']
review_loop_iteration: 0
context:
  - '_bmad-output/project-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** En `/explorar`, abrir una ficha en modal deja `ItemSeoService` sobrescribiendo título, canonical y `og:url` del item; al cerrar el modal esas etiquetas no vuelven al tablón.

**Approach:** Invocar `ItemSeoService.apply`/`clear` solo cuando `presentation === 'page'`. Al cerrar el modal en explorar, reaplicar `ExplorarSeoService.apply()` para restaurar el SEO del tablón.

## Boundaries & Constraints

**Always:** La ruta `/items/:slug` sigue aplicando SEO de item con canonical por slug. El HTML SSR inicial de `/explorar` no se toca.

**Never:** Cambiar backend, sitemap (f2), meta quality (f3), ni reabrir planes f1/f3.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Modal open | `presentation=modal`, item loaded | Meta del tablón sin cambios | N/A |
| Modal close | Usuario cierra modal en explorar | Título, canonical, og:url del tablón | N/A |
| Item page | `presentation=page`, item loaded | Item SEO con canonical slug | Errores de carga existentes |

</frozen-after-approval>

## Code Map

- `src/app/shared/components/item-detail-panel/item-detail-panel.component.ts` — `loadItem()` llama `itemSeoService.clear()`/`apply()` sin mirar `presentation()`; acotar a `'page'`.
- `src/app/features/items/explorar/explorar.component.ts` — `closeDetail()` solo limpia `detailItemId`; debe llamar `explorarSeo.apply()`.
- `src/app/core/seo/explorar-seo.service.ts` — `apply()` restaura tablón; reutilizar en cierre.
- `src/app/features/items/detalle/detalle.component.ts` — usa `presentation="page"`; sin cambios funcionales esperados.

## Tasks & Acceptance

**Execution:**
- [x] `item-detail-panel.component.ts` — guard SEO en `presentation === 'page'` — evita pisar tablón en modal
- [x] `explorar.component.ts` — `explorarSeo.apply()` en `closeDetail()` — restaura meta al cerrar
- [x] `item-detail-panel.component.spec.ts` — test modal no llama ItemSeoService
- [x] `explorar.component.spec.ts` — test cierre modal restaura SEO explorar

**Acceptance Criteria:**
- Given `/explorar` con meta del tablón, when abro y cierro ficha en modal, then título, canonical y og:url siguen siendo los del tablón
- Given `/items/:slug`, when carga la ficha, then canonical apunta al slug del item

## Implementation Notes

- `ItemSeoService` solo en `presentation === 'page'` dentro de `loadItem`.
- `closeDetail()` en explorar reaplica `ExplorarSeoService.apply()`.
- Review inline quick: sin hallazgos bloqueantes.
- Tests: `ng test` falla en este entorno con error global de Vitest runner (no específico del cambio).

## Review Triage Log

- Sin hallazgos en revisión quick inline.

## Verification

**Commands:**
- `npm test -- --run src/app/shared/components/item-detail-panel/item-detail-panel.component.spec.ts src/app/features/items/explorar/explorar.component.spec.ts` — expected: pass
