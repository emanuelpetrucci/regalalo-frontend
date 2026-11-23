# Sprint Change Proposal — 2026-05-28

## 1) Resumen del problema

Durante la ejecución de la Épica 9 (cookies/consentimiento), se detecta un desajuste relevante:

- La implementación actual en `src/app/features/legal/` muestra una versión **resumida** de políticas (3 secciones por página).
- La especificación de diseño y contenido legal vinculante en `docs/project/Política de privacidad.html` y `docs/project/Política de cookies.html` define una estructura **mucho más completa** (secciones extensas, metadatos de vigencia, tablas y bloques informativos).
- `sprint-status.yaml` marca `9-5` y toda la épica 9 como `done`, pero la evidencia funcional indica brecha de cumplimiento contra NFR/UX ya definidos.

Trigger confirmado por usuario: **cobertura legal insuficiente + desalineación de maquetación legal respecto al handoff obligatorio**.

## 2) Impact analysis

### 2.1 Impacto en épicas/historias

- **Épica afectada principal:** `epic-9` (actualmente `in-progress`, historias `9-1..9-5` en `done`).
- Hallazgo: criterios de aceptación de `9-5` no cubrieron verificación de paridad integral de contenido legal publicado vs `docs/project/*`.
- Cambio propuesto: mantener épica 9 y añadir historias de remediación (sin crear épica nueva).

### 2.2 Conflictos por artefacto

- **PRD (`docs/prd.md`)**
  - No conflicto de objetivo MVP.
  - Sí brecha de precisión verificable entre FR/NFR cookies y validación de “done”.
- **Epics (`_bmad-output/planning-artifacts/epics.md`)**
  - Conflicto operativo: AC actuales de 9-5 son genéricos para una validación legal de alto detalle.
- **Arquitectura (`docs/architecture.md`)**
  - Reglas de cookies existen (líneas de presentación), pero falta contrato explícito de “estructura documental legal mínima renderizada”.
- **UX/Design**
  - UX-DR9 ya define obligación de reproducir ambas políticas; la implementación actual no la cumple de forma completa.
- **Artefactos secundarios**
  - `sprint-status.yaml` requiere actualización de estado para reflejar trabajo pendiente real.
  - Pruebas legales/QA deben ampliar cobertura estructural (no solo banner/panel/gating).

### 2.3 Impacto técnico

- Frontend Angular (`legal-pages.component.*`) necesita refactor de estructura de render y estilos.
- i18n (`public/i18n/*.json`) requiere ampliación de contenido legal para todas las secciones documentales.
- Tests de componente/legal y QA funcional deben incorporar checks de estructura y consistencia copy↔comportamiento.

## 3) Evaluación de camino a seguir

### Opción 1 — Direct Adjustment (recomendada)

- Viable: **Sí**
- Esfuerzo: **Medio**
- Riesgo: **Medio-bajo**
- Justificación:
  - No exige rollback técnico de consentimiento (base ya sólida).
  - Corrige brecha en contenido/maquetación y evidencia de cumplimiento sin alterar alcance MVP.
  - Mantiene momentum del sprint.

### Opción 2 — Rollback

- Viable: **No recomendable**
- Esfuerzo: **Alto**
- Riesgo: **Medio**
- Motivo:
  - Revertir 9-1..9-5 rompería avances válidos (gating, persistencia, servicio, tests).
  - El problema no está en todo el enfoque, sino en cierre incompleto de criterios de compliance visual/legal.

### Opción 3 — MVP Review / reducción de alcance

- Viable: **No**
- Esfuerzo: **Alto**
- Riesgo: **Alto**
- Motivo:
  - El cumplimiento legal/cookies ya es requisito explícito del MVP, no un extra post-MVP.

### Selección

**Selected approach: Option 1 (Direct Adjustment)**

## 4) Propuestas de cambio detalladas (old → new)

### 4.1 Cambios en `epics.md` (Épica 9)

#### Cambio A — Ajustar Story 9-5 para cobertura verificable de legal pages

Story: `9-5-qa-funcional-accesibilidad-y-evidencia-de-cumplimiento`

OLD:

```md
Given pruebas de frontend (unit/integration/e2e)
When se ejecutan los escenarios de consentimiento
Then cubren primera decisión, rechazo, aceptación, edición posterior y persistencia
And verifican que no se disparan scripts no esenciales antes del consentimiento
And el flujo cumple WCAG AA en interacciones clave del banner/panel.
```

NEW:

```md
Given pruebas de frontend (unit/integration/e2e)
When se ejecutan los escenarios de consentimiento y legal pages
Then cubren primera decisión, rechazo, aceptación, edición posterior y persistencia
And verifican que no se disparan scripts no esenciales antes del consentimiento
And verifican paridad estructural mínima de `politica-privacidad` y `politica-cookies` con `docs/project/*`:
  - header legal con metadatos de vigencia/actualización
  - índice de contenidos con anchors
  - secciones completas definidas por la especificación
  - tablas/bloques informativos requeridos
And el flujo completo (banner/panel/legal pages) cumple WCAG AA en interacciones clave.
```

Rationale: El cierre de 9-5 debe validar cumplimiento integral (funcional + legal content + maquetación), no solo consentimiento técnico.

#### Cambio B — Añadir Story 9-6 de remediación estructural legal

NEW STORY:

```md
### Story 9-6: Refactor legal pages a estructura documental completa

Como usuario,
quiero consultar políticas de privacidad y cookies completas y estructuradas,
para entender de forma transparente el tratamiento de datos y preferencias.

Acceptance Criteria:
- La UI legal reproduce la estructura documental completa definida en `docs/project/Política de privacidad.html` y `docs/project/Política de cookies.html`.
- `legal-pages.component.html/.scss` renderiza header legal, secciones numeradas, tablas/bloques y navegación por anclas con fidelidad visual.
- Se mantiene el footer legal existente y la acción persistente de reabrir preferencias.
```

Rationale: separar implementación estructural de legal pages de la story QA para permitir validación incremental.

#### Cambio C — Añadir Story 9-7 de armonización i18n/legal copy

NEW STORY:

```md
### Story 9-7: Alinear contenido legal i18n con implementación real de consentimiento

Como equipo de producto,
quiero que el contenido legal publicado sea consistente con el comportamiento técnico real,
para reducir riesgo de incumplimiento por discrepancia copy↔sistema.

Acceptance Criteria:
- `public/i18n/{es,ca,en}.json` contiene secciones legales completas requeridas por el handoff.
- El texto de categorías/cookies/refuerzo de consentimiento coincide con `CookieConsentService` y políticaVersion.
- Existe checklist de trazabilidad (claim legal ↔ evidencia técnica).
```

Rationale: evitar deuda legal textual y asegurar consistencia multi-idioma.

### 4.2 Cambios en PRD (`docs/prd.md`)

#### Cambio D — Endurecer FR-F41 con evidencia legal publicada

OLD:

```md
FR-F41: El sistema registra consentimiento con `policyVersion`, categorías y timestamp para trazabilidad y re-consentimiento cuando cambie la política.
```

NEW:

```md
FR-F41: El sistema registra consentimiento con `policyVersion`, categorías y timestamp para trazabilidad y re-consentimiento cuando cambie la política.
Además, la política publicada en frontend debe reflejar de forma explícita y verificable el versionado vigente y la estructura completa de información legal definida en `docs/project/Política de privacidad.html` y `docs/project/Política de cookies.html`.
```

Rationale: cerrar brecha entre trazabilidad técnica y documentación legal visible.

### 4.3 Cambios en arquitectura (`docs/architecture.md`)

#### Cambio E — Nueva regla explícita de estructura legal mínima

OLD (reglas cookies existentes):

```md
- [Cookies] Punto persistente de configuración...
- [Cookies] Copy legal desacoplado...
```

NEW (añadir regla):

```md
- [Cookies][Legal Pages] Estructura documental mínima obligatoria: las rutas legales deben renderizar la estructura completa definida en `docs/project/Política de privacidad.html` y `docs/project/Política de cookies.html` (metadatos de vigencia, índice, secciones completas, tablas/bloques, footer legal existente) con fidelidad visual y semántica.
```

Rationale: convertir obligación UX en contrato técnico verificable.

### 4.4 Cambios en sprint tracking (`sprint-status.yaml`) — propuesta

OLD:

```yaml
9-5-qa-funcional-accesibilidad-y-evidencia-de-cumplimiento: done
```

NEW:

```yaml
9-5-qa-funcional-accesibilidad-y-evidencia-de-cumplimiento: in-progress
9-6-refactor-legal-pages-a-estructura-documental-completa: backlog
9-7-alinear-contenido-legal-i18n-con-consentimiento-real: backlog
```

Rationale: reflejar trabajo pendiente real antes de declarar cierre de épica.

## 5) Plan de implementación y handoff

### Clasificación de alcance

**Moderate** (no replan total, pero sí reorganización de backlog de una épica en curso + actualización de artefactos).

### Roles y responsabilidades

- **Product Owner / Developer**
  - Actualizar `epics.md` con stories 9-6/9-7 y AC reforzados de 9-5.
  - Ajustar `sprint-status.yaml`.
- **Developer**
  - Implementar refactor en `src/app/features/legal/*`.
  - Extender i18n legal y tests.
- **Architect (soporte)**
  - Formalizar regla técnica en `docs/architecture.md`.
- **PM (opcional)**
  - Asegurar alineación legal externa si se requiere revisión jurídica final.

### Criterios de éxito

- Legal pages reproducen estructura completa de `docs/project/*` (privacidad/cookies).
- Coherencia demostrable entre copy legal e implementación real de consentimiento.
- AC y tests de 9-5 ampliados pasan en CI.
- `sprint-status.yaml` refleja estados veraces.

## 6) Checklist de Change Navigation (estado)

### Section 1 — Trigger and context
- 1.1 Triggering story identificado (`Epic 9`, cierre prematuro de 9-5): **[x] Done**
- 1.2 Problema definido (desalineación legal+maquetación): **[x] Done**
- 1.3 Evidencia recopilada (código legal actual, docs/project, i18n, cookie service, tests): **[x] Done**

### Section 2 — Epic impact
- 2.1 Evaluación épica actual: **[x] Done**
- 2.2 Cambios de épica requeridos: **[x] Done**
- 2.3 Revisión de épicas futuras: **[x] Done** (sin dependencia crítica transversal)
- 2.4 ¿Invalida epics / requiere nuevas?: **[x] Done** (no invalida; ajustar Epic 9)
- 2.5 Orden/prioridad: **[x] Done** (priorizar 9-6 y 9-7 antes de cierre final de 9)

### Section 3 — Artifact conflicts
- 3.1 PRD conflictos: **[x] Done**
- 3.2 Architecture conflictos: **[x] Done**
- 3.3 UI/UX conflictos: **[x] Done**
- 3.4 Otros artefactos (tests, sprint tracking, documentación): **[x] Done**

### Section 4 — Path forward
- 4.1 Opción 1 direct adjustment: **[x] Viable**
- 4.2 Opción 2 rollback: **[x] Not viable**
- 4.3 Opción 3 MVP review: **[x] Not viable**
- 4.4 Recomendación seleccionada: **[x] Done**

### Section 5 — Proposal components
- 5.1 Issue summary: **[x] Done**
- 5.2 Impact + artifact adjustment: **[x] Done**
- 5.3 Recomendación con rationale: **[x] Done**
- 5.4 MVP impact + action plan: **[x] Done**
- 5.5 Handoff plan: **[x] Done**

### Section 6 — Final review and handoff
- 6.1 Checklist completado: **[x] Done**
- 6.2 Propuesta consistente/accionable: **[x] Done**
- 6.3 Aprobación explícita de usuario: **[!] Action-needed**
- 6.4 Actualizar `sprint-status.yaml`: **[!] Action-needed** (tras aprobación)
- 6.5 Confirmar handoff/timeline: **[!] Action-needed** (tras aprobación)

---

## Decisión

**Estado:** Aprobada por Emanuel el 2026-05-28 (`yes`).

**Artefactos aplicados:**
- `_bmad-output/planning-artifacts/epics.md` — AC 9-f5 ampliados; stories 9-f6 y 9-f7 añadidas
- `docs/prd.md` — FR-F41 reforzado
- `docs/architecture.md` — regla `[Cookies][Legal Pages]` añadida
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — 9-5 `in-progress`; 9-6 y 9-7 en `backlog`

## Handoff de implementación

**Alcance:** Moderate  
**Ruta:** Developer (PO/DEV para backlog)

**Orden recomendado:**
1. `9-6-refactor-legal-pages-a-estructura-documental-completa` (create-story → dev-story)
2. `9-7-alinear-contenido-legal-i18n-con-consentimiento-real` (create-story → dev-story)
3. Cerrar `9-5-qa-funcional-accesibilidad-y-evidencia-de-cumplimiento` con tests ampliados

**Criterio de cierre épica 9:** todas las stories en `done` y paridad verificable con `docs/project/Política de privacidad.html` y `docs/project/Política de cookies.html`.
