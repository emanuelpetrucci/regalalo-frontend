---
stepsCompleted: ["step-01", "step-02", "step-03", "step-04"]
inputDocuments:
  - docs/prd.md
  - docs/architecture.md
  - docs/README.md
  - docs/project/colors_and_type.css
  - docs/project/Login.html
  - docs/project/
  - docs/project/DESIGN-BRIEF-EPK13.html
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-06-15-public-discovery-seo.md
---

# regalalo - Epic Breakdown

## Overview

Este documento descompone los requisitos del PRD, la arquitectura técnica frontend (`docs/architecture.md`) y el **handoff de diseño** (`docs/README.md`, `docs/project/`) en épicas e historias implementables para la aplicación Angular. El backend REST ya está implementado; el frontend consume contratos de API de solo lectura.

## Cumplimiento de diseño — OBLIGATORIO

Los ficheros en `docs/README.md` y `docs/project/` **son la especificación de diseño vinculante** del MVP. Ningún agente ni desarrollador puede:

- Diseñar pantallas sin abrir el prototipo HTML asignado a esa historia.
- Introducir colores, fuentes, espaciados o componentes no definidos en `colors_and_type.css` o en los HTML de `docs/project/`.
- Sustituir el handoff por plantillas genéricas, UI kits o criterio propio.
- Marcar una historia con UI como completada si el resultado no reproduce el prototipo (fidelidad visual pixel-perfect).

**Flujo obligatorio antes de implementar UI:** (1) leer `docs/README.md` → (2) leer el/los `.html` de la tabla «Referencia diseño por historia» en su totalidad → (3) extraer tokens de `colors_and_type.css` → (4) implementar en Angular.

Ver también: `_bmad-output/project-context.md` (requisito bloqueante).

## Requirements Inventory

### Functional Requirements

FR-F1: El usuario visitante puede registrarse con email, contraseña, código postal y reCAPTCHA V3, recibiendo JWT y datos de usuario.
FR-F2: El usuario registrado puede iniciar sesión con email, contraseña y reCAPTCHA V3, recibiendo JWT.
FR-F3: El usuario puede solicitar recuperación de contraseña por email (respuesta siempre exitosa en UI).
FR-F4: El usuario puede establecer nueva contraseña mediante enlace con token.
FR-F5: Las rutas protegidas exigen JWT válido no expirado; sin token o expirado redirige a login con `returnUrl`.
FR-F6: El donante autenticado puede publicar un objeto con título, descripción, condición, categoría (`category`), rango de peso (`weightRange`), código postal del objeto y hasta 5 imágenes comprimidas en cliente (valores según `docs/prd-analytics.md` §4 / `architecture.md` v1.4).
FR-F7: El usuario autenticado puede listar objetos activos en radio 50 km con paginación; objetos degradados al final.
FR-F8: El usuario autenticado puede ver el detalle de un objeto (incl. donante, reputación, imágenes, `requestsPaused`).
FR-F9: El donante puede cancelar su propio objeto desde la UI (sin sesión activa en esta historia base).
FR-F10: El donante puede pausar/reanudar solicitudes de su objeto activo mediante toggle (`PATCH /items/:id/pause`).
FR-F11: El receptor autenticado puede solicitar un objeto ajeno; no puede solicitar el propio.
FR-F12: El frontend distingue errores 409 de solicitud: duplicada/límite vs solicitudes pausadas (por `error`/`code` del body).
FR-F13: El donante puede ver la lista de candidatos rankeados de su objeto.
FR-F14: El donante puede seleccionar un candidato proporcionando canal de contacto externo.
FR-F15: Donante o receptor pueden ver el detalle de una sesión de entrega; `contactChannel` se renderiza solo si el backend lo devuelve no nulo.
FR-F16: El donante puede confirmar entrega completada en sesión activa.
FR-F17: El donante puede cancelar sesión activa con opción de declarar no-show del receptor.
FR-F18: El donante puede cancelar objeto que tiene sesión activa (flujo extendido).
FR-F19: El usuario autenticado puede listar sus sesiones de entrega con filtros por rol y estado.
FR-F20: El usuario autenticado puede ver su perfil privado (`GET /users/me`).
FR-F21: El usuario autenticado puede ver su historial de reputación.
FR-F22: El usuario autenticado puede listar sus objetos publicados con filtro por estado.
FR-F23: El usuario autenticado puede listar sus solicitudes realizadas con filtro por estado.
FR-F24: El usuario autenticado puede ver el perfil público de otro usuario (sin email ni `consecutiveNoShows`).
FR-F25: El registro incluye `firstName` y `lastName` obligatorios (mín. 2 caracteres en cliente) y `phone` opcional.
FR-F26: El usuario autenticado puede actualizar su perfil vía `PATCH /users/me` (nombre, avatar, teléfono, código postal, idioma).
FR-F27: Al cambiar `postalCode` en perfil, la UI avisa que la sesión se cerrará; tras guardar, 401 subsiguiente redirige a login con `returnUrl` hacia configuración de perfil.
FR-F28: Avatar: si `avatarUrl` no es null → `<img>`; si null → iniciales `firstName[0]` + `lastName[0]` (estilo mockups).
FR-F29: Perfil público y listas sociales usan contrato `PublicUser` (nombre, avatar); sin email ni `consecutiveNoShows`.
FR-F30: La publicación de objeto incluye `category` y `weightRange` obligatorios con selectores UI (valores enum del contrato).
FR-F31: El detalle de objeto muestra la etiqueta visible de `category`; `weightRange` no se muestra al usuario final.
FR-F32: Cliente OpenAPI y `architecture.md` reflejan v1.4 (campos analíticos en ítems).
FR-F33: Post-registro (201), el frontend redirige a `/verificacion-pendiente`; no al feed ni a `returnUrl`.
FR-F34: `/verificacion-pendiente` informa al usuario de verificación pendiente y ofrece reenvío del email con cooldown de 30 s (tiempo obtenido de `Retry-After` o default 30 s tras 200).
FR-F35: `/verificar-email` extrae el token del query param, llama `GET /auth/verify-email`; 200 → redirige a `/login` con mensaje de confirmación; 400 → muestra error con enlace a `/verificacion-pendiente`.
FR-F36: Ante 403 con código `EMAIL_NOT_VERIFIED`, el interceptor HTTP no limpia el token y redirige a `/verificacion-pendiente`.
FR-F37: `AuthGuard` verifica `emailVerified` del usuario en estado; si `false`, redirige a `/verificacion-pendiente` sin intentar la navegación.
FR-F42: El receptor proporciona `contactChannel` (texto libre, obligatorio, no vacío tras `trim()`) al solicitar un objeto mediante un bottom sheet; el backend valida con 400 si ausente.
FR-F43: El donante ve `receiverContactChannel` del receptor seleccionado en el detalle de sesión de entrega; el frontend lo renderiza solo si el backend lo devuelve con valor no nulo (SEC-002c; sin lógica de visibilidad propia en cliente).
FR-REP-F1: El usuario autenticado con `emailVerified = true` puede reportar un objeto o usuario mediante un modal de 3 pasos que categoriza el problema y envía el reporte a revisión.
FR-REP-F2: El sistema de reporte gestiona 7 códigos de error diferenciados del backend y los muestra inline en el paso 2 del modal (sin cerrar el modal ni usar toast global).
FR-REP-F3: El trigger de reporte (botón/enlace) no se renderiza para usuarios no autenticados, sin email verificado o propietarios de la entidad reportada
FR-F44: Las rutas `/explorar` e `/items/:id` no requieren `AuthGuard`; son accesibles sin token JWT.
FR-F45: `GET /items` sin JWT devuelve un Feed Global (sin restricción de 50 km) para indexación de crawlers y navegación de visitantes.
FR-F46: El `AppShellComponent` detecta la ausencia de token y renderiza la variante visitante: navbar sustituye avatar+Publicar por "Iniciar sesión" (→ /login, link secundario) + "Registrarse" (→ /registro, botón primario). Bottom nav sustituye tab "Perfil" por "Entrar" (→ /login); tab "Publicar" aparece en estado visual gateado (fgDisabled + dot accent) — al clicar abre `ConversionGateModal`, no navega.
FR-F47: El componente `ItemDonorRow` se activa en modo `anonymous` para visitantes: placeholder genérico (icono persona, fondo bgSubtle, sin iniciales), "Donante anónimo" en fgMid (no enlazable), fecha de miembro visible, score de reputación visible.
FR-F48: El botón "Me interesa"/"Solicitar" para visitantes abre `ConversionGateModal` (variante `request_item`) en lugar del formulario de contacto. El botón "Publicar" de navbar y bottom nav abre `ConversionGateModal` (variante `publish_item`).
FR-F49: Las páginas de detalle de objeto cargadas vía SSR inyectan etiquetas OpenGraph dinámicas: `og:title`, `og:description` e `og:image` con la primera imagen del objeto.
FR-F50: Los objetos en estado `completed` o `cancelled` incluyen `<meta name="robots" content="noindex">` para limpiar el índice de Google.
FR-F51: El sistema maneja respuesta `410 Gone` del backend para IDs de objetos purgados físicamente (>30 días en estado final), mostrando página de error diferenciada de 404.
FR-F52: Las tarjetas de objeto en el feed de visitante no muestran distancia en km (muestran "Disponible en España" en fgDisabled), no muestran contador de solicitudes y no renderizan el menú contextual (···) — no usar `disabled`, directamente no renderizar el control.
FR-F53: El `FeedGlobalBanner` aparece en la parte superior del feed solo para visitantes, es descartable mediante `sessionStorage` (no reaparece en la sesión), y contiene enlace a registro con texto explicativo del Feed Global.

### NonFunctional Requirements

NFR-F1: Framework Angular con componentes standalone, signals para estado, `ChangeDetectionStrategy.OnPush`.
NFR-F2: Cumplimiento WCAG AA mínimo y paso de checks AXE en flujos implementados.
NFR-F3: JWT almacenado en `localStorage`; header `Authorization: Bearer` en peticiones autenticadas.
NFR-F4: Ante 401, interceptor limpia token y redirige a `/login?returnUrl=<ruta>`; sin silent refresh (JWT 7 días). Ante 403 con código `EMAIL_NOT_VERIFIED`, el interceptor **no** limpia el token y redirige a `/verificacion-pendiente`.
NFR-F5: Pipeline de compresión de imágenes: máx. 1200px, WebP 80%, tope 2MB/imagen, máx. 5 imágenes.
NFR-F6: URLs de imágenes del backend consumidas directamente (Supabase Storage); sin lógica de refresco TTL.
NFR-F7: `reputationScore` puede ser negativo — la UI no trunca ni oculta valores negativos.
NFR-F8: Contratos de API son de solo lectura; no modificar endpoints sin aprobación explícita.
NFR-F9: Variables de entorno para URL del API, clave reCAPTCHA y configuración por ambiente (`environments/`).
NFR-F10: Hosting objetivo Vercel; build de producción sin errores.
NFR-F11: Lazy loading de feature routes.
NFR-F12: Formularios reactivos; control flow nativo (`@if`, `@for`); sin `ngClass`/`ngStyle`.
NFR-F13: **Diseño 100 % basado en `docs/project/`** — toda pantalla y componente compartido debe derivar exclusivamente de los prototipos HTML/CSS y `colors_and_type.css`; cero desviación visual no aprobada por el usuario.
NFR-F17: Las rutas públicas `/explorar` e `/items/:id` deben ser indexables por crawlers de Google sin bloqueo por JavaScript (SSR o prerender; no depender de JS-only render para meta tags).
NFR-F18: El SSR/prerender aplica exclusivamente a rutas públicas del catálogo; las rutas autenticadas continúan con `RenderMode.Client` (alineado con la estrategia existente de i18n/prerender).

### Additional Requirements

- **BLOQUEANTE:** `docs/README.md` + `docs/project/` definen el diseño completo; no existe diseño paralelo ni “inspirado en”.
- Proyecto brownfield: scaffold Angular CLI 21.x existe; **el diseño ya está maquetado** en HTML — la implementación es portado fiel a Angular, no rediseño.
- Epic 1 Story 1: estructura §2 de arquitectura **y** tema global copiado de `colors_and_type.css` (valores exactos de tokens, fuentes, sombras).
- Tipografías **únicas** permitidas: Playfair Display, DM Sans, JetBrains Mono — solo las declaradas en `colors_and_type.css`.
- Layout, navegación, cards, formularios, botones y estados vacíos/error: **solo** según los HTML listados en «Referencia diseño por historia».
- Carpetas obligatorias: `core/` (services, guards, interceptors, models), `features/auth|items|delivery|profile`, `shared/`, `layout/`.
- Cliente API: OpenAPI generado (`provideApiClient`, `npm run api:generate`) — ver `docs/api-client.md`.
- Servicios core: `SessionService` (JWT en `localStorage`); servicios generados (`AuthService`, `ItemsService`, `UsersService`, `DeliveryService`); interceptores JWT + errores HTTP.
- Tipos de contrato: `core/api/generated/models` (incluye `requestsPaused` y demás campos del spec); `core/models/` solo para tipos de presentación UI si hiciera falta.
- `AuthGuard` verifica presencia, expiración local del token **y** `emailVerified === true`; si alguna condición falla, redirige según corresponda (token ausente/expirado → `/login`; `emailVerified === false` → `/verificacion-pendiente`).
- Regla SEC-002: no implementar lógica propia de visibilidad de `contactChannel`; renderizar si backend devuelve valor, mostrar no disponible si `null`.
- Objetos con `degradedAt !== null` al final del listado (orden ya viene del backend; UI refuerza indicador visual).
- Toggle `requestsPaused` solo visible al donante con `status === 'active'`.
- Indicador visual de pausa en listado de objetos propios del donante.
- Botón solicitar oculto/deshabilitado en objetos propios del usuario actual.
- Perfil público sin exponer `requestsPaused` del donante.
- reCAPTCHA V3 integrado en registro y login.
- `NgOptimizedImage` para imágenes estáticas de assets.
- **REST en implementación:** usar métodos del cliente generado (`docs/api-client.md`); en los AC, verbos como `POST /items` son descriptivos — implementar con `ItemsService.itemsPost`, `DeliveryService.deliverySessionsIdConfirmPost`, etc.

### UX Design Requirements (especificación vinculante — `docs/project/`)

Estos requisitos son **obligatorios** y equivalen al UX Design del proyecto. Incumplimiento = historia no aceptada.

UX-DR1: **[BLOQUEANTE]** Tema global Angular = valores exactos de `colors_and_type.css` (sin sustituir hex, fuentes ni radios).
UX-DR2: **[BLOQUEANTE]** Auth = reproducción de `Login.html` (archivo completo + estilos inline/embebidos).
UX-DR3: **[BLOQUEANTE]** Onboarding = reproducción de `Onboarding.html`.
UX-DR4: **[BLOQUEANTE]** Landing = reproducción de `Landing Page.html`.
UX-DR5: **[BLOQUEANTE]** Explorar/feed/detalle = reproducción de `Explorar v3.html`.
UX-DR6: **[BLOQUEANTE]** Objetos del donante/publicar = reproducción de `Mis objetos.html`.
UX-DR7: **[BLOQUEANTE]** Entregas = reproducción de `Entregas.html`.
UX-DR8: **[BLOQUEANTE]** Perfil/actividad = reproducción de `Perfil.html`.
UX-DR9: **[BLOQUEANTE]** Legal = reproducción de `Política de privacidad.html` y `Política de cookies.html`.
UX-DR10: **[BLOQUEANTE]** `shared/components/` solo contiene patrones extraídos de los HTML (mismos estilos que en prototipo).
UX-DR11: **[BLOQUEANTE]** Breakpoints y layout responsive = los definidos en cada HTML (no inventar grid distinto).
UX-DR12: **[BLOQUEANTE]** Estados error/éxito/vacío = colores y patrones de `colors_and_type.css` y del HTML de la pantalla.
UX-DR13: **[BLOQUEANTE]** `NavbarComponent` visitante = reproducción de `DESIGN-BRIEF-EPK13.html` §Navbar: "Iniciar sesión" (link, color fgMid, → /login) + "Registrarse" (botón primario, → /registro). Sin avatar, sin botón Publicar, sin notificaciones. Logo y estructura de contenedor idénticos al estado autenticado.
UX-DR14: **[BLOQUEANTE]** `BottomNavComponent` visitante = reproducción de `DESIGN-BRIEF-EPK13.html` §BottomNav: tab "Publicar" con icono en fgDisabled + dot accent (#253F72, 7px, borde bgSurface); tab "Entrar" con icono IUser. Clic en "Publicar" → abre `ConversionGateModal` (variante `publish_item`), no navega. Clic en "Entrar" → /login.
UX-DR15: **[BLOQUEANTE]** `FeedGlobalBanner` = reproducción de `DESIGN-BRIEF-EPK13.html` §Banner: fondo #EDF0F5, borde 1px #A5B5D4, radio 10px; enlace "Regístrate" en primary-500 con `text-decoration-style: dotted`; botón × en fgMuted. Al descartar: componente no renderiza, el espacio desaparece completamente (sin placeholder). Persistencia en `sessionStorage`.
UX-DR16: **[BLOQUEANTE]** `ItemCardComponent` visitante = reproducción de `DESIGN-BRIEF-EPK13.html` §ItemCard: distancia reemplazada por "Disponible en España" en fgDisabled; contador de solicitudes no renderizado; menú contextual (···) no renderizado (no usar `disabled`, directamente no incluir el elemento en el DOM). Score del donante visible.
UX-DR17: **[BLOQUEANTE]** `DonorRowComponent` visitante = reproducción de `DESIGN-BRIEF-EPK13.html` §DonorRow: placeholder genérico (icono IUser 18px, fondo bgSubtle #E8EAEC, borde border, sin iniciales); texto "Donante anónimo" en color fgMid (#606A76), sin enlace ni cursor pointer; fecha de miembro visible en fgMuted; score en color semántico (mismo que estado autenticado).
UX-DR18: **[BLOQUEANTE]** `ConversionGateModal` = reproducción de `DESIGN-BRIEF-EPK13.html` §Modal: overlay rgba(20,23,26,0.55); panel bgSurface, borderRadius 16px, boxShadow shadow3; icono IGift en círculo primaryLight; título Playfair Display 22px; lista de 3 beneficios en primaryLight; CTA primario → /registro (primary-500, ancho completo); CTA secundario → /login (borde border-default, ancho completo); foco inicial en botón primario al abrir; focus trap activo mientras el modal está abierto; cierre con tecla ESC y botón ×.

### Referencia diseño por historia (fichero obligatorio — sin alternativas)

Cada historia con UI **debe** implementarse leyendo estos ficheros. Si una pantalla no tiene fila, aún así aplica UX-DR10 y `colors_and_type.css`.

| Historia | Fichero(s) obligatorio(s) en `docs/project/` |
|---|---|
| 1.1 | `colors_and_type.css`, `Login.html`, `Perfil.html`, `wireframes.html` |
| 1.2 | `colors_and_type.css` (sin UI nueva; no alterar tokens) |
| 1.3 | `Login.html`, `Onboarding.html` |
| 1.4 | `Landing Page.html`, `Login.html` (piloto registro), `colors_and_type.css` |
| 1.5 | `Login.html` |
| 1.6 | `Login.html` |
| 2.1 | `Mis objetos.html` (selector/compresión imágenes) |
| 2.2 | `Mis objetos.html` |
| 2.3 | `Explorar v3.html` |
| 2.4 | `Explorar v3.html` |
| 2.5 | `Mis objetos.html` |
| 2.6 | `Mis objetos.html` |
| 3.1 | `Explorar v3.html` |
| 3.2 | `Mis objetos.html` |
| 3.3 | `Mis objetos.html` |
| 4.1 | `Entregas.html` |
| 4.2 | `Entregas.html` |
| 4.3 | `Entregas.html` |
| 4.4 | `Entregas.html` |
| 4.5 | `Mis objetos.html`, `Entregas.html` |
| 5.1 | `Perfil.html` |
| 5.2 | `Perfil.html` |
| 5.3 | `Mis objetos.html`, `Perfil.html` |
| 5.4 | `Perfil.html` |
| 5.5 | `Perfil.html`, `Explorar v3.html` (vista pública) |
| 7-f2 | `Mis objetos.html` |
| 7-f4 | `Explorar v3.html` |
| 7-f5 | `Mis objetos.html` |
| Landing | `Landing Page.html` |
| Legal | `Política de privacidad.html`, `Política de cookies.html` |
| 8-f2 | `Login.html` (patrones módulo auth — pantalla nueva sin prototipo dedicado) |
| 8-f3 | `Login.html` (patrones módulo auth — pantalla nueva sin prototipo dedicado) |
| 10-f2 | `Detalle de item.html`, `ItemDetail.jsx` (RequestSheet), `Entregas.html` (CoordinationBlock) |
<<<<<<< HEAD
| 12-f2 | `DESIGN-REP-01.md` (especificación visual completa del modal), `colors_and_type.css` |
| 12-f3 | `DESIGN-REP-01.md` §4 (triggers), `Explorar v3.html` (ItemCard/ItemDetail), `Perfil.html` (UserProfile) |
=======
| 13-f1 | `colors_and_type.css` (sin prototipo HTML dedicado — configuración SSR/meta/rutas) |
| 13-f2 | `DESIGN-BRIEF-EPK13.html` (todos los componentes guest) |

>>>>>>> bfdee7e60122823fba43d4566c1f811eaebb1578

### FR Coverage Map

FR-F1: Épica 1 — Registro
FR-F2: Épica 1 — Login
FR-F3: Épica 1 — Forgot password
FR-F4: Épica 1 — AuthGuard, interceptors, rutas protegidas
FR-F5: Épica 1 — Reset password
FR-F6: Épica 2 — Publicar objeto
FR-F7: Épica 2 — Listar objetos (feed)
FR-F8: Épica 2 — Detalle de objeto
FR-F9: Épica 2 — Cancelar objeto (base)
FR-F10: Épica 2 — Pausar/reanudar solicitudes
FR-F11: Épica 3 — Solicitar objeto
FR-F12: Épica 3 — Errores 409 diferenciados
FR-F13: Épica 3 — Candidatos rankeados
FR-F14: Épica 3 — Seleccionar receptor
FR-F15: Épica 4 — Detalle sesión
FR-F16: Épica 4 — Confirmar entrega
FR-F17: Épica 4 — Cancelar sesión / no-show
FR-F18: Épica 4 — Cancelar objeto con sesión activa
FR-F19: Épica 4 — Listado mis sesiones
FR-F20: Épica 5 — Perfil privado
FR-F21: Épica 5 — Historial reputación
FR-F22: Épica 5 — Mis objetos publicados
FR-F23: Épica 5 — Mis solicitudes
FR-F24: Épica 5 — Perfil público
FR-F25: Épica 6 — Registro con nombre y teléfono
FR-F26: Épica 6 — PATCH perfil
FR-F27: Épica 6 — Aviso e invalidación JWT por CP
FR-F28: Épica 6 — Regla avatar transversal
FR-F29: Épica 6 — Perfil público con identidad
FR-F30: Épica 7-f — Publicación con category y weightRange
FR-F31: Épica 7-f — Detalle con categoría visible
FR-F32: Épica 7-f — Cliente OpenAPI y architecture v1.4
FR-F33: Épica 8-f — Retrofit registro redirect a /verificacion-pendiente
FR-F34: Épica 8-f — Pantalla /verificacion-pendiente
FR-F35: Épica 8-f — Pantalla /verificar-email
FR-F36: Épica 8-f — Retrofit interceptor 403 EMAIL_NOT_VERIFIED
FR-F37: Épica 8-f — Retrofit AuthGuard emailVerified
FR-F42: Épica 10-f — Bottom sheet contactChannel en solicitud de objeto
FR-F43: Épica 10-f — receiverContactChannel en detalle sesión entrega (donante)
<<<<<<< HEAD
FR-REP-F1: Épica 12-f — ReportService + ReportModalComponent (3 pasos)
FR-REP-F2: Épica 12-f — Gestión de errores inline (7 códigos diferenciados)
FR-REP-F3: Épica 12-f — Integración en puntos de entrada (canReport)
=======

FR-F44: Épica 13-f1 — Rutas /explorar e /items/:id sin AuthGuard
FR-F45: Épica 13-f1 — GET /items sin JWT devuelve Feed Global (sin radio 50km)
FR-F46: Épica 13-f2 — AppShell variante visitante (navbar + bottom nav)
FR-F47: Épica 13-f2 — ItemDonorRow modo anonymous
FR-F48: Épica 13-f2 — ConversionGateModal en acciones gateadas
FR-F49: Épica 13-f1 — Meta tags OpenGraph dinámicos vía SSR
FR-F50: Épica 13-f1 — noindex para objetos completed/cancelled
FR-F51: Épica 13-f1 — Manejo 410 Gone para objetos purgados
FR-F52: Épica 13-f2 — ItemCard visitante (sin distancia, sin contador, sin menú)
FR-F53: Épica 13-f2 — FeedGlobalBanner descartable en feed de visitante
>>>>>>> bfdee7e60122823fba43d4566c1f811eaebb1578

## Epic List

### Epic 1: Fundación Angular y Autenticación

El usuario puede registrarse, iniciar sesión, recuperar contraseña y acceder a rutas protegidas. La aplicación tiene estructura core, layout, design system portado desde `docs/project/`, environments y HTTP con el backend.
**FRs cubiertos:** FR-F1, FR-F2, FR-F3, FR-F4, FR-F5  
**UX:** UX-DR1, UX-DR2, UX-DR3, UX-DR4, UX-DR10, UX-DR11

### Epic 2: Publicación y Exploración de Objetos

El donante publica objetos con imágenes comprimidas; cualquier usuario autenticado explora el feed geográfico, ve detalle, cancela o pausa solicitudes en sus objetos.
**FRs cubiertos:** FR-F6, FR-F7, FR-F8, FR-F9, FR-F10

### Epic 3: Solicitudes y Selección de Candidatos

El receptor solicita objetos con manejo de errores claro; el donante revisa candidatos rankeados y selecciona receptor.
**FRs cubiertos:** FR-F11, FR-F12, FR-F13, FR-F14

### Epic 4: Sesiones de Entrega

Donante y receptor gestionan el ciclo de entrega: detalle, confirmación, cancelación, no-show y listado de sesiones propias.
**FRs cubiertos:** FR-F15, FR-F16, FR-F17, FR-F18, FR-F19

### Epic 5: Perfil y Actividad del Usuario

El usuario consulta su perfil, reputación, objetos publicados, solicitudes realizadas y perfiles públicos de otros.
**FRs cubiertos:** FR-F20, FR-F21, FR-F22, FR-F23, FR-F24

### Epic 6: Alineación modelo de usuario (DLT-003 — frontend)

Alinea cliente OpenAPI, registro, avatares, perfiles y edición de cuenta con el contrato backend DLT-003 (`docs/delta-frontend-DLT-003_2.md`, `architecture.md` v1.3). Retrofit de historias 1.3, 1.5, 5.1 y 5.5 ya cerradas.
**FRs cubiertos:** FR-F25, FR-F26, FR-F27, FR-F28, FR-F29  
**UX:** `Login.html`, `Perfil.html`, avatares en `Explorar v3.html`, `Entregas.html`, `Mis objetos.html`  
**Referencia:** Correct Course `sprint-change-proposal-2026-05-25-DLT-003_2.md` (aprobado 2026-05-25)

### Epic 7-f: Alineación analítica en ítems (DLT-004 — frontend)

Alinea formulario de publicación, detalle y cliente OpenAPI con `category` y `weightRange` (`docs/delta-frontend-DLT-004.md`, `architecture.md` v1.4). Retrofit de historias 2.2 y 2.4 ya cerradas. Coordinación: backend debe exponer `category` en GET antes de 7-f4 (historia backend **7.7**).
**FRs cubiertos:** FR-F30, FR-F31, FR-F32 (y amplía FR-F6)  
**UX:** `Mis objetos.html` (modal publicar), `Explorar v3.html` (detalle)  
**Referencia:** Correct Course `sprint-change-proposal-2026-05-26-DLT-004.md` (aprobado 2026-05-26)

### Epic 8-f: Verificación de email (DLT-email-verification)

Implementa el flujo completo de verificación de email: pantallas `/verificacion-pendiente` y `/verificar-email`, interceptor 403 `EMAIL_NOT_VERIFIED`, `AuthGuard` con comprobación de `emailVerified` y retrofit de redirección post-registro. El backend ya implementó los endpoints y el flujo de email (EVT-014, TPL-009).
**FRs cubiertos:** FR-F33, FR-F34, FR-F35, FR-F36, FR-F37  
**UX:** `Login.html` (patrones módulo auth — pantallas sin prototipo HTML dedicado)  
**Referencia:** Correct Course `sprint-change-proposal-2026-05-27-email-verification.md` (aprobado 2026-05-27)

### Epic 9: Gestión de consentimiento de cookies (OSS)

Implementa un gestor de consentimiento de cookies open source en frontend con consentimiento granular, bloqueo de scripts no esenciales y punto persistente de revisión de preferencias. Debe respetar de forma estricta la maquetación de `docs/project/Política de privacidad.html` y `docs/project/Política de cookies.html`, reutilizando el footer ya definido en esas páginas.
**FRs cubiertos:** FR-F38, FR-F39, FR-F40, FR-F41  
**UX:** `Política de privacidad.html`, `Política de cookies.html` (footer existente como punto de acceso)  
**Referencia:** Correct Course `sprint-change-proposal-2026-05-28-cookies-consent.md` (aprobado 2026-05-28); remediación legal `sprint-change-proposal-2026-05-28-legal-alignment.md` (aprobado 2026-05-28) — stories 9-f6, 9-f7

<<<<<<< HEAD

### Epic 12-f: Sistema de Reportes (PRD-REP-FE-01)

Implementa el sistema de reportes frontend: `ReportModalComponent` (modal standalone de 3 pasos reutilizable), `ReportService`, integración de triggers en `ItemCardComponent`, `ItemDetailComponent` y `UserProfilePublicComponent`. Acceso restringido a usuarios autenticados con `emailVerified = true`. Depende de que el backend implemente `POST /api/reports` (PRD-REP-BE-01).
**FRs cubiertos:** FR-REP-F1, FR-REP-F2, FR-REP-F3
**UX:** `DESIGN-REP-01.md` (especificación visual del modal y triggers), `colors_and_type.css`
**Referencia:** Correct Course `sprint-change-proposal-2026-06-11-reportes-frontend.md` (aprobado 2026-06-11)
=======

### Epic 10-f: Canal de contacto receptor en solicitud (DLT-candidato-contacto — frontend)

Alinea el flujo de solicitud de objetos y el detalle de sesión de entrega con el contrato backend DLT-candidato-contacto. Retrofit de stories 3.1 y 4.1 ya cerradas.
**FRs cubiertos:** FR-F42, FR-F43  
**UX:** `Detalle de item.html`, `ItemDetail.jsx` (RequestSheet), `Entregas.html` (CoordinationBlock)  
**Referencia:** Correct Course `sprint-change-proposal-2026-06-01-DLT-candidato-contacto.md` (aprobado 2026-06-01)

### Epic 13: Descubrimiento Público y Conversión SEO

Transforma el modelo de acceso de "walled garden" a "Público para ver, privado para actuar". El catálogo es indexable por Google sin autenticación; los visitantes ven el feed global con identidades de donantes anonimizadas; las acciones de interacción activan un modal de conversión al registro.
**FRs cubiertos:** FR-F44, FR-F45, FR-F46, FR-F47, FR-F48, FR-F49, FR-F50, FR-F51, FR-F52, FR-F53  
**NFRs:** NFR-F17, NFR-F18  
**UX:** `DESIGN-BRIEF-EPK13.html` (UX-DR13–18)  
**Referencia:** Sprint Change Proposal `sprint-change-proposal-2026-06-15-public-discovery-seo.md` (aprobado 2026-06-15)
>>>>>>> bfdee7e60122823fba43d4566c1f811eaebb1578

---

## Epic 1: Fundación Angular y Autenticación

El usuario puede registrarse, iniciar sesión, recuperar contraseña y acceder a rutas protegidas. La base técnica Angular queda lista para las features siguientes.

### Story 1.1: Estructura del proyecto, design system, layout y routing base

**Diseño de referencia:** `docs/project/colors_and_type.css`, `docs/README.md`, `Login.html`, `Perfil.html`, `wireframes.html`

Como desarrollador,
quiero la estructura de carpetas, tokens de diseño portados, layout shell y rutas lazy-loaded según arquitectura y prototipos,
para que las features implementen UI ya maquetada sin rediseñar desde cero.

**Acceptance Criteria:**

**Given** el scaffold Angular CLI existente y el handoff en `docs/project/`
**When** se organiza el proyecto
**Then** existen las carpetas `src/app/core/`, `features/`, `shared/`, `layout/` y `src/environments/` según §2 de arquitectura
**And** `environment.ts` y `environment.development.ts` exponen `apiUrl` y `recaptchaSiteKey`

**Given** `docs/project/colors_and_type.css`
**When** se configura el tema global
**Then** cada token CSS usado en la app coincide con los valores del fichero (hex, fuentes, sombras, radios — sin sustituciones)
**And** no se importa ninguna otra hoja de estilos de tema alternativo

**Given** `Login.html` y `Perfil.html` leídos en su totalidad
**When** se implementa layout shell y navegación
**Then** estructura, jerarquía visual y estilos coinciden con los prototipos (no layout genérico ni UI kit)
**And** las rutas de features usan lazy loading (`loadComponent` o `loadChildren`)

**Given** revisión de la historia
**When** se valida cumplimiento de diseño
**Then** un revisor puede contrastar pantalla Angular vs HTML de `docs/project/` sin desviaciones no acordadas

**Given** rutas públicas `/login`, `/register`, `/forgot-password`, `/reset-password`
**When** un usuario no autenticado las visita
**Then** las rutas cargan sin `AuthGuard`

**Given** rutas protegidas (feed, items, delivery, profile)
**When** se definen en `app.routes.ts`
**Then** están marcadas con `canActivate: [AuthGuard]` (guard implementado en historia 1.2)

---

### Story 1.2: Cliente API, sesión JWT e interceptores HTTP

Como desarrollador,
quiero el cliente OpenAPI configurado, `SessionService`, interceptores JWT y de errores,
para consumir el backend con tipos generados y proteger rutas autenticadas.

**Referencia obligatoria:** `docs/api-client.md`

**Acceptance Criteria:**

**Given** `provideApiClient()` registrado y `npm run api:generate` ejecutado
**When** una feature inyecta un servicio generado (p. ej. `ItemsService`)
**Then** las peticiones usan `environment.apiUrl` (base con sufijo `/api`)
**And** los métodos y DTOs provienen de `src/app/core/api/generated/` sin URLs ni tipos duplicados a mano

**Given** tipos en `core/api/generated/models`
**When** se importan en features
**Then** existen los modelos del contrato (`User`, `Item`, `ItemSummary`, `DeliverySession`, etc.) con los campos del OpenAPI actual (incl. `requestsPaused` en ítems donde aplique el spec)

**Given** un JWT válido en `localStorage`
**When** se realiza una petición autenticada
**Then** el interceptor JWT añade `Authorization: Bearer <token>`

**Given** el backend responde `401` en una petición no auth
**When** el interceptor procesa la respuesta
**Then** elimina el token vía `SessionService.clearToken()`
**And** redirige a `/login?returnUrl=<ruta actual codificada>`
**And** peticiones a `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password` con `401` no redirigen (credenciales incorrectas)

**Given** `SessionService` en `core/services/`
**When** se llama `setToken`, `getToken`, `clearToken`, `isAuthenticated`
**Then** persiste/lee/elimina token y evalúa expiración por claim `exp` del JWT decodificado (sin silent refresh)

**Given** `AuthGuard`
**When** el token está ausente o expirado
**Then** redirige a login con `returnUrl`
**When** el token es válido
**Then** permite la navegación

---

### Story 1.3: Registro de usuario

**Diseño de referencia:** `docs/project/Login.html`, `Onboarding.html`

Como visitante,
quiero registrarme con email, contraseña y código postal,
para obtener acceso a la plataforma.

**Acceptance Criteria:**

**Given** la ruta `/register`
**When** completo el formulario reactivo válido y reCAPTCHA V3
**Then** se llama `AuthService.authRegisterPost` (cliente generado) con `{ email, password, firstName, lastName, postalCode, phone?, recaptchaToken }`
**And** `firstName` / `lastName`: requeridos, mínimo 2 caracteres en cliente
**And** `phone`: opcional, texto libre, label i18n «Teléfono (opcional)» tras `postalCode`
**And** orden de campos: `firstName`, `lastName`, `email`, `password`, `postalCode`, `phone`
**And** ante `201` se guarda el JWT, se almacena el usuario en estado y se redirige al feed o `returnUrl`

**Given** email ya registrado (`409`)
**When** envío el formulario
**Then** se muestra mensaje de error claro sin revelar detalles internos del servidor

**Given** código postal no geocodificable (`400`) o reCAPTCHA bajo (`422`)
**When** envío el formulario
**Then** se muestran mensajes de error específicos por código HTTP

**Given** el formulario con campos inválidos
**When** intento enviar
**Then** los controles muestran errores de validación y no se envía la petición

**Given** la pantalla de registro
**When** un lector de pantalla la recorre
**Then** cumple WCAG AA (labels, focus, contraste) según NFR-F2

---

### Story 1.4: Internacionalización (es, ca, en)

**Investigación:** `_bmad-output/planning-artifacts/research/technical-i18n-hybrid-ssr-landing-research-2026-05-21.md`

**Diseño de referencia:** `docs/project/Landing Page.html`, `Login.html` (migración piloto registro), `colors_and_type.css`

Como visitante o usuario,
quiero elegir español, catalán o inglés,
para usar la interfaz en mi idioma.

**Acceptance Criteria (resumen):**

**Given** la app Angular 21 con Transloco (`es`, `ca`, `en`)
**When** el usuario cambia idioma
**Then** la UI actualiza sin recarga completa y persiste `rgl_locale`

**Given** rutas de landing `/`, `/en`, `/ca`
**When** se ejecuta build con prerender
**Then** solo esas rutas generan HTML estático por idioma; el resto de rutas usa render en cliente

**Given** `/register` migrado en esta historia
**When** cambio idioma
**Then** labels, errores cliente y mensajes mapeados de API usan claves i18n (no strings literales en template)

**Fuera de alcance:** traducir body de errores del backend; login completo (historia 1.5); onboarding completo.

---

### Story 1.5: Login y cierre de sesión

**Diseño de referencia:** `docs/project/Login.html`

Como usuario registrado,
quiero iniciar sesión y cerrar sesión,
para acceder y salir de forma segura.

**Acceptance Criteria:**

**Given** la ruta `/login`
**When** ingreso credenciales válidas y reCAPTCHA V3
**Then** se llama `AuthService.authLoginPost` y ante éxito se guarda JWT vía `SessionService` y se redirige a `returnUrl` o feed

**Given** credenciales inválidas (`401`)
**When** envío el formulario
**Then** se muestra mensaje genérico de credenciales incorrectas

**Given** reCAPTCHA score insuficiente (`422`)
**When** envío el formulario
**Then** se informa al usuario que debe reintentar la verificación

**Given** un usuario autenticado
**When** selecciona cerrar sesión
**Then** `AuthService.clearToken()` elimina el token y redirige a `/login`

**Given** la ruta `/login?returnUrl=/items/abc`
**When** el login es exitoso
**Then** navega a `/items/abc`

---

### Story 1.6: Recuperación y reset de contraseña

Como usuario,
quiero recuperar mi contraseña por email y establecer una nueva con el enlace,
para recuperar el acceso si la olvidé.

**Acceptance Criteria:**

**Given** la ruta `/forgot-password`
**When** ingreso un email válido y envío
**Then** se llama `AuthService.authForgotPasswordPost`
**And** siempre se muestra mensaje de éxito genérico (independiente de si el email existe)

**Given** la ruta `/reset-password?token=...`
**When** ingreso nueva contraseña válida y confirmación coincidente
**Then** se llama `AuthService.authResetPasswordPost` con `{ token, newPassword }`
**And** ante `200` se muestra confirmación y enlace a login

**Given** token inválido o expirado (`400`)
**When** envío el reset
**Then** se muestra error indicando que el enlace no es válido y opción de solicitar nuevo

**Given** campos de contraseña
**When** no cumplen política mínima definida en validadores
**Then** el formulario no se envía y muestra errores inline

---

## Epic 2: Publicación y Exploración de Objetos

El donante publica objetos; los usuarios exploran el catálogo geográfico y gestionan sus publicaciones.

### Story 2.1: Pipeline de compresión de imágenes en cliente

Como donante,
quiero que mis fotos se compriman automáticamente antes de subirlas,
para cumplir límites del backend sin intervención manual.

**Acceptance Criteria:**

**Given** un servicio `ImageCompressionService` en `core/` o `shared/`
**When** selecciono hasta 5 archivos de imagen
**Then** cada imagen se redimensiona a máximo 1200px por lado, convierte a WebP calidad 80%
**And** el resultado no supera 2MB por imagen

**Given** selecciono más de 5 imágenes
**When** intento añadirlas
**Then** la UI impide la selección y muestra límite máximo

**Given** un archivo que tras compresión sigue > 2MB
**When** se procesa
**Then** se muestra error al usuario indicando que debe elegir otra imagen

**Given** formatos no soportados
**When** el usuario los selecciona
**Then** se rechazan con mensaje claro antes del upload

---

### Story 2.2: Publicar objeto con formulario e imágenes

Como donante autenticado,
quiero publicar un objeto con datos e imágenes,
para ofrecerlo a la comunidad.

**Acceptance Criteria:**

**Given** la ruta `/items/new` (protegida)
**When** completo título, descripción, condición, `category`, `weightRange`, código postal del objeto y 1–5 imágenes comprimidas
**Then** se llama `ItemsService.itemsPost` con `multipart/form-data` (`FormData` + `PublishItemMultipart`) incluyendo `category` y `weightRange` (valores enum internos, no etiquetas visibles) y `images[]`
**And** `category` y `weightRange` son obligatorios — validación reactiva impide envío si faltan
**And** orden en paso 1 del formulario: `condition` → `category` → `weightRange` → `postalCode`
**And** ante `201` redirige al detalle del objeto o listado propio con mensaje de éxito

**Given** payload inválido o imagen > 2MB (`400`) o no autenticado (`401`)
**When** falla la publicación
**Then** se muestran errores apropiados sin perder datos del formulario ya válidos

**Given** el formulario
**When** faltan campos obligatorios
**Then** validación reactiva impide el envío

---

### Story 2.3: Listar objetos disponibles (feed geográfico)

Como usuario autenticado,
quiero ver objetos disponibles cerca de mí con paginación,
para descubrir qué puedo solicitar.

**Acceptance Criteria:**

**Given** la ruta `/items` (feed principal)
**When** cargo la página
**Then** se llama `GET /items?page=1&limit=20` y se renderiza lista con título, condición, distancia, imágenes (URLs directas), indicador si `degradedAt !== null`

**Given** hay más páginas según `pagination.totalPages`
**When** el usuario solicita siguiente página
**Then** se carga la página siguiente manteniendo orden (degradados al final según respuesta del backend)

**Given** la lista vacía
**When** no hay objetos en radio
**Then** se muestra estado vacío accesible (mensaje + posible CTA publicar)

**Given** error `401`
**When** el token expiró
**Then** el interceptor redirige a login

**Given** tarjetas de objeto
**When** uso `NgOptimizedImage` o img con alt text
**Then** imágenes tienen texto alternativo descriptivo (NFR-F2)

---

### Story 2.4: Ver detalle de objeto

Como usuario autenticado,
quiero ver el detalle completo de un objeto,
para decidir si solicitarlo o gestionarlo si soy el donante.

**Acceptance Criteria:**

**Given** la ruta `/items/:id`
**When** navego con UUID válido
**Then** `GET /items/:id` muestra título, descripción, condición, estado, `requestsPaused`, `degradedAt`, distancia, imágenes, donante (`id`, `reputationScore`) y la etiqueta visible de `category` (mapeo cliente desde enum)
**And** `weightRange` no se renderiza en ningún elemento de la UI

**Given** el usuario autenticado es el donante del objeto
**When** ve el detalle
**Then** no se muestra botón de solicitar; sí acciones de gestión (cancelar, pausar — historias 2.5/2.6, candidatos en épica 3)

**Given** el usuario no es donante y `status === 'active'` y `requestsPaused === false`
**When** ve el detalle
**Then** se muestra botón solicitar (habilitado en épica 3)

**Given** objeto no encontrado (`404`)
**When** cargo la ruta
**Then** pantalla de error 404 amigable

**Given** `reputationScore` negativo del donante
**When** se renderiza
**Then** se muestra el valor numérico real sin truncar a cero

---

### Story 2.5: Cancelar objeto propio (sin sesión activa)

Como donante,
quiero cancelar un objeto que publiqué cuando no hay entrega en curso,
para retirarlo del sistema.

**Acceptance Criteria:**

**Given** soy donante del objeto sin sesión activa visible en UI
**When** confirmo cancelación en diálogo accesible
**Then** se envía `DELETE /items/:id` y ante `200` actualizo vista o redirijo con mensaje de éxito

**Given** no soy donante (`403`)
**When** intento cancelar
**Then** mensaje de error genérico

**Given** objeto no encontrado (`404`) o no autenticado (`401`)
**When** falla
**Then** manejo de error coherente con el resto de la app

> Nota: cancelación con sesión activa se completa en Historia 4.5.

---

### Story 2.6: Pausar y reanudar solicitudes de un objeto

Como donante,
quiero pausar temporalmente las solicitudes de mi objeto activo,
para controlar cuándo acepto candidatos.

**Acceptance Criteria:**

**Given** soy donante y `status === 'active'`
**When** veo el detalle o listado de mis objetos
**Then** aparece toggle de pausa visible solo en ese estado

**Given** activo el toggle a pausado
**When** confirmo
**Then** `PATCH /items/:id/pause` con `{ paused: true }` y UI refleja `requestsPaused: true`

**Given** desactivo la pausa
**When** confirmo
**Then** `PATCH` con `{ paused: false }` y UI actualiza

**Given** objeto no activo (`409`) o no soy donante (`403`)
**When** intento cambiar pausa
**Then** mensaje de error apropiado

**Given** listado `GET /users/me/items` del donante
**When** `requestsPaused === true`
**Then** indicador visual de bloqueo identificable de un vistazo

---

## Epic 3: Solicitudes y Selección de Candidatos

Receptores solicitan objetos; donantes revisan ranking y eligen receptor.

### Story 3.1: Solicitar un objeto desde el detalle

Como receptor autenticado,
quiero solicitar un objeto que me interesa,
para entrar en el ranking del donante.

**Acceptance Criteria:**

**Given** detalle de objeto ajeno, `active`, `requestsPaused === false`
**When** pulso solicitar y confirmo
**Then** `ItemsService.itemsIdRequestsPost` sin body y ante éxito muestra confirmación y deshabilita nueva solicitud

**Given** intento solicitar mi propio objeto
**When** la UI lo permite por error
**Then** el botón no está disponible; si API devuelve `400`, mensaje claro

**Given** solicitud duplicada o límite 3/30 días (`409` con código/mensaje de límite)
**When** falla
**Then** mensaje distingue límite alcanzado vs duplicada según `error`/`code` del body

**Given** `requestsPaused === true` (`409` con código/mensaje de pausa)
**When** falla
**Then** mensaje explícito: solicitudes temporalmente pausadas por el donante (FR-F12)

**Given** no autenticado (`401`)
**When** solicito
**Then** redirección a login

---

### Story 3.2: Ver candidatos rankeados (vista donante)

Como donante,
quiero ver los candidatos ordenados por el sistema para mi objeto,
para elegir al receptor adecuado.

**Acceptance Criteria:**

**Given** soy donante del objeto en ruta `/items/:id/candidates`
**When** cargo la vista
**Then** `GET /items/:id/requests` lista candidatos con `requestId`, `userId`, `reputationScore`, `distanceMeters`, `requestDate`
**And** el orden refleja el del backend (reputación, distancia, antigüedad)

**Given** no soy donante (`403`)
**When** accedo a la ruta
**Then** mensaje de acceso denegado o redirección

**Given** lista vacía
**When** no hay solicitudes
**Then** estado vacío con guía para esperar solicitudes o pausar objeto

**Given** un candidato en la lista
**When** selecciono acción elegir
**Then** navega al flujo de selección (historia 3.3)

---

### Story 3.3: Seleccionar receptor con canal de contacto

Como donante,
quiero seleccionar un candidato e indicar mi canal de contacto,
para iniciar la sesión de entrega.

**Acceptance Criteria:**

**Given** formulario de selección con `contactChannel` obligatorio
**When** envío con `requestId` válido
**Then** `ItemsService` método de selección de receptor (p. ej. `itemsIdRequestsRequestIdSelectPost`) con `{ contactChannel }`
**And** ante `200` muestra `sessionId`, `deadlineAt` y navega al detalle de sesión

**Given** payload inválido (`400`), no donante (`403`) o no encontrado (`404`)
**When** falla
**Then** errores inline o toast accesible

**Given** selección exitosa
**When** el objeto pasa a `reserved`
**Then** la UI del objeto refleja el nuevo estado al volver al detalle

---

## Epic 4: Sesiones de Entrega

Gestión del ciclo de entrega por donante y receptor.

> **Correct Course 2026-05-23:** La UI canónica de entregas es **una sola pantalla** (`/entregas`, split listado + panel detalle) según `Entregas.html` y UX-DR7. El detalle **no** es una página independiente. Ver `planning-artifacts/sprint-change-proposal-2026-05-23.md`. Implementar **4.4 antes** de cerrar 4.2/4.3 en contexto Entregas.

### Story 4.1: Ver detalle de sesión de entrega

Como donante o receptor,
quiero ver el estado y datos de mi sesión de entrega,
para coordinar la entrega.

**Acceptance Criteria:**

**Given** la pantalla `/entregas` con una sesión seleccionada en el listado (layout split `Entregas.html`)
**When** soy participante y el panel de detalle carga
**Then** **un solo** `GET /delivery-sessions/:id` muestra id, itemId, status, deadlineAt, donorConfirmed, noShowDeclared, fechas, `role`, `item`, `otherParty`

**Given** deep link `/entregas/:id` con UUID válido
**When** cargo la ruta
**Then** se muestra la **misma** vista `/entregas` con esa sesión preseleccionada (no una pantalla full-page distinta)

**Given** el backend devuelve `contactChannel` con valor no nulo
**When** soy receptor y veo el detalle en el panel
**Then** se renderiza el canal de contacto (SEC-002: sin lógica extra de visibilidad en frontend)

**Given** `contactChannel` es `null`
**When** veo el detalle en el panel
**Then** se muestra como no disponible

**Given** no participante (`403`) o no encontrada (`404`)
**When** accedo al panel
**Then** manejo de error apropiado

**Given** sesión `active` y soy donante
**When** veo acciones en el panel
**Then** botones confirmar y cancelar visibles (historias 4.2, 4.3)

**Nota de implementación:** La lógica de `entrega-detalle` (4.1 done) se **reutiliza como panel** dentro de la pantalla 4.4; no mantener dos UIs de detalle.

---

### Story 4.2: Confirmar entrega completada

Como donante,
quiero confirmar que la entrega se completó,
para cerrar la sesión y actualizar reputación.

**Acceptance Criteria:**

**Given** sesión en estado `active` y soy donante
**When** confirmo en diálogo de confirmación accesible
**Then** `DeliveryService.deliverySessionsIdConfirmPost` sin body
**And** ante `200` la UI muestra `status: completed` y `completedAt`

**Given** sesión no activa (`409`) o no soy donante (`403`)
**When** intento confirmar
**Then** mensaje de error claro

**Given** confirmo desde la pantalla Entregas
**When** completo el flujo
**Then** la acción ocurre en el **panel de detalle** de `/entregas` con `ConfirmModal` del prototipo (sin navegar a otra ruta hija)

**Dependencia UX:** Cierre «done» de 4.2 en flujo Entregas requiere **4.4** (split layout). El flujo en `mis-objetos` puede validarse en paralelo.

---

### Story 4.3: Cancelar sesión con declaración de no-show

Como donante,
quiero cancelar la sesión y opcionalmente declarar que el receptor no se presentó,
para cerrar el proceso y aplicar consecuencias si corresponde.

**Acceptance Criteria:**

**Given** sesión `active` y soy donante
**When** cancelo con checkbox opcional "receptor no se presentó"
**Then** `DeliveryService.deliverySessionsIdCancelPost` con `{ noShow: boolean }`
**And** ante `200` UI refleja `cancelled` y `noShowDeclared`

**Given** sesión no activa (`409`)
**When** cancelo
**Then** error apropiado

**Given** cancelación exitosa
**When** vuelvo al objeto asociado
**Then** el objeto aparece como `active` nuevamente en datos refrescados

**Given** cancelo desde la pantalla Entregas
**When** completo el flujo
**Then** la acción ocurre en el **panel de detalle** de `/entregas` con `CancelModal` del prototipo (sin navegar a otra ruta hija)

**Dependencia UX:** Implementar tras **4.4** (panel en `/entregas`).

---

### Story 4.4: Pantalla Entregas (listado + detalle inline)

Como usuario autenticado (donante o receptor),
quiero ver y gestionar mis sesiones de entrega en una sola pantalla,
para seguir el flujo del prototipo `Entregas.html` (UX-DR7).

**Acceptance Criteria:**

**Given** la ruta canónica `/entregas` (protegida, AppShell)
**When** cargo la pantalla
**Then** layout **split** según `Entregas.html`: cabecera, `RoleTabs` (donante/receptor con contadores), listado a la izquierda, panel de detalle a la derecha al seleccionar

**Given** cargo sin sesión seleccionada y hay sesiones en el listado
**When** veo la UI
**Then** hint «Selecciona una sesión para ver los detalles» (o clave i18n equivalente) y **sin** panel de detalle vacío tipo página nueva

**Given** el listado
**When** se renderiza
**Then** `GET /users/me/delivery-sessions` con paginación; secciones **Activas** e **Historial**; **NO** se muestra `contactChannel` en filas

**Given** filtros UI de `role` y `status` (si el prototipo los incluye o tabs de rol)
**When** el usuario los aplica
**Then** la query refleja parámetros válidos del contrato API

**Given** clic en una fila del listado
**When** selecciono la sesión
**Then** el panel de detalle carga con **un solo** `GET /delivery-sessions/:id` (reutilizar lógica/UI 4.1 como panel, no full-page)

**Given** deep link `/entregas/:id`
**When** cargo con UUID válido
**Then** misma vista `/entregas` con esa sesión **preseleccionada** (misma shell split)

**Given** breakpoint móvil del prototipo (`Entregas.html`)
**When** hay sesión seleccionada
**Then** panel detalle como slide-over full-screen según CSS del handoff

**Given** el nav «Entregas»
**When** navego
**Then** abre esta pantalla funcional (no stub con solo título)

**Given** enlace desde Mis objetos tras selección de receptor (3.3)
**When** pulso «Ver sesión de entrega»
**Then** navega a `/entregas/:sessionId` y muestra la sesión en el split (no layout ajeno al prototipo)

**Prioridad:** **Bloqueante** para cerrar 4.2/4.3 en contexto Entregas. Sustituye el alcance anterior «solo listado en perfil».

---

### Story 4.5: Cancelar objeto con sesión activa

Como donante,
quiero cancelar mi objeto aunque tenga una entrega en curso,
para retirarlo cuando ya no puedo completar la entrega.

**Acceptance Criteria:**

**Given** mi objeto tiene sesión activa
**When** confirmo cancelación del objeto en UI con advertencia explícita
**Then** `DELETE /items/:id` se ejecuta (backend cancela sesión y notifica receptor)
**And** ante `200` mensaje de éxito y actualización de estados

**Given** la advertencia de cancelación con sesión activa
**When** el usuario la ve
**Then** explica que la entrega en curso se cancelará (copy claro, accesible)

**Given** errores `403`/`404`/`401`
**When** falla
**Then** manejo coherente con historia 2.5

---

## Epic 5: Perfil y Actividad del Usuario

Consulta de perfil propio, actividad e historial; perfiles públicos de otros usuarios.

### Story 5.1: Ver perfil privado

Como usuario autenticado,
quiero ver mi perfil con métricas clave,
para entender mi posición en el sistema.

**Acceptance Criteria:**

**Given** la ruta `/profile`
**When** cargo la página
**Then** `GET /users/me` muestra firstName, lastName, avatarUrl (imagen o iniciales), phone, postalCode, preferredLanguage, emailVerified, reputationScore, totalReceived, totalDonated, consecutiveNoShows, createdAt
**And** el nombre visible deriva de firstName + lastName (no del local-part del email)

**Given** `reputationScore` negativo
**When** se renderiza
**Then** se muestra valor real (NFR-F7)

**Given** no autenticado
**When** accedo
**Then** redirección a login

---

### Story 5.2: Ver historial de reputación

Como usuario autenticado,
quiero ver mis eventos de reputación,
para entender cómo cambió mi score.

**Acceptance Criteria:**

**Given** sección o ruta `/profile/reputation`
**When** cargo
**Then** `GET /users/me/reputation-history` lista eventos con type, delta, sessionId, createdAt

**Given** evento `no_show` con delta negativo acumulativo
**When** se muestra
**Then** el delta se presenta claramente (ej. -20, -40)

**Given** lista vacía
**When** no hay eventos
**Then** estado vacío informativo

---

### Story 5.3: Ver mis objetos publicados

Como donante,
quiero listar los objetos que publiqué filtrados por estado,
para gestionar mi actividad como donante.

**Acceptance Criteria:**

**Given** ruta `/profile/items`
**When** cargo con paginación
**Then** `GET /users/me/items` con filtros opcionales `status`, `page`, `limit`

**Given** cada ítem con `requestsPaused === true`
**When** se lista
**Then** indicador visual de pausa (coherente con 2.6)

**Given** clic en un ítem
**When** navego
**Then** abre detalle o acciones de gestión según estado

---

### Story 5.4: Ver mis solicitudes realizadas

Como receptor,
quiero ver las solicitudes que hice y su estado,
para seguir objetos que me interesan.

**Acceptance Criteria:**

**Given** ruta `/profile/requests`
**When** cargo
**Then** `GET /users/me/requests` lista con itemTitle, itemStatus, status de solicitud, createdAt

**Given** filtro por `status` (pending, selected, rejected, cancelled)
**When** usuario filtra
**Then** query params válidos enviados al API

**Given** solicitud `selected`
**When** veo la fila
**Then** enlace a sesión de entrega si aplica

---

### Story 5.5: Ver perfil público de otro usuario

Como usuario autenticado,
quiero ver el perfil público de otro participante,
para evaluar fiabilidad antes o después de una interacción.

**Acceptance Criteria:**

**Given** ruta `/users/:id` desde detalle de objeto o candidatos
**When** cargo UUID válido
**Then** `GET /users/:id` muestra firstName, lastName, avatarUrl, reputationScore, totalReceived, totalDonated, createdAt
**And** se usa el tipo `PublicProfile` del cliente generado (no `User` parcial)

**Given** la respuesta del API
**When** se renderiza
**Then** NO se muestran email, consecutiveNoShows ni requestsPaused

**Given** usuario no encontrado (`404`)
**When** cargo
**Then** pantalla de error apropiada

**Given** enlace desde candidato rankeado
**When** navego al perfil público
**Then** puedo volver al contexto anterior

---

## Epic 6: Alineación modelo de usuario (DLT-003 — frontend)

Delta: `docs/delta-frontend-DLT-003_2.md` · Propuesta: `sprint-change-proposal-2026-05-25-DLT-003_2.md`

### Story 6-f1: Regenerar cliente OpenAPI y architecture v1.3

Como desarrollador frontend,
quiero el cliente API y `docs/architecture.md` alineados con DLT-003,
para implementar el resto de historias sin tipos obsoletos.

**Acceptance Criteria:**

**Given** `../backend/openapi/openapi.json` con campos DLT-003
**When** ejecuto `npm run api:generate`
**Then** modelos generados incluyen `firstName`, `lastName`, `avatarUrl`, `phone`, `preferredLanguage`, `emailVerified` en perfiles y registro
**And** existe operación generada para `PATCH /users/me`

**Given** el delta aprobado
**When** actualizo `docs/architecture.md`
**Then** versión 1.3 con contratos §4–5 y reglas de presentación del delta

---

### Story 6-f2: Registro con firstName, lastName y phone (retrofit 1.3)

**Diseño de referencia:** `docs/project/Login.html` (extensión de formulario registro)

Como visitante,
quiero registrarme con nombre y teléfono opcional,
para cumplir el contrato de alta del backend.

**Acceptance Criteria:**

**Given** la ruta `/register`
**When** completo el formulario con firstName, lastName, email, password, postalCode y opcionalmente phone
**Then** el payload enviado incluye todos los campos según OpenAPI
**And** validación cliente: firstName/lastName mín. 2 caracteres; phone sin formato obligatorio

**Given** registro exitoso (`201`)
**When** se guarda sesión
**Then** el usuario en estado incluye firstName y lastName del response

---

### Story 6-f3: Regla de avatar compartida (retrofit 2.x–4.x, shell)

Como usuario,
quiero ver avatares coherentes (foto o iniciales del nombre),
en perfil, candidatos, entregas y navegación.

**Acceptance Criteria:**

**Given** `avatarUrl !== null`
**When** se renderiza un avatar de usuario
**Then** se muestra `<img [src]="avatarUrl">` con `NgOptimizedImage` donde aplique

**Given** `avatarUrl === null` y firstName/lastName disponibles
**When** se renderiza
**Then** iniciales = `firstName[0]` + `lastName[0]` en mayúsculas, estilo mockups

**Given** puntos: perfil propio, perfil público, `candidate-row`, `item-donor-row`, `entrega-detalle`, `app-shell`
**When** se revisa la UI
**Then** todos usan el helper/componente compartido (no `initialsFromUserId` salvo fallback documentado)

---

### Story 6-f4: Perfil privado y público con campos DLT-003 (retrofit 5.1, 5.5)

**Diseño de referencia:** `docs/project/Perfil.html`, `Explorar v3.html`

Como usuario,
quiero ver nombre y avatar correctos en mi perfil y en perfiles públicos,
para identificar participantes con fiabilidad.

**Acceptance Criteria:**

**Given** `/profile` con `GET /users/me`
**When** cargo
**Then** cumple AC actualizados de Story 5.1 (campos DLT-003)

**Given** `/users/:id`
**When** cargo perfil público
**Then** cumple AC actualizados de Story 5.5 (firstName, lastName, avatarUrl)

---

### Story 6-f5: PATCH /users/me — configuración, aviso postal y re-login

**Diseño de referencia:** `docs/project/Perfil.html` (SettingsTab)

Como usuario autenticado,
quiero editar mi perfil desde la pestaña configuración,
para mantener mis datos al día.

**Acceptance Criteria:**

**Given** tab `configuracion` en `/profile`
**When** edito firstName, lastName, avatarUrl, phone, postalCode o preferredLanguage
**Then** `UsersService` PATCH parcial con campos válidos; éxito actualiza estado local

**Given** el usuario modifica `postalCode`
**When** el formulario muestra el campo
**Then** aviso inline visible (no modal): cambiar CP cerrará la sesión y requerirá login de nuevo

**Given** PATCH exitoso que cambió `postalCode`
**When** la siguiente petición autenticada devuelve `401`
**Then** interceptor redirige a `/login?returnUrl=/profile` (o ruta canónica acordada para volver a configuración)

**Given** error `400` por CP no geocodificable
**When** guardo
**Then** mensaje de error i18n; no se pierden otros campos del formulario

---

## Epic 7-f: Alineación analítica en ítems (DLT-004 — frontend)

Delta de diseño DLT-004 incorporado en `docs/architecture.md` v1.4 y `docs/delta-frontend-DLT-004.md`. Retrofit de publicación y detalle sin reabrir entradas `done` en el tracker principal.

> **Coordinación backend:** historia **7.7** — exponer `category` (y `weightRange` en contrato) en `GET /items`, `GET /items/:id`, `GET /users/me/items` + OpenAPI. **7-f4** y **7-f5** dependen de ello.

### Story 7-f1: Regenerar cliente OpenAPI y architecture v1.4

Como desarrollador frontend,
quiero el cliente API y la documentación de arquitectura alineados con DLT-004,
para implementar las historias siguientes contra contratos correctos.

**Acceptance Criteria:**

**Given** `../backend/openapi/openapi.json` actualizado (incl. GET con `category` cuando exista 7.7)
**When** ejecuto `npm run api:generate`
**Then** `PublishItemMultipart` incluye `category` y `weightRange` requeridos
**And** modelos de respuesta de ítem incluyen `category` cuando el OpenAPI lo define

**Given** `docs/architecture.md`
**When** reviso la cabecera y §4–§6
**Then** versión **1.4** con contratos y reglas DLT-004 (sin depender solo del fichero delta)

---

### Story 7-f2: Publicar — selectores category y weightRange (retrofit 2.2)

**Diseño de referencia:** `docs/project/Mis objetos.html` (modal/paso publicar)

Como donante autenticado,
quiero elegir categoría y rango de peso al publicar,
para que los datos analíticos sean correctos.

**Acceptance Criteria:**

**Given** el formulario en `/items/new` paso 1
**When** completo el flujo
**Then** existen selectores accesibles para `category` y `weightRange` tras `condition` y antes de `postalCode`
**And** el payload POST usa valores elegidos por el usuario (no literales fijos `other`/`lt1`)
**And** cumple AC actualizados de Story 2.2

---

### Story 7-f3: Utilidad item-category e i18n

Como desarrollador,
quiero un mapa centralizado de enums a etiquetas i18n,
para reutilizar en publicación, detalle y listados.

**Acceptance Criteria:**

**Given** un valor `ItemCategory` o `ItemWeightRange`
**When** la UI necesita etiqueta visible
**Then** existe utilidad (p. ej. `item-category-label.util.ts`) y claves en `es.json`, `ca.json`, `en.json`
**And** los valores enviados al API siguen siendo enums internos

---

### Story 7-f4: Detalle — mostrar categoría (retrofit 2.4)

**Diseño de referencia:** `docs/project/Explorar v3.html`

Como usuario autenticado,
quiero ver la categoría del objeto en el detalle,
para contextualizar la oferta.

**Acceptance Criteria:**

**Given** `GET /items/:id` devuelve `category`
**When** cargo el detalle (`item-detail-panel` o ruta `/items/:id`)
**Then** se muestra la etiqueta visible de categoría
**And** `weightRange` no aparece en la UI
**And** cumple AC actualizados de Story 2.4

---

### Story 7-f5: Mis objetos — etiqueta categoría opcional (retrofit 5.3)

**Diseño de referencia:** `docs/project/Mis objetos.html`

Como donante,
quiero ver opcionalmente la categoría en mis tarjetas de objeto,
para gestionar mi inventario.

**Acceptance Criteria:**

**Given** `GET /users/me/items` devuelve `category`
**When** listo mis objetos
**Then** puedo mostrar etiqueta de categoría en tarjeta (opcional MVP — a criterio de implementación)
**And** `weightRange` no se muestra

---

## Epic 8-f: Verificación de email (DLT-email-verification)

Implementa el flujo completo de verificación de email en el registro de usuario, alineando el frontend con los nuevos endpoints y reglas del backend (EVT-014, TPL-009).

### Story 8-f1: Regenerar cliente OpenAPI y architecture v1.5

Como desarrollador frontend,
quiero el cliente API y la documentación de arquitectura alineados con DLT-email-verification,
para implementar las historias siguientes contra contratos correctos.

**Acceptance Criteria:**

**Given** `../backend/openapi/openapi.json` actualizado con los nuevos endpoints y `emailVerified`
**When** ejecuto `npm run api:generate`
**Then** el modelo de usuario generado incluye `emailVerified: boolean`
**And** existen operaciones generadas para `GET /auth/verify-email` y `POST /auth/resend-verification`

**Given** el delta aprobado (`docs/delta-frontend-email-verification.md`)
**When** actualizo `docs/architecture.md`
**Then** versión **1.5** con §2 (carpetas `verify-email/` y `verification-pending/`), §4 (tres nuevos contratos), §5 (User.emailVerified) y §6 (cinco nuevas reglas de presentación)

---

### Story 8-f2: Pantalla `/verificacion-pendiente`

**Diseño de referencia:** `docs/project/Login.html` (patrones módulo auth)

Como usuario recién registrado o redirigido por email no verificado,
quiero ver una pantalla que me informe que debo verificar mi email y me permita reenviar el enlace,
para completar el proceso de verificación.

**Acceptance Criteria:**

**Given** la ruta `/verificacion-pendiente` (pública — no requiere `emailVerified`)
**When** cargo la pantalla
**Then** se muestra mensaje informativo que indica la necesidad de verificar el email antes de continuar

**Given** el botón "Reenviar email de verificación"
**When** el usuario lo pulsa
**Then** se llama `POST /auth/resend-verification` (servicio generado) con el JWT del `localStorage`
**And** ante respuesta 200, el botón se deshabilita durante 30 segundos con cuenta regresiva visible

**Given** respuesta 429 con header `Retry-After`
**When** el servidor responde al reenvío
**Then** el cooldown usa el valor del header `Retry-After` en lugar de los 30 s por defecto

**Given** email ya verificado (409)
**When** el usuario pulsa reenviar
**Then** mensaje informativo que indica que el email ya está verificado, con enlace a `/login`

**Given** JWT ausente o inválido (401)
**When** el usuario pulsa reenviar
**Then** el interceptor limpia el token y redirige a `/login`

**Given** la pantalla
**When** un lector de pantalla la recorre
**Then** cumple WCAG AA (labels, focus, contraste)
**And** todas las cadenas visibles usan claves i18n (`auth.verificationPending.*`)

---

### Story 8-f3: Pantalla `/verificar-email` (procesamiento del token)

**Diseño de referencia:** `docs/project/Login.html` (patrones módulo auth)

Como usuario que pulsa el enlace del email de verificación,
quiero que el token sea procesado automáticamente y ser redirigido al resultado correcto,
para completar la verificación sin pasos manuales.

**Acceptance Criteria:**

**Given** la ruta `/verificar-email?token=<token>` (pública, no requiere auth)
**When** el componente inicializa
**Then** extrae el parámetro `token` del query string y llama `GET /auth/verify-email?token=<token>` (servicio generado)
**And** muestra un indicador de carga mientras se resuelve la petición

**Given** respuesta 200 de la verificación
**When** se procesa el resultado
**Then** redirige a `/login` con mensaje de confirmación visible ("Tu email ha sido verificado. Ya puedes iniciar sesión.")
**And** el mensaje se muestra en la pantalla de login (via query param o state de navegación)

**Given** respuesta 400 (token inválido o expirado)
**When** se procesa el error
**Then** muestra mensaje de error ("El enlace no es válido o ha expirado.")
**And** ofrece enlace a `/verificacion-pendiente` para solicitar un nuevo enlace

**Given** ausencia de `token` en el query param
**When** el componente inicializa
**Then** trata el caso como token inválido y muestra el mismo error de respuesta 400

**Given** la pantalla
**When** un lector de pantalla la recorre
**Then** cumple WCAG AA; claves i18n `auth.verifyEmail.*`

---

### Story 8-f4: Retrofit interceptor 403 + `AuthGuard` `emailVerified` (retrofit 1.2)

Como desarrollador,
quiero que el interceptor HTTP gestione el código `EMAIL_NOT_VERIFIED` y que `AuthGuard` verifique `emailVerified`,
para impedir el acceso a rutas protegidas a usuarios con email no verificado.

**Acceptance Criteria:**

**Given** una petición autenticada devuelve 403 con `{ "code": "EMAIL_NOT_VERIFIED" }` en el body
**When** el interceptor HTTP procesa la respuesta
**Then** **no** elimina el token de `localStorage` via `SessionService`
**And** redirige a `/verificacion-pendiente`

**Given** una petición devuelve 403 con un código diferente a `EMAIL_NOT_VERIFIED`
**When** el interceptor lo procesa
**Then** mantiene el comportamiento previo (no redirige a `/verificacion-pendiente`)

**Given** `AuthGuard` en una ruta protegida
**When** el usuario tiene JWT válido pero `emailVerified === false` en el estado de la aplicación
**Then** redirige a `/verificacion-pendiente` sin intentar cargar la ruta

**Given** `AuthGuard`
**When** el usuario tiene JWT válido y `emailVerified === true`
**Then** permite la navegación a la ruta protegida (comportamiento previo sin cambio)

**Given** historia 1.2
**When** se revisa post-retrofit
**Then** nota de retrofit añadida al archivo de story; AC 1.2 reflejan comportamiento actualizado

---

### Story 8-f5: Retrofit registro → redirect a `/verificacion-pendiente` (retrofit 1.3)

Como visitante que completa el registro,
quiero ser redirigido a la pantalla de verificación pendiente tras el registro,
para ser guiado a verificar mi email.

**Acceptance Criteria:**

**Given** formulario de registro completado con datos válidos
**When** `POST /auth/register` devuelve 201
**Then** el JWT se almacena en `localStorage` via `SessionService`
**And** el usuario (incluyendo `emailVerified: false`) se almacena en el estado de la aplicación
**And** la navegación va a `/verificacion-pendiente` — no al feed ni a `returnUrl`

**Given** historia 1.3
**When** se revisa post-retrofit
**Then** nota de retrofit añadida; AC 1.3 actualizado: "ante 201 redirige a `/verificacion-pendiente`"

---

## Epic 9: Gestión de consentimiento de cookies (OSS)

Implementa el gestor de cookies del MVP con opción open source, consentimiento por categorías y bloqueo previo de scripts no esenciales.

**Restricción UX bloqueante:** toda la UI legal/cookies debe mantener fidelidad con `docs/project/Política de privacidad.html` y `docs/project/Política de cookies.html`. El acceso persistente a preferencias se integra en el **footer ya existente** de esas páginas (sin rediseñar ni sustituir footer).

### Story 9-f1: Integrar librería OSS y capa de dominio de consentimiento

Como desarrollador frontend,  
quiero integrar `@orestbida/cookieconsent` mediante un `CookieConsentService`,  
para desacoplar la librería de la lógica de negocio y facilitar mantenimiento.

**Acceptance Criteria:**

**Given** el arranque de la app  
**When** se inicializa consentimiento  
**Then** se usa `@orestbida/cookieconsent` con configuración centralizada y `policyVersion`
**And** existe `CookieConsentService` en `core/services/` con API para consultar y actualizar consentimiento por categoría.

---

### Story 9-f2: Banner y panel de preferencias con categorías

Como usuario,  
quiero decidir mis preferencias de cookies desde un banner y un panel de configuración,  
para controlar qué cookies no esenciales acepto.

**Acceptance Criteria:**

**Given** primera visita sin consentimiento previo  
**When** se muestra la primera capa  
**Then** existen acciones `Aceptar todo`, `Rechazar no esenciales`, `Configurar`
**And** el panel permite categorías `necessary` (siempre activa), `analytics`, `marketing` y `preferences` (opcional).

---

### Story 9-f3: Gating de scripts no esenciales

Como equipo de producto,  
quiero bloquear scripts no esenciales hasta consentimiento explícito,  
para cumplir requisitos de privacidad en España/UE.

**Acceptance Criteria:**

**Given** usuario sin consentimiento para categorías opcionales  
**When** la app carga  
**Then** scripts/cookies de analítica y marketing no se ejecutan
**And** al cambiar consentimiento, el estado de carga de scripts se actualiza de forma coherente.

---

### Story 9-f4: Acceso persistente en footer legal existente

Como usuario,  
quiero reabrir la configuración de cookies en cualquier momento,  
para revocar o ajustar consentimiento sin fricción.

**Acceptance Criteria:**

**Given** páginas legales maquetadas de referencia  
**When** se integra el acceso persistente  
**Then** se reutiliza el footer ya definido en `Política de privacidad.html` y `Política de cookies.html`
**And** no se crea un footer alternativo ni se rompe la maquetación existente.

---

### Story 9-f5: QA funcional, accesibilidad y evidencia de cumplimiento

Como equipo de desarrollo,  
quiero validar el flujo de cookies con pruebas automáticas y checklist de accesibilidad,  
para asegurar funcionamiento y trazabilidad.

**Acceptance Criteria:**

**Given** pruebas de frontend (unit/integration/e2e)  
**When** se ejecutan los escenarios de consentimiento y legal pages  
**Then** cubren primera decisión, rechazo, aceptación, edición posterior y persistencia
**And** verifican que no se disparan scripts no esenciales antes del consentimiento
**And** verifican paridad estructural mínima de `politica-privacidad` y `politica-cookies` con `docs/project/*`:

- header legal con metadatos de vigencia/actualización
- índice de contenidos con anchors
- secciones completas definidas por la especificación
- tablas/bloques informativos requeridos
**And** el flujo completo (banner/panel/legal pages) cumple WCAG AA en interacciones clave.

> **Correct Course 2026-05-28:** AC ampliados tras detectar brecha entre implementación legal resumida y handoff completo (`sprint-change-proposal-2026-05-28-legal-alignment.md`).

---

### Story 9-f6: Refactor legal pages a estructura documental completa

**Diseño de referencia:** `docs/project/Política de privacidad.html`, `docs/project/Política de cookies.html`

Como usuario,  
quiero consultar políticas de privacidad y cookies completas y estructuradas,  
para entender de forma transparente el tratamiento de datos y preferencias.

**Acceptance Criteria:**

**Given** las rutas `/politica-privacidad` y `/politica-cookies`  
**When** cargo cualquiera de las dos páginas  
**Then** la UI reproduce la estructura documental completa definida en el HTML de referencia correspondiente (header legal, info-box, índice, secciones numeradas, tablas/bloques, contacto)

**Given** `legal-pages.component.html` y `legal-pages.component.scss`  
**When** se compara con `docs/project/Política de privacidad.html` y `docs/project/Política de cookies.html`  
**Then** la maquetación es pixel-faithful (tipografía, espaciado, jerarquía, responsive) sin reinterpretar el diseño

**Given** el footer legal compartido  
**When** navego por las páginas legales  
**Then** se mantiene el footer existente y la acción persistente de reabrir preferencias de cookies

**Referencia:** Correct Course `sprint-change-proposal-2026-05-28-legal-alignment.md` (aprobado 2026-05-28)

---

### Story 9-f7: Alinear contenido legal i18n con implementación real de consentimiento

Como equipo de producto,  
quiero que el contenido legal publicado sea consistente con el comportamiento técnico real,  
para reducir riesgo de incumplimiento por discrepancia copy↔sistema.

**Acceptance Criteria:**

**Given** `public/i18n/{es,ca,en}.json` bajo claves `legal.*`  
**When** se publican las políticas  
**Then** contienen las secciones legales completas requeridas por el handoff (no resúmenes de 3 bloques)

**Given** el texto de cookies en i18n  
**When** se contrasta con `CookieConsentService`  
**Then** las categorías declaradas (`necessary`, `analytics`, `marketing`, `preferences`), defaults y `policyVersion` coinciden con el comportamiento real

**Given** revisión de cumplimiento  
**When** se valida la entrega  
**Then** existe checklist de trazabilidad claim legal ↔ evidencia técnica (tabla o documento en story file)

**Referencia:** Correct Course `sprint-change-proposal-2026-05-28-legal-alignment.md` (aprobado 2026-05-28)

---

---

## Epic 10-f: Canal de contacto receptor en solicitud (DLT-candidato-contacto — frontend)

Alinea el flujo de solicitud de objetos y el detalle de sesión de entrega con el contrato backend DLT-candidato-contacto (`docs/delta-frontend-DLT-candidato-contacto.md`, `architecture.md` v1.6). Retrofit de stories 3.1 y 4.1 ya cerradas.  
**FRs cubiertos:** FR-F42, FR-F43 (amplía FR-F11 y FR-F15)  
**UX:** `Detalle de item.html` + `ItemDetail.jsx` (RequestSheet), `Entregas.html` (CoordinationBlock con receiver)  
**Referencia:** Correct Course `sprint-change-proposal-2026-06-01-DLT-candidato-contacto.md` (aprobado 2026-06-01)

### Story 10-f1: Regenerar cliente OpenAPI y architecture v1.6

Como desarrollador frontend,
quiero el cliente API y `docs/architecture.md` alineados con DLT-candidato-contacto,
para implementar las historias siguientes contra contratos correctos.

**Acceptance Criteria:**

**Given** `../backend/openapi/openapi.json` actualizado con DLT-candidato-contacto
**When** ejecuto `npm run api:generate`
**Then** `RequestItemBody` (o equivalente generado) incluye `contactChannel: string` como campo requerido
**And** `DeliverySessionDetail` (o equivalente) incluye `receiverContactChannel: string | null`

**Given** el delta aprobado
**When** actualizo `docs/architecture.md`
**Then** versión **1.6** con contrato `POST /items/:id/requests` actualizado (payload `{ contactChannel }`), contrato `GET /delivery-sessions/:id` actualizado (`receiverContactChannel`) y regla SEC-002c en §5

**Nota:** Si el spec OpenAPI del backend aún no está actualizado, crear tipos provisionales en `src/app/core/models/` marcados como `// TODO: eliminar tras regeneración`.

---

### Story 10-f2: Retrofits UI canal de contacto — solicitud y sesión de entrega (3.1 + 4.1)

**Diseño de referencia:** `docs/project/Detalle de item.html`, `docs/project/ItemDetail.jsx` (RequestSheet), `docs/project/Entregas.html` (CoordinationBlock)

Como receptor autenticado,
quiero proporcionar mi canal de contacto al solicitar un objeto,
para que el donante pueda coordinarse conmigo si me selecciona.

Como donante,
quiero ver el canal de contacto del receptor en el detalle de sesión de entrega,
para poder contactarle y coordinar la recogida.

**Acceptance Criteria — Retrofit 3.1: bottom sheet de solicitud**

**Given** detalle de objeto ajeno, `active`, `requestsPaused === false`
**When** pulso el CTA de solicitar
**Then** se abre `RequestContactBottomSheetComponent` — NO se llama directamente al servicio
**And** el bottom sheet sigue el diseño de `RequestSheet` en `ItemDetail.jsx` (pixel-perfect)

**Given** el bottom sheet abierto con campo `contactChannel` vacío
**When** el usuario no ha escrito nada
**Then** el botón "Enviar solicitud" está deshabilitado (`disabled`)
**When** el campo tiene valor (trim no vacío)
**Then** el botón se habilita

**Given** el usuario pulsa "Enviar solicitud" con campo válido
**When** se llama `ItemsService.itemsIdRequestsPost(itemId, { contactChannel })`
**Then** ante 201: cerrar sheet → estado "Ya solicitado" en detalle (mismo comportamiento post-solicitud de Story 3.1)

**Given** el backend responde 400 (`contactChannel` ausente o vacío)
**When** el error llega al componente
**Then** se muestra el error **inline** bajo el campo con clave i18n `items.request.contact_channel.error.required`
**And** el sheet permanece abierto (no se cierra)

**Given** el backend responde 409
**When** el error llega
**Then** cerrar sheet → error estándar en pantalla (comportamiento previo Story 3.1)

**Given** el usuario pulsa "Cancelar" o el backdrop
**When** no se ha enviado la solicitud
**Then** el sheet se cierra sin cambiar el estado del botón de solicitar

**Ubicación del componente:** `src/app/features/items/components/request-contact-bottom-sheet/`  
**El campo NO se pre-rellena** con el campo `phone` del perfil del usuario.

**Acceptance Criteria — Retrofit 4.1: receiverContactChannel en panel donante**

**Given** el backend devuelve `receiverContactChannel` con valor no nulo en `GET /delivery-sessions/:id`
**When** soy donante (`role === 'donor'`) y veo el panel de detalle de sesión
**Then** se renderiza el canal del receptor en el bloque de coordinación (CoordinationBlock del prototipo)
**And** aparece bajo `sharedContactChannel` (canal propio del donante)

**Given** `receiverContactChannel` es `null`
**When** veo el panel de detalle
**Then** el bloque del receptor NO se renderiza — sin lógica adicional de visibilidad (SEC-002c)

**Given** soy receptor (`role === 'receiver'`)
**When** veo el panel de detalle
**Then** `receiverContactChannel` NO es visible — la regla aplica solo para el donante

**Acceptance Criteria — i18n (§6.1 + §6.2 del delta)**

**Given** las claves i18n del §6.1 (bottom sheet) y §6.2 (coordinación entrega) del delta
**When** se añaden en `public/i18n/es.json`
**Then** no existe conflicto con claves existentes bajo `items.request.*` ni `delivery.session.*`
**And** si `delivery.session.coordination.title` ya existe, se reutiliza sin duplicar
**And** se añaden traducciones equivalentes en `ca.json` y `en.json`

**Dependencia:** Story 10-f1.

---

## Epic 12-f: Sistema de Reportes (PRD-REP-FE-01)

Implementa el sistema de reportes frontend: modal standalone de 3 pasos reutilizable, `ReportService`, integración de triggers en los tres puntos de entrada de la app. La funcionalidad está restringida a usuarios autenticados con `emailVerified = true`. El backend debe implementar `POST /api/reports` (PRD-REP-BE-01) antes de Story 12-f1.

**PRD de referencia:** `docs/PRD-REP-FE-01.md`
**Design brief:** `docs/DESIGN-REP-01.md`
**UX:** `docs/project/colors_and_type.css` (design system base); sin prototipo HTML dedicado — usar `DESIGN-REP-01.md` como especificación visual vinculante
**Referencia:** Correct Course `sprint-change-proposal-2026-06-11-reportes-frontend.md` (aprobado 2026-06-11)

---

### Story 12-f1: Regenerar cliente OpenAPI y architecture v1.7

Como desarrollador frontend,
quiero el cliente API y `docs/architecture.md` alineados con el endpoint `POST /api/reports` del backend,
para implementar las historias siguientes contra contratos correctos.

**Prerequisito bloqueante:** el backend debe haber implementado y exportado en su spec OpenAPI el endpoint `POST /api/reports` (PRD-REP-BE-01) antes de ejecutar esta historia.

**Acceptance Criteria:**

**Given** `../backend/openapi/openapi.json` actualizado con `POST /api/reports`
**When** ejecuto `npm run api:generate`
**Then** existe `ReportsService` generado en `src/app/core/api/generated/services/`
**And** existen los modelos `CreateReportBody` (con campos `reportedEntityType`, `reportedEntityId`, `reason`, `description?`, `recaptchaToken`) y la respuesta `{ id: string }` en `generated/models`
**And** el tipo `ReportReason` generado cubre todos los valores del enum (`contenido_inadecuado`, `fraude_o_engaño`, `spam`, `objeto_ilegal`, `objeto_peligroso`, `información_falsa`, `comportamiento_abusivo`, `otro`)

**Given** el PRD-REP-FE-01 aprobado
**When** actualizo `docs/architecture.md`
**Then** versión **1.7** documenta: endpoint `POST /api/reports` (contrato completo), enum `ReportReason`, tabla de códigos de error (`REPORT_ALREADY_PENDING`, `SELF_REPORT_FORBIDDEN`, `ENTITY_NOT_REPORTABLE`, `RECAPTCHA_FAILED`, `RATE_LIMIT_ENTITY_EXCEEDED`, `RATE_LIMIT_TOTAL_EXCEEDED`), y ubicación de `ReportService` en `core/services/`

**Nota:** si el backend no está disponible, crear un mock local de `ReportsService` en `core/api/mocks/` marcado como `// TODO: eliminar tras regeneración` para habilitar desarrollo paralelo.

---

### Story 12-f2: ReportService y ReportModalComponent

**Diseño de referencia:** `docs/DESIGN-REP-01.md` (especificación visual completa del modal y estados), `docs/project/colors_and_type.css` (tokens)

Como usuario autenticado con email verificado,
quiero acceder a un modal de reporte de 3 pasos que me permita categorizar el problema y enviarlo,
para señalar contenido inadecuado o comportamientos problemáticos a la comunidad.

**Acceptance Criteria:**

**Given** `ReportService` en `core/services/report.service.ts`
**When** se llama `submit(context, reason, description, recaptchaToken)`
**Then** invoca `ReportsService.createReport` (cliente generado) con el payload correcto
**And** retorna `Observable<{ id: string }>` (AC-REP-FE-16)

**Given** `ReportModalComponent` standalone con `@Input() context: ReportContext` y `@Output() closed`, `@Output() submitted`
**When** se abre con contexto válido (`entityId` no vacío)
**Then** el Paso 1 muestra lista de 8 motivos seleccionables; título `"Reportar [objeto | usuario]"` según `context.entityType`; subtítulo con `context.entityDisplayName` (AC-REP-FE-14, AC-REP-FE-18)

**Given** el Paso 1 sin motivo seleccionado
**When** el usuario ve el modal
**Then** el botón "Siguiente" está deshabilitado (AC-REP-FE-06)

**Given** el usuario selecciona un motivo y avanza al Paso 2
**When** pulsa "Atrás"
**Then** regresa al Paso 1 manteniendo la opción seleccionada (AC-REP-FE-15)

**Given** el Paso 2 con textarea
**When** el usuario escribe más de 500 caracteres
**Then** el input se trunca a 500; el contador muestra `500 / 500` (AC-REP-FE-07)

**Given** el usuario pulsa "Enviar reporte"
**When** se ejecuta el submit
**Then** (1) se obtiene token reCAPTCHA V3 con acción `'report'` vía `RecaptchaService.execute('report')` (AC-REP-FE-13); (2) se llama `ReportService.submit`; (3) la UI transiciona a estado `SUBMITTING`: botón deshabilitado, textarea readonly, botones Atrás y ✕ deshabilitados (AC-REP-FE-08)

**Given** respuesta `201` de la API
**When** el submit tiene éxito
**Then** el modal pasa al Paso 3 con icono de confirmación, título "Reporte enviado" y cuerpo según PRD-REP-FE-01 §3.6 (AC-REP-FE-09)

**Given** el Paso 3 y el usuario pulsa "Cerrar"
**When** se cierra el modal
**Then** se emite el output `submitted` (AC-REP-FE-10)

**Given** la API responde con error
**When** llega `HttpErrorResponse`
**Then** el handler lee `error.error.code` (no solo el status HTTP) y muestra el mensaje correspondiente inline en la zona de error del Paso 2; la UI regresa a `STEP_2_DESCRIPTION`; textarea conserva contenido; botón se reactiva (AC-REP-FE-11, AC-REP-FE-12, AC-REP-FE-19)

**Given** la API responde `403` (`EMAIL_NOT_VERIFIED`)
**When** llega el error
**Then** el `authErrorInterceptor` gestiona globalmente la redirección; el componente no muestra error inline (AC-REP-FE-20)

**Given** el modal abierto
**When** el usuario navega con teclado
**Then** el foco queda confinado al modal (focus trap); ESC cierra el modal y emite `closed`; la lista de motivos es navegable con flechas; `role="dialog"`, `aria-modal="true"`, `aria-labelledby` apuntando al título del paso activo (AC-REP-FE-17)

**Nota de implementación:** verificar si existe componente modal base en `shared/components/` antes de crear overlay nuevo (PRD-REP-FE-01 §10 y §11). Si no existe, implementar overlay standalone mínimo sin dependencia de `@angular/cdk` salvo que ya sea dependencia del proyecto.

**Dependencia:** Story 12-f1 (o mock local si el backend no está listo).

---

### Story 12-f3: Integración en puntos de entrada (ItemCard, ItemDetail, UserProfile)

**Diseño de referencia:** `docs/DESIGN-REP-01.md` §4 (triggers), `docs/project/Explorar v3.html` (contexto ItemCard/ItemDetail), `docs/project/Perfil.html` (contexto UserProfile)

Como usuario autenticado con email verificado,
quiero poder iniciar un reporte desde la tarjeta de objeto, el detalle del objeto y el perfil público de otro usuario,
para que el trigger esté disponible en los contextos relevantes de la app.

**Acceptance Criteria:**

**Given** `ItemCardComponent` con menú contextual existente
**When** `sessionService.isAuthenticated() && currentUser?.emailVerified === true && currentUser?.id !== item.donorId`
**Then** aparece la opción "Reportar objeto" al final del menú, separada por divisor visual; al hacer clic abre `ReportModalComponent` con `{ entityType: 'item', entityId: item.id, entityDisplayName: item.title }` (AC-REP-FE-01, AC-REP-FE-02, AC-REP-FE-03, AC-REP-FE-05)

**Given** `ItemCardComponent` cuando la condición anterior no se cumple
**When** se renderiza la tarjeta
**Then** la opción de reporte no aparece en el menú (sin mensaje alternativo ni redirección a login)

**Given** `ItemDetailComponent`
**When** se cumple la condición `canReport` (idéntica a ItemCard)
**Then** aparece enlace de texto discreto "Reportar este objeto" en zona inferior del detalle, fuera del área de acciones principales; al hacer clic abre `ReportModalComponent` con el mismo contexto que ItemCard (AC-REP-FE-05)

**Given** `UserProfilePublicComponent`
**When** `sessionService.isAuthenticated() && currentUser?.emailVerified === true && currentUser?.id !== profileUserId`
**Then** aparece enlace "Reportar este usuario" al final de la información pública del perfil; al hacer clic abre `ReportModalComponent` con `{ entityType: 'user', entityId: profileUser.id, entityDisplayName: firstName + ' ' + lastName }` (AC-REP-FE-04, AC-REP-FE-05)

**Given** `ReportModalComponent` emite `submitted` en cualquiera de los tres contextos
**When** el modal se cierra tras envío exitoso
**Then** el componente padre puede actualizar su estado si es necesario; no se requiere ningún cambio de navegación

**Nota de implementación:** verificar nombre exacto del componente de perfil público en `features/profile/` antes de modificar. La condición `?.emailVerified === true` es segura durante la ventana posterior al login antes de que `GET /users/me` hidrate el objeto (PRD-REP-FE-01 §5).

**Dependencia:** Story 12-f2.

## Epic 13: Descubrimiento Público y Conversión SEO

Transforma el modelo de acceso de "walled garden" a "Público para ver, privado para actuar". Los visitantes no autenticados pueden explorar el catálogo completo y ver detalle de objetos; las acciones de interacción (solicitar, publicar, ver perfil completo) activan el flujo de conversión al registro. El catálogo es indexable por Google mediante SSR y meta tags dinámicos.

> **Referencia sprint change:** `sprint-change-proposal-2026-06-15-public-discovery-seo.md` (aprobado 2026-06-15). PRD v3.0 §5 y §7 ya actualizados. Architecture v1.6 §6 ya actualizado. No requiere regeneración del cliente OpenAPI — los cambios son de routing y presentación.

### Story 13-f1: Infraestructura SEO — rutas públicas, regeneración cliente y meta tags dinámicos

**Diseño de referencia:** `docs/project/colors_and_type.css` (sin prototipo HTML dedicado; cambios de configuración Angular/SSR)

> **Contexto backend:** La Story de backend 13.1 ya está implementada y en `status: review`. El backend expone `GET /items` y `GET /items/:id` sin JWT con las siguientes garantías de contrato: `distanceMeters: null` para invitados (en lugar de km calculados), `donor.id: null` + `donor.firstName: "Anónimo"` + `donor.lastName: ""` + `donor.avatarUrl: null` para invitados en el detalle, y `410 Gone` cuando el ítem no existe. OpenAPI regenerado — `distanceMeters: nullable`, `donor.id: nullable`. El frontend debe regenerar su cliente OpenAPI antes de implementar las historias 13-f1 y 13-f2.

Como crawler de Google y como visitante no autenticado,
quiero acceder a `/explorar` e `/items/:id` sin necesidad de autenticación y ver meta tags descriptivos del contenido,
para que los objetos sean indexables en búsquedas orgánicas y las URLs sean compartibles con previsualización enriquecida.

**Acceptance Criteria:**

**Given** `../backend/openapi/openapi.json` actualizado con los campos nullable de la Story 13.1 backend
**When** ejecuto `npm run api:generate`
**Then** `ItemSummaryDto` (o equivalente generado) incluye `distanceMeters: number | null`
**And** `GetItemResponseDto.donor` incluye `id: string | null`, `firstName: string`, `lastName: string`, `avatarUrl: string | null`
**And** el cliente TypeScript no emite errores de tipo en los puntos que consumen estos campos

**Given** la configuración de rutas en `app.routes.ts`
**When** se revisa la definición de `/explorar` e `/items/:id`
**Then** ninguna de las dos rutas tiene `canActivate: [AuthGuard]`
**And** el resto de rutas protegidas (publicar, perfil, entregas, candidatos) conservan su `AuthGuard`

**Given** un visitante sin token en `localStorage`
**When** navega directamente a `/explorar`
**Then** el feed carga sin redirección a `/login`
**And** `GET /items` se llama sin header `Authorization` (el `JwtInterceptor` no añade el header si `SessionService.getToken()` devuelve null)

**Given** un visitante sin token en `localStorage`
**When** navega directamente a `/items/:uuid`
**Then** el detalle del objeto carga sin redirección a `/login`
**And** `GET /items/:id` se llama sin header `Authorization`

**Given** la respuesta de `GET /items` para un visitante
**When** se recibe la lista de objetos
**Then** cada ítem tiene `distanceMeters === null` (señal de Feed Global — sin filtro 50km, comportamiento del backend)
**And** el total de ítems en la respuesta no está filtrado geográficamente

**Given** un usuario autenticado con token válido
**When** llama a `GET /items`
**Then** recibe `distanceMeters` calculado (número, no null) — regresión sin cambio

**Given** la respuesta de `GET /items/:id` para un visitante
**When** el objeto existe
**Then** el campo `donor.id` es `null`, `donor.firstName` es `"Anónimo"`, `donor.avatarUrl` es `null`, `donor.reputationScore` tiene valor real
**And** `distanceMeters` es `null`

**Given** un usuario autenticado con token válido
**When** llama a `GET /items/:id`
**Then** recibe `donor.id` con UUID real y `distanceMeters` calculado — regresión sin cambio

**Given** `GET /items/:id` devuelve HTTP `410 Gone` (objeto purgado físicamente en backend)
**When** el interceptor de errores HTTP o el componente de detalle procesa la respuesta
**Then** el router navega a una página de error con mensaje "Este objeto ya no está disponible" y enlace a `/explorar`
**And** esta página de error es visualmente distinta de la página 404 (objeto no encontrado temporalmente)
**And** el interceptor global de errores HTTP maneja `410` explícitamente — no lo trata como error genérico

**Given** un token inválido o expirado en `localStorage`
**When** el visitante hace una petición a `/explorar` o `/items/:id`
**Then** el backend responde `401` y el interceptor JWT limpia el token y redirige a `/login` (comportamiento existente sin cambio)

**Given** la ruta `/items/:id` y Angular SSR activo para rutas públicas
**When** el servidor renderiza la página con un ítem válido
**Then** el `<head>` incluye:

- `<title>` con el título del objeto
- `<meta name="description">` con los primeros 160 caracteres de la descripción
- `<meta property="og:title">` con el título del objeto
- `<meta property="og:description">` con la descripción recortada
- `<meta property="og:image">` con la URL de la primera imagen del objeto (si existe)

**Given** un objeto con `status === 'completed'` o `status === 'cancelled'`
**When** se renderiza la página de detalle vía SSR
**Then** el `<head>` incluye `<meta name="robots" content="noindex, follow">`
**And** los objetos en estado `active` o `reserved` no incluyen ese meta tag (la detección es front-end, basada en el campo `status` de la respuesta API)

**Given** la configuración de `app.config.server.ts` o `server.routes.ts`
**When** se define el `RenderMode`
**Then** `/explorar` y `/items/:id` usan `RenderMode.Server` (SSR dinámico)
**And** las rutas autenticadas conservan `RenderMode.Client`
**And** las rutas de landing (`/`, `/en`, `/ca`) conservan `RenderMode.Prerender` según la configuración existente de i18n

---

### Story 13-f2: UX de Invitado — App Shell, componentes guest y modal de conversión

**Diseño de referencia:** `docs/project/DESIGN-BRIEF-EPK13.html` (todos los componentes)

Como visitante no autenticado,
quiero navegar el catálogo con una interfaz adaptada a mi estado de invitado,
para entender el valor del sistema antes de registrarme y ser guiado al registro cuando quiero actuar.

**Acceptance Criteria:**

**Given** la ausencia de token en `SessionService`
**When** el `AppShellComponent` se inicializa
**Then** la navbar renderiza la variante visitante: enlace "Iniciar sesión" en fgMid (→ `/login`) + botón primario "Registrarse" (→ `/registro`)
**And** el avatar de usuario, el botón "Publicar" y el menú de notificaciones no se renderizan

**Given** la ausencia de token
**When** se renderiza la bottom navigation en móvil
**Then** tab "Publicar" muestra icono en `fgDisabled` con dot accent (#253F72, 7px, borde bgSurface) — no usar atributo HTML `disabled`
**And** tab "Perfil" se sustituye por "Entrar" (icono IUser, → `/login`)
**And** clic en tab "Publicar" → abre `ConversionGateModal` con variante `publish_item`, no navega a ninguna ruta

**Given** la presencia de token válido en `SessionService`
**When** el `AppShellComponent` se inicializa
**Then** la navbar y el bottom nav muestran exactamente el mismo estado que antes de esta épica (sin regresión)

**Given** el feed en `/explorar` cargando para un visitante
**When** la lista de items se renderiza
**Then** el `FeedGlobalBanner` aparece en la parte superior del feed, por encima del grid de tarjetas
**And** contiene texto explicativo ("Ves objetos de toda España.") con enlace "Regístrate" en primary-500 con `text-decoration-style: dotted` (→ `/registro`)
**And** background #EDF0F5, borde 1px #A5B5D4, borderRadius 10px
**And** botón × de cierre en fgMuted

**Given** el visitante pulsa × en el `FeedGlobalBanner`
**When** el banner se descarta
**Then** el banner no se renderiza y el espacio desaparece completamente (sin placeholder ni height reservada)
**And** el estado de descarte se guarda en `sessionStorage` — el banner no reaparece mientras dura la sesión del navegador
**And** si el usuario carga la página en una nueva pestaña/sesión, el banner vuelve a aparecer

**Given** un visitante en el feed `/explorar` viendo tarjetas de objeto (`ItemCardComponent`)
**When** la respuesta de `GET /items` trae `distanceMeters === null` en un ítem
**Then** en lugar de la distancia en km se muestra "Disponible en España" en color `fgDisabled` (señal de Feed Global — no depende del estado de sesión del cliente, sino del valor null en la respuesta)
**And** el contador de solicitudes no se renderiza
**And** el menú contextual (···) no se renderiza — el elemento no existe en el DOM (no `display:none`, no `disabled`)
**And** el score de reputación del donante es visible (idéntico al estado autenticado)

**Given** un visitante en el detalle de objeto `/items/:id`
**When** la respuesta de `GET /items/:id` trae `donor.id === null`
**Then** el `ItemDonorRowComponent` renderiza la variante anonimizada: placeholder genérico (icono IUser 18px, fondo `bgSubtle` #E8EAEC, sin iniciales/avatar)
**And** el nombre se muestra como la clave i18n `guest.donor_row.anonymous_name` ("Donante anónimo") en color `fgMid` (#606A76) — no se usa `donor.firstName` del API como texto visible (el frontend usa i18n para localización)
**And** el nombre no es un enlace y no tiene `cursor: pointer` (porque `donor.id === null` implica que no hay ruta de perfil público)
**And** la fecha de antigüedad ("Miembro desde …") es visible si el backend la provee
**And** el score de reputación (`donor.reputationScore`) es visible en su color semántico habitual

**Given** un usuario autenticado en el detalle de objeto `/items/:id`
**When** la respuesta trae `donor.id` con UUID real
**Then** el `ItemDonorRowComponent` renderiza la variante con identidad: avatar o iniciales reales, nombre real con enlace a `/usuarios/:id`, cursor pointer — sin cambio respecto al comportamiento anterior

**Given** un visitante en el detalle de objeto con `status === 'active'` y `requestsPaused === false`
**When** pulsa el botón "Me interesa" (o "Solicitar")
**Then** se abre el `ConversionGateModal` con variante `request_item`
**And** el componente de bottom sheet de solicitud (`RequestContactBottomSheetComponent`) no se abre

**Given** el `ConversionGateModal` abierto (cualquier variante)
**When** el modal aparece
**Then** overlay rgba(20,23,26,0.55), panel bgSurface, borderRadius 16px, boxShadow shadow3
**And** icono IGift en círculo primaryLight (60px, borderRadius 50%)
**And** título en Playfair Display 22px fontWeight 700
**And** lista de 3 beneficios en bloque con fondo primaryLight
**And** CTA primario: "Crear cuenta gratis" (background primary-500, ancho completo, → `/registro`)
**And** CTA secundario: "Ya tengo cuenta — Iniciar sesión" (borde border-default, ancho completo, → `/login`)
**And** si hay returnUrl disponible, se añade como query param en ambos CTAs
**And** el foco inicial se posiciona en el botón "Crear cuenta gratis"
**And** el focus trap está activo mientras el modal está abierto

**Given** el `ConversionGateModal` abierto
**When** el visitante pulsa tecla ESC o el botón ×
**Then** el modal se cierra y el foco regresa al elemento disparador

**Given** las 3 variantes del `ConversionGateModal`
**When** se abre con trigger `request_item`
**Then** título: "¿Te interesa este objeto?" — subtítulo: "Para pedirlo, crea tu cuenta gratuita. Solo te toma un minuto."
**When** se abre con trigger `publish_item`
**Then** título: "Regala lo que ya no necesitas" — subtítulo: "Crea tu cuenta para publicar objetos y que lleguen a quien los necesita."
**When** se abre con trigger `view_profile`
**Then** título: "Conoce a la comunidad" — subtítulo: "Con una cuenta puedes ver los perfiles y el historial de los miembros."

**Given** el `ConversionGateModal` y las tarjetas de invitado
**When** un lector de pantalla los recorre
**Then** cumple WCAG AA: contraste suficiente, foco gestionado, roles ARIA correctos en modal y botones

**Given** todas las cadenas visibles de los nuevos componentes guest
**When** se revisa el código
**Then** usan claves i18n en `public/i18n/es.json` bajo los siguientes prefijos:

- `guest.banner.*` (FeedGlobalBanner)
- `guest.item_card.*` (variante visitante de ItemCard)
- `guest.donor_row.*` (DonorRow anonimizado)
- `guest.conversion_modal.*` (ConversionGateModal, todas las variantes)
**And** se añaden claves equivalentes en `ca.json` y `en.json`

**Enfoque de detección del modo invitado:**

- `AppShellComponent`, `NavbarComponent`, `BottomNavComponent` → detección vía `SessionService.isAuthenticated()` (estado cliente — no depende de la API)
- `FeedGlobalBanner` → mostrar cuando `!SessionService.isAuthenticated()` (estado cliente)
- `ItemCardComponent` → detección vía `item.distanceMeters === null` (señal de la API — no del estado cliente; garantiza consistencia con la respuesta backend)
- `ItemDonorRowComponent` → detección vía `donor.id === null` (señal de la API — no del estado cliente)
- `ConversionGateModal` → disparado por acciones de usuario cuando `!SessionService.isAuthenticated()` (estado cliente)

**Dependencia:** Story 13-f1 (regeneración del cliente OpenAPI, rutas públicas sin AuthGuard).

**Ubicación de componentes nuevos:**

- `ConversionGateModal` → `src/app/shared/components/conversion-gate-modal/`
- `FeedGlobalBanner` → `src/app/features/items/components/feed-global-banner/`
- Variantes guest de `ItemCardComponent`, `ItemDonorRowComponent` → extensión mediante `@Input()` o lógica interna basada en los campos nullable del API (ver enfoque arriba)
- Variantes guest de `NavbarComponent`, `BottomNavComponent` → extensión mediante `SessionService.isAuthenticated()` signal

---

## Epic 14: URL Canonicalización, Indexación Completa y Calidad SEO

URLs de items pasan de UUID a slug limpio semánticamente rico; el sitemap dinámico incluye todos los items activos para aceleración del crawl de Google; los servicios SEO alcanzan calidad óptima en meta tags Open Graph y structured data.

> **Referencia sprint change:** `sprint-change-proposal-2026-06-19-slugs-sitemap.md` (aprobado 2026-06-20).

**FRs cubiertos:** FR-F54, FR-F55, FR-F56, FR-F57, FR-F58, FR-F59, FR-F60
**NFRs:** NFR-F17 (indexabilidad), NFR-F18 (SSR en rutas públicas)
**Dependencia bloqueante:** Backend (story 14-f0) debe implementar `slug` antes de 14-f1 y 14-f2. La story 14-f3 no tiene dependencias y puede ejecutarse en paralelo.

---

### Story 14-f0: Backend — Campo `slug` y endpoint de resolución por slug

**Responsable:** Backend team (coordinar antes de 14-f1)

Como plataforma,
quiero que cada item tenga un slug URL-safe único basado en su título,
para que el frontend pueda construir URLs semánticamente ricas sin lógica de deduplicación propia.

**Acceptance Criteria:**

**Given** el modelo de datos Item en el backend
**When** se crea un nuevo item
**Then** el campo `slug` se genera automáticamente: normalizar título a minúsculas, tildes → ASCII, carácteres no alfanuméricos → guiones, colapsar guiones múltiples, truncar a 60 caracteres en límite de palabra
**And** si el slug resultante ya existe, se añade sufijo numérico (`-2`, `-3`, etc.) hasta obtener unicidad

**Given** `../backend/openapi/openapi.json` actualizado
**When** se exponen los contratos de item
**Then** `slug: string` (requerido, no nulo) aparece en `ItemSummary` y `GetItemResponse`
**And** el endpoint `GET /items/:slug` resuelve por slug y devuelve el mismo contrato que `GET /items/:id`
**And** el endpoint `GET /items/:id` (UUID) sigue funcionando sin cambio (retrocompatibilidad)

**Given** items existentes sin campo `slug`
**When** se ejecuta la migración de base de datos
**Then** todos los items existentes reciben un slug generado desde su título (backfill)

---

### Story 14-f1: Frontend — Routing por slug y retrocompatibilidad UUID

**Diseño de referencia:** Sin nueva pantalla (cambio de routing puro)
**Dependencia:** Story 14-f0 completada y cliente OpenAPI regenerado (`npm run api:generate`)

Como visitante o usuario,
quiero que las URLs de items usen palabras clave descriptivas en lugar de UUIDs,
para compartirlas, recordarlas, y para que Google extraiga señal de palabras clave de la URL.

**Acceptance Criteria:**

**Given** `items.routes.ts`
**When** se define la ruta de detalle
**Then** la ruta es `/items/:slug`

**Given** un parámetro de ruta con formato UUID (`/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`)
**When** `DetalleComponent` lo detecta al inicializar (p. ej. en `ngOnInit`)
**Then** llama `GET /items/:uuid`, obtiene `item.slug` y ejecuta `router.navigate(['/items', item.slug], { replaceUrl: true })` sin crear entrada adicional en el historial del navegador

**Given** un parámetro de ruta con formato slug (no UUID)
**When** `DetalleComponent` lo detecta
**Then** llama directamente `GET /items/:slug` (nuevo endpoint del backend)

**Given** cualquier componente que genera un enlace a item (`ItemCardComponent`, feed, listados de perfil, entregas, candidatos)
**When** se construye el `routerLink` o `router.navigate`
**Then** usa `item.slug` en lugar de `item.id`

**Given** `ItemSeoService.apply(item)`
**When** construye canonical URL, `og:url` y `url` de Product structured data
**Then** usa `https://regalalo.org/items/${item.slug}` en lugar de `https://regalalo.org/items/${item.id}`

---

### Story 14-f2: Frontend — Sitemap dinámico con items activos

**Dependencia:** Story 14-f0 completada (backend retorna `slug` en `ItemSummary` del feed global)

Como bot de Google,
quiero encontrar todos los objetos disponibles en el sitemap,
para indexarlos proactivamente sin depender solo del crawling de la página `/explorar`.

**Acceptance Criteria:**

**Given** `GET /sitemap.xml` en el servidor SSR Express
**When** se genera la respuesta
**Then** incluye todas las URLs estáticas actuales (/, /en, /ca, /explorar, /como-funciona/reputacion y variantes) PLUS una entrada por cada item activo
**And** la URL de cada item usa el formato `https://regalalo.org/items/${item.slug}`
**And** cada entrada de item tiene `<priority>0.7</priority>` y `<changefreq>daily</changefreq>`

**Given** la fetch de items activos para el sitemap
**When** se llama a `GET /items` sin JWT (Feed Global, FR-F45)
**Then** se iteran las páginas hasta obtener todos los items (máx. 5.000; si supera se priorizan los más recientes)
**And** solo se incluyen items con `status === 'active'`

**Given** la generación del sitemap es costosa (múltiples peticiones al backend)
**When** el sitemap se sirve
**Then** el servidor responde con `Cache-Control: public, max-age=3600` y regenera el contenido en memoria máximo una vez por hora

**Given** el backend no está disponible al generar el sitemap
**When** falla la fetch de items
**Then** el sitemap devuelve igualmente las URLs estáticas sin lanzar HTTP 500

---

### Story 14-f3: Frontend — Correcciones de calidad en meta tags y structured data

**Sin dependencias.** Puede implementarse en paralelo con 14-f0 desde el primer día.

Como plataforma,
quiero que los meta tags Open Graph y el structured data cumplan las mejores prácticas de Google y plataformas sociales,
para maximizar rich results, previews sociales correctas y visibilidad en Knowledge Graph.

**Acceptance Criteria — `ItemSeoService` (`src/app/core/seo/item-seo.service.ts`):**

**Given** una página de detalle de item con imagen disponible
**When** se generan las OG tags
**Then** se incluyen `og:image:width` (1200), `og:image:height` (630), `og:image:alt` (= `item.title`)
**And** se incluye `twitter:image:alt` (= `item.title`)
**And** `twitter:site` se añade con el handle oficial de la plataforma

**Given** el Product JSON-LD de un item
**When** se serializa
**Then** el objeto Product incluye `@id` igual a la URL canonical del item
**And** `offers.seller` = `{ "@type": "Organization", "name": "Regálalo", "url": "${siteUrl}/" }`
**And** `image` es el array completo de `item.images` (no solo `images[0]`), omitido si el array está vacío

**Given** la descripción del item tiene más de 160 caracteres
**When** se trunca para `name="description"` y `description` en Product
**Then** el corte ocurre en el último espacio antes del carácter 160 (sin cortar a mitad de palabra)
**And** se añade `'…'` al final si fue truncado

**Acceptance Criteria — `ExplorarSeoService` (`src/app/core/seo/explorar-seo.service.ts`):**

**Given** la página `/explorar`
**When** se generan las OG tags
**Then** se incluyen `og:image` (URL de la imagen OG por defecto del sitio), `og:image:width` (1200), `og:image:height` (630), `og:image:alt` (= page title), `og:image:type` ('image/png')
**And** `twitter:card` es `'summary_large_image'` y se incluye `twitter:image` con la misma imagen

**Acceptance Criteria — `ReputationSeoService` (`src/app/core/seo/reputation-seo.service.ts`):**

**Given** las páginas `/como-funciona/reputacion` y variantes locale
**When** se generan las OG tags
**Then** `og:type` es `'website'` (coherente con el JSON-LD `WebPage`; no `'article'`)
**And** se incluyen `og:image` con la imagen OG por defecto y sus tags de dimensiones
**And** se establece explícitamente `<meta name="robots" content="index, follow">`

**Acceptance Criteria — `LandingSeoService` (`src/app/core/seo/landing-seo.service.ts`):**

**Given** el JSON-LD de Organization
**When** se serializa
**Then** `logo` usa una imagen PNG/JPG: `{ "@type": "ImageObject", "url": "${siteUrl}/logo.png", "width": 200, "height": 60 }` (no `.svg`, incompatible con Google Rich Results)
**And** el schema WebSite incluye `"@id": "${siteUrl}/#website"`
**And** el schema Organization incluye `"@id": "${siteUrl}/#organization"`
**And** se añade `twitter:site` con el handle oficial en el bloque de OG tags

---

## Validación Final (Step 4)

| Check | Resultado |
|---|---|
<<<<<<< HEAD
| Cobertura FR-F1..FR-REP-F3 | Todas mapeadas a épicas e historias (FR-F25..29 → Épica 6; FR-F30..32 → Épica 7-f; FR-F33..37 → Épica 8-f; FR-F42..43 → Épica 10-f; FR-REP-F1..F3 → Épica 12-f) |
=======
| Cobertura FR-F1..FR-F53 | Todas mapeadas a épicas e historias (FR-F25..29 → Épica 6; FR-F30..32 → Épica 7-f; FR-F33..37 → Épica 8-f; FR-F42..43 → Épica 10-f; FR-F44..53 → Épica 13) |

>>>>>>> bfdee7e60122823fba43d4566c1f811eaebb1578
| Starter / brownfield | Story 1.1 organiza scaffold existente (no greenfield desde cero) |
| Jobs backend (degradación, purga, pg_cron) | Fuera de alcance frontend; UI consume `degradedAt` e imágenes del API |
| Dependencias entre historias | Orden secuencial por épica; 13-f2 puede desarrollarse en paralelo a 13-f1 salvo el `JwtInterceptor` (shared) |
| SEC-002 contactChannel | Cubierto en 4.1 |
| SEC-002c receiverContactChannel | Cubierto en 10-f2 |
| Errores 409 diferenciados | Cubierto en 3.1 |
| UX Design Requirements | Vinculantes — `docs/project/` (UX-DR1–18, bloqueantes); Épica 13 → `DESIGN-BRIEF-EPK13.html` |
| Cumplimiento diseño | Obligatorio — NFR-F13, § «Cumplimiento de diseño» |
| Tamaño de historias | Cada historia acotable a una sesión de dev agent |
| SEO / acceso público | 13-f1 cubre rutas, SSR, OpenGraph, noindex, 410 Gone |
| Guest UX | 13-f2 cubre AppShell, ItemCard, DonorRow, FeedGlobalBanner, ConversionGateModal |
| Feed Global sin JWT | 13-f1 confirma comportamiento backend (GET /items sin token = sin radio 50km) |
| Privacidad donante para visitantes | 13-f2 cubre anonimización — sin nombre ni enlace al perfil |
| URL canonicalización | 14-f0..f1 cubren slugs limpios + retrocompatibilidad UUID |
| Indexación proactiva de items | 14-f2 cubre sitemap dinámico con todos los items activos |
| Calidad meta tags y structured data | 14-f3 cubre og:image:*, Product @id, offers.seller, og:type coherente, robots explícito |
| FR-F54..FR-F60 | Todas mapeadas a Épica 14 (14-f0..14-f3) |

**Estado:** Listo para `bmad-check-implementation-readiness` y `bmad-sprint-planning`.
