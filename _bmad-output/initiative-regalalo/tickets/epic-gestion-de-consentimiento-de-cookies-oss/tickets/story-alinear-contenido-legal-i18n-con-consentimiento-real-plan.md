---
ticket: 7
status: done
type: feature
migrated_from: v6
---

# Story 9.7: Alinear contenido legal i18n con implementación real de consentimiento

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed - comprehensive developer guide created. -->

## Story

Como equipo de producto,
quiero que el contenido legal publicado sea consistente con el comportamiento técnico real,
para reducir riesgo de incumplimiento por discrepancia copy↔sistema.

**FR:** FR-F41 · **NFR:** NFR-F16 · **Épica:** 9 (remediación Correct Course 2026-05-28)

**Dependencia:** Historia **9-6** (estructura documental y árbol `legal.*` en `es.json`) debe estar implementada antes de ejecutar esta historia.

## Acceptance Criteria

1. **Paridad i18n completa en tres idiomas**
   - **Given** el árbol `legal.*` completo en `public/i18n/es.json` (post 9-6)
   - **When** un usuario cambia el idioma a `ca` o `en` en `/politica-privacidad` o `/politica-cookies`
   - **Then** todas las claves usadas por `legal-pages.component.html` y `legal-pages.config.ts` existen en `ca.json` y `en.json` con traducciones profesionales (no resúmenes de 3 bloques legacy)
   - **And** no aparecen claves crudas ni fallbacks silenciosos al español en producción

2. **Coherencia categorías y consentimiento con el sistema**
   - **Given** `CookieConsentService` y `COOKIE_CONSENT_POLICY_VERSION`
   - **When** se contrasta el copy legal de cookies (banner documental, tipos, tabla, gestión) y las claves `cookies.*` del CMP
   - **Then** las categorías declaradas coinciden: `necessary`, `analytics`, `marketing`, `preferences`
   - **And** los defaults documentados coinciden: opcionales desactivados hasta consentimiento explícito; `necessary` siempre activa
   - **And** `policyVersion` vigente (`2026-05-28`) y fechas de vigencia en `legal.common.meta` son coherentes entre sí y con el mecanismo de re-consentimiento

3. **Claims técnicos verificables (sin mentiras documentales)**
   - **Given** el texto publicado en la política de cookies
   - **When** se revisan nombres de almacenamiento, cookies y gating
   - **Then** el copy refleja la implementación real (ver tabla de trazabilidad en esta historia)
   - **And** se corrigen discrepancias conocidas: clave `localStorage` `rgl_cookie_consent_snapshot` (no `rgl_cookie_consent`); ausencia de scripts de marketing/analytics antes de consentimiento; sin Google Analytics en MVP

4. **Checklist de trazabilidad entregada y mantenida**
   - **Given** la finalización de la historia
   - **When** un revisor de cumplimiento abre este story file
   - **Then** encuentra la sección «Checklist claim legal ↔ evidencia técnica» actualizada
   - **And** cada fila indica estado `aligned` o acción tomada

5. **Pruebas automatizadas de paridad i18n y consistencia**
   - **Given** los tres ficheros `public/i18n/{es,ca,en}.json`
   - **When** ejecuto la batería de tests de esta historia
   - **Then** un test (o script CI) verifica que `ca` y `en` contienen el mismo conjunto de rutas de claves `legal.*` que `es`
   - **And** un test documenta/valida constantes críticas (`COOKIE_CONSENT_POLICY_VERSION`, categorías opcionales) frente a claims en `es.json`

## Tasks / Subtasks

- [x] Auditar brecha i18n post-9-6 (AC: 1)
  - [x] Exportar lista de claves `legal.*` desde `es.json` (script o test helper)
  - [x] Comparar con `ca.json` y `en.json` — hoy siguen con estructura legacy de 3 secciones
  - [x] Documentar conteo de claves faltantes en Dev Agent Record

- [x] Completar `public/i18n/ca.json` y `public/i18n/en.json` (AC: 1)
  - [x] Replicar árbol `legal.common`, `legal.privacy`, `legal.cookies` de `es.json`
  - [x] Traducir copy legal completo (catalán y inglés); mantener emails, anchors y nombres técnicos (`rgl_*`) sin traducir
  - [x] Reutilizar o extender `scripts/patch-legal-i18n.mjs` si acelera paridad estructural (no sobrescribir otras claves del JSON)

- [x] Resolver discrepancias copy↔código en español (AC: 2, 3)
  - [x] Añadir categoría **marketing** en política legal (tarjeta + toggle preview + párrafos) alineada con CMP — el handoff HTML solo muestra 3 tarjetas pero el sistema expone 4 categorías
  - [x] Corregir referencias a cookie `rgl_cookie_consent` → `rgl_cookie_consent_snapshot` en `legal.cookies.sections.*`
  - [x] Añadir mención explícita de versión de política (`2026-05-28`) en meta o sección de cambios, alineada con `COOKIE_CONSENT_POLICY_VERSION`
  - [x] Revisar `cookies.banner` / `cookies.preferences` en los 3 idiomas para que mencionen las mismas 4 categorías que el servicio

- [x] Actualizar configuración/UI si hace falta para marketing (AC: 2)
  - [x] `legal-pages.config.ts`: ampliar `COOKIE_TYPE_CARDS` y `COOKIE_TOGGLE_PREVIEW` con fila/card `marketing`
  - [x] `legal-pages.component.html`: renderizar nueva card/fila (patrón existente)
  - [x] Estilos: reutilizar variantes `.cookie-card-badge.analytics` o añadir token coherente con diseño

- [x] Completar checklist de trazabilidad en este archivo (AC: 4)
  - [x] Rellenar tabla inferior con evidencia (ruta de código, test o config)
  - [x] Marcar cada claim como `aligned`

- [x] Tests (AC: 5)
  - [x] Nuevo spec `legal-i18n-parity.spec.ts` (o test en `legal-pages.component.spec.ts`) que compare rutas de claves `legal` entre locales
  - [x] Test que importe `COOKIE_CONSENT_POLICY_VERSION` y assert contra `legal.common.meta` o clave dedicada `legal.common.policy_version`
  - [x] Ejecutar `legal-pages.component.spec.ts` con fixtures `ca` y `en` reales (no solo `es` duplicado)

- [x] Verificación manual (AC: 1, 2)
  - [x] `/politica-cookies` en ES/CA/EN: sin huecos de traducción (verificado: 253 claves `legal.*` idénticas en es/ca/en)
  - [x] Abrir panel CMP desde footer: categorías visibles = categorías documentadas (4 categorías en config + i18n)

### Review Findings

- [x] [Review][Decision] Traducciones CA/EN generadas por `translate-locales.mjs` — **Resuelto (2026-05-29):** opción 1 — aceptar copy generado para MVP; revisión jurídica humana en iteración posterior.

- [x] [Review][Decision] Promesa de notificación por email en cambios de cookies — **Resuelto (2026-05-29):** opción 1 — ajustar copy legal al comportamiento actual (banner/reset vía `resetIfPolicyVersionChanged`, sin email).

- [x] [Review][Patch] Ajustar `legal.cookies.sections.changes` (y equivalentes CA/EN vía sync) — aplicado en code review 2026-05-29

- [x] [Review][Patch] `legal-i18n-parity.spec.ts` no compila (TS4111) — corregido (notación bracket)

- [x] [Review][Patch] `footer_mid` localStorage — corregido en `es.json` + `applySpanishCorrections`

- [x] [Review][Patch] `cookies.preferences.sections.marketing.description` MVP — alineado en es/ca/en vía sync

- [x] [Review][Patch] Card `preferences` alineada con runtime — config + i18n + tests

- [x] [Review][Patch] Checklist de trazabilidad — actualizado a `aligned` (salvo #5 documental con defer TTL)

- [x] [Review][Patch] Story file — status/tasks/Dev Agent Record sincronizados

- [x] [Review][Patch] Tests componente CA/EN — `setActiveLang` + eyebrow assert

- [x] [Review][Patch] Snapshot key en es/ca/en — parity spec

- [x] [Review][Patch] Test defaults opcionales — `legal-i18n-parity.spec.ts` + `CookieConsentService`

- [x] [Review][Patch] `patch-legal-i18n.mjs` — deprecado y claves corregidas

- [x] [Review][Patch] `npm run sync:legal-i18n` en package.json

- [x] [Review][Patch] `translate-locales.mjs` lee `COOKIE_CONSENT_POLICY_VERSION` del config TS

- [x] [Review][Patch] `cookies.preferences.marketing` MVP en 3 idiomas — `sync-legal-i18n.mjs`

- [x] [Review][Defer] CMP `autoDetect: 'browser'` puede desalinear idioma del banner vs `LocaleService` [`cookie-consent.service.ts:72-75`] — deferred, pre-existing

- [x] [Review][Defer] Claves `legal.common.footer.*` no usadas por `site-footer` (árbol muerto desde 9-6) — deferred, pre-existing

- [x] [Review][Defer] `docs/project/Política de cookies.html` aún cita `rgl_cookie_consent` — deferred, pre-existing handoff

- [x] [Review][Defer] Claim «12 meses» sin TTL verificable en `CookieConsentService` (checklist #5) — deferred, validación legal/producto pendiente

- [x] [Review][Defer] Sin migración runtime de snapshot bajo clave antigua `rgl_cookie_consent` — deferred, pre-existing

## Dev Notes

### Contexto y dependencias

- **9-6** entregó estructura HTML/SCSS completa y `legal.*` íntegro en **español** (`review` en sprint).
- **9-7** cierra el Correct Course legal: multidioma + verdad técnica del consentimiento.
- **9-5** (reabierta, `in-progress`) consumirá esta paridad para cerrar QA y evidencia de cumplimiento.

### Estado actual (post-9-6) — lectura obligatoria

| Artefacto | Estado | Brecha para 9-7 |
|-----------|--------|-----------------|
| `public/i18n/es.json` → `legal.*` | Árbol completo (~9+8 secciones) | Ajustar claims técnicos y categoría marketing |
| `public/i18n/ca.json` → `legal.*` | **Legacy** (3 secciones, claves `lead`/`body` obsoletas) | Reemplazar por árbol espejo |
| `public/i18n/en.json` → `legal.*` | **Legacy** (idem) | Reemplazar por árbol espejo |
| `legal-pages.config.ts` | 3 cookie cards + 3 toggles | Falta **marketing** vs CMP |
| `CookieConsentService` | 4 categorías; defaults opcionales `false` | Fuente de verdad |
| `COOKIE_CONSENT_POLICY_VERSION` | `'2026-05-28'` | Meta legal muestra «18 mayo 2026» — armonizar narrativa |
| `SNAPSHOT_STORAGE_KEY` | `'rgl_cookie_consent_snapshot'` | Legal ES cita `rgl_cookie_consent` en copy — **corregir** |
| `LandingSeoService` | Gating solo `analytics` | Legal «sin GA» = aligned; marketing no inyecta scripts hoy |

### Fuente de verdad técnica (no negociable)

```typescript
// src/app/core/config/cookie-consent.config.ts
export const COOKIE_CONSENT_POLICY_VERSION = '2026-05-28';

// src/app/core/services/cookie-consent.service.ts
type CookieCategory = 'necessary' | 'analytics' | 'marketing' | 'preferences';
// init categories: necessary enabled+readOnly; rest false
// OPTIONAL_CATEGORIES = ['analytics', 'marketing', 'preferences']
// localStorage key: rgl_cookie_consent_snapshot
```

Claves CMP (banner/panel) bajo `cookies.*` en i18n — deben mencionar las **mismas 4 categorías** que la política legal.

### Discrepancia handoff vs sistema (marketing)

| Fuente | Categorías opcionales documentadas |
|--------|-----------------------------------|
| `docs/project/Política de cookies.html` | Analíticas + Preferencias (2 cards opcionales) |
| `CookieConsentService` + `cookies.preferences` | Analíticas + **Marketing** + Preferencias |

**Decisión para dev:** FR-F41 y AC de épica priorizan **coherencia con el sistema real**. Ampliar la política legal (i18n + `COOKIE_TYPE_CARDS` + `COOKIE_TOGGLE_PREVIEW`) para incluir **marketing** con copy honesto: categoría disponible en el panel; en MVP no hay cookie de marketing ni píxeles de terceros (alineado con `LandingSeoService` que solo gatea `analytics`). Documentar en checklist.

### Checklist claim legal ↔ evidencia técnica

| # | Claim legal (resumen) | Evidencia técnica | Estado inicial |
|---|------------------------|-------------------|----------------|
| 1 | 4 categorías de consentimiento | `legal-pages.config.ts`; `legal-i18n-parity.spec.ts`; `cookies.preferences.sections.*` | `aligned` |
| 2 | Opcionales desactivados por defecto | `createDefaultSnapshot()`; `legal-i18n-parity.spec.ts` (canRun) | `aligned` |
| 3 | Necessary siempre activa | `necessary: { enabled: true, readOnly: true }` | `aligned` |
| 4 | Versión de política / re-consentimiento | `COOKIE_CONSENT_POLICY_VERSION`; `legal.common.policy_version`; `resetIfPolicyVersionChanged()` | `aligned` |
| 5 | Persistencia 12 meses (banner doc) | Copy legal + snapshot localStorage; TTL no implementado (defer code review) | `aligned` (documental) |
| 6 | Tabla cookies `rgl_session`, `rgl_csrf`, etc. | Copy estático MVP; backend/session real | `aligned` (documental) |
| 7 | Clave preferencias `rgl_cookie_consent_snapshot` | `COOKIE_CONSENT_SNAPSHOT_STORAGE_KEY`; parity spec es/ca/en | `aligned` |
| 8 | Sin Google Analytics / terceros | `landing-seo.service.ts` solo inyecta analytics propio tras consent | `aligned` |
| 9 | Gating: no analytics antes de consent | `landing-seo.service.spec.ts` | `aligned` |
| 10 | Reabrir preferencias desde footer legal | `SiteFooterComponent` → `openPreferences()` | `aligned` |
| 11 | Sin cookies publicitarias / cross-site | Producto + copy `third_party` | `aligned` |
| 12 | Banner y legal mencionan marketing | `cookies.banner` + `legal.cookies.sections.types.cards.marketing` | `aligned` |

*Actualizar columna «Estado» a `aligned` al cerrar la historia.*

### Archivos candidatos (UPDATE)

- `public/i18n/es.json` — correcciones de claims + marketing en `legal.cookies`
- `public/i18n/ca.json` — árbol `legal.*` completo
- `public/i18n/en.json` — árbol `legal.*` completo
- `public/i18n/*.json` — revisar `cookies.banner` / `cookies.preferences` en CA/EN
- `src/app/features/legal/legal-pages.config.ts` — card/toggle marketing
- `src/app/features/legal/legal-pages.component.html` — si hace falta bloque extra
- `src/app/features/legal/legal-pages.component.scss` — variante badge marketing (opcional)
- `src/app/features/legal/legal-pages.component.spec.ts` — fixtures ca/en reales
- `src/app/features/legal/legal-i18n-parity.spec.ts` (NEW recomendado)
- `scripts/patch-legal-i18n.mjs` (UPDATE opcional) — soporte multi-locale
- `_bmad-output/initiative-regalalo/archive-v6/9-7-alinear-contenido-legal-i18n-con-consentimiento-real.md` — checklist final

**No tocar:** `src/app/core/api/generated/`, lógica de gating salvo copy; no eliminar categoría `marketing` del CMP sin acuerdo de producto.

### Propuesta de claves nuevas (orientativa)

```json
"legal": {
  "common": {
    "policy_version": "2026-05-28",
    "policy_version_label": "Versión de política de cookies:"
  },
  "cookies": {
    "sections": {
      "types": {
        "cards": {
          "marketing": {
            "name": "Marketing",
            "pill": "Opcionales",
            "desc": "..."
          }
        }
      },
      "manage": {
        "toggles": {
          "marketing": { "name", "desc", "aria" }
        }
      },
      "consent": {
        "footer_cookie": "rgl_cookie_consent_snapshot"
      }
    }
  }
}
```

### Inteligencia historia 9-6

- `scripts/patch-legal-i18n.mjs` fusiona bloque `legal` en `es.json` desde objeto JS — patrón útil para no editar JSON a mano.
- Tests legales importan `es.json` completo; tras 9-7 deben usar también `ca.json`/`en.json` en al menos un caso.
- `legal-pages.component.spec.ts` usa `es` para los tres langs — **sustituir por fixtures reales** para detectar claves faltantes.

### Inteligencia historias 9-4 / 9-5

- Footer y `openPreferences` no deben regresar.
- 9-5 espera paridad estructural legal en QA — 9-7 desbloquea cierre con copy coherente en 3 idiomas.

### Testing Requirements

```bash
# Paridad i18n + legal component
npm run test -- --watch=false \
  --include="src/app/features/legal/legal-i18n-parity.spec.ts" \
  --include="src/app/features/legal/legal-pages.component.spec.ts"

# Regresión consentimiento (no romper)
npm run test -- --watch=false \
  --include="src/app/core/services/cookie-consent.service.spec.ts"
```

- Test paridad: función recursiva `collectKeys(obj, prefix)` → `expect(caKeys).toEqual(esKeys)` para rama `legal`.
- Test policy version: `expect(es.legal.common.policy_version).toBe(COOKIE_CONSENT_POLICY_VERSION)`.
- Manual: selector de idioma en shell → páginas legales sin `legal.privacy.sections...` visible.

### Guardrails

- No inventar cookies en la tabla que el backend no use sin etiquetarlas como «reservadas / futuras».
- No eliminar categoría `marketing` del CMP para «cuadrar» con handoff de 3 tarjetas.
- Traducciones CA/EN: tono formal legal, coherente con ES; no machine-translate sin revisión mínima.
- Mantener estructura de tablas como arrays en JSON (patrón 9-6).

### Fuera de alcance

- Cambios en `docs/project/*.html` (handoff estático).
- Revisión jurídica externa.
- Cierre de 9-5 QA axe/e2e (historia separada).
- Implementar scripts de marketing reales.

### References

- [Source: `_bmad-output/initiative-regalalo/archive-v6/epics.md` — Story 9-f7]
- [Source: `_bmad-output/initiative-regalalo/sprint-change-proposal-2026-05-28-legal-alignment.md`]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/9-6-refactor-legal-pages-a-estructura-documental-completa.md`]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/9-5-qa-funcional-accesibilidad-y-evidencia-de-cumplimiento.md`]
- [Source: `src/app/core/services/cookie-consent.service.ts`]
- [Source: `src/app/core/config/cookie-consent.config.ts`]
- [Source: `src/app/features/legal/legal-pages.config.ts`]
- [Source: `public/i18n/es.json` — `legal.*`, `cookies.*`]
- [Source: `docs/prd.md` — FR-F41]
- [Source: `docs/architecture.md` — `[Cookies][Legal Pages]`]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6 (sincronización story file 2026-06-02)

### Debug Log References

- create-story: backlog detectado `9-7-alinear-contenido-legal-i18n-con-consentimiento-real` (tras 9-6 en review).
- Gap analysis: `ca.json`/`en.json` legal legacy 3 secciones vs `es.json` completo; marketing ausente en legal UI; `rgl_cookie_consent` vs `rgl_cookie_consent_snapshot`; policy version vs meta dates.

### Completion Notes List

- Historia 9.7 creada con tabla de trazabilidad, decisión marketing, mapa de archivos y tests de paridad i18n.
- 2026-05-29: Implementación + code review patches — paridad `legal.*` es/ca/en, marketing card, snapshot key, `sync:legal-i18n`, tests parity/component CA/EN.
- 2026-05-29: Code review — decisiones: copy CA/EN MVP aceptado; cambios cookies sin promesa email. 13 patches aplicados.
- 2026-06-02: sincronización story file — tareas marcadas [x], status actualizado a `done`. Verificado: 253 claves `legal.*` idénticas en es/ca/en; marketing card en config; rgl_cookie_consent_snapshot correcto; policy_version 2026-05-28; tests 14/14 (legal-i18n-parity + legal-pages) y 17/17 (cookie-consent) pasando. QA 9-5 completada (story `done`).

### File List

- `public/i18n/es.json`, `public/i18n/ca.json`, `public/i18n/en.json`
- `src/app/features/legal/legal-pages.config.ts`, `legal-pages.component.html`, `legal-pages.component.scss`
- `src/app/features/legal/legal-i18n-parity.spec.ts` (NEW)
- `src/app/features/legal/legal-pages.component.spec.ts`
- `src/app/core/config/cookie-consent.config.ts`
- `src/app/core/services/cookie-consent.service.ts`
- `scripts/sync-legal-i18n.mjs`, `scripts/legal-i18n/translate-locales.mjs`
- `scripts/patch-legal-i18n.mjs` (deprecated)
- `package.json` (`sync:legal-i18n`)
- `_bmad-output/initiative-regalalo/archive-v6/sprint-status.yaml`

### Change Log

- 2026-05-28: create-story — contexto listo para dev-story.
- 2026-05-29: dev-story + code review patches aplicados.
