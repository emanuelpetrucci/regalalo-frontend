# Story 11-f.2: SEO/GEO mejoras en landing

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed. Épica 11-f SEO/GEO Optimization — consolida ex 11-f4 (FAQ 8 preguntas), ex 11-f5 (Organization + SoftwareApplication schema), ex 11-f6 (theme-color + preconnect). Hereda contexto de 11-f1 (og:image PNG, html lang SSR, sitemap). -->

## Story

Como equipo de producto,
quiero implementar las mejoras SEO/GEO en la landing (FAQ ampliada, structured data enriquecido y performance hints),
para que regalalo.org sea correctamente clasificado por AI engines, mejore su visibilidad en búsquedas geolocalizadas y optimice la experiencia en dispositivos móviles antes del lanzamiento.

**FR:** NFR-F13 (Cumplimiento de diseño y SEO) · **Épica:** 11-f (SEO/GEO Optimization)
**Referencia:** `_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-01-seo-geo.md` (§4.4–4.6) + enmienda `sprint-change-proposal-2026-06-01-seo-geo-amendment-reduccion-stories.md` (§4.3)

## Acceptance Criteria

### AC 1: FAQ ampliada a 8 preguntas en los 3 idiomas, visible en UI y en FAQPage schema

**Given** los archivos `public/i18n/es.json`, `ca.json`, `en.json`
**When** se añaden las claves q4–q8 + a4–a8 bajo `landing.seo.faq`
**Then** `buildFaq()` en `LandingSeoService` genera un array de 8 `FaqItem`
**And** el schema FAQPage emitido por `setJsonLd('faq', ...)` contiene 8 preguntas en `mainEntity`

**Given** la landing renderizada en cualquier locale
**When** el usuario navega a `/`, `/ca` o `/en`
**Then** existe una sección FAQ visible con las 8 preguntas/respuestas

> **⚠️ NOTA DEV (UI):** La landing NO tiene sección FAQ actualmente y `docs/project/Landing Page.html` no incluye diseño de FAQ. Para la parte visual, seguir los patrones de sección existentes (`<section class="section">` + `section-header` + clases `reveal`). Usar `<details>`/`<summary>` nativo para accordion (accesible sin JavaScript extra; cumple AXE/WCAG AA). Usar las mismas claves `landing.seo.faq.qN` / `landing.seo.faq.aN` en el template — **no duplicar strings**.

### AC 2: Organization schema con `areaServed` y `foundingLocation`

**Given** cualquier ruta de landing (`/`, `/en`, `/ca`)
**When** el crawler lee el JSON-LD `@type: Organization`
**Then** incluye `foundingLocation: { "@type": "Country", "name": "Spain" }`
**And** incluye `areaServed: { "@type": "Country", "name": "Spain" }`
**And** mantiene todos los campos previos: `name`, `url`, `description`, `logo`

### AC 3: SoftwareApplication schema presente

**Given** cualquier ruta de landing
**When** el crawler lee los JSON-LD emitidos
**Then** existe un schema `@type: SoftwareApplication` con los campos requeridos (name, url, applicationCategory, operatingSystem, description, offers, inLanguage, availableOnDevice)

### AC 4: `theme-color` y preconnect en `index.html`

**Given** el archivo `src/index.html`
**When** el navegador carga la página
**Then** existe `<meta name="theme-color" content="#3A7358">` en `<head>`
**And** existe `<link rel="preconnect" href="https://www.googletagmanager.com">` en `<head>`
**And** existe `<link rel="preconnect" href="https://www.google-analytics.com">` en `<head>`
**And** NO hay preconnect de Google Fonts (fuentes self-hosted)

### AC 5: Sin regresión

**Given** los cambios implementados
**When** se carga la landing en cualquier locale
**Then** no hay errores AXE en la landing
**And** `meta title`, `canonical`, `hreflang`, JSON-LD WebSite/WebPage existen sin cambio
**And** Organization JSON-LD mantiene todos los campos previos (name, url, description, logo)
**And** og:image, og:image:width/height/type y html lang siguen correctos (heredados de 11-f1)

## Tasks / Subtasks

### A. Extender FAQ en archivos i18n (AC: 1)

- [x] Añadir q4-q8 + a4-a8 bajo `landing.seo.faq` en `public/i18n/es.json`
- [x] Añadir q4-q8 + a4-a8 bajo `landing.seo.faq` en `public/i18n/ca.json`
- [x] Añadir q4-q8 + a4-a8 bajo `landing.seo.faq` en `public/i18n/en.json`

Contenido exacto según el proposal — copiar literalmente:

**es.json** (añadir después de `"a3"`):
```json
"q4": "¿En qué ciudades está disponible Regálalo?",
"a4": "Regálalo está disponible en toda España. Los objetos se distribuyen en un radio de 50 km, así que cualquier persona con código postal español puede participar.",
"q5": "¿Qué diferencia hay entre Regálalo y Wallapop?",
"a5": "En Regálalo no existe el dinero. No puedes vender ni comprar: solo regalar y recibir. El acceso a objetos depende de tu historial de entregas, no de quién paga más.",
"q6": "¿Cómo funciona el sistema de reputación?",
"a6": "Cada entrega completada suma puntos. Las solicitudes no cumplidas restan. Tu posición en la lista de candidatos para cada objeto depende de tu reputación y la distancia al donante.",
"q7": "¿Es seguro Regálalo? ¿Cómo protegen mi privacidad?",
"a7": "El canal de contacto del donante solo se revela cuando la entrega es confirmada y se purga automáticamente a los 7 días. No hay chat interno ni datos expuestos antes de la confirmación.",
"q8": "¿Cuántos objetos puedo solicitar al mes?",
"a8": "Puedes solicitar hasta 3 objetos al mes. Para publicar objetos para regalar no hay límite mensual."
```

**ca.json** (añadir después de `"a3"`):
```json
"q4": "A quines ciutats està disponible Regálalo?",
"a4": "Regálalo està disponible a tota Espanya. Els objectes es distribueixen en un radi de 50 km, de manera que qualsevol persona amb codi postal espanyol pot participar.",
"q5": "Quina diferència hi ha entre Regálalo i Wallapop?",
"a5": "A Regálalo no existeix el diner. No pots vendre ni comprar: només regalar i rebre. L'accés als objectes depèn del teu historial d'entregues, no de qui paga més.",
"q6": "Com funciona el sistema de reputació?",
"a6": "Cada entrega completada suma punts. Les sol·licituds no complides resten. La teva posició a la llista de candidats per a cada objecte depèn de la teva reputació i la distància al donant.",
"q7": "És segur Regálalo? Com protegeixen la meva privacitat?",
"a7": "El canal de contacte del donant només es revela quan l'entrega és confirmada i s'esborra automàticament als 7 dies. No hi ha xat intern ni dades exposades abans de la confirmació.",
"q8": "Quants objectes puc sol·licitar al mes?",
"a8": "Pots sol·licitar fins a 3 objectes al mes. Per publicar objectes per regalar no hi ha límit mensual."
```

**en.json** (añadir después de `"a3"`):
```json
"q4": "Which cities is Regálalo available in?",
"a4": "Regálalo is available throughout Spain. Items are distributed within a 50 km radius, so anyone with a Spanish postal code can participate.",
"q5": "What is the difference between Regálalo and Wallapop?",
"a5": "Regálalo has no money. You cannot sell or buy: only give and receive. Access to items depends on your delivery history, not who pays the most.",
"q6": "How does the reputation system work?",
"a6": "Each completed delivery adds points. Unfulfilled requests subtract points. Your position in the candidate list for each item depends on your reputation and distance to the donor.",
"q7": "Is Regálalo safe? How is my privacy protected?",
"a7": "The donor's contact channel is only revealed when the delivery is confirmed and is automatically purged after 7 days. There is no internal chat and no data is exposed before confirmation.",
"q8": "How many items can I request per month?",
"a8": "You can request up to 3 items per month. There is no monthly limit for publishing items to give away."
```

### B. Extender `buildFaq()` a q1-q8 (AC: 1)

- [x] En `src/app/core/seo/landing-seo.service.ts`, método `buildFaq()` (línea ~196), añadir q4-q8 al array `items` siguiendo exactamente el patrón de q1-q3:
  ```ts
  { question: t('landing.seo.faq.q4'), answer: t('landing.seo.faq.a4') },
  { question: t('landing.seo.faq.q5'), answer: t('landing.seo.faq.a5') },
  { question: t('landing.seo.faq.q6'), answer: t('landing.seo.faq.a6') },
  { question: t('landing.seo.faq.q7'), answer: t('landing.seo.faq.a7') },
  { question: t('landing.seo.faq.q8'), answer: t('landing.seo.faq.a8') },
  ```
- [x] El `.filter((item) => item.question && item.answer)` ya existe en línea 213 — **no duplicar ni eliminar**

### C. FAQ visible en UI — nueva sección en landing (AC: 1)

- [x] Añadir sección FAQ en `src/app/features/landing/landing.component.html` (antes del `<app-landing-footer>`)
- [x] Usar `<dl>`/`<dt>`/`<dd>` con acordeón CSS puro (según Dev Notes: preferido sobre details/summary)
- [x] Seguir patrones CSS de secciones existentes: `section`, `section--surface`, `section-header`, `section-label`, `section-title`, `reveal`
- [x] Añadir claves i18n de label y title de la sección (`landing.seo.faq.section_title`) en los 3 idiomas
- [x] Iterar con `@for` (Angular 20 native control flow) sobre los índices 1-8

Estructura sugerida:
```html
<section class="section section--surface faq-section" aria-labelledby="faq-title">
  <div class="container">
    <div class="section-header reveal">
      <h2 class="section-title" id="faq-title">{{ t('landing.seo.faq.section_title') }}</h2>
    </div>
    <dl class="faq-list reveal" [attr.data-delay]="100">
      @for (n of faqNumbers; track n) {
        <div class="faq-item">
          <dt class="faq-question">{{ t('landing.seo.faq.q' + n) }}</dt>
          <dd class="faq-answer">{{ t('landing.seo.faq.a' + n) }}</dd>
        </div>
      }
    </dl>
  </div>
</section>
```
Añadir en el componente TS: `readonly faqNumbers = [1,2,3,4,5,6,7,8] as const;`

Clave i18n mínima a añadir (es/ca/en):
```json
"section_title": "Preguntas frecuentes"  // es
"section_title": "Preguntes freqüents"   // ca
"section_title": "Frequently asked questions"  // en
```

### D. Organization schema: añadir `foundingLocation` + `areaServed` (AC: 2)

- [x] En `landing-seo.service.ts`, método `setStructuredData()` (línea ~159), en `this.seo.setJsonLd('organization', {...})`:
  ```diff
    name: 'Regálalo',
    url: `${siteUrl}/`,
    description,
    logo: imageUrl,
  + foundingLocation: { '@type': 'Country', name: 'Spain' },
  + areaServed: { '@type': 'Country', name: 'Spain' },
  + sameAs: [],
  ```
- [x] NO eliminar campos existentes — solo añadir los nuevos

### E. Nuevo SoftwareApplication schema (AC: 3)

- [x] En `setStructuredData()`, añadir `this.seo.setJsonLd('app', {...})` **después** de `setJsonLd('webpage', ...)`:
  ```ts
  this.seo.setJsonLd('app', {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Regálalo',
    url: `${siteUrl}/`,
    applicationCategory: 'SocialNetworkingApplication',
    operatingSystem: 'Web',
    description,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    inLanguage: ['es', 'ca', 'en'],
    availableOnDevice: 'Desktop, Mobile',
  });
  ```

### F. Añadir `theme-color` y preconnect en `index.html` (AC: 4)

- [x] En `src/index.html`, dentro de `<head>`, añadir ANTES de `<title>Regálalo</title>`:
  ```html
  <meta name="theme-color" content="#3A7358">
  <link rel="preconnect" href="https://www.googletagmanager.com">
  <link rel="preconnect" href="https://www.google-analytics.com">
  ```
- [x] NO añadir preconnect de Google Fonts

### G. Tests: actualizar spec (AC: 1–5)

- [x] En `landing-seo.service.spec.ts`, actualizar el mock de Transloco para incluir q4-q8 / a4-a8 bajo `landing.seo.faq`
- [x] Añadir test: `buildFaq()` retorna 8 items en locale 'es'
- [x] Añadir test: Organization schema en `setJsonLd` incluye `areaServed` y `foundingLocation`
- [x] Añadir test: existe llamada a `setJsonLd` con `@type: SoftwareApplication`
- [x] Verificar que tests previos siguen pasando (html lang, og:image, analytics consent gating)

## Dev Notes

### Estado actual del código (post story 11-f1)

| Archivo | Estado actual | Acción requerida |
|---|---|---|
| `src/app/core/seo/landing-seo.service.ts` | `buildFaq()` lee q1–q3; Organization sin areaServed/foundingLocation; sin SoftwareApplication | Extender q1–q8, enriquecer Organization, añadir SoftwareApplication |
| `public/i18n/es.json` | `landing.seo.faq` tiene q1–a3 | Añadir q4–a8 |
| `public/i18n/ca.json` | Idem | Idem |
| `public/i18n/en.json` | Idem | Idem |
| `src/index.html` | Sin `theme-color` ni preconnect | Añadir 3 tags en `<head>` |
| `src/app/features/landing/landing.component.html` | Sin sección FAQ visible (275 líneas, 4 secciones + hero + CTA) | Añadir sección FAQ antes del footer |
| `src/app/core/seo/landing-seo.service.spec.ts` | Tests para q1–q3, html lang, og:image, analytics | Extender mocks y añadir tests |

### `landing-seo.service.ts` — estructura actual (líneas clave)

- **Línea 29** `apply(locale)`: punto de entrada — llama a setStructuredData()
- **Línea 139** `setStructuredData(pageTitle, description, url, locale)`: donde viven todos los JSON-LD
- **Línea 150** `setJsonLd('website', ...)`: WebSite schema
- **Línea 159** `setJsonLd('organization', ...)`: Organization schema — **MODIFICAR** para añadir foundingLocation + areaServed
- **Línea 168** `buildFaq(locale)` call → **resultado** a `setJsonLd('faq', ...)`
- **Línea 184** `setJsonLd('webpage', ...)`: WebPage schema → añadir `setJsonLd('app', ...)` DESPUÉS
- **Línea 196** `buildFaq(locale)`: array de 3 FaqItem → **EXTENDER** a 8
- **Línea 213** `filter((item) => item.question && item.answer)`: preservar
- Identificadores `setJsonLd`: `'website'`, `'organization'`, `'faq'`, `'webpage'` → nuevo `'app'`

### Organization schema — diff exacto (líneas ~159–166)

```diff
 this.seo.setJsonLd('organization', {
   '@context': 'https://schema.org',
   '@type': 'Organization',
   name: 'Regálalo',
   url: `${siteUrl}/`,
   description,
   logo: imageUrl,
+  foundingLocation: { '@type': 'Country', name: 'Spain' },
+  areaServed: { '@type': 'Country', name: 'Spain' },
+  sameAs: [],
 });
```

### FAQ visible en UI — por qué `dl`/`dt`/`dd` en lugar de `details`/`summary`

`<details>`/`<summary>` introduce JavaScript de estado nativo y puede conflictuar con las animaciones CSS `reveal` del landing. Usar `<dl>`/`<dt>`/`<dd>` con acordeón CSS puro evita JS adicional y es semánticamente correcto para pares pregunta-respuesta. El componente TS solo necesita `readonly faqNumbers = [1,2,3,4,5,6,7,8];` — sin lógica adicional.

### Tests — mock Transloco pattern (desde spec existente)

El spec usa `vi.fn()` como mock de `transloco.translate`. Ejemplo del patrón actual:
```ts
// Añadir en el objeto de mock:
'landing.seo.faq.q4': '¿En qué ciudades está disponible Regálalo?',
'landing.seo.faq.a4': 'Regálalo está disponible en toda España...',
// ... q5-q8, a5-a8 ...
```

### GA script — por qué preconnect tiene sentido

`initAnalytics()` en `landing-seo.service.ts` (línea ~268) crea dinámicamente:
```ts
script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
```
El preconnect en `index.html` establece la conexión TCP/TLS antes de que el script se inyecte (cuando el usuario da consentimiento analytics), reduciendo la latencia de carga del script GA.

### Fuentes — self-hosted, sin preconnect Google Fonts

`styles.scss` usa `font-family: inherit` — las fuentes no se cargan desde Google Fonts. El `<link rel="preconnect" href="https://fonts.googleapis.com">` **NO debe añadirse**.

### Qué NO implementar en esta story

- Cambios en `src/server.ts` — sitemap ya implementado en 11-f1
- Cambios en environments (`ogImagePath` ya en `.png` desde 11-f1)
- `html lang` dinámico — ya en `apply()` desde 11-f1
- og:image dimensiones — ya en `setOpenGraph()` desde 11-f1
- `/como-funciona/reputacion` — ya en sitemap desde cc-reputacion-publica
- Blog / páginas `/acerca-de` (backlog documentado en el proposal)

### Project Structure Notes

- `LandingSeoService` en `src/app/core/seo/` — singleton `providedIn: 'root'`
- Landing component: `src/app/features/landing/landing.component.ts` + `landing.component.html` + `landing.component.scss`
- i18n files: `public/i18n/{es,ca,en}.json`
- Tests: Vitest + Angular TestBed en `src/app/core/seo/landing-seo.service.spec.ts`
- Angular v20+: NO añadir `standalone: true` en decoradores; usar `@for` / `@if` (no `*ngFor`/`*ngIf`)

### References

- Proposal SEO/GEO original: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-01-seo-geo.md` §4.4–4.6
- Enmienda (reducción stories): `_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-01-seo-geo-amendment-reduccion-stories.md` §4.3
- Historia anterior: `_bmad-output/implementation-artifacts/11-f1-seo-tecnico-critico-pre-lanzamiento.md`
- `src/app/core/seo/landing-seo.service.ts` — archivo principal a modificar
- `src/app/features/landing/landing.component.html` — añadir sección FAQ
- `public/i18n/{es,ca,en}.json` — extender landing.seo.faq

### Review Findings

- [x] [Review][Decision] FAQ visual: añadir acordeón CSS puro → PATCH (decidido: opción 2, accordion CSS con dl/dt/dd sin JS)
- [x] [Review][Decision] i18n fuera de scope mezclados en archivos JSON → DESCARTADO (decidido: consolidar 10-f2 y 11-f2 en el mismo commit)
- [x] [Review][Decision] Construcción dinámica de clave i18n → PATCH (decidido: precomputar faqItems en TS con llamadas t() estáticas, eliminar faqNumbers)
- [x] [Review][Patch] Acordeón CSS puro en sección FAQ — input checkbox oculto + label + sibling CSS (`~`); `.faq-toggle:checked ~ .faq-answer { display: block }` [landing.component.html, landing.component.scss]
- [x] [Review][Patch] Precomputar faqItems en componente TS — eliminado `faqNumbers`, añadido `faqKeys as const` con 8 pares `{ q, a }` de claves estáticas; template itera `faqKeys` [landing.component.ts, landing.component.html]
- [x] [Review][Patch] section-label pill ausente en FAQ section-header — añadido `<span class="section-label">{{ t('landing.seo.faq.section_label') }}</span>` + clave `section_label: "FAQ"` en 3 locales [landing.component.html, public/i18n/*.json]
- [x] [Review][Patch] [attr.data-delay]="100" debe ser atributo estático — cambiado a `data-delay="100"` [landing.component.html]
- [x] [Review][Patch] sameAs: [] array vacío en Organization schema — campo eliminado [src/app/core/seo/landing-seo.service.ts]
- [x] [Review][Patch] `availableOnDevice` no es propiedad válida de SoftwareApplication en schema.org — campo eliminado [src/app/core/seo/landing-seo.service.ts]
- [x] [Review][Patch] preconnect hints sin atributo `crossorigin` — añadido `crossorigin` a ambos `<link rel="preconnect">` [src/index.html]
- [x] [Review][Patch] Tests solo cubren locale 'es' — añadidos tests AC1 para 'ca' y 'en'; helper `getFaqScript(locale)` extraído; total 17/17 tests pasan [src/app/core/seo/landing-seo.service.spec.ts]
- [x] [Review][Patch] es.json FAQ a6 "suma punts" — verificado: el archivo ya tenía "suma puntos" (artefacto de encoding en el diff). No se requirió cambio.
- [x] [Review][Patch] SoftwareApplication Offer sin campo `availability` — añadido `availability: 'https://schema.org/InStock'` en Offer; test AC3 actualizado para verificarlo [src/app/core/seo/landing-seo.service.ts]
- [x] [Review][Patch] try/catch en tests oculta schemas JSON-LD corruptos — reemplazado `s.textContent ?? '{}'` por guard explícito `if (!content) return false`; assertions usan `!.textContent!` en lugar de `?? '{}'` [src/app/core/seo/landing-seo.service.spec.ts]
- [x] [Review][Defer] html lang="es" hardcoded en index.html — SSR sin JS ve idioma incorrecto en rutas /ca y /en [src/index.html:2] — deferred, pre-existente
- [x] [Review][Defer] buildFaq + template: Transloco devuelve la key (truthy) en key-miss → filter && no protege [landing-seo.service.ts, landing.component.html] — deferred, pre-existente
- [x] [Review][Defer] preconnect GA/GTM antes de consentimiento — riesgo GDPR leve [src/index.html] — deferred, pre-existente; AC4 lo exige explícitamente; preconnect no transmite PII
- [x] [Review][Defer] Mención de "Wallapop" en contenido FAQ (decisión de negocio/legal) [public/i18n/*.json] — deferred, pre-existente
- [x] [Review][Defer] Traducciones whitespace-only pasan el filter de buildFaq — comportamiento pre-existente del filtro [src/app/core/seo/landing-seo.service.ts] — deferred, pre-existente
- [x] [Review][Defer] SSR/prerender: schemas inyectados solo en callback asíncrono de selectTranslation — arquitectónico, pre-existente [src/app/features/landing/landing.component.ts] — deferred, pre-existente

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Tarea A: Añadidos q4–q8 + a4–a8 + `section_title` en los 3 archivos i18n (es, ca, en).
- Tarea B: `buildFaq()` extendido a 8 items; filtro existente preservado.
- Tarea C: Sección FAQ añadida en landing HTML antes del footer; usa `dl`/`dt`/`dd` con CSS accordion (sin JS adicional); `faqNumbers = [1..8]` en el componente TS; estilos en landing.component.scss.
- Tarea D: Organization schema enriquecido con `foundingLocation`, `areaServed`, `sameAs`.
- Tarea E: SoftwareApplication schema añadido con todos los campos requeridos.
- Tarea F: `theme-color` y 2 preconnect (GTM + GA) añadidos en index.html; sin preconnect Google Fonts.
- Tarea G: 3 nuevos tests añadidos (8 FAQ items, Organization schema, SoftwareApplication); mock Transloco extendido con q4–q8; limpieza JSON-LD en afterEach. 15/15 tests pasan. Build sin errores TypeScript.

### File List

- `public/i18n/es.json`
- `public/i18n/ca.json`
- `public/i18n/en.json`
- `src/app/core/seo/landing-seo.service.ts`
- `src/app/core/seo/landing-seo.service.spec.ts`
- `src/app/features/landing/landing.component.html`
- `src/app/features/landing/landing.component.ts`
- `src/app/features/landing/landing.component.scss`
- `src/index.html`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-06-01: Implementación completa — FAQ extendida a 8 preguntas (es/ca/en), Organization schema enriquecido con areaServed/foundingLocation, SoftwareApplication schema añadido, theme-color + preconnect en index.html, sección FAQ visible en landing UI con dl/dt/dd, 3 tests nuevos (15/15 pasan). (claude-sonnet-4-6)
