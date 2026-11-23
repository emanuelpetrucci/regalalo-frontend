import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SITE_BASE_URL } from './site-base-url.token';

export function resolveSiteBaseUrl(): string {
  const fromEnv = inject(SITE_BASE_URL, { optional: true });
  const base = (fromEnv ?? environment.siteUrl).replace(/\/$/, '');
  return base;
}

export function absoluteSiteUrl(path: string, base: string): string {
  const normalized = base.replace(/\/$/, '');
  return path === '/' ? `${normalized}/` : `${normalized}${path}`;
}
