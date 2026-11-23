# Sprint Change Proposal — Enmienda épica 11-f (reducción de stories)

**Fecha:** 2026-06-01  
**Documento base:** `sprint-change-proposal-2026-06-01-seo-geo.md` (aprobado 2026-06-01)  
**Scope:** Minor — reorganización de backlog; sin cambio de alcance técnico  
**Estado:** Aprobado  
**Aprobado por:** Emanuel  
**Fecha de aprobación:** 2026-06-01  
**Solicitado por:** Emanuel  

---

## 1. Resumen del issue

### Problema

La épica **11-f: SEO/GEO Optimization** se definió con **6 stories** (olas crítica + mejoras). Emanuel solicita **reducir el número de historias** para bajar overhead de create-story / dev-story / code-review sin sacrificar los fixes acordados en el proposal original.

### Contexto

- Ninguna story 11-f* tiene fichero en `implementation-artifacts/` ni ha salido de `backlog`.
- El alcance técnico del proposal original sigue siendo válido; solo cambia el **granulado del backlog**.
- Coordinación con `sprint-change-proposal-2026-06-01-reputacion-publica.md` (sitemap) se mantiene.

### Evidencia

- `sprint-status.yaml` líneas 138–146: 6 entradas `11-f1` … `11-f6` en `backlog`.
- Cero archivos `11-f*.md` en `implementation-artifacts/`.

---

## 2. Análisis de impacto

### Epic impact

| Épica | Impacto |
|---|---|
| 11-f | **Reestructuración:** 6 stories → **2 stories** (recomendado) |
| 1–10-f, 9, cc-reputacion | Sin cambio |
| PRD / arquitectura | Sin cambio — mejoras SEO no alteran MVP funcional |

### Story impact

| Story original | Destino |
|---|---|
| 11-f1 og:image PNG | → **11-f1** (crítico) |
| 11-f2 html lang SSR | → **11-f1** (crítico) |
| 11-f3 sitemap lastmod | → **11-f1** (crítico) |
| 11-f4 FAQ 8 preguntas | → **11-f2** (mejoras) |
| 11-f5 structured data | → **11-f2** (mejoras) |
| 11-f6 preconnect / theme-color | → **11-f2** (mejoras) |

### Artifact conflicts

Ninguno en código. Tras aprobación: actualizar `sprint-status.yaml` y referencias en el proposal SEO/GEO original (nota de enmienda).

### Technical impact

Sin cambio. Esfuerzo total estimado **igual** (~4–6 h); menos context switching entre PRs/reviews.

---

## 3. Enfoque recomendado: Direct Adjustment (consolidación)

**Opción elegida:** fusionar por **ola de valor**, no por archivo.

| ID | Título | Contenido (ex 11-f*) | Cuándo |
|---|---|---|---|
| **11-f1** | SEO técnico crítico pre-lanzamiento | f1 + f2 + f3 | Antes del lanzamiento |
| **11-f2** | SEO/GEO mejoras en landing | f4 + f5 + f6 | Sprint siguiente (aceptable post-launch) |

**Rationale:**

- Las tres críticas comparten objetivo: *indexación y previews correctas*; un solo dev-story evita tres ciclos BMad.
- Las tres mejoras son *contenido + schema + head estático*; mismo criterio de “no bloquea lanzamiento”.
- Se preservan **olas** del documento original (priorización intacta).
- El único prerequisito externo (PNG 1200×630) queda explícito en 11-f1.

**Alternativas descartadas:**

| Opción | Stories | Motivo descarte |
|---|---|---|
| 1 mega-story | 1 | Review demasiado grande; mezcla crítico + post-launch |
| 3 stories | 3 | Menos reducción de la pedida |
| Deferir f4–f6 al backlog doc | 1 | Pierde tracking BMad de mejoras ya priorizadas |

**Esfuerzo:** sin cambio · **Riesgo:** bajo · **Timeline:** menos fricción operativa

---

## 4. Propuestas de cambio detalladas

### 4.1 sprint-status.yaml

**OLD:**

```yaml
  11-f1-og-image-png-con-dimensiones-og: backlog
  11-f2-html-lang-dinamico-ssr: backlog
  11-f3-sitemap-lastmod-estructura-extensible: backlog
  11-f4-faq-ampliada-8-preguntas-i18n: backlog
  11-f5-structured-data-software-application-organization: backlog
  11-f6-preconnect-hints-theme-color: backlog
```

**NEW:**

```yaml
  11-f1-seo-tecnico-critico-pre-lanzamiento: backlog
  11-f2-seo-geo-mejoras-landing: backlog
```

### 4.2 Story 11-f1 — SEO técnico crítico pre-lanzamiento

**Incluye:** contenido técnico de las antiguas 11-f1, 11-f2 y 11-f3 del proposal original (secciones 4.1–4.3).

**Criterios de aceptación (consolidados):**

- [ ] `GET /en` → `<html lang="en">`; `/ca` → `ca`; `/` → `es`
- [ ] `og:image` → `/og-image.png` (1200×630); `og:image:width/height/type` en HTML prerenderizado
- [ ] `sitemap.xml` con `<lastmod>` en todas las URLs; array `sitemapEntries` extensible
- [ ] Coordinar entrada `/como-funciona/reputacion` si cc-reputacion ya está mergeado
- [ ] Sin regresión en title, canonical, hreflang ni JSON-LD existentes

**Prerequisito:** asset `public/og-image.png` (diseño).

**Tiempo est.:** ~2 h (+ asset externo)

---

### 4.3 Story 11-f2 — SEO/GEO mejoras en landing

**Incluye:** contenido técnico de las antiguas 11-f4, 11-f5 y 11-f6 (secciones 4.4–4.6).

**Criterios de aceptación (consolidados):**

- [ ] FAQ 8 preguntas en `es.json`, `ca.json`, `en.json` + visible en UI + FAQPage schema
- [ ] Organization: `areaServed`, `foundingLocation` (Spain)
- [ ] SoftwareApplication schema válido (Rich Results Test)
- [ ] `<meta name="theme-color" content="#3A7358">` + preconnect GTM/GA en `index.html`
- [ ] Sin regresión AXE en landing

**Tiempo est.:** ~2–3 h

---

## 5. Handoff de implementación

**Scope:** Minor — Developer agent tras `create-story` × 2.

| Paso | Responsable | Acción |
|---|---|---|
| 1 | Usuario | Aprobar esta enmienda |
| 2 | Agent / PO | Actualizar `sprint-status.yaml` |
| 3 | create-story | Generar `11-f1-*.md` y `11-f2-*.md` (no las 6 antiguas) |
| 4 | dev-story | Implementar 11-f1 antes de lanzamiento; 11-f2 cuando haya capacidad |

**Backlog documentado (sección 6 del proposal original):** sin cambios — sigue fuera de épica 11-f.

---

## 6. Checklist Correct Course (resumen)

| Sección | Estado |
|---|---|
| 1. Trigger | [x] Reducción de granularidad solicitada por Emanuel |
| 2. Epic impact | [x] Solo 11-f reestructurada |
| 3. Artifacts | [x] PRD/arq/UX N/A |
| 4. Path forward | [x] Direct Adjustment — consolidación |
| 5. Proposal | [x] Este documento |
| 6. Approval + sprint-status | [x] Aprobado; `sprint-status.yaml` actualizado |

---

## Aprobación

- [x] **Aprobar** enmienda (6 → 2 stories) y actualizar sprint-status  
- [ ] **Revisar** — indicar objetivo alternativo (p. ej. 3 stories o deferir 11-f2 al backlog doc)
