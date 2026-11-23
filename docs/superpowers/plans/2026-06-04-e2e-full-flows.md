# E2E Full Business Flows — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extender la suite Playwright del frontend para probar de punta a punta los flujos de publicación, solicitudes, selección con ranking, sesiones de entrega (confirmar, cancelar con/sin penalización, expiración) y comportamientos dependientes del tiempo, contra un backend Node + Postgres dedicados a E2E.

**Architecture:** El **backend es el único dueño** del estado de datos E2E: purga o recrea la base, ejecuta migraciones si hace falta, y **genera cada escenario completo** (usuarios verificados, JWT, items, solicitudes, sesiones, timestamps alterados) vía API interna protegida (`E2E_ENABLED` + `E2E_SECRET`). Playwright **no escribe en Postgres** (`pg` se elimina del frontend E2E); antes de cada spec llama `POST /api/e2e/scenarios/:name` y recibe tokens + IDs listos para `injectSession`. Reutilizar lógica de `scripts/seed.ts` (TRUNCATE, argon2, imágenes placeholder, geografía) refactorizada en `src/e2e/`. Modo `APP_ENV=e2e` con `.env.e2e` (CORS `4201`, `DATABASE_URL` dedicada, storage `.storage-e2e`). Tests de tiempo: endpoints E2E que aplican el mismo SQL que `pg_cron` (degradar, expirar sesión, backdate).

**Tech Stack:** Playwright 1.54, Angular 21 (`:4201`), Express backend (`:3000`), Postgres/PostGIS (`nolv_e2e` o `nolv_e2e_w{N}`), módulo `src/e2e/` en backend.

**Prerrequisito:** Plan fase 1 (`2026-06-03-e2e-tests.md`) implementado o equivalente (`playwright.config.ts`, `e2e/fixtures`, `environment.e2e`, helpers auth/api/db).

---

## Mapa de flujos solicitados

| # | Flujo | Spec objetivo | Dependencias |
|---|--------|---------------|--------------|
| F1 | Publicación completa | `e2e/tests/flows/publicar-completo.spec.ts` | 1 imagen fixture, wizard 3 pasos |
| F2 | Interesado solicita objeto | `e2e/tests/flows/solicitud-interesado.spec.ts` | 2 usuarios, item publicado |
| F3 | Selección revisando puntaje (varios receptores) | `e2e/tests/flows/seleccion-ranking.spec.ts` | 3+ usuarios, scores muy separados |
| F4 | Publicar → seleccionar → confirmar recepción | `e2e/tests/flows/entrega-confirmar.spec.ts` | sesión activa |
| F5 | Publicar → seleccionar → cancelar sin penalización | `e2e/tests/flows/entrega-cancelar-donante.spec.ts` | `noShow: false` |
| F6 | Publicar → seleccionar → cancelar con penalización | `e2e/tests/flows/entrega-cancelar-no-show.spec.ts` | `noShow: true`, assert `reputation_events` |
| F7 | Publicar → seleccionar → expiración por inactividad | `e2e/tests/flows/sesion-expirada.spec.ts` | `deadline_at` en pasado + SQL expire |
| F8 | Objetos degradados | `e2e/tests/flows/objetos-degradados.spec.ts` | `created_at` −8d + SQL degrade |
| F9 | Eliminar imágenes en publicación | `e2e/tests/flows/publicar-imagenes.spec.ts` | `image-picker` × botón quitar |
| T* | Flujos con tiempo (inventario) | `e2e/tests/flows/timing/*.spec.ts` | `POST /api/e2e/time/*` en backend |

---

## Constantes de dominio (referencia para tests)

| Regla | Valor en código/SQL | Cómo acelerar en E2E |
|--------|---------------------|----------------------|
| Degradación objeto inactivo | `created_at < NOW() - 7 days` ([migration 006](backend/src/infrastructure/database/supabase/migrations/006-create-item-requests-and-degrade-job.sql)) | `POST /api/e2e/time/degrade-item/:itemId` |
| Deadline sesión entrega | `DEFAULT NOW() + 7 days` ([migration 009](backend/src/infrastructure/database/supabase/migrations/009-create-delivery-sessions.sql)) | Incluido en escenario o `POST /api/e2e/time/expire-session/:sessionId` |
| Expiración sesión (pg_cron) | `deadline_at < NOW()` → `expired`, item `active` ([migration 011](backend/src/infrastructure/database/supabase/migrations/011-setup-expire-sessions-and-purge-contact-channel-jobs.sql)) | Mismo endpoint `expire-session` (ejecuta CTE migration 011) |
| Penalización no-show | `delta = -10 * consecutive_no_shows` ([delivery-session.repository.ts](backend/src/infrastructure/database/supabase/delivery-session.repository.ts)) | Escenario `delivery-active` + UI cancel; assert vía `GET /users/me` reputación |
| Ranking perturbación | `FLOOR(RANDOM() * 5 - 2)` en SQL | Escenario `ranking-three` fija reputaciones 5/50/95 en seed |
| Imágenes purgadas (lectura) | `completed_at < NOW() - 30 days` en GET item | `POST /api/e2e/time/purge-images-view/:itemId` (backdate + listo para GET) |
| Purga canal contacto | `completed_at < NOW() - 7 days` en sesión cerrada | `POST /api/e2e/time/purge-contact/:sessionId` |

---

## File Map (fase 2)

```
Backend (../backend/):
  src/config/load-env.ts                          modify — APP_ENV incluye 'e2e'
  src/config/env.ts                               modify — E2E_ENABLED, E2E_SECRET
  src/e2e/
    e2e-guard.ts                                  create — 403 si !E2E_ENABLED o production
    e2e-auth.middleware.ts                        create — x-e2e-secret (timingSafeEqual)
    database/
      purge-database.ts                           create — TRUNCATE ordenado + wipe storage local
      recreate-database.ts                        create — DROP/CREATE DB + migrate (opcional CI)
    scenarios/
      types.ts                                    create — E2eScenarioPayload, ActorToken
      registry.ts                                 create — mapa nombre → builder
      empty.scenario.ts
      donor-only.scenario.ts
      item-with-requests.scenario.ts
      ranking-three.scenario.ts
      delivery-active.scenario.ts
      item-degraded.scenario.ts
      ... (uno por flujo F1–F8 donde aplique pre-seed)
    time/
      degrade-item.ts                             create — SQL job degradación
      expire-session.ts                           create — CTE migration 011
      backdate-item-completed.ts
      purge-contact-channel.ts
    seed-helpers.ts                               create — extraído de scripts/seed.ts
  src/interfaces/http/routes/e2e.routes.ts        create
  src/interfaces/http/controllers/e2e.controller.ts
  src/app.ts o routes/index.ts                    modify — montar /e2e solo si E2E_ENABLED
  scripts/e2e-db.ts                               create — CLI: purge | recreate | create-worker
  .env.e2e.example                                create
  docker-compose.e2e.yml                          create — Postgres + DB nolv_e2e (opcional)
  docs/e2e.md                                     create
  package.json                                    modify — dev:e2e, e2e:db:*, test:e2e (vitest del módulo)
  tests/e2e-scenarios.test.ts                     create — supertest escenarios + guard

Frontend (./):
  playwright.config.ts                            modify — E2E_SECRET, sin pg
  package.json                                    modify — quitar dep pg si solo era e2e
  e2e/
    global-setup.ts                               modify — verificar /api/e2e/health o /api/health
    fixtures/
      test.ts                                     modify — seededScenario fixture
    helpers/
      e2e-api.ts                                  create — resetScenario, advanceTime
      auth.ts                                     modify — injectSession desde payload backend
      api.ts                                      slim — solo llamadas UI que no seed (opcional)
    helpers/db.ts                                 DELETE — lógica movida al backend
    assets/test-image.jpg
    pages/...
    tests/flows/...
```

---

## Contrato API E2E (backend)

Solo disponible si `E2E_ENABLED=true` y `NODE_ENV !== 'production'`. Todas las rutas exigen header `x-e2e-secret`.

### `POST /api/e2e/database/purge`

Vacía datos de aplicación (mismo efecto que inicio de `scripts/seed.ts`):

- `TRUNCATE analytics_events, storage_deletion_queue, reputation_events, delivery_sessions, item_requests, item_images, items, users CASCADE` (ajustar orden FK real).
- Si `STORAGE_DRIVER=local`: borrar contenido de `LOCAL_STORAGE_DIR` excepto `.gitkeep`.

Respuesta: `{ purged: true }`.

### `POST /api/e2e/database/recreate` (opcional, CI)

- Conecta a `postgres` admin URL (`E2E_ADMIN_DATABASE_URL` o `DATABASE_URL` con db `postgres`).
- `DROP DATABASE IF EXISTS nolv_e2e` → `CREATE DATABASE nolv_e2e` → ejecuta `scripts/migrate.ts` contra esa URL.
- Útil cuando el esquema o extensiones quedaron corruptos; **más lento** que purge.

### `POST /api/e2e/scenarios/:name`

Body opcional: `{ workerId?: number }` para logging.

**Siempre** ejecuta `purge` antes de sembrar (aislamiento total por llamada).

Respuesta estándar:

```typescript
interface E2eScenarioResponse {
  scenario: string;
  actors: Record<string, {
    id: string;
    email: string;
    password: string;  // fijo E2E: 'Test1234!'
    token: string;     // JWT listo para localStorage
    firstName: string;
    lastName: string;
  }>;
  entities: {
    itemId?: string;
    sessionId?: string;
    requestIds?: string[];
    // ...
  };
}
```

### Catálogo de escenarios (v1)

| Nombre | Actores | Estado generado |
|--------|---------|-----------------|
| `empty` | — | BD vacía tras purge |
| `donor-only` | `donor` | Usuario verificado, sin items |
| `item-published` | `donor` | 1 item activo con imágenes, sin solicitudes (para F2 UI) |
| `item-with-one-request` | `donor`, `receiver` | 1 item activo, 1 solicitud pending |
| `ranking-three` | `donor`, `r1`,`r2`,`r3` | 1 item, 3 solicitudes; reputación 5, 50, 95 |
| `delivery-active` | `donor`, `receiver` | Sesión `active`, item `reserved` |
| `delivery-completed` | `donor`, `receiver` | Sesión `completed` (para purgas tiempo) |
| `item-degraded` | `donor` | Item `active` con `degraded_at` set |
| `publish-ui` | `donor` | Solo usuario; el spec publica por UI (F1, F9) |

Los specs que **prueban** la acción (confirmar, cancelar, solicitar) usan escenarios **anteriores** al paso bajo test (p. ej. `delivery-active` + UI confirma).

### Rutas de tiempo

| Método | Efecto |
|--------|--------|
| `POST /api/e2e/time/degrade-item/:itemId` | Backdate `created_at` 8d + SQL degradación |
| `POST /api/e2e/time/expire-session/:sessionId` | `deadline_at` pasado + CTE expire sessions |
| `POST /api/e2e/time/backdate-item-completed/:itemId` | Body `{ days: 31 }` para FR34 |
| `POST /api/e2e/time/purge-contact/:sessionId` | Simula job purga canal 7d |

---

## Flujo por test (Playwright)

```mermaid
sequenceDiagram
  participant PW as Playwright
  participant API as Backend /api/e2e
  participant UI as Angular :4201

  PW->>API: POST /scenarios/delivery-active (x-e2e-secret)
  API->>API: purge + seed + JWT
  API-->>PW: actors + entities
  PW->>UI: injectSession(donor.token)
  PW->>UI: acciones usuario
  PW->>API: POST /time/expire-session (si aplica)
  PW->>UI: assert estado
```

**No hay cleanup en frontend:** el siguiente `POST /scenarios/*` purga todo.

---

## Task 1: `APP_ENV=e2e` y variables de entorno

**Files:**
- Modify: `../backend/src/config/load-env.ts`
- Modify: `../backend/src/config/env.ts`
- Create: `../backend/.env.e2e.example`

- [ ] **Step 1: Añadir `e2e` a `VALID_APP_ENV`**

  Carga `.env.e2e` cuando `APP_ENV=e2e`.

- [ ] **Step 2: Variables en `env.ts`**

  ```typescript
  E2E_ENABLED: parseBooleanEnv('E2E_ENABLED', false),
  E2E_SECRET: process.env['E2E_SECRET'] ?? '', // required min 32 when E2E_ENABLED
  E2E_DEFAULT_PASSWORD: process.env['E2E_DEFAULT_PASSWORD'] ?? 'Test1234!',
  ```

  En `production`: `E2E_ENABLED` forzado a `false` aunque venga en env.

- [ ] **Step 3: Crear `.env.e2e.example`**

  ```
  APP_ENV=e2e
  NODE_ENV=development
  E2E_ENABLED=true
  E2E_SECRET=local-e2e-secret-min-32-characters-long
  DATABASE_URL=postgresql://nolv:nolv@localhost:5432/nolv_e2e
  CORS_ORIGIN=http://localhost:4201
  APP_PUBLIC_URL=http://localhost:4201
  STORAGE_DRIVER=local
  LOCAL_STORAGE_DIR=.storage-e2e
  LOG_LEVEL=warn
  ```

  BD **separada** (`nolv_e2e`) para no pisar datos de desarrollo en `nolv`.

- [ ] **Step 4: Commit**

---

## Task 2: Purga y recreación de base de datos (backend)

**Files:**
- Create: `../backend/src/e2e/database/purge-database.ts`
- Create: `../backend/src/e2e/database/recreate-database.ts`
- Create: `../backend/scripts/e2e-db.ts`

- [ ] **Step 1: `purgeDatabase(pool)`**

  Extraer TRUNCATE de `scripts/seed.ts` + incluir tablas de entregas/reputación.
  Función `wipeLocalStorage(dir)` si `STORAGE_DRIVER=local`.

- [ ] **Step 2: `recreateDatabase(adminUrl, dbName)`**

  - `CREATE DATABASE nolv_e2e` si no existe (idempotente).
  - Invocar migraciones (reutilizar lógica de `scripts/migrate.ts` exportable).

- [ ] **Step 3: CLI `scripts/e2e-db.ts`**

  ```bash
  npm run e2e:db:create    # CREATE DATABASE nolv_e2e
  npm run e2e:db:migrate    # migrate contra DATABASE_URL de .env.e2e
  npm run e2e:db:purge      # solo purge (sin levantar HTTP)
  npm run e2e:db:recreate   # drop + create + migrate
  ```

- [ ] **Step 4: Documentar en `docs/e2e.md`**

  Primera vez: `e2e:db:create && e2e:db:migrate`. Día a día: solo `dev:e2e` (purge vía API por escenario).

- [ ] **Step 5: Test vitest** — `purge` deja `COUNT(*)=0` en users/items.

- [ ] **Step 6: Commit**

---

## Task 3: Módulo E2E HTTP (guard, rutas, purge + scenarios)

**Files:**
- Create: `../backend/src/e2e/e2e-auth.middleware.ts`
- Create: `../backend/src/e2e/scenarios/registry.ts` + builders mínimos (`empty`, `donor-only`)
- Create: `../backend/src/e2e/seed-helpers.ts` (usuarios, items, imágenes — refactor desde `seed.ts`)
- Create: `../backend/src/interfaces/http/routes/e2e.routes.ts`
- Modify: `../backend/src/interfaces/http/routes/index.ts`

- [ ] **Step 1: Middleware `e2eAuth` + guard**

  Si `!env.E2E_ENABLED` → `404` (ocultar superficie).

- [ ] **Step 2: `E2eController.resetScenario(name)`**

  1. `await purgeDatabase()`
  2. `await scenarioRegistry[name](ctx)` — usa repos/use-cases reales donde sea posible (publish vía `PublishItemUseCase`, requests vía `RequestItemUseCase`, etc.) para no duplicar reglas de negocio.
  3. Emitir JWT con `JwtService.sign({ sub: userId })` por actor.
  4. Return `E2eScenarioResponse`.

- [ ] **Step 3: Rutas**

  ```
  POST /api/e2e/database/purge
  POST /api/e2e/database/recreate
  POST /api/e2e/scenarios/:name
  ```

- [ ] **Step 4: Test supertest**

  Sin header → 401. Con `E2E_ENABLED=false` → 404. `POST scenarios/donor-only` → 200 + token válido en `GET /users/me`.

- [ ] **Step 5: `package.json`**

  ```json
  "dev:e2e": "cross-env APP_ENV=e2e tsx watch src/main.ts"
  ```

- [ ] **Step 6: Commit**

---

## Task 4: Builders de escenarios (todos los flujos F1–F8)

**Files:**
- Create: escenarios listados en catálogo v1
- Modify: `registry.ts`

- [ ] **Step 1: `ranking-three`** — reputaciones fijas, mismo `postalCode`/`location` (Madrid `28001` o reutilizar coords seed Buenos Aires de forma consistente).

- [ ] **Step 2: `item-with-one-request`**, **`delivery-active`**

  Usar casos de uso `SelectReceiverUseCase` con canal de contacto de prueba.

- [ ] **Step 3: `item-degraded`** — item activo + llamada interna SQL degradación o `created_at` backdate en builder.

- [ ] **Step 4: Tests vitest** — cada escenario devuelve `entities` esperadas (smoke).

- [ ] **Step 5: Commit**

---

## Task 5: Rutas de tiempo en backend

**Files:**
- Create: `../backend/src/e2e/time/*.ts`
- Modify: `e2e.routes.ts`

- [ ] **Step 1: Implementar 4 endpoints** (tabla contrato API arriba).

- [ ] **Step 2: Tests vitest** — `expire-session` deja `status=expired` e item `active`.

- [ ] **Step 3: Commit**

---

## Task 6: Cliente Playwright (`e2e-api.ts` + fixtures)

**Files:**
- Create: `e2e/helpers/e2e-api.ts`
- Modify: `e2e/fixtures/test.ts`
- Delete: `e2e/helpers/db.ts`
- Modify: `e2e/helpers/auth.ts` — quitar `verifyUserEmail` / `deleteUser` / registro API
- Modify: `e2e/global-setup.ts`
- Modify: `package.json` — eliminar `pg`, `@types/pg` si ya no se usan

- [ ] **Step 1: `e2e-api.ts`**

  ```typescript
  const E2E_SECRET = process.env['E2E_SECRET'] ?? '...';
  export async function resetScenario(request, name: string): Promise<E2eScenarioResponse>
  export async function e2eExpireSession(request, sessionId: string): Promise<void>
  // ...
  ```

- [ ] **Step 2: Fixture `seededScenario`**

  ```typescript
  seededScenario: [async ({ request }, use, testInfo) => {
    const name = testInfo.annotations.find(a => a.type === 'scenario')?.description ?? 'donor-only';
    const data = await resetScenario(request, name);
    await use(data);
  }, { auto: false }]
  ```

  Cada spec declara: `test.use({ annotation: [{ type: 'scenario', description: 'delivery-active' }] } });` o fixture parametrizado `scenario('delivery-active')`.

- [ ] **Step 3: Fixture `dualBrowser`**

  Recibe `E2eScenarioResponse`, abre dos contextos con `injectSession` para `actors.donor` y `actors.receiver`.

- [ ] **Step 4: Deprecar `authPage` basado en registro** — sustituir por `donorPage` desde escenario salvo tests de registro/login (fase 1).

- [ ] **Step 5: `global-setup`**

  Verificar backend + opcional `POST /api/e2e/database/purge` una vez al inicio de la suite.

- [ ] **Step 6: Commit frontend**

---

## Task 7: Bases por worker (paralelo CI, opcional)

**Files:**
- Modify: `scripts/e2e-db.ts`, `playwright.config.ts`, `.env.e2e.example`

- [ ] **Step 1: `create-worker --id N`**

  Crea `nolv_e2e_w{N}` y migra.

- [ ] **Step 2: Playwright `workers: 2` en CI**

  `DATABASE_URL` en backend no cambia por worker; en su lugar el **body** de reset incluye `workerId` y el backend usa `getDatabaseUrl(workerId)` — o un proceso backend por worker (más simple: **mantener `workers: 1`** en fase 2 y documentar worker DB como fase 2b).

- [ ] **Step 3: Commit**

**Decisión por defecto:** `workers: 1` + una BD `nolv_e2e` + purge por escenario. Paralelo solo tras Task 7.

---

## Task 8: Asset y page objects

**Files:**
- Create: `e2e/assets/test-image.jpg`
- Modify: `e2e/pages/publicar.page.ts`
- Create: `e2e/pages/mis-objetos.page.ts`
- Create: `e2e/pages/entrega-detalle.page.ts`

- [ ] **Step 1: Añadir imagen fixture** (JPEG real, ~50–200 KB)

- [ ] **Step 2: `PublicarPage` — flujo completo**

  Métodos: `fillStep1()`, `uploadImages(paths)`, `removeImageAt(index)`, `goToReview()`, `submit()`, assert `publish-success`.

  Selectores existentes: `publish-title`, `publish-description`, `publish-condition`, `publish-category`, `publish-weight-range`, `publish-images`, `publish-submit`.

- [ ] **Step 3: `MisObjetosPage`**

  Locators: `candidate-card`, `select-candidate-btn`, tab/objeto expandido, badge degradado si existe.

- [ ] **Step 4: `EntregaDetallePage`**

  Locators: `delivery-status`, `delivery-confirm-btn`, `delivery-cancel-btn`, diálogos confirm/cancel (checkbox no-show).

- [ ] **Step 5: Commit**

  ```bash
  git add e2e/assets e2e/pages/
  git commit -m "test(e2e): page objects for publish, mis-objetos, and delivery detail"
  ```

---

## Task 9: F1 — Publicación completa

**Files:**
- Create: `e2e/tests/flows/publicar-completo.spec.ts`

- [ ] **Step 1: Test feliz end-to-end**

  Precondición: `resetScenario('donor-only')` — el spec prueba la UI de publicación, no el seed de un item.

  ```typescript
  test('donor publishes item through 3-step wizard with photo', async ({ donorPage }) => {
    // donorPage viene de fixture: escenario donor-only + injectSession
    // UI: step 1 → 2 (upload test-image.jpg) → 3 → submit → publish-success
    // Assert item en mis-objetos (sin segunda llamada a reset)
  });
  ```

- [ ] **Step 2: Run**

  ```bash
  npx playwright test e2e/tests/flows/publicar-completo.spec.ts
  ```

- [ ] **Step 3: Commit**

---

## Task 10: F9 — Eliminar imágenes en publicación

**Files:**
- Create: `e2e/tests/flows/publicar-imagenes.spec.ts`

- [ ] **Step 1: Subir 2 imágenes, eliminar 1, verificar paso revisión**

  - Tras quitar: contador fotos = 1 en step 3 (`publicar__review-photo-count` o texto).
  - Publicar sigue funcionando con 1 imagen.

- [ ] **Step 2: Run y commit**

---

## Task 11: F2 — Solicitud del interesado

**Files:**
- Create: `e2e/tests/flows/solicitud-interesado.spec.ts`

- [ ] **Step 1: Escenario `donor-only` + UI**

  - `resetScenario('donor-only')` al inicio.
  - Donor publica item por API **o** UI mínima (solo si F1 ya verde).
  - `dualBrowser`: `receiverPage` solicita en explorar; assert candidato en mis-objetos del donor.

  Alternativa más estable: escenario `item-with-one-request` **no** se usa aquí — este flujo debe probar la solicitud en UI; seed solo el donor + item vía `POST /api/e2e/scenarios/item-published` (builder nuevo: item sin requests).

- [ ] **Step 2: Run y commit**

---

## Task 12: F3 — Selección con varios receptores y puntaje

**Files:**
- Create: `e2e/tests/flows/seleccion-ranking.spec.ts`

- [ ] **Step 1: `resetScenario('ranking-three')`**

  Backend ya fijó reputaciones 5, 50, 95 y creó solicitudes.

- [ ] **Step 2: Assert orden API** (opcional, mismo request Playwright)

  ```typescript
  const { actors, entities } = await resetScenario(request, 'ranking-three');
  const candidates = await apiGetCandidates(request, actors.donor.token, entities.itemId!);
  expect(candidates[0].reputationScore).toBeGreaterThan(candidates[2].reputationScore);
  ```

- [ ] **Step 3: Assert UI**

  En mis-objetos, los `candidate-card` aparecen en el mismo orden (primer card = mayor score visible).

- [ ] **Step 4: Seleccionar el primero**

  Click `select-candidate-btn` del índice 0, completar canal en diálogo, confirmar.
  Assert navegación a entrega / `sessionId` en respuesta.

- [ ] **Step 5: Nota de flaky random**

  Si falla por perturbación ±2, aumentar gap a 40+ puntos o documentar skip condicional. **No** desactivar RANDOM en producción solo para tests sin acuerdo de arquitectura.

- [ ] **Step 6: Run y commit**

---

## Task 13: F4 — Confirmar recepción

**Files:**
- Create: `e2e/tests/flows/entrega-confirmar.spec.ts`

- [ ] **Step 1: Precondición**

  `resetScenario('delivery-active')` → `entities.sessionId`.

- [ ] **Step 2: UI donante**

  - `/entregas` o `/entregas/:id`
  - `delivery-confirm-btn` → diálogo → confirmar
  - Assert `delivery-status` = completado; item `completed` vía API GET item.

- [ ] **Step 3: Assert reputación** (opcional)

  `GET /users/me` del donor/receiver tras confirmar — scores mayores que en el payload del escenario.

- [ ] **Step 4: Run y commit**

---

## Task 14: F5 — Cancelar sin penalización

**Files:**
- Create: `e2e/tests/flows/entrega-cancelar-donante.spec.ts`

- [ ] **Step 1: Sesión activa, cancelar sin checkbox no-show**

  - Assert sesión `cancelled`, `noShowDeclared: false`
  - Score receptor **sin** cambio (`GET /users/me` antes/después, o valor devuelto en escenario)
  - Item vuelve `active`; solicitudes restauradas `pending`

- [ ] **Step 2: Run y commit**

---

## Task 15: F6 — Cancelar con penalización (no-show)

**Files:**
- Create: `e2e/tests/flows/entrega-cancelar-no-show.spec.ts`

- [ ] **Step 1: Marcar checkbox no-show en diálogo cancel**

- [ ] **Step 2: Assert reputación receptor**

  Tras cancel con no-show: `GET /users/me` del receiver — score bajó 10 respecto al valor del escenario (no consultar SQL desde Playwright).

- [ ] **Step 3: Run y commit**

---

## Task 16: F7 — Expiración por inactividad de sesión

**Files:**
- Create: `e2e/tests/flows/sesion-expirada.spec.ts`

- [ ] **Step 1: `resetScenario('delivery-active')`**

- [ ] **Step 2: `e2eExpireSession(request, sessionId)`** — backend aplica backdate + CTE expire

- [ ] **Step 3: Reload UI donante**

  - Estado `expired` en `delivery-status`
  - Objeto otra vez solicitable (explorar muestra botón solicitar para otro usuario)

- [ ] **Step 4: Run y commit**

---

## Task 17: F8 — Objetos degradados

**Files:**
- Create: `e2e/tests/flows/objetos-degradados.spec.ts`

- [ ] **Step 1: `resetScenario('item-degraded')`** (backend ya degradó el item)

- [ ] **Step 2: (Alternativa) `resetScenario('donor-only')` + publicar + `e2eDegradeItem`** si se quiere probar el camino temporal explícito

- [ ] **Step 3: Assert en `/explorar`**

  - Item con indicador degradado (clase o badge documentada en HTML)
  - Item aparece **después** de no degradados en la misma página (si hay mezcla, publicar segundo item “fresco” y comparar orden)

- [ ] **Step 4: Run y commit**

---

## Task 18: Flujos con tiempo (suite `timing/`)

**Files:**
- Create: `e2e/tests/timing/imagenes-purga-lectura.spec.ts`
- Create (opcional): `e2e/tests/timing/contacto-purga.spec.ts`

- [ ] **Step 1: FR34 — imágenes vacías tras 30 días**

  - `resetScenario('delivery-completed')` → `e2eBackdateItemCompleted(itemId, 31)`
  - `GET /items/:id` → `images: []`
  - UI detalle sin imágenes (placeholder)

- [ ] **Step 2: Deadline visible**

  - Tras selección, UI muestra `deadlineAt` (texto fecha en entrega-detalle)

- [ ] **Step 3: (Opcional) Purga canal 7 días**

  - Sesión `completed` con `contact_channel` poblado → backdate `completed_at` 8d → ejecutar SQL purge migration 011 → UI no muestra canal (`receiver-contact-channel` hidden)

- [ ] **Step 4: Documentar en spec qué **no** se prueba en E2E**

  - Emails Resend (solo console en dev)
  - pg_cron real cada hora (sustituido por SQL directo)
  - Token verificación email expirado (cubierto en unit backend 8.x)

- [ ] **Step 5: Run carpeta timing y commit**

---

## Task 19: `data-testid` faltantes (solo donde Playwright sea frágil)

**Files (frontend, mínimo):**
- Modify: `item-select-receiver-dialog.component.html` — `data-testid="select-receiver-confirm"`
- Modify: `delivery-session-cancel-dialog.component.html` — `no-show-checkbox`, `cancel-confirm-btn`
- Modify: `delivery-session-confirm-dialog.component.html` — `confirm-delivery-btn`
- Modify: explorar/degraded badge si no hay selector estable

- [ ] **Step 1: Añadir testIds solo en diálogos de entrega y confirmación selección**

- [ ] **Step 2: Commit frontend**

  ```bash
  git commit -m "feat(e2e): add testIds to delivery and select-receiver dialogs"
  ```

---

## Task 20: CI y scripts npm

**Files:**
- Modify: `no-lo-vendo/package.json` (si hace falta)
- Modify: `.github/workflows` o documentar en README

- [ ] **Step 1: Script `test:e2e:flows`**

  ```json
  "test:e2e:flows": "playwright test e2e/tests/flows e2e/tests/timing"
  ```

- [ ] **Step 2: Job CI (fase posterior)**

  - Servicio Postgres
  - `backend npm run db:migrate && npm run dev:e2e` en background
  - `npm run test:e2e:ci` con `CI=true`

- [ ] **Step 3: Commit**

---

## Task 21: Verificación final

- [ ] **Step 1: Suite flows local**

  ```bash
  npm run test:e2e:flows
  ```

- [ ] **Step 2: Dos pasadas consecutivas** (aislamiento BD)

- [ ] **Step 3: Purga final vía API**

  ```bash
  curl -X POST http://localhost:3000/api/e2e/database/purge -H "x-e2e-secret: $E2E_SECRET"
  ```

  Esperado: `{ purged: true }` — no quedan usuarios de escenarios en `nolv_e2e`.

- [ ] **Step 4: Commit meta**

  ```bash
  git commit -m "test(e2e): full business flow suite with timed scenarios"
  ```

---

## Orden de implementación recomendado

```mermaid
flowchart LR
  T1[Task 1 APP_ENV e2e] --> T2[Task 2 DB purge/recreate]
  T2 --> T3[Task 3 E2E HTTP API]
  T3 --> T4[Task 4 Scenario builders]
  T4 --> T5[Task 5 Time routes]
  T5 --> T6[Task 6 Playwright client]
  T6 --> T8[Task 8 Pages]
  T8 --> T9[F1 Publicar]
  T9 --> T10[F9 Imágenes]
  T10 --> T11[F2 Solicitud]
  T11 --> T12[F3 Ranking]
  T12 --> T13[F4 Confirmar]
  T13 --> T14[F5 Cancel]
  T14 --> T15[F6 No-show]
  T15 --> T16[F7 Expirar]
  T16 --> T17[F8 Degradados]
  T17 --> T18[Timing]
  T18 --> T19[TestIds]
  T19 --> T20[CI]
```

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Exponer `/api/e2e` en producción | `E2E_ENABLED` + `NODE_ENV !== 'production'` → rutas no montadas; 404 |
| Ranking no determinista (`RANDOM()`) | Builder `ranking-three` con gaps 5/50/95 |
| Nominatim rate limit | Builders usan coords fijas en SQL; UI publicar serializada (`workers: 1`) |
| Purge lento entre tests | Aceptable en MVP; TRUNCATE es rápido; `recreate` solo en CI |
| Duplicar lógica seed vs use-cases | Builders llaman use-cases reales; SQL directo solo para tiempo/jobs |
| Tests fase 1 con `pg` / registro API | Mantener para login/register; flujos nuevos solo vía `resetScenario` |
| Geolocalización / distancia | Mismo `postalCode` y punto geográfico en todos los actores del builder |

---

## Relación con plan anterior

- **`2026-06-03-e2e-tests.md`**: infraestructura Playwright + tests auth/items básicos. **Migración:** sustituir `e2e/helpers/db.ts` y registro manual por `resetScenario` donde aplique; conservar specs de registro/login que deben ejercitar el formulario real.
- **`scripts/seed.ts`**: sigue siendo el seed manual de demo; la lógica compartida vive en `src/e2e/seed-helpers.ts` (importada por seed CLI y escenarios E2E).
- Tras completar este plan, marcar en 2026-06-03 "What This Plan Does Not Cover" como **cubierta por 2026-06-04**.

## Migración respecto al enfoque anterior (Playwright + `pg`)

| Antes | Después |
|-------|---------|
| `createVerifiedUser` + `verifyUserEmail` en BD | `POST /api/e2e/scenarios/:name` devuelve JWT |
| `deleteUser` en `afterEach` | Purge automático en cada `resetScenario` |
| `e2e/helpers/db-time.ts` en frontend | `POST /api/e2e/time/*` en backend |
| `DATABASE_URL` en Playwright | Solo `E2E_SECRET` + URL API; BD opaca al frontend |

---

## Ejecución con superpowers

Tras guardar este plan:

1. `using-git-worktrees` — rama `feat/e2e-full-flows` (opcional).
2. `subagent-driven-development` o `executing-plans` — un task por sesión.
3. `verification-before-completion` — no declarar verde sin salida de Playwright.
