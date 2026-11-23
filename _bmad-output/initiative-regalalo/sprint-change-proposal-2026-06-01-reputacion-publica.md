# Sprint Change Proposal — Ruta Pública de Reputación

**Fecha:** 2026-06-01  
**Scope:** Minor — implementación directa por Developer agent  
**Estado:** Aprobado  
**Aprobado por:** Emanuel  
**Fecha de aprobación:** 2026-06-01

---

## 1. Resumen del Issue

### Problema

La página `/reputacion` existe como ruta pública (sin `authGuard`) pero renderiza una navegación de aplicación autenticada: links a `/explorar`, `/mis-objetos`, `/entregas`, `/perfil` y un botón "Publicar" → `/mis-objetos/publicar`. Esto genera disonancia visual para visitantes no autenticados y la hace inaccesible semánticamente desde la landing.

Adicionalmente, la ruta usa `RenderMode.Client`, no está en el sitemap ni en `robots.txt`, y no hay enlace desde la landing.

### Contexto

Identificado en el análisis SEO/GEO de 2026-06-01 como mejora de prioridad media. El usuario solicita explícitamente una nueva ruta pública donde el mismo contenido se renderice con navegación de landing (sin links autenticados) y sea enlazable desde la landing page.

---

## 2. Análisis de Impacto

### Epic Impact

No se modifica ningún epic existente. Este cambio es un refinamiento de routing y presentación que no afecta la lógica de negocio.

### Story Impact

No hay historias activas afectadas. La ruta `/reputacion` (modo app) permanece intacta.

### Artifact Conflicts

| Artefacto | Conflicto | Resolución |
|---|---|---|
| `app.routes.ts` | Nueva ruta necesaria | Añadir `como-funciona/reputacion` |
| `app.routes.server.ts` | Nueva ruta sin prerender | Añadir `RenderMode.Prerender` |
| `seo.constants.ts` | Ruta no en `LANDING_PATHS` | Añadir al Set |
| `robots.txt` | Ruta no permitida | Añadir `Allow` |
| `server.ts` | Ruta no en sitemap | Añadir con prioridad 0.7 |
| `landing.component.html` | Sin link a reputación | Añadir en footer |
| `i18n/*.json` | Clave de footer faltante | Añadir en los 3 idiomas |

### Technical Impact

- `ReputationGuideComponent` necesita bifurcación de nav vía `input()` + `ActivatedRoute`
- Sin cambios en servicios, guards, interceptores ni API
- Impacto en bundle: mínimo (reutiliza componente existente)
- Impacto en build de Vercel: nueva URL prerenderizada (+1 HTML estático)

---

## 3. Enfoque Recomendado: Direct Adjustment

Añadir nueva ruta `como-funciona/reputacion` reutilizando `ReputationGuideComponent` con un input `publicMode`. La ruta existente `/reputacion` permanece sin cambios funcionales.

**Rationale:**
- Cero duplicación de contenido
- La ruta existente `/reputacion` puede servir a usuarios autenticados sin interrupciones
- La nueva ruta es la URL canónica pública, indexable, con nav de landing
- `/como-funciona/reputacion` es semánticamente consistente con el anchor `#como-funciona` de la landing

**Esfuerzo estimado:** 2-3 horas  
**Riesgo:** Bajo — sin cambios en lógica de negocio ni contratos API  
**Impacto en timeline:** Sin bloqueo a otras historias del sprint

---

## 4. Propuestas de Cambio Detalladas

### 4.1 `ReputationGuideComponent` — añadir modo público

**Archivo:** `src/app/features/reputation/reputation-guide.component.ts`

```diff
+ import { input } from '@angular/core';
+ import { ActivatedRoute }  from '@angular/router';

  export class ReputationGuideComponent {
+   readonly publicMode = input<boolean>(false);
+   private readonly route = inject(ActivatedRoute);
    private readonly session = inject(SessionService);
    // ...

+   constructor() {
+     // Lee publicMode desde route data si no viene como input directo
+     const routePublicMode = this.route.snapshot.data['publicMode'] as boolean | undefined;
+     if (routePublicMode) {
+       // signal override si withComponentInputBinding no está activo
+     }
+   }
  }
```

> **Nota de implementación:** Si `withComponentInputBinding()` está habilitado en `app.config.ts` → el router inyecta `data.publicMode` directamente en el `input()` y no se necesita `ActivatedRoute`. Verificar antes de implementar.

**Añadir al template — bifurcación de nav:**

```html
@if (publicMode()) {
  <nav class="top-nav top-nav--public" aria-label="Navegación principal">
    <a routerLink="/" class="nav-logo">Regálalo</a>
    <div class="nav-actions">
      <app-language-selector />
      <a routerLink="/login" class="btn-sm btn-secondary">
        {{ t('landing.nav.login') }}
      </a>
      <a routerLink="/register" class="btn-sm btn-primary">
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {{ t('landing.nav.register') }}
      </a>
    </div>
  </nav>
} @else {
  <!-- nav existente sin cambios -->
  <nav class="top-nav" aria-label="Navegación principal">
    ...
  </nav>
}
```

**Diseño de referencia:** `docs/project/Landing Page.html` — mismos tokens para la nav pública (`.brand`, `.btn-secondary`, `.btn-primary`, `.btn-sm`).

---

### 4.2 `app.routes.ts` — nueva ruta pública

```diff
  {
    path: 'reputacion',
    loadComponent: () =>
      import('./features/reputation/reputation-guide.component').then(
        (m) => m.ReputationGuideComponent,
      ),
  },
+ {
+   path: 'como-funciona/reputacion',
+   loadComponent: () =>
+     import('./features/reputation/reputation-guide.component').then(
+       (m) => m.ReputationGuideComponent,
+     ),
+   data: { publicMode: true },
+ },
```

---

### 4.3 `app.routes.server.ts` — prerender nueva ruta

```diff
  export const serverRoutes: ServerRoute[] = [
    { path: '', renderMode: RenderMode.Prerender },
    { path: 'en', renderMode: RenderMode.Prerender },
    { path: 'ca', renderMode: RenderMode.Prerender },
+   { path: 'como-funciona/reputacion', renderMode: RenderMode.Prerender },
    { path: '**', renderMode: RenderMode.Client },
  ];
```

---

### 4.4 `seo.constants.ts` — marcar como indexable

```diff
- export const LANDING_PATHS = new Set(['/', '/en', '/ca']);
+ export const LANDING_PATHS = new Set(['/', '/en', '/ca', '/como-funciona/reputacion']);
```

---

### 4.5 `public/robots.txt` — permitir crawl

```diff
  Allow: /$
  Allow: /en$
  Allow: /ca$
+ Allow: /como-funciona/reputacion$
```

---

### 4.6 `src/server.ts` — añadir al sitemap con prioridad

```diff
- const paths = ['/', '/en', '/ca'];
- const urls = paths.map((path) => {
-   const loc = path === '/' ? `${siteUrl}/` : `${siteUrl}${path}`;
-   return `  <url><loc>${loc}</loc><changefreq>weekly</changefreq><priority>${path === '/' ? '1.0' : '0.9'}</priority></url>`;
- }).join('\n');

+ const sitemapEntries: Array<{ path: string; priority: string; changefreq: string }> = [
+   { path: '/',                          priority: '1.0', changefreq: 'weekly' },
+   { path: '/en',                        priority: '0.9', changefreq: 'weekly' },
+   { path: '/ca',                        priority: '0.9', changefreq: 'weekly' },
+   { path: '/como-funciona/reputacion',  priority: '0.7', changefreq: 'monthly' },
+ ];
+ const lastmod = new Date().toISOString().slice(0, 10);
+ const urls = sitemapEntries.map(({ path, priority, changefreq }) => {
+   const loc = path === '/' ? `${siteUrl}/` : `${siteUrl}${path}`;
+   return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
+ }).join('\n');
```

---

### 4.7 `landing.component.html` — link en footer

En la columna "Plataforma" del footer, añadir enlace:

```diff
  <a routerLink="/login" class="footer-link">{{ t('landing.footer.link_login') }}</a>
  <a routerLink="/register" class="footer-link">{{ t('landing.footer.link_register') }}</a>
  <a href="#como-funciona" class="footer-link" (click)="scrollToHowItWorks($event)">{{ t('landing.footer.link_how') }}</a>
+ <a routerLink="/como-funciona/reputacion" class="footer-link">{{ t('landing.footer.link_reputation') }}</a>
```

---

### 4.8 `public/i18n/*.json` — clave del footer

**`es.json`** (en `landing.footer`):
```diff
+ "link_reputation": "Cómo funciona la reputación"
```

**`ca.json`** (en `landing.footer`):
```diff
+ "link_reputation": "Com funciona la reputació"
```

**`en.json`** (en `landing.footer`):
```diff
+ "link_reputation": "How reputation works"
```

---

## 5. Handoff de Implementación

**Scope:** Minor — implementación directa por Developer agent

### Orden de implementación sugerido

1. `public/i18n/*.json` — añadir clave (sin riesgo, independiente)
2. `reputation-guide.component.ts/.html` — añadir `publicMode` input y nav bifurcada
3. `app.routes.ts` — nueva ruta
4. `app.routes.server.ts` — prerender
5. `seo.constants.ts` — añadir path
6. `public/robots.txt` — `Allow`
7. `src/server.ts` — sitemap refactorizado
8. `landing.component.html` — link footer

### Criterios de aceptación

- [ ] `GET /como-funciona/reputacion` renderiza el contenido de reputación con nav de landing (logo → `/`, selector idioma, login/register)
- [ ] `GET /reputacion` no sufre regresión — sigue mostrando nav app con links autenticados
- [ ] La nueva ruta renderiza HTML prerenderizado (no pantalla en blanco con JS desactivado)
- [ ] `curl https://regalalo.org/sitemap.xml` incluye `<loc>https://regalalo.org/como-funciona/reputacion</loc>`
- [ ] `robots.txt` permite crawl de `/como-funciona/reputacion`
- [ ] Footer de la landing incluye link a `/como-funciona/reputacion` en los 3 idiomas
- [ ] No hay regresión AXE en navegación pública ni en la landing
- [ ] Verificar si `withComponentInputBinding()` está activo; ajustar binding de `publicMode` según resultado

---

## 6. Registro de aprobación y handoff

| Campo | Valor |
|---|---|
| Aprobación | 2026-06-01 — Emanuel |
| Clasificación | **Minor** |
| Destino | Developer agent (`bmad-quick-dev` o `bmad-dev-story`) |
| Story de seguimiento | `_bmad-output/implementation-artifacts/cc-2026-06-01-reputacion-publica.md` |
| Sprint status | `cc-2026-06-01-reputacion-publica: ready-for-dev` |

**Coordinación:** Al implementar `sprint-change-proposal-2026-06-01-seo-geo.md` (épica 11-f), reutilizar el mismo array `sitemapEntries` en `server.ts` para no pisar esta URL.
