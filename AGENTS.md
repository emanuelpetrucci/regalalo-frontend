
## Gitflow — obligatorio (branching y versionado)

Reglas en [`../GITFLOW.md`](../GITFLOW.md) — leer antes de cualquier desarrollo.

## API backend — obligatorio (antes de llamadas HTTP)

- Contrato y regeneración: [`docs/api-client.md`](docs/api-client.md).
- Usar servicios en `src/app/core/api/generated/` (`AuthService`, `ItemsService`, `UsersService`, `DeliveryService`). **No editar** ese directorio.
- Tras cambios en el backend: `npm run api:generate` (requiere `../backend/openapi/openapi.json` actualizado).
- `environment.apiUrl` debe terminar en `/api` (p. ej. `http://localhost:3000/api`).

## Diseño — obligatorio (leer antes de cualquier UI)

Toda interfaz debe basarse **exclusivamente** en `docs/README.md` y `docs/project/` (HTML + `colors_and_type.css`). Prohibido inventar diseño, paleta, tipografías o componentes fuera de esos ficheros. Portar pixel-perfect a Angular; ver `_bmad-output/project-context.md`.

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
