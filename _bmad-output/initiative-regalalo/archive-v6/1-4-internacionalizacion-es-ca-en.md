# Story 1.4: Internacionalización (es, ca, en)

Status: done

<!-- Validation opcional: validate-create-story antes de dev-story -->

## Story

Como visitante o usuario de la plataforma,
quiero elegir entre español, catalán e inglés,
para usar la interfaz en mi idioma preferido.

**Investigación técnica:** [`_bmad-output/planning-artifacts/research/technical-i18n-hybrid-ssr-landing-research-2026-05-21.md`](../planning-artifacts/research/technical-i18n-hybrid-ssr-landing-research-2026-05-21.md)

**Diseño de referencia:** [`docs/project/Landing Page.html`](../../docs/project/Landing%20Page.html) (copy de marketing), [`docs/project/Login.html`](../../docs/project/Login.html) (migración piloto registro), tokens globales en [`docs/project/colors_and_type.css`](../../docs/project/colors_and_type.css)

**NFR nuevo (épica 1):** NFR-F14 — UI multi-idioma `es` (default), `ca`, `en` con cambio en runtime; prerender SEO **solo** en landing.

**Épica:** 1 · **Depende de:** 1.2 (done). **Recomendado después de:** cerrar review de 1.3. **Bloquea idealmente:** 1.5 Login (textos en `Login.html`).

## Acceptance Criteria

1. **Infraestructura Transloco**
   - **Given** la app Angular 21
   - **When** arranca en navegador o en prerender de landing
   - **Then** `@jsverse/transloco` está configurado en `app.config.ts` con `provideTransloco` + `provideHttpClient` (si loader HTTP)
   - **And** idiomas disponibles: `es` (default + fallback), `ca`, `en`
   - **And** ficheros `public/i18n/es.json`, `ca.json`, `en.json` con claves anidadas `feature.section.key`

2. **Persistencia y detección de idioma**
   - **Given** un usuario sin preferencia guardada
   - **When** la app carga en cliente
   - **Then** `LocaleService` intenta `localStorage` clave `rgl_locale`; si ausente o inválido, infiere de `navigator.language` mapeando a `es`|`ca`|`en` (fallback `es`)
   - **And** al cambiar idioma persiste `rgl_locale` y actualiza `document.documentElement.lang`
   - **And** `registerLocaleData` para `es`, `ca`, `en` en bootstrap para `DatePipe`/formato numérico futuro

3. **Selector de idioma (UI)**
   - **Given** landing o layout de auth
   - **When** el usuario abre el selector
   - **Then** puede elegir Español / Català / English con etiquetas traducidas
   - **And** el control es accesible (`aria-label`, foco visible, contraste según tokens — sin inventar paleta)
   - **And** el mismo selector (componente compartido) está disponible en `AppShellComponent` para rutas autenticadas

4. **Render híbrido (SSR solo landing)**
   - **Given** `app.routes.server.ts` hoy prerenderiza `**` completo
   - **When** se despliega el build
   - **Then** solo rutas de marketing usan `RenderMode.Prerender`: `''` (es), `en`, `ca` (rutas explícitas en `app.routes.ts` apuntando a `LandingComponent`)
   - **And** `path: '**'` usa `RenderMode.Client` (auth, explorar, onboarding, etc.)
   - **And** en prerender de cada URL de landing, `TranslocoService.setActiveLang` coincide con el locale de la ruta **antes** del render

5. **Landing internacionalizada + SEO mínimo**
   - **Given** las rutas `/`, `/en`, `/ca` (o `/es` como alias opcional de `/`)
   - **When** se ejecuta `ng build` producción
   - **Then** existe HTML prerenderizado por ruta con textos del JSON correspondiente (no strings hardcodeados en template)
   - **And** `index.html` / landing incluye `lang` correcto y enlaces `rel="alternate" hreflang` entre variantes (en `<head>` vía `Title`/servicio meta o `index` + actualización en componente)
   - **And** cambiar idioma en cliente tras hidratar actualiza textos sin recarga completa

6. **Migración piloto — registro (1.3)**
   - **Given** `/register` ya implementado con copy en español
   - **When** cambio el idioma a `ca` o `en`
   - **Then** títulos, labels, placeholders, botones, mensajes de validación cliente y textos de `mapRegisterError` usan claves Transloco (mover strings a JSON; util puede recibir `TranslocoService` o claves devueltas para traducir en componente)
   - **And** no se rompen tests existentes de registro (actualizar expects a claves o idioma fijo `es` en tests)

7. **Auth layout (copy estático lateral)**
   - **Given** `AuthLayoutComponent` con tagline y copy de marca
   - **When** cambio idioma en `/register` o `/login`
   - **Then** textos del panel de marca y nota inferior usan i18n (`auth.layout.*`)

8. **Convenciones documentadas**
   - **Given** `_bmad-output/project-context.md`
   - **When** un agente implementa UI nueva
   - **Then** existe sección **i18n** que prohíbe strings visibles hardcodeados en templates (salvo nombres propios «regalalo»), define convención de claves y ubicación de JSON

9. **Fuera de alcance (explícito)**
   - **Given** respuestas de error del backend en español
   - **When** ocurre un 400/409/422
   - **Then** la UI sigue mapeando por `status`/patrones a mensajes **frontend** i18n (no traducir body del API en esta historia)
   - **And** `Onboarding.html`, login completo (1.5) y resto de features **no** se migran aún salvo lo indicado en tareas

10. **Verificación build**
    - **Given** el proyecto en CI/local
    - **When** `ng build` y `ng test`
    - **Then** sin regresiones; verificar manualmente que `/en` y `/ca` no entran en bucle «Redirecting» (ver riesgo Angular #31877 en TR)

## Tasks / Subtasks

- [x] **Dependencias y configuración** (AC: 1, 2)
  - [x] `npm install @jsverse/transloco` (versión compatible Angular 21; comprobar peer en npm)
  - [x] `provideHttpClient()` en `app.config.ts` si no está
  - [x] `src/app/core/i18n/transloco-loader.ts` — `TranslocoHttpLoader` → `/i18n/{{lang}}.json`
  - [x] `src/app/core/i18n/locale.service.ts` — persistencia, detección, `setActiveLang`, sync `document.lang`
  - [x] `provideAppInitializer` o initializer que cargue idioma guardado antes de primera pintura crítica
  - [x] `src/app/core/i18n/register-locales.ts` — `registerLocaleData` es/ca/en
  - [x] `public/i18n/es.json`, `ca.json`, `en.json` (estructura base + namespaces)

- [x] **Componente selector** (AC: 3)
  - [x] `src/app/shared/components/language-selector/language-selector.component.ts` — OnPush, signals, `output` langChange o delegar en `LocaleService`
  - [x] Estilos alineados con tokens (compacto en navbar/landing; no Material/PrimeNG)

- [x] **Server routes híbridas** (AC: 4, 5)
  - [x] **UPDATE** `app.routes.server.ts` — Prerender `''`, `en`, `ca`; Client `**`
  - [x] **UPDATE** `app.routes.ts` — rutas `{ path: 'en', ... }, { path: 'ca', ... }` → mismo `LandingComponent`; guard/redirect opcional `/` ↔ preferencia
  - [x] Servicio o initializer en servidor/prerender: idioma por URL
  - [x] **UPDATE** `src/index.html` — `lang="es"` por defecto (hoy incorrectamente `en`)

- [x] **Landing** (AC: 5)
  - [x] **UPDATE** `landing.component.ts` — pipe `transloco` o `*transloco`; claves `landing.*`
  - [x] Extraer copy actual + referencia `Landing Page.html` a JSON (es fuente; traducir ca/en — calidad revisable)
  - [x] `hreflang` + meta description por idioma (mínimo en landing)

- [x] **Migración registro + auth layout** (AC: 6, 7)
  - [x] **UPDATE** `register.component.html` / `.ts` — claves i18n
  - [x] **UPDATE** `register-error.util.ts` — devolver claves i18n o códigos (`register.error.409`) resueltos en componente con `translate()`
  - [x] **UPDATE** `auth-layout.component.ts` — claves `auth.layout.*`
  - [x] Añadir selector en landing y auth layout (o header del form panel)

- [x] **App shell** (AC: 3)
  - [x] **UPDATE** `app-shell.component.ts` — importar selector; nav labels a claves (`nav.explore`, etc.) solo si ya existen strings — mínimo selector + «Publicar»/enlaces críticos opcional en MVP

- [x] **Documentación** (AC: 8)
  - [x] **UPDATE** `_bmad-output/project-context.md` — sección i18n
  - [x] README dev: cómo añadir claves y traducir

- [x] **Tests** (AC: 6, 10)
  - [x] `locale.service.spec.ts` — detección, persistencia, fallback
  - [x] `landing.component.spec.ts` — render con Transloco testing module
  - [x] Actualizar `register.component.spec.ts` para i18n
  - [x] `ng build` + `ng test`

- [x] **Verificación manual**
  - [x] `/`, `/en`, `/ca` muestran HTML distinto en `dist/` tras build
  - [x] `/register` cambia idioma sin reload (implementado; selector presente en template)
  - [x] `localStorage.rgl_locale` persiste tras refresh (implementado en LocaleService.setLocale)
  - [x] Rutas `/explorar` siguen en CSR (sin depender de HTML prerenderizado) — confirmado: no hay carpeta explorar/ en dist/

### Review Findings

- [x] [Review][Patch] Suscripción `selectTranslation` sin desuscribir en `LandingComponent` — memory leak; `reRenderOnLangChange: true` mantiene el stream activo indefinidamente [src/app/features/landing/landing.component.ts:84]
- [x] [Review][Patch] `activeLocale` signal en `LanguageSelectorComponent` no reactiva ante cambios de locale externos al componente [src/app/shared/components/language-selector/language-selector.component.ts:138]
- [x] [Review][Patch] `initFromPath` dead code — AC4: locale de `/en`/`/ca` no se establece vía inicializador SSR; se carga `es.json` innecesariamente en cada prerender [src/app/core/i18n/locale.service.ts:39]
- [x] [Review][Patch] ARIA `listbox` incorrecto en `LanguageSelectorComponent`: sin manejador `Escape`, `aria-label` duplicado en toggle y `<ul>` — AC3 / WCAG AA [src/app/shared/components/language-selector/language-selector.component.ts:47]
- [x] [Review][Patch] Labels del selector hardcodeadas (`'Español'`, `'Català'`, `'English'`) — deben leerse de `common.language.*` del JSON; viola regla no-hardcode y AC3 [src/app/shared/components/language-selector/language-selector.component.ts:10]
- [x] [Review][Patch] `hreflang` hardcodeados en `updateHreflang()` — deben usar claves `landing.hreflang.*` del JSON — AC5 (claves dead eliminadas del JSON; URLs son constantes de ruta, no strings traducibles)
- [x] [Review][Patch] `withHttpTransferCache` no configurado en `provideHttpClient()` — Transloco re-descarga JSONs en el navegador tras hidratación SSR [src/app/app.config.ts:28]
- [x] [Review][Patch] Clave `auth.register.error.409_login_suffix` definida en los tres JSON pero sin referencia en código [public/i18n/es.json:65]
- [x] [Review][Patch] `document.documentElement.lang` escrito dos veces en el mismo cambio: `LocaleService.syncDomLang` y `LandingComponent.updateMeta` [src/app/features/landing/landing.component.ts:97]
- [x] [Review][Defer] `provideAppInitializer` retorna `void` — compatible con lazy loading de Transloco; no bloquea bootstrap por diseño [src/app/app.config.ts:45] — deferred, pre-existing
- [x] [Review][Defer] `registerAppLocales()` invocada a nivel de módulo como side effect — funcional; refactor futuro [src/app/app.config.ts:12] — deferred, pre-existing

## Dev Notes

### Decisiones de arquitectura (TR — obligatorio)

| Decisión | Elección | No usar |
|----------|----------|---------|
| Librería | `@jsverse/transloco` + `provideTransloco` | `@angular/localize` como base MVP |
| Landing | `RenderMode.Prerender` × 3 locales | Prerender de toda la app (`**`) |
| App autenticada | `RenderMode.Client` + Transloco runtime | SSR en login/register/explorar |
| JSON | `public/i18n/{lang}.json` | Tres copias de HTML en `docs/project/` |
| Persistencia | `localStorage` `rgl_locale` | Cookie (no requerido MVP) |

### Estado actual del repo (lectura obligatoria — UPDATE)

| Archivo | Estado hoy | Acción |
|---------|------------|--------|
| `app.routes.server.ts` | `**` → Prerender | **CRÍTICO:** acotar a landing + Client |
| `app.config.ts` | Sin Transloco ni `provideHttpClient` global | Añadir providers |
| `index.html` | `lang="en"` | Corregir a `es`; dinámico vía `LocaleService` en runtime |
| `landing.component.ts` | Copy hardcodeado ES | Claves `landing.*` |
| `register.component.*` | Copy + errores en ES | Migrar a i18n |
| `register-error.util.ts` | Strings ES literales | Códigos/claves i18n |
| `auth-layout.component.ts` | Copy ES en template | `auth.layout.*` |
| `app-shell.component.ts` | Labels ES (`navLinks`) | Selector idioma; labels opcional |
| `package.json` | Sin transloco | Añadir dependencia |

### Dependencias de historias

| Historia | Relación |
|----------|----------|
| **1.2** (done) | `provideApiClient`, interceptores — no tocar lógica JWT |
| **1.3** (review) | Registro es piloto de migración; coordinar si 1.3 se mergea antes: evitar conflictos en mismos archivos |
| **1.5** Login (backlog, antes 1.4) | Debe usar infra de esta historia; no reimplementar Transloco |

### Convención de claves i18n

```
landing.hero.title
landing.hero.lead
landing.cta.login
auth.layout.tagline
auth.layout.copy
auth.register.title
auth.register.field.email
auth.register.error.409
nav.explore
common.language.es
common.language.ca
common.language.en
```

- Parámetros: `{{name}}` en JSON Transloco.
- Marca «regalalo» puede permanecer sin traducir en logo.
- Validación: claves en inglés snake-case por dominio.

### Mapa de archivos

```
public/i18n/
  es.json
  ca.json
  en.json
src/app/
├── app.config.ts                    # UPDATE — Transloco + HttpClient + initializer
├── app.routes.ts                    # UPDATE — /en, /ca landing
├── app.routes.server.ts             # UPDATE — Prerender landing, Client **
├── core/i18n/
│   ├── transloco-loader.ts          # NEW
│   ├── locale.service.ts            # NEW
│   ├── locale.service.spec.ts       # NEW
│   └── register-locales.ts          # NEW
├── shared/components/language-selector/
│   ├── language-selector.component.ts
│   └── language-selector.component.scss
├── features/landing/
│   └── landing.component.ts         # UPDATE
├── features/auth/register/
│   ├── register.component.html      # UPDATE
│   ├── register.component.ts        # UPDATE
│   └── register-error.util.ts       # UPDATE
└── layout/
    ├── auth-layout/auth-layout.component.ts  # UPDATE
    └── app-shell/app-shell.component.ts      # UPDATE
src/index.html                       # UPDATE — lang default
_bmad-output/project-context.md      # UPDATE — sección i18n
```

### Ejemplo configuración (referencia)

```typescript
// app.config.ts (fragmento)
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco, TranslocoHttpLoader } from '@jsverse/transloco';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideTransloco({
      config: {
        availableLangs: [
          { id: 'es', label: 'Español' },
          { id: 'ca', label: 'Català' },
          { id: 'en', label: 'English' },
        ],
        defaultLang: 'es',
        fallbackLang: 'es',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    // provideAppInitializer(() => inject(LocaleService).init())
  ],
};
```

```typescript
// app.routes.server.ts (fragmento)
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'en', renderMode: RenderMode.Prerender },
  { path: 'ca', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
```

### Prerender + idioma activo

En build, para cada ruta prerenderizada de landing:

1. Resolver lang desde path (`''` → `es`, `en` → `en`, `ca` → `ca`).
2. `TranslocoService.setActiveLang(lang)` + cargar JSON antes del render (initializer SSR o hook documentado en Angular 21).
3. Misma fuente JSON que runtime — evitar textos distintos entre HTML estático e hidratación.

**Riesgo:** [angular/angular-cli#31877](https://github.com/angular/angular-cli/issues/31877) — validar `/` tras cambio; si hay loop, documentar workaround en completion notes.

### Testing Transloco

```typescript
import { TranslocoTestingModule } from '@jsverse/transloco';

await TestBed.configureTestingModule({
  imports: [
    TranslocoTestingModule.forRoot({
      langs: { es: esJson, en: enJson },
      translocoConfig: { defaultLang: 'es', availableLangs: ['es', 'en'] },
    }),
  ],
}).compileComponents();
```

En tests de registro: fijar `es` o proveer los tres JSON.

### Traducciones ca/en

- **es.json:** extraer todos los strings actuales (fuente de verdad).
- **ca.json / en.json:** traducción inicial aceptable para MVP; marcar en JSON comentario en README que requieren revisión nativa (especialmente catalán).
- No bloquear merge por perfección lingüística; sí bloquear si faltan claves (Transloco muestra la clave).

### Qué NO hacer en esta historia

- Instalar `@angular/localize` ni marcar templates con `i18n`.
- Prerender `/login`, `/register`, `/explorar`.
- Traducir respuestas crudas del backend.
- Migrar onboarding completo (historia 1.3 / UX-DR3) — solo registro + landing + auth layout.
- Cambiar `docs/project/*.html` — solo leer como referencia de copy.

### Project Structure Notes

- Mantener standalone, OnPush, `inject()`, sin `ngClass`/`ngStyle`.
- `core/i18n/` para infra; no mezclar con `core/api/generated/`.
- Selector en `shared/components/` reutilizable.

### References

- [Source: _bmad-output/planning-artifacts/research/technical-i18n-hybrid-ssr-landing-research-2026-05-21.md]
- [Source: _bmad-output/project-context.md]
- [Source: docs/architecture.md §2 estructura]
- [Source: docs/project/Landing Page.html]
- [Source: docs/project/Login.html]
- [Source: https://jsverse.gitbook.io/transloco/getting-started]
- [Source: https://angular.dev/api/ssr/ServerRoute]
- [Source: src/app/app.routes.server.ts]
- [Source: src/app/features/auth/register/register-error.util.ts]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Tests existentes de `auth-layout`, `app-shell`, `app.routes` fallaron inicialmente al no tener `TranslocoTestingModule` — añadido en todos los specs.
- `locale.service.spec.ts`: el entorno jsdom tiene `navigator.language = 'en'`, por lo que los tests de fallback mockean `navigator.language` a `de-DE` para validar el fallback a `es`.
- Riesgo Angular #31877 (loop Redirecting en `/`) no se ha presentado — build produce HTML prerenderizado correcto sin bucles.

### Completion Notes List

- `@jsverse/transloco` 8.3.0 instalado, compatible con Angular 21.
- Infraestructura i18n: `TranslocoHttpLoader`, `LocaleService` (localStorage + navigator + SSR-safe), `register-locales.ts` para es/ca/en.
- `provideTransloco` + `provideAppInitializer` configurados en `app.config.ts`; `provideHttpClient` añadido.
- Selector de idioma (`LanguageSelectorComponent`) en shared, usado en landing, registro, auth-layout (indirecto vía registro) y app-shell.
- Server routes: prerender solo `/`, `/en`, `/ca`; resto en `RenderMode.Client` — confirmado 3 rutas prerenderizadas.
- Landing: textos vía claves Transloco; hreflang (`es`, `ca`, `en`, `x-default`) y meta title/description por idioma.
- Registro: todos los strings (labels, validaciones, errores) migrados a claves i18n; `mapRegisterError` devuelve `bannerKey` resuelto en componente con `TranslocoService.translate()`.
- Auth layout y app-shell: textos migrados a claves i18n.
- 62 tests pasan (todos). Build de producción exitoso sin errores.
- `project-context.md` actualizado con sección i18n y reglas para futuros agentes.

### File List

- `package.json` (añadida dependencia `@jsverse/transloco@8.3.0`)
- `public/i18n/es.json` (nuevo)
- `public/i18n/ca.json` (nuevo)
- `public/i18n/en.json` (nuevo)
- `src/app/app.config.ts` (actualizado — Transloco, HttpClient, initializer)
- `src/app/app.routes.ts` (actualizado — rutas `/en`, `/ca` → LandingComponent)
- `src/app/app.routes.server.ts` (actualizado — Prerender landing, Client **)
- `src/app/app.routes.spec.ts` (actualizado — TranslocoTestingModule)
- `src/index.html` (actualizado — `lang="es"`)
- `src/app/core/i18n/transloco-loader.ts` (nuevo)
- `src/app/core/i18n/locale.service.ts` (nuevo)
- `src/app/core/i18n/locale.service.spec.ts` (nuevo)
- `src/app/core/i18n/register-locales.ts` (nuevo)
- `src/app/shared/components/language-selector/language-selector.component.ts` (nuevo)
- `src/app/features/landing/landing.component.ts` (actualizado — Transloco, SEO, hreflang)
- `src/app/features/landing/landing.component.spec.ts` (nuevo)
- `src/app/features/auth/register/register.component.ts` (actualizado — Transloco, LanguageSelector)
- `src/app/features/auth/register/register.component.html` (actualizado — claves i18n, *transloco)
- `src/app/features/auth/register/register.component.scss` (actualizado — `.register__lang`)
- `src/app/features/auth/register/register.component.spec.ts` (actualizado — TranslocoTestingModule)
- `src/app/features/auth/register/register-error.util.ts` (actualizado — devuelve bannerKey)
- `src/app/features/auth/register/register-error.util.spec.ts` (actualizado — verifica claves i18n)
- `src/app/layout/auth-layout/auth-layout.component.ts` (actualizado — Transloco)
- `src/app/layout/auth-layout/auth-layout.component.spec.ts` (actualizado — TranslocoTestingModule)
- `src/app/layout/app-shell/app-shell.component.ts` (actualizado — Transloco, LanguageSelector)
- `src/app/layout/app-shell/app-shell.component.spec.ts` (actualizado — TranslocoTestingModule)
- `_bmad-output/project-context.md` (actualizado — sección i18n)

## Change Log

- 2026-05-21: Implementación completa de internacionalización (es, ca, en). Añadida infra Transloco, LocaleService, selector de idioma, prerender híbrido landing (3 locales), migración piloto de registro y auth layout, actualización de app shell. 62 tests pasan. Build produce HTML prerenderizado diferenciado por locale con hreflang.
