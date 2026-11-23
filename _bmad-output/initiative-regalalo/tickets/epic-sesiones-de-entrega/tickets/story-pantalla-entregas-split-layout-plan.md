---
ticket: 4
status: done
type: feature
migrated_from: v6
---

# Story 4.4: Pantalla Entregas (listado + detalle inline)

Status: done

<!-- Correct Course 2026-05-23 — sustituye alcance «4-4-listar-mis-sesiones-de-entrega». Bloqueante UX para cerrar 4.2/4.3 en /entregas. Ref: sprint-change-proposal-2026-05-23.md -->

## Story

Como usuario autenticado (donante o receptor),
quiero ver y gestionar mis sesiones de entrega en una sola pantalla,
para seguir el flujo del prototipo `Entregas.html` (UX-DR7).

## Acceptance Criteria

1. **Given** la ruta `/entregas` (authGuard, AppShell)  
   **When** cargo la pantalla  
   **Then** layout split según `docs/project/Entregas.html`: cabecera, `RoleTabs` donante/receptor con contadores, listado (Activas + Historial), panel detalle al seleccionar

2. **Given** hay sesiones y ninguna seleccionada  
   **When** veo la UI  
   **Then** hint «Selecciona una sesión…» (i18n); sin panel tipo página full-page vacía

3. **Given** el listado  
   **When** se renderiza  
   **Then** `UsersService.usersMeDeliverySessionsGet` (paginación); **no** `contactChannel` en filas

4. **Given** clic en fila  
   **When** selecciono sesión  
   **Then** panel con **un** `DeliveryService.deliverySessionsIdGet` — reutilizar lógica/UI de `entrega-detalle` embebida

5. **Given** deep link `/entregas/:id` (UUID válido)  
   **When** cargo  
   **Then** misma shell `/entregas` con sesión preseleccionada (misma componente que listado, no `EntregaDetalleComponent` full-page)

6. **Given** breakpoint móvil del prototipo  
   **When** hay sesión seleccionada  
   **Then** panel slide-over según CSS `Entregas.html` (`.detail-wrap`)

7. **Given** nav «Entregas»  
   **When** navego  
   **Then** pantalla funcional (reemplaza stub actual)

8. **Given** enlace Mis objetos tras select receptor (3.3)  
   **When** pulso «Ver sesión de entrega»  
   **Then** `/entregas/:sessionId` abre split con sesión seleccionada

## Tasks / Subtasks

### A. Shell y routing

- [x] Sustituir stub `entregas.component` por pantalla split (patrón `mis-objetos`)
- [x] `delivery.routes.ts`: `entregas` y `entregas/:id` → **mismo** `EntregasComponent`; resolver `:id` → `selectedSessionId`
- [x] Deprecar ruta/componente full-page `entrega-detalle` como destino de navegación (extraer panel o `@Input sessionId`)

### B. Listado API

- [x] Cargar `usersMeDeliverySessionsGet` con `role`/`status` según tabs
- [x] `SessionRow` / listas Activas + Historial (paridad L904–924 prototipo)
- [x] `RoleTabs` + contadores activos por rol

### C. Panel detalle (reutilizar 4.1)

- [x] Extraer o embeber contenido de `entrega-detalle` en panel derecho
- [x] Cerrar panel / deseleccionar en desktop; slide-over móvil
- [x] Mantener modales confirm/cancel (4.2/4.3) en esta shell

### D. i18n y estilos

- [x] Claves listado, tabs, empty, hint selección — `public/i18n/{es,ca,en}.json`
- [x] SCSS alineado `Entregas.html` + tokens `colors_and_type.css`

### E. Tests

- [x] `entregas.component.spec.ts`: listado, selección, deep link `:id`
- [x] Actualizar `app.routes.spec.ts` si cambia contrato de rutas
- [x] Regresión: enlace mis-objetos → split con sesión

## Dev Notes

### Correct Course

- Aprobado 2026-05-23. **Prioridad sobre** cerrar 4.2 UX en `/entregas`.
- Historia anterior `4-4-listar-mis-sesiones-de-entrega` → **cancelled** en sprint-status.

### Referencias obligatorias

- `docs/project/Entregas.html` — `App` L842–958, `SessionList`, `DetailPanel`, `RoleTabs`
- `src/app/features/items/mis-objetos/` — patrón split + query/deep link
- `src/app/features/delivery/entrega-detalle/` — lógica GET detalle (4.1 done)
- `initiative-regalalo/sprint-change-proposal-2026-05-23.md`

### Anti-patterns

| Prohibido | Hacer |
|-----------|--------|
| Segunda pantalla full-page para detalle | Panel en `/entregas` |
| Stub `/entregas` solo título | Listado + split |
| Listado solo en `/profile/...` | Ruta canónica `/entregas` |
| Duplicar GET detalle en listado y panel | Un GET al seleccionar |

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- Pantalla `/entregas` con split layout, tabs donante/receptor, listado Activas/Historial vía `usersMeDeliverySessionsGet`.
- `entrega-detalle` admite `panelMode` + `sessionId` input; embebido en panel; ruta full-page eliminada.
- Deep link `/entregas/:id` preselecciona sesión en la misma vista.
- i18n `delivery.list.*` en es/ca/en; responsive slide-over ≤860px.
- Tests: `entregas.component.spec.ts` (4) + regresión delivery 22/22.

### File List

- `src/app/features/delivery/delivery.routes.ts`
- `src/app/features/delivery/entregas/entregas.component.ts`
- `src/app/features/delivery/entregas/entregas.component.html`
- `src/app/features/delivery/entregas/entregas.component.scss`
- `src/app/features/delivery/entregas/entregas.component.spec.ts`
- `src/app/features/delivery/entrega-detalle/entrega-detalle.component.ts`
- `src/app/features/delivery/entrega-detalle/entrega-detalle.component.html`
- `src/app/features/delivery/entrega-detalle/entrega-detalle.component.scss`
- `public/i18n/es.json`
- `public/i18n/ca.json`
- `public/i18n/en.json`

### Review Findings

- [x] [Review][Patch] Deep link pierde selección si el rol del tab no coincide — auto-cambia tab al rol correcto antes de descartar selección.
- [x] [Review][Patch] Contadores de tabs incorrectos con >50 activas — usa `pagination.total` con `limit: 1`.
- [x] [Review][Patch] Listado truncado sin paginación — `fetchAllSessions` recorre todas las páginas.
- [x] [Review][Patch] Deep link sin validar UUID en shell — validación `UUID_V4` en effect de ruta.
- [x] [Review][Patch] Empty state sin icono del prototipo — SVG camión en vacío.
- [x] [Review][Patch] Tabs WAI-ARIA incompletos — `tabpanel`, `aria-controls`, `aria-label` en filas.
- [x] [Review][Defer] Animación `slide-in` del panel detalle — prototipo `.slide-in` en `Entregas.html`; impacto visual menor, no bloquea AC.
- [x] [Review][Defer] Focus trap en slide-over móvil — no hay captura de foco al abrir panel ≤860px; mejora a11y alineada con otras pantallas modales del proyecto.

## Change Log

- 2026-05-23: Historia creada tras Correct Course — pantalla Entregas split; ready-for-dev.
- 2026-05-23: Implementación completa — split + panel detalle; estado → review.
- 2026-05-23: Code review — 6 patch aplicados, 2 defer; estado → done.
