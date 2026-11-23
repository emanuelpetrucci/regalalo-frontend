---
title: "Design Brief — Sistema de Reportes (Frontend Público)"
code: DESIGN-REP-01
version: "1.0"
date: "2026-06-09"
status: approved
priority: P0
destinatario: Agente de diseño
proyecto: Regálalo (regalalo.org)
referencias_tecnicas:
  - PRD-REP-FE-01 (especificación de componentes y flujo)
  - PRD-REP-BE-01 (contratos de API, errores)
design_system_fuente: docs/project/colors_and_type.css + prototipos HTML en docs/project/
---

# DESIGN-REP-01 — Sistema de Reportes · Frontend Público

> Brief de diseño para el agente de diseño.
> Este documento define qué diseñar, cómo debe comportarse visualmente y qué copy
> debe contener cada elemento. No describe implementación técnica.
> El design system base vive en `docs/project/colors_and_type.css` y en los
> prototipos HTML de `docs/project/`. Todos los tokens de color, tipografía,
> espaciado y radio de borde deben extraerse de esos archivos. No introducir
> valores no presentes en el sistema establecido.

---

## 1. Contexto del producto

Regálalo es una plataforma comunitaria de redistribución de objetos. Su tono es cercano, directo y no moralista. El sistema no bloquea ni castiga de forma explícita: actúa sobre consecuencias, no intenciones. Esta filosofía debe reflejarse en el flujo de reporte: es un mecanismo de señalización comunitaria, no un acto punitivo. El lenguaje y la interfaz deben comunicar eso.

**Usuario que reporta:** alguien autenticado, con email verificado, que ha encontrado algo que no parece correcto. Está en un estado de incomodidad moderada. El flujo no debe amplificarlo ni trivializarlo. Debe sentirse como rellenar un formulario breve de una entidad de confianza.

**Restricción de tono:** no usar lenguaje acusatorio. Evitar palabras como "denuncia", "acusación", "infracción". Preferir "reporte", "contenido que puede ser problemático", "revisar".

---

## 2. Alcance de este brief

Este brief cubre exclusivamente los elementos del **frontend público** (`regalalo.org`):

1. Trigger del reporte: elemento UI que abre el modal (tres variantes según punto de entrada).
2. Modal de reporte: flujo de 3 pasos.
3. Estados de error del modal.
4. Templates de email TPL-011, TPL-012 y TPL-013.

No cubre el panel de administración (`admin.regalalo.org`) — ver DESIGN-REP-ADM-01.

---

## 3. Principios de diseño para este componente

**Fricción mínima, propósito claro.** El flujo no debe intimidar ni parecer un proceso judicial. Máximo 3 pasos. Nada de campos obligatorios más allá del motivo.

**Discreto pero accesible.** El trigger (botón de reporte) no compite visualmente con las acciones primarias. Está disponible para quien lo busca; no interrumpe a quien no lo necesita.

**Calmado ante el error.** Los mensajes de error son informativos, nunca alarmistas. Un límite de reportes alcanzado es una notificación neutra, no un aviso de penalización.

**Coherencia total con el sitio.** El modal usa exactamente los mismos tokens visuales que el resto de la app: tipografía, colores, radios de borde, sombras. No debe parecer un componente de terceros.

---

## 4. Trigger — Puntos de entrada

El trigger es el elemento que, al activarse, abre el modal de reporte. Hay tres variantes según el contexto.

### 4.1 Trigger en tarjeta de objeto (ItemCard)

**Ubicación:** dentro del menú contextual de la tarjeta (el icono `⋮` o equivalente ya existente en el diseño actual). La opción "Reportar objeto" aparece al final del menú, separada visualmente del resto de opciones mediante una línea divisoria.

**Especificaciones visuales:**
- Texto: `Reportar objeto`
- Color del texto: usar el color de texto secundario del sistema (más tenue que las acciones principales del menú).
- Sin icono obligatorio en esta variante, aunque puede incorporarse un icono de bandera o similar si el sistema de iconos del proyecto lo tiene.
- Separador visual: una línea `<hr>` o `divider` del sistema antes de esta opción de reporte.

**Estado invisible:** el ítem del menú no aparece si el usuario no está autenticado, si `emailVerified = false`, o si el usuario es el donante del objeto.

### 4.2 Trigger en vista detalle de objeto (ItemDetail)

**Ubicación:** zona inferior de la ficha de detalle, después de todas las acciones primarias (solicitar, ver candidatos, etc.). Debe estar claramente separado del área de acción principal.

**Especificaciones visuales:**
- Elemento: enlace de texto (no botón primario ni secundario).
- Texto: `Reportar este objeto`
- Color: color de texto secundario o de utilidad. No el color de acción primaria.
- Tamaño de texto: uno o dos escalones por debajo del body text principal.
- Puede ir acompañado de un icono pequeño (bandera, alerta) al inicio.

**Estado invisible:** mismas condiciones que §4.1.

### 4.3 Trigger en perfil público de usuario

**Ubicación:** al final de la tarjeta o sección de información pública del perfil, después de los datos de reputación y estadísticas.

**Especificaciones visuales:**
- Idéntico en forma y color a §4.2.
- Texto: `Reportar este usuario`
- No debe estar dentro del área de estadísticas ni de reputación del perfil.

**Estado invisible:** mismas condiciones que §4.1, más la condición de que el usuario no esté viendo su propio perfil.

---

## 5. Modal de reporte — Flujo de 3 pasos

El modal se presenta como un overlay centrado en pantalla con un backdrop semitransparente que bloquea la interacción con el contenido subyacente. El modal tiene ancho fijo (aproximadamente 480–520px en desktop; full-width con márgenes en mobile).

**Estructura común a todos los pasos:**
- Header del modal: título variable según el paso + botón de cierre (`✕`) en esquina superior derecha.
- Cuerpo del modal: contenido del paso.
- Footer del modal: botones de acción del paso.

---

### 5.1 Paso 1 — Selección de motivo

**Header:**
- Título: `Reportar [objeto / usuario]` — variable según `context.entityType`.
- Subtítulo (texto secundario, más pequeño): nombre del objeto o del usuario que se está reportando. Ej.: `"Sofá de tres plazas"` o `"María G."`.

**Cuerpo:**
Instrucción breve: `¿Qué tipo de problema quieres reportar?`

Lista de 8 opciones seleccionables. Cada opción es un elemento tipo radio visual — no un radio button nativo estándar, sino un elemento de lista con estado seleccionado/no seleccionado estilizado:

| Etiqueta visible | Sublabel opcional (descripción breve) |
|---|---|
| Contenido inadecuado u ofensivo | Imágenes o texto que no son apropiados |
| Fraude o engaño | El objeto no existe, está en mal estado real, etc. |
| Spam o publicidad | Publicación con fines comerciales |
| Objeto ilegal | Producto prohibido o de venta ilegal |
| Objeto peligroso | Puede causar daños físicos |
| Información falsa o engañosa | Datos incorrectos sobre el objeto o el usuario |
| Comportamiento abusivo | Mensajes, acoso u hostigamiento |
| Otro motivo | — |

**Diseño de cada opción:**
- Fondo neutro en estado normal; fondo de color de acento suave (del sistema) al seleccionarse.
- Borde visible en estado no seleccionado; borde de color primario al seleccionarse.
- Sin checkmark ni radio button nativo. El cambio de color comunica la selección.
- Las opciones con sublabel muestran el sublabel en texto de tamaño menor y color secundario debajo de la etiqueta principal.
- La opción "Otro motivo" no tiene sublabel.

**Footer:**
- Botón derecha: `Siguiente` — estilo primario del sistema, deshabilitado si no hay selección.
- Botón izquierda: `Cancelar` — estilo ghost o texto, cierra el modal.

---

### 5.2 Paso 2 — Descripción y envío

**Header:**
- Título: `Añade contexto (opcional)`
- Indicador de progreso opcional: puede mostrarse un indicador de paso 2 de 3 si el sistema de diseño lo permite.

**Cuerpo:**

Resumen del paso anterior (solo lectura):
- Etiqueta pequeña: `Motivo seleccionado`
- Valor: el texto de la opción seleccionada en el Paso 1, con un indicador visual de que se puede editar (enlace o botón pequeño: `Cambiar`).

Campo de texto libre:
- Etiqueta: `Descripción adicional` (no obligatorio — indicarlo con texto secundario: `opcional`)
- `<textarea>` de 4 filas aproximadas.
- Placeholder: `Añade cualquier detalle que pueda ayudar en la revisión.`
- Contador de caracteres en esquina inferior derecha del textarea: `0 / 500`.
- El contador cambia a color de alerta cuando el usuario supera los 450 caracteres.

Aviso de privacidad (texto muy pequeño, color terciario):
`Tu identidad no será revelada al usuario reportado.`

**Zona de error** (visible solo cuando hay un error, debajo del aviso de privacidad):
- Fondo de color de error suave del sistema.
- Icono de alerta + texto del error.
- Ver §6 para los textos de cada error.

**Footer:**
- Botón derecha: `Enviar reporte` — estilo primario. Muestra spinner y se deshabilita durante la llamada API.
- Botón izquierda: `Atrás` — estilo ghost, regresa al Paso 1.

**Estado SUBMITTING:**
- El botón `Enviar reporte` muestra un spinner interno y texto `Enviando...`.
- El botón `Atrás` y el botón de cierre (`✕`) se deshabilitan.
- El textarea se vuelve de solo lectura.

---

### 5.3 Paso 3 — Confirmación

**Header:**
- Sin título de header.
- El botón de cierre (`✕`) sigue disponible.

**Cuerpo (centrado vertical y horizontalmente en el espacio disponible):**

Icono de confirmación: usar el icono de check o confirmación del sistema de iconos del proyecto. Tamaño grande (48–64px). Color primario o de éxito del sistema.

Título: `Reporte enviado`
Estilo: heading secundario del sistema.

Cuerpo de texto:
```
Hemos recibido tu reporte. Lo revisaremos lo antes posible y
te confirmaremos por email cuando hayamos tomado una decisión.
```
Estilo: body text del sistema, color secundario.

**Footer:**
- Botón único centrado: `Cerrar` — estilo secundario o ghost. Cierra el modal.

---

## 6. Estados de error

Los errores se muestran en la zona de error del **Paso 2**. El modal no se cierra. El usuario puede corregir o cerrar.

| Situación | Mensaje visible |
|---|---|
| Reporte ya existente | `Ya tienes un reporte pendiente de revisión sobre este contenido.` |
| Límite por entidad | `Has enviado demasiados reportes sobre este contenido recientemente. Inténtalo más tarde.` |
| Límite total | `Has alcanzado el límite de reportes permitidos. Inténtalo de nuevo en unos días.` |
| Contenido no reportable | `Este contenido no puede ser reportado en este momento.` |
| Error de verificación reCAPTCHA | `No hemos podido verificar tu solicitud. Inténtalo de nuevo.` |
| Error genérico (red, 5xx) | `Ha ocurrido un error inesperado. Inténtalo de nuevo en unos instantes.` |

**Diseño del bloque de error:**
- Contenedor con fondo del color de error suave del sistema (normalmente rojo muy tenue o naranja muy tenue).
- Borde izquierdo de 3px en color de error.
- Icono de alerta (del sistema de iconos) seguido del texto del error.
- Sin botón de cierre dentro del bloque de error: el usuario lo lee y decide si reintenta o cierra el modal.

---

## 7. Comportamiento responsive

**Desktop (> 768px):**
- Modal centrado en pantalla, ancho fijo ~480–520px.
- Altura variable según contenido del paso.
- Backdrop semitransparente, clic fuera del modal cierra (emite `closed`).

**Mobile (≤ 768px):**
- Modal en sheet de la parte inferior de la pantalla (bottom sheet), altura adaptada al contenido.
- Gesture de swipe hacia abajo para cerrar es deseable si el sistema de diseño lo soporta.
- Si no se implementa bottom sheet, usar modal de ancho completo con margen lateral de 16px y posición centrada vertical.

---

## 8. Accesibilidad — requisitos de diseño

- El modal debe tener un elemento de título visible (el h2 o h3 del header) que actúe como `aria-labelledby`.
- El focus inicial al abrir el modal: primer elemento interactivo del paso activo.
- ESC cierra el modal.
- La lista de motivos (Paso 1) debe ser navegable por teclado con flechas.
- El estado seleccionado de cada opción debe ser comunicable a lectores de pantalla (`aria-selected` o equivalente).
- Los botones deshabilitados (`disabled`) deben comunicar su estado.

---

## 9. Templates de email

Los tres templates de email del sistema de reportes del frontend público deben seguir el layout `renderEmailLayout()` ya establecido para toda la plataforma. Todos los tokens visuales (colores, tipografía, espaciado) se extraen de `docs/project/colors_and_type.css`.

---

### TPL-011 — Confirmación al usuario que reporta (EVT-016)

**Asunto:** `Hemos recibido tu reporte — Regálalo`

**Estructura del email:**

- Saludo personalizado: `Hola, {{firstName}}.`
- Párrafo principal:
  ```
  Hemos recibido tu reporte sobre [un objeto / un usuario] que indicaste
  como "[etiqueta legible del motivo]". Lo revisaremos lo antes posible.
  ```
  Nota: `[un objeto / un usuario]` se resuelve desde `reportedEntityType`; `[etiqueta legible del motivo]` es el label visible (no el valor del enum).
- Párrafo secundario:
  ```
  Cuando hayamos tomado una decisión, te lo haremos saber.
  Gracias por contribuir a mantener Regálalo como un espacio de confianza.
  ```
- Sin CTA ni botón. Sin enlace a la plataforma como acción principal.
- Footer estándar de la plataforma.

**Tono:** tranquilo, breve, de confirmación. No dramático. No prometedor de plazos.

---

### TPL-012 — Resolución al usuario que reporta (EVT-017)

**Asunto:** `Hemos revisado tu reporte — Regálalo`

**Estructura del email:**

- Saludo personalizado: `Hola, {{firstName}}.`
- Párrafo principal:
  ```
  Hemos revisado el reporte que enviaste sobre [un objeto / un usuario]
  y hemos tomado las medidas que consideramos oportunas.
  ```
- Párrafo secundario:
  ```
  Gracias por ayudarnos a cuidar la comunidad.
  ```
- Sin CTA. Sin revelar la acción tomada ni datos del denunciado.
- Footer estándar.

**Tono:** conclusivo, neutro, breve.

---

### TPL-013 — Aviso al usuario reportado (EVT-018)

**Asunto:** `Aviso sobre tu actividad en Regálalo`

**Estructura del email:**

- Saludo personalizado: `Hola, {{firstName}}.`
- Párrafo principal:
  ```
  Tras revisar tu actividad reciente en Regálalo, hemos detectado
  que algún contenido o comportamiento no se ajusta a las normas
  de nuestra comunidad.
  ```
- Párrafo secundario:
  ```
  Te pedimos que revises nuestras normas de uso. Si tienes alguna
  duda sobre esta comunicación, puedes contactarnos en [email de soporte].
  ```
- CTA opcional: botón `Ver normas de la comunidad` → enlace a la política de uso.
- Footer estándar.

**Tono:** firme pero no punitivo. Sin mención al reporte, al denunciante ni al contenido específico.

---

## 10. Checklist de entrega para el agente de diseño

El agente debe entregar los siguientes artefactos:

- [ ] Diseño del trigger en tarjeta de objeto (estado normal del menú + opción de reporte visible).
- [ ] Diseño del trigger en detalle de objeto (zona inferior de la ficha).
- [ ] Diseño del trigger en perfil público (zona inferior del perfil).
- [ ] Modal Paso 1 — estado inicial (ningún motivo seleccionado).
- [ ] Modal Paso 1 — estado con motivo seleccionado.
- [ ] Modal Paso 2 — estado vacío (sin descripción).
- [ ] Modal Paso 2 — estado con texto en el textarea + contador de caracteres.
- [ ] Modal Paso 2 — estado SUBMITTING (spinner, controles deshabilitados).
- [ ] Modal Paso 2 — estado de error (con ejemplo de mensaje de error).
- [ ] Modal Paso 3 — confirmación.
- [ ] Versión mobile del modal (bottom sheet o modal full-width).
- [ ] Template email TPL-011 (confirmación al denunciante).
- [ ] Template email TPL-012 (resolución al denunciante).
- [ ] Template email TPL-013 (advertencia al denunciado).
