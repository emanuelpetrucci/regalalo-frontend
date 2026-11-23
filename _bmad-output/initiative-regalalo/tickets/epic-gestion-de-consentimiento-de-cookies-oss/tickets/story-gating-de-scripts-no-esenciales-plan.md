---
ticket: 3
status: done
type: feature
migrated_from: v6
---

# Story 9.3: Gating de scripts no esenciales

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed - comprehensive developer guide created. -->

## Story

Como equipo de producto,
quiero bloquear scripts no esenciales hasta consentimiento explicito por categoria,
para cumplir requisitos de privacidad en Espana/UE sin romper el comportamiento actual de la app.

**FR:** FR-F40, FR-F41 · **NFR:** NFR-F14, NFR-F15, NFR-F16 · **Epica:** 9

## Acceptance Criteria

1. **Bloqueo por defecto al cargar la app**
   - **Given** un usuario sin consentimiento previo para categorias opcionales
   - **When** la app inicializa y se renderiza landing u otras vistas con tracking
   - **Then** scripts/cookies no esenciales (analytics, marketing) no se ejecutan
   - **And** solo `necessary` queda activa por defecto.

2. **Activacion condicionada por consentimiento**
   - **Given** un consentimiento existente o actualizado por el usuario
   - **When** `CookieConsentService` indica categoria permitida
   - **Then** solo se cargan scripts de la(s) categoria(s) aprobada(s)
   - **And** no se carga ningun script de categorias denegadas.

3. **Actualizacion coherente tras cambios de preferencias**
   - **Given** el usuario cambia preferencias desde banner/panel
   - **When** se persiste el nuevo snapshot de consentimiento
   - **Then** el estado de carga de scripts se actualiza de forma coherente con el nuevo consentimiento
   - **And** no hay doble inyeccion de scripts ni ejecuciones duplicadas.

4. **Integracion segura con SEO/analytics existente**
   - **Given** el flujo actual de `LandingSeoService`
   - **When** se aplica gating de analitica
   - **Then** se preserva la inicializacion SEO/meta estructural existente
   - **And** solo la carga de analytics queda condicionada por consentimiento.

5. **Accesibilidad, trazabilidad y no regresion**
   - **Given** la implementacion completa de gating
   - **When** se ejecutan pruebas funcionales y de accesibilidad
   - **Then** se valida que no se dispara analytics antes de consentimiento
   - **And** se mantiene trazabilidad via `policyVersion`, categorias y `updatedAt`.

## Tasks / Subtasks

- [x] Definir orquestacion de gating por categoria (AC: 1, 2, 3)
  - [x] Usar `CookieConsentService.canRun('analytics' | 'marketing' | 'preferences')` como unica fuente de verdad para decision de carga.
  - [x] Centralizar decision de carga para evitar que features llamen scripts externos directamente.
  - [x] Mantener idempotencia de inyeccion (una sola vez por script/categoria).

- [x] Integrar gating en flujo real de analytics existente (AC: 1, 2, 4)
  - [x] Revisar y adaptar `LandingSeoService.initAnalytics()` para que cargue GA solo si `analytics` esta concedida.
  - [x] Evitar condicionamientos SEO no relacionados: canonical, OpenGraph y JSON-LD deben permanecer intactos.
  - [x] Mantener guardas browser-only para compatibilidad SSR/hidratacion.

- [x] Gestionar transiciones de consentimiento sin inconsistencias (AC: 3)
  - [x] Definir comportamiento al pasar de `denied` a `granted` (habilitar carga) y de `granted` a `denied` (bloquear nuevas cargas; no asumir "unload" de terceros).
  - [x] Garantizar que cambios de preferencias no duplican tags ni listeners.
  - [x] Documentar limites tecnicos cuando un proveedor no soporte desactivacion retroactiva.

- [x] Alinear con requisitos legales y tecnicos vigentes (AC: 1-5)
  - [x] Mantener solucion OSS basada en `vanilla-cookieconsent`.
  - [x] Mantener `policyVersion` y snapshot como base de trazabilidad.
  - [x] No tocar `src/app/core/api/generated/` ni alterar maquetacion legal (9.4 cubre acceso persistente en footer).

- [x] Pruebas de historia (AC: 1-5)
  - [x] Unit tests para ramas `canRun=false` y `canRun=true` en carga de analytics.
  - [x] Test de no-regresion: analytics no se inyecta antes de consentimiento.
  - [x] Test de idempotencia: sin inyecciones duplicadas tras reaplicar preferencias.
  - [x] Test de compatibilidad browser/SSR (sin acceso inseguro a `window/document` fuera de browser).

### Review Findings

- [x] [Review][Patch] Carrera de revocacion: `gtag('config')` puede quedar en cola tras revocar consentimiento [src/app/core/seo/landing-seo.service.ts:211]
- [x] [Review][Patch] Reactividad amplia por `updatedAt` dispara reintentos innecesarios de init de analytics [src/app/features/landing/landing.component.ts:40]
- [x] [Review][Defer] `CookieConsentService.init()` no limpia `cookieConsentLibPromise` tras fallo de import [src/app/core/services/cookie-consent.service.ts:83] — deferred, pre-existing

## Dev Notes

### Contexto funcional y dependencias de epica

- 9.3 depende de 9.1 (`CookieConsentService`) y de 9.2 (captura UX de consentimiento); no debe reimplementar banner/panel.
- 9.3 desbloquea 9.5 (evidencia QA completa), y 9.4 sigue separado para acceso persistente en footer legal.
- El tracking de sprint usa keys `9-3-*` en `sprint-status.yaml`; mantener ese formato.

### Requisitos tecnicos obligatorios (arquitectura + PRD)

- Reglas `[Cookies]` en arquitectura: scripts no esenciales bloqueados antes de consentimiento, con control por categoria y `policyVersion`.
- Categorias minimas: `necessary` (siempre activa), `analytics`, `marketing`, `preferences`.
- Persistencia obligatoria: snapshot de consentimiento (`policyVersion`, categorias, `updatedAt`).
- Cumplimiento legal/UX: no redisenar `docs/project/Política de privacidad.html` ni `docs/project/Política de cookies.html`.

### Archivos y zonas a tocar (esperado)

- `src/app/core/seo/landing-seo.service.ts` (UPDATE): aplicar gating real sobre carga de GA (`initAnalytics`), preservando SEO.
- `src/app/features/landing/landing.component.ts` (UPDATE menor): mantener flujo actual sin inicializaciones paralelas no controladas.
- `src/app/core/services/cookie-consent.service.ts` (UPDATE opcional): solo si se requiere exponer hook/control adicional para transiciones.
- `src/app/core/services/cookie-consent.service.spec.ts` (UPDATE): ampliar pruebas de gating/idempotencia.
- `src/app/core/seo/*.spec.ts` o test equivalente (NEW/UPDATE): pruebas unitarias de no carga/carga condicional.
- `public/i18n/*.json` (UPDATE opcional): solo si se requiere copy tecnico de estados de tracking; evitar hardcode.

### Estado actual de los archivos UPDATE relevantes

- `cookie-consent.service.ts`: ya ofrece `canRun(category)` y snapshot persistente; debe reutilizarse, no duplicarse.
- `landing-seo.service.ts`: hoy inyecta GA si hay `googleAnalyticsId` y bandera interna `analyticsLoaded`; actualmente no consulta consentimiento.
- `landing.component.ts`: invoca `initAnalyticsIfNeeded()` en `ngOnInit`; cualquier gating debe respetar este punto de entrada o moverlo de forma controlada.
- `app.config.ts`: ya inicializa `CookieConsentService` en bootstrap; no mover a lazy init para no romper orden de consentimiento.

### Inteligencia de historias previas (9.1 / 9.2)

- Import dinamico browser-only ya resuelto para libreria de consentimiento: mantener este patron.
- Evitar estado bloqueado tras error de init y respetar resiliencia de `localStorage`.
- 9.2 dejo explicitamente fuera de alcance el gating de scripts; 9.3 debe cerrarlo sin invadir alcance de 9.4.
- Mantener `necessary` siempre en `true` y no permitir rutas alternativas que lo desactiven.

### Inteligencia de git reciente

- Estilo de commits reciente: `fix(scope): ...` con cambios acotados y foco en regresion safety.
- Existe commit reciente especifico de cookies y otro de config/budgets; reutilizar patrones ya aceptados en la base.

### Web intelligence (actualizado)

- `vanilla-cookieconsent` estable: `3.1.0` (npm/package oficial) sin dependencias transitivas.
- Para tags de Google, la documentacion oficial de Consent Mode v2 exige setear estado `default` antes de `config/event` y aplicar `update` al cambiar consentimiento.
- En esta historia, como minimo garantizar modo "basic gating": no cargar script de analytics hasta consentimiento `analytics=true`.

### Guardrails anti-regresion y anti-patrones

- No crear un segundo servicio de consentimiento ni wrappers duplicados.
- No inyectar scripts desde componentes de feature; mantener integracion en capa de servicios/SEO.
- No asumir que "revocar consentimiento" elimina cookies historicas de terceros; enfocarse en bloqueo de nuevas ejecuciones y documentar limites.
- No romper metadatos SEO ni rendering de landing al introducir gating.

### Testing Requirements

- Verificar ausencia de inyeccion de GA cuando `analytics=false`.
- Verificar inyeccion unica de GA cuando `analytics=true`.
- Verificar que cambios repetidos de preferencias no duplican script tag `ga-gtag`.
- Verificar que no hay excepciones en entornos sin `window` (SSR safety).

### References

- [Source: `_bmad-output/initiative-regalalo/archive-v6/epics.md` - Epic 9 / Story 9-f3]
- [Source: `docs/prd.md` - Seccion 18 (FR-F40, FR-F41; NFR-F14..NFR-F16)]
- [Source: `docs/architecture.md` - Reglas `[Cookies]` en seccion 6]
- [Source: `_bmad-output/initiative-regalalo/sprint-change-proposal-2026-05-28-cookies-consent.md`]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/9-1-integrar-libreria-oss-y-capa-de-dominio-de-consentimiento.md`]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/9-2-banner-y-panel-de-preferencias-con-categorias.md`]
- [Source: `_bmad-output/project-context.md` - restriccion legal/cookies y footer existente]
- [Source: https://www.npmjs.com/package/vanilla-cookieconsent]
- [Source: https://developers.google.com/tag-platform/security/guides/consent]

## Dev Agent Record

### Agent Model Used

Codex 5.3

### Debug Log References

- create-story: deteccion automatica de primera historia backlog en sprint-status (`9-3-gating-de-scripts-no-esenciales`).
- Carga de contexto: `epics.md`, `docs/prd.md`, `docs/architecture.md`, proposal cookies 2026-05-28 y stories previas 9.1/9.2.
- Analisis de codigo actual: `cookie-consent.service.ts`, `landing-seo.service.ts`, `landing.component.ts`, `app.config.ts`.
- Web check: `vanilla-cookieconsent` estable 3.1.0 y pauta oficial Consent Mode v2 para orden `default/update`.
- Implementacion: gating real de GA en `LandingSeoService` via `CookieConsentService.canRun('analytics')`.
- Reactividad de consentimiento: `CookieConsentService.snapshot` expuesto como readonly signal y consumo en `LandingComponent` con `effect()` para reintento controlado.
- Validacion: `npm run test -- --watch=false --include="src/app/core/seo/landing-seo.service.spec.ts" --include="src/app/core/services/cookie-consent.service.spec.ts"` (15 tests OK).

### Completion Notes List

- Historia 9.3 creada con AC BDD, tareas accionables y guardrails especificos para evitar regresiones de SEO/SSR.
- Contexto incluye continuidad tecnica de 9.1/9.2 y rutas concretas de implementacion para gating por categoria.
- Documento listo para ejecucion directa por `dev-story`.
- Se bloqueo la inyeccion de GA por defecto hasta consentimiento `analytics=true`, manteniendo intacto el flujo de canonical/OpenGraph/JSON-LD.
- Se agrego reaccion a cambios de consentimiento en landing para activar GA tras aceptar analitica sin duplicar scripts.
- Limite tecnico documentado en implementacion: al revocar consentimiento se bloquean nuevas cargas, pero no se "desinyectan" scripts/cookies ya creadas por terceros.

### File List

- `_bmad-output/initiative-regalalo/archive-v6/9-3-gating-de-scripts-no-esenciales.md`
- `src/app/core/seo/landing-seo.service.ts`
- `src/app/features/landing/landing.component.ts`
- `src/app/core/services/cookie-consent.service.ts`
- `src/app/core/seo/landing-seo.service.spec.ts`
- `_bmad-output/initiative-regalalo/archive-v6/sprint-status.yaml`

### Change Log

- 2026-05-28: Implementado gating de analytics por consentimiento, reactividad a cambios de snapshot y pruebas unitarias de no-regresion/idempotencia en SEO+cookies.
