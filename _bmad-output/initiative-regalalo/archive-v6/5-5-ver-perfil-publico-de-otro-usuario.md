# Story 5.5: Ver perfil público de otro usuario

Status: done

<!-- Validation: checklist BMad create-story aplicado. Ultimate context engine analysis completed. Fidelidad obligatoria a wireframes Perfil público (wireframes.html) + DonorRow (Explorar v3.html) + cabecera Perfil.html sin datos privados. -->

## Story

Como usuario autenticado,
quiero ver el perfil público de otro participante,
para evaluar fiabilidad antes o después de una interacción.

## Acceptance Criteria

1. **Given** la ruta protegida `/users/:id` (UUID v4 en `id`, bajo `AppShell` + `authGuard` como el resto de features autenticadas)
   **When** navego con un UUID válido
   **Then** se llama `UsersService.usersIdGet({ id })` una vez al entrar
   **And** se renderizan los campos de `PublicProfile`: `reputationScore`, `totalReceived`, `totalDonated`, `createdAt`
   **And** la UI sigue el wireframe «perfil público (otro usuario)» en `docs/project/wireframes.html` (L1558–1591) y la fila donante de `docs/project/Explorar v3.html` (DonorRow L377–400) para tono de reputación
   **And** **no** se muestran `email`, `postalCode`, `consecutiveNoShows`, `requestsPaused` ni pestañas de actividad privada (Donaciones / Solicitudes / Reputación / Configuración)

2. **Given** `reputationScore` negativo (p. ej. `-5`)
   **When** se renderiza la métrica principal
   **Then** se muestra el valor real con signo (NFR-F7) — **prohibido** `Math.max(0, …)` o `Math.abs`
   **And** tono visual: `> 0` → good/primary, `=== 0` → muted, `< 0` → low/error (misma regla que `PerfilComponent` / `ItemDonorRowComponent`)

3. **Given** `createdAt` en ISO8601
   **When** se renderiza la cabecera
   **Then** copy «Miembro desde …» con `Intl.DateTimeFormat(transloco.getActiveLang(), { month: 'long', year: 'numeric' })`
   **And** título de usuario: copy anónimo i18n (`profile.public.anonymous_user`) — **no** derivar nombre desde email (no existe en API pública)

4. **Given** avatar e iniciales
   **When** se renderiza
   **Then** `initialsFromUserId(profile.id)` (mismo criterio que donante/candidatos)
   **And** avatar 48×48 circular (wireframe) o 68×68 si se alinea a cabecera `Perfil.html` sin tabs — **elegir 48px** para paridad wireframe móvil

5. **Given** métricas públicas (grid 3 columnas, wireframe L1573–1579)
   **When** se muestran
   **Then** tres tarjetas con labels i18n (no reutilizar literalmente «No-shows» del perfil privado):

   | Campo API | Clave i18n sugerida | Copy ES (wireframe) |
   |-----------|---------------------|---------------------|
   | `reputationScore` (con signo) | `profile.public.stats.commitment` | Compromiso |
   | `totalDonated` | `profile.public.stats.given` | Ha regalado |
   | `totalReceived` | `profile.public.stats.received` | Ha aprovechado |

   **And** valores numéricos sin abreviar; reputación con prefijo `+` si `> 0`

6. **Given** nota informativa inferior (wireframe L1589–1591)
   **When** hay perfil cargado
   **Then** párrafo `profile.public.privacy_note` («Solo información pública visible…») en tipografía secundaria — **no** es error ni banner degradado

7. **Given** `id` en ruta no coincide con UUID v4 (mismo regex que `entrega-detalle.component.ts` L38–39)
   **When** entro en la ruta
   **Then** **no** llamar al API
   **And** pantalla de error `profile.public.errors.invalid_id` con CTA volver

8. **Given** `usersIdGet` responde `404`
   **When** el usuario no existe
   **Then** pantalla `profile.public.errors.not_found` (no confundir con `**` global)
   **And** CTA «Volver» que ejecuta `Location.back()`; si `history.length <= 1`, fallback `Router.navigate(['/explorar'])`

9. **Given** error de red u otro (no 401)
   **When** la petición falla
   **Then** `profile.public.errors.load` + botón «Reintentar» que relanza `usersIdGet`

10. **Given** `401`
    **When** token inválido
    **Then** interceptor JWT existente — el componente **no** duplica redirect

11. **Given** carga en curso
    **When** aún no hay respuesta
    **Then** skeleton coherente con `perfil` / `entrega-detalle` (avatar + 3 stat placeholders)

12. **Given** botón «Volver» en cabecera (wireframe L1563–1565)
    **When** el usuario pulsa
    **Then** `Location.back()` con el mismo fallback que AC 8
    **And** `aria-label` i18n `profile.public.back`

13. **Given** enlace desde **detalle de objeto** (`ItemDonorRowComponent` en `item-detail-panel`)
    **When** implemento 5.5
    **Then** la fila donante (o zona avatar+score) navega a `/users/{{ donor.id }}` sin romper layout ni accesibilidad (tecla Enter en enlace, foco visible)

14. **Given** enlace desde **candidatos rankeados** (`CandidateRowComponent` en `mis-objetos`)
    **When** el donante pulsa avatar o bloque de reputación (no el botón «Seleccionar»)
    **Then** navega a `/users/{{ candidate.userId }}`
    **And** el botón seleccionar sigue emitiendo `select` sin navegación accidental

15. **Given** enlace desde **sesión de entrega** (`entrega-detalle` bloque `otherParty`)
    **When** hay `otherParty.userId`
    **Then** la fila de contraparte es clicable → `/users/{{ userId }}` (AC epics «evaluar fiabilidad»)

16. **Given** el `id` de la ruta coincide con el usuario de sesión (`SessionService` / `profile.id` de `usersMeGet` si disponible, o `userId` en sesión)
    **When** cargo `/users/:id` propio
    **Then** **opcional recomendado:** `Router.navigate(['/perfil'], { replaceUrl: true })` para evitar vista pública redundante — documentar en PR si se omite

17. **Given** regresión épica 5.1–5.4
    **When** implemento 5.5
    **Then** `/perfil` y sus tabs siguen funcionando sin cambios de comportamiento

## Tasks / Subtasks

### A. Ruta y componente (AC: 1, 7–12, 16)

- [x] **Crear** `src/app/features/profile/perfil-publico/perfil-publico.component.ts|html|scss|spec.ts`
  - `inject(ActivatedRoute)`, `UsersService`, `TranslocoService`, `Location`, `Router`, `SessionService`
  - `userId = toSignal(route.paramMap → id)`
  - Signals: `loading`, `errorKey`, `profile: PublicProfile | null`
  - `loadProfile()` en `ngOnInit` + `effect` si cambia `id` en misma instancia
  - Validación UUID antes de fetch (copiar constante `UUID_V4` de `entrega-detalle`)
  - `catch (HttpErrorResponse)`: 404 → `not_found`; otros → `load`
  - Computed: `initials`, `scoreDisplay`, `scoreTone`, `memberSince`
  - `goBack()`: `Location.back()` + fallback `/explorar`

- [x] **Actualizar** `profile.routes.ts`:
  ```typescript
  {
    path: 'users/:id',
    loadComponent: () =>
      import('./perfil-publico/perfil-publico.component').then((m) => m.PerfilPublicoComponent),
  },
  ```
  - Ruta **hermana** de `perfil` bajo el mismo lazy `PROFILE_ROUTES` importado en `app.routes.ts` (ya protegido por `authGuard`)

- [x] **Layout** (AC: 1, 3–6)
  - Contenedor `max-width: 720px`, padding coherente con `perfil` (`perfil-publico` BEM)
  - Cabecera: botón back + fila avatar 48px + título anónimo + member since
  - Grid 3 stats (responsive: `grid-template-columns: repeat(3, 1fr)` con `gap` wireframe)
  - Nota privacidad al pie
  - **Sin** tab bar, **sin** banners degradado/nuevo usuario, **sin** stat no-shows

### B. Estilos (AC: 1, 4–6)

- [x] Tokens solo desde `colors_and_type.css` / variables globales
- [x] Reutilizar patrones SCSS de `perfil__stat-card` donde aplique (prefijo `perfil-publico__*`)
- [x] Score color: clases `--good|--muted|--low` alineadas a `perfil.component.scss`

### C. Enlaces de entrada (AC: 13–15)

- [x] **`item-donor-row`**: envolver fila en `<a routerLink="/users/{{ donor().id }}">` o `routerLink` en host con `role` accesible; mantener estructura DonorRow Explorar v3
- [x] **`candidate-row`**: enlace en avatar/meta (p. ej. `<a class="candidate-row__profile-link">`) con `(click)="$event.stopPropagation()"` en botón seleccionar si hace falta
- [x] **`entrega-detalle`**: `routerLink` en `entrega-detalle__party-row` cuando `otherParty.userId` definido
- [ ] **Opcional v1:** `item-select-receiver-dialog` — enlace en bloque candidato (misma ruta); no bloqueante si modal es estrecho

### D. i18n (AC: 3, 5–9, 12)

- [x] Añadir en `public/i18n/{es,ca,en}.json` bajo `profile.public`:
  ```json
  "public": {
    "title": "Perfil de usuario",
    "anonymous_user": "Usuario anónimo",
    "member_since": "Miembro desde {{date}}",
    "back": "Volver",
    "loading": "Cargando perfil…",
    "privacy_note": "Solo información pública visible. No se muestran datos de contacto ni historial detallado.",
    "stats": {
      "aria_label": "Métricas públicas",
      "commitment": "Compromiso",
      "given": "Ha regalado",
      "received": "Ha aprovechado"
    },
    "errors": {
      "invalid_id": "Identificador de usuario no válido.",
      "not_found": "No encontramos este usuario.",
      "load": "No se pudo cargar el perfil. Inténtalo de nuevo.",
      "retry": "Reintentar",
      "back_explore": "Explorar objetos"
    }
  }
  ```
- [x] `ca` y `en`: traducción real (no copiar ES)

### E. Tests (AC: 1–17)

- [x] **`perfil-publico.component.spec.ts`**
  - Mock `UsersService.usersIdGet` → `PublicProfile`
  - UUID inválido → error `invalid_id`, sin llamada API
  - 404 → `not_found`
  - Score `-5` visible en DOM
  - Score `+10` con prefijo `+`
  - Retry tras error
  - `goBack` llama `Location.back`
  - Loading skeleton presente

- [x] **`item-donor-row.component.spec.ts`** (AC: 13)
  - `routerLink` apunta a `/users/:id`

- [x] **`candidate-row.component.spec.ts`** (AC: 14)
  - Enlace perfil presente; click en «Seleccionar» no navega

- [x] Regresión: ejecutar subset `perfil.component.spec.ts` si se tocó shared routing

### F. Verificación manual

- [ ] Login → detalle objeto → clic donante → `/users/:uuid` con métricas
- [ ] Desde candidatos → perfil → Volver → vuelve a `mis-objetos`
- [ ] UUID inexistente → 404 UI
- [ ] Comparar con wireframe perfil público + DonorRow en detalle
- [ ] Regresión `/perfil` tabs

### Review Findings

- [x] [Review][Patch] Redirect a `/perfil` deja `loading=true` y muestra skeleton hasta completar navegación [src/app/features/profile/perfil-publico/perfil-publico.component.ts:91-94] — fixed 2026-05-24
- [x] [Review][Patch] Falta test: HTTP 400 → `profile.public.errors.invalid_id` (AC 7 / tabla errores) [src/app/features/profile/perfil-publico/perfil-publico.component.spec.ts] — fixed 2026-05-24
- [x] [Review][Patch] Falta test: `goBack()` con `history.length <= 1` navega a `/explorar` (AC 8) [src/app/features/profile/perfil-publico/perfil-publico.component.spec.ts] — fixed 2026-05-24
- [x] [Review][Patch] Falta test: enlace `otherParty` en entrega-detalle → `/users/:id` (AC 15) [src/app/features/delivery/entrega-detalle/entrega-detalle.component.spec.ts] — fixed 2026-05-24
- [x] [Review][Defer] Cambios en `perfil.component.spec.ts` (filtros solicitudes rechazadas) fuera del alcance 5.5 — mismo branch, no regresión de perfil público [src/app/features/profile/perfil/perfil.component.spec.ts] — deferred, pre-existing scope mix
- [x] [Review][Defer] Checklist verificación manual (sección F) sin marcar — pendiente QA humano antes de cerrar épica [5-5-ver-perfil-publico-de-otro-usuario.md] — deferred, proceso

## Dev Notes

### Contrato API (solo lectura)

```typescript
// GET /users/{id} → PublicProfile (200)
interface PublicProfile {
  id: string;
  reputationScore: number;   // puede ser negativo (test 26.4)
  totalReceived: number;
  totalDonated: number;
  createdAt: string;         // ISO8601
}

// UsersIdGet$Params
interface UsersIdGet$Params {
  id: string;
}
```

**Servicio:** `UsersService.usersIdGet(params)` — `Promise<PublicProfile>`  
**Path:** `/users/{id}` — **no editar** `src/app/core/api/generated/`

**Campos prohibidos en UI** (no vienen del API; no inventar): `email`, `postalCode`, `consecutiveNoShows`, `requestsPaused`, historial reputación, listados items/requests.

**Backend listo:** `backend/tests/users-public-profile.test.ts` (26.1–26.6). Sin cambios backend salvo regresión.

### Ruta y convenciones

| Elemento | Valor |
|----------|--------|
| Ruta UI | `/users/:id` (alineada con OpenAPI; epics dicen igual) |
| Perfil privado | `/perfil` — **no renombrar** |
| Guard | `authGuard` en padre `AppShell` — ruta no pública |
| Registro | `profile.routes.ts` junto a `perfil` |

### Diseño — fuentes obligatorias

| Fuente | Uso 5.5 |
|--------|---------|
| `docs/project/wireframes.html` L1558–1591 | Layout perfil público: back, avatar, 3 stats, nota pie |
| `docs/project/Explorar v3.html` L377–400 | DonorRow: score + label reputación (good/fair/low) |
| `docs/project/Perfil.html` L350–397 | Referencia de StatCard y score color — **omitir** fila no-shows y tab bar |
| `docs/project/colors_and_type.css` | Tokens |

**Diferencias deliberadas vs perfil privado (`Perfil.html`):**

| Privado (5.1) | Público (5.5) |
|---------------|---------------|
| 4 stat cards (+ no-shows) | 3 stat cards |
| displayName desde email | «Usuario anónimo» |
| postal en cabecera | omitido |
| tabs + contenido API | omitido |
| banners degradado / nuevo | omitido |

### Reputación — NFR-F7

```typescript
// Patrón canónico (perfil.component.ts, item-donor-row, candidate-row)
scoreDisplay: score > 0 ? `+${score}` : String(score);
scoreTone: score > 0 ? 'good' : score < 0 ? 'low' : 'muted'; // perfil privado
// item-donor-row usa good/fair/low por umbrales 60/20 — en stat «Compromiso» usar tono de perfil público (wireframe) o fair para 20–59 si se muestra label secundario opcional
```

Para la tarjeta «Compromiso», el **número** usa color por signo (AC 2). Label secundario tipo DonorRow («Buen historial») es **opcional** bajo el valor si cabe sin saturar — reutilizar claves `items.detail.reputation_*` o duplicar bajo `profile.public.reputation_*`.

### Manejo de errores

| Caso | Comportamiento |
|------|----------------|
| UUID inválido en ruta | Cliente: `invalid_id`, sin HTTP |
| 400 backend | Tratar como `invalid_id` |
| 404 | `not_found` |
| 401 | Interceptor |
| Red / 5xx | `load` + retry |

Mapper HTTP: si no existe util para users, mapear inline en el componente (patrón `mapDeliverySessionError` en delivery).

### Brownfield — reutilizar

| Pieza | Ubicación | Uso 5.5 |
|-------|-----------|---------|
| `usersIdGet` | `generated/services/users.service.ts` | Carga perfil |
| `initialsFromUserId` | `core/utils/user-initials.util.ts` | Avatar |
| `UUID_V4` regex | `entrega-detalle.component.ts` | Validación ruta |
| Skeleton/error/retry | `perfil.component.*` | Patrones UX |
| `ItemDonorRowComponent` | `shared/.../item-donor-row` | Enlace entrada |
| `CandidateRowComponent` | `shared/.../candidate-row` | Enlace entrada |
| `SessionService` | `core/services/session.service.ts` | Redirect opcional a `/perfil` |

### Fuera de alcance

| Tema | Motivo |
|------|--------|
| Historial reputación público | No en API |
| Listados objetos/solicitudes del otro | Privacidad |
| Editar perfil ajeno | N/A |
| Perfil sin autenticación | FR-F24 exige usuario autenticado |
| `requestsPaused` | No expuesto en API pública |
| Chat o contacto | SEC-002 solo en sesión entrega |

### Project Structure Notes

```
src/app/features/profile/
  perfil-publico/
    perfil-publico.component.ts      # NEW
    perfil-publico.component.html    # NEW
    perfil-publico.component.scss    # NEW
    perfil-publico.component.spec.ts # NEW
  profile.routes.ts                  # UPDATE — users/:id
  perfil/                            # sin cambios salvo regresión
src/app/shared/components/
  item-donor-row/                    # UPDATE — routerLink
  candidate-row/                     # UPDATE — enlace perfil
src/app/features/delivery/entrega-detalle/  # UPDATE — enlace otherParty
public/i18n/{es,ca,en}.json          # UPDATE profile.public.*
```

**No** extraer `StatCardComponent` compartido en 5.5 salvo que el diff lo justifique; duplicar markup mínimo con BEM `perfil-publico__*`.

### Referencias

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 5, Story 5.5, FR-F24, diseño L145]
- [Source: `docs/project/wireframes.html` — perfil público L1558–1591]
- [Source: `docs/project/Explorar v3.html` — DonorRow L377–400]
- [Source: `docs/project/Perfil.html` — StatCard L297–313, ProfileHeader parcial]
- [Source: `docs/architecture.md` — GET /users/:id L690–708, NFR presentación L805–806]
- [Source: `docs/api-client.md` — UsersService.usersIdGet]
- [Source: `src/app/core/api/generated/models/public-profile.ts`]
- [Source: `backend/tests/users-public-profile.test.ts` — contrato 26.x]
- [Source: `_bmad-output/implementation-artifacts/5-4-ver-mis-solicitudes-realizadas.md` — patrones carga/error]
- [Source: `_bmad-output/implementation-artifacts/5-1-ver-perfil-privado.md` — scoreDisplay, memberSince]
- [Source: `_bmad-output/implementation-artifacts/2-4-ver-detalle-de-objeto.md` — ItemDonorRow enlace diferido a 5.5]
- [Source: `_bmad-output/project-context.md` — diseño pixel-perfect, i18n, API generada]

## Previous story intelligence

### 5.4 (solicitudes — recién en review)

- Patrón signals + `inject(UsersService)` + tests con mock Promise consolidado en `perfil.component.spec.ts` (~45 tests).
- i18n bajo `profile.requests.*` — seguir namespace `profile.public.*` paralelo.
- No tocar lógica de tabs al añadir ruta hermana.

### 5.1 (perfil privado)

- `scoreTone` con tres estados (`good` / `muted` / `low`) por signo — **reutilizar** en público.
- `memberSince` con `transloco.getActiveLang()` — copiar.
- Display name privado usa email — **no** portar a público.

### 3.2 / 2.4 (entradas)

- `CandidateRowComponent` y `ItemDonorRowComponent` ya calculan `scoreDisplay` / `initials` — solo añadir navegación.
- Code review 2.4 dejó enlace donante «opcional en 5.5» — **ahora obligatorio** (AC 13).

### Epic 5 — cierre

- Última historia funcional de la épica 5 en sprint-status.
- Tras `dev-story` + `code-review`, valorar marcar `epic-5: done` cuando 5.5 esté `done`.

## Git intelligence summary

Commits recientes: tab Solicitudes (5.4), Donaciones (5.3), Reputación (5.2), shell perfil (5.1). Patrón: un componente feature por vista, SCSS BEM prefijado, i18n triplicada, tests Vitest con `TranslocoTestingModule`, servicios generados.

## Latest tech information

- **Angular 21:** standalone por defecto, `toSignal` + `paramMap`, `OnPush`, `inject()`.
- **`usersIdGet`:** ya en cliente generado — **no** requiere `npm run api:generate`.
- **`Location.back()`:** usar `inject(Location)`; comprobar `history.length` para fallback (navegadores modernos).
- **RouterLink en filas interactivas:** cuidado con botones anidados — separar enlace avatar vs botón acción (AC 14).

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

### Completion Notes List

- Implementado `PerfilPublicoComponent` en `/users/:id` con `UsersService.usersIdGet`, validación UUID v4, estados carga/error/éxito, reputación con signo (NFR-F7), redirect a `/perfil` si es el usuario de sesión, y `goBack` con fallback a `/explorar`.
- Enlaces de entrada: `item-donor-row`, `candidate-row` (avatar/meta separado del botón Seleccionar), `entrega-detalle` (otherParty).
- i18n `profile.public.*` en es/ca/en.
- 15 tests Vitest pasando (perfil-publico, item-donor-row, candidate-row).

### File List

- src/app/features/profile/perfil-publico/perfil-publico.component.ts
- src/app/features/profile/perfil-publico/perfil-publico.component.html
- src/app/features/profile/perfil-publico/perfil-publico.component.scss
- src/app/features/profile/perfil-publico/perfil-publico.component.spec.ts
- src/app/features/profile/profile.routes.ts
- src/app/shared/components/item-donor-row/item-donor-row.component.ts
- src/app/shared/components/item-donor-row/item-donor-row.component.html
- src/app/shared/components/item-donor-row/item-donor-row.component.scss
- src/app/shared/components/item-donor-row/item-donor-row.component.spec.ts
- src/app/shared/components/candidate-row/candidate-row.component.ts
- src/app/shared/components/candidate-row/candidate-row.component.html
- src/app/shared/components/candidate-row/candidate-row.component.scss
- src/app/shared/components/candidate-row/candidate-row.component.spec.ts
- src/app/features/delivery/entrega-detalle/entrega-detalle.component.html
- src/app/features/delivery/entrega-detalle/entrega-detalle.component.scss
- public/i18n/es.json
- public/i18n/ca.json
- public/i18n/en.json

### Change Log

- 2026-05-24: Story 5.5 — perfil público, ruta `/users/:id`, enlaces desde donante/candidatos/entrega, i18n y tests.
