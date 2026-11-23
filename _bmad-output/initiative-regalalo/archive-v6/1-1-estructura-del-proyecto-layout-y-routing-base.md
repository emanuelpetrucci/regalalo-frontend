# Story 1.1: Estructura del proyecto, design system, layout y routing base

Status: done

<!-- Validation opcional: validate-create-story antes de dev-story -->

## Story

Como desarrollador,
quiero la estructura de carpetas, tokens de diseño portados, layout shell y rutas lazy-loaded según arquitectura y prototipos,
para que las features implementen UI ya maquetada sin rediseñar desde cero.

## Acceptance Criteria

1. **Estructura de carpetas (AC §2 arquitectura)**
   - **Given** el scaffold Angular CLI existente y el handoff en `docs/project/`
   - **When** se organiza el proyecto
   - **Then** existen `src/app/core/`, `features/`, `shared/`, `layout/`, `src/environments/`
   - **And** `environment.ts` y `environment.development.ts` exponen `apiUrl` y `recaptchaSiteKey`

2. **Design system global (AC tokens)**
   - **Given** `docs/project/colors_and_type.css`
   - **When** se configura el tema global
   - **Then** cada token CSS usado en la app coincide con los valores del fichero (hex, fuentes, sombras, radios — sin sustituciones)
   - **And** no se importa ninguna otra hoja de estilos de tema alternativo (Material, PrimeNG, Bootstrap, etc.)

3. **Layouts y navegación (AC prototipos)**
   - **Given** `Login.html` y `Perfil.html` leídos en su totalidad
   - **When** se implementa layout shell y navegación
   - **Then** estructura, jerarquía visual y estilos coinciden con los prototipos (no layout genérico ni UI kit)
   - **And** las rutas de features usan lazy loading (`loadComponent` o `loadChildren`)

4. **Verificación de diseño**
   - **Given** revisión de la historia
   - **When** se valida cumplimiento de diseño
   - **Then** un revisor puede contrastar pantalla Angular vs HTML de `docs/project/` sin desviaciones no acordadas

5. **Rutas públicas auth**
   - **Given** rutas públicas `/login`, `/register`, `/forgot-password`, `/reset-password`
   - **When** un usuario no autenticado las visita
   - **Then** cargan sin `AuthGuard` y usan **AuthLayout** (split de `Login.html`)

6. **Rutas protegidas**
   - **Given** rutas protegidas (feed, items, delivery, profile)
   - **When** se definen en `app.routes.ts`
   - **Then** están marcadas con `canActivate: [authGuard]` (lógica completa en historia 1.2)

## Tasks / Subtasks

- [x] **Estructura y entornos** (AC: 1)
  - [x] Crear árbol de carpetas según §2 de `docs/architecture.md`
  - [x] Añadir `src/environments/environment.ts` y `environment.development.ts` con `apiUrl`, `recaptchaSiteKey`
  - [x] Configurar `fileReplacements` en `angular.json` (development → `environment.development.ts`)
  - [x] Valores dev sugeridos: `apiUrl: 'http://localhost:3000/api'` (ajustar al puerto real del backend Nest), `recaptchaSiteKey: ''` (placeholder hasta 1.3/1.4)

- [x] **Tema global** (AC: 2)
  - [x] Copiar/portar `:root` de `docs/project/colors_and_type.css` a `src/styles.scss` (o `src/styles/_tokens.scss` importado desde `styles.scss`)
  - [x] Importar Google Fonts exactas: Playfair Display, DM Sans, JetBrains Mono
  - [x] Reset global: `box-sizing: border-box`, `body` con `--bg-page` y `--font-body`, `-webkit-font-smoothing: antialiased`
  - [x] Eliminar por completo estilos y markup del placeholder Angular CLI en `app.html` / `app.scss`

- [x] **Layouts** (AC: 3, 4)
  - [x] `AuthLayoutComponent` — grid 44%/56%, `BrandPanel` + área de formulario según `Login.html` (layout `dividida` por defecto; breakpoint 780px oculta columna marca)
  - [x] `AppShellComponent` — navbar sticky 64px según `Perfil.html` (logo Playfair, links Explorar/Mis objetos/Entregas/Perfil, CTA Publicar, avatar iniciales)
  - [x] Extraer átomos reutilizables a `shared/components/` solo si aparecen en prototipos: `Btn`, `FieldInput`, `AlertBox`, `Badge`, iconos SVG inline (mismos trazos que `Ico` en HTML)

- [x] **Routing lazy** (AC: 3, 5, 6)
  - [x] Definir rutas en `app.routes.ts` (ver tabla abajo)
  - [x] Placeholders mínimos por feature (`*.routes.ts` + componente vacío con título) — sin lógica de negocio
  - [x] Crear `authGuard` funcional en `core/guards/auth.guard.ts` que **por ahora** retorne `true` (historia 1.2 añade JWT/exp/`returnUrl`)
  - [x] Redirección por defecto: `/` → `/login` (o `/explorar` cuando exista sesión — opcional stub; 1.2 lo refina)

- [x] **Limpieza scaffold** (AC: 4)
  - [x] `App` root: solo `<router-outlet />`, sin template de bienvenida Angular
  - [x] Verificar build: `ng build` y `ng serve` sin errores

- [x] **Verificación manual diseño** (AC: 4)
  - [x] Side-by-side: AuthLayout vs `Login.html` (split + card formulario)
  - [x] Side-by-side: AppShell vs navbar de `Perfil.html`
  - [x] Consultar `wireframes.html` solo para mapa de flujos/rutas — **no** copiar estética Space Mono

### Review Findings

<!-- Code review 2026-05-21 — 3 capas: Blind Hunter, Edge Case Hunter, Acceptance Auditor -->

#### Decision needed

- [x] [Review][Decision] **Ruta inicial y wildcard** — **Resuelto (2026-05-21):** `/` → **landing pública** (placeholder + `Landing Page.html` en épica posterior); `**` → **404**, no redirect a login.
- [x] [Review][Decision] **Dos padres `path: ''` en `app.routes.ts`** — **Resuelto (2026-05-21):** **Refactorizar ahora (opción B)** — layouts explícitos sin hermanos `path: ''` duplicados.

#### Patch

- [x] [Review][Patch] **Landing pública en `/`** — Placeholder lazy + redirect `''` → landing; sin `AuthLayout` en raíz.
- [x] [Review][Patch] **Ruta 404 para `**`** — Componente mínimo accesible; eliminar `redirectTo: 'login'` en wildcard.
- [x] [Review][Patch] **Refactor `app.routes.ts`** — Separar árbol auth (rutas absolutas `/login`, etc.) vs shell protegido; tests con layout activo.
- [x] [Review][Patch] **Color enlace activo navbar** [`app-shell.component.scss:54`] — Usar `var(--color-primary-500)` (#3A7358), no `--color-primary-700`; AC 3/4 vs `Perfil.html`.
- [x] [Review][Patch] **`inputId` inestable (SSR)** [`field-input.component.ts:37`] — Sustituir `Math.random()` por id estable (`input()` requerido desde padre o contador estático).
- [x] [Review][Patch] **`<button>` dentro de `<a>` en CTA Publicar** [`app-shell.component.ts:33-50`] — HTML inválido / WCAG; usar `routerLink` en estilo botón o `app-btn` como enlace.
- [x] [Review][Patch] **`AlertBox` clase dinámica** [`alert-box.component.ts:7`] — `[class]` string puede pisar `alert-box`; usar `[class.alert-box--error]` / `[class.alert-box--warning]`.
- [x] [Review][Patch] **Hex sueltos en `AlertBox`** [`alert-box.component.scss`] — Bordes deben usar `var(--status-cancelled-border)` / `var(--status-reserved-border)` (AC 2).
- [x] [Review][Patch] **`routerLinkActive` sin `exact`** [`app-shell.component.ts:24`] — Añadir `[routerLinkActiveOptions]="{ exact: true }"` para `/mis-objetos/publicar`.
- [x] [Review][Patch] **Avatar no navegable** [`app-shell.component.ts:52-54`] — `div` con `aria-label` pero sin foco/enlace; enlazar a `/perfil`.
- [x] [Review][Patch] **Doble `h1` en auth** [`auth-layout.component.ts:13` + hijos] — Marca en layout debería ser `p`/`h2`; reservar `h1` al título de cada pantalla auth.
- [x] [Review][Patch] **`FieldInput` sin toggle password** [`field-input.component.ts`] — Paridad con `Login.html` (ojo + padding); AC 3 átomos.
- [x] [Review][Patch] **Tests de rutas superficiales** [`app.routes.spec.ts`] — Añadir aserciones de layout/componente activo, no solo `router.url`.
- [x] [Review][Patch] **A11y campo con error** [`field-input.component.ts`] — `aria-invalid` + `aria-describedby` al mensaje de error.

#### Defer

- [x] [Review][Defer] **`authGuard` siempre `true`** [`auth.guard.ts:4`] — deferred, explícito en AC 6 / historia 1.2
- [x] [Review][Defer] **`/reset-password` sin token** [`auth.routes.ts:21`] — deferred, historia 1.5
- [x] [Review][Defer] **Fallo carga lazy sin UI de error** [`app.routes.ts:30-45`] — deferred, sin requisito en 1.1
- [x] [Review][Defer] **SSR + guard futuro** [`auth.guard.ts`] — deferred, historia 1.2
- [x] [Review][Defer] **Rutas auth con sesión activa** — deferred, historia 1.2/1.4
- [x] [Review][Defer] **`/` → `/login` sin sesión** — superseded por decisión review: `/` → landing; login solo en rutas auth explícitas
- [x] [Review][Defer] **`apiUrl` producción `api.example.com`** [`environment.ts`] — deferred, placeholder hasta despliegue real

## Dev Notes

### Estado actual del repo (brownfield)

| Área | Estado hoy | Acción requerida |
|------|------------|------------------|
| `app.routes.ts` | `routes: []` vacío | Definir árbol completo |
| `styles.scss` | Comentario placeholder | Portar tokens completos |
| `app.html` | Template demo Angular (gradientes Inter) | **Eliminar** — viola UX-DR1 |
| Carpetas `core/`, `features/`, `layout/`, `shared/` | No existen | Crear |
| `environments/` | No existe | Crear + wire en `angular.json` |
| Angular | 21.2.x, standalone, SSR habilitado | Mantener; no desactivar SSR sin motivo |
| Dependencias UI | Ninguna Material/Prime | **Prohibido** añadir |

Commits recientes: `79305bf feat: add context`, `3ead3f7 feat: initial commit` — solo scaffold CLI; no hay patrones previos que respetar más allá de `project-context.md`.

### Mapa de rutas objetivo

| Ruta | Layout | Guard | Lazy feature | Prototipo futuro |
|------|--------|-------|--------------|------------------|
| `/login` | auth | — | `features/auth` | `Login.html` (1.4) |
| `/register` | auth | — | `features/auth` | `Login.html` (1.3) |
| `/forgot-password` | auth | — | `features/auth` | `Login.html` (1.5) |
| `/reset-password` | auth | — | `features/auth` | `Login.html` (1.5) |
| `/explorar` | shell | authGuard | `features/items` | `Explorar v3.html` |
| `/mis-objetos` | shell | authGuard | `features/items` | `Mis objetos.html` |
| `/mis-objetos/publicar` | shell | authGuard | `features/items` | `Mis objetos.html` |
| `/entregas` | shell | authGuard | `features/delivery` | `Entregas.html` |
| `/perfil` | shell | authGuard | `features/profile` | `Perfil.html` |

Nombres de ruta en español alineados con navbar del prototipo (`Perfil.html` líneas 160–165). Ajustar solo si el equipo acuerda paths en inglés — mantener consistencia en todo el router.

### Estructura de archivos a crear

```
src/
├── environments/
│   ├── environment.ts
│   └── environment.development.ts
├── styles.scss                    # import tokens + fonts
├── app/
│   ├── app.ts                     # router-outlet only
│   ├── app.routes.ts
│   ├── core/
│   │   └── guards/
│   │       └── auth.guard.ts      # stub → true (1.2 implementa)
│   ├── layout/
│   │   ├── auth-layout/
│   │   │   ├── auth-layout.component.ts
│   │   │   └── auth-layout.component.scss
│   │   └── app-shell/
│   │       ├── app-shell.component.ts
│   │       └── app-shell.component.scss
│   ├── shared/
│   │   └── components/            # Btn, FieldInput, etc. según prototipo
│   └── features/
│       ├── auth/auth.routes.ts + placeholder components
│       ├── items/items.routes.ts
│       ├── delivery/delivery.routes.ts
│       └── profile/profile.routes.ts
```

### AuthLayout — especificación desde `Login.html`

- **Grid:** `display: grid; grid-template-columns: 44% 56%; min-height: 100vh` (clase `split-grid`)
- **Breakpoint:** `@media (max-width: 780px)` → una columna, `.brand-col { display: none }`
- **BrandPanel:** fondo `--color-primary-500` (tema `verde` por defecto), watermark "nlv", título Playfair 44px "regalalo", tagline itálica, footer "España · MVP 2025"
- **FormPanel:** fondo `--bg-page`, card `--bg-surface`, border-radius 12px, `--shadow-2`, max-width 400px
- **NO** portar React, Babel, `tweaks-panel.jsx` ni scripts UMD del prototipo

### AppShell — especificación desde `Perfil.html`

- **Navbar:** height 64px (`--nav-height`), sticky top, `--bg-surface`, border-bottom `--border-default`, `--shadow-1`
- **Logo:** Playfair 20px weight 700, color `--brand-primary`
- **Nav links:** Explorar, Mis objetos, Entregas, Perfil — padding 8px 14px, radius 8px, estado activo `--bg-primary-light` + `--color-primary-700`
- **CTA Publicar:** botón primary 13px, icono plus SVG
- **Avatar:** círculo 34px, iniciales mock "MG" hasta historia 5.1
- **Responsive:** `@media (max-width: 640px)` ocultar `.nav-links` y `.pub-label` (clases del prototipo)

### wireframes.html

- Uso: inventario de flujos y pantallas del MVP (complemento IA)
- **No** usar colores/tipografía Space Mono del wireframe para UI producto
- Estética producto = exclusivamente `colors_and_type.css` + HTML de feature

### Guard stub (historia 1.2)

```typescript
// core/guards/auth.guard.ts — STUB 1.1
export const authGuard: CanActivateFn = () => true;
```

En 1.2: inyectar `AuthService`, verificar JWT en `localStorage`, expiración por claim `exp`, redirect `/login?returnUrl=...`.

### SSR / hidratación

El proyecto incluye `@angular/ssr` y `provideClientHydration`. Los layouts no deben usar APIs de browser en constructores. Guards con `localStorage` se implementan en 1.2 con `inject(PLATFORM_ID)` o ejecución solo en browser.

### Anti-patrones — NO HACER

- Dejar template Angular por defecto (Inter, gradientes violeta/rojo)
- Inventar colores o usar Tailwind/Material en lugar de tokens CSS
- Implementar login/registro funcional (historias 1.3–1.5)
- Implementar `SessionService` + interceptores JWT (historia 1.2); cliente OpenAPI ya en `provideApiClient()` — ver `docs/api-client.md`
- Lógica real en `authGuard` (historia 1.2)
- Copiar estructura interna React del prototipo

### Project Structure Notes

- Alineado con `docs/architecture.md` §2
- Prefijo componentes: `app` (angular.json)
- Componentes: `standalone: true`, `ChangeDetectionStrategy.OnPush`, signals para estado local
- Control flow: `@if`, `@for` — sin `*ngIf`/`*ngFor`
- Sin `ngClass` / `ngStyle` — usar `[class.x]` / `[style.prop]` o clases en SCSS

### Referencias

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 1, Story 1.1, tabla diseño]
- [Source: `_bmad-output/project-context.md` — requisito bloqueante diseño]
- [Source: `docs/README.md` — flujo handoff]
- [Source: `docs/architecture.md` — §1 Stack, §2 Carpetas, §6 Reglas]
- [Source: `docs/project/colors_and_type.css` — tokens]
- [Source: `docs/project/Login.html` — AuthLayout]
- [Source: `docs/project/Perfil.html` — AppShell / Navbar]
- [Source: `docs/project/wireframes.html` — mapa flujos]

## Dev Agent Record

### Agent Model Used

Composer (dev-story)

### Debug Log References

- Build falló inicialmente por proyección SVG (`path`/`line`) vía `ng-content` en IconComponent — resuelto con SVG inline en plantillas.

### Completion Notes List

- Estructura `core/`, `features/`, `shared/`, `layout/`, `environments/` creada según arquitectura.
- Tokens CSS portados 1:1 desde `docs/project/colors_and_type.css` → `src/styles/_tokens.scss`.
- `AuthLayoutComponent` (split 44/56, brand panel verde, card formulario) y `AppShellComponent` (navbar 64px sticky) implementados según prototipos.
- Rutas lazy para auth, items, delivery y profile; `authGuard` stub retorna `true`.
- Átomos compartidos: Btn, FieldInput, AlertBox, Badge, Icon (wrapper base).
- `ng build` (production + SSR prerender 10 rutas) y `ng test` (8 tests) pasan sin errores.

### File List

- `angular.json` (modificado — fileReplacements development)
- `src/styles.scss` (modificado)
- `src/styles/_tokens.scss` (nuevo)
- `src/environments/environment.ts` (nuevo)
- `src/environments/environment.development.ts` (nuevo)
- `src/app/app.ts` (modificado)
- `src/app/app.html` (eliminado)
- `src/app/app.routes.ts` (modificado)
- `src/app/app.spec.ts` (modificado)
- `src/app/app.routes.spec.ts` (nuevo)
- `src/app/core/guards/auth.guard.ts` (nuevo)
- `src/app/core/guards/auth.guard.spec.ts` (nuevo)
- `src/app/layout/auth-layout/auth-layout.component.ts` (nuevo)
- `src/app/layout/auth-layout/auth-layout.component.scss` (nuevo)
- `src/app/layout/auth-layout/auth-layout.component.spec.ts` (nuevo)
- `src/app/layout/app-shell/app-shell.component.ts` (nuevo)
- `src/app/layout/app-shell/app-shell.component.scss` (nuevo)
- `src/app/layout/app-shell/app-shell.component.spec.ts` (nuevo)
- `src/app/shared/components/icon/icon.component.ts` (nuevo)
- `src/app/shared/components/btn/btn.component.ts` (nuevo)
- `src/app/shared/components/btn/btn.component.scss` (nuevo)
- `src/app/shared/components/field-input/field-input.component.ts` (nuevo)
- `src/app/shared/components/field-input/field-input.component.scss` (nuevo)
- `src/app/shared/components/alert-box/alert-box.component.ts` (nuevo)
- `src/app/shared/components/alert-box/alert-box.component.scss` (nuevo)
- `src/app/shared/components/badge/badge.component.ts` (nuevo)
- `src/app/shared/components/badge/badge.component.scss` (nuevo)
- `src/app/features/auth/auth.routes.ts` (nuevo)
- `src/app/features/auth/login/login.component.ts` (nuevo)
- `src/app/features/auth/register/register.component.ts` (nuevo)
- `src/app/features/auth/forgot-password/forgot-password.component.ts` (nuevo)
- `src/app/features/auth/reset-password/reset-password.component.ts` (nuevo)
- `src/app/features/items/items.routes.ts` (nuevo)
- `src/app/features/items/explorar/explorar.component.ts` (nuevo)
- `src/app/features/items/mis-objetos/mis-objetos.component.ts` (nuevo)
- `src/app/features/items/publicar/publicar.component.ts` (nuevo)
- `src/app/features/delivery/delivery.routes.ts` (nuevo)
- `src/app/features/delivery/entregas/entregas.component.ts` (nuevo)
- `src/app/features/profile/profile.routes.ts` (nuevo)
- `src/app/features/profile/perfil/perfil.component.ts` (nuevo)

## Change Log

- 2026-05-21: Historia 1.1 implementada — estructura, design tokens, layouts, routing lazy, guard stub, limpieza scaffold.

## Technical Requirements

| ID | Requisito |
|----|-----------|
| TR-1 | Angular 21 standalone, signals, OnPush en componentes nuevos |
| TR-2 | Lazy loading obligatorio para `features/*` (NFR-F11) |
| TR-3 | Tokens CSS 1:1 desde `colors_and_type.css` (NFR-F13, UX-DR1) |
| TR-4 | Tipografías permitidas: Playfair Display, DM Sans, JetBrains Mono únicamente |
| TR-5 | `environments`: `apiUrl`, `recaptchaSiteKey` (NFR-F9) |
| TR-6 | Rutas públicas auth sin guard; protegidas con `authGuard` referenciado |
| TR-7 | WCAG AA: focus visible con `--shadow-focus`, labels en átomos de formulario cuando se usen |

## Architecture Compliance

- Estructura §2: `core/`, `features/auth|items|delivery|profile`, `shared/`, `layout/`
- No crear aún `SessionService`, interceptores (1.2); modelos REST viven en `core/api/generated/`
- No modificar contratos API (NFR-F8)
- JWT/localStorage: no tocar hasta 1.2
- Hosting Vercel: build production sin errores (NFR-F10)

## Library & Framework Requirements

| Paquete | Versión actual | Notas |
|---------|----------------|-------|
| @angular/* | ^21.2.0 | Mantener; usar `application` builder |
| rxjs | ~7.8.0 | Solo si necesario en guards 1.2 |
| express | ^5.1.0 | SSR server — no modificar en esta historia |

**Prohibido instalar:** @angular/material, primeng, bootstrap, tailwind (salvo que el usuario apruebe — no aplica).

## File Structure Requirements

Archivos **UPDATE** (leer antes de editar):

| Archivo | Estado actual | Cambio |
|---------|---------------|--------|
| `src/app/app.routes.ts` | Rutas vacías | Árbol completo lazy + layouts |
| `src/app/app.ts` / `app.html` | Template demo | Solo router-outlet |
| `src/styles.scss` | Vacío | Tokens + reset global |
| `angular.json` | Sin fileReplacements | Añadir environments |

Archivos **NEW** (lista mínima): ver árbol en Dev Notes.

## Testing Requirements

- Ejecutar `ng build` (production) — debe pasar sin errores
- `ng test` — actualizar `app.spec.ts` si el test espera título "regalalo" del scaffold
- Test manual: navegar rutas públicas y protegidas; protegidas cargan con guard stub
- No exigir tests e2e en esta historia unless el proyecto ya los tiene

## Latest Tech Information

- **Angular 21:** `loadComponent` / `loadChildren` en rutas; functional guards `CanActivateFn`; control flow `@if`/`@for` estable
- **SSR:** `provideClientHydration(withEventReplay())` ya en `app.config.ts` — conservar
- **Environments:** configurar `fileReplacements` en `angular.json` bajo `configurations.development` apuntando a `environment.development.ts`
- **Google Fonts:** misma URL que `colors_and_type.css` línea 10 — no acortar familias

## Project Context Reference

Leer siempre antes de implementar UI:

- `_bmad-output/project-context.md` — diseño bloqueante, catálogo prototipos
- `docs/README.md` — orden de lectura handoff

## Story Completion Status

- **Status:** done
- **Nota:** Análisis de contexto completado — guía de implementación lista para `dev-story`
- **Historia:** 1.1 — primera del sprint; épica 1 pasa a `in-progress`
- **Siguiente:** `1-2-servicios-core-modelos-e-interceptores-http` tras completar esta
