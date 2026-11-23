---
code: sprint-change-proposal-2026-06-11-reportes-frontend
fecha: "2026-06-11"
proyecto: regalalo
trigger: docs/PRD-REP-FE-01.md
estado: aprobado
clasificacion: moderado
---

# Sprint Change Proposal — Sistema de Reportes Frontend

## 1. Resumen del Cambio

**Trigger:** Entrega del documento `docs/PRD-REP-FE-01.md` (v1.1, aprobado 2026-06-09) y `docs/DESIGN-REP-01.md` (v1.0, aprobado 2026-06-09), que especifican el sistema de reportes frontend con prioridad P0, clasificado en Bloque 1 — Operabilidad mínima.

**Tipo de cambio:** Nuevo requisito de producto — incorporación de feature P0 al backlog planificado.

**Alcance PRD:** `ReportModalComponent` (modal de 3 pasos reutilizable), `ReportService`, integración de triggers en 3 componentes existentes (`ItemCardComponent`, `ItemDetailComponent`, `UserProfilePublicComponent`), reCAPTCHA V3 (acción `'report'`), gestión de 7 códigos de error diferenciados del backend.

**Descubrimiento:** Los documentos `PRD-REP-FE-01.md` y `DESIGN-REP-01.md` aparecen como archivos sin seguimiento en git (`??`) — son artefactos nuevos que no tienen épica ni historias correspondientes en `epics.md` ni entradas en `sprint-status.yaml`.

---

## 2. Análisis de Impacto

### Épicas existentes (1–11-f)

Sin impacto. El cambio es completamente aditivo.

### Componentes existentes afectados (adición de trigger únicamente)

| Componente | Épica original | Tipo de cambio |
|---|---|---|
| `ItemCardComponent` | Épica 2 (done) | Añadir opción al menú contextual |
| `ItemDetailComponent` | Épica 2 (done) | Añadir enlace inferior |
| `UserProfilePublicComponent` | Épica 5 (done) | Añadir enlace inferior |
| `SessionService` | Épica 1 (done) | Consumido sin modificación |
| `RecaptchaService` | Épica 1 (done) | Consumido sin modificación |
| `authErrorInterceptor` | Épicas 1/8-f (done) | Gestiona 403 globalmente; sin modificación |

### Dependencia crítica

`POST /api/reports` (PRD-REP-BE-01) debe estar implementado en el backend antes de ejecutar `npm run api:generate` y habilitar la Story 12-f1. Las Stories 12-f2 y 12-f3 pueden avanzar con mock local si el backend aún no está disponible.

### Artefactos actualizados

| Artefacto | Tipo de cambio |
|---|---|
| `_bmad-output/planning-artifacts/epics.md` | Nueva Épica 12-f con 3 historias; actualización de tablas de referencia, FR inventory y FR coverage map |
| `_bmad-output/implementation-artifacts/sprint-status.yaml` | Nuevas entradas epic-12-f y 3 stories en estado `backlog` |
| `docs/architecture.md` | Actualizar a v1.7 en Story 12-f1 (nuevo endpoint, enums, errores) |

---

## 3. Propuestas de Cambio

### 3.1 epics.md — Nueva Épica 12-f

**Añadido al Requirements Inventory:** FR-REP-F1, FR-REP-F2, FR-REP-F3  
**Añadido al FR Coverage Map:** cobertura de FR-REP-F1..F3 → Épica 12-f  
**Añadido a "Referencia diseño por historia":** filas 12-f2 y 12-f3  
**Añadido al Epic List:** descripción breve de Épica 12-f  
**Añadida sección completa:** ## Epic 12-f con Stories 12-f1, 12-f2, 12-f3  
**Actualizada Validación Final:** cobertura FR-REP-F1..F3 → Épica 12-f

### 3.2 sprint-status.yaml — Entradas nueva épica

```yaml
# ─── Épica 12-f: Sistema de Reportes (PRD-REP-FE-01) ───
epic-12-f: backlog
12-f1-regenerar-cliente-openapi-y-architecture-v1-7: backlog
12-f2-report-service-y-report-modal-component: backlog
12-f3-integracion-puntos-de-entrada-reportes: backlog
epic-12-f-retrospective: optional
```

---

## 4. Enfoque Recomendado

**Opción seleccionada:** Ajuste directo — nueva Épica 12-f con 3 historias.

| Criterio | Evaluación |
|---|---|
| Esfuerzo | Medio — feature bien definido, sigue patrones de Épicas 6-f a 10-f |
| Riesgo | Bajo — completamente aditivo; sin modificaciones de lógica existente |
| Impacto en timeline | Sin impacto en épicas en curso; se añade al backlog después de 11-f |
| Dependencia bloqueante | PRD-REP-BE-01 (backend) debe completarse antes de 12-f1 |

**Secuencia de implementación:**
1. Backend implementa `POST /api/reports` → habilita Story 12-f1
2. Story 12-f1: Regenerar cliente OpenAPI + architecture v1.7
3. Story 12-f2: ReportService + ReportModalComponent (puede ejecutarse en paralelo con mock si el backend no está listo)
4. Story 12-f3: Integración triggers en 3 puntos de entrada

---

## 5. Handoff

**Clasificación:** Moderado  
**Handoff:** Developer agent puede ejecutar directamente usando las stories de la Épica 12-f como guía.

**Criterios de éxito:**
- `epics.md` contiene Épica 12-f con 3 historias y ACs completos ✓
- `sprint-status.yaml` refleja las 3 nuevas entradas en estado `backlog` ✓
- Story 12-f1 permanece en `backlog` hasta confirmación de que el backend ha implementado PRD-REP-BE-01
- Tras implementación: 20 ACs definidos en PRD-REP-FE-01 §9 (AC-REP-FE-01 a AC-REP-FE-20) deben pasar
