# Deferred work

## Deferred from: spec-show-location-name-with-distance (2026-06-18)

- **Whitespace leading en `docs/project/Landing Page.html` (leaderboard rows)** — Tres `<div>` de la sección de reputación tienen ~14 espacios prepended en el texto (`"              2.3 km · Sants · 4 entregas"`). Con `white-space: normal` no es visible, pero sería problemático con `white-space: pre`. Archivo prototipo, sin impacto en producción.
- **Cambio de orden CTA buttons en `docs/project/Landing Page.html`** — La acción primaria "Unirme a la comunidad" quedó entre dos secundarias. Posible involuntario del diseñador; revisar jerarquía visual del hero. Archivo prototipo.
- **`docs/project/ItemDetail.jsx` CANDIDATES array no actualizado en el diff** — El archivo modifica el template para mostrar `c.localidad` condicionalmente, pero el array `CANDIDATES` del JSX (distinto del de `Detalle de item.html`) no muestra cambios en el diff. Verificar que el JSX tiene su propio array actualizado o confirmarlo como comportamiento correcto (guard `c.localidad ?` lo maneja).
- **Clave i18n `delivery.detail.distance_away` queda huérfana** — La pantalla de Entregas ya no usa esta clave (reemplazada por `items.explore.distance_km`). Limpiar los archivos de traducción `es.json`, `en.json`, `ca.json` si se confirma que ningún otro componente la usa.

## Deferred from: spec-report-modal-consistency-and-design-fix (2026-06-14)

- **`rlg-step-back` semánticamente incorrecto en apertura inicial del modal** — STEP_1 siempre recibe la clase `rlg-step-back` (animación slide-in desde -24px), incluyendo la primera apertura donde no hay navegación previa. Angular no puede distinguir "primer mount" de "remount tras Atrás" en un `@if`. Fix requiere añadir un signal `stepDir` en `report-modal.component.ts` para aplicar `rlg-step-fwd` en apertura inicial y `rlg-step-back` solo tras `onBack()`. Aplazar hasta que se revise el constraint "Never: tocar TypeScript".
- **`border-radius: 10px` hardcodeado en `.report-modal__reason-item`** — Cambio pre-existente en el working tree (antes de esta historia). Debería usar `var(--radius-md)` para respetar el design system. Fix: revertir a `var(--radius-md)` en `report-modal.component.scss`.
- **Hover pre-existente en `.report-modal__reason-item` usa `var(--border-strong)` / `var(--bg-subtle)`** — Antes usaba `var(--border-focus)` / `var(--bg-primary-light)`. Cambio pre-existente; puede crear inconsistencia visual entre hover y selected. Revisar si el cambio fue intencional.
- **`justify-content: lower` propiedad inválida en `.report-modal__backdrop`** — Declaración inválida pre-existente sin efecto visual pero indica hygiene pendiente. Fix: eliminar la línea `justify-content: lower;` del SCSS.

## Deferred from: code review of 12-f3-integracion-puntos-de-entrada-reportes (2026-06-13)

- **reportModalOpen no se resetea en loadItem()** — Si el padre cambia el input `itemId` mientras el modal de reporte está abierto, `loadItem()` no limpia `reportModalOpen`. Cuando el nuevo ítem carga, el modal se reabre automáticamente apuntando al ítem incorrecto. Fix: añadir `this.reportModalOpen.set(false); this.reportTriggerEl = null;` en el bloque de reset de `loadItem()` en `item-detail-panel.component.ts`.
- **reportModalOpen no se resetea en loadProfile()** — Mismo patrón que el anterior. Si `userId()` cambia mientras el modal está abierto (reutilización de ruta Angular), el modal se reabre para el nuevo usuario. Fix: añadir reset al inicio de `loadProfile()` en `perfil-publico.component.ts`.
- **Binding [context] vivo en app-report-modal del feed card** — La expresión `{ entityId: item().id, entityDisplayName: item().title }` se re-evalúa en cada ciclo de detección de cambios. En un feed virtualizado donde el input `item` puede reasignarse, el reporte se enviaría contra el ítem actualizado en lugar del seleccionado. Fix: capturar entityId y entityDisplayName en variables locales en `openReportModal()`.
- **Race condition canReport en perfil-publico** — `u?.id !== this.userId()` puede ser `true` transitoriamente si `userId()` es `undefined` al inicio (antes de que la ruta resuelva el parámetro). Mostraría brevemente el trigger en perfil propio. En la práctica Angular resuelve los params antes del primer render; monitorizar en SSR.
- **Non-null assertion item()!.id en item-detail-panel fuera de @if (item())** — El bloque `@if (reportModalOpen())` con `app-report-modal` se encuentra en el nivel raíz del template, fuera del `@else if (item(); as detail)`. Si `item()` se hace null mientras el modal está abierto, `item()!.id` lanza un error de runtime. Pre-existente en el patrón del componente (cancelDialogOpen tiene la misma vulnerabilidad).

## Deferred from: code review of spec-fix-explorar-guest-auth-redirect (2026-06-16)

- **Token expirado + ruta pública sigue redirigiendo a login** — `authErrorInterceptor` comprueba `session.getToken()` (null → skip redirect), pero un token expirado sigue presente en localStorage. Un usuario con sesión caducada que visita `/explorar` directamente (sin pasar por un `authGuard` que limpiaría el token) recibe 401 y es redirigido a login. Usar `session.isAuthenticated()` cubriría este caso, pero rompería el redirect de sesión expirada mid-session en rutas protegidas, porque `authGuard` ya no habría ejecutado. La corrección completa requiere contexto de ruta (comprobar si `router.url` es una ruta pública) o un `HttpContextToken` que marque la petición como "no redirigir en 401".
- **SSR: `getToken()` siempre retorna null en servidor** — En SSR, `isBrowser()` es `false` y `getToken()` devuelve null. El nuevo guard hace que todos los 401 en SSR retornen sin redirect (comportamiento benigno porque `clearToken()` y `router.navigate()` también son no-ops en SSR). Documentar o hacer el cortocircuito SSR explícito si en el futuro se implementan peticiones autenticadas server-side.

## Deferred from: code review of 13-f1-seo-infraestructura-rutas-publicas-y-meta-tags.md (2026-06-16)

- **Missing `og:url`, `og:type` y canonical link en `ItemSeoService`** — `ItemSeoService.apply()` no establece `og:url`, `og:type` ni `<link rel="canonical">`. Son propiedades OG estándar que mejoran la calidad de las rich previews y el SEO. Fuera del scope de AC 12 pero aconsejable en story futura.
- **XSS concern en meta tags SSR** — `item.title` y `item.description` se pasan verbatim a `Title.setTitle()` y `Meta.updateTag()` durante SSR. El serializer de Angular escapa atributos correctamente; riesgo es bajo si el backend valida/sanitiza el input. Revisitar si se añaden campos de texto libre sin validación en el backend.
- **Variantes localizadas de `/explorar` (ca/en) caerían a `RenderMode.Client`** — `app.routes.server.ts` solo define `explorar` sin variantes locale. Si se añaden rutas `/ca/explorar` o `/en/explore` en el futuro, necesitarán sus propias entradas en `serverRoutes`.
- **HTTP 410 tras carga previa — `item()` signal potencialmente obsoleto** — El handler de 410 no incluye `this.item.set(null)` explícito. Si el reset al inicio de `loadItem()` ya lo hace, no hay problema. Verificar que el bloque de reset existente incluya `this.item.set(null)` antes del try.
- **Usuario anónimo puede recibir 401 en `/explorar` resultando en feed vacío silencioso** — El interceptor JWT previene enviar el header Authorization cuando no hay token (AC 3), por lo que el 401 no debería ocurrir. Pero si el explorar component recibe un 401 inesperado, no muestra error visible. Pre-existing behavior; considerar manejo explícito de 401 en el componente explorar.

## Deferred from: code review of spec-locale-aware-public-url-navigation.md (2026-06-08)

- **detectCurrentPage fragilidad (trailing slash + empty URL al init)** — `detectCurrentPage()` usa exact-match de string contra `PUBLIC_PAGE_URLS`. No normaliza trailing slash (`/ca/` no coincide con `/ca`) ni guarda contra `router.url=''` durante la inicialización del router antes del primer NavigationEnd. En la práctica Angular normaliza las URLs, pero son edge cases reales en SSR o renders muy tempranos. Patch simple: strip trailing slash y guard `if (!url)`.
- **PUBLIC_PAGE_URLS enumeración cerrada** — Añadir una nueva página pública con soporte i18n requiere editar tanto la union type como el objeto constante en `public-locale-router.service.ts`. No hay patrón de registro inyectable. Deuda de extensibilidad a valorar cuando se añada la tercera página pública.
- **Double-setLocale en flujo selector→nav** — `LanguageSelectorComponent.select()` llama `setLocale()` antes de emitir `selected`. Si la navegación de `navigateToLocale()` falla (guard, error de router), el locale ya está actualizado pero la URL no. Trade-off arquitectónico aceptado por spec; revisitar si se añaden guards en rutas públicas.
- **SSR: reputationUrl puede serr URL ES en /ca y /en** — `reputationUrl = computed(() => getLocaleUrl('reputation'))` lee `localeService.currentLocale()`. En SSR/prerender, si `LocaleService.initFromPath()` no se ejecuta antes del primer render del footer, el computed devuelve la URL ES independientemente de la ruta. Verificar con prerender de `/ca` y `/en` cuando se amplíe la cobertura SSR.
- **Ruta legacy /reputacion ausente de PUBLIC_PAGE_URLS** — `app.routes.ts` tiene una ruta `/reputacion` (sin prefijo `/como-funciona/`) que resuelve a `ReputationGuideComponent`. No está en el mapa de páginas públicas, así que un usuario en esa URL que cambia idioma no obtiene navegación locale-aware. Pre-existente; revisar si es ruta activa o legacy a eliminar.

## Deferred from: vercel-backend-proxy (2026-06-08)

- **Ruta `/bffd` accesible desde producción** — El rewrite `/bffd/:path*` → `api-development.regalalo.org` está activo en todos los entornos Vercel. Cualquier usuario en `regalalo.org/bffd/...` puede hacer llamadas al backend de desarrollo. El backend de desarrollo tiene su propia autenticación pero los endpoints y datos de prueba quedan expuestos. Considerar añadir protección (IP allowlist en el backend dev, o eliminar el rewrite de `vercel.json` en producción con configuración per-branch si Vercel lo soporta en el futuro).

## Deferred from: GEO Audit items split (2026-06-06) — requieren acción manual/externa

- **Item 2 — Reemplazar `Organization.logo` por logo.png (512×512px):** Cuando exista el asset PNG de logo cuadrado, actualizar `landing-seo.service.ts` (ver nota en deferred de 11-f2). Asset de diseño pendiente.
- **Item 4 — `sameAs` en Organization schema:** Requiere crear primero una entidad en Wikidata (acción manual externa), luego añadir la URL en `landing-seo.service.ts`. También añadir LinkedIn cuando se cree la página.
- **Item 8 — Aviso Legal con contenido LSSI real:** Las stories 9-6 y 9-7 implementaron la estructura; falta rellenar los datos legales reales (nombre entidad, CIF/NIF, domicilio, email de contacto). Requiere decisión de producto/legal.
- **Item 10 — Registro Bing Webmaster Tools:** La meta tag `msvalidate.01` puede añadirse en código una vez se tenga el token de verificación de Bing (requiere registro externo en <https://www.bing.com/webmasters>). IndexNow requiere API key.

> **Cliente API:** implementación REST vía OpenAPI generado (`docs/api-client.md`). Historia 1.2 añade `SessionService` + interceptores, no `ApiService` manual.

## Deferred from: code review of cc-2026-06-01-reputacion-publica (2026-06-01)

- **Meta title/description/canonical específicos de reputación** — El prerender de `/como-funciona/reputacion` puede servir título genérico «Regálalo»; encaja en épica 11-f1 SEO técnico, no en el alcance explícito de esta CC.
- **AC «Verificación AXE manual»** — Checklist manual pendiente en preview/producción según spec de la story.

## Deferred from: code review of 10-f2-retrofits-ui-canal-de-contacto-solicitud-y-sesion-entrega (2026-06-01)

- **Enter para enviar en RequestContactBottomSheet** — `ItemDetail.jsx` RequestSheet permite Enter; el bottom sheet solo envía con clic. Coherencia menor con prototipo; sin impacto en AC de la story.

## Deferred from: code review of 9-7-alinear-contenido-legal-i18n-con-consentimiento-real (2026-05-29)

- **CMP `autoDetect: 'browser'` vs idioma de la app** — El banner puede mostrarse en idioma del navegador mientras las páginas legales siguen `LocaleService` / Transloco.
- **Claves `legal.common.footer.*` sin uso** — `site-footer` consume `site_footer.*`; el subárbol `legal.common.footer` solo infla paridad i18n.
- **Handoff HTML desactualizado** — `docs/project/Política de cookies.html` sigue citando `rgl_cookie_consent`; riesgo al re-portar copy desde diseño.
- **Retención «12 meses» sin TTL en código** — El snapshot persiste en `localStorage` sin expiración verificable; checklist #5 pendiente de validación legal/producto.
- **Migración de clave antigua `rgl_cookie_consent`** — Solo corregida en JSON/scripts; usuarios con snapshot legado bajo nombre viejo no migran en runtime.

## Deferred from: code review of 9-6-refactor-legal-pages-a-estructura-documental-completa (2026-05-29)

- **Árbol `legal.*` en ca/en sin paridad con ES** — Las plantillas nuevas consumen claves profundas (`legal.privacy.sections.*`, tablas, etc.) mientras `ca.json`/`en.json` conservan el resumen de 3 secciones. `fallbackLang: 'es'` evita claves crudas en runtime; la paridad copy↔CMP es historia **9-7**.
- **`scripts/patch-legal-i18n.mjs` vs `es.json`** — Script de volcado one-shot incluido en el File List; si se reutiliza tras editar `es.json` a mano puede duplicar o pisar nodos. Documentar uso único o retirar del repo tras merge.

## Deferred from: code review of 9-5-qa-funcional-accesibilidad-y-evidencia-de-cumplimiento (2026-05-28)

- **Init de analytics puede quedar bloqueado con script preexistente** — En `LandingSeoService`, la rama de script existente depende de eventos `load/error`; si no llegan, `analyticsInitInProgress` puede no resetearse y bloquear inicializaciones posteriores.
- **Semántica ambigua de `setPreferences` (parcial vs reemplazo)** — `CookieConsentService.setPreferences` resetea primero categorías opcionales y re-activa solo las pasadas en `true`; puede sorprender en actualizaciones parciales. Es deuda heredada no introducida por esta historia.

## Deferred from: code review of fix-entregas-imagenes-items-lista (2026-05-28)

- **`NgOptimizedImage` sin loader para URLs absolutas** — `entregas.component.html` usa `[ngSrc]` con URLs absolutas de Supabase/storage local sin `IMAGE_LOADER` configurado, igual que `mis-objetos.component.html`. Funciona porque Angular pasa URLs absolutas sin transformarlas, pero no genera srcset óptimo. Añadir `provideImageKitLoader` u otro loader en `app.config.ts` en una pasada de calidad de rendimiento de imágenes.
- **`resolveStoragePublicUrl` sin fallback a null en uso case** — `get-my-delivery-sessions.use-case.ts` llama `resolveStoragePublicUrl` sin try/catch; si `SUPABASE_URL` está mal configurado puede producir un 500 en lugar de devolver `itemImageUrl: null`. Patrón idéntico en otros use cases (`get-item`, `list-items`, `get-my-items`); abordar en pasada de resiliencia de storage transversal.
- **Bloques de miniatura duplicados en `entregas.component.html`** — El bloque `entregas__session-thumb` es idéntico en `activeSessions` e `historySessions`. Extraer a `ng-template` o componente mínimo cuando haya otro motivo para tocar el template.

## Deferred from: code review of 9-1-integrar-libreria-oss-y-capa-de-dominio-de-consentimiento (2026-05-28)

- **Gating de analytics aún no conectado en landing** — `LandingSeoService.initAnalyticsIfNeeded()` se ejecuta desde `LandingComponent` sin consultar `CookieConsentService.canRun('analytics')`. La story 9.1 es fundacional y esta conexión está prevista para 9.3; se difiere por alcance.

## Deferred from: code review of fix-login-onboarding-redirect (2026-05-27)

- **`onboardingGuard` ausente en `AppShellComponent`** — La puerta de onboarding solo se activa al pasar por el formulario de login. Un usuario con JWT válido en otro dispositivo/browser (sin `rgl_onboarding_done` en localStorage) puede navegar directamente a `/explorar` sin pasar por onboarding. Si el onboarding es obligatorio, añadir un `onboardingGuard` a las rutas del shell que compruebe `isOnboardingDone()` y redirija a `/onboarding?returnUrl=<url-actual>`.
- **Onboarding localStorage por dispositivo** — `rgl_onboarding_done` se almacena en localStorage del navegador. Usuarios que completan onboarding en un dispositivo y acceden desde otro siempre verán el onboarding de nuevo. Si debe ser por usuario (no por dispositivo), persistir el flag en el perfil backend.
- **Fragilidad en registro si se añade auto-verificación** — Si en el futuro el backend devuelve `emailVerified: true` en el registro y se implementa una redirección directa post-registro (sin pasar por login), la puerta de onboarding se saltaría. Asegurarse de añadir el check `isOnboardingDone()` en cualquier flujo que redirija a rutas protegidas sin pasar por `login.component.ts`.
- **Flash en `OnboardingComponent.ngOnInit` con usuario `done`** — El componente se renderiza brevemente antes de que `ngOnInit` detecte `isOnboardingDone()=true` y redirija. La nueva lógica de login construye URLs `/onboarding?returnUrl=...` para todos los usuarios sin flag, aumentando el tráfico hacia este componente. Si el flash es visible, añadir un guard `canActivate` que compruebe `isOnboardingDone()` antes de cargar el componente.

## Deferred from: code review of 8-f4-retrofit-interceptor-403-authguard-emailverified (2026-05-27)

- **`usersMeGet` con `401` tras login** — El interceptor global limpia el JWT antes de que el `catch` del login navegue a `/verificacion-pendiente`; el reenvío de verificación podría fallar hasta un nuevo login. Colisión improbable con token recién emitido; AC#7 prioriza tratar cualquier fallo de `/users/me` como no verificado.
- **Registro sin hidratar `emailVerified`** — Flujo intermedio hasta historia **8-f5**; el guard redirige registro → onboarding a `/verificacion-pendiente` (aceptado en Dev Notes 8-f4).

## Deferred from: code review of 8-f3-pantalla-verificar-email-token (2026-05-27)

- **`emailVerifiedSuccess` basado en `route.snapshot`** — Mismo patrón que `sessionExpired` en login; suficiente para redirect único desde verify-email; reactividad a query params sin re-navegación sería mejora transversal auth.
- **`routerLink` en `app-btn`** — Patrón heredado de reset-password y verification-pending; arreglar requiere evolucionar `BtnComponent` (enlace vs botón) en historia transversal.
- **Icono AlertBox `success` sigue siendo triángulo de aviso** — Plantilla compartida preexistente; iconografía por variant fuera de alcance 8-f3.

## Deferred from: code review of 8-f1-regenerar-cliente-openapi-y-architecture-v1-5 (2026-05-27)

- **`AuthGuard` emailVerified check no implementado** — 8-f4 es la historia responsable de añadir la comprobación `emailVerified === false → /verificacion-pendiente` en `auth.guard.ts` y extender `SessionUser` con `emailVerified?: boolean`.
- **`authErrorInterceptor` no maneja 403 `EMAIL_NOT_VERIFIED`** — 8-f4 debe añadir el case que intercepte 403 con body `{ code: 'EMAIL_NOT_VERIFIED' }`, no limpie el token, y redirija a `/verificacion-pendiente`.
- **`SessionUser.emailVerified` ausente → guard `=== false` nunca se cumple en `undefined`** — `AuthUser` (POST /auth/register) no incluirá `emailVerified` por diseño (AC#5 backend story 8.2). El valor debe obtenerse de `PrivateProfile.emailVerified` via `GET /users/me` post-registro y persistirse en `SessionUser`. La extensión de `SessionUser` con `emailVerified?: boolean` y la llamada a `/users/me` en el flujo post-registro son tarea de **8-f4** y **8-f5** respectivamente. **Importante:** el guard debe usar `!emailVerified` (falsy) en vez de `=== false` (strict) para cubrir también `undefined`.
- **`register.component.ts` no llama `GET /users/me` post-registro** — 8-f5 debe: (1) llamar `GET /users/me` tras `setToken`; (2) llamar `setUser` solo con `PrivateProfile` (no con `AuthUser`); (3) ante error en `/users/me`, tratar como `emailVerified: false` y redirigir a `/verificacion-pendiente`; (4) replicar `if (this.destroyed) return` tras el segundo `await`.
- **`authVerifyEmailGet` token ausente debe chequearse antes de llamar a la API** — 8-f3 debe validar el query param `token` antes de llamar a `authVerifyEmailGet`; si está ausente o vacío, mostrar directamente la pantalla de error con enlace a `/verificacion-pendiente` sin hacer la llamada HTTP.
- **Patrones ng-openapi-gen en código generado (casts `any`, `firstValueFrom` sin `.catch`, `filter` silencioso)** — Patrón pre-existente consistente con todos los archivos generados del proyecto. No editar `generated/` manualmente; si el generador actualiza su plantilla esto se resuelve regenerando.

## Deferred from: code review of 7-f5-mis-objetos-etiqueta-categoria-opcional-retrofit-5-3 (2026-05-26)

- **Test `surface="elevated"` en ItemCategoryChip** — Variante añadida para contraste en filas; sin spec dedicado; opcional en historia del chip compartido.

## Deferred from: code review of 7-f4-detalle-mostrar-categoria-retrofit-2-4 (2026-05-26)

- **Notas Dev Agent obsoletas** — Completion notes citan backend 7.7 pendiente y puente `GetItemResponseWithCategory`; OpenAPI ya incluye `category`/`weightRange` required; actualizar al aplicar patches.
- **`@if` defensivo en categoría** — Con `category` required en GET, el guard es opcional; mantener no rompe AC; simplificar en limpieza menor.

## Deferred from: code review of 6-f5-patch-users-me-configuracion-aviso-postal (2026-05-26)

- **Mensaje i18n `maxlength` en nombre/apellidos** — El formulario valida `maxLength(50)` pero muestra `profile.settings.error.field_invalid` genérico; la tabla AC7 no exige clave dedicada; mejora UX opcional.

## Deferred from: code review of 6-f3-componente-avatar-regla-presentacion (2026-05-26)

- **`publicar.component.ts` defaults `category`/`weightRange`** — Fix compile fuera de alcance 6-f3 (deuda 6-f1); extraer a historia de publicación o 6-f1 follow-up.
- **`resolveAvatarInitials` en fichero del componente** — Acoplamiento `entregas` → `user-avatar.component.ts`; mover a `user-display.util` en refactor menor.

## Deferred from: code review of 6-f2-registro-firstname-lastname-phone-retrofit-1-3 (2026-05-26)

- ~~**`npm test` no ejecuta specs de registro**~~ — **Resuelto 2026-05-26** (mocks DLT-003 login/perfil + spec `publicar`; suite 418/418).
- ~~**Tarea F [x] vs suite no verificada**~~ — **Resuelto 2026-05-26** (`register*.spec.ts` 21/21).
- **Smoke manual `/register` pendiente** — Tarea G [x] pero QA con backend no ejecutado; verificación humana opcional antes de release.
- ~~**`npm run build` global — budget SCSS**~~ — **Resuelto 2026-05-26** (budget `anyComponentStyle` 26 kB; build prod OK con warnings).

## Deferred from: code review of 6-f1-regenerar-cliente-openapi-y-architecture-v1-3 (2026-05-25)

- **`register.component.ts` build error** — `RegisterRequest` exige `firstName`/`lastName`; esperado AC #6; corrige historia **6-f2**.
- **`publicar.component.ts` build error** — `PublishItemMultipart` regenerado con `category`/`weightRange` requeridos; desalineación previa UI/spec; fuera alcance 6-f1.
- **Tabla Dev Notes vs Completion Notes** — Tabla «Errores de compilación esperados» no lista `publicar.component.ts`; inconsistencia doc menor.

## Deferred from: code review of 5-5-ver-perfil-publico-de-otro-usuario (2026-05-24)

- **Cambios en `perfil.component.spec.ts` (filtros solicitudes rechazadas)** — Mismo branch que 5.5 pero alcance 5.4; no bloquea perfil público.
- **Checklist verificación manual (sección F)** — QA humano pendiente antes de cerrar épica 5.

## Deferred from: code review of 5-4-ver-mis-solicitudes-realizadas (2026-05-24)

- **Subconteo de cuota con >50 solicitudes activas en ventana** — Mismo `limit: 50` en pending/selected que `item-detail-panel`; requiere paginación de cuota o endpoint agregado en backend.

## Deferred from: code review of 5-3-ver-mis-objetos-publicados (2026-05-24)

- **Contadores numéricos en pills de filtro** — AC3 los marca como opcionales en v1; la UI muestra solo etiquetas de estado.

## Deferred from: code review of 5-2-ver-historial-de-reputacion (2026-05-24)

- **Verificación manual sección F** — Checklist QA (login, Network devtools, paridad visual) pendiente para el revisor humano; no es defecto de implementación.
- **Patrón ARIA tabs sin `tabindex` roving** — Heredado del shell 5.1; misma deuda que entregas; pasada a11y transversal.

## Deferred from: code review of 5-1-ver-perfil-privado (2026-05-24)

- **Sin `<h1>` con `profile.title`** — El prototipo `Perfil.html` tampoco define título de página aparte del header de tarjeta; coherente con shell de navegación.
- **Tabs sin `tabindex` / navegación por flechas** — Mismo patrón que `entregas.component.html`; pasada a11y transversal.

## Deferred from: code review of 4-5-cancelar-objeto-con-sesion-activa (2026-05-24)

- **Panel `reserved` vacío si falla la carga de `deliverySession()`** — CTA cancelar objeto solo dentro de `@if (deliverySession())`; el donante puede usar detalle; mejorar estados error/loading en pasada de resiliencia mis-objetos.

## Deferred from: code review of 4-3-cancelar-sesion-con-declaracion-de-no-show (2026-05-23)

- **Focus trap / foco inicial en modales delivery** — Mismo gap que confirm dialog y entradas previas en deferred-work 4.4; alinear en pasada a11y transversal.

## Deferred from: code review of 4-2-confirmar-entrega-completada (2026-05-23) — Grupo A

- **Mapper 409 siempre `confirm_conflict`** — Suficiente para POST confirm en 4.2; historia 4.3 (cancel) puede necesitar clave de error distinta en `mapDeliverySessionMutationError`.

## Deferred from: code review of 4-4-pantalla-entregas-split-layout (2026-05-23)

- **Animación `slide-in` del panel detalle** — Paridad menor con `Entregas.html`; no bloquea AC.
- **Focus trap en slide-over móvil** — Mejora a11y; alinear con modales compartidos en historia futura.

## Deferred from: code review of 4-1-ver-detalle-de-sesion-de-entrega (2026-05-23)

- **Refactor logging/recaptcha en backend** — Cambios en el mismo working tree (`infrastructure/logging/`, `recaptcha-policy`, use-cases auth) fuera del file list de 4.1; revisar en PR/commit dedicado.
- **Cambios en `language-selector.component.ts`** — Sin relación con detalle de sesión; posible mejora i18n independiente.

## Deferred from: code review of 3-3-seleccionar-receptor-con-canal-de-contacto (2026-05-23)

- **Mapeo 409 por subcadena `pending`/`active` en mensaje de error** — Funciona con los textos actuales del backend (`Request is not in pending state`, `Item is not active`); endurecer si cambian los mensajes HTTP.

## Deferred from: code review of 3-2-ver-candidatos-rankeados-vista-donante (2026-05-23)

- **Modal stub sin focus trap / Escape / lockBodyScroll** — Paridad con `ItemCancelDialog`; historia 3.3 reemplaza el modal completo.
- **`ItemDonorRow` no reutiliza `user-initials.util.ts`** — Duplicación de algoritmo de iniciales; fuera de alcance 3.2.
- **Etiquetas «hace Xd» estáticas (`Date.now()` en `computed`)** — Mismo patrón que `daysAgoLabel` en el listado; sin refresco temporal.
- **Tests extra (deep link inválido, pausa, error candidatos ≠403)** — Cobertura de AC principal ya en specs; ampliar en pasada QA.

## Deferred from: code review of 3-1-solicitar-un-objeto-desde-el-detalle (2026-05-23)

- **Estado pendiente no persiste al recargar** — AC1 cubre solo la sesión actual; hidratar solicitud existente desde API quedaría para una historia de «mis solicitudes» o mejora de detalle.
- **Verificación visual pixel-perfect** — Sin prueba automatizada contra `Explorar v3.html`; validar manualmente ConfirmModal y CtaBlock pending en checkpoint humano.

## Deferred from: code review of 2-5-cancelar-objeto-propio-sin-sesion-activa (2026-05-22)

- **Página `mis-objetos` sigue siendo stub mínimo** — La story admite stub v1; el listado completo y gestión donante en esa ruta quedan para historia 5.3.

## Deferred from: code review of 2-4-ver-detalle-de-objeto (2026-05-22)

- **`resolveStoragePublicUrl` sin test para `STORAGE_DRIVER=local`** — Solo cubierto el driver Supabase en tests; validar URL `/api/storage/...` cuando se use almacenamiento local.
- **Resolución de URLs en list/my-items** — Cambio fuera del AC textual de 2.4 pero necesario para que las imágenes del feed sigan cargando; revisar en historia de hardening de storage si hace falta documentar.

## Deferred from: code review of 1-1-estructura-del-proyecto-layout-y-routing-base (2026-05-21)

- **`authGuard` stub (`true`)** — Implementación real en historia 1.2 (JWT, `returnUrl`).
- **`/reset-password` sin validación de token** — Historia 1.5.
- **Error UI si falla `loadChildren`** — Sin AC en 1.1; valorar en épica auth o global.
- **SSR + guard en rutas protegidas** — Coordinar con 1.2 cuando el guard deje de ser stub.
- **Redirigir usuarios autenticados fuera de `/login`** — Historias 1.2 / 1.4.
- **Redirect `/` según sesión** — Refinamiento 1.2 (spec lo marca opcional en 1.1).
- **`environment.ts` producción con `api.example.com`** — Sustituir al definir URL real de despliegue.

## Deferred from: code review of 1-2-servicios-core-modelos-e-interceptores-http (2026-05-21)

- **Test de integración con ambos interceptores en `provideApiClient()`** — Smoke actual solo monta `jwtInterceptor`; cubierto parcialmente por specs unitarios.
- **Test SSR explícito de `SessionService`** — Comportamiento SSR-safe implementado; sin spec server-side en 1.2.
- **Múltiples 401 concurrentes y varios `navigate`** — Edge case poco frecuente en `auth-error.interceptor`.

## Deferred from: code review of 1-3-registro-de-usuario (2026-05-21)

- **Clave de sitio reCAPTCHA v3 en `environment.development.ts`** — Site keys son públicas por diseño (aparecen en el HTML del browser). Clave de dev comprometida es práctica común. Valorar migrar a variable de entorno si el repo es público.
- **`ngOnInit` redirige antes de terminar el replay de hidratación SSR** — `OnboardingComponent.ngOnInit` llama `router.navigateByUrl` inmediatamente si el onboarding está hecho, sin esperar a que `withEventReplay` procese los eventos encolados. Bajo carga normal no causa problemas visibles, pero puede producir conflictos de navegación en SSR con eventos pendientes.
- **Token en localStorage no validado estructuralmente** — Un usuario puede editar su propio localStorage con un JWT de firma falsa pero `exp` futura. El guard de cliente acepta el token malformado. No es un riesgo real porque el servidor valida la firma en cada request; solo afecta a la UI del cliente.
- **`fieldError()` no memoizado como `computed()`** — Llamado 3–4 veces por ciclo de detección de cambios (tres campos + `postalHelper`). Impacto mínimo con OnPush; refactorizar a `computed()` en futura historia de calidad.

## Deferred from: code review de 1-4-internacionalizacion-es-ca-en (2026-05-21)

- **`provideAppInitializer` retorna `void`** — Compatible con el patrón lazy loading de Transloco (`reRenderOnLangChange: true`); no es un bug pero no bloquea bootstrap. Si en el futuro se requiere bootstraping bloqueante, cambiar `init()` para retornar `Observable<void>` completando tras `transloco.load(locale)` [src/app/app.config.ts:45].
- **`registerAppLocales()` como side effect de módulo** — Funcional y seguro (idempotente), pero ejecuta en tiempo de evaluación del módulo antes del DI. Mover a dentro de `provideAppInitializer` o a un factory para permitir tree-shaking correcto [src/app/app.config.ts:12].

## Deferred from: code review of 1-5-login-y-cierre-de-sesion (2026-05-21)

- **`SessionUser` desacoplado de tipos OpenAPI generados** — Reduce acoplamiento compile-time; riesgo de drift si cambia el contrato; funciona estructuralmente hoy.
- **Verificación visual pixel-perfect vs `Login.html`** — No automatizable en unit tests; requiere QA manual según project-context.
- **`FieldInputComponent` aria de toggle contraseña hardcodeado en español** — Pre-existente, fuera del alcance de esta historia.

## Deferred from: code review of 1-6-recuperacion-y-reset-de-contrasena (2026-05-22)

- **`FieldInputComponent` aria-label toggle contraseña hardcodeado en español** — Componente compartido preexistente; no introducido en 1.6. Abordar en historia de calidad/i18n.
- **Token leído de `snapshot` (no reactivo a cambios de query param)** — Explícitamente "no requisito MVP" en dev notes de la historia.
- **`fieldError()` no memoizado como `computed()`** — Impacto mínimo con OnPush; patrón heredado del componente login (ya diferido en 1.3).
- **`inFlight` boolean plano en lugar de signal** — Patrón de dos niveles intencional (flag interno + signal de UI); coherente con login.
- **`@switch @default` maneja `'form'` implícitamente** — Union type `ResetView` en TypeScript previene valores inesperados en tiempo de compilación.
- **Flag `destroyed` manual duplica `DestroyRef`** — Patrón intencional heredado de login para guardar continuaciones async fuera del grafo reactivo.
- **HTTP 401 en forgot/reset cae al mapper genérico** — Caso límite; el interceptor whitelist estas rutas y no redirige. Mensaje genérico es aceptable.
- **Fallthrough de error en `confirmPassword` (mantenibilidad latente)** — Sin bug actual; solo riesgo si se añaden futuros validadores al campo.
- **Directiva estructural `*transloco` mezclada con control flow nativo** — Patrón de todo el proyecto auth desde 1.4; cambiar requeriría refactor global.
- **`EMAIL_PATTERN` no exportada** — Calidad menor; los tests de componente cubren el comportamiento indirectamente.
- **Múltiples `<h1>` por página (depende del shell)** — Patrón consistente con el componente login aprobado en 1.5; requiere verificación QA visual.
- **Forgot-password 400 → banner en lugar de error inline en campo** — Desviación menor de la letra del AC1; funcionalmente correcto y consistente con el patrón del proyecto.

## Deferred from: code review of 2-1-pipeline-de-compresion-de-imagenes-en-cliente (2026-05-22)

- **Orientación EXIF en fotos móvil** — No está en AC; requiere `createImageBitmap` con `imageOrientation: 'from-image'` o librería dedicada.
- **Validación por magic bytes además de `file.type`** — Endurecimiento anti-spoofing de MIME; fuera del alcance MVP.
- **Límite de tamaño de entrada antes de `createImageBitmap`** — Optimización anti-freeze con JPEGs enormes pre-compresión.
- **Compresión secuencial o límite de concurrencia en móvil** — Optimización de memoria con lotes paralelos de fotos de cámara.
- **Input `maxImages` cableado a slots dinámicos** — Spec marca extensión futura; slots fijos en 5 para esta historia.
- **Emitir `originalName` junto a blobs para multipart** — Historia 2-2; el contrato actual `Blob[]` es suficiente para AC5.

## Deferred from: code review of 2-6-pausar-y-reanudar-solicitudes-de-un-objeto (2026-05-22)

- **Paginación hardcodeada a 50 ítems en `loadItems`** — Listado mínimo intencional por spec de historia 2.6; paginación completa con scroll o botón en historia 5.3.
- **Banner de pausa + alerta de error superpuestos** — Cuando `requestsPaused=true` y falla el PATCH siguiente, ambos banners se apilan sin separación visual. UX válido pero necesita pulido visual en iteración futura.
- **Sin `takeUntilDestroyed` en `onToggle` async** — Si el usuario navega mientras el PATCH está en vuelo, Angular maneja writes sobre señales del componente destruido sin crash; optimización para refactor futuro.
- **`ariaLabel` input con default vacío `''` en `ToggleSwitchComponent`** — Siempre provisto en el uso actual; considerar hacer el input `required` en futura pasada de calidad para prevenir nombres accesibles vacíos.
- **`showPausedSuffix` método no memoizado en `@for`** — Booleano trivial; OnPush limita los ciclos de detección de cambios. Optimizar a pipe pura en futura historia de calidad.

## Deferred from: code review of 2-2-publicar-objeto-con-formulario-e-imagenes (2026-05-22)

- **Cobertura de tests incompleta (trim, 422, máx. 5 fotos, error imágenes en componente)** — Ampliar en pasada QA dedicada; flujo principal cubierto con 11 tests.
- **Sin tope defensivo `images.slice(0, 5)` en submit** — `ImagePickerComponent` ya limita a 5; defensa en profundidad opcional.

## Deferred from: code review of spec-fix-mis-objetos-reservados-stale-tab (2026-05-28)

- **Race condition en `selectedId()`** — `selectedId()` se lee después del `await` del POST. Si el usuario navega o cambia de ítem durante la llamada, el optimistic update apunta al ítem equivocado (o no encuentra ninguno). Requiere capturar el ID antes del await o diseño arquitectural de locked-state durante la mutación.
- **Cierre del diálogo depende de `detail()` no del update optimista** — Cuando `loadPage` falla pero `loadDetail` también falla, `detail()?.status` no coincide con el estado optimista y el diálogo de confirm/cancel no cierra. Fuera del scope del fix (spec no exige cierre optimista del diálogo); abordar si se decide hacer el flujo completamente resiliente a red caída.
- **Sin rollback del optimistic update si `afterDeliverySessionMutation` lanza inesperadamente** — Spec prohíbe modificar `afterDeliverySessionMutation`; si en el futuro la función relanza errores, el estado de `items` queda corrupto hasta el próximo `loadPage`. Añadir un try/catch con `items.update` inverso si se relaja esa restricción.

## Deferred from: code review of spec-fix-mis-objetos-solicitudes-y-avatar (2026-05-28)

- **Avatar hex en panel `reserved` (receptor confirmado)** — `DeliverySessionOtherParty` no incluye `firstName`/`lastName`; el avatar del receptor sigue mostrando iniciales derivadas del UUID en el panel del ítem reservado. Fix paralelo al Bug 2 pero en un componente y endpoint distintos; fuera del alcance de este spec ("Never: No crear componente nuevo").
- **Test caso vacío en `UserAvatarComponent` vía `CandidateRowComponent`** — La matriz I/O (fila 5) cubre `firstName=''`, `lastName=''` → fallback `initialsFromUserId`, pero no hay spec test para ese path; el comportamiento está correctamente implementado en el componente preexistente sin cambios.
- **Nombre accesible del botón de fila incluye count + título + categoría concatenados** — El `<button>` envuelve toda la fila (texto, icono SVG, count); el nombre accesible calculado por el navegador es ruidoso para lectores de pantalla. Issue preexistente amplificado por el texto de count añadido; abordar en pasada transversal de accesibilidad con un `aria-label` conciso en el botón.
- **Literal `'pending'` hardcodeado en SQL sin referencia a constante de enum** — Patrón transversal pre-existente en `request.repository.ts` y `user.repository.ts`; un rename del valor enum no sería detectado en compile-time. Abordar en pasada de hardening SQL.
- **Pluralización manual con ternario en template** — `item.requestCount === 1 ? ...` en `mis-objetos.component.html`; no usa ICU plural rules de Transloco; funciona para es/ca/en pero no escala a idiomas con más formas plurales. Pre-existente en el proyecto.
- **`pausedDescId` computado en `@let` e invocado dos veces por ítem** — Acoplamiento frágil: si `showPausedSuffix` devolviera `true` para status no-activo, `aria-describedby` apuntaría a un elemento no renderizado. Pre-existente en el template.
- **`firstName`/`lastName` sin `.min(1)` en schema Zod** — Strings vacías pasan validación y degradan silenciosamente a iniciales de UUID sin log. Abordar con `.min(1)` en pasada de hardening de schemas.

## Deferred from: code review of spec-fix-diseno-pagina-detalle-item (2026-05-28)

- **Posible doble borde en galería apilada** — En viewport ≤560px, el `border-bottom` añadido a `.item-detail-panel__gallery-col` podría coexistir con un borde interno del `ItemImageGalleryComponent` entre imagen y miniaturas, generando dos separadores. Verificar inspeccionando la galería a 375px con ítems que tengan miniaturas.
- **`item-detail-modal__inner` usa `border-radius: 16px` hardcodeado** — El shell de página ya usa `var(--radius-xl)` pero el modal sigue con valor literal. Si `--radius-xl` cambia, los dos shells divergirán. Tokenizar el modal en una pasada de calidad.
- **Media query viewport vs container query en componente compartido** — El `@media (max-width: 560px)` de `item-detail-panel.component.scss` depende del viewport. Como componente compartido, migrar a `@container` cuando el soporte sea suficiente para evitar dependencias del contexto de embedding.

## Deferred from: code review of 9-2-banner-y-panel-de-preferencias-con-categorias (2026-05-28)

- **Semántica ambigua de `setPreferences` (parcial vs replace total)** — En `CookieConsentService`, `setPreferences(partialCategories)` resetea primero todas las categorías opcionales y luego activa solo las recibidas. El nombre sugiere update parcial, pero el comportamiento real es reemplazo completo; se difiere para refactor/renombrado en pasada de hardening de API interna.

## Deferred from: code review of 9-3-gating-de-scripts-no-esenciales (2026-05-28)

- **`CookieConsentService.init()` no limpia `cookieConsentLibPromise` tras fallo de import** — Si `import('vanilla-cookieconsent')` falla una vez, `initPromise` se limpia pero `cookieConsentLibPromise` queda cacheada rechazada, bloqueando reintentos en la misma sesion. Issue preexistente (no introducido por el diff 9.3); abordar en pasada de resiliencia del servicio de consentimiento.

## Deferred from: code review of 9-4-acceso-persistente-en-footer-legal-existente (2026-05-28)

- **ARIA labels y locale numérico hardcodeados en Landing preexistente** — `landing.component.html` mantiene textos ARIA literales en español y `landing.component.ts` usa `toLocaleString('es')`; no son regresión introducida por 9.4 pero quedan como deuda i18n/a11y transversal.
- **Posible falta de fallback para `IntersectionObserver` en entornos legacy** — `LandingComponent` instancia `IntersectionObserver` sin feature detection; patrón preexistente fuera del alcance funcional de 9.4.

## Deferred from: code review of spec-seo-a11y-post-audit (2026-06-02)

- **`dl/dt/button` AT announcement** — El acordeón FAQ usa `<dl>` + `<dt><button>`. Algunos lectores de pantalla anuncian "term, button, [pregunta]", que puede ser verboso. Pre-existente tras el refactor; validar con AT real (NVDA + Chrome).
- **FAQ sin animación de altura** — El panel de respuesta aparece con `display:none → block` sin transición de altura. Pre-existente (el viejo truco de checkbox tenía el mismo comportamiento). Considerar `grid-template-rows: 0fr → 1fr` si se desea animación suave en una pasada de UX.
- **`Organization.logo` usa SVG en lugar de PNG** — La URL `favicon.svg` es válida para Schema.org, pero Google prefiere PNG/JPEG en Knowledge Panels. Cuando exista un logo cuadrado en raster (p.ej. `public/logo-512.png`), actualizar la URL en `landing-seo.service.ts:165`.

## Deferred from: code review of spec-geo-seo-technical-fixes-1-3-5-6-7-9 (2026-06-08)

- **Canonical URL hardcodeada a ES para rutas CA/EN de reputación** — `ReputationSeoService.apply()` siempre construye el canonical como `https://regalalo.org/como-funciona/reputacion` independientemente del locale activo. Las páginas prerenderizadas `/ca/como-funciona/reputacion` y `/en/como-funciona/reputacion` declaran el canonical ES como self-referencing. Para corregirlo, `apply()` necesita aceptar el locale actual y calcular la URL canonical correcta (`/ca/...` o `/en/...`) antes de llamar a `setHreflang`.
- **`selectTranslation` bloqueado al idioma activo en `ngOnInit`** — En `ReputationGuideComponent.ngOnInit()`, la suscripción `transloco.selectTranslation(lang)` captura el lang en el momento de init. Si `locale.setLocale()` cambia el idioma después de init (p.ej. por cambio de selector en cliente), el observable sigue emitiendo para el lang anterior. Pre-existente; no afecta al prerender SSR donde el locale es fijo.

## Deferred from: code review of 11-f2-seo-geo-mejoras-landing (2026-06-01)

- **Traducciones whitespace-only pasan el filter de buildFaq** — Un string con solo espacios es truthy; `items.filter((item) => item.question && item.answer)` no lo atrapa, produciendo FAQ entries vacías en JSON-LD y en el template. Comportamiento pre-existente del filtro; corregir en pasada de robustez del servicio SEO.
- **SSR/prerender: schemas inyectados solo en callback asíncrono de selectTranslation** — Los schemas nuevos (FAQPage, SoftwareApplication, Organization enriquecido) se inyectan en el DOM dentro del callback de `selectTranslation().subscribe(...)`. Crawlers que ejecutan poco JS o snapshot de prerender tomado antes de la primera emisión pueden no ver los schemas. Arquitectónico, pre-existente; resolver con inicialización síncrona o con transfer state en pasada SSR.

## Deferred from: code review of 13-f2-ux-invitado-app-shell-componentes-guest-y-modal-conversion.md (2026-06-16)

- **Bottom-nav móvil sin keyboard ARIA (aria-current, arrow-keys)** — Pre-existing pattern mobile-first. No introduced by this story.
- **Rutas `/login` y `/registro` hardcodeadas** — Pre-existing pattern across entire project. Would require project-wide route constants refactor.
- **`isGuest` ignora token expirado** — SessionService already clears user() signal on 401 via auth-error interceptor. Edge case handled architecturally.

## Deferred from: code review of spec-seo-services-explorar-item-locale-aware (2026-06-16)

- **SPA page_view no trackea tras primer load** — `LandingSeoService.initAnalyticsIfNeeded()` es no-op una vez GA está cargado. Las navegaciones CSR entre `/explorar` e `/items/:id` no disparan `page_view` en GA4. Requiere llamar `gtag('event', 'page_view', ...)` en cada navegación CSR o configurar GA con `send_page_view: false` y gestionar manualmente. Afecta a todos los servicios SEO que usan este patrón.
- **Landing hero CTA text no refleja el destino** — El botón hero (clave `landing.hero.cta_secondary`) dice «Cómo funciona»/«How it works» en los tres idiomas, pero navega a `/explorar`. Pre-existente; actualizar el texto i18n en un task de copywriting.
- **CONDITION_SCHEMA sin fallback defensivo** — `CONDITION_SCHEMA[item.condition]` devuelve `undefined` si la API añade un nuevo valor de condición no mapeado, silenciando `itemCondition` en JSON-LD. Añadir `?? 'https://schema.org/UsedCondition'` como fallback.

## Deferred from: adversarial review of release v1.0.0 (2026-06-08)

- **CHANGELOG: Versión 1.0.0 etiquetada como "entorno development"** — El item «Primera versión del frontend desplegada en el entorno **development**» contradice que sea una release 1.0.0 de producción. Pre-existente en el texto original; corregir descripción en próxima release.
- **CHANGELOG: `[1.0.0]: #` es dead link** — Keep a Changelog espera una URL de comparación (ej. `https://github.com/owner/repo/compare/v0.0.0...v1.0.0`). Pre-existente; actualizar cuando se configuren tags en el repo.
- **CHANGELOG: Granularidad inconsistente en Added** — Mezcla items de alto nivel (ej. «Aplicación Angular 21») con detalles de clase única (`ReputationSeoService`). Pre-existente; unificar criterio en próxima release.
- **CHANGELOG: Casing inconsistente "frontend" vs "Frontend"** — Pre-existente; trivial.

## Deferred from: code review of 12-f1-regenerar-cliente-openapi-y-architecture-v1-7 (2026-06-12)

- **`ReportsPost$Params.body` y admin endpoints con body opcional** — Patrón conocido de ng-openapi-gen; código generado no modificable.
- **`description` sin validación `maxLength: 500` en `CreateReportRequest`** — La validación cliente corresponde a `ReportModalComponent` (story 12-f2).
- **7 servicios Admin (~25 modelos) generados pero no documentados en `docs/architecture.md` ni `docs/api-client.md`** — Fuera de scope de 12-f1; posible historia separada.
- **`removeStaleFiles: true` como riesgo operacional en pipeline de regeneración** — No urgente, considerar hardening futuro.
- **Warning de presupuesto CSS pre-existentes (onboarding, mis-objetos, perfil, landing)** — Preexistente, no causado por este cambio.

## Deferred from: code review of 12-f2-report-service-y-report-modal-component (2026-06-13)

- **Scroll lock no soporta modales anidados** — `report-modal.component.ts` guarda `bodyOverflowBeforeLock` como instancia única. Si dos modales se abren, el segundo sobreescribe el valor guardado. Patrón idéntico al pre-existente en `item-cancel-dialog`.
- **handleError público** — Intencional para testing (specs necesitan acceso al método).
- **Componente destruido con HTTP en vuelo** — `takeUntilDestroyed` desuscribe pero el HTTP subyacente se completa igual. Comportamiento normal con `takeUntilDestroyed`.
- **Elementos DOM reCAPTCHA no se limpian al destroy** — `RecaptchaService.removeFromDom()` existe pero nunca se invoca. Pre-existing en `RecaptchaService`.

## Deferred from: code review of story-frontend-routing-por-slug-y-retrocompatibilidad-uuid-plan (2026-10-27)

- **Los slugs no se codifican al armar la URL como string** — `itemPublicUrl` y las concatenaciones `/items/${slug}` no usan `encodeURIComponent`. `router.navigate` sí codifica. Gravedad media sin verificar: solo es un defecto si el backend admite caracteres reservados o acentuados en el slug. Lo cierra el alfabeto que garantiza el backend.
