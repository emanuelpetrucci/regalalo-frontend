# Delta — technical-design-frontend.md
**Referencia:** DLT-003
**Versión base:** 1.2
**Versión resultante:** 1.3
**Estado:** Aprobado (Correct Course 2026-05-25)
**Fecha:** Mayo 2026
**Motivo:** Ampliación del modelo de usuario — campos de identidad, avatar, contacto, control operativo e internacionalización

---

## Sección 4 — Contratos de API

### Cambio 1 — POST /auth/register (payload)

Añadir campos `firstName`, `lastName` y `phone` al payload de entrada.

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

### Cambio 2 — POST /auth/register (respuesta 201)

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

### Cambio 3 — POST /auth/login (respuesta 200)

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

### Cambio 4 — GET /users/me (respuesta 200)

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

### Cambio 5 — GET /users/:id (respuesta 200)

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

### Cambio 6 — Nuevo endpoint: PATCH /users/me

```
PATCH /users/me
```

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

**Respuesta (200):**

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

**Nota de comportamiento crítico:** si el payload incluye `postalCode`, el backend incrementa `jwt_version` al completar la operación. El token actual queda invalidado. El interceptor de JWT debe tratar la respuesta 401 subsiguiente como sesión expirada y redirigir a `/login?returnUrl=/perfil/configuracion` para que el usuario pueda re-autenticarse sin perder el contexto. El cliente debe informar al usuario antes de confirmar el cambio de código postal.

---

## Sección 5 — Modelos TypeScript del Dominio

### Cambio 1 — Interfaz `User` actualizada

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
```

### Cambio 2 — Nueva interfaz `PublicUser`

Interfaz para el perfil público `GET /users/:id`. Sustituye el uso de `User` parcial que pudiera haberse implementado para este endpoint.

```typescript
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
```

---

## Sección 6 — Reglas de Presentación

### Cambio 1 — Regla de renderizado de avatar

Añadir la siguiente regla, aplicable en todos los puntos del sistema donde aparezca un avatar de usuario:

```
Si avatarUrl !== null
  → Renderizar <img src={avatarUrl} />
Si avatarUrl === null
  → Renderizar iniciales: firstName[0].toUpperCase() + lastName[0].toUpperCase()
    con el estilo visual ya establecido en los mockups aprobados
```

Puntos de aplicación: perfil propio, perfil público (`GET /users/:id`), listado de candidatos visible al donante, sesión de entrega activa.

### Cambio 2 — Aviso previo al cambio de código postal

En la pantalla de configuración, el campo de edición de `postalCode` debe ir acompañado de un aviso visible antes de confirmar el cambio:

> "Cambiar tu código postal actualizará tu ubicación y cerrará tu sesión actual. Tendrás que volver a iniciar sesión."

El aviso se muestra como componente informativo inline — no como modal de confirmación — para no interrumpir el flujo de edición. El usuario confirma el cambio al pulsar el botón de guardar del formulario de configuración.

### Cambio 3 — Formulario de registro

El formulario de registro (`POST /auth/register`) incorpora los siguientes campos nuevos:

| Campo | Tipo | Obligatorio | Posición en el formulario |
|---|---|---|---|
| `firstName` | Text input | Sí | Antes de `email` |
| `lastName` | Text input | Sí | Antes de `email` |
| `phone` | Text input | No | Tras `postalCode`, con label "Teléfono (opcional)" |

**Validaciones en cliente:**
- `firstName` / `lastName`: no vacío, mínimo 2 caracteres.
- `phone`: sin validación de formato — texto libre. El campo puede dejarse en blanco.
