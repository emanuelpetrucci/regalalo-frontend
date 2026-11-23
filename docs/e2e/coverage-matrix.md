# E2E Coverage Matrix — Regálalo

Matriz de trazabilidad **FR (PRD)** → specs Playwright. Fuente de requisitos: `_bmad-output/initiative-regalalo/archive-v6/epics.md` §Inventario de Requisitos.

| FR | Descripción breve | Tipo | Spec | Escenario E2E | Estado |
|----|-------------------|------|------|---------------|--------|
| FR1 | Registro con email, contraseña, CP y reCAPTCHA V3 | ui | `e2e/tests/auth/register.spec.ts` | Registro UI (sin verificación email completa) | done |
| FR2 | Geocodificar CP al registrarse (Nominatim + cache) | ui | `e2e/tests/auth/register.spec.ts` | Mismo flujo registro | — |
| FR3 | JWT 7 días tras registro y login | ui | `e2e/tests/auth/login.spec.ts`, `register.spec.ts` | Login / registro | done |
| FR4 | Login con email, contraseña y reCAPTCHA V3 | ui | `e2e/tests/auth/login.spec.ts` | Login UI | done |
| FR5 | Recuperación de contraseña por email (siempre HTTP 200) | ui | `e2e/tests/critical/auth-reset-password.spec.ts` | `donor-only` + token E2E dev | planned |
| FR6 | Reset con token invalida JWT previos (`jwt_version`) | ui | `e2e/tests/critical/auth-reset-password.spec.ts` | Tras reset, login viejo 401 | planned |
| FR7 | Middleware valida `jwtVersion` vs BD | contract | — | — | — |
| FR8 | Publicar objeto (título, descripción, condición, categoría, peso, CP, hasta 5 imgs) | ui | `e2e/tests/items/publicar.spec.ts`, `flows/publicar-completo.spec.ts`, `flows/publicar-imagenes.spec.ts` | `publish-ui`, wizard 3 pasos | done |
| FR9 | Listar objetos activos ≤50 km, paginado, degradados al final | ui | `e2e/tests/items/explorar.spec.ts` | Feed explorar | done |
| FR10 | Detalle de objeto (estado, distancia, imágenes, reputación donante) | ui | `e2e/tests/items/explorar.spec.ts`, `mis-objetos.spec.ts` | Detalle / mis objetos | done |
| FR11 | Donante cancela objeto; si hay sesión activa, cancelarla y notificar (EVT-005) | ui | `e2e/tests/critical/item-cancel-active-session.spec.ts` | `delivery-active` | planned |
| FR12 | Solicitar objeto: límites, sin duplicado, máx. 3 / 720 h (SERIALIZABLE) | ui · contract | `e2e/tests/flows/solicitud-interesado.spec.ts` (parcial) → `contracts/request-limit.spec.ts` | `item-with-one-request`; `request-limit-reached` | planned |
| FR13 | Rechazar solicitud si `requests_paused = TRUE` (409) | contract | `e2e/tests/contracts/item-paused-409.spec.ts` | `item-paused` | planned |
| FR14 | Donante pausa/reanuda solicitudes (`PATCH …/pause`) | ui | `e2e/tests/critical/item-pausar-solicitudes.spec.ts` | `item-published` → pausa | planned |
| FR15 | Lista de candidatos rankeados (solo donante) | ui | `e2e/tests/flows/seleccion-ranking.spec.ts` | `ranking-three` | done |
| FR16 | Orden ranking: score efectivo, distancia, antigüedad (+ perturbación ±2) | ui | `e2e/tests/flows/seleccion-ranking.spec.ts` | `ranking-three` (scores 5/50/95) | done |
| FR17 | Excluir usuarios pasivos del ranking | contract | `e2e/tests/critical/ranking-passive.spec.ts` | `ranking-passive-hidden` | planned |
| FR18 | Control acaparador Tier 1 (−15) y Tier 2 (exclusión) | ui · contract | `e2e/tests/critical/ranking-hoarder.spec.ts` | `ranking-hoarder-tier1`, `ranking-hoarder-tier2` | planned |
| FR19 | Seleccionar receptor: sesión 7 días, reserved, EVT-003 | ui | `e2e/tests/flows/seleccion-ranking.spec.ts` | `ranking-three` | done |
| FR20 | Canal contacto en sesión solo para receptor activo no purgado | ui · contract | — | — | — |
| FR21 | Confirmar entrega: completed, reputación donante/receptor, contadores | ui | `e2e/tests/flows/entrega-confirmar.spec.ts` (parcial) → `critical/reputation-first-donation.spec.ts` | `delivery-active`; `donor-first-donation` (+15) | done |
| FR22 | Cancelar sesión con/sin no-show; penalización −10×consecutive | ui | `e2e/tests/flows/entrega-cancelar-donante.spec.ts`, `entrega-cancelar-no-show.spec.ts` → `critical/reputation-double-noshow.spec.ts` | `delivery-active`; `receiver-two-noshows` (−20) | done |
| FR23 | Expirar sesión al vencer deadline 7 días (sin penalización) | timing | `e2e/tests/flows/sesion-expirada.spec.ts` | `delivery-active` + `expire-session` | done |
| FR24 | Degradar objeto sin selección tras 7 días (EVT-012) | timing | `e2e/tests/flows/objetos-degradados.spec.ts` | `item-degraded` / degrade job | done |
| FR25 | Purgar imágenes físicas a 30 días (job + storage queue) | timing | — | Job pg_cron (no UI) | — |
| FR26 | Purgar canal contacto 7 días post-cierre sesión | timing | `e2e/tests/timing/purge-contact-channel.spec.ts` | `delivery-completed` + `purge-contact` | planned |
| FR27 | Incrementar `cycles_at_limit` por ciclo 30 días al agotar límite | contract | `e2e/tests/contracts/cycles-at-limit.spec.ts` | `request-limit-reached` + increment | planned |
| FR28 | Perfil privado `GET /users/me` | ui | `e2e/tests/profile/profile.spec.ts` | Usuario autenticado | done |
| FR29 | Historial reputación `GET /users/me/reputation-history` | ui | `e2e/tests/critical/profile-activity-filters.spec.ts` | Tras eventos reputación | planned |
| FR30 | Sesiones entrega propias con filtros rol/estado | ui | `e2e/tests/critical/profile-activity-filters.spec.ts` | `delivery-active` | planned |
| FR31 | Objetos publicados propios con filtro estado | ui | `e2e/tests/critical/profile-activity-filters.spec.ts` | Mis objetos / API | planned |
| FR32 | Solicitudes propias con filtro estado | ui | `e2e/tests/critical/profile-activity-filters.spec.ts` | Mis solicitudes | planned |
| FR33 | Perfil público `GET /users/:id` (sin email) | ui | `e2e/tests/critical/profile-public.spec.ts` | Usuario ajeno | planned |
| FR34 | Lectura devuelve `images: []` si completed/cancelled >30 días | timing | `e2e/tests/timing/imagenes-purga-lectura.spec.ts` | `delivery-completed` + backdate 31d | done |
| FR35 | Email confirmación tras reset contraseña (EVT-013) | — | — | — | — |
| FR36 | Registro exige `firstName`/`lastName`; `phone` opcional | ui | `e2e/tests/auth/register.spec.ts` | Formulario registro | done |
| FR37 | `GET /users/me` incluye identidad, avatar, `emailVerified`, idioma | ui | `e2e/tests/profile/profile.spec.ts` | Perfil (parcial) | done |
| FR38 | Perfil público: nombre, avatar, reputación, estadísticas | ui | `e2e/tests/critical/profile-public.spec.ts` | `GET /users/:id` | planned |
| FR39 | `PATCH /users/me`: cambio CP re-geocodifica e invalida JWT | ui | `e2e/tests/critical/profile-postal-change.spec.ts` | `donor-only` | planned |
| FR40 | Rechazar usuarios `is_active = FALSE` (401) | contract | — | — | — |
| FR41 | Persistir `category` y `weight_range` en publicación | ui | `e2e/tests/flows/publicar-completo.spec.ts` | Wizard publicación | done |
| FR42 | Eventos analítica AE-001…AE-031 post-commit | — | — | — | — |
| FR43 | Email verificación único 24 h tras registro (EVT-014) | ui | — | Flujo registro | — |
| FR44 | `GET /auth/verify-email?token=` público | — | — | — | — |
| FR45 | `POST /auth/resend-verification` con cooldown 30 s | — | — | — | — |
| FR46 | Rutas protegidas rechazan `email_verified = FALSE` (403) | ui · contract | `e2e/tests/critical/email-not-verified-guard.spec.ts` | Registro UI / `unverified-user` | planned |
| FR47 | Digest proximidad horario (EVT-015, cron HTTP) | contract | Backend `tests/` o contract API | `POST /api/jobs/nearby-items-digest` | n/a |
| FR48 | Alineación ranking/reputación v1.0 (RFC + tests) | — | — | Cubierto por specs ranking/entrega | — |
| FR49 | Candidato envía `contactChannel` al postular (no visible en lista) | ui | `e2e/tests/flows/solicitud-interesado.spec.ts` | `item-published` | done |
| FR50 | Donante ve `receiverContactChannel` en sesión activa no purgada | ui · contract | `e2e/tests/critical/delivery-contact-channels.spec.ts` | `delivery-with-receiver-channel` | planned |
| FR51 | Al seleccionar: copiar canal a sesión y purgar en `item_requests` | ui | `e2e/tests/flows/seleccion-ranking.spec.ts` (parcial) → `critical/delivery-contact-channels.spec.ts` | `ranking-three` | done |
| FR52 | Job purga ambos canales 7 días tras cierre sesión | timing | `e2e/tests/timing/purge-contact-channel.spec.ts` | `delivery-completed` + time helper | planned |

**Leyenda estado:** `done` — cubierto por spec existente (puede ser parcial; specs futuros indicados con `→` en columna Spec); `planned` — en plan fase 3 (`2026-06-04-e2e-critical-coverage.md`); `n/a` — fuera de alcance UI E2E; `—` — sin spec asignado aún.

---

## Mantenimiento

Al añadir o modificar un spec E2E, **actualizar la fila FR correspondiente en el mismo PR** (columnas Spec, Escenario E2E y Estado). No cerrar una tarea del plan de cobertura crítica sin reflejar el cambio aquí.
