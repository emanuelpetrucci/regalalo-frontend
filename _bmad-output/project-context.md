# Project Context — regalalo (frontend)

## ⛔ Diseño — REQUISITO BLOQUEANTE (no opcional)

**Toda la UI debe basarse exclusivamente en los ficheros de `docs/README.md` y `docs/project/`.** No es una guía ni una sugerencia: es la especificación visual obligatoria del producto.

| Regla | Detalle |
|-------|---------|
| Fuente única | `docs/project/*.html`, `docs/project/colors_and_type.css`, instrucciones en `docs/README.md` |
| Prohibido | Inventar paleta, tipografías, espaciados, layout, componentes o patrones que no existan en esos ficheros |
| Prohibido | Usar librerías de UI genéricas (Material, PrimeNG, etc.) que sustituyan el diseño del handoff |
| Obligatorio | Leer el HTML/CSS del prototipo asignado **completo** (y sus imports) antes de escribir código Angular |
| Implementación | Portar a Angular con fidelidad visual pixel-perfect; stack Angular del proyecto, no copiar React/Babel del prototipo |
| Verificación | Una historia con UI no puede cerrarse en `done` si la pantalla no reproduce el prototipo asignado |

**Entrada obligatoria por historia:** consultar la tabla «Referencia diseño por historia» en `_bmad-output/initiative-regalalo/archive-v6/epics.md` (o el plan `story-*-plan.md` del ticket).

## Stack
- Framework: Angular 21 (standalone, signals, OnPush)
- Hosting: Vercel
- API: cliente OpenAPI generado (`ng-openapi-gen`) — ver **`docs/api-client.md`**
- Sesión: JWT en `localStorage` vía `SessionService` (`core/services/`)
- Estilos: tokens **solo** desde `docs/project/colors_and_type.css` → `src/styles.scss` (o equivalente)

## Cliente API (obligatorio para agentes)

| Regla | Detalle |
|-------|---------|
| Fuente de verdad | `docs/api-client.md` + `../backend/openapi/openapi.json` |
| Código generado | `src/app/core/api/generated/` — **no editar**; regenerar con `npm run api:generate` |
| Config app | `provideApiClient()` en `core/api/api.providers.ts` (ya en `app.config.ts`) |
| `apiUrl` | Debe incluir sufijo `/api` (p. ej. `http://localhost:3000/api`) |
| Llamadas HTTP | Inyectar servicios generados (`AuthService`, `ItemsService`, `UsersService`, `DeliveryService` desde `generated/services`) |
| Tipos DTO | Importar desde `core/api/generated/models` — no duplicar interfaces del contrato |
| Sesión JWT | `SessionService` en `core/services/` — **no** confundir con `AuthService` generado (endpoints `/auth/*`) |
| Prohibido | `ApiService` manual, `HttpClient` con URLs hardcodeadas, editar ficheros en `generated/` |
| Tras cambio API backend | `npm run openapi:generate` (backend) → `npm run api:generate` (frontend) |

## Catálogo de prototipos (binding)

| Fichero | Pantalla / feature |
|---|---|
| `colors_and_type.css` | Design system global (tokens, fuentes, semántica) |
| `Login.html` | Login, registro, recuperación de contraseña |
| `Onboarding.html` | Onboarding / primera visita |
| `Landing Page.html` | Landing pública |
| `Explorar v3.html` | Feed explorar, detalle de objeto, solicitar |
| `Mis objetos.html` | Mis objetos, publicar, pausa, candidatos |
| `Entregas.html` | Sesiones de entrega (listado, detalle, acciones) |
| `Perfil.html` | Perfil privado, reputación, actividad |
| `Política de privacidad.html` | Legal — privacidad |
| `Política de cookies.html` | Legal — cookies |
| `wireframes.html` | Mapa de flujos (complemento) |

## Reglas de implementación
- Contratos API: `docs/api-client.md` (uso diario) + `docs/architecture.md` §4–5 (referencia; tipos canónicos en OpenAPI generado)
- Diseño visual: `docs/project/` (obligatorio, prevalece sobre intuición del agente)
- Legal/cookies: cualquier implementación de consentimiento debe respetar `docs/project/Política de privacidad.html` y `docs/project/Política de cookies.html`, reutilizando el footer ya definido en esas páginas (sin rediseñar footer).
- SEC-002: `contactChannel` — renderizar solo si el backend lo envía no nulo
- Iniciativa BMad v7: `_bmad-output/initiative-regalalo/` (`active_initiative` en `_bmad/custom/config.user.toml`)
- Épicas e historias (referencia): `initiative-regalalo/archive-v6/epics.md`; trabajo activo en `initiative-regalalo/tickets/`
- Estado de ticket: `uv run _bmad/method/scripts/tickets.py --project-root . status initiative-regalalo`
- Idioma artefactos BMAD: español

## Convenciones Angular
- Componentes standalone; `input()` / `output()`; formularios reactivos
- Control flow `@if` / `@for`; sin `ngClass` / `ngStyle`
- Lazy loading por feature route
- WCAG AA sin alterar colores/contrastes definidos en `colors_and_type.css`

## i18n — Internacionalización (obligatorio desde historia 1.4)

| Regla | Detalle |
|-------|---------|
| Librería | `@jsverse/transloco` — ya configurado en `app.config.ts` |
| Idiomas | `es` (default + fallback), `ca`, `en` |
| Archivos JSON | `public/i18n/{es,ca,en}.json` — **no duplicar strings en templates** |
| ⛔ Prohibido | Strings visibles hardcodeados en templates (salvo marca «regalalo» en logo/brand) |
| Obligatorio | Toda cadena visible en UI nueva debe usar clave Transloco |
| Convención claves | `dominio.seccion.clave` en inglés snake-case — ej. `auth.register.title`, `landing.hero.lead` |
| Pipe/directiva | Usar `*transloco="let t"` en componentes con muchas claves, o `{{ 'clave' \| transloco }}` para una sola |
| Persistencia locale | `LocaleService` en `core/i18n/` — usa `localStorage` clave `rgl_locale` |
| Detección automática | Si no hay preferencia: `navigator.language` → mapeo `es`\|`ca`\|`en` (fallback `es`) |
| Render landing | `RenderMode.Prerender` solo para `''`, `/en`, `/ca`; resto `RenderMode.Client` |
| Errores backend | No traducir body de respuestas API — solo mapear por código/status a claves frontend |
| Tests | Usar `TranslocoTestingModule.forRoot({ langs: { es: esJson, ... } })` — no proveer loader real |
