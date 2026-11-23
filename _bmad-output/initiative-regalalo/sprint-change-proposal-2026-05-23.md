# Sprint Change Proposal — Entregas: pantalla única vs ruta de detalle

**Fecha:** 2026-05-23  
**Proyecto:** regalalo (frontend)  
**Autor del análisis:** Correct Course (BMad)  
**Solicitante / descubrimiento:** Emanuel — revisión de `docs/project/Entregas.html` frente a implementación actual  

**Estado del documento:** ✅ Aprobado por Emanuel — 2026-05-23  

---

## 1. Resumen del problema

### Problema

La épica 4 implementó el detalle de sesión de entrega como **pantalla independiente** (`/entregas/:id` → `entrega-detalle`), mientras el handoff obligatorio **`Entregas.html`** define **una sola pantalla** con layout split: listado de sesiones + panel de detalle inline (mismo patrón que `Mis objetos.html`), sin navegación a otra vista.

### Contexto de descubrimiento

- Durante verificación manual de la historia **4.2** (confirmar entrega), la pregunta de cómo acceder a `/entregas/:id` reveló que `/entregas` es un stub y que el nav «Entregas» no ofrece el flujo del prototipo.
- El usuario confirmó que **no existe página de detalle separada en el diseño**; mantener solo la ruta full-page sin abordar la pantalla unificada es un **error de producto** frente a UX-DR7.

### Evidencia

| Fuente | Hecho |
|--------|--------|
| `docs/project/Entregas.html` L899–947 | `split-layout`: `SessionList` + `DetailPanel` en el mismo `App`, `selectedId` en estado local |
| `epics.md` UX-DR7 | «Entregas = reproducción de `Entregas.html`» (bloqueante) |
| `epics.md` tabla diseño 4.1–4.4 | Todas apuntan a `Entregas.html` |
| Código actual | `entregas.component.ts` = solo `<h1>Entregas</h1>`; detalle en `entrega-detalle` |
| Historia 4.1 (done) | AC explícito: «pantalla `/entregas/:id`» — contradice prototipo |
| Historia 4.4 (backlog) | Ruta `/profile/delivery-sessions` + «clic → detalle 4.1» — no describe split ni `/entregas` |

### Tipo de issue

**Malentendido / deriva de requisitos** en la descomposición de historias (4.1 + 4.4), no fallo del API ni del backend.

---

## 2. Análisis de impacto

### 2.1 Épica 4 — Sesiones de entrega

| Aspecto | Impacto |
|---------|---------|
| ¿Épica viable como estaba planificada? | **Parcialmente** — FR-F15/F16/F17/F19 siguen siendo válidos; cambia **contenedor UI y routing**, no el contrato API |
| Modificación necesaria | Reordenar y reescribir AC de **4.4**; añadir historia de **corrección estructural**; ajustar notas en 4.1, 4.2, 4.3 |
| Prioridad | **Subir 4.4 (redefinida)** antes de cerrar 4.2/4.3 como «done» desde el punto de vista UX |

### 2.2 Historias afectadas

| Historia | Estado sprint | Impacto |
|----------|---------------|---------|
| **4.1** Ver detalle sesión | `done` | Lógica de `entrega-detalle` **reutilizable** como panel; AC de ruta full-page **obsoletos** para UX final |
| **4.2** Confirmar entrega | `in-progress` | POST/diálogo **válidos**; deben vivir en panel dentro de `/entregas`, no solo en ruta hija |
| **4.3** Cancelar sesión | `backlog` | Implementar en panel + modales del prototipo, no asumir página nueva |
| **4.4** Listar sesiones | `backlog` | **Reescritura mayor**: es la pantalla `Entregas.html` completa (listado + detalle + tabs rol), no listado en perfil |
| **4.5** Cancelar objeto con sesión | `backlog` | Enlaces desde Entregas deben seguir patrón split; sin cambio de API |
| **3.3** Seleccionar receptor | `done` | Enlace «Ver sesión» → debe **seleccionar sesión en `/entregas`**, no abrir layout distinto |

### 2.3 Otros épicas

- **Épica 5:** sin impacto directo.
- **Épica 2/3:** `mis-objetos` ya tiene panel reservado alineado con su prototipo; coherencia de deep links hacia Entregas.

### 2.4 Conflictos en artefactos

| Artefacto | ¿Existe? | Conflicto | Acción |
|-----------|----------|-----------|--------|
| PRD dedicado | No (requisitos en `epics.md`) | N/A | Actualizar `epics.md` |
| `epics.md` | Sí | AC 4.1, 4.4 vs UX-DR7 | Editar secciones 4.1, 4.4; nota en 4.2/4.3 |
| `docs/architecture.md` | Sí | Sin conflicto API; opcional § frontend routing | Nota: UI Entregas = split en `/entregas` |
| UX spec separado | No | `Entregas.html` es la spec | Sin cambio en handoff |
| `project-context.md` | Sí | Ya exige pixel-perfect Entregas | Refuerzo en historia 4.4 |
| `4-1-*.md`, `4-2-*.md` | Sí | AC rutas | Addendum o nueva historia de retrofit |
| `sprint-status.yaml` | Sí | Tras aprobación | Nueva historia + reordenar 4.4 |

### 2.5 Impacto técnico

- **Reutilizar** `entrega-detalle` como componente hijo (panel) o extraer template a `delivery-session-detail-panel`.
- **Routing propuesto:**
  - `GET /entregas` → pantalla principal (listado + panel).
  - `GET /entregas/:id` → **misma pantalla** con sesión preseleccionada (deep link); opcional redirect canónico a `/entregas?session=:id`.
- **Eliminar o deprecar** vista full-page suelta tras migración (evitar dos UIs).
- **Tests:** mover/adaptar specs de `entrega-detalle` a contexto panel + nuevos specs de `entregas` (split, selección, deep link).
- **Sin cambios** en OpenAPI ni backend para esta corrección.

---

## 3. Enfoque recomendado

### Opción evaluada

| Opción | Viabilidad | Comentario |
|--------|------------|------------|
| **1. Ajuste directo (híbrido)** | ✅ **Recomendada** | Reescribir 4.4 + refactor UI; **no** revertir backend ni lógica POST de 4.2 |
| **2. Rollback 4.1/4.2** | ❌ No viable | Desperdicia trabajo; el panel puede absorber el código existente |
| **3. Revisión MVP** | ❌ No necesaria | El MVP sigue siendo el mismo; solo corrección de presentación |

### Decisión

**Opción 1 (híbrido):** Historia **4.4 redefinida** como implementación de `Entregas.html` (shell + listado + selección + panel detalle). Historias **4.2 y 4.3** completan acciones **dentro del panel**. **Retrofit** de deep links y deprecación de detalle full-page.

### Esfuerzo y riesgo

| Dimensión | Estimación |
|-----------|------------|
| Esfuerzo | **Medio** (2–4 días dev: layout split, lista API, integración panel, routing, tests) |
| Riesgo técnico | **Bajo–medio** (patrón ya probado en `mis-objetos`) |
| Riesgo producto | **Alto si no se corrige** (incumplimiento UX-DR7 bloqueante) |
| Impacto en timeline | Retraso acotado en épica 4; evita deuda visual permanente |

---

## 4. Propuestas de cambio detalladas

### 4.1 `epics.md` — Story 4.1 (nota histórica + AC futuros)

**Sección:** Story 4.1 — Acceptance Criteria (Frontend)

**OLD (implícito en implementación):**
```text
Given la ruta /entregas/:id
When cargo la página
Then pantalla full-page entrega-detalle
```

**NEW (addendum — corrección 2026-05-23):**
```text
Nota de corrección de curso: La UI canónica de detalle vive en el panel
derecho de /entregas (Entregas.html), no como pantalla independiente.

Given la ruta /entregas con sesión seleccionada (o deep link /entregas/:id
que preselecciona en la misma vista)
When cargo como participante
Then un solo GET /delivery-sessions/:id alimenta el panel de detalle
And el layout cumple split-layout del prototipo (listado + panel)
```

**Rationale:** Alinear FR-F15 con UX-DR7 sin invalidar el trabajo API/backend de 4.1.

---

### 4.2 `epics.md` — Story 4.4 (reescritura)

**OLD — título y foco:**
```text
Story 4.4: Listar mis sesiones de entrega
Ruta: /profile/delivery-sessions o equivalente
Clic → abre detalle historia 4.1
```

**NEW — título y foco:**
```text
Story 4.4: Pantalla Entregas (listado + detalle inline)

Como usuario autenticado (donante o receptor),
quiero ver y gestionar mis sesiones de entrega en una sola pantalla,
para seguir el flujo del prototipo Entregas.html.

Acceptance Criteria (resumen):
- Ruta canónica: /entregas (protegida, AppShell)
- Layout split: listado (activas + historial) + panel detalle al seleccionar
- RoleTabs donante/receptor con contadores (paridad Entregas.html)
- GET /users/me/delivery-sessions con paginación y filtros role/status en UI
- Sin contactChannel en filas del listado
- Al seleccionar fila: panel con un GET /delivery-sessions/:id (reutilizar lógica 4.1)
- Empty state y hint «Selecciona una sesión…» cuando hay lista pero sin selección
- Responsive: panel full-screen slide-over en breakpoint del prototipo
- Deep link: /entregas/:id preselecciona sesión en la misma vista (no segunda pantalla)
- Nav «Entregas» lleva a esta pantalla funcional (no stub)
```

**Rationale:** 4.4 pasa de «solo listado» a «pantalla completa del prototipo», que era el hueco real.

---

### 4.3 `epics.md` — Stories 4.2 y 4.3 (addendum)

**NEW (añadir a AC de 4.2 y 4.3):**
```text
Given las acciones de donante (confirmar / cancelar)
When el usuario las ejecuta
Then ocurren desde el panel de detalle dentro de /entregas
And los modales siguen ConfirmModal / CancelModal del prototipo
And no se requiere navegación a una ruta hija distinta para completar el flujo
```

---

### 4.4 Nueva historia sugerida: `4-1b-retrofit-entregas-split` (opcional explícita)

Si se prefiere trazabilidad separada de 4.4:

| Campo | Valor |
|-------|--------|
| ID | `4-1b-entregas-split-layout-retrofit` |
| Depende de | 4.4 (o fusionada con 4.4) |
| Objetivo | Migrar `entrega-detalle` a panel; redirect `/entregas/:id`; actualizar tests y enlace 3.3 |
| Criterio de cierre | Nav Entregas usable; prototipo split verificable; specs verdes |

**Recomendación:** **Fusionar con 4.4** para no inflar el sprint; una sola historia «Pantalla Entregas».

---

### 4.5 `delivery.routes.ts` (implementación — referencia)

**OLD:**
```typescript
{ path: 'entregas', component: EntregasComponent /* stub */ },
{ path: 'entregas/:id', component: EntregaDetalleComponent /* full page */ },
```

**NEW (objetivo):**
```typescript
{ path: 'entregas', component: EntregasComponent /* list + panel */ },
{ path: 'entregas/:id', component: EntregasComponent /* same, resolve :id → selected */ },
// Opcional: eliminar EntregaDetalleComponent como ruta tras migración
```

---

### 4.6 `mis-objetos` — enlace post-selección (3.3 / 4.1)

**OLD:** `[routerLink]="['/entregas', success.sessionId]"` → full page  
**NEW:** Mismo link si `/entregas/:id` abre **split con selección**; verificar que UX no cambie a layout ajeno al prototipo Entregas.

---

## 5. Plan de implementación y handoff

### Clasificación de alcance

**Moderada** — Reorganización de backlog + refactor frontend; no replanificación de MVP ni cambio de API.

### Secuencia propuesta

1. **Aprobar** este Sprint Change Proposal.
2. **Editar** `epics.md` (secciones 4.1, 4.2, 4.3, 4.4) vía PO o dev con checklist.
3. **Regenerar/actualizar** archivo de historia `4-4-*.md` con `create-story` (contenido nuevo).
4. **Pausar cierre de 4.2** como `done` hasta que confirmar funcione en **panel dentro de `/entregas`** (o marcar 4.2 done con deuda explícita — no recomendado por UX-DR7).
5. **Dev:** implementar 4.4 (pantalla split) → integrar confirm/cancel 4.2/4.3 en panel.
6. **Actualizar** `sprint-status.yaml` tras aprobación.
7. **Code review** con checklist de paridad `Entregas.html`.

### Handoff

| Rol | Responsabilidad |
|-----|-----------------|
| **Emanuel (PO)** | Aprobar propuesta; decidir si 4.4 absorbe retrofit o historia 4.1b aparte |
| **create-story / PO** | Reescribir historia 4.4 en `implementation-artifacts/` |
| **Developer (dev-story)** | Implementar pantalla split; refactor routing; tests |
| **Code review** | Verificar UX-DR7 con `Entregas.html` |

### Criterios de éxito

- [ ] `/entregas` muestra listado + tabs rol según prototipo.
- [ ] Seleccionar sesión abre panel detalle **sin cambiar de pantalla** (salvo slide-over móvil del prototipo).
- [ ] `/entregas/:uuid` preselecciona la misma vista (deep link).
- [ ] Confirmar/cancelar (4.2/4.3) operan desde el panel con modales del prototipo.
- [ ] No queda segunda UI de detalle full-page en producción.
- [ ] Enlace desde Mis objetos tras selección receptor lleva al flujo Entregas coherente.

---

## 6. Checklist Correct Course (resumen)

| Sección | Estado |
|---------|--------|
| 1. Trigger y contexto | [x] Done — 4.1/4.2 vs Entregas.html |
| 2. Impacto épica | [x] Done — Épica 4, reorden 4.4 |
| 3. Artefactos | [x] Done — epics, stories, routing; PRD = epics |
| 4. Camino forward | [x] Done — Ajuste directo híbrido |
| 5. Componentes propuesta | [x] Done — este documento |
| 6. Aprobación usuario | [x] **Aprobado** (2026-05-23) |
| 6.4 sprint-status.yaml | [x] Actualizado |
| 6.5 epics.md | [x] Actualizado |

---

## 7. Aprobación

**Aprobado:** sí — 2026-05-23 (Emanuel).

**Siguiente paso:** `create-story` para `4-4-pantalla-entregas-split-layout` → `dev-story` (4.4 antes de cerrar 4.2 en Entregas).

---

*Generado por workflow bmad-correct-course — 2026-05-23*
