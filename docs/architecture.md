# technical-design-frontend.md
**Versión:** 1.8  
**Estado:** Listo para consumo por agente BMAD  
**Fecha:** Mayo 2026  
**Scope:** Frontend exclusivamente — Angular / Vercel

> **Diseño UI (bloqueante):** La apariencia de todas las pantallas está definida **únicamente** en `docs/README.md` y `docs/project/` (prototipos HTML + `colors_and_type.css`). Este documento cubre stack, API y reglas de presentación; **no** autoriza desviarse del handoff visual. Ver `_bmad-output/project-context.md`.

> Versión 1.8 — Epic 14: campo `slug` en Item/ItemSummary, endpoint GET /items/:slug, ruta Angular /items/:slug con retrocompatibilidad UUID, sitemap dinámico con items, mejoras de calidad en meta tags y structured data. Sprint Change Proposal: `sprint-change-proposal-2026-06-19-slugs-sitemap.md` (aprobado 2026-06-20).
> Versión 1.7 — PRD-REP-FE-01: endpoint POST /reports para sistema de reportes (CreateReportRequest, ReportReason, reglas de visibilidad canReport). PRD fuente: docs/PRD-REP-FE-01.md (aprobado 2026-06-11).
> Versión 1.6 — DLT-candidato-contacto: canal de contacto del receptor en solicitud y sesión de entrega (receiverContactChannel, RequestItemRequest). Delta fuente: `docs/delta-frontend-DLT-candidato-contacto.md` (aprobado 2026-06-01).
> Versión 1.5 — DLT-email-verification: verificación de email en registro (`emailVerified`, endpoints verify-email y resend-verification, reglas interceptor/AuthGuard). Delta fuente: `docs/delta-frontend-email-verification.md` (aprobado 2026-05-27).
> Versión 1.4 — DLT-004: `category` y `weightRange` en ítems (publicación, respuestas GET, reglas UI). Delta fuente: `docs/delta-frontend-DLT-004.md` (aprobado 2026-05-26).
> Versión 1.3 — DLT-003: modelo de usuario ampliado (identidad, avatar, contacto, i18n, `PATCH /users/me`). Delta fuente: `docs/delta-frontend-DLT-003_2.md` (aprobado 2026-05-25).
> Versión 1.2 — Incorpora correcciones del Informe de Auditoría de Seguridad v1.0 (SEC-002 `contactChannel`).

---

## 1. Stack Tecnológico

| Componente | Tecnología |
|---|---|
| Framework | Angular |
| Hosting | Vercel |
| Comunicación con backend | HTTP (REST) via cliente OpenAPI generado (`ng-openapi-gen`) |
| Autenticación | JWT (recibido del backend, almacenado en localStorage) |
| Compresión de imágenes | Pipeline en cliente antes del upload |

---

## 2. Estructura de Carpetas (Angular)

```
src/
├── app/
│   ├── core/
│   │   ├── api/
│   │   │   ├── generated/ # Servicios y modelos OpenAPI (NO editar; npm run api:generate)
│   │   │   └── api.providers.ts  # provideApiClient() + ApiConfiguration
│   │   ├── services/      # Servicios de dominio UI (p. ej. sesión, geocoding)
│   │   ├── guards/        # AuthGuard
│   │   ├── interceptors/  # JWT (añade header + gestiona 401), errores
│   │   └── models/        # Tipos solo de presentación; preferir models/ del API generado
│   │
│   ├── features/
│   │   ├── auth/                    # Login, registro, recuperación de contraseña
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   ├── verify-email/        # nuevo (8-f3) — procesa el token del enlace
│   │   │   └── verification-pending/ # nuevo (8-f2) — pantalla post-registro y redirección por 403
│   │   ├── items/         # Publicar, listar, detalle de objeto
│   │   ├── delivery/      # Sesiones de entrega
│   │   └── profile/       # Perfil, reputación, historial
│   │
│   ├── shared/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pipes/         # Pipes personalizados
│   │   └── directives/    # Directivas personalizadas
│   │
│   └── layout/            # Shell, navegación, estructura base
│
├── environments/
└── assets/
```

---

## 3. Pipeline de Compresión de Imágenes (cliente)

Ejecutado en el frontend antes de cualquier upload a backend:

| Parámetro | Valor |
|---|---|
| Dimensión máxima | 1200px por lado |
| Formato de salida | WebP |
| Calidad | 80% |
| Tope por imagen post-compresión | 2MB |
| Máximo de imágenes por objeto | 5 |

---

## 4. Contratos de API por Fase del Roadmap

> Los contratos de API son de solo lectura para el agente frontend. No deben modificarse ni extenderse sin aprobación explícita. El backend es la fuente de verdad.

> **Cliente generado:** ver [`docs/api-client.md`](api-client.md) — regeneración (`npm run api:generate`), servicios (`AuthService`, `ItemsService`, …), `environment.apiUrl` y reglas de uso. El spec vive en `../backend/openapi/openapi.json`.

> **Nota transversal — Autenticación:** el JWT se envía en el header `Authorization: Bearer <token>` en todas las peticiones que requieren autenticación. El token se almacena en `localStorage`.

> **Nota transversal — URLs de imágenes:** el backend devuelve URLs públicas completas de Supabase Storage. El frontend las consume directamente sin lógica de refresco ni TTL.

---

### F3 — Autenticación

#### POST /auth/register
**Descripción:** Registro de nuevo usuario.

**Payload de entrada:**
```json
{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "postalCode": "string",
  "phone": "string (opcional)",
  "recaptchaToken": "string"
}
```

**Respuesta esperada (201):**
```json
{
  "token": "string (JWT)",
  "user": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "postalCode": "string",
    "reputationScore": 0,
    "totalReceived": 0,
    "totalDonated": 0
  }
}
```

> **Nota de diseño:** `emailVerified` está **intencionalmente ausente** del schema `AuthUser` (respuesta de `POST /auth/register`) — AC#5 del backend (story 8.2). El campo no formará parte del payload de registro. Para obtener el estado de verificación, el frontend debe llamar a `GET /users/me` tras almacenar el JWT (ver regla de presentación DLT-email-verification en §6). `PrivateProfile` (respuesta de `/users/me`) ya incluye `emailVerified: boolean` desde v1.3.

**Errores:**

| Código | Motivo |
|---|---|
| 400 | Payload inválido o código postal no geocodificable |
| 409 | Email ya registrado |
| 422 | reCAPTCHA score < 0.5 |

---

#### GET /auth/verify-email
**Descripción:** Verificación del email del usuario mediante token recibido por correo. No requiere autenticación.

**Query params:**

| Parámetro | Tipo | Requerido |
|---|---|---|
| `token` | string | sí |

**Respuesta esperada (200):**
```json
{
  "message": "string"
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 400 | Token inválido o expirado |

> **Nota de implementación:** el frontend extrae el token del query param del enlace del email y llama este endpoint al cargar `/verificar-email`. Ante 200, redirigir a `/login` con mensaje de confirmación. Ante 400, mostrar error con enlace a `/verificacion-pendiente`.

---

#### POST /auth/resend-verification
**Descripción:** Reenvío del email de verificación. Requiere autenticación (JWT Bearer).

**Payload de entrada:** vacío.

**Respuesta esperada (200):**
```json
{
  "message": "string"
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 401 | JWT inválido o expirado |
| 409 | El email ya está verificado |
| 429 | Cooldown activo — header `Retry-After` con segundos restantes |

> **Nota de implementación:** tras 200, deshabilitar el botón de reenvío durante 30 segundos (o el valor de `Retry-After` si la respuesta es 429). El usuario con JWT inválido/expirado activa el interceptor 401 normal.

---

#### POST /auth/login
**Descripción:** Autenticación de usuario existente.

**Payload de entrada:**
```json
{
  "email": "string",
  "password": "string",
  "recaptchaToken": "string"
}
```

**Respuesta esperada (200):**
```json
{
  "token": "string (JWT)",
  "user": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "reputationScore": "integer"
  }
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 401 | Credenciales incorrectas |
| 422 | reCAPTCHA score < 0.5 |

---

#### POST /auth/forgot-password
**Descripción:** Solicitud de enlace de recuperación de contraseña.

**Payload de entrada:**
```json
{
  "email": "string"
}
```

**Respuesta esperada (200):**
```json
{
  "message": "string"
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 400 | Payload inválido |

> Nota: la respuesta es siempre 200 independientemente de si el email existe, para evitar enumeración de usuarios.

---

#### POST /auth/reset-password
**Descripción:** Establecimiento de nueva contraseña mediante token.

**Payload de entrada:**
```json
{
  "token": "string",
  "newPassword": "string"
}
```

**Respuesta esperada (200):**
```json
{
  "message": "string"
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 400 | Token inválido, expirado o ya utilizado |

---

### F4 — Flujo de Objetos

#### POST /items
**Descripción:** Publicación de nuevo objeto. Requiere autenticación.

**Payload de entrada (multipart/form-data):**
```
title:       string
description: string
condition:   string
category:    string (enum — ver catálogo abajo)
weightRange: string (enum — ver catálogo abajo)
postalCode:  string (ubicación del objeto — puede diferir del donante)
images:      File[] (máx. 5, ya comprimidas en cliente)
```

**Valores válidos para `category`:** `furniture`, `electronics`, `clothing`, `books`, `toys`, `kitchen`, `sports`, `tools`, `other`.

**Valores válidos para `weightRange`:** `lt1`, `1to5`, `5to20`, `gt20`.

Etiquetas visibles en UI: ver `docs/delta-frontend-DLT-004.md` §4 Cambio 1 o claves i18n `items.category.*` / `items.weight_range.*`.

**Respuesta esperada (201):**
```json
{
  "id": "uuid",
  "title": "string",
  "status": "active",
  "createdAt": "ISO8601"
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 400 | Payload inválido, más de 5 imágenes, imagen > 2MB |
| 401 | No autenticado |

---

#### GET /items
**Descripción:** Listado de objetos activos dentro del radio geográfico del usuario autenticado. Requiere autenticación.

**Query params:**

| Parámetro | Tipo | Por defecto | Rango válido |
|---|---|---|---|
| `page` | integer | 1 | ≥ 1 |
| `limit` | integer | 20 | 1–50 |

**Respuesta esperada (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "condition": "string",
      "category": "string",
      "weightRange": "string",
      "status": "active",
      "degradedAt": "ISO8601 | null",
      "distanceMeters": "number",
      "images": ["url"],
      "createdAt": "ISO8601"
    }
  ],
  "pagination": {
    "total": "integer",
    "page": "integer",
    "limit": "integer",
    "totalPages": "integer"
  }
}
```

**Ordenación:** objetos con `degradedAt IS NULL` primero. Dentro de cada grupo, por `createdAt` descendente.

**Errores:**

| Código | Motivo |
|---|---|
| 400 | Parámetros de paginación fuera de rango |
| 401 | No autenticado |

---

#### GET /items/:id
**Descripción:** Detalle de un objeto.

**Respuesta esperada (200):**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "condition": "string",
  "category": "string",
  "weightRange": "string",
  "status": "string",
  "requestsPaused": "boolean",
  "degradedAt": "ISO8601 | null",
  "distanceMeters": "number",
  "images": ["url"],
  "donor": {
    "id": "uuid",
    "reputationScore": "integer"
  },
  "createdAt": "ISO8601"
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 404 | Objeto no encontrado |

---

#### DELETE /items/:id
**Descripción:** Cancelación de objeto por el donante. Requiere autenticación.

**Respuesta esperada (200):**
```json
{
  "message": "string"
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 401 | No autenticado |
| 403 | El usuario no es el donante |
| 404 | Objeto no encontrado |

---

#### POST /items/:id/requests
**Descripción:** Solicitud de un objeto por un receptor. Requiere autenticación.

**Payload de entrada:**
```json
{
  "contactChannel": "string (requerido, no vacío)"
}
```

**Respuesta esperada (201):**
```json
{
  "requestId": "uuid",
  "status": "pending",
  "createdAt": "ISO8601"
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 400 | contactChannel ausente o vacío |
| 400 | El usuario intenta solicitar su propio objeto |
| 401 | No autenticado |
| 409 | Solicitud duplicada o límite de 3/30 días alcanzado |

---

#### GET /items/:id/requests
**Descripción:** Lista de candidatos rankeados para un objeto. Solo accesible por el donante. Requiere autenticación.

**Respuesta esperada (200):**
```json
{
  "candidates": [
    {
      "requestId": "uuid",
      "userId": "uuid",
      "reputationScore": "integer",
      "distanceMeters": "number",
      "requestDate": "ISO8601"
    }
  ]
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 401 | No autenticado |
| 403 | El usuario no es el donante |
| 404 | Objeto no encontrado |

---

#### POST /items/:id/requests/:requestId/select
**Descripción:** Selección de receptor por el donante. Requiere autenticación. El donante proporciona su canal de contacto en este paso.

**Payload de entrada:**
```json
{
  "contactChannel": "string"
}
```

**Respuesta esperada (200):**
```json
{
  "sessionId": "uuid",
  "status": "active",
  "deadlineAt": "ISO8601"
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 400 | Payload inválido |
| 401 | No autenticado |
| 403 | El usuario no es el donante |
| 404 | Objeto o solicitud no encontrados |

---

### F6 — Sesión de Entrega

#### GET /delivery-sessions/:id
**Descripción:** Detalle de una sesión de entrega. El `contactChannel` solo se incluye en la respuesta si el backend lo devuelve con valor no nulo. Requiere autenticación.

**Respuesta esperada (200):**
```json
{
  "id": "uuid",
  "itemId": "uuid",
  "status": "active | completed | cancelled | expired",
  "contactChannel": "string | null",
  "sharedContactChannel": "string | null",
  "receiverContactChannel": "string | null",
  "deadlineAt": "ISO8601",
  "donorConfirmed": "boolean",
  "noShowDeclared": "boolean",
  "createdAt": "ISO8601",
  "completedAt": "ISO8601 | null"
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 401 | No autenticado |
| 403 | El usuario no es donante ni receptor de la sesión |
| 404 | Sesión no encontrada |

---

#### POST /delivery-sessions/:id/confirm
**Descripción:** El donante confirma la entrega. Cierra la sesión en estado `completed`. Requiere autenticación.

**Payload de entrada:** vacío.

**Respuesta esperada (200):**
```json
{
  "status": "completed",
  "completedAt": "ISO8601"
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 401 | No autenticado |
| 403 | El usuario no es el donante |
| 409 | La sesión no está en estado `active` |

---

#### POST /delivery-sessions/:id/cancel
**Descripción:** El donante cancela la sesión. Puede declarar no-show del receptor. Requiere autenticación.

**Payload de entrada:**
```json
{
  "noShow": "boolean"
}
```

**Respuesta esperada (200):**
```json
{
  "status": "cancelled",
  "noShowDeclared": "boolean",
  "completedAt": "ISO8601"
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 401 | No autenticado |
| 403 | El usuario no es el donante |
| 409 | La sesión no está en estado `active` |

---

#### GET /users/me/delivery-sessions
**Descripción:** Sesiones de entrega en las que el usuario autenticado participa como donante o receptor. Requiere autenticación.

**Query params:**

| Parámetro | Tipo | Por defecto | Rango válido |
|---|---|---|---|
| `page` | integer | 1 | ≥ 1 |
| `limit` | integer | 20 | 1–50 |
| `role` | string | — | `donor`, `receiver` |
| `status` | string | — | `active`, `completed`, `cancelled`, `expired` |

**Respuesta esperada (200):**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "itemId": "uuid",
      "itemTitle": "string",
      "role": "donor | receiver",
      "status": "active | completed | cancelled | expired",
      "deadlineAt": "ISO8601",
      "createdAt": "ISO8601",
      "completedAt": "ISO8601 | null"
    }
  ],
  "pagination": {
    "total": "integer",
    "page": "integer",
    "limit": "integer",
    "totalPages": "integer"
  }
}
```

> Nota: `contactChannel` no se incluye en este listado. Solo se expone en `GET /delivery-sessions/:id` cuando las condiciones de visibilidad se cumplen en el backend.

**Errores:**

| Código | Motivo |
|---|---|
| 400 | Parámetros inválidos |
| 401 | No autenticado |

---

### F7 — Perfil y Reputación

#### GET /users/me
**Descripción:** Perfil del usuario autenticado. Requiere autenticación.

**Respuesta esperada (200):**
```json
{
  "id": "uuid",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "avatarUrl": "string | null",
  "phone": "string | null",
  "postalCode": "string",
  "preferredLanguage": "string",
  "emailVerified": "boolean",
  "reputationScore": "integer",
  "totalReceived": "integer",
  "totalDonated": "integer",
  "consecutiveNoShows": "integer",
  "createdAt": "ISO8601"
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 401 | No autenticado |

---

#### PATCH /users/me
**Descripción:** Actualización parcial del perfil del usuario autenticado.

**Payload de entrada:**
```json
{
  "firstName": "string (opcional)",
  "lastName": "string (opcional)",
  "avatarUrl": "string | null (opcional)",
  "phone": "string | null (opcional)",
  "postalCode": "string (opcional)",
  "preferredLanguage": "string (opcional)"
}
```

**Respuesta esperada (200):**
```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "avatarUrl": "string | null",
  "phone": "string | null",
  "postalCode": "string",
  "preferredLanguage": "string"
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 400 | Payload inválido |
| 400 | Código postal no geocodificable |
| 401 | No autenticado |

> **Comportamiento crítico:** si el payload incluye `postalCode`, el backend incrementa `jwt_version` al completar la operación. El token actual queda invalidado. El interceptor debe tratar el `401` subsiguiente como sesión expirada y redirigir a `/login?returnUrl=/profile` (volver a configuración de perfil). La UI debe informar al usuario **antes** de confirmar el cambio de código postal (aviso inline, no modal).

---

#### GET /users/me/items
**Descripción:** Objetos publicados por el usuario autenticado. Requiere autenticación.

**Query params:**

| Parámetro | Tipo | Por defecto | Rango válido |
|---|---|---|---|
| `page` | integer | 1 | ≥ 1 |
| `limit` | integer | 20 | 1–50 |
| `status` | string | — | `active`, `reserved`, `completed`, `cancelled` |

**Respuesta esperada (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "string",
      "condition": "string",
      "category": "string",
      "weightRange": "string",
      "status": "active | reserved | completed | cancelled",
      "requestsPaused": "boolean",
      "degradedAt": "ISO8601 | null",
      "images": ["url"],
      "createdAt": "ISO8601",
      "completedAt": "ISO8601 | null"
    }
  ],
  "pagination": {
    "total": "integer",
    "page": "integer",
    "limit": "integer",
    "totalPages": "integer"
  }
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 400 | Parámetros inválidos |
| 401 | No autenticado |

---

#### GET /users/me/requests
**Descripción:** Solicitudes realizadas por el usuario autenticado. Requiere autenticación.

**Query params:**

| Parámetro | Tipo | Por defecto | Rango válido |
|---|---|---|---|
| `page` | integer | 1 | ≥ 1 |
| `limit` | integer | 20 | 1–50 |
| `status` | string | — | `pending`, `selected`, `rejected`, `cancelled` |

**Respuesta esperada (200):**
```json
{
  "requests": [
    {
      "id": "uuid",
      "itemId": "uuid",
      "itemTitle": "string",
      "itemStatus": "active | reserved | completed | cancelled",
      "status": "pending | selected | rejected | cancelled",
      "createdAt": "ISO8601"
    }
  ],
  "pagination": {
    "total": "integer",
    "page": "integer",
    "limit": "integer",
    "totalPages": "integer"
  }
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 400 | Parámetros inválidos |
| 401 | No autenticado |

---

#### GET /users/me/reputation-history
**Descripción:** Historial de eventos de reputación del usuario autenticado. Requiere autenticación.

**Respuesta esperada (200):**
```json
{
  "events": [
    {
      "id": "uuid",
      "type": "delivery_completed | no_show",
      "delta": "integer",
      "sessionId": "uuid | null",
      "createdAt": "ISO8601"
    }
  ]
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 401 | No autenticado |

---

#### GET /users/:id
**Descripción:** Perfil público de un usuario. Solo expone información visible.

**Respuesta esperada (200):**
```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "avatarUrl": "string | null",
  "reputationScore": "integer",
  "totalReceived": "integer",
  "totalDonated": "integer",
  "createdAt": "ISO8601"
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 404 | Usuario no encontrado |

---

### F8 — Sistema de Reportes

#### POST /reports
**Descripción:** Reporte de un objeto o usuario por usuario autenticado con email verificado.

**Autenticación:** Bearer JWT requerido. El usuario debe tener `emailVerified === true` (gestionado server-side; 403 `EMAIL_NOT_VERIFIED` si no verificado).

**Payload de entrada:**
```json
{
  "reportedEntityType": "item | user",
  "reportedEntityId": "uuid",
  "reason": "ReportReason (ver enum abajo)",
  "description": "string (opcional, maxLength: 500)",
  "recaptchaToken": "string"
}
```

**Enum ReportReason (valores exactos del spec):**
`contenido_inadecuado` | `fraude_o_enganio` | `spam` | `objeto_ilegal` |
`objeto_peligroso` | `información_falsa` | `comportamiento_abusivo` | `otro`

**Respuesta esperada (201):**
```json
{ "id": "uuid", "message": "string" }
```

**Errores:**

| Código | Código interno | Motivo |
|---|---|---|
| 400 | VALIDATION_ERROR | Payload inválido |
| 400 | RECAPTCHA_FAILED | reCAPTCHA score insuficiente |
| 401 | — | No autenticado |
| 403 | EMAIL_NOT_VERIFIED | Email no verificado (gestionado por authErrorInterceptor) |
| 404 | — | Entidad no encontrada |
| 409 | REPORT_ALREADY_PENDING | Reporte duplicado pendiente |
| 422 | SELF_REPORT_FORBIDDEN | Intento de reportarse a sí mismo |
| 422 | ENTITY_NOT_REPORTABLE | Entidad no reportable |
| 429 | RATE_LIMIT_ENTITY_EXCEEDED | Límite de reportes por entidad |
| 429 | RATE_LIMIT_TOTAL_EXCEEDED | Límite total de reportes |
| 500 | — | Error interno |

---

## 5. Modelos TypeScript del Dominio

> **Canónico en implementación:** tipos y servicios en `src/app/core/api/generated/` (regenerar con `npm run api:generate`). Ver [`docs/api-client.md`](api-client.md). El bloque siguiente es referencia legible del contrato; no crear `core/models/` duplicando estos campos salvo tipos exclusivos de UI.

> **DLT-email-verification — nota `SessionUser`:** el servicio `SessionService` en `core/services/session.service.ts` define la interfaz `SessionUser` que almacena el usuario en estado. Para que `AuthGuard` pueda verificar `emailVerified`, esta interfaz debe incluir `emailVerified?: boolean`. El valor se obtiene de `PrivateProfile.emailVerified` tras llamar a `GET /users/me` post-registro (ver flujo §6) — **no** del payload de `POST /auth/register` (campo ausente por diseño). Esta extensión se realiza en la historia **8-f4** (no en 8-f1).

> **DLT-email-verification — `EmailNotVerifiedError`:** el generador produjo el modelo `EmailNotVerifiedError { code: 'EMAIL_NOT_VERIFIED'; message: string }` desde el spec backend. Este tipo se utiliza en el interceptor HTTP (historia **8-f4**) para distinguir el 403 de verificación email de otros 403.

```typescript
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  phone: string | null;
  postalCode: string;
  preferredLanguage: string;
  emailVerified: boolean;
  reputationScore: number;
  totalReceived: number;
  totalDonated: number;
  consecutiveNoShows: number;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  reputationScore: number;
  totalReceived: number;
  totalDonated: number;
  createdAt: string;
}

export type ItemCategory =
  | 'furniture'
  | 'electronics'
  | 'clothing'
  | 'books'
  | 'toys'
  | 'kitchen'
  | 'sports'
  | 'tools'
  | 'other';

export type ItemWeightRange = 'lt1' | '1to5' | '5to20' | 'gt20';

export interface Item {
  id: string;
  slug: string;            // URL-safe, unique, generated from title by backend
  title: string;
  description: string;
  condition: string;
  category: ItemCategory;
  weightRange: ItemWeightRange;
  status: 'active' | 'reserved' | 'completed' | 'cancelled';
  requestsPaused: boolean;
  degradedAt: string | null;
  distanceMeters: number;
  images: string[];
  createdAt: string;
}

export interface ItemSummary {
  id: string;
  slug: string;            // URL-safe, unique, generated from title by backend
  title: string;
  condition: string;
  category: ItemCategory;
  weightRange: ItemWeightRange;
  status: 'active' | 'reserved' | 'completed' | 'cancelled';
  requestsPaused: boolean;
  degradedAt: string | null;
  images: string[];
  createdAt: string;
  completedAt: string | null;
}

export interface DeliverySession {
  id: string;
  itemId: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  contactChannel: string | null;
  sharedContactChannel: string | null;
  receiverContactChannel: string | null;
  deadlineAt: string;
  donorConfirmed: boolean;
  noShowDeclared: boolean;
  createdAt: string;
  completedAt: string | null;
}

export interface DeliverySessionSummary {
  id: string;
  itemId: string;
  itemTitle: string;
  role: 'donor' | 'receiver';
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  deadlineAt: string;
  createdAt: string;
  completedAt: string | null;
}

export interface ReputationEvent {
  id: string;
  type: 'delivery_completed' | 'no_show';
  delta: number;
  sessionId: string | null;
  createdAt: string;
}

export interface ItemRequest {
  id: string;
  itemId: string;
  itemTitle: string;
  itemStatus: 'active' | 'reserved' | 'completed' | 'cancelled';
  status: 'pending' | 'selected' | 'rejected' | 'cancelled';
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ReportReason =
  | 'contenido_inadecuado'
  | 'fraude_o_enganio'        // ⚠️ valor exacto del spec (sin ñ)
  | 'spam'
  | 'objeto_ilegal'
  | 'objeto_peligroso'
  | 'información_falsa'       // ó con acento (correcto UTF-8)
  | 'comportamiento_abusivo'
  | 'otro';

export interface CreateReportRequest {
  reportedEntityType: 'item' | 'user';
  reportedEntityId: string;
  reason: ReportReason;
  description?: string;
  recaptchaToken: string;
}

export interface CreateReportResponse {
  id: string;
  message: string;
}
```

---

## 6. Reglas de Presentación

- **contactChannel (SEC-002):** el frontend no implementa lógica de visibilidad propia sobre este campo. Si el backend devuelve `contactChannel` con valor no nulo, se renderiza. Si devuelve `null`, se muestra como no disponible independientemente del estado de la sesión visible en el cliente. La decisión de cuándo exponer el campo reside exclusivamente en el backend.
- **receiverContactChannel (SEC-002c):** el frontend no implementa lógica de visibilidad propia sobre este campo. Si el backend devuelve `receiverContactChannel` con valor no nulo, se renderiza en el bloque de coordinación de la sesión de entrega, visible únicamente para el donante (`role === 'donor'`). Si devuelve `null`, el bloque no se muestra. La decisión de cuándo exponer el campo reside exclusivamente en el backend.
- Los objetos con `degradedAt !== null` se muestran al final del listado.
- El `reputationScore` puede ser negativo — la UI debe soportar valores negativos sin truncar.
- El perfil público (`GET /users/:id`) no expone email ni `consecutiveNoShows`.
- Un usuario no puede ver el botón de solicitar en objetos propios.
- Ante una respuesta 401, el interceptor de JWT limpia el token de `localStorage` y redirige a `/login` con el parámetro `returnUrl`.
- El `AuthGuard` verifica la presencia y expiración del token por timestamp local. Si el token está ausente o expirado, redirige a `/login?returnUrl=<ruta>`. Si el token es válido pero `!emailVerified` en el usuario del estado (campo `false` o `undefined`), redirige a `/verificacion-pendiente` (ver regla DLT-email-verification abajo).
- No se implementa silent refresh. El JWT tiene duración de 7 días. Al expirar, se requiere re-login.
- **Avatar:** si `avatarUrl !== null` → `<img src={avatarUrl} />`; si `avatarUrl === null` → iniciales `firstName[0]` + `lastName[0]` en mayúsculas (estilo mockups). Aplica en perfil propio, perfil público, candidatos, sesión de entrega y shell.
- **Cambio de código postal en configuración:** aviso inline antes de guardar («Cambiar tu código postal actualizará tu ubicación y cerrará tu sesión actual. Tendrás que volver a iniciar sesión.»); confirmación con el botón guardar del formulario (no modal). Tras invalidación del JWT, el interceptor redirige a `/login?returnUrl=/profile`.
- **Formulario de registro (`POST /auth/register`):** orden de campos `firstName`, `lastName`, `email`, `password`, `postalCode`, `phone` (opcional, label «Teléfono (opcional)»). Validación cliente: `firstName`/`lastName` no vacíos, mínimo 2 caracteres; `phone` texto libre sin validación de formato.
- El control toggle de `requestsPaused` solo se muestra al donante cuando `status === 'active'`.
- Los objetos con `requestsPaused === true` muestran un indicador visual en el listado del donante (`GET /users/me/items`) para identificar el estado de bloqueo de un vistazo.
- Cuando un receptor intenta solicitar un objeto con `requestsPaused === true`, el mensaje de error debe indicar explícitamente que las solicitudes están temporalmente pausadas — diferenciado del mensaje de límite alcanzado o solicitud duplicada.
- El campo `requestsPaused` no se expone en el perfil público del donante (`GET /users/:id`).
- **Publicación (`POST /items`):** `category` y `weightRange` son obligatorios; selectores en formulario tras `condition` y antes de `postalCode`; valores enviados son enums internos, no etiquetas visibles.
- **Detalle de objeto:** mostrar etiqueta visible de `category` (mapeo cliente desde enum). **`weightRange` no se muestra** al usuario final en detalle ni listados (solo captura analítica/ESG).
- **Mis objetos (`GET /users/me/items`):** opcional en MVP mostrar etiqueta de `category` en tarjetas del donante.
- **[Cookies] Librería OSS:** la integración de consentimiento usa `@orestbida/cookieconsent` como base, envuelta por un `CookieConsentService` en `core/services/` para desacoplar proveedor y lógica de negocio.
- **[Cookies] Categorías mínimas:** `necessary` (siempre activa), `analytics`, `marketing` y `preferences` (opcional).
- **[Cookies] Gating obligatorio:** scripts/cookies no esenciales no se cargan antes de consentimiento explícito; la activación se controla por categoría.
- **[Cookies] Persistencia y versión:** guardar estado de consentimiento con `policyVersion`, timestamp y categorías; si `policyVersion` cambia, forzar re-consentimiento.
- **[Cookies] Punto persistente de configuración:** exponer acción "Cambiar configuración de cookies" reutilizando el footer existente de `docs/project/Política de privacidad.html` y `docs/project/Política de cookies.html` (sin redefinir footer ni layout legal).
- **[Cookies] Copy legal desacoplado:** textos del banner/panel se gestionan por i18n/configuración y no bloquean cambios posteriores de contenido legal definitivo.
- **[Cookies][Legal Pages] Estructura documental mínima obligatoria:** las rutas legales (`/politica-privacidad`, `/politica-cookies`) deben renderizar la estructura completa definida en `docs/project/Política de privacidad.html` y `docs/project/Política de cookies.html` (metadatos de vigencia, índice con anchors, secciones completas, tablas/bloques informativos, footer legal existente) con fidelidad visual y semántica pixel-perfect.
- **[DLT-email-verification] Flujo post-registro:** tras registro exitoso (HTTP 201), el JWT se almacena en `localStorage`; a continuación llamar a `GET /users/me` para obtener `PrivateProfile.emailVerified` y persistirlo en `SessionUser` (el payload de `POST /auth/register` no incluye `emailVerified` por diseño — AC#5 backend). Con `SessionUser.emailVerified` poblado, redirigir a `/verificacion-pendiente`. Ante error en `GET /users/me`, tratar como `emailVerified: false` y redirigir igualmente a `/verificacion-pendiente` (no dejar la sesión en estado parcial). No se redirige al feed ni a ninguna ruta protegida.
- **[DLT-email-verification] Pantalla `/verificacion-pendiente`:** ruta pública (no requiere `emailVerified`). Informa al usuario de que debe verificar su email antes de continuar. Botón «Reenviar email de verificación» llama `POST /auth/resend-verification`. Tras 200, el botón se deshabilita 30 segundos con cuenta regresiva. Ante 429, usa el valor del header `Retry-After` en lugar de 30 s — **nota de implementación:** la respuesta 429 llega como `HttpErrorResponse` en el canal de error de Angular, no como `HttpResponse` de éxito; leer el header en el bloque `catch`: `(err as HttpErrorResponse).headers.get('Retry-After')`. Ante 409 (email ya verificado), muestra mensaje y enlace a `/login`.
- **[DLT-email-verification] Pantalla `/verificar-email`:** ruta pública. Al cargar, extrae `token` del query param y llama `GET /auth/verify-email?token=<token>` automáticamente. Ante 200: redirigir a `/login` con mensaje de confirmación visible. Ante 400 o token ausente: mostrar error con enlace a `/verificacion-pendiente`.
- **[DLT-email-verification] Interceptor HTTP — 403 `EMAIL_NOT_VERIFIED`:** ante 403 con body `{ code: "EMAIL_NOT_VERIFIED" }` (tipo generado `EmailNotVerifiedError`), el interceptor **no** limpia el token de `localStorage` (el JWT sigue válido). Redirige a `/verificacion-pendiente`. Comportamiento diferente al 401 (que sí limpia token y redirige a `/login`). Usar el modelo generado `EmailNotVerifiedError` para distinguir el código.
- **[DLT-email-verification] `AuthGuard`:** además de verificar presencia y expiración del token, verifica `emailVerified` del usuario en el estado (`SessionUser.emailVerified`). Si `!emailVerified` (campo `false` o `undefined`), redirige a `/verificacion-pendiente` sin intentar la ruta. La extensión de `SessionUser` con `emailVerified?: boolean` se implementa en la historia **8-f4**.
- El campo `emailVerified` no se expone en el perfil público (`GET /users/:id`).
- **Acceso Híbrido (Guest Mode):** las rutas `/explorar` e `/items/:id` no requieren `AuthGuard`. El `AppShellComponent` detecta la ausencia de token y sustituye el menú de usuario por acciones de "Login" y "Registro".
- **Privacidad del Donante (Visitantes):** cuando el usuario es un visitante (no autenticado), el componente `ItemDonorRow` debe activarse en modo `anonymous`, ocultando el nombre real y el enlace al perfil público, mostrando únicamente el score de reputación.
- **Gating de Conversión:** el botón "Solicitar" en la vista de detalle para visitantes no abre el formulario de contacto; en su lugar, muestra el `ConversionModal` con invitación al registro.
- **Estrategia SEO Dinámica:**
    - Las páginas de objeto cargadas vía SSR deben inyectar etiquetas `OpenGraph` (título, descripción, imagen del objeto).
    - Objetos en estado `completed` o `cancelled` deben incluir `<meta name="robots" content="noindex">` para limpiar el índice de Google.
    - El sistema debe devolver `410 Gone` para IDs de objetos que han sido purgados físicamente del backend (más de 30 días en estado final).

> **Nota de diseño DLT-email-verification:** `emailVerified` está intencionalmente ausente del schema `AuthUser` (respuesta de `POST /auth/register`). El frontend obtiene este campo de `PrivateProfile` via `GET /users/me` tras almacenar el JWT post-registro. No se requiere regeneración del cliente para este campo.

- **[PRD-REP-FE-01] Trigger de reporte (visibilidad `canReport`):** el botón/enlace de reporte solo se muestra si se cumplen **las tres** condiciones: (1) usuario autenticado (`SessionService.isAuthenticated()`), (2) `emailVerified === true` en el usuario del estado (`SessionService.currentUser`), (3) `currentUserId !== entityOwnerId` (no se puede reportar la propia entidad). Usar `SessionService` — **no** `AuthService` generado — para estas comprobaciones.
- **[PRD-REP-FE-01] 403 `EMAIL_NOT_VERIFIED` en POST /reports:** este 403 es gestionado globalmente por `authErrorInterceptor` (redirige a `/verificacion-pendiente`). El `ReportModalComponent` **no** maneja ese error inline; puede asumir que si el trigger es visible, el usuario tiene email verificado.
- **[PRD-REP-FE-01] Ubicación de componentes del sistema de reportes:** `ReportService` en `core/services/report.service.ts` (no en `core/api/generated/`). `ReportModalComponent` en `shared/components/report-modal/` (standalone, reutilizable desde `ItemDetailComponent`, `ItemCardComponent` y `UserProfilePublicComponent`).
- **[PRD-REP-FE-01] Tipo `ReportReason`:** usar siempre el tipo `ReportReason` generado por `ng-openapi-gen` desde el spec, nunca la definición manual del PRD (los valores exactos del spec difieren del PRD en `fraude_o_enganio` vs `fraude_o_engaño`).

---


# Delta — technical-design-frontend.md
**Versión base:** 1.1
**Versión resultante:** 1.2
**Estado:** Pendiente de aprobación
**Fecha:** Mayo 2026
**Motivo:** Incorporación de flag `requests_paused` para bloqueo temporal de solicitudes

---

## Sección 5 — Modelos TypeScript del Dominio

### Cambio

Añadir campo `requestsPaused` a las interfaces `Item` e `ItemSummary`.

```typescript
export interface Item {
  id: string;
  title: string;
  description: string;
  condition: string;
  status: 'active' | 'reserved' | 'completed' | 'cancelled';
  requestsPaused: boolean;        // nuevo
  degradedAt: string | null;
  distanceMeters: number;
  images: string[];
  createdAt: string;
}

export interface ItemSummary {
  id: string;
  title: string;
  condition: string;
  status: 'active' | 'reserved' | 'completed' | 'cancelled';
  requestsPaused: boolean;        // nuevo
  degradedAt: string | null;
  images: string[];
  createdAt: string;
  completedAt: string | null;
}
```

---

## Sección 4 — Contratos de API

### Cambio 1 — GET /items (respuesta)

Añadir campo `requestsPaused` en cada objeto del array `items`.

```json
{
  "items": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "condition": "string",
      "status": "active",
      "requestsPaused": "boolean",
      "degradedAt": "ISO8601 | null",
      "distanceMeters": "number",
      "images": ["url"],
      "createdAt": "ISO8601"
    }
  ],
  "pagination": { ... }
}
```

---

### Cambio 2 — GET /items/:id (respuesta)

Añadir campo `requestsPaused` en la respuesta de detalle.

```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "condition": "string",
  "status": "string",
  "requestsPaused": "boolean",
  "degradedAt": "ISO8601 | null",
  "distanceMeters": "number",
  "images": ["url"],
  "donor": {
    "id": "uuid",
    "reputationScore": "integer"
  },
  "createdAt": "ISO8601"
}
```

---

### Cambio 3 — GET /users/me/items (respuesta)

Añadir campo `requestsPaused` en cada objeto del array `items`.

```json
{
  "items": [
    {
      "id": "uuid",
      "title": "string",
      "condition": "string",
      "status": "active | reserved | completed | cancelled",
      "requestsPaused": "boolean",
      "degradedAt": "ISO8601 | null",
      "images": ["url"],
      "createdAt": "ISO8601",
      "completedAt": "ISO8601 | null"
    }
  ],
  "pagination": { ... }
}
```

---

### Cambio 4 — POST /items/:id/requests (error)

Añadir nuevo caso de error diferenciado por `requestsPaused`.

**Errores actualizados:**

| Código | Motivo |
|---|---|
| 400 | El usuario intenta solicitar su propio objeto |
| 401 | No autenticado |
| 409 | Solicitud duplicada o límite de 3/30 días alcanzado |
| 409 | Solicitudes pausadas temporalmente por el donante |

**Nota:** ambos casos devuelven 409 pero con mensajes de error diferenciados. El frontend debe distinguirlos por el campo `error` o `code` del cuerpo de la respuesta para mostrar el mensaje adecuado al receptor.

---

### Cambio 5 — Nuevo endpoint: PATCH /items/:id/pause

```
PATCH /items/:id/pause
```

**Payload de entrada:**
```json
{
  "paused": "boolean"
}
```

**Respuesta esperada (200):**
```json
{
  "requestsPaused": "boolean"
}
```

**Errores:**

| Código | Motivo |
|---|---|
| 400 | Payload inválido |
| 401 | No autenticado |
| 403 | El usuario no es el donante |
| 404 | Objeto no encontrado |
| 409 | El objeto no está en estado `active` |

---

## Sección 6 — Reglas de Presentación

### Cambio

Añadir las siguientes reglas:

- El control toggle de `requestsPaused` solo se muestra al donante cuando `status === 'active'`.
- Los objetos con `requestsPaused === true` muestran un indicador visual en el listado del donante (`GET /users/me/items`) para identificar el estado de bloqueo de un vistazo.
- Cuando un receptor intenta solicitar un objeto con `requestsPaused === true`, el mensaje de error debe indicar explícitamente que las solicitudes están temporalmente pausadas — diferenciado del mensaje de límite alcanzado o solicitud duplicada.
- El campo `requestsPaused` no se expone en el perfil público del donante (`GET /users/:id`).

---

## Cambio v1.8 — Epic 14: URL Canonicalización, Indexación y Calidad SEO

> **Sprint Change Proposal:** `sprint-change-proposal-2026-06-19-slugs-sitemap.md` (aprobado 2026-06-20)

### Cambio 1 — Nuevo campo `slug` en Item e ItemSummary

Añadir campo `slug` a las interfaces `Item` e `ItemSummary`:

```typescript
export interface Item {
  id: string;
  slug: string;  // URL-safe, único, generado por el backend desde el título
  // ... resto de campos sin cambio
}

export interface ItemSummary {
  id: string;
  slug: string;  // URL-safe, único, generado por el backend desde el título
  // ... resto de campos sin cambio
}
```

**Reglas de generación (backend):**
- Normalizar título: minúsculas, acentos → ASCII, no alfanumérico → guión, colapsar guiones múltiples, truncar a 60 chars en límite de palabra.
- Si el slug colisiona con uno existente, añadir sufijo numérico (`-2`, `-3`, …).
- Los items existentes reciben slug en migración (backfill).

### Cambio 2 — Nuevo endpoint `GET /items/:slug`

El backend expone `GET /items/:slug` que resuelve por slug y devuelve el mismo contrato que `GET /items/:id`. El endpoint `GET /items/:id` (UUID) se mantiene para retrocompatibilidad.

```
GET /items/:slug       → GetItemResponse (mismo contrato que GET /items/:id)
GET /items/:id (UUID)  → GetItemResponse (sin cambio, retrocompatibilidad)
```

### Cambio 3 — Ruta Angular de detalle de item

```
ANTES:   /items/:id    → DetalleComponent  (UUID como param de ruta)
DESPUÉS: /items/:slug  → DetalleComponent  (acepta slug limpio O UUID)
```

Lógica de resolución en `DetalleComponent`:
- Si el param coincide con regex UUID → llama `GET /items/:uuid`, obtiene `item.slug` y redirige a `/items/${item.slug}` con `replaceUrl: true`.
- Si no es UUID → llama `GET /items/:slug` directamente.

Todos los enlaces internos a items pasan de usar `item.id` a `item.slug`.

### Cambio 4 — URL canonical en ItemSeoService

`ItemSeoService.apply(item)` construye URLs usando `item.slug`:

```typescript
// ANTES:
const url = absoluteSiteUrl(`/items/${item.id}`, this.siteBaseUrl);
// DESPUÉS:
const url = absoluteSiteUrl(`/items/${item.slug}`, this.siteBaseUrl);
```

Afecta: canonical link, `og:url`, `Product.url`, `Product["@id"]`, `BreadcrumbList` item 3.

### Cambio 5 — Sitemap dinámico con items activos

`src/server.ts` extiende la generación del sitemap:
- Fetcha `GET /items` (sin JWT — Feed Global) paginado al primer request.
- Filtra `status === 'active'`, incluye hasta 5.000 items (más recientes si supera).
- URL: `${siteUrl}/items/${item.slug}`, priority `0.7`, changefreq `daily`.
- Caché en memoria: 60 minutos (`Cache-Control: public, max-age=3600`).
- Si el fetch falla, devuelve sitemap estático sin HTTP 500.

### Cambio 6 — Mejoras de calidad en meta tags y structured data

**`ItemSeoService`:** `og:image:width/height/alt`, `twitter:image:alt`, `twitter:site`, `Product["@id"]`, `offers.seller`, array completo `item.images`, truncado limpio de description al último espacio antes de 160 chars.

**`ExplorarSeoService`:** Añade `og:image`, `og:image:width/height/alt/type`, `twitter:card: 'summary_large_image'`, `twitter:image`.

**`ReputationSeoService`:** `og:type → 'website'` (coherente con WebPage JSON-LD), `og:image` con imagen por defecto, `<meta name="robots" content="index, follow">` explícito.

**`LandingSeoService`:** `Organization.logo` PNG/JPG (no SVG), `WebSite["@id"]`, `Organization["@id"]`, `twitter:site`.
