---
ticket: 1
status: done
type: feature
migrated_from: v6
---

# Story 5.1: Ver perfil privado

Status: in-progress

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed. -->

## Story

Como usuario autenticado,
quiero ver mi perfil con métricas clave,
para entender mi posición en el sistema.

## Acceptance Criteria

1. **Given** la ruta protegida `/perfil` (convención española del proyecto; epics mencionan `/profile` — **usar `/perfil`**)  
   **When** cargo la página  
   **Then** se llama `UsersService.usersMeGet()` una vez al entrar  
   **And** se muestran los campos de `PrivateProfile`: `email`, `postalCode`, `reputationScore`, `totalReceived`, `totalDonated`, `consecutiveNoShows`, `createdAt`  
   **And** el diseño reproduce la cabecera y métricas de `docs/project/Perfil.html` (ProfileHeader L350–422, StatCards L296–313, bloque Cuenta L661–663)

2. **Given** `reputationScore` negativo (p. ej. `-30`)  
   **When** se renderiza la tarjeta de reputación  
   **Then** se muestra el valor real con signo (p. ej. `-30`, no `0` ni valor absoluto) — NFR-F7, mismo criterio que `ItemDonorRowComponent` / historia 2.4  
   **And** tono visual `low` (error) según umbrales existentes (`≥60` good, `≥20` fair, else low)

3. **Given** `reputationScore > 0`  
   **When** se renderiza  
   **Then** prefijo `+` opcional en display (p. ej. `+10`) — paridad prototipo L352

4. **Given** `consecutiveNoShows > 0`  
   **When** se muestra la métrica de no-shows  
   **Then** subtítulo con recuento consecutivo (prototipo L395–396: «N consecutivos»)

5. **Given** `createdAt` en ISO8601  
   **When** se renderiza cabecera  
   **Then** copy «Miembro desde …» con fecha localizada (`Intl` o pipe existente; no string hardcodeado)

6. **Given** usuario no autenticado  
   **When** accede a `/perfil`  
   **Then** `authGuard` redirige a `/login` con `returnUrl` (sin lógica duplicada en el componente)

7. **Given** error de carga (`401` manejado por interceptor; fallo de red u otro)  
   **When** `usersMeGet` rechaza  
   **Then** estado de error accesible con opción de reintentar (patrón `entregas` / `mis-objetos`: `loading` + `errorKey` + botón retry)

8. **Given** carga en curso  
   **When** aún no hay respuesta  
   **Then** skeleton o spinner coherente con el design system (sin flash de datos vacíos incorrectos)

9. **Given** ámbito de esta historia (5.1)  
   **When** implemento pestañas del prototipo (Donaciones, Solicitudes, Reputación, Configuración)  
   **Then** la barra de tabs puede mostrarse con **contenido placeholder** en tabs no-5.1 (empty state i18n «Próximamente» / enlace deshabilitado) — **no** implementar listados API de 5.2–5.4  
   **And** en tab **Configuración** (o sección «Cuenta» visible en primera carga): `email` y `postalCode` en solo lectura (edición postal = historia futura)

10. **Given** `reputationScore < 0` (usuario degradado) o usuario nuevo (`score === 0` y `totalDonated === 0` y `totalReceived === 0`)  
    **When** aplica  
    **Then** banner opcional alineado con `DegradedBanner` / `NewUserBanner` del prototipo (L316–347) con claves i18n — sin bloquear AC 1

## Tasks / Subtasks

### A. Sustituir placeholder `PerfilComponent`

- [x] **Cargar perfil** (AC: 1, 6–8)
  - Inyectar `UsersService`; en `ngOnInit` o `effect` al montar: `usersMeGet()` → `profile` signal
  - Estados: `loading`, `errorKey`, `reload()`
  - No usar `SessionService.user()` como fuente de métricas (puede estar desactualizado); perfil = API

- [x] **Template + estilos** (AC: 1–5, 9–10)
  - External template + SCSS (componente ya pequeño; crecerá — seguir patrón `entregas`, `mis-objetos`)
  - Leer **completo** `docs/project/Perfil.html` + `colors_and_type.css`
  - Layout: contenedor `max-width: 720px`, padding prototipo L799
  - Cabecera: avatar con `initialsFromUserId(profile.id)`, etiqueta display (parte local del `email` antes de `@`), «Miembro desde», fila con `postalCode` + icono pin
  - Fila `StatCard`: Reputación | Donados | Recibidos | No-shows (`consecutiveNoShows`)
  - Sección cuenta: email + postal (readonly)
  - Reutilizar lógica `scoreDisplay` / `scoreTone` — extraer a `core/utils/reputation-display.util.ts` **solo si** evita duplicar 3+ sitios; si no, copiar patrón de `ItemDonorRowComponent` en computed locales

- [x] **Tabs shell** (AC: 9)
  - Signal `activeTab`: `'donaciones' | 'solicitudes' | 'reputacion' | 'configuracion'` (default `'configuracion'` o vista que muestre cuenta + stats)
  - Tabs 5.2–5.4: `@empty` con claves `profile.tabs.coming_soon_*`
  - No llamar `usersMeReputationHistoryGet`, `usersMeItemsGet`, `usersMeRequestsGet` en 5.1

- [x] **Banners condicionales** (AC: 10)
  - `showDegradedBanner = reputationScore < 0`
  - `showNewUserBanner = score === 0 && totalDonated === 0 && totalReceived === 0`

### B. i18n

- [x] Claves en `public/i18n/{es,ca,en}.json` bajo `profile.*` (AC: 1, 5, 9–10)
  - Título página, labels stat cards, member_since, postal_label, account section, banners, tabs, loading, error, retry, coming_soon
  - **Prohibido** strings visibles en template salvo marca «regalalo»

### C. Tests

- [x] `perfil.component.spec.ts` (AC: 1–5, 7–8)
  - Mock `UsersService.usersMeGet` → resuelve `PrivateProfile`
  - Muestra email, postal, métricas, fecha formateada
  - `reputationScore: -30` → texto contiene `-30`
  - `consecutiveNoShows: 2` → subtítulo consecutivos
  - Error API → mensaje error + retry llama de nuevo
  - Loading → skeleton/spinner presente
  - `TranslocoTestingModule` con `es.json` parcial

- [ ] Regresión routing (opcional si ya cubierto): `app.routes.spec.ts` incluye `/perfil` con guard — no duplicar si verde

### D. Verificación manual

- [ ] Login → `/perfil` → datos reales del backend local
- [ ] Usuario con reputación negativa en BD → signo visible
- [ ] Logout → `/perfil` → redirect login
- [ ] Comparación visual con `Perfil.html` (estado `userState: activo` en tweaks)
<!-- Verificación manual pendiente de revisión humana -->

### Review Findings

- [x] [Review][Decision] Color de reputación — Resuelto: opción prototipo (`Perfil.html` L352–353): `> 0` → good/primary, `=== 0` → muted, `< 0` → low/error.

- [x] [Review][Patch] Fecha «Miembro desde» con `transloco.getActiveLang()` + guard `createdAt` inválido.

- [x] [Review][Patch] Score `0` con clase `--muted` (no `--low`).

- [x] [Review][Defer] Sin `<h1>` con `profile.title` [perfil.component.html] — deferred, pre-existing: `Perfil.html` tampoco define título de página fuera del header; coherente con shell de navegación.

- [x] [Review][Defer] Tabs sin `tabindex` / flechas de teclado [perfil.component.html:171-232] — deferred, pre-existing: mismo patrón que `entregas.component.html`.

## Dev Notes

### Contrato API (solo lectura)

```typescript
// GET /users/me → PrivateProfile
interface PrivateProfile {
  id: string;
  email: string;
  postalCode: string;
  reputationScore: number;      // puede ser negativo (test backend 21.4)
  totalReceived: number;
  totalDonated: number;
  consecutiveNoShows: number;
  createdAt: string;            // ISO8601
}
```

**Servicio:** `UsersService.usersMeGet()` — `src/app/core/api/generated/services/users.service.ts`  
**Path:** `/users/me` — no editar `generated/`

**Backend listo:** `backend/tests/users-me.test.ts` (21.1–21.5). Sin cambios backend salvo regresión.

### Ruta y guard

| Elemento | Valor |
|----------|--------|
| Ruta | `/perfil` en `profile.routes.ts` (ya existe) |
| Guard | `authGuard` en `app.routes.ts` padre del shell |
| Placeholder actual | `perfil.component.ts` solo `<h1>Mi perfil</h1>` — **reemplazar por completo** |

Epics dicen `/profile`; el router del proyecto usa español (`/explorar`, `/mis-objetos`, `/entregas`, `/perfil`). **No renombrar** sin correct-course.

### Diseño — `Perfil.html` (obligatorio)

| Zona prototipo | Líneas ref. | Implementación 5.1 |
|----------------|-------------|---------------------|
| ProfileHeader avatar + meta | 367–387 | Iniciales + display + member since + postal |
| StatCards | 391–397 | 4 métricas API |
| Tab bar | 400–418 | Shell; contenido parcial |
| SettingsTab Cuenta | 661–663 | Email + postal readonly |
| DegradedBanner / NewUserBanner | 316–347 | Condicional AC 10 |
| Donaciones / Solicitudes / Reputación tabs | 811–868 | Placeholder → historias 5.2–5.4 |

**Tokens:** `--primary`, `--error`, `--warn-*`, `--font-display`, `--font-mono`, sombras `sh1` desde `colors_and_type.css` / `styles.scss`.

### Reputación — NFR-F7 (no regresionar)

Patrón canónico ya en código:

```typescript
// item-donor-row.component.ts / item-select-receiver-dialog
scoreDisplay: score > 0 ? `+${score}` : String(score);
scoreTone: score >= 60 ? 'good' : score >= 20 ? 'fair' : 'low';
```

**Prohibido:** `Math.max(0, score)`, `Math.abs(score)`, ocultar fila si negativo.

### Display name

`PrivateProfile` **no** incluye `name`. Opciones aceptadas:

1. Parte local del email (`user@domain.com` → `user`) capitalizada, o  
2. Solo iniciales + «Mi perfil» como título  

No inventar nombre ficticio. Opcional: sincronizar `SessionService` tras carga si el login guarda `reputationScore` desactualizado (solo si ya existe patrón en otras pantallas).

### Brownfield — reutilizar

| Pieza | Ubicación | Uso 5.1 |
|-------|-----------|---------|
| `UsersService` | `generated/services/users.service.ts` | `usersMeGet()` |
| `initialsFromUserId` | `core/utils/user-initials.util.ts` | Avatar |
| `authGuard` | `core/guards/auth.guard.ts` | Ya en ruta |
| `ItemDonorRow` score tone | `shared/.../item-donor-row` | Copiar umbrales CSS |
| Carga lista + error | `entregas.component.ts` | Patrón signals + retry |
| App shell nav | `app-shell` → `/perfil` | Ya enlazado |

### Fuera de alcance (historias siguientes)

| Historia | API | UI prototipo |
|----------|-----|--------------|
| 5.2 | `GET /users/me/reputation-history` | Tab Reputación |
| 5.3 | `GET /users/me/items` | Tab Donaciones |
| 5.4 | `GET /users/me/requests` | Tab Solicitudes |
| 5.5 | `GET /users/:id` | Perfil público |
| — | PATCH postal, notificaciones, eliminar cuenta | SettingsTab completo |

### Errores

| Código | Comportamiento |
|--------|----------------|
| `401` | Interceptor + redirect login; componente no duplicar |
| Red / 5xx | `profile.errors.load` + retry |
| Respuesta vacía | Tratar como error |

### Project Structure Notes

```
src/app/features/profile/
  perfil/
    perfil.component.ts      # UPDATE — lógica principal
    perfil.component.html    # NEW
    perfil.component.scss    # NEW
    perfil.component.spec.ts # NEW
  profile.routes.ts          # sin cambios salvo hijos futuros 5.2+
```

Componentes compartidos nuevos **solo si** el tab shell se reutiliza en 5.2+ (`profile-tab-bar`); para 5.1 puede vivir inline en `perfil`.

### Referencias

- [Source: `_bmad-output/initiative-regalalo/archive-v6/epics.md` — Epic 5, Story 5.1, tabla diseño L141]
- [Source: `docs/project/Perfil.html` — ProfileHeader, StatCard, banners, tabs]
- [Source: `docs/architecture.md` — § GET /users/me L553–567, NFR reputación L805]
- [Source: `docs/api-client.md` — UsersService]
- [Source: `_bmad-output/project-context.md` — diseño, i18n, API generada]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/2-4-ver-detalle-de-objeto.md` — NFR-F7]
- [Source: `_bmad-output/initiative-regalalo/archive-v6/1-1-estructura-del-proyecto-layout-y-routing-base.md` — `/perfil`]
- [Source: `backend/tests/users-me.test.ts` — contrato 21.x]

## Previous story intelligence (Epic 4 — 4.5)

- Patrón de carga: signals + `inject(UsersService)` + tests con mock Promise (véase `entregas`, `mis-objetos`).
- i18n obligatorio en todos los copy nuevos; tests con `TranslocoTestingModule`.
- Diseño pixel-perfect bloqueante; revisar prototipo **antes** de codificar SCSS.
- `ItemCancelDialog` / delivery: no mezclar flujos de entrega en perfil.
- Code review 4.5: preferir CTA reales frente a hints «próximamente» — en 5.1 los tabs futuros pueden ser placeholder **explícito** con i18n, no hints silenciosos.

## Git intelligence summary

Commits recientes (épica 4): cancelación objeto con sesión, cancelación sesión no-show, confirmación entrega, panel entregas. Patrones: componentes feature con specs extensos, claves i18n triplicadas, servicios generados, utilidades en `core/utils/`.

## Latest tech information

- **Angular 21:** standalone por defecto, signals, `OnPush`, `inject()`.
- **Cliente API:** `UsersService.usersMeGet()` devuelve `Promise<PrivateProfile>` (OpenAPI gen actual).
- No requiere `npm run api:generate` salvo que el backend haya cambiado el contrato (no esperado para 5.1).

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Fallo landing.component.spec.ts: pre-existente (verificado con git stash; no causado por esta historia)
- Tests ejecutados con `ng test --no-watch`: 15/15 perfil pass, 362/364 total (2 fallos pre-existentes en landing)
- TypeScript check sin errores (`tsc --noEmit`)

### Completion Notes List

- `PerfilComponent` reemplazado completamente: signals `loading`, `errorKey`, `profile`, `activeTab`; computed `initials`, `displayName`, `memberSince`, `scoreDisplay`, `scoreTone`, `showDegradedBanner`, `showNewUserBanner`
- NFR-F7 respetado: `scoreDisplay` usa signo real (no `Math.abs`); `scoreTone` con umbrales canónicos (≥60 good, ≥20 fair, else low)
- Template fiel al prototipo Perfil.html: ProfileHeader (avatar iniciales + display name + member since + postal), StatCards (4 métricas), TabBar (4 tabs), SettingsTab (cuenta readonly), placeholders i18n para 5.2–5.4
- i18n: claves `profile.*` añadidas a es.json, ca.json, en.json (title, loading, member_since, stats, tabs, account, banners, errors)
- 15 tests unitarios cubren: loading, datos, signo negativo, consecutivos, error+retry, banners, tabs, fecha localizada

### File List

- src/app/features/profile/perfil/perfil.component.ts (modified)
- src/app/features/profile/perfil/perfil.component.html (new)
- src/app/features/profile/perfil/perfil.component.scss (new)
- src/app/features/profile/perfil/perfil.component.spec.ts (new)
- public/i18n/es.json (modified)
- public/i18n/ca.json (modified)
- public/i18n/en.json (modified)

### Change Log

- 2026-05-24: Implementación historia 5.1 — PerfilComponent con carga API, skeleton, error+retry, ProfileHeader, StatCards, TabBar, SettingsTab cuenta, banners condicionales, i18n triplicada (es/ca/en), 15 tests unitarios
