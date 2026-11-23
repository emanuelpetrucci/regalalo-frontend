# Changelog

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto se adhiere a [Versionado Semántico](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.5.0] - 2026-10-29

### Added

- Rutas públicas de detalle de objeto por `slug` (`/items/:slug`) con redirección canónica desde URLs legacy con UUID.
- Utilidad `item-public-path` para URLs públicas y detección de UUID en el segmento de ruta.
- Sitemap dinámico con los objetos activos (FR-F57): `/sitemap.xml` pasa a ser un índice que enlaza `/sitemap-static.xml` (las 7 páginas estáticas) y hasta 100 trozos `/sitemap-items-{n}.xml` (50 objetos por trozo, tope de 5.000). Cada petición hace como mucho un `GET /items`, cada trozo se cachea 60 minutos y, si el API falla, se degrada a un índice solo estático o a un `urlset` vacío sin devolver 500.

### Changed

- Enlaces de exploración, compartir y meta canonical usan `item.slug`, con respaldo al `id` si el slug viene vacío. El cliente API regenerado incluye `slug` y `locationName` en los DTOs de ítem, y campos de salud del sistema admin (`alerts`, `database`, `generalConfig`, `stackVersions`, `storage`).
- SEO de la ficha (Open Graph, Twitter y JSON-LD Product, con `og:image`, `robots` y `offers.seller`) solo en la página `/items/:slug`. El modal de explorar no pisa el título, el canonical ni `og:url` del tablón; al cerrarlo se restaura el SEO de explorar.

## [1.4.0] - 2026-10-26

### Added

- Eventos GA4 `sign_up` (con `method: 'email'`) tras un registro correcto y `publicacion_articulo` (con `item_id`) tras publicar un objeto, necesarios para marcarlos como eventos clave (KAN-4).
- `AnalyticsEventsService`: envía los eventos de `gtag` únicamente si hay consentimiento de cookies `analytics` y `gtag` está cargado.

## [1.3.0] - 2026-06-18

### Added

- Visualización de `locationName` junto a `distanceMeters` en las pantallas de exploración, detalle de ítem, filas de candidatos, mis objetos y detalle de entrega.
- Soporte de `locationName` en modelos del cliente API generado (`delivery-session-other-party`, `get-item-response`, `item-summary`, `ranked-candidate`).

### Changed

- Ajustes de diseño en `docs/project/` para reflejar la localidad junto con la distancia en las vistas relevantes.
- CI de GitHub Actions simplificado a build/type-check: se eliminó la ejecución de E2E en pipeline remoto para dejarla solo en entorno local.

## [1.2.0] - 2026-06-14

### Added

- Sistema de reportes: modal para denunciar objetos, solicitudes, sesiones de entrega y perfiles de usuario, con selección de motivo e indicador de carga (`ReportsService`, `ReportModalComponent`).
- Integración del modal de reporte en todos los puntos de entrada: detalle de objeto, lista de candidatos, detalle de sesión de entrega y perfil público.

### Fixed

- Registro: se envía el campo `language` en `POST /auth/register` con el idioma activo del usuario, de modo que el email de bienvenida llega localizado (es/ca/en).
- Modal de reporte: diseño y comportamiento alineados con los modales globales del proyecto.

## [1.1.0] - 2026-06-10

### Added

- Botones de compartir en redes sociales (WhatsApp, Facebook, X/Twitter) en la landing page, landing-footer y site-footer.
- Parámetros UTM de analítica (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`) en todos los enlaces de redes sociales, siguiendo el patrón de `publicar.component.ts`.

## [1.0.0] - 2026-06-08

### Added

- `ReputationSeoService`: título, descripción, canonical, hreflang, Open Graph y JSON-LD (BreadcrumbList, WebPage, FAQPage) para `/como-funciona/reputacion`, con traducciones por idioma (es/en/ca).
- Claves i18n `reputation_guide.meta` y `reputation_guide.seo.faq` en los tres ficheros de traducción (es, en, ca).
- Cabecera de seguridad `Permissions-Policy` en el middleware SSR.
- Propiedades `foundingDate`, `alternateName` e `inLanguage` en el schema `Organization` de la landing.
- `llms.txt` añadido con enlaces en formato Markdown, descripciones y sección destacada para la página de reputación.
- Primera versión del frontend desplegada en el entorno **development**.
- Aplicación Angular 21 con componentes standalone, signals, lazy loading y SSR.
- Cliente API generado desde OpenAPI del backend (`npm run api:generate`).
- Interceptores HTTP para JWT, errores de autenticación y sesión de usuario.
- Landing page con rutas localizadas (`/`, `/en`, `/ca`) y navegación móvil con menú hamburguesa.
- Flujo de onboarding post-login con redirección automática si no está completado.
- Registro de usuario con reCAPTCHA v3, nombre, apellido, teléfono opcional y código postal.
- Login, cierre de sesión y recuperación/reset de contraseña.
- Verificación de email: pantallas `verificacion-pendiente` y `verificar-email` con banner de éxito.
- Internacionalización con Transloco (es, ca, en) y selector de idioma en layout y auth.
- Compresión de imágenes en cliente (WebP, dimensiones máximas) antes del upload.
- Publicación de objetos con formulario reactivo, categoría, rango de peso e imágenes (hasta 5).
- Feed geográfico de exploración con paginación y filtrado por categoría.
- Detalle de objeto con panel compartido, chips de categoría/condición y acción de solicitud.
- Mis objetos: listado propio, candidatos rankeados, pausa/reanudación, cancelación y compartir enlace.
- Solicitud de objeto desde el detalle con feedback de límites y errores de API.
- Selección de receptor con canal de contacto externo.
- Pantalla de entregas con layout split y detalle de sesión (canal visible solo al receptor).
- Confirmación de entrega y cancelación con declaración de no-show.
- Cancelación de objeto con sesión de entrega activa.
- Perfil privado con pestañas de reputación, donaciones, solicitudes, entregas y configuración.
- Perfil público de otro usuario (`/users/:id`).
- Componente de avatar con iniciales y actualización de perfil (`PATCH /users/me`).
- Guía de reputación accesible en `/reputacion`.
- Páginas legales de privacidad y cookies con estructura documental e i18n alineado.
- Gestor de consentimiento de cookies (vanilla-cookieconsent) con banner y panel de preferencias.
- Acceso persistente a preferencias de cookies desde el footer legal.
- Guía de reputación, SEO y metadatos básicos en landing y rutas públicas.

### Fixed

- Contradicción factual en la FAQ de la landing (pregunta sobre reputación): se eliminó la afirmación de "no hay sanciones" y se describe correctamente el sistema de deducciones por no presentarse (−10/−20/−30 pts), alineado con `/como-funciona/reputacion`.
- Redirección a `/onboarding` tras login si el usuario no completó el flujo inicial.
- Miniatura del ítem en filas del listado de entregas.
- Contador de solicitudes por objeto e iniciales de avatar en candidatos.
- Alineación responsive del detalle de ítem y scope de breakpoints en modales.

### Security

- Guards de autenticación y purga de sesión en rutas de invitado (landing, login, registro).
- Interceptor que redirige a verificación pendiente ante 403 `EMAIL_NOT_VERIFIED`.
- reCAPTCHA v3 en registro y login.
- Gating de scripts de analítica según consentimiento de cookies del usuario.

[Unreleased]: #
[1.5.0]: #
[1.4.0]: #
[1.3.0]: #
[1.2.0]: #
[1.1.0]: #
[1.0.0]: #
