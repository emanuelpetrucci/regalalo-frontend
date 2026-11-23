# Sprint Change Proposal — 2026-05-28

## 1) Issue Summary

Durante ejecución del sprint se identificó un gap de cumplimiento: el frontend tiene maquetadas las páginas legales (`Política de privacidad` y `Política de cookies`), pero no existe un gestor de consentimiento de cookies operativo.

Trigger confirmado por el usuario:

- Se requiere incorporar gestor de cookies.
- Debe ser una opción open source.
- La implementación debe respetar la maquetación de `docs/project/Política de privacidad.html` y `docs/project/Política de cookies.html`.
- El footer ya definido en esas páginas debe reutilizarse como punto persistente para cambiar preferencias.

## 2) Impact Analysis

### Epic Impact

- No invalida épicas 1–8-f.
- Añade alcance nuevo transversal de compliance frontend.
- Se propone nueva épica: `Epic 9: Gestión de consentimiento de cookies (OSS)`.

### Story Impact

- Nuevas historias propuestas:
  - `9-f1` Integrar librería OSS y capa de dominio de consentimiento.
  - `9-f2` Banner y panel de preferencias con categorías.
  - `9-f3` Gating de scripts no esenciales.
  - `9-f4` Acceso persistente en footer legal existente.
  - `9-f5` QA funcional, accesibilidad y evidencia de cumplimiento.

### Artifact Conflicts / Updates

- `docs/prd.md`: faltaban requisitos funcionales y no funcionales para cookies.
- `_bmad-output/planning-artifacts/epics.md`: faltaba épica/storyline específica.
- `docs/architecture.md`: faltaban reglas de diseño técnico para consentimiento y gating.
- `_bmad-output/project-context.md`: se refuerza regla de diseño legal/fallback.
- `_bmad-output/implementation-artifacts/sprint-status.yaml`: faltaba registro de nueva épica.

### Technical Impact

- Integración frontend de CMP OSS recomendada: `@orestbida/cookieconsent`.
- Nuevo `CookieConsentService` en `core/services/`.
- Gating de scripts no esenciales por categoría.
- Gestión de `policyVersion` para re-consentimiento.
- No requiere cambios de backend para iniciar implementación.

## 3) Recommended Approach

Enfoque seleccionado: **Direct Adjustment (Option 1)**.

Racional:

- Resuelve el gap sin rollback de trabajo ya completado.
- Mantiene trazabilidad BMAD y minimiza retrabajo.
- Bajo riesgo técnico al encapsular la librería en servicio propio.

Estimación:

- Esfuerzo: **medio**.
- Riesgo: **bajo-medio**.
- Impacto en timeline: acotado (nueva épica frontend sin bloquear épicas ya completadas).

## 4) Detailed Change Proposals

### A) Epics (`_bmad-output/planning-artifacts/epics.md`)

**OLD**

- Última épica de cambios transversales: `8-f`.

**NEW**

- Nueva `Epic 9` con 5 historias (`9-f1..9-f5`) para consentimiento OSS.
- Restricción explícita: maquetación legal vinculante y reutilización de footer existente.

**Justificación**

- Aísla el trabajo de compliance en un paquete implementable, testeable y auditable.

### B) PRD (`docs/prd.md`)

**OLD**

- Sin bloque específico de requisitos de cookies.

**NEW**

- Nueva sección `18. Gestión de consentimiento de cookies (MVP)` con:
  - FR-F38..FR-F41
  - NFR-F14..NFR-F16

**Justificación**

- Añade criterio de aceptación de producto/compliance sin alterar núcleo de negocio.

### C) Architecture (`docs/architecture.md`)

**OLD**

- Sin reglas técnicas explícitas para CMP y gating.

**NEW**

- Reglas `[Cookies]` en sección de presentación/arquitectura:
  - librería OSS, categorías, gating, `policyVersion`, punto persistente, copy desacoplado.
  - restricción explícita de footer legal existente.

**Justificación**

- Evita ambigüedad en implementación y reduce riesgo de regresión legal/UX.

### D) Project Context (`_bmad-output/project-context.md`)

**OLD**

- Reglas generales de diseño vinculante.

**NEW**

- Regla explícita para legal/cookies con referencia a ambos HTML y footer existente.

**Justificación**

- Refuerza el guardrail para próximas historias y agentes.

### E) Sprint Tracking (`_bmad-output/implementation-artifacts/sprint-status.yaml`)

**OLD**

- Sin `epic-9`.

**NEW**

- Alta de `epic-9` y stories `9-f1..9-f5` en estado `backlog`.

**Justificación**

- Deja el backlog listo para ejecución ordenada.

## 5) Implementation Handoff

### Scope Classification

- **Moderate**: requiere reorganización de backlog frontend y ejecución coordinada dev + revisión.

### Handoff Recipients

- **Product Owner / Developer**
  - Crear story files `9-f1..9-f5`.
  - Planificar orden de ejecución (prioridad: 9-f1 → 9-f2 → 9-f3 → 9-f4 → 9-f5).
- **Developer**
  - Implementar integración OSS y servicios.
  - Implementar UX respetando maquetación legal y footer existente.
  - Añadir pruebas y evidencias.

### Success Criteria

- No se ejecutan cookies/scripts no esenciales sin consentimiento.
- Usuario puede aceptar/rechazar/configurar y volver a cambiar decisión.
- Integración visual respeta `Política de privacidad.html` y `Política de cookies.html`.
- Footer existente es el punto persistente de acceso a configuración.
- Evidencia de QA funcional + accesibilidad disponible.

## Estado de aprobación

- Modo: **Incremental**.
- Aprobación del usuario por bloque: **A / A / A / E→A**.
- Resultado: **aprobado para implementación**.
