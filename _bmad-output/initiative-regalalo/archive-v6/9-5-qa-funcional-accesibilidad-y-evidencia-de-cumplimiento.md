# Story 9.5: QA funcional, accesibilidad y evidencia de cumplimiento

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed - comprehensive developer guide created. -->

## Story

Como equipo de desarrollo,  
quiero validar el flujo de cookies con pruebas automatizadas y checklist de accesibilidad,  
para asegurar funcionamiento, cumplimiento legal/UX y trazabilidad auditable antes de cerrar la épica 9.

**FR:** FR-F38, FR-F39, FR-F40, FR-F41 · **NFR:** NFR-F2, NFR-F14, NFR-F15, NFR-F16 · **Epica:** 9

## Acceptance Criteria

1. **Cobertura funcional del ciclo completo de consentimiento**
   - **Given** el usuario en primera visita sin snapshot de consentimiento
   - **When** interactua con banner/panel (aceptar todo, rechazar no esenciales, configurar)
   - **Then** existen pruebas automatizadas que cubren primera decision, rechazo, aceptacion, edicion posterior y persistencia en recarga.

2. **Verificacion de gating de scripts no esenciales**
   - **Given** estado sin consentimiento de `analytics`/`marketing`
   - **When** se ejecutan pruebas de integracion/servicio SEO
   - **Then** se verifica que no se inyecta ni ejecuta analytics antes de consentimiento explicito
   - **And** tras conceder `analytics`, la carga ocurre una sola vez (idempotencia, sin duplicados).

3. **Accesibilidad WCAG AA en interacciones clave**
   - **Given** banner de cookies y panel de preferencias abiertos
   - **When** se navega por teclado y se evalua estructura accesible
   - **Then** las interacciones clave cumplen WCAG AA (foco visible, nombre accesible, activacion teclado, dialogo anunciable y cierre controlado).

4. **No regresion de maquetacion legal y acceso persistente**
   - **Given** las vistas legales implementadas segun `Política de privacidad.html` y `Política de cookies.html`
   - **When** se ejecuta la bateria de QA de epica 9
   - **Then** se valida que el acceso persistente desde footer sigue operativo
   - **And** no hay desviaciones estructurales del footer legal existente.

5. **Evidencia de cumplimiento trazable para revision**
   - **Given** la ejecucion de tests y checks de accesibilidad de la historia
   - **When** finaliza la corrida de QA
   - **Then** queda evidencia reproducible (resultados de tests, casos cubiertos, verificacion a11y) en artefactos del repositorio y/o salida CI.

## Tasks / Subtasks

- [x] Consolidar matriz de escenarios de consentimiento (AC: 1, 5)
  - [x] Documentar escenarios minimos: primera visita, aceptar todo, rechazar no esenciales, edicion posterior, persistencia post-recarga.
  - [x] Mapear cada escenario a pruebas existentes y detectar gaps reales.

- [x] Completar pruebas unitarias/integracion de consentimiento (AC: 1, 2)
  - [x] Extender `cookie-consent.service.spec.ts` para reforzar cobertura de persistencia y cambios de preferencias.
  - [x] Extender `landing-seo.service.spec.ts` para verificar gating estricto e idempotencia de carga analytics.
  - [x] Asegurar que los tests no dependan de red externa ni side effects globales.

- [x] Validar accesibilidad de banner/panel y control persistente (AC: 3, 4)
  - [x] Verificar por test (o helper dedicado) presencia de nombre accesible y operabilidad por teclado en el control de reapertura desde footer.
  - [x] Verificar comportamiento de foco en apertura/cierre del panel de preferencias (entrada, navegacion, cierre y retorno del foco al trigger cuando aplique).
  - [x] Mantener conformidad con WCAG AA y reglas del proyecto (NFR-F2).

- [x] Verificar no regresion visual/estructural legal (AC: 4)
  - [x] Comprobar que el footer legal existente se reutiliza y no se duplica.
  - [x] Confirmar que enlaces legales y accion de "cambiar configuracion de cookies" permanecen funcionales.

- [x] Generar evidencia de cumplimiento y resumen QA (AC: 5)
  - [x] Registrar comando(s) de test ejecutados y resultado.
  - [x] Enumerar cobertura final por AC en el registro de historia/PR.
  - [x] Dejar nota explicita de limites tecnicos conocidos (ej. revocacion no elimina cookies historicas de terceros).

### Review Findings

- [x] [Review][Patch] Cobertura de AC2 para `marketing` reforzada con caso explicito de no inyeccion cuando `analytics=false` y `marketing=true` [src/app/core/seo/landing-seo.service.spec.ts:88]
- [x] [Review][Patch] Precarga de traducciones ajustada a locale activo para reducir latencia de inicializacion [src/app/core/services/cookie-consent.service.ts:293]
- [x] [Review][Patch] Pruebas de contrato accesible del panel de preferencias (titulo, cierre, secciones y acciones) [src/app/core/services/cookie-consent.service.spec.ts:230]
- [x] [Review][Patch] Test legal desacoplado de copy literal y verificacion de accion persistente por interaccion real [src/app/features/legal/legal-pages.component.spec.ts:112]
- [x] [Review][Patch] Sincronizacion async unificada con `vi.waitFor` en specs de consentimiento [src/app/core/services/cookie-consent.service.spec.ts:118]
- [x] [Review][Defer] Riesgo preexistente: init de analytics puede quedarse bloqueado si existe script previo sin evento observable [src/app/core/seo/landing-seo.service.ts:50] — deferred, pre-existing
- [x] [Review][Defer] Semantica parcial de `setPreferences` resetea categorias omitidas; issue heredado [src/app/core/services/cookie-consent.service.ts:213] — deferred, pre-existing

## Dev Notes

### Contexto funcional y alcance

- Esta historia es de cierre de calidad de la epica 9; no introduce nuevas features de consentimiento.
- Debe validar conjuntamente lo implementado en 9.1 (servicio), 9.2 (banner/panel), 9.3 (gating) y 9.4 (acceso persistente en footer legal).
- El resultado esperado es evidencia reproducible de funcionamiento + accesibilidad + no regresion visual/legal.

### Requisitos tecnicos obligatorios (arquitectura y epics)

- `docs/architecture.md` exige:
  - libreria OSS `@orestbida/cookieconsent` encapsulada en `CookieConsentService`;
  - categorias minimas `necessary`, `analytics`, `marketing`, `preferences`;
  - gating de scripts no esenciales antes de consentimiento;
  - persistencia con `policyVersion` y timestamp;
  - acceso persistente desde footer legal existente, sin rediseno.
- `epics.md` (Story 9-f5) exige cubrir primera decision, rechazo, aceptacion, edicion posterior, persistencia y WCAG AA.

### Archivos candidatos a UPDATE en 9.5 (leer y respetar)

- `src/app/core/services/cookie-consent.service.spec.ts`
- `src/app/core/seo/landing-seo.service.spec.ts`
- `src/app/features/landing/landing.component.spec.ts` (si se incorpora verificacion de wiring UX/cookies)
- `src/app/core/services/cookie-consent.service.ts` (solo si surge ajuste menor para testabilidad, evitando cambios de alcance)
- `src/app/core/seo/landing-seo.service.ts` (solo ajustes minimos si algun test detecta regresion real)

### Estado actual relevante (base de partida)

- `CookieConsentService` ya expone `snapshot`, `canRun`, persistencia y reset por `policyVersion`.
- `LandingSeoService` ya condiciona analytics por `canRun('analytics')` y evita doble inyeccion.
- Existen specs base de cookies/SEO, pero 9.5 debe cerrar cobertura integral por AC y evidencia auditable.

### Inteligencia de historia previa (9.4)

- 9.4 dejo como guardrail no duplicar footer legal ni crear acceso paralelo fuera del footer existente.
- 9.4 reafirma que reapertura de preferencias debe pasar por `CookieConsentService`, no por acceso directo a proveedor desde componentes.
- 9.5 debe verificar ambos puntos como no-regresion, no reimplementar su funcionalidad.

### Inteligencia adicional de historia 9.3 (gating)

- La reaccion a consentimiento en landing y el gating en `LandingSeoService` ya estan implementados.
- El foco de 9.5 es validar escenarios limite: no inyeccion previa, inyeccion unica post-consentimiento y estabilidad tras cambios repetidos.

### Inteligencia de git reciente (patrones a preservar)

- Commits recientes relevantes:
  - `c392808 feat(gating): implement analytics gating based on user consent`
  - `140bc93 fix(config): update Angular budgets and add vanilla-cookieconsent dependency`
  - `140fefd fix(cookies): implement cookie consent management in compliance with EU regulations`
- Patron observado: cambios acotados, centrados en cumplimiento y seguridad de regresion; mantener esa estrategia en 9.5.

### Web intelligence (vigencia tecnica)

- `vanilla-cookieconsent` se mantiene estable en `3.1.0`; no se requiere migracion para esta historia de QA.
- Referencia oficial de axe-core: usar tags WCAG (`wcag2a`, `wcag2aa`, y cuando aplique `wcag22aa`) para barrido automatizado consistente.
- Referencia WAI-ARIA APG (dialog modal): validar foco inicial, ciclo con `Tab/Shift+Tab`, cierre y retorno de foco al trigger cuando corresponda.

### Guardrails anti-patrones / anti-regresion

- No crear nueva implementacion de CMP ni nuevo servicio paralelo.
- No mover logica de gating a componentes UI.
- No modificar `src/app/core/api/generated/`.
- No alterar maquetacion/token legal de `docs/project/*` durante tareas de QA.
- Priorizar pruebas deterministas (sin dependencias de red/tiempo inestable).

### Testing Requirements (definicion de hecho para 9.5)

- Cobertura automatizada de escenarios funcionales AC1.
- Verificacion automatizada de gating/idempotencia AC2.
- Verificacion de accesibilidad en interacciones clave AC3.
- Verificacion de no-regresion de footer/acceso persistente AC4.
- Evidencia compilada y reutilizable para revision AC5.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` - Epic 9 / Story 9-f5]
- [Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-28-cookies-consent.md`]
- [Source: `_bmad-output/implementation-artifacts/9-4-acceso-persistente-en-footer-legal-existente.md`]
- [Source: `_bmad-output/implementation-artifacts/9-3-gating-de-scripts-no-esenciales.md`]
- [Source: `docs/architecture.md` - Seccion 6, reglas [Cookies]]
- [Source: https://www.npmjs.com/package/vanilla-cookieconsent]
- [Source: https://www.deque.com/axe/core-documentation/api-documentation/]
- [Source: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/dialog/]

## Dev Agent Record

### Agent Model Used

Codex 5.3

### Debug Log References

- create-story: deteccion automatica de primera historia en backlog (`9-5-qa-funcional-accesibilidad-y-evidencia-de-cumplimiento`).
- Carga de contexto: `epics.md`, proposal cookies 2026-05-28, stories 9.3 y 9.4, `docs/architecture.md`.
- Analisis de codigo actual: `cookie-consent.service.ts`, `landing-seo.service.ts`, `landing.component.ts`, specs relacionadas.
- Web check de vigencia tecnica: `vanilla-cookieconsent` y referencias oficiales axe-core / WAI-ARIA APG.
- Implementacion 2026-05-28: ampliadas pruebas QA en consentimiento/SEO/legal; corrida focalizada verde (24/24) y corrida completa con 1 fallo preexistente fuera de alcance (`publicar.component.spec.ts`).

### Completion Notes List

- Historia 9.5 creada con AC BDD, tareas accionables y guardrails concretos para cierre de QA y compliance de la epica 9.
- Contexto incluye continuidad tecnica de 9.3/9.4, patrones recientes de git y criterios de accesibilidad oficiales.
- Documento listo para ejecucion por `dev-story`.
- Ultimate context engine analysis completed - comprehensive developer guide created.
- Matriz de escenarios QA consolidada y cubierta:
  - Primera visita/sin snapshot: `cookie-consent.service.spec.ts` (`muestra banner en primera visita sin snapshot previo`).
  - Aceptar todo + persistencia: `cookie-consent.service.spec.ts` (`acceptAll habilita categorias opcionales y persiste snapshot para recarga`).
  - Rechazar no esenciales: `cookie-consent.service.spec.ts` (`rejectNonEssential desactiva analytics/marketing/preferences`).
  - Edicion posterior + persistencia: `cookie-consent.service.spec.ts` (`reapertura + cambio de preferencias actualiza snapshot persistido`).
  - Gating estricto + idempotencia analytics: `landing-seo.service.spec.ts` (`respeta gating estricto...` + `inyecta analytics una sola vez...`).
- A11y/no-regresion legal verificada en `legal-pages.component.spec.ts`:
  - Footer legal unico (sin duplicacion), enlaces legales funcionales y control persistente de cookies con nombre accesible.
- Evidencia de ejecucion:
  - `npm run test -- --watch=false --include="src/app/core/services/cookie-consent.service.spec.ts" --include="src/app/core/seo/landing-seo.service.spec.ts" --include="src/app/features/legal/legal-pages.component.spec.ts"` -> PASS (24/24).
  - `npm run test -- --watch=false` -> FAIL por 1 test preexistente fuera de alcance en `src/app/features/items/publicar/publicar.component.spec.ts` (`navigates to /mis-objetos on 201 (AC 1)`).
- Limite tecnico conocido: la revocacion de consentimiento no puede eliminar cookies historicas ya escritas por terceros; solo previene ejecuciones futuras segun categorias permitidas.

### File List

- `_bmad-output/implementation-artifacts/9-5-qa-funcional-accesibilidad-y-evidencia-de-cumplimiento.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/app/core/services/cookie-consent.service.spec.ts`
- `src/app/core/seo/landing-seo.service.spec.ts`
- `src/app/features/legal/legal-pages.component.spec.ts`

### Change Log

- 2026-05-28: historia movida a `in-progress` y luego `review`; ampliada cobertura QA de consentimiento (matriz funcional/persistencia), gating analytics idempotente y no-regresion legal/a11y de footer con evidencia reproducible en tests.
