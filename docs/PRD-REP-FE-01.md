---
title: "PRD Frontend — Sistema de Reportes"
code: PRD-REP-FE-01
version: "1.1"
date: "2026-06-09"
status: approved
priority: P0
bloque: "Bloque 1 — Operabilidad mínima"
proyecto: Regálalo (regalalo.org)
dependencias:
  - PRD-REP-BE-01 (contrato de API: POST /api/reports)
  - architecture.md (OpenAPI + ng-openapi-gen)
plataforma_frontend: Angular / Vercel
changelog:
  - "v1.1 (2026-06-09): E-01 authService → SessionService en §5 y §10; E-02 isAuthenticated() como método; E-03 dependencia corregida; G-01 guía de modal invertida; G-02 distinción de subcódigos HTTP 400; G-03 comportamiento del authErrorInterceptor ante 403; G-04 mock reCAPTCHA en dev/e2e; A-01 currentUser null window documentado."
---

# PRD-REP-FE-01 — Frontend del Sistema de Reportes

> Documento de requisitos de frontend para el sistema de reportes de Regálalo.
> Cubre el componente modal de reporte, los puntos de entrada en la UI, el servicio de
> integración con la API y los criterios de aceptación.
> Listo para handoff a agente de desarrollo frontend.

---

## 1. Alcance

### 1.1 Incluido en esta iteración

- Componente `ReportModalComponent`: modal reutilizable de 3 pasos invocable desde cualquier punto de la app
- Integración del punto de entrada en `ItemCardComponent` (lista de objetos)
- Integración del punto de entrada en `ItemDetailComponent` (vista detalle de objeto)
- Integración del punto de entrada en `UserProfilePublicComponent` (perfil público de usuario)
- `ReportService`: servicio de integración con `POST /api/reports` usando el cliente generado desde OpenAPI
- Integración con reCAPTCHA V3 existente
- Gestión de todos los estados de error definidos en PRD-REP-BE-01 §4.1
- Restricción de acceso: el flujo de reporte solo está disponible para usuarios autenticados con email verificado

### 1.2 Fuera de alcance (esta iteración)

- Vista del historial de reportes enviados por el usuario (post-MVP)
- Traducción a idiomas distintos del español
- Reporte desde la vista de sesión de entrega
- Notificación en tiempo real (toast de resolución) cuando el reporte es atendido

---

## 2. Decisiones de diseño

| ID | Decisión | Resolución |
|---|---|---|
| D-FE-REP-01 | Patrón de presentación | Modal (overlay) centralizado, no página navegable. El flujo de reporte no interrumpe la navegación del usuario |
| D-FE-REP-02 | Reutilización del componente | Un único `ReportModalComponent` standalone acepta inputs para configurarse como reporte de objeto o de usuario. No hay dos componentes distintos |
| D-FE-REP-03 | Número de pasos | Máximo 3 pasos: selección de motivo → descripción opcional → confirmación |
| D-FE-REP-04 | Visibilidad del botón | Solo visible para usuarios autenticados con `emailVerified = true`. No se renderiza el trigger para usuarios no autenticados ni para el propietario de la entidad reportada |
| D-FE-REP-05 | Token reCAPTCHA | Se obtiene en el paso de submit (Paso 2), no al abrir el modal. Reutiliza el servicio `RecaptchaService` ya existente en el proyecto |
| D-FE-REP-06 | Cliente API | Usa el servicio generado por `ng-openapi-gen` en `src/app/core/api/generated/`. Tras añadir el endpoint al backend, regenerar el cliente con `npm run api:generate` |
| D-FE-REP-07 | Feedback al usuario | El Paso 3 (confirmación) es estático: no refleja el contenido del reporte ni hace promesas de plazo. La confirmación detallada llega por email (TPL-011) |
| D-FE-REP-08 | Auto-reporte en UI | El botón de reporte no se renderiza si el `currentUserId === item.donorId` (para objetos) o `currentUserId === profileUserId` (para perfiles). La validación de servidor (422) actúa como segunda capa |

---

## 3. Componente `ReportModalComponent`

### 3.1 Responsabilidades

- Gestionar el ciclo de vida completo del flujo de reporte (abrir, navegar entre pasos, enviar, cerrar).
- Exponer un `Input` para el contexto de la entidad a reportar.
- Emitir un `Output` al completarse el flujo para que el componente padre actualice su estado si es necesario.
- No contener lógica de negocio: toda llamada a la API se delega al `ReportService`.

### 3.2 Inputs y outputs

```typescript
// Contexto pasado por el componente padre al abrir el modal
export interface ReportContext {
  entityType: 'item' | 'user';
  entityId: string;            // UUID de la entidad
  entityDisplayName: string;   // Título del objeto o nombre del usuario (para mostrar en el modal)
}
```

```typescript
@Component({
  selector: 'app-report-modal',
  standalone: true,
  // ...
})
export class ReportModalComponent {
  @Input() context!: ReportContext;
  @Output() closed = new EventEmitter<void>();       // modal cerrado sin completar
  @Output() submitted = new EventEmitter<void>();    // reporte enviado con éxito
}
```

### 3.3 Máquina de estados interna

```
IDLE
  ↓ (open())
STEP_1_REASON        ← selección de motivo (requerido)
  ↓ (next())
STEP_2_DESCRIPTION   ← descripción opcional + submit
  ↓ (submit())
SUBMITTING           ← spinner, botón deshabilitado
  ↓ éxito
STEP_3_CONFIRMATION  ← pantalla de acuse de recibo
  ↓ (close())
IDLE

SUBMITTING
  ↓ error recuperable (409, 422, 429)
STEP_2_DESCRIPTION + error inline  ← el usuario puede reintentar o cerrar
```

El estado `SUBMITTING` deshabilita todos los controles interactivos del modal para prevenir envíos duplicados.

### 3.4 Paso 1 — Selección de motivo

**Propósito:** el usuario elige la categoría que mejor describe el problema.

**UI:**
- Título del modal: `"Reportar [objeto | usuario]"` según `context.entityType`.
- Subtítulo: nombre del objeto o usuario (`context.entityDisplayName`) en texto secundario.
- Lista de opciones como radio buttons o elementos seleccionables tipo card (una columna).
- Botón `"Siguiente"` deshabilitado hasta que se seleccione una opción.
- Botón `"Cancelar"` cierra el modal y emite `closed`.

**Etiquetas visibles de los motivos** (mapeo desde valor interno del enum):

| Valor API | Etiqueta visible |
|---|---|
| `contenido_inadecuado` | Contenido inadecuado u ofensivo |
| `fraude_o_engaño` | Fraude o engaño |
| `spam` | Spam o publicidad |
| `objeto_ilegal` | Objeto ilegal |
| `objeto_peligroso` | Objeto peligroso |
| `información_falsa` | Información falsa o engañosa |
| `comportamiento_abusivo` | Comportamiento abusivo |
| `otro` | Otro motivo |

**Nota de filtrado:** las opciones `objeto_ilegal`, `objeto_peligroso` e `información_falsa` tienen mayor relevancia cuando `context.entityType = 'item'`. En v1 se muestra la lista completa en ambos casos para simplificar la implementación. El admin gestiona la coherencia en la revisión.

### 3.5 Paso 2 — Descripción y confirmación

**Propósito:** el usuario puede añadir contexto adicional antes de enviar.

**UI:**
- Resumen del motivo seleccionado en Paso 1 (solo lectura, con opción de volver).
- `<textarea>` con etiqueta `"Descripción adicional (opcional)"`.
  - `placeholder`: `"Añade cualquier detalle que pueda ayudar en la revisión."`
  - Contador de caracteres visible: `"X / 500"`.
  - Límite hard en frontend: 500 caracteres (atributo `maxlength`).
- Botón `"Enviar reporte"` — activo independientemente de si hay descripción (el campo es opcional).
- Botón `"Atrás"` — regresa a Paso 1 manteniendo la selección de motivo.
- Botón `"Cancelar"` — cierra el modal y emite `closed`.
- Zona de error inline (ver §7).

**Al hacer clic en "Enviar reporte":**
1. Obtener token reCAPTCHA V3 (`RecaptchaService.execute('report')`).
2. Llamar a `ReportService.submit(context, reason, description, recaptchaToken)`.
3. Transicionar a estado `SUBMITTING`.

### 3.6 Paso 3 — Confirmación

**Propósito:** confirmar la recepción del reporte y orientar al usuario.

**UI:**
- Icono de confirmación (check o similar, acorde al design system).
- Título: `"Reporte enviado"`.
- Cuerpo: `"Hemos recibido tu reporte. Lo revisaremos lo antes posible. Te confirmaremos por email cuando hayamos tomado una decisión."`
- Botón único: `"Cerrar"` — emite `submitted` y cierra el modal.

---

## 4. Servicio `ReportService`

```typescript
// src/app/core/services/report.service.ts

@Injectable({ providedIn: 'root' })
export class ReportService {

  constructor(private reportsApi: ReportsService) {}
  // ReportsService: clase generada por ng-openapi-gen para el endpoint POST /api/reports

  submit(
    context: ReportContext,
    reason: ReportReason,
    description: string | null,
    recaptchaToken: string
  ): Observable<{ id: string }> {
    return this.reportsApi.createReport({
      body: {
        reportedEntityType: context.entityType,
        reportedEntityId: context.entityId,
        reason,
        description: description ?? undefined,
        recaptchaToken,
      }
    });
  }
}
```

**Tipo `ReportReason`:**

```typescript
export type ReportReason =
  | 'contenido_inadecuado'
  | 'fraude_o_engaño'
  | 'spam'
  | 'objeto_ilegal'
  | 'objeto_peligroso'
  | 'información_falsa'
  | 'comportamiento_abusivo'
  | 'otro';
```

Si `ng-openapi-gen` genera un enum o tipo literal para los valores del campo `reason` al regenerar el cliente, usar ese tipo en lugar de la definición manual. La fuente de verdad es la spec OpenAPI exportada por el backend.

---

## 5. Puntos de entrada

### Nota sobre `SessionService` y el acceso al estado de sesión

En este proyecto, **`SessionService`** (ubicado en `core/services/session.service.ts`) es el servicio que gestiona el estado de autenticación del usuario en el frontend. No debe confundirse con `AuthService`, que en este proyecto es el servicio generado por `ng-openapi-gen` para los endpoints REST de autenticación.

Comportamientos relevantes de `SessionService`:

- `isAuthenticated()` — método (no propiedad) que evalúa el claim `exp` del JWT almacenado en `localStorage` con clave `rgl_auth_token`. Retorna `false` si no hay token o si ha expirado.
- `currentUser` — objeto de tipo `SessionUser` (o `null`). Incluye `emailVerified?: boolean` (opcional) desde la historia 8-f4. El campo puede ser `undefined` durante la ventana posterior al login/registro, antes de que `GET /users/me` hidrate el objeto. La condición `?.emailVerified === true` es segura en este caso: `undefined === true` evalúa a `false`, lo que oculta el botón correctamente sin necesidad de guards adicionales.
- `currentUser?.id` — UUID del usuario autenticado.

---

### 5.1 ItemCardComponent (lista de objetos)

**Elemento UI:** ítem `"Reportar objeto"` al final del menú contextual existente de la tarjeta, separado del resto de opciones mediante un divisor visual.

**Condición de renderizado:**

```typescript
get canReport(): boolean {
  return this.sessionService.isAuthenticated()
    && this.sessionService.currentUser?.emailVerified === true
    && this.sessionService.currentUser?.id !== this.item.donorId;
}
```

**Al hacer clic:** abrir `ReportModalComponent` con:

```typescript
{
  entityType: 'item',
  entityId: this.item.id,
  entityDisplayName: this.item.title
}
```

**Nota:** si el usuario no está autenticado, la opción no aparece en el menú. No se redirige al login desde este punto.

---

### 5.2 ItemDetailComponent (vista detalle de objeto)

**Elemento UI:** enlace de texto discreto `"Reportar este objeto"` en la zona inferior de la ficha de detalle, fuera del flujo de acciones principales.

**Condición de renderizado:** idéntica a §5.1.

**Al hacer clic:** abrir `ReportModalComponent` con:

```typescript
{
  entityType: 'item',
  entityId: this.item.id,
  entityDisplayName: this.item.title
}
```

---

### 5.3 UserProfilePublicComponent (perfil público)

**Elemento UI:** enlace de texto discreto `"Reportar usuario"` al final de la información pública del perfil.

**Condición de renderizado:**

```typescript
get canReport(): boolean {
  return this.sessionService.isAuthenticated()
    && this.sessionService.currentUser?.emailVerified === true
    && this.sessionService.currentUser?.id !== this.profileUserId;
}
```

**Al hacer clic:** abrir `ReportModalComponent` con:

```typescript
{
  entityType: 'user',
  entityId: this.profileUser.id,
  entityDisplayName: `${this.profileUser.firstName} ${this.profileUser.lastName}`
}
```

**Nota:** verificar el nombre exacto del componente en `features/profile/` antes de implementar.

---

## 6. Integración reCAPTCHA V3

El proyecto ya tiene reCAPTCHA V3 integrado. No requiere instalación nueva.

**Uso en el componente:**

```typescript
// En ReportModalComponent, al preparar el submit (Paso 2 → SUBMITTING):

this.recaptchaService.execute('report').pipe(
  switchMap(token => this.reportService.submit(
    this.context, this.selectedReason!, this.description, token
  ))
).subscribe({
  next: () => this.step = 'STEP_3_CONFIRMATION',
  error: (err) => this.handleError(err)
});
```

**Acción reCAPTCHA:** `'report'` (string literal). Permite diferenciar el tráfico de reportes en la consola de reCAPTCHA.

**Comportamiento en desarrollo local y e2e:** cuando `recaptchaSiteKey` está vacío en `environment.ts` (configuración `e2e` o desarrollo sin clave), `RecaptchaService.execute()` retorna el token de mock `'dev-mock-recaptcha-token'` sin cargar el script de Google. El backend acepta este token cuando `NODE_ENV !== 'production'`. El componente no requiere ninguna lógica especial para este caso — el comportamiento es transparente.

---

## 7. Gestión de errores

Los errores del API se manejan de forma inline en el Paso 2 (zona de error bajo el textarea). El modal no se cierra ante errores recuperables.

### 7.1 Extracción del código de error

El backend retorna errores con un body tipado `{ code: string; message: string }`. Para distinguir errores bajo el mismo status HTTP (p. ej. los dos posibles 400), el handler debe leer `error.error.code`:

```typescript
handleError(httpError: HttpErrorResponse): void {
  const code = httpError.error?.code as string | undefined;
  const status = httpError.status;

  // Casos específicos por código interno
  if (code === 'REPORT_ALREADY_PENDING')   { /* ... */ return; }
  if (code === 'SELF_REPORT_FORBIDDEN')    { /* ... */ return; }
  if (code === 'ENTITY_NOT_REPORTABLE')    { /* ... */ return; }
  if (code === 'RECAPTCHA_FAILED')         { /* ... */ return; }
  if (code === 'RATE_LIMIT_ENTITY_EXCEEDED') { /* ... */ return; }
  if (code === 'RATE_LIMIT_TOTAL_EXCEEDED')  { /* ... */ return; }

  // Fallback por status
  if (status >= 500 || status === 0) { /* error genérico */ return; }
}
```

No usar el status HTTP como único discriminador cuando existen múltiples códigos bajo el mismo status.

### 7.2 Tabla de mapeo de errores

| HTTP | Código interno | Mensaje visible al usuario |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `"Ha ocurrido un error inesperado. Inténtalo de nuevo en unos instantes."` (error de programación; no debería llegar al usuario) |
| 400 | `RECAPTCHA_FAILED` | `"No hemos podido verificar tu solicitud. Inténtalo de nuevo."` |
| 409 | `REPORT_ALREADY_PENDING` | `"Ya tienes un reporte pendiente de revisión sobre este contenido."` |
| 422 | `SELF_REPORT_FORBIDDEN` | Error silenciado — el botón no debería haberse mostrado. Log en consola + cerrar modal |
| 422 | `ENTITY_NOT_REPORTABLE` | `"Este contenido no puede ser reportado en este momento."` |
| 429 | `RATE_LIMIT_ENTITY_EXCEEDED` | `"Has enviado demasiados reportes sobre este contenido recientemente. Inténtalo más tarde."` |
| 429 | `RATE_LIMIT_TOTAL_EXCEEDED` | `"Has alcanzado el límite de reportes permitidos. Inténtalo de nuevo en unos días."` |
| 5xx / red | — | `"Ha ocurrido un error inesperado. Inténtalo de nuevo en unos instantes."` |

### 7.3 Comportamiento post-error

- El estado transiciona de `SUBMITTING` de vuelta a `STEP_2_DESCRIPTION`.
- El mensaje de error aparece en el área designada del Paso 2.
- El botón `"Enviar reporte"` se reactiva.
- La descripción escrita por el usuario se conserva (no se limpia el textarea).

**Errores no recuperables** (`SELF_REPORT_FORBIDDEN`, errores de red persistentes): ofrecer opción de cerrar el modal con el texto `"Si el problema persiste, contacta con nosotros."`.

---

## 8. Restricciones de acceso

### 8.1 Usuario no autenticado

El botón/trigger de reporte no se renderiza. No se muestra ningún mensaje alternativo. El usuario no debe percibir la ausencia del botón como un error.

### 8.2 Usuario autenticado sin email verificado

El botón/trigger de reporte no se renderiza. Consistente con el resto de la app, donde las acciones que requieren `email_verified` están ocultas para usuarios no verificados.

### 8.3 Propietario de la entidad

El donante de un objeto no ve la opción de reportarlo. El usuario no ve la opción de reportar su propio perfil. Implementado via condición `canReport` en §5.1, §5.2 y §5.3.

### 8.4 Si el usuario accede al endpoint directamente

La validación de servidor (PRD-REP-BE-01 §4.1) actúa como segunda línea de defensa para los casos §8.1 a §8.3.

**Comportamiento del `authErrorInterceptor` ante 403:** si un usuario sin `email_verified` llega a invocar el endpoint (bypass de UI), el backend retorna `403 EMAIL_NOT_VERIFIED`. El `authErrorInterceptor` existente en `core/interceptors/auth-error.interceptor.ts` captura este 403 y redirige automáticamente a `/verificacion-pendiente`. El `ReportModalComponent` **no necesita manejar este caso**: el interceptor lo gestiona globalmente antes de que el error llegue al handler del componente.

---

## 9. Criterios de aceptación

| ID | Criterio | Verificación |
|---|---|---|
| AC-REP-FE-01 | El botón de reporte no es visible para usuarios no autenticados | Test: `SessionService.isAuthenticated()` retorna `false` → trigger ausente en card, detail y perfil |
| AC-REP-FE-02 | El botón de reporte no es visible para usuarios con `emailVerified = false` | Test: `currentUser.emailVerified = false` → trigger ausente |
| AC-REP-FE-03 | El donante no ve la opción de reportar su propio objeto | Test: `currentUser.id === item.donorId` → trigger ausente |
| AC-REP-FE-04 | El usuario no ve la opción de reportar su propio perfil | Test: `currentUser.id === profileUserId` → trigger ausente |
| AC-REP-FE-05 | El modal se abre correctamente desde los tres puntos de entrada | Test manual: card, detail, perfil → modal visible con contexto correcto |
| AC-REP-FE-06 | El Paso 1 no permite avanzar sin seleccionar un motivo | Test: botón "Siguiente" `disabled` si no hay selección |
| AC-REP-FE-07 | El contador de caracteres del textarea es preciso y el límite de 500 se aplica | Test: input > 500 chars → truncado; contador muestra `500 / 500` |
| AC-REP-FE-08 | El botón "Enviar reporte" se deshabilita durante `SUBMITTING` | Test: inspeccionar DOM durante la llamada API → `button[disabled]` |
| AC-REP-FE-09 | Un reporte exitoso muestra el Paso 3 de confirmación | Test: mock API → 201 → Paso 3 visible |
| AC-REP-FE-10 | El evento `submitted` se emite al cerrar desde el Paso 3 | Test: spy en `submitted` output → emitido al pulsar "Cerrar" en Paso 3 |
| AC-REP-FE-11 | Los mensajes de error se muestran inline en el Paso 2, no en un toast global | Test: mock API → 409 → mensaje en zona de error del modal |
| AC-REP-FE-12 | Tras un error, el textarea conserva su contenido y el botón se reactiva | Test: mock 429 → textarea mantiene texto; botón activo |
| AC-REP-FE-13 | El token reCAPTCHA se obtiene con la acción `'report'` | Test: spy sobre `RecaptchaService.execute` → parámetro `'report'` |
| AC-REP-FE-14 | El `entityDisplayName` se muestra correctamente en el modal para objetos y usuarios | Test: abrir modal desde card (título objeto) y desde perfil (nombre usuario) |
| AC-REP-FE-15 | El botón "Atrás" en Paso 2 regresa al Paso 1 manteniendo la selección de motivo | Test: seleccionar motivo → siguiente → atrás → la misma opción sigue seleccionada |
| AC-REP-FE-16 | `ReportService.submit` invoca el endpoint con el payload correcto | Test unitario: verificar cuerpo del request (`entityType`, `entityId`, `reason`, `recaptchaToken`) |
| AC-REP-FE-17 | El modal es accesible por teclado (focus trap, ESC cierra) | Test: navegación con Tab confinada al modal; ESC dispara `closed` |
| AC-REP-FE-18 | El modal no se abre si `context` es inválido (`entityId` nulo o vacío) | Test: pasar `entityId: ''` → modal no abre o muestra estado de error |
| AC-REP-FE-19 | El handler de errores lee `error.error.code`, no solo el status HTTP | Test unitario: dos mocks de 400 con `code: 'VALIDATION_ERROR'` y `code: 'RECAPTCHA_FAILED'` → mensajes distintos |
| AC-REP-FE-20 | Un 403 del endpoint cierra el modal y no muestra mensaje de error propio | Test: mock API → 403 → `authErrorInterceptor` redirige; modal no muestra error inline |

---

## 10. Dependencias técnicas

| Dependencia | Ubicación | Estado | Notas |
|---|---|---|---|
| `POST /api/reports` (PRD-REP-BE-01) | backend | Pendiente de implementación | Tras implementar el endpoint, ejecutar `npm run api:generate` para regenerar el cliente Angular |
| `SessionService` | `core/services/session.service.ts` | Existente | Provee `isAuthenticated()` (método) y `currentUser` (nullable). **No confundir con `AuthService`**, que es el servicio generado de la API REST de autenticación |
| `RecaptchaService` | `core/services/` | Existente | El método `execute(action: string): Observable<string>` retorna el token. En entornos sin `recaptchaSiteKey` retorna `'dev-mock-recaptcha-token'` sin efectos secundarios |
| `ItemCardComponent` | `features/items/` | Existente | Añadir trigger de reporte en el menú contextual existente |
| `ItemDetailComponent` | `features/items/` | Existente | Añadir enlace de reporte en zona inferior |
| `UserProfilePublicComponent` | `features/profile/` | Existente | Verificar nombre exacto del componente antes de modificar |
| Componente modal base | `shared/components/` | Probablemente existente | El proyecto tiene un patrón de modal definido en los prototipos (`Mdl` en `ItemDetail.jsx`). **Verificar si existe implementación Angular equivalente en `shared/components/` antes de crear uno nuevo.** Usar el existente; crear `ModalService` mínimo solo si no hay precedente |
| Design system / tokens | `docs/project/colors_and_type.css` + prototipos JSX | Existente | Tokens de color (`C.primary`, `C.bgSurface`, etc.) y tipografía (`FD` Playfair Display, `FB` DM Sans) ya definidos. No introducir valores hardcoded |

---

## 11. Notas para el agente de desarrollo

**Sobre el servicio de sesión:**
El servicio de gestión de sesión es `SessionService`, no `AuthService`. Inyectar `SessionService` para comprobar `isAuthenticated()` y acceder a `currentUser`. `AuthService` en este proyecto es exclusivamente el cliente generado para los endpoints `/auth/*`.

**Sobre el modal:**
El proyecto tiene un componente `Mdl` definido en los prototipos JSX que implementa overlay, backdrop y cierre por clic exterior. La implementación Angular equivalente probablemente existe en `shared/components/`. Verificar antes de crear nuevo código. Si no existe, implementar un overlay mínimo standalone sin dependencia de `@angular/cdk` salvo que ya sea una dependencia del proyecto.

**Sobre la regeneración del cliente API:**
El cliente generado (`ng-openapi-gen`) no incluirá el endpoint `POST /api/reports` hasta que el backend lo implemente y exporte su spec OpenAPI. Verificar que el spec se ha actualizado antes de ejecutar `npm run api:generate`. Si el backend no está disponible, usar un mock local del servicio para desarrollo paralelo.

**Sobre el tipo `ReportReason`:**
Si `ng-openapi-gen` genera un enum o tipo literal para los valores del campo `reason`, usar ese tipo en lugar de la definición manual de §4. La fuente de verdad es la spec OpenAPI exportada por el backend.

**Sobre la accesibilidad:**
El modal debe implementar `role="dialog"`, `aria-modal="true"`, `aria-labelledby` apuntando al título del paso actual, y focus trap mientras está abierto. La tecla ESC debe cerrar el modal y emitir `closed`.
