---
title: 'SEO Audit: Correcciones de Accesibilidad y Schema'
type: 'bugfix'
created: '2026-06-02'
status: 'done'
baseline_commit: '040ac3f2173ff073bbfe4d922cf7805650329738'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problema:** El audit SEO post-lanzamiento detecta 4 fallos WCAG AA (Lighthouse Accessibility 89/100) y un schema `Organization.logo` no conforme con Google: ausencia de `<main>` landmark, 9 elementos con contraste insuficiente, `<dl>` de FAQ con `<input>` como hijo inválido (rompe WCAG 1.3.1), y el accessible name del selector de idioma no incluye el texto visible "ES" (rompe WCAG 2.5.3).

**Approach:** Añadir `<main>` al layout de la landing. Corregir ratios de contraste con overrides locales en SCSS (sin tocar `_tokens.scss`). Refactorizar el acordeón FAQ eliminando el truco de checkbox y usando estado Angular + `<button>` semántico dentro del `<dl>`. Corregir el aria-label del selector de idioma. Actualizar `Organization.logo` a `ImageObject`.

## Boundaries & Constraints

**Always:**
- Overrides de contraste solo en los SCSS de los componentes afectados (`landing.component.scss`, `landing-footer.component.scss`). Nunca modificar `src/styles/_tokens.scss`.
- El acordeón FAQ debe mantener idéntico comportamiento visual y animación chevron; solo cambia el mecanismo de activación (de CSS checkbox a Angular state).
- Todos los colores ajustados deben alcanzar ≥ 4.5:1 contra su fondo respectivo (verificar con herramienta online antes de commit).

**Ask First:**
- Si al ajustar el contraste de `.mock-card-meta` / `.mock-card-requests` / `.mock-badge--active` el resultado visual difiere notablemente del prototipo `docs/project/Landing Page.html` (diferencias de matiz sutil en las mock-cards del hero).

**Never:**
- Cambiar tokens globales (`src/styles/_tokens.scss`).
- Modificar la estructura JSON-LD del FAQPage (solo se toca `Organization`).
- Tocar archivos en `src/app/core/api/generated/`.
- Cambiar el layout, espaciado o tipografía de ninguna sección.

</frozen-after-approval>

## Code Map

- `src/app/features/landing/landing.component.html` — template principal: añadir `<main>`, refactorizar FAQ `<dl>`
- `src/app/features/landing/landing.component.ts` — signal `openFaqItems` + método `toggleFaq()`
- `src/app/features/landing/landing.component.scss` — overrides de contraste + reemplazar selectores `:checked ~` por `.faq-open`
- `src/app/shared/components/landing-footer/landing-footer.component.scss` — override `.footer-copy` para dark bg
- `src/app/shared/components/language-selector/language-selector.component.ts` — fix WCAG 2.5.3: incluir código de idioma en el accessible name
- `src/app/core/seo/landing-seo.service.ts` — `Organization.logo` → `ImageObject`
- `src/styles/utilities.scss` (crear si no existe) o `src/styles.scss` — añadir clase utilitaria `.sr-only`

## Tasks & Acceptance

**Execution:**

- [x] `src/styles/utilities.scss` — Añadir (o verificar que existe) la clase `.sr-only` siguiendo el patrón estándar: `position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0`. Importarla en `src/styles.scss` si es un archivo nuevo.

- [x] `src/app/features/landing/landing.component.html` — Envolver las `<section>` de contenido (hero, steps, community, reputation, CTA, FAQ) dentro de `<main>`. El `<app-landing-nav />` y `<app-landing-footer />` quedan fuera del `<main>`.

- [x] `src/app/features/landing/landing.component.ts` — Añadir signal y método al componente:
  ```ts
  openFaqItems = signal<Set<number>>(new Set());
  toggleFaq(idx: number): void {
    this.openFaqItems.update(s => {
      const n = new Set(s);
      n.has(idx) ? n.delete(idx) : n.add(idx);
      return n;
    });
  }
  ```

- [x] `src/app/features/landing/landing.component.html` — Refactorizar el `<dl class="faq-list">`:
  - Eliminar `<input type="checkbox">` y `<label>` del interior.
  - En `<div class="faq-item">`: añadir `[class.faq-open]="openFaqItems().has(idx)"`.
  - En `<dt class="faq-question">`: reemplazar el contenido por `<button type="button" (click)="toggleFaq(idx)" [attr.aria-expanded]="openFaqItems().has(idx)" [attr.aria-controls]="'faq-a-' + idx">` con el span de texto y el SVG del chevron dentro.
  - En `<dd class="faq-answer">`: añadir `[id]="'faq-a-' + idx"`.

- [x] `src/app/features/landing/landing.component.scss` — Dos cambios:
  1. Reemplazar todos los selectores tipo `input:checked ~ .faq-answer` y `input:checked ~ dt .faq-chevron` por `.faq-open .faq-answer` y `.faq-open .faq-chevron` respectivamente.
  2. Añadir overrides de contraste (sin cambiar tokens):
     - `.hero-note`: `color: var(--color-neutral-700)` — #484F59, ratio ≈ 7:1 sobre #F4F5F6
     - `.mock-card-meta`, `.mock-card-requests`: `color: var(--fg-secondary)` — #606A76, ratio ≈ 5.1:1 sobre #FFFFFF
     - `.rep-table-label`, `.rep-ranking-note`: `color: rgba(255,255,255,0.55)` — ratio ≈ 5.5:1 sobre #0C1A12
     - `.section-label--ghost`: `color: rgba(255,255,255,0.70)` — ratio ≈ 6:1 sobre #253F72
     - Si `.mock-badge--active` aún falla Lighthouse tras los cambios anteriores: cambiar a `color: var(--color-primary-700)` (#224633)

- [x] `src/app/shared/components/landing-footer/landing-footer.component.scss` — `.footer-copy`: cambiar a `color: var(--color-neutral-400)` — #9AA2AD, ratio ≈ 7.7:1 sobre #14171A

- [x] `src/app/shared/components/language-selector/language-selector.component.ts` — En el template del `<button>`: eliminar el binding `[attr.aria-label]`; añadir `<span class="sr-only">{{ t('language_selector.aria_label') }}</span>` como hermano del texto de idioma visible. El accessible name resultante incluirá el código visible (ej. "ES") + el texto oculto.

- [x] `src/app/core/seo/landing-seo.service.ts` — En el schema `Organization`, cambiar:
  ```ts
  // Antes
  logo: imageUrl,
  // Después
  logo: { '@type': 'ImageObject', url: `${siteUrl}/favicon.svg`, width: 512, height: 512 },
  ```

**Acceptance Criteria:**

- Given la landing page cargada, when un AT navega por landmarks, then existe exactamente un `<main>` conteniendo el contenido principal (hero, steps, reputation, FAQ); nav y footer están fuera.
- Given la landing en Lighthouse Accessibility, when se audita desktop y mobile, then score ≥ 95 y los audits `landmark-one-main`, `color-contrast`, `definition-list`, `label-content-name-mismatch` aparecen como passed.
- Given el selector de idioma mostrando "ES", when un lector de pantalla lee el botón, then el accessible name contiene "ES".
- Given el acordeón FAQ, when el usuario hace click en una pregunta, then `aria-expanded` cambia a `true`, `<dd>` queda visible, y un segundo click lo revierte.
- Given el JSON-LD de `Organization` en la landing, when se valida en Rich Results Test, then `logo` es un `ImageObject` con `url`, `width`, y `height`.

## Design Notes

El acordeón FAQ pasa de ser CSS-only (checkbox hack) a Angular state. Los estilos actuales de `.faq-answer` y `.faq-chevron` usan selectores hermanos (`~`) basados en `:checked`. Tras el cambio, esos mismos efectos visuales se controlan con la clase `.faq-open` en el `.faq-item` padre — mismo resultado visual, HTML válido.

## Verification

**Commands:**
- `ng build --configuration production` — expected: sin errores de compilación ni warnings de template

**Manual checks:**
- DevTools > Accessibility panel: árbol de landmarks muestra `<main>` en la landing
- Lighthouse audit (Desktop) > Accessibility: score ≥ 95, sin fallos en los 4 audits corregidos
- Click en FAQ: respuesta aparece, `aria-expanded="true"` visible en DevTools Elements
- Inspeccionar JSON-LD `Organization` en DevTools > Elements > `<script type="application/ld+json">`: confirmar `logo` es objeto

## Suggested Review Order

**Acordeón FAQ — state + template + CSS**

- Signal `openFaqItems` y `toggleFaq` — punto de entrada del nuevo mecanismo de acordeón
  [`landing.component.ts:46`](../../src/app/features/landing/landing.component.ts#L46)

- Template FAQ: `[class.faq-open]`, `<button aria-expanded aria-controls>`, `<dd [id]>` — HTML válido sin checkbox
  [`landing.component.html:281`](../../src/app/features/landing/landing.component.html#L281)

- Selectores CSS migrados de `:checked ~` a `.faq-open`; `<button>` reset + `focus-visible`
  [`landing.component.scss:855`](../../src/app/features/landing/landing.component.scss#L855)

**Landmark `<main>` y contraste**

- `<main>` envuelve secciones de contenido; nav y footer quedan fuera
  [`landing.component.html:5`](../../src/app/features/landing/landing.component.html#L5)

- 6 overrides de contraste locales al final del fichero, sin tocar tokens globales
  [`landing.component.scss:911`](../../src/app/features/landing/landing.component.scss#L911)

**Selector de idioma — WCAG 2.5.3**

- `[attr.aria-label]` eliminado; `<span class="sr-only">` incluye el texto oculto tras el código visible
  [`language-selector.component.ts:38`](../../src/app/shared/components/language-selector/language-selector.component.ts#L38)

**Schema `Organization.logo`**

- `logo` cambia de URL plana a `ImageObject`; `width`/`height` omitidos (SVG no tiene píxeles)
  [`landing-seo.service.ts:165`](../../src/app/core/seo/landing-seo.service.ts#L165)

**Footer contraste**

- `neutral-400` (#9AA2AD) reemplaza `neutral-600` — mayor contraste sobre fondo oscuro #14171A
  [`landing-footer.component.scss:108`](../../src/app/shared/components/landing-footer/landing-footer.component.scss#L108)

**Utilidades (periférico)**

- Nueva clase global `.sr-only` importada desde `styles.scss`
  [`styles/utilities.scss:1`](../../src/styles/utilities.scss#L1)
