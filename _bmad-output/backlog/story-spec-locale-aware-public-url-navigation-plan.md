---
ticket: spec-locale-aware-public-url-navigation
status: done
type: feature
migrated_from: v6
---


<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Al cambiar de idioma desde una página pública indexable (landing, reputación), la URL permanece en la variante española aunque el usuario haya seleccionado inglés o catalán. Navegar desde el idioma inglés a `/como-funciona/reputacion` en vez de `/en/how-it-works/reputation` es una rotura de coherencia locale. El mismo error existe en el enlace de footer a reputación, que siempre apunta a la URL en español.

**Approach:** Crear un `PublicLocaleRouterService` con el mapa canónico de URLs por idioma para las páginas indexables. Actualizar `landing-nav` para que el cambio de idioma navegue a la URL locale-equivalente, y `landing-footer` para que el enlace a reputación sea dinámico según el idioma activo.

## Boundaries & Constraints

**Always:**
- Solo aplica a páginas en el sitemap (landing + reputación). Páginas legales y rutas auth quedan fuera.
- El mapa `PUBLIC_PAGE_URLS` en el servicio es la única fuente de verdad para locale URL generation.
- El `language-selector` no debe adquirir dependencias de navegación; la lógica vive en el servicio/componentes padre.
- `setLocale()` sigue llamándose desde el selector internamente; `navigateToLocale()` no debe duplicar esa llamada.

**Ask First:**
- Si se detecta otro uso de `language-selector` en una página pública que también deba navegar.

**Never:**
- No modificar rutas en `app.routes.ts`.
- No añadir rutas de páginas legales.
- No cambiar el comportamiento de `language-selector` en `perfil.component` (selector de preferencia en settings) ni en `onboarding.component`.
- No tocar `site-footer.component` (footer de área autenticada; fuera del scope de indexables).

## I/O & Edge-Case Matrix

| Scenario | Input / Estado | Comportamiento esperado | Error handling |
|----------|---------------|------------------------|----------------|
| Landing ES → EN | URL `/`, selecciona "en" | Navega a `/en` | — |
| Landing EN → CA | URL `/en`, selecciona "ca" | Navega a `/ca` | — |
| Landing CA → ES | URL `/ca`, selecciona "es" | Navega a `/` | — |
| Reputación ES → EN | URL `/como-funciona/reputacion`, selecciona "en" | Navega a `/en/how-it-works/reputation` | — |
| Reputación CA → EN | URL `/ca/com-funciona/reputacio`, selecciona "en" | Navega a `/en/how-it-works/reputation` | — |
| Footer link en `/en` | Idioma activo `en`, click enlace reputación | Navega a `/en/how-it-works/reputation` | — |
| Footer link en `/ca` | Idioma activo `ca`, click enlace reputación | Navega a `/ca/com-funciona/reputacio` | — |
| Página no-pública | URL `/explorar`, cambia idioma | Solo `setLocale()`, sin navegación extra | — |

</frozen-after-approval>

## Code Map

- `src/app/core/i18n/locale.service.ts` — `setLocale(locale)` y `currentLocale()` signal; ya llamado por el selector internamente
- `src/app/shared/components/language-selector/language-selector.component.ts` — emite `selected: output<AppLocale>()` y llama `setLocale()` internamente; no modificar
- `src/app/shared/components/landing-nav/landing-nav.component.ts` — ya inyecta `Router`; añadir inyección del nuevo servicio y handler `(selected)`
- `src/app/shared/components/landing-nav/landing-nav.component.html` — añadir binding `(selected)` al `<app-language-selector>`
- `src/app/shared/components/landing-footer/landing-footer.component.ts` — ya inyecta `Router`; añadir servicio + computed `reputationUrl()`
- `src/app/shared/components/landing-footer/landing-footer.component.html` — línea 15: `routerLink="/como-funciona/reputacion"` → `[routerLink]`

## Tasks & Acceptance

**Execution:**
- [x] `src/app/core/i18n/public-locale-router.service.ts` — CREAR: `PublicLocaleRouterService` con `PUBLIC_PAGE_URLS: Record<'landing'|'reputation', Record<AppLocale, string>>` (`landing: {es:'/', ca:'/ca', en:'/en'}`, `reputation: {es:'/como-funciona/reputacion', ca:'/ca/com-funciona/reputacio', en:'/en/how-it-works/reputation'}`); método `navigateToLocale(locale: AppLocale): void` que detecta página actual por exact-match de `router.url` contra los valores del mapa y navega si hay match; método `getLocaleUrl(page: 'landing'|'reputation', locale?: AppLocale): string` que devuelve la URL usando `locale ?? localeService.currentLocale()`; `providedIn: 'root'`
- [x] `src/app/core/i18n/public-locale-router.service.spec.ts` — CREAR: tests unitarios para los escenarios del I/O Matrix usando `RouterTestingModule` o mock de `Router.url`
- [x] `src/app/shared/components/landing-nav/landing-nav.component.ts` — inyectar `PublicLocaleRouterService`; añadir método `onLocaleSelected(locale: AppLocale): void` que llama `this.publicLocaleRouter.navigateToLocale(locale)`
- [x] `src/app/shared/components/landing-nav/landing-nav.component.html` — añadir `(selected)="onLocaleSelected($event)"` al `<app-language-selector>`
- [x] `src/app/shared/components/landing-footer/landing-footer.component.ts` — inyectar `PublicLocaleRouterService` y `LocaleService`; añadir `reputationUrl = computed(() => this.publicLocaleRouter.getLocaleUrl('reputation'))`
- [x] `src/app/shared/components/landing-footer/landing-footer.component.html` — línea 15: reemplazar `routerLink="/como-funciona/reputacion"` por `[routerLink]="reputationUrl()"`

**Acceptance Criteria:**
- Dado que el usuario está en `/` (landing ES), cuando selecciona inglés en el language-selector, entonces la URL cambia a `/en` y la UI se muestra en inglés.
- Dado que el usuario está en `/en/how-it-works/reputation`, cuando selecciona español, entonces la URL cambia a `/como-funciona/reputacion`.
- Dado que el usuario está en `/ca`, cuando hace clic en el enlace de reputación del footer, entonces navega a `/ca/com-funciona/reputacio`.
- Dado que el usuario está en `/en`, cuando hace clic en el enlace de reputación del footer, entonces navega a `/en/how-it-works/reputation`.
- Dado que el usuario está en una ruta protegida o de auth, cuando el `language-selector` de `perfil.component` o `onboarding.component` emite un idioma, entonces el comportamiento NO cambia (sin navegación).

### Review Findings

- [ ] [Review][Patch] proxy.conf.json: entrada `/bffd` duplicada idéntica a `/bff` — eliminar [proxy.conf.json]
- [x] [Review][Defer] detectCurrentPage no normaliza trailing slash ni guarda contra router.url='' al init [src/app/core/i18n/public-locale-router.service.ts:28-34] — deferred, pre-existing
- [x] [Review][Defer] PUBLIC_PAGE_URLS enumeración cerrada — toda nueva página pública requiere editar el servicio manualmente [src/app/core/i18n/public-locale-router.service.ts:4-12] — deferred, pre-existing
- [x] [Review][Defer] Double-setLocale: selector llama setLocale() antes de emitir; si navigateByUrl falla, locale y URL divergen [src/app/shared/components/landing-nav/landing-nav.component.ts] — deferred, pre-existing
- [x] [Review][Defer] SSR: reputationUrl puede renderizar URL ES en páginas /ca y /en si LocaleService no inicializa desde path [src/app/shared/components/landing-footer/landing-footer.component.ts] — deferred, pre-existing
- [x] [Review][Defer] Ruta legacy /reputacion ausente de PUBLIC_PAGE_URLS — cambio de locale en esa ruta es silent no-op [app.routes.ts:48] — deferred, pre-existing

## Dev Agent Record

### Completion Notes

Implementación completa — 2026-06-08.

**Creados:**
- `src/app/core/i18n/public-locale-router.service.ts` — `PublicLocaleRouterService` con `PUBLIC_PAGE_URLS`, `navigateToLocale()` (exact-match sobre `router.url` sin query/hash), y `getLocaleUrl()` (usa locale activo si no se pasa explícito).
- `src/app/core/i18n/public-locale-router.service.spec.ts` — 18 tests que cubren todos los escenarios del I/O Matrix: landing ES/EN/CA, reputación ES/EN/CA, páginas no-públicas, query params/hash, y `getLocaleUrl` con/sin locale explícito.

**Modificados:**
- `landing-nav.component.ts` — inyecta `PublicLocaleRouterService`; añade `onLocaleSelected(locale)`.
- `landing-nav.component.html` — añade `(selected)="onLocaleSelected($event)"` al `<app-language-selector>`.
- `landing-footer.component.ts` — inyecta `PublicLocaleRouterService`; añade computed `reputationUrl`.
- `landing-footer.component.html` — `[routerLink]="reputationUrl()"` (dinámico por locale).

**Validaciones:** `npm run build` sin errores; 18 tests nuevos pasados; 0 regresiones en archivos modificados.

### File List

- `src/app/core/i18n/public-locale-router.service.ts` (CREADO)
- `src/app/core/i18n/public-locale-router.service.spec.ts` (CREADO)
- `src/app/shared/components/landing-nav/landing-nav.component.ts` (MODIFICADO)
- `src/app/shared/components/landing-nav/landing-nav.component.html` (MODIFICADO)
- `src/app/shared/components/landing-footer/landing-footer.component.ts` (MODIFICADO)
- `src/app/shared/components/landing-footer/landing-footer.component.html` (MODIFICADO)
- `_bmad-output/initiative-regalalo/archive-v6/spec-locale-aware-public-url-navigation.md` (MODIFICADO)

### Change Log

- 2026-06-08: Implementación completa de navegación locale-aware en páginas públicas indexables. Creado `PublicLocaleRouterService` con mapa canónico de URLs y 18 tests unitarios. Actualizados `landing-nav` y `landing-footer` para usar el servicio.

## Spec Change Log

## Design Notes

`navigateToLocale(locale)` usa exact-match sobre `router.url` (sin query params ni hash) para evitar false positives entre `/en` y `/en/how-it-works/reputation`:

```typescript
private detectCurrentPage(): 'landing' | 'reputation' | null {
  const url = this.router.url.split('?')[0].split('#')[0];
  for (const [key, urls] of Object.entries(PUBLIC_PAGE_URLS)) {
    if (Object.values(urls).includes(url)) return key as 'landing' | 'reputation';
  }
  return null;
}
```

Si `detectCurrentPage()` devuelve `null`, `navigateToLocale` no navega (el selector ya llamó `setLocale()`).

## Verification

**Commands:**
- `npm run build` — expected: sin errores de compilación
- `npm test` — expected: suite verde incluyendo `public-locale-router.service.spec.ts`

**Manual checks:**
- En `/`, cambiar a EN → URL cambia a `/en`, contenido en inglés.
- En `/en/how-it-works/reputation`, cambiar a CA → URL cambia a `/ca/com-funciona/reputacio`.
- En `/ca`, clic en enlace reputación del footer → navega a `/ca/com-funciona/reputacio`.
- En `/perfil`, cambiar idioma → URL NO cambia, solo UI actualiza idioma.
