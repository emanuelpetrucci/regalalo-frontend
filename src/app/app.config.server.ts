import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { environment } from '../environments/environment';
import { appConfig } from './app.config';
import { BACKEND_API_URL } from './core/api/backend-api-url.token';
import { SITE_BASE_URL } from './core/seo/site-base-url.token';
import { serverRoutes } from './app.routes.server';

function resolveServerSiteBaseUrl(): string {
  const fromProcess = process.env['SITE_URL']?.trim();
  const base = (fromProcess || environment.siteUrl).replace(/\/$/, '');
  return base;
}

function resolveBackendApiUrl(): string {
  const fromEnv = process.env['API_URL']?.trim();
  return (fromEnv || 'https://api-production.regalalo.org/api').replace(/\/$/, '');
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: SITE_BASE_URL, useFactory: resolveServerSiteBaseUrl },
    { provide: BACKEND_API_URL, useFactory: resolveBackendApiUrl },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
