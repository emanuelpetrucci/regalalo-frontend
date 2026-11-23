# Regálalo — Frontend (Angular)

Aplicación Angular 21 del marketplace. El diseño UI obligatorio está en [`docs/README.md`](docs/README.md) y `docs/project/`.

## Cliente API (backend)

Las llamadas REST usan servicios generados desde el OpenAPI del backend (`ng-openapi-gen`).

```bash
# Regenerar tras cambios en ../backend/openapi/openapi.json
npm run api:generate
```

Documentación completa: **[`docs/api-client.md`](docs/api-client.md)** (servicios, modelos, JWT, entornos, flujo con el backend).

| Entorno | `apiUrl` por defecto |
|---|---|
| Desarrollo | `http://localhost:3000/api` |
| Producción | Configurar en `src/environments/environment.ts` |

Backend en local: Swagger en http://localhost:3000/api/docs.

### reCAPTCHA (registro)

En desarrollo se usa la [clave de prueba de Google](https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha-what-should-i-do) en `src/environments/environment.development.ts` (`recaptchaSiteKey`). El secret correspondiente debe estar en el backend. Para producción, sustituye la site key en `src/environments/environment.ts`.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
