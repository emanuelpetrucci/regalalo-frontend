# Delta — technical-design-frontend.md
**Referencia:** DLT-004
**Versión base:** 1.3
**Versión resultante:** 1.4
**Estado:** Aprobado — 2026-05-26 (Correct Course `sprint-change-proposal-2026-05-26-DLT-004.md`)
**Fecha:** Mayo 2026
**Motivo:** Incorporación de la capa de analítica e instrumentación — PRD Analítica v1.0

---

## Resumen de cambios

| Área | Sección afectada | Tipo de cambio |
|---|---|---|
| A | §4 Contratos de API — POST /items | Dos campos nuevos en payload: `category`, `weightRange` |
| A | §4 Contratos de API — GET /items | Dos campos nuevos en respuesta: `category`, `weightRange` |
| A | §4 Contratos de API — GET /items/:id | Dos campos nuevos en respuesta: `category`, `weightRange` |
| A | §5 Modelos TypeScript del Dominio | Campos `category` y `weightRange` añadidos a `Item` e `ItemSummary` |
| B | §6 Reglas de Presentación | Reglas de renderizado del selector `category` y `weightRange` en formulario de publicación |

---

## A — Sección 4 — Contratos de API

### Cambio 1 — POST /items (payload)

Añadir campos `category` y `weightRange` al payload de publicación de objeto.

**Payload de entrada actualizado (multipart/form-data):**

```
title:        string
description:  string
condition:    string
category:     string
weightRange:  string
postalCode:   string
images:       File[] (máx. 5, ya comprimidas en cliente)
```

**Valores válidos para `category`:**

| Valor | Etiqueta visible en UI |
|---|---|
| `furniture` | Muebles |
| `electronics` | Electrónica |
| `clothing` | Ropa y calzado |
| `books` | Libros y material educativo |
| `toys` | Juguetes |
| `kitchen` | Cocina y hogar |
| `sports` | Deporte y ocio |
| `tools` | Herramientas |
| `other` | Otro |

**Valores válidos para `weightRange`:**

| Valor | Etiqueta visible en UI |
|---|---|
| `lt1` | Menos de 1 kg |
| `1to5` | Entre 1 y 5 kg |
| `5to20` | Entre 5 y 20 kg |
| `gt20` | Más de 20 kg |

**Errores:** sin cambios respecto a v1.3.

---

### Cambio 2 — GET /items (respuesta)

Añadir campos `category` y `weightRange` en cada objeto del array `items`.

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
      "requestsPaused": "boolean",
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

---

### Cambio 3 — GET /items/:id (respuesta)

Añadir campos `category` y `weightRange` en la respuesta de detalle.

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

---

### Cambio 4 — GET /users/me/items (respuesta)

Añadir campos `category` y `weightRange` en cada objeto del array `items`.

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

---

## A — Sección 5 — Modelos TypeScript del Dominio

### Cambio 1 — Interfaz `Item` actualizada

Añadir campos `category` y `weightRange`.

```typescript
export interface Item {
  id: string;
  title: string;
  description: string;
  condition: string;
  category: string;           // nuevo
  weightRange: string;        // nuevo
  status: 'active' | 'reserved' | 'completed' | 'cancelled';
  requestsPaused: boolean;
  degradedAt: string | null;
  distanceMeters: number;
  images: string[];
  createdAt: string;
}
```

### Cambio 2 — Interfaz `ItemSummary` actualizada

Añadir campos `category` y `weightRange`.

```typescript
export interface ItemSummary {
  id: string;
  title: string;
  condition: string;
  category: string;           // nuevo
  weightRange: string;        // nuevo
  status: 'active' | 'reserved' | 'completed' | 'cancelled';
  requestsPaused: boolean;
  degradedAt: string | null;
  images: string[];
  createdAt: string;
  completedAt: string | null;
}
```

### Cambio 3 — Tipos literales de apoyo (opcional, recomendado)

Para mayor seguridad de tipos en el formulario de publicación y en los componentes que consumen estos campos:

```typescript
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
```

> Si se adoptan estos tipos literales, los campos `category` y `weightRange` en `Item` e `ItemSummary` deben tiparse como `ItemCategory` y `ItemWeightRange` respectivamente en lugar de `string`.

---

## B — Sección 6 — Reglas de Presentación

### Regla 1 — Formulario de publicación de objeto

Los campos `category` y `weightRange` son **obligatorios** en el formulario de publicación (`POST /items`). Se implementan como selectores desplegables con las etiquetas visibles definidas en el Cambio 1 de §4.

**Posición en el formulario:**

| Campo | Posición |
|---|---|
| `title` | 1 |
| `description` | 2 |
| `condition` | 3 |
| `category` | 4 — inmediatamente tras `condition` |
| `weightRange` | 5 — inmediatamente tras `category` |
| `postalCode` | 6 |
| `images` | 7 |

**Validación en cliente:**
- Ambos campos son requeridos — el botón de envío no se habilita si alguno está vacío.
- Los valores enviados al backend son los valores internos del selector (`furniture`, `lt1`, etc.), nunca las etiquetas visibles.

### Regla 2 — Visualización de `category` en detalle de objeto

El campo `category` se muestra en la vista de detalle del objeto (`GET /items/:id`) con su etiqueta visible correspondiente. El mapeado de valor interno a etiqueta se realiza en cliente mediante la tabla de referencia definida en §4 Cambio 1.

### Regla 3 — Visualización de `weightRange`

El campo `weightRange` **no se muestra al usuario final** en ninguna vista de detalle ni listado. Es un campo de captura de datos para analítica y ESG. Su valor se envía al backend y se almacena, pero no se renderiza en la interfaz.

### Regla 4 — `category` en listado de objetos propios

En `GET /users/me/items`, el campo `category` puede mostrarse como etiqueta informativa en cada tarjeta de objeto del donante, en la vista de gestión de objetos propios. No es obligatorio en MVP — queda a criterio de implementación del componente.
