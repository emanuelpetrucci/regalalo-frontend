---
ticket: spec-show-location-name-with-distance
status: done
type: feature
migrated_from: v6
---


<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** El backend ha añadido `locationName: string | null` a `ItemSummaryDto` y `GetItemResponseDto`, y los prototipos de diseño muestran el patrón `{km} km · {barrio}` en todas las superficies que hoy muestran distancia. El frontend no muestra el barrio en ningún sitio; además, dos DTOs del backend (`RankedCandidateDto`, `DeliverySessionOtherPartyDto`) aún no tienen el campo.

**Approach:** Completar los DTOs de backend que faltan, regenerar el cliente OpenAPI, extender `ItemDistanceChipComponent` con un input `locationName` opcional, y propagar el valor por `item-feed-card`, `item-detail-panel`, `candidate-row`, `entrega-detalle` y `mis-objetos`. En `entrega-detalle` también se elimina el sufijo "de distancia" que el diseño no incluye.

## Boundaries & Constraints

**Always:**
- Patrón condicional: mostrar ` · {locationName}` solo cuando el valor es no nulo y no vacío — excepto `entrega-detalle`, donde siempre aparece ` · {locationName || '—'}`.
- `locationName` en `ItemDistanceChipComponent` es opcional con default `null`; ningún consumidor existente debe romperse.
- No editar manualmente los archivos de `src/app/core/api/generated/` — regenerar con `npm run api:generate`.
- Mantener `ChangeDetectionStrategy.OnPush` y derivar `locationName` con `computed()` en cada componente.

**Ask First:**
- Si al regenerar el cliente OpenAPI aparecen breaking changes inesperados en modelos distintos a los mencionados en este spec.

**Never:**
- Crear un nuevo componente o pipe para el patrón `km · barrio`; extender el existente `ItemDistanceChipComponent`.
- Añadir lógica de formateo al template; toda conversión de metros va por `formatDistanceKm()`.
- Modificar la clave i18n `items.explore.distance_km` ni ningún archivo de traducción.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output | Error Handling |
|----------|--------------|-----------------|----------------|
| locationName presente | `distanceMeters=1200`, `locationName='Sant Gervasi'` | `1.2 km · Sant Gervasi` | — |
| locationName null | `distanceMeters=800`, `locationName=null` | `0.8 km` | — |
| Entrega, locationName null | `distanceMeters=1800`, `locationName=null` (otherParty) | `1.8 km · —` | — |
| Feed card sin distancia | `distanceMeters=null` | chip no se renderiza (comportamiento existente) | — |

</frozen-after-approval>

## Code Map

- `../backend/src/application/dtos/get-ranked-candidates.dto.ts` -- añadir `locationName: string | null` a `RankedCandidateDto`
- `../backend/src/application/dtos/get-delivery-session.dto.ts` -- añadir `locationName: string | null` a `DeliverySessionOtherPartyDto`
- `src/app/core/api/generated/` -- modelos generados; no editar, regenerar
- `src/app/shared/components/item-distance-chip/item-distance-chip.component.ts` -- chip de distancia; añadir input `locationName`
- `src/app/shared/components/item-feed-card/item-feed-card.component.ts` -- tarjeta del feed; propagar `locationName` de `ItemSummary`
- `src/app/shared/components/item-feed-card/item-feed-card.component.html` -- pasar `[locationName]` al chip
- `src/app/shared/components/item-detail-panel/item-detail-panel.component.ts` -- panel de detalle; derivar `locationName` de `GetItemResponse`
- `src/app/shared/components/item-detail-panel/item-detail-panel.component.html` -- línea 73 (meta row inline) y línea 310 (chip grande)
- `src/app/shared/components/candidate-row/candidate-row.component.ts` -- fila de candidato; derivar `locationName` de `RankedCandidate`
- `src/app/shared/components/candidate-row/candidate-row.component.html` -- línea 30: añadir `· locationName` tras el km
- `src/app/features/delivery/entrega-detalle/entrega-detalle.component.ts` -- derivar `otherLocationName` de `DeliverySession.otherParty`
- `src/app/features/delivery/entrega-detalle/entrega-detalle.component.html` -- líneas 217 y 241: reemplazar key `distance_away` por km directo + `· locationName`
- `src/app/features/items/mis-objetos/mis-objetos.component.ts` -- derivar `reservedOtherLocationName` de `deliverySession().otherParty`
- `src/app/features/items/mis-objetos/mis-objetos.component.html` -- línea 385: añadir `· locationName` condicional

## Tasks & Acceptance

**Execution:**
- [x] `../backend/src/application/dtos/get-ranked-candidates.dto.ts` -- añadir `locationName: string | null` a `RankedCandidateDto` -- prerrequisito para candidate-row y mis-objetos
- [x] `../backend/src/application/dtos/get-delivery-session.dto.ts` -- añadir `locationName: string | null` a `DeliverySessionOtherPartyDto` -- prerrequisito para entrega-detalle y mis-objetos
- [x] Backend: ejecutar `npm run openapi:generate` en el directorio del backend -- sincronizar `openapi/openapi.json` con los DTOs actualizados
- [x] Frontend: ejecutar `npm run api:generate` -- regenerar los modelos TS bajo `src/app/core/api/generated/`
- [x] `src/app/shared/components/item-distance-chip/item-distance-chip.component.ts` -- añadir `readonly locationName = input<string | null>(null)` y renderizar `@if (locationName()) { · {{ locationName() }} }` tras el km en el template inline
- [x] `src/app/shared/components/item-feed-card/item-feed-card.component.ts` -- añadir `readonly locationName = computed(() => this.item().locationName ?? null)` -- derivar del modelo regenerado
- [x] `src/app/shared/components/item-feed-card/item-feed-card.component.html` -- añadir `[locationName]="locationName()"` al `<app-item-distance-chip>`
- [x] `src/app/shared/components/item-detail-panel/item-detail-panel.component.ts` -- añadir `readonly locationName = computed(() => this.item()?.locationName ?? null)`
- [x] `src/app/shared/components/item-detail-panel/item-detail-panel.component.html` -- (a) línea 73: añadir `@if (locationName()) { · {{ locationName() }} }` tras el binding de distancia; (b) línea 310: añadir `[locationName]="locationName()"` al chip
- [x] `src/app/shared/components/candidate-row/candidate-row.component.ts` -- añadir `readonly locationName = computed(() => this.candidate().locationName ?? null)`
- [x] `src/app/shared/components/candidate-row/candidate-row.component.html` -- añadir `@if (locationName()) { · {{ locationName() }} }` tras el `<span>` de km en línea 30
- [x] `src/app/features/delivery/entrega-detalle/entrega-detalle.component.ts` -- añadir `readonly otherLocationName = computed(() => this.session()?.otherParty?.locationName ?? null)`
- [x] `src/app/features/delivery/entrega-detalle/entrega-detalle.component.html` -- reemplazar `t('delivery.detail.distance_away', { km: otherDistanceKm() })` por `{{ t('items.explore.distance_km', { km: otherDistanceKm() }) }} · {{ otherLocationName() || '—' }}` en líneas 217 y 241
- [x] `src/app/features/items/mis-objetos/mis-objetos.component.ts` -- añadir `readonly reservedOtherLocationName = computed(() => this.deliverySession()?.otherParty?.locationName ?? null)`
- [x] `src/app/features/items/mis-objetos/mis-objetos.component.html` -- añadir `@if (reservedOtherLocationName()) { · {{ reservedOtherLocationName() }} }` tras el binding de km en línea 385

**Acceptance Criteria:**
- Dado un item con `locationName='Sant Gervasi'`, cuando se muestra en el feed, la tarjeta renderiza `1.2 km · Sant Gervasi`.
- Dado un item con `locationName=null`, cuando se muestra el chip de distancia, aparece solo `X km` sin separador ni barrio.
- Dado el panel de detalle de un item con `locationName`, tanto el meta row (inline) como el chip grande muestran `{km} km · {barrio}`.
- Dado un candidato con `locationName='Eixample'`, la fila de candidato muestra `X km · Eixample`.
- Dado una entrega con `locationName=null` en `otherParty`, `entrega-detalle` muestra `X km · —`.
- Dado una entrega con `locationName='Poblenou'`, `entrega-detalle` muestra `X km · Poblenou` (sin "de distancia").
- `ItemDistanceChipComponent` sin `[locationName]` sigue renderizando solo `X km` (sin regresiones en consumidores existentes).

## Spec Change Log

## Design Notes

La pantalla de Entregas es el único caso donde el separador ` · ` es siempre visible (con `'—'` como fallback), porque el diseño tiene espacio fijo para ese dato y siempre muestra algo. Las demás pantallas ocultan el separador cuando `locationName` es nulo.

El cambio en `entrega-detalle` elimina el sufijo `de distancia` (clave `delivery.detail.distance_away`) y lo reemplaza por el patrón `km · barrio`, alineándose con los prototipos. La clave obsoleta queda huérfana pero no se borra en este spec para no ampliar el scope.

## Verification

**Commands:**
- `ng build --configuration=production` -- expected: sin errores de compilación ni de tipos
- `ng lint` -- expected: sin errores de lint

## Suggested Review Order

**Componente compartido — punto de entrada**

- Input opcional `locationName` con default `null`; ningún consumidor existente se rompe
  [`item-distance-chip.component.ts:34`](../../src/app/shared/components/item-distance-chip/item-distance-chip.component.ts#L34)

- `@if (locationName(); as name)` evalúa el signal una sola vez y suprime el separador si es nulo
  [`item-distance-chip.component.ts:26`](../../src/app/shared/components/item-distance-chip/item-distance-chip.component.ts#L26)

**Contrato de backend — DTOs y schemas Zod**

- `RankedCandidateDto` ahora expone `locationName`; prerrequisito para candidatos y mis-objetos
  [`get-ranked-candidates.dto.ts:8`](../../../backend/src/application/dtos/get-ranked-candidates.dto.ts#L8)

- `DeliverySessionOtherPartyDto` añade `locationName`; prerrequisito para entregas
  [`get-delivery-session.dto.ts:24`](../../../backend/src/application/dtos/get-delivery-session.dto.ts#L24)

- Zod schema `ItemSummary` actualizado; impulsa la regeneración del OpenAPI
  [`item.schemas.ts:40`](../../../backend/src/openapi/schemas/item.schemas.ts#L40)

- Zod schema `DeliverySessionOtherParty` con el mismo campo
  [`delivery.schemas.ts:29`](../../../backend/src/openapi/schemas/delivery.schemas.ts#L29)

**Superficies de item — feed y detalle**

- `computed()` que extrae `locationName` de `ItemSummary`; pasado al chip
  [`item-feed-card.component.ts:72`](../../src/app/shared/components/item-feed-card/item-feed-card.component.ts#L72)

- Binding `[locationName]` en el chip del feed card
  [`item-feed-card.component.html:137`](../../src/app/shared/components/item-feed-card/item-feed-card.component.html#L137)

- Meta row inline del panel de detalle (texto, no chip); muestra el barrio tras el km
  [`item-detail-panel.component.html:73`](../../src/app/shared/components/item-detail-panel/item-detail-panel.component.html#L73)

- Chip grande del panel de detalle; recibe `[locationName]`
  [`item-detail-panel.component.html:310`](../../src/app/shared/components/item-detail-panel/item-detail-panel.component.html#L310)

**Candidatos**

- `computed()` de `locationName` del `RankedCandidate`
  [`candidate-row.component.ts:53`](../../src/app/shared/components/candidate-row/candidate-row.component.ts#L53)

- Muestra `· barrio` condicionalmente junto al km y la fecha
  [`candidate-row.component.html:30`](../../src/app/shared/components/candidate-row/candidate-row.component.html#L30)

**Pantallas de entrega — patrón diferente (`· '—'` siempre visible)**

- `otherLocationName` derivado del `otherParty` de la sesión de entrega
  [`entrega-detalle.component.ts:153`](../../src/app/features/delivery/entrega-detalle/entrega-detalle.component.ts#L153)

- Único lugar sin `@if`: siempre muestra `· {barrio || '—'}`; i18n `distance_away` eliminado
  [`entrega-detalle.component.html:216`](../../src/app/features/delivery/entrega-detalle/entrega-detalle.component.html#L216)

- Mis objetos reservados — `locationName` del `otherParty` en la sesión activa
  [`mis-objetos.component.ts:199`](../../src/app/features/items/mis-objetos/mis-objetos.component.ts#L199)

- Muestra `· barrio` condicionalmente en la tarjeta de objeto reservado
  [`mis-objetos.component.html:385`](../../src/app/features/items/mis-objetos/mis-objetos.component.html#L385)

**Tipos generados (periféricos)**

- Los 4 modelos regenerados via `npm run api:generate`; no editar manualmente
  [`item-summary.ts:12`](../../src/app/core/api/generated/models/item-summary.ts#L12)
