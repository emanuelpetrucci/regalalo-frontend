# Sprint Change Proposal — Optimización SEO/GEO

**Fecha:** 2026-06-01
**Scope:** Moderate — nueva épica 11-f con 6 stories en dos olas + backlog documentado  
**Enmienda (2026-06-01):** backlog consolidado a **2 stories** — ver `sprint-change-proposal-2026-06-01-seo-geo-amendment-reduccion-stories.md`  
**Estado:** Aprobado (alcance técnico); backlog 2 stories vía enmienda aprobada  
**Aprobado por:** Emanuel  
**Fecha de aprobación:** 2026-06-01

---

## 1. Resumen del Issue

### Problema

Auditoría SEO/GEO del 2026-06-01 identificó múltiples deficiencias que bloquean la indexación correcta del sitio y limitan la visibilidad en motores de búsqueda y AI engines. Los tres issues más críticos están activos en producción:

1. **og:image en formato SVG** (`src/environments/environment.production.ts:12`): Facebook, Twitter/X, LinkedIn y WhatsApp no renderizan SVG como Open Graph image → links compartidos aparecen sin previsualización de imagen.
2. **`<html lang>` hardcodeado en "es"** (`src/index.html:2`): Las rutas prerenderizadas `/en` y `/ca` generan HTML con `lang="es"` → Google puede ignorar los hreflang por contradicción con el atributo lang.
3. **Ausencia de `<lastmod>` en sitemap** (`src/server.ts`): Google no puede priorizar el recrawl correctamente.

Issues adicionales de alta prioridad (afectan posicionamiento sin bloquear indexación):
- FAQ de solo 3 preguntas — impacto en AI Overviews (Perplexity, ChatGPT, Google)
- Organization schema sin `areaServed` ni `foundingLocation`
- Sin SoftwareApplication schema — los AI engines no clasifican el producto correctamente
- Sin preconnect hints para GTM/GA — latencia DNS+TLS innecesaria
- Sin `<meta name="theme-color">` — UX en Chrome Mobile e iOS/Android

### Contexto

El análisis reveló también gaps en keyword strategy, ausencia de páginas dedicadas para GEO (`/acerca-de`, `/como-funciona`) y mejoras técnicas de menor urgencia. El Sprint Change Proposal `sprint-change-proposal-2026-06-01-reputacion-publica.md` (**aprobado** 2026-06-01) ya cubre la indexación de `/como-funciona/reputacion`; este documento no lo duplica.

---

## 2. Análisis de Impacto

### Epic Impact

Ninguna épica existente (1–10-f) queda invalidada ni requiere modificación. Los cambios SEO/GEO son ortogonales a la lógica de negocio. Se propone nueva **Épica 11-f: SEO/GEO Optimization**.

| Épica | Estado actual | Impacto de este proposal |
|---|---|---|
| Epic 1–8-f | done (todas las stories) | Sin impacto |
| Epic 9 | in-progress (9-5, 9-7) | Sin impacto — paralelas |
| Epic 10-f | in-progress (10-f2 backlog) | Sin impacto — paralelas |
| **Epic 11-f (nueva)** | — | Creada por este proposal |

### Story Impact

Las stories en curso (9-5, 9-7, 10-f2) no son afectadas. El Sprint Change Proposal de `reputacion-publica` puede implementarse en paralelo.

### Artifact Conflicts

| Artefacto | Problema identificado | Resolución |
|---|---|---|
| `src/environments/environment.production.ts` | `ogImagePath: '/og-image.svg'` | Cambiar a `/og-image.png` |
| `src/environments/environment.ts` | Mismo path SVG en desarrollo | Actualizar |
| `public/og-image.svg` | Formato inválido para OG en redes sociales | Reemplazar por `og-image.png` (1200×630 px) |
| `src/app/core/seo/landing-seo.service.ts` | Sin `<html lang>` dinámico; OG sin dimensiones; Organization incompleto; sin SoftwareApplication | 4 cambios en un mismo archivo |
| `src/index.html` | Sin preconnect para GTM/GA; sin `theme-color` | Añadir tags en `<head>` |
| `src/server.ts` | Sitemap sin `<lastmod>`; estructura no extensible | Refactorizar a array tipado |
| `public/i18n/es.json` | FAQ con solo 3 preguntas | Ampliar a 8 preguntas |
| `public/i18n/ca.json` | Idem | Ampliar a 8 preguntas |
| `public/i18n/en.json` | Idem | Ampliar a 8 preguntas |

### Technical Impact

- Sin cambios en servicios de negocio, guards, interceptores, API ni contratos OpenAPI
- Sin cambios en rutas autenticadas ni en lógica de estado
- Impacto en bundle: mínimo (metadatos, JSON i18n)
- La imagen `og-image.png` es un **prerequisito externo** (asset de diseño, 1200×630 px); la story 11-f1 lo documenta explícitamente

---

## 3. Enfoque Recomendado: Direct Adjustment

Nueva épica **11-f: SEO/GEO Optimization** con 6 stories organizadas en dos olas:

- **Ola crítica (11-f1 a 11-f3):** Bugs que bloquean indexación o generan previsualización rota — implementar antes del lanzamiento
- **Ola de mejoras (11-f4 a 11-f6):** Alta prioridad SEO/GEO — implementar en sprint siguiente

**Rationale:**
- Zero impacto en lógica de negocio ni contratos API
- Las stories son pequeñas e independientes entre sí (pueden paralelizarse)
- El único prerequisito externo es el asset de imagen OG
- Las épicas 9 y 10-f continúan sin interferencia

**Esfuerzo estimado:** 2-3 horas para ola crítica (excluido asset); 2-3 horas para ola de mejoras
**Riesgo:** Bajo
**Impacto en timeline:** Sin bloqueo a ninguna épica en curso

---

## 4. Propuestas de Cambio Detalladas

### 4.1 Story 11-f1: og:image — conversión a PNG con dimensiones OG

**Archivos:** `src/environments/environment.production.ts`, `src/environments/environment.ts`, `public/` (nuevo asset), `src/app/core/seo/landing-seo.service.ts`

**Prerequisito:** Asset `public/og-image.png` de 1200×630 px con diseño de marca.

```diff
// environment.production.ts y environment.ts
- ogImagePath: '/og-image.svg',
+ ogImagePath: '/og-image.png',
```

En `landing-seo.service.ts` → método `setOpenGraph()`:
```diff
  { property: 'og:image',        content: imageUrl },
+ { property: 'og:image:width',  content: '1200' },
+ { property: 'og:image:height', content: '630'  },
+ { property: 'og:image:type',   content: 'image/png' },
  { property: 'og:image:alt',    content: title },
```

**Rationale:** SVG no es soportado por Facebook, Twitter/X, LinkedIn ni WhatsApp para Open Graph previews. Sin imagen válida, los links compartidos aparecen sin previsualización, reduciendo CTR en social.

---

### 4.2 Story 11-f2: `<html lang>` dinámico en SSR

**Archivo:** `src/app/core/seo/landing-seo.service.ts`

Al inicio del método `apply(lang: string, ...)` (o equivalente donde se aplica el idioma):

```diff
+ const htmlEl = this.document.documentElement;
+ htmlEl.lang = lang === 'ca' ? 'ca' : lang === 'en' ? 'en' : 'es';
```

**Nota de implementación:** Funciona en SSR porque Angular escribe el atributo `lang` en el HTML prerenderizado cuando se modifica `document.documentElement.lang`. `DOCUMENT` ya está inyectado en `LandingSeoService`.

**Rationale:** Las rutas prerenderizadas `/en` y `/ca` generan HTML con `lang="es"`. Google usa `<html lang>` como señal primaria de idioma y puede ignorar los hreflang si hay contradicción.

---

### 4.3 Story 11-f3: Sitemap con `<lastmod>` y estructura extensible

**Archivo:** `src/server.ts`

```diff
- const paths = ['/', '/en', '/ca'];
- const urls = paths.map((path) => {
-   const loc = path === '/' ? `${siteUrl}/` : `${siteUrl}${path}`;
-   return `  <url><loc>${loc}</loc><changefreq>weekly</changefreq><priority>${path === '/' ? '1.0' : '0.9'}</priority></url>`;
- }).join('\n');

+ const sitemapEntries: Array<{ path: string; priority: string; changefreq: string }> = [
+   { path: '/',   priority: '1.0', changefreq: 'weekly' },
+   { path: '/en', priority: '0.9', changefreq: 'weekly' },
+   { path: '/ca', priority: '0.9', changefreq: 'weekly' },
+ ];
+ const lastmod = new Date().toISOString().slice(0, 10);
+ const urls = sitemapEntries.map(({ path, priority, changefreq }) => {
+   const loc = path === '/' ? `${siteUrl}/` : `${siteUrl}${path}`;
+   return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
+ }).join('\n');
```

**Nota de coordinación:** Si `sprint-change-proposal-2026-06-01-reputacion-publica.md` se aprueba antes de implementar esta story, el array `sitemapEntries` debe incluir también `{ path: '/como-funciona/reputacion', priority: '0.7', changefreq: 'monthly' }`.

**Rationale:** `<lastmod>` permite a Google priorizar el recrawl de URLs más recientemente modificadas. La refactorización a array tipado facilita añadir entradas futuras sin duplicar lógica.

---

### 4.4 Story 11-f4: FAQ ampliada a 8 preguntas (i18n)

**Archivos:** `public/i18n/es.json`, `public/i18n/ca.json`, `public/i18n/en.json`

Añadir preguntas q4–q8 en la sección `landing.faq` (o la clave raíz donde estén q1–q3).

**`es.json`:**
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

(Traducciones equivalentes en `ca.json` y `en.json`.)

**`ca.json`:**
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

**`en.json`:**
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

**Rationale:** Google AI Overviews, Perplexity y ChatGPT extraen información de FAQPage schemas. Con 3 preguntas el schema es insuficiente; 8 preguntas cubren dudas frecuentes de usuarios y aumentan la probabilidad de citación en respuestas de AI engines. La pregunta q5 (diferencia con Wallapop) es la más valiosa para diferenciación competitiva GEO.

---

### 4.5 Story 11-f5: Structured Data — SoftwareApplication + Organization enhancements

**Archivo:** `src/app/core/seo/landing-seo.service.ts`

**4.5.a — Organization schema: añadir `areaServed` y `foundingLocation`:**

```diff
  this.seo.setJsonLd('organization', {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Regálalo',
    url: `${siteUrl}/`,
    description,
    logo: imageUrl,
+   foundingLocation: { '@type': 'Country', name: 'Spain' },
+   areaServed: { '@type': 'Country', name: 'Spain' },
+   sameAs: [],
  });
```

**4.5.b — Nuevo SoftwareApplication schema:**

```diff
+ this.seo.setJsonLd('app', {
+   '@context': 'https://schema.org',
+   '@type': 'SoftwareApplication',
+   name: 'Regálalo',
+   url: `${siteUrl}/`,
+   applicationCategory: 'SocialNetworkingApplication',
+   operatingSystem: 'Web',
+   description,
+   offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
+   inLanguage: ['es', 'ca', 'en'],
+   availableOnDevice: 'Desktop, Mobile',
+ });
```

**Rationale:** `areaServed` + `foundingLocation` permiten a Google entender la operación como española, mejorando relevancia en búsquedas geolocalizadas. El schema `SoftwareApplication` impacta en Rich Results de Apps y en respuestas de AI engines sobre "mejores apps para donar cosas en España".

---

### 4.6 Story 11-f6: Performance hints y meta tags de dispositivo

**Archivo:** `src/index.html`

Añadir en `<head>` antes de los scripts existentes:

```diff
  <head>
+   <meta name="theme-color" content="#3A7358">
+   <link rel="preconnect" href="https://www.googletagmanager.com">
+   <link rel="preconnect" href="https://www.google-analytics.com">
    ...
```

**Nota de implementación:** Verificar si las fuentes tipográficas (Playfair Display, DM Sans, JetBrains Mono) están self-hosted en `public/` o si se cargan desde Google Fonts. Si son self-hosted, no añadir preconnect de fonts. El color `#3A7358` es el verde primario del design system (`colors_and_type.css`).

**Rationale:** `theme-color` afecta la barra de color del navegador en Chrome Mobile y la UI de iOS/Android cuando el sitio se añade a pantalla de inicio. Los preconnect eliminan la latencia DNS + TLS handshake para los dominios de Google Analytics/Tag Manager, mejorando FCP en primera carga.

---

## 5. Handoff de Implementación

**Scope:** Moderate — Developer agent puede implementar ambas olas. Se recomienda separar en dos sesiones para mantener el scope manejable.

### Epic 11-f en sprint-status.yaml

> **Enmienda 2026-06-01:** las 6 stories siguientes se consolidaron en 2. Estado canónico en `sprint-status.yaml`.

```yaml
  # ─── Épica 11-f: SEO/GEO Optimization ───
  epic-11-f: backlog
  11-f1-seo-tecnico-critico-pre-lanzamiento: backlog   # ex 11-f1+f2+f3
  11-f2-seo-geo-mejoras-landing: backlog               # ex 11-f4+f5+f6
  epic-11-f-retrospective: optional
```

### Orden de implementación sugerido

**Ola crítica — antes del lanzamiento:**

| Story | Archivo(s) principal(es) | Tiempo est. | Prerequisito |
|---|---|---|---|
| 11-f2 | `landing-seo.service.ts` | 30 min | — |
| 11-f3 | `src/server.ts` | 30 min | — (coordinar con reputacion-publica) |
| 11-f1 | `environments/`, `landing-seo.service.ts`, `public/` | 1h | Asset PNG de diseño |

**Ola de mejoras — sprint siguiente:**

| Story | Archivo(s) principal(es) | Tiempo est. | Prerequisito |
|---|---|---|---|
| 11-f4 | `public/i18n/*.json` | 45 min | — |
| 11-f5 | `landing-seo.service.ts` | 1h | — |
| 11-f6 | `src/index.html` | 20 min | Verificar self-hosting de fuentes |

### Criterios de aceptación

**Ola crítica:**
- [ ] `GET /en` devuelve HTML con `<html lang="en">`; `GET /ca` con `<html lang="ca">`; `GET /` con `<html lang="es">`
- [ ] `og:image` referencia `/og-image.png`; el archivo existe en `public/` con dimensiones 1200×630 px
- [ ] `og:image:width` = 1200, `og:image:height` = 630, `og:image:type` = image/png presentes en HTML prerenderizado
- [ ] `curl https://regalalo.org/sitemap.xml` devuelve XML con `<lastmod>` en todas las `<url>`
- [ ] No hay regresión en `meta title`, `canonical`, `hreflang` ni structured data existentes

**Ola de mejoras:**
- [ ] FAQPage schema incluye 8 preguntas en los 3 idiomas y se renderizan en la UI
- [ ] Organization schema incluye `areaServed` y `foundingLocation` con valor `Spain`
- [ ] SoftwareApplication schema presente y válido (verificable en Google Rich Results Test)
- [ ] `<meta name="theme-color" content="#3A7358">` presente en `<head>`
- [ ] preconnect para GTM y GA presentes en `<head>`
- [ ] No hay regresión AXE en la landing

---

## 6. Backlog Documentado (fuera de scope de este proposal)

| Item | Prioridad | Notas |
|---|---|---|
| Revisar keyword strategy en H1 + meta descriptions (3 idiomas) | Alta | Decisión de producto: equilibrio entre tono emocional y keywords de volumen |
| Indexar `/reputacion` + prerender + sitemap | Baja | Ya cubierto por `sprint-change-proposal-2026-06-01-reputacion-publica.md` |
| Crear página `/acerca-de` (señal de entidad GEO para AI crawlers) | Media | Nueva feature — requiere story propia en Epic futura |
| `apple-touch-icon.png` (180×180) + `manifest.json` | Media | Presencia en iOS/Android — coordinar con diseño |
| `twitter:site` meta tag (`@regalalo_org`) | Baja | Solo si existe cuenta verificada de Twitter/X |
| Verificar `SITE_URL` env var en Vercel dashboard | Media | Previene canónicas erróneas en rama develop |
| Verificar acceso a `/sitemap.xml` con curl en producción | Media | Post-deploy — confirmar que Express handler precede a `static()` |
| Blog / contenido informacional (`/como-funciona` dedicado) | Alta (6 meses) | Necesario para AI Overviews y long-tail SEO; fuera del scope MVP |
