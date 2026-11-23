# Story 9.1: Integrar libreria OSS y capa de dominio de consentimiento

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed - comprehensive developer guide created. Epica 9 cookies-consent (OSS) iniciada. -->

## Story

Como desarrollador frontend,
quiero integrar `@orestbida/cookieconsent` mediante un `CookieConsentService`,
para desacoplar la libreria de la logica de negocio y habilitar el resto de historias 9.2-9.5 sin deuda tecnica.

**FR:** FR-F38, FR-F39, FR-F41 · **NFR:** NFR-F14, NFR-F15, NFR-F16 · **Epica:** 9

## Acceptance Criteria

1. **Integracion base OSS y bootstrap temprano**
   - **Given** el arranque de la app Angular
   - **When** se inicializa la capa de consentimiento
   - **Then** la implementacion usa `@orestbida/cookieconsent` (open source)
   - **And** la inicializacion ocurre en bootstrap (no lazy dentro de una feature), para impedir ejecucion temprana de scripts no esenciales.

2. **Servicio de dominio desacoplado**
   - **Given** la app necesita leer o actualizar consentimiento
   - **When** un componente o servicio consulta estado
   - **Then** lo hace a traves de `CookieConsentService` en `src/app/core/services/`
   - **And** no hay llamadas directas a la API de la libreria desde componentes de feature.

3. **Categorias minimas y modelo canónico**
   - **Given** la configuracion de consentimiento
   - **When** se define el modelo de categorias
   - **Then** incluye como minimo `necessary` (siempre activa), `analytics`, `marketing` y `preferences`
   - **And** `necessary` no puede desactivarse.

4. **Persistencia con versionado de politica**
   - **Given** un consentimiento ya guardado
   - **When** la app vuelve a cargar
   - **Then** reusa estado persistido con timestamp y categorias aceptadas/rechazadas
   - **And** si cambia `policyVersion`, se invalida el consentimiento anterior y se fuerza re-consentimiento.

5. **Preparacion para gating (sin romper UX actual)**
   - **Given** esta historia es fundacional
   - **When** finaliza la implementacion
   - **Then** quedan expuestos metodos en el servicio para permitir gating por categoria en 9.3
   - **And** no se modifica aun el footer legal ni el banner final de producto (se implementan en 9.2 y 9.4).

## Tasks / Subtasks

### A. Dependencia e infraestructura (AC: 1)
- [x] Instalar dependencia: `npm install @orestbida/cookieconsent`.
- [x] Verificar que no colisiona con Angular SSR/hidratacion en `app.config.ts`.
- [x] Definir punto unico de inicializacion en bootstrap (recomendado: `provideAppInitializer` junto a inicializadores existentes).

### B. Modelo de dominio y servicio core (AC: 2, 3, 4, 5)
- [x] Crear `src/app/core/services/cookie-consent.service.ts`.
- [x] Definir tipos del dominio (sin `any`):
  - [x] `CookieCategory = 'necessary' | 'analytics' | 'marketing' | 'preferences'`
  - [x] `ConsentSnapshot` (categorias, version, fecha de actualizacion, origen)
- [x] Implementar API minima del servicio:
  - [x] `init(): Promise<void>`
  - [x] `acceptAll(): void`
  - [x] `rejectNonEssential(): void`
  - [x] `setPreferences(partialCategories): void`
  - [x] `getSnapshot(): ConsentSnapshot`
  - [x] `canRun(category: Exclude<CookieCategory, 'necessary'>): boolean`
  - [x] `resetIfPolicyVersionChanged(currentVersion: string): void`
- [x] Encapsular todos los detalles de la libreria dentro del servicio.

### C. Integracion en arranque global (AC: 1, 4)
- [x] Registrar inicializacion de `CookieConsentService` en `app.config.ts`.
- [x] Garantizar ejecucion segura en browser:
  - [x] Evitar acceso a `window/document` durante SSR.
  - [x] Ejecutar solo cuando exista contexto de navegador.
- [x] Definir `policyVersion` centralizada (constante en core/config) lista para bump controlado.

### D. Tests base de la historia (AC: 2, 3, 4, 5)
- [x] Crear `cookie-consent.service.spec.ts` con casos:
  - [x] Inicializa una sola vez (idempotente).
  - [x] `necessary` siempre activa.
  - [x] `rejectNonEssential` desactiva `analytics/marketing/preferences`.
  - [x] Cambio de `policyVersion` invalida snapshot previo.
  - [x] `canRun()` refleja correctamente el estado por categoria.

### Review Findings
- [x] [Review][Patch] Import de `vanilla-cookieconsent` potencialmente inseguro para SSR (se importa a nivel de módulo; mover a import dinámico/browser-only) [src/app/core/services/cookie-consent.service.ts]
- [x] [Review][Patch] `init()` queda en estado rechazado permanente si `CookieConsent.run()` falla una vez (falta recuperación/reintento y fallback seguro) [src/app/core/services/cookie-consent.service.ts]
- [x] [Review][Patch] Métodos mutadores (`acceptAll`, `rejectNonEssential`, `setPreferences`) no garantizan init previo de la librería [src/app/core/services/cookie-consent.service.ts]
- [x] [Review][Patch] Persistencia no resiliente ante excepciones de `localStorage` (get/set/remove) [src/app/core/services/cookie-consent.service.ts]
- [x] [Review][Patch] `updatedAt` se reescribe en cada arranque y no preserva el timestamp del consentimiento restaurado (desalineado con AC4) [src/app/core/services/cookie-consent.service.ts]
- [x] [Review][Patch] Inconsistencia de dependencia vs especificación: se usa `vanilla-cookieconsent` desde GitHub SSH, no paquete de registry/versionado reproducible [package.json]
- [x] [Review][Patch] Cobertura de tests insuficiente para fallos críticos (run rechaza, SSR/no-browser, storage restringido, llamadas pre-init) [src/app/core/services/cookie-consent.service.spec.ts]
- [x] [Review][Patch] Inconsistencia de estado en trazabilidad: comentario marca `ready-for-dev` mientras `development_status` marca `review` [\_bmad-output/implementation-artifacts/sprint-status.yaml]
- [x] [Review][Defer] Gating de analytics aún no conectado en `LandingSeoService`/`LandingComponent` [src/app/core/seo/landing-seo.service.ts] — deferred, pre-existing

## Dev Notes

### Contexto tecnico actual (archivos leidos)

| Archivo | Estado actual | Cambio requerido en 9.1 |
|---|---|---|
| `package.json` | No incluye `@orestbida/cookieconsent` | Agregar dependencia OSS |
| `src/app/app.config.ts` | Inicializa locale/SEO/reCAPTCHA | Agregar init de `CookieConsentService` en bootstrap |
| `src/main.ts` | `bootstrapApplication(App, appConfig)` | Sin cambios (hook por config) |
| `src/app/app.routes.ts` | Rutas landing/auth/appshell | Sin cambios en 9.1 |
| `src/app/features/landing/landing.component.ts` | Llama `landingSeo.initAnalyticsIfNeeded()` | No tocar en 9.1; 9.3 debe alinear esta inicializacion con gating por consentimiento |
| `src/app/features/landing/landing.component.html` | Footer legal con placeholders `href="#"` | No tocar en 9.1; 9.4 implementa acceso persistente real |

### Guardrails de arquitectura (obligatorios)

- Mantener patron Angular del proyecto: servicios en `core/services`, componentes sin logica de proveedor externo.
- No editar `src/app/core/api/generated/` (irrelevante para cookies y prohibido por regla global).
- No introducir UI kit externo ni cambios visuales fuera de `docs/project/`.
- Mantener compatibilidad SSR/hidratacion: inicializacion condicionada a browser.
- Evitar acoplar copy legal duro en el servicio; dejar textos para i18n/config.

### Requisitos de libreria y framework (latest known)

- Libreria objetivo aprobada por Correct Course: `@orestbida/cookieconsent`.
- Angular 21 + TypeScript estricto: todo tipado explicito, sin `any`.
- El servicio debe exponer API estable para historias siguientes; no filtrar tipos internos de la libreria en capas de feature.

### Estructura de archivos esperada

- **Nuevo:** `src/app/core/services/cookie-consent.service.ts`
- **Nuevo:** `src/app/core/services/cookie-consent.service.spec.ts`
- **Update:** `src/app/app.config.ts`
- **Update opcional de soporte:** `src/app/core/services/index` o barrel equivalente si existe

### Inteligencia de historia previa / continuidad

- No hay historia previa dentro de la epica 9.
- Dependencias de orden: 9.1 desbloquea 9.2 (banner/panel), 9.3 (gating), 9.4 (footer persistente), 9.5 (QA evidencia).

### Git intelligence (ultimos commits)

- `140fefd` - `fix(cookies): implement cookie consent management in compliance with EU regulations`
- `3a738e5` - `fix(delivery): mostrar miniatura del item en filas del listado de entregas`
- `e4cc492` - `fix: show request count per item and fix candidate avatar initials`
- `b6d3d1f` - `fix(ui): scopear breakpoint responsive al shell de pagina para no afectar modal`
- `44103e2` - `fix(ui): alinear diseno pagina detalle item con resto de la web`

**Aplicacion para 9.1:** seguir estilo de commits `fix(...)`, cambios acotados y orientados a regression safety.

### Riesgos y anti-regresiones

- Riesgo SSR: acceso prematuro a APIs de navegador durante render server.
- Riesgo de deuda: usar la libreria directo en componentes y perder encapsulacion.
- Riesgo de cumplimiento: no versionar consentimiento (`policyVersion`) y no forzar reconsentimiento al cambiar politica.
- Riesgo UX/legal: tocar footer o layout legal en 9.1 (fuera de alcance y potencial desviacion del prototipo).

### Testing Requirements

- Unit tests obligatorios del servicio (idempotencia, categorias, versionado).
- Verificar que la app arranca en modo dev/build sin errores de DI por nuevo servicio.
- Preparar test hooks para validar gating en 9.3 sin reescritura del servicio.

### Referencias

- [Source: `_bmad-output/planning-artifacts/epics.md` - Epic 9 / Story 9-f1]
- [Source: `docs/prd.md` - Seccion 18 cookies (FR-F38..FR-F41, NFR-F14..F16)]
- [Source: `docs/architecture.md` - Reglas `[Cookies]` en seccion 6]
- [Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-28-cookies-consent.md`]
- [Source: `_bmad-output/project-context.md` - regla legal/cookies y footer existente]

## Dev Agent Record

### Agent Model Used

Codex 5.3

### Debug Log References

- Flujo create-story ejecutado sobre sprint-status + epics + architecture + PRD/proposal cookies.
- 2026-05-28: `npm install github:orestbida/cookieconsent` (el scope `@orestbida/cookieconsent` no existe en npm, se integra el repo oficial que publica `vanilla-cookieconsent`).
- 2026-05-28: `npm run test -- --watch=false --include="src/app/core/services/cookie-consent.service.spec.ts"` ✅ (5/5 tests).
- 2026-05-28: `npm run test -- --watch=false` ❌ con 1 fallo preexistente en `auth-layout.component.spec.ts` (brand title esperado desactualizado).
- 2026-05-28: `npm run build` ❌ por budget SCSS preexistente en `perfil.component.scss`.

### Completion Notes List

- Integrada libreria OSS de Orest Bida y encapsulada en `CookieConsentService` sin exponer API de proveedor en features.
- Inicializacion de consentimiento conectada en bootstrap global (`app.config.ts`) y protegida para ejecución solo en navegador.
- Modelo canónico implementado (`CookieCategory`, `ConsentSnapshot`) con `necessary` siempre activa y API de gating preparada para 9.3 (`canRun`).
- Versionado de política centralizado en `COOKIE_CONSENT_POLICY_VERSION` y reset automático de snapshot al cambiar versión.
- Tests unitarios de la historia añadidos y pasando en ejecución focalizada.

### File List

- `_bmad-output/implementation-artifacts/9-1-integrar-libreria-oss-y-capa-de-dominio-de-consentimiento.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `package.json`
- `package-lock.json`
- `src/app/app.config.ts`
- `src/app/core/config/cookie-consent.config.ts`
- `src/app/core/services/cookie-consent.service.ts`
- `src/app/core/services/cookie-consent.service.spec.ts`

### Change Log

- 2026-05-28: Integración fundacional de consentimiento OSS, servicio de dominio, bootstrap global seguro para SSR y suite base de pruebas para AC 1-5.
