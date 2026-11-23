---
baseline_commit: eb16559c535f0e771c2f6a3738f77a1597a366b5
---

# Story 12-f1: Regenerar cliente OpenAPI y architecture v1.7

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed - comprehensive developer guide created. Épica 12-f Sistema de Reportes — historia fundacional; sin cambios de UI. Backend OpenAPI ya actualizado al momento de create-story (POST /reports confirmado). -->

## Story

Como desarrollador frontend,
quiero el cliente API y `docs/architecture.md` alineados con el endpoint `POST /api/reports` del backend,
para implementar las historias 12-f2 y 12-f3 contra contratos correctos del sistema de reportes.

**FR:** FR-REP-F1, FR-REP-F2, FR-REP-F3 (fundacional) · **Épica:** 12-f (Sistema de Reportes)  
**Referencia:** `docs/PRD-REP-FE-01.md` · `docs/DESIGN-REP-01.md` · `sprint-change-proposal-2026-06-11-reportes-frontend.md`

## Acceptance Criteria

1. **Given** `../backend/openapi/openapi.json` actualizado con `POST /reports` (confirmado disponible)  
   **When** ejecuto la cadena de regeneración documentada en `docs/api-client.md`  
   **Then** `npm run api:generate` completa sin error  
   **And** existe `ReportsService` generado en `src/app/core/api/generated/services/`  
   **And** existe el modelo `CreateReportRequest` en `generated/models/` con campos `reportedEntityType`, `reportedEntityId`, `reason`, `description?`, `recaptchaToken`  
   **And** existe el modelo `CreateReportResponse` en `generated/models/` con campos `id` y `message`  
   **And** el tipo `ReportReason` generado cubre los 8 valores del enum (ver tabla en Dev Notes — ⚠️ valores exactos difieren del PRD)

2. **Given** el cliente regenerado  
   **When** inspecciono los tipos y métodos clave  
   **Then** cumplen el contrato del backend:

   | Modelo / método | Estado esperado post-regeneración |
   |---|---|
   | `CreateReportRequest.reportedEntityType` | `'item' \| 'user'` — requerido |
   | `CreateReportRequest.reportedEntityId` | `string` (uuid) — requerido |
   | `CreateReportRequest.reason` | `ReportReason` enum — requerido |
   | `CreateReportRequest.description` | `string` — opcional (maxLength: 500) |
   | `CreateReportRequest.recaptchaToken` | `string` — requerido |
   | `CreateReportResponse.id` | `string` (uuid) |
   | `CreateReportResponse.message` | `string` |
   | `ReportsService.reportsPost` (o equivalente) | Método POST para `POST /reports` con `body: CreateReportRequest` |
   | Métodos y modelos existentes (AuthService, UsersService, etc.) | **sin cambio de firma** |

3. **Given** el PRD-REP-FE-01 aprobado  
   **When** reviso `docs/architecture.md`  
   **Then** la cabecera indica **Versión 1.7** con referencia al sistema de reportes  
   **And** §4 incluye nueva sección `POST /reports` con:  
   - Descripción, autenticación requerida (Bearer)  
   - Payload completo: `reportedEntityType`, `reportedEntityId`, `reason` (enum 8 valores), `description?`, `recaptchaToken`  
   - Respuesta 201: `{ id: string, message: string }`  
   - Tabla de errores: 400, 401, 403, 404, 409, 422, 429, 500 con códigos internos  
   **And** §5 incluye tipos TypeScript: `CreateReportRequest`, `CreateReportResponse`, `ReportReason`  
   **And** §6 incluye reglas de presentación del sistema de reportes (visibilidad del trigger, condición `canReport`)

4. **Given** `docs/api-client.md` como guía operativa  
   **When** cierro la historia  
   **Then** la tabla de servicios referencia `ReportsService` (nuevo) con método `reportsPost`  
   **And** se documenta `CreateReportRequest` y `CreateReportResponse` en la sección de modelos  
   **And** nota PRD-REP-FE-01: el endpoint requiere `emailVerified = true` (verificado server-side vía 403)

5. **Given** código generado versionado en git  
   **When** termino la regeneración  
   **Then** **no** edito manualmente ningún fichero bajo `src/app/core/api/generated/`  
   **And** el diff del cliente regenerado queda listo para commit (historia fundacional épica 12-f)

6. **Given** alcance acotado de 12-f1 (solo contrato + docs)  
   **When** ejecuto `npm run build` tras regenerar  
   **Then** documento en Completion Notes el resultado (éxito o errores TS)  
   **And** **no** implemento `ReportModalComponent` ni `ReportService` ni triggers en componentes  
   **And** **no** modifico `item-detail`, `item-card`, `user-profile`, i18n ni rutas — esos son scope de **12-f2** y **12-f3**

## Tasks / Subtasks

### A. Verificar estado del contrato backend (AC: 1)

- [x] Confirmar que `../backend/openapi/openapi.json` tiene el endpoint `POST /reports`:
  - ¿`/reports` path con método `post`? (confirmado en create-story: sí ✅)
  - ¿Schema `CreateReportRequest` con campos correctos? (confirmado ✅)
  - ¿Schema `CreateReportResponse` con `id` y `message`? (confirmado ✅)
  - ¿Enum `reason` con 8 valores incluyendo `fraude_o_enganio` e `información_falsa`? (confirmado ✅ — ⚠️ ver nota encoding en Dev Notes)
  - Si el spec local estuviera desactualizado: `cd ../backend && npm run openapi:generate`

### B. Regenerar cliente (AC: 1, 2, 5)

- [x] Desde raíz del proyecto frontend (`no-lo-vendo`): `npm run api:generate`
- [x] Verificar salida: regeneración completa sin error y conteo de modelos/servicios correcto
- [x] Abrir y contrastar ficheros clave post-regeneración:
  - `src/app/core/api/generated/services/reports.service.ts` → `ReportsService` con método `reportsPost` (o equivalente ng-openapi-gen) presente
  - `src/app/core/api/generated/models/create-report-request.ts` → `CreateReportRequest` con todos los campos requeridos
  - `src/app/core/api/generated/models/create-report-response.ts` → `CreateReportResponse` con `id` y `message`
  - Archivo con el tipo/enum `ReportReason` (puede estar en su propio fichero o inline en `CreateReportRequest`)
  - Confirmar que el operationId en la firma del método coincide con el esperado por PRD-REP-FE-01 §4 (`reportsApi.createReport` o equivalente generado)
- [x] Confirmar que los servicios existentes (AuthService, UsersService, ItemsService, DeliveryService) mantienen firma sin cambio
- [x] **Prohibido:** editar ficheros en `generated/` a mano

### C. Actualizar `docs/architecture.md` v1.6 → v1.7 (AC: 3)

- [x] Actualizar cabecera del documento:
  - Cambiar `**Versión:** 1.6` a `**Versión:** 1.7`
  - Añadir línea de historial: `> Versión 1.7 — PRD-REP-FE-01: endpoint POST /reports para sistema de reportes (CreateReportRequest, ReportReason, reglas de visibilidad canReport). PRD fuente: docs/PRD-REP-FE-01.md (aprobado 2026-06-11).`

- [x] §4 — Añadir nueva sección `POST /reports` (después de la última sección F7):
  ```
  ### F8 — Sistema de Reportes

  #### POST /reports
  **Descripción:** Reporte de un objeto o usuario por usuario autenticado con email verificado.

  **Payload de entrada:**
  {
    "reportedEntityType": "item | user",
    "reportedEntityId": "uuid",
    "reason": "ReportReason (ver enum abajo)",
    "description": "string (opcional, maxLength: 500)",
    "recaptchaToken": "string"
  }

  **Enum ReportReason (valores exactos del spec):**
  contenido_inadecuado | fraude_o_enganio | spam | objeto_ilegal |
  objeto_peligroso | información_falsa | comportamiento_abusivo | otro

  **Respuesta esperada (201):**
  { "id": "uuid", "message": "string" }

  **Errores:**
  | Código | Código interno | Motivo |
  |---|---|---|
  | 400 | VALIDATION_ERROR | Payload inválido |
  | 400 | RECAPTCHA_FAILED | reCAPTCHA score insuficiente |
  | 401 | — | No autenticado |
  | 403 | EMAIL_NOT_VERIFIED | Email no verificado (gestionado por authErrorInterceptor) |
  | 404 | — | Entidad no encontrada |
  | 409 | REPORT_ALREADY_PENDING | Reporte duplicado pendiente |
  | 422 | SELF_REPORT_FORBIDDEN | Intento de reportarse a sí mismo |
  | 422 | ENTITY_NOT_REPORTABLE | Entidad no reportable |
  | 429 | RATE_LIMIT_ENTITY_EXCEEDED | Límite de reportes por entidad |
  | 429 | RATE_LIMIT_TOTAL_EXCEEDED | Límite total de reportes |
  | 500 | — | Error interno |
  ```

- [x] §5 — Añadir nuevos tipos TypeScript:
  ```typescript
  export type ReportReason =
    | 'contenido_inadecuado'
    | 'fraude_o_enganio'        // ⚠️ valor exacto del spec (sin ñ)
    | 'spam'
    | 'objeto_ilegal'
    | 'objeto_peligroso'
    | 'información_falsa'       // ó con acento (correcto UTF-8)
    | 'comportamiento_abusivo'
    | 'otro';

  export interface CreateReportRequest {
    reportedEntityType: 'item' | 'user';
    reportedEntityId: string;
    reason: ReportReason;
    description?: string;
    recaptchaToken: string;
  }

  export interface CreateReportResponse {
    id: string;
    message: string;
  }
  ```

- [x] §6 — Añadir reglas de presentación del sistema de reportes:
  - Trigger de reporte (botón/enlace) solo visible si: usuario autenticado + `emailVerified === true` + `currentUserId !== entityOwnerId`
  - El 403 `EMAIL_NOT_VERIFIED` de `POST /reports` es gestionado globalmente por `authErrorInterceptor` → redirige a `/verificacion-pendiente`; el `ReportModalComponent` no maneja ese error inline
  - `ReportService` en `core/services/report.service.ts` (no en `core/api/generated/`)
  - `ReportModalComponent` en `shared/components/report-modal/` (standalone, reutilizable)
  - Usar `SessionService` (no `AuthService`) para `isAuthenticated()` y `currentUser` en condiciones `canReport`

### D. Actualizar `docs/api-client.md` (AC: 4)

- [x] En la tabla de servicios generados, añadir fila: `ReportsService | Reportes | reportsPost` (o el método generado equivalente)
- [x] En la sección de modelos, añadir mención de `CreateReportRequest` y `CreateReportResponse`
- [x] Añadir nota PRD-REP-FE-01: endpoint requiere JWT + `emailVerified`; el 403 lo gestiona `authErrorInterceptor`
- [x] Añadir nota sobre `ReportReason` enum: usar el tipo generado, no la definición manual del PRD (valores exactos en spec difieren del PRD en `fraude_o_enganio`)

### E. Verificación final (AC: 5, 6)

- [x] `npm run build` — documentar resultado en Completion Notes
- [x] Confirmar que no se modificaron componentes, plantillas ni archivos i18n (scope de 12-f2 y 12-f3)
- [x] File List y Completion Notes completados en Dev Agent Record

## Dev Notes

### Contexto PRD-REP-FE-01 — estado del contrato backend (confirmado en create-story, 2026-06-11)

El backend ya completó la implementación del sistema de reportes. PRD-REP-FE-01 aprobado 2026-06-11.

| Artefacto | Estado actual (pre-12-f1) | Objetivo post-12-f1 |
|---|---|---|
| `backend/openapi/openapi.json` — `POST /reports` | ✅ Ya presente | Confirmado en spec |
| `backend/openapi/openapi.json` — `CreateReportRequest` | ✅ Ya presente con todos los campos | Confirmado en spec |
| `backend/openapi/openapi.json` — `CreateReportResponse` | ✅ Ya presente con `id` y `message` | Confirmado en spec |
| `generated/services/reports.service.ts` | ❌ No existe aún | `ReportsService` con `reportsPost` |
| `generated/models/create-report-request.ts` | ❌ No existe aún | `CreateReportRequest` con 5 campos |
| `generated/models/create-report-response.ts` | ❌ No existe aún | `CreateReportResponse { id, message }` |
| `docs/architecture.md` | ✅ v1.6 | v1.7 con §4 F8, §5 tipos, §6 reglas |
| `docs/api-client.md` | Sin referencia PRD-REP-FE-01 | + `ReportsService`, `CreateReportRequest`, nota 403 |

### ⚠️ DISCREPANCIA CRÍTICA: Enum `reason` vs PRD

El PRD-REP-FE-01 documenta el enum con estos valores:
```
fraude_o_engaño   ← PRD dice esto
información_falsa ← PRD dice esto
```

El spec `openapi.json` del backend tiene estos valores **exactos**:
```
fraude_o_enganio   ← SIN ñ (valor literal en spec)
información_falsa  ← CON ó (correcto UTF-8)
```

**Regla para el dev agent:** Usar **siempre** el tipo `ReportReason` generado por `ng-openapi-gen` desde el spec, nunca la definición manual del PRD. El cliente generado reflejará los valores exactos del spec. Los mensajes visibles en UI se mapean en el componente y no dependen del valor del enum.

### Cadena de regeneración (obligatoria)

```bash
# Opcional — si openapi.json backend desactualizado (NO debería serlo)
cd ../backend
npm run openapi:generate

# Obligatorio — desde raíz del proyecto frontend
cd ../no-lo-vendo
npm run api:generate
```

Config: `openapi-ng.config.json` → input `../backend/openapi/openapi.json`, output `src/app/core/api/generated`, `removeStaleFiles: true`.

**Diferencia clave respecto a 10-f1:** El cambio es 100% aditivo — nuevos servicios y modelos sin modificar los existentes. El build post-regeneración **no debería** producir errores TS (a diferencia de 10-f1 donde `itemsIdRequestsPost` se volvió incompatible).

### Archivos generados clave (inspección post-regeneración)

| Fichero | Qué validar |
|---|---|
| `generated/services/reports.service.ts` | Servicio `ReportsService` con método para `POST /reports` |
| `generated/models/create-report-request.ts` | `CreateReportRequest` con 5 campos (4 required, 1 optional) |
| `generated/models/create-report-response.ts` | `CreateReportResponse { id: string; message: string }` |
| Archivo de tipo `ReportReason` | Puede ser `report-reason.ts` o inline en `create-report-request.ts` |
| `generated/models.ts` | Re-export de nuevos modelos |
| `generated/services.ts` | Re-export de `ReportsService` |

**No tocar manualmente:** todo `src/app/core/api/generated/**`

### Impacto build: análisis de compatibilidad

El cambio es aditivo (nuevos modelos y servicio). Escenarios esperados:

| Escenario | Comportamiento esperado |
|---|---|
| Nuevos modelos `CreateReport*` | **Build pasa** — solo adición, sin impacto en código existente |
| Nuevo `ReportsService` | **Build pasa** — sin referencias previas al servicio |
| Build general | ✅ Se espera exit 0 (cambio plenamente aditivo) |

> Si el build **falla** por razones inesperadas: documentar error en Completion Notes y **no** arreglar componentes — es scope de 12-f2/12-f3.

### Qué NO hacer en esta historia

- ❌ Crear `ReportModalComponent` (historia **12-f2**)
- ❌ Crear `ReportService` en `core/services/` (historia **12-f2**)
- ❌ Modificar `ItemCardComponent`, `ItemDetailComponent` ni `UserProfilePublicComponent` (historia **12-f3**)
- ❌ Añadir claves i18n `reports.*` (historia **12-f2**)
- ❌ Editar ficheros en `generated/` a mano
- ❌ Crear tipos provisionales en `core/models/` — el spec ya está actualizado

### Secciones exactas a modificar en `docs/architecture.md`

**Cabecera (líneas 2-4):**
```
**Versión:** 1.6
```
→ `**Versión:** 1.7`; añadir `> Versión 1.7 — PRD-REP-FE-01: ...` en el bloque de historial.

**§4 — Añadir al final de la sección** (después del último endpoint `GET /users/:id`):
Nueva sección `### F8 — Sistema de Reportes` con el endpoint `POST /reports`.

**§5 — Añadir al final del bloque de modelos TypeScript:**
Los tipos `ReportReason`, `CreateReportRequest`, `CreateReportResponse`.

**§6 — Añadir al final de las reglas de presentación:**
Las reglas de visibilidad del trigger, gestión del 403, ubicación de `ReportService` y `ReportModalComponent`.

### Inteligencia de historias anteriores análogas (patrón probado)

Patrón exitoso establecido en `8-f1`, `10-f1` (done):
- Regenerar sin tocar `generated/` a mano — cumplir estrictamente
- Completar `docs/architecture.md` en §4, §5 y §6 para los cambios del delta
- Actualizar `docs/api-client.md` con nuevos servicios/tipos
- En 10-f1 el build fue exit 0 (cambio aditivo). En 8-f1 también exit 0. Aquí también se espera exit 0.

**Diferencia clave con 10-f1:** En 10-f1, `itemsIdRequestsPost` cambió de firma (body obligatorio), causando posibles errores de compilación. En 12-f1 todo es nuevo y aditivo — sin rotura de firma esperada.

### Dependencias de la épica 12-f

```
12-f1 (OpenAPI + docs v1.7) → 12-f2 (ReportService + ReportModalComponent) → 12-f3 (triggers en componentes)
```

**12-f1 desbloquea 12-f2.** La historia 12-f2 necesita:
- `ReportsService` generado para que `ReportService` lo inyecte
- `CreateReportRequest` y `ReportReason` para tipar el payload
- `docs/architecture.md` v1.7 con las reglas de presentación del modal

### Architecture compliance

| Regla | Fuente |
|---|---|
| Cliente OpenAPI canónico | `docs/api-client.md`, `project-context.md` |
| No editar `generated/` | `docs/api-client.md` regla #1 |
| `apiUrl` termina en `/api` | `environment*.ts` — sin cambio en 12-f1 |
| `ReportService` en `core/services/` | PRD-REP-FE-01 §4, §10 |
| `ReportModalComponent` en `shared/components/` | PRD-REP-FE-01 §3, §11 |
| `SessionService` para `isAuthenticated()` y `currentUser` | PRD-REP-FE-01 §5 — NO usar `AuthService` para esto |
| Contratos §4 referencia | `docs/architecture.md` v1.7 (post-historia) |
| PRD fuente aprobado | `docs/PRD-REP-FE-01.md` |
| Correct Course | `_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-11-reportes-frontend.md` |

### Testing requirements

- **Sin tests nuevos** en 12-f1 (historia de infraestructura/documentación).
- Verificación manual: inspección de tipos generados + `npm run build` report.
- Historia 12-f2 creará `ReportService` con specs y `ReportModalComponent` con sus tests.

### Referencias obligatorias

- [Source: docs/api-client.md] — regeneración y reglas de uso
- [Source: docs/PRD-REP-FE-01.md] — especificación completa del sistema de reportes (§4 ReportService, §5 SessionService, §7 errores, §9 AC)
- [Source: docs/DESIGN-REP-01.md] — brief visual (§4 triggers, §5 modal 3 pasos, §6 errores, §7 responsive)
- [Source: docs/architecture.md] — v1.6 base; actualizar a v1.7
- [Source: _bmad-output/planning-artifacts/epics.md#Story-12-f1] — AC originales
- [Source: _bmad-output/implementation-artifacts/10-f1-regenerar-cliente-openapi-y-architecture-v1-6.md] — patrón historia fundacional más reciente (done)
- [Source: ../backend/openapi/openapi.json] — spec OpenAPI fuente de verdad (ya actualizado con POST /reports)
- [Source: openapi-ng.config.json] — config ng-openapi-gen

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

_Sin incidencias. La regeneración fue 100% aditiva — sin rotura de firmas existentes. Build exit 0._

### Completion Notes List

- ✅ Contrato backend verificado: `POST /reports` presente en `../backend/openapi/openapi.json` con `CreateReportRequest` (5 campos), `CreateReportResponse` (`id`, `message`), enum `reason` con 8 valores exactos del spec.
- ✅ `npm run api:generate` completado sin error — 72 modelos, 14 servicios. Archivos nuevos generados: `reports.service.ts`, `create-report-request.ts`, `create-report-response.ts`, `fn/reports/reports-post.ts`. Servicios existentes (AuthService, ItemsService, UsersService, DeliveryService) sin cambio de firma.
- ✅ `ReportReason` generado inline en `CreateReportRequest` como union literal de 8 valores: `contenido_inadecuado | fraude_o_enganio | spam | objeto_ilegal | objeto_peligroso | información_falsa | comportamiento_abusivo | otro`. ⚠️ Valor `fraude_o_enganio` sin ñ (conforme al spec — diferente del PRD).
- ✅ `docs/architecture.md` actualizado v1.6 → v1.7: cabecera, historial de versión, §4 F8 (POST /reports con tabla de errores completa), §5 (tipos TypeScript `ReportReason`, `CreateReportRequest`, `CreateReportResponse`), §6 (reglas de visibilidad `canReport`, gestión 403, ubicación de componentes).
- ✅ `docs/api-client.md` actualizado: `ReportsService` añadido a la tabla de servicios con método `reportsPost`; nota PRD-REP-FE-01 con modelos, requisito JWT+emailVerified, gestión del 403, y advertencia sobre valores exactos del enum.
- ✅ `npm run build` → exit 0. Solo warnings de presupuesto CSS preexistentes (onboarding, mis-objetos, perfil, landing) — no relacionados con esta historia. El cambio fue 100% aditivo como se esperaba.
- ✅ Sin modificaciones a componentes, plantillas, archivos i18n ni rutas — scope reservado para 12-f2 y 12-f3.

### File List

- `src/app/core/api/generated/services/reports.service.ts` (generado — nuevo)
- `src/app/core/api/generated/models/create-report-request.ts` (generado — nuevo)
- `src/app/core/api/generated/models/create-report-response.ts` (generado — nuevo)
- `src/app/core/api/generated/fn/reports/reports-post.ts` (generado — nuevo)
- `src/app/core/api/generated/models.ts` (generado — actualizado, re-exports nuevos modelos)
- `src/app/core/api/generated/services.ts` (generado — actualizado, re-export ReportsService)
- `src/app/core/api/generated/functions.ts` (generado — actualizado)
- `docs/architecture.md` (actualizado — v1.6 → v1.7)
- `docs/api-client.md` (actualizado — ReportsService + nota PRD-REP-FE-01)
- `_bmad-output/implementation-artifacts/12-f1-regenerar-cliente-openapi-y-architecture-v1-7.md` (historia — actualizado)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (actualizado — status → review)

### Review Findings — 2026-06-12

**Auditoría de aceptación:** ✅ No se encontraron hallazgos — todos los AC se cumplen.
**Hallazgos totales:** 0 patch, 0 decision-needed, 5 deferred, 5 dismissed.

#### Deferred

- [x] [Review][Defer] `ReportsPost$Params.body` y admin endpoints con body opcional — patrón conocido de ng-openapi-gen; código generado no modificable.
- [x] [Review][Defer] `description` sin validación `maxLength: 500` en `CreateReportRequest` — la validación cliente corresponde a `ReportModalComponent` (story 12-f2).
- [x] [Review][Defer] 7 servicios Admin (~25 modelos) generados pero no documentados en `docs/architecture.md` ni `docs/api-client.md` — fuera de scope de 12-f1; posible historia separada.
- [x] [Review][Defer] `removeStaleFiles: true` como riesgo operacional en pipeline de regeneración — no urgente, considerar hardening futuro.
- [x] [Review][Defer] Warning de presupuesto CSS pre-existentes (onboarding, mis-objetos, perfil, landing) — preexistente, no causado por este cambio.

## Change Log

- 2026-06-11: Regeneración cliente OpenAPI v1.7 — `ReportsService`, `CreateReportRequest`, `CreateReportResponse` generados desde spec backend. `docs/architecture.md` actualizado a v1.7 con §4 F8, §5 tipos y §6 reglas de presentación. `docs/api-client.md` actualizado con `ReportsService` y nota PRD-REP-FE-01. Build exit 0.
